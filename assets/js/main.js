/* ============================================================
 * Warung Network — 主逻辑
 * 依赖：Leaflet 1.9.x（CDN）+ assets/js/data.js（window.WARUNG_DATA）
 *      + assets/js/sheet-loader.js（window.SheetLoader，可选）
 * 兼容 file:// 直开：不使用 ES Module / fetch 本地文件
 *
 * 启动策略（二次审计修复，避免 Sheet 启用后整页阻塞）：
 *   1. 非地图 UI（导航/数字动画/档期/滚动高亮）立即初始化；
 *   2. 地图【先用演示数据立即渲染】（角标显示 Demo 标注），页面秒开；
 *   3. SheetLoader.load() 异步返回真实数据后，热替换 marker/漏斗/大学 popup
 *      并翻转角标为「🟢 实时数据」；返回 null 则保持演示数据不变。
 * ============================================================ */
(function () {
  'use strict';

  var DATA = window.WARUNG_DATA;
  if (!DATA) { console.error('data.js 未加载'); return; }

  var STATUS = DATA.status;
  var UNIS = DATA.universities;

  /* ================= 0. 工具 ================= */

  // HTML 转义：所有来自数据文件/表格的字段在拼入 innerHTML / bindPopup 前必须过此函数，
  // 堵住后端/表格数据的 XSS 入口。
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 移动端（窄屏）放大 Warung 圆点，方便触屏点击
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
  var DOT_SIZE = isMobile ? 20 : 14;

  /* ================= 启动序列 ================= */

  // 1) 与地图数据无关的 UI：立即初始化（脚本位于 body 末尾，DOM 已就绪）
  initPageUI();

  // 2) 地图：先用演示数据立即渲染，页面秒开
  var mapCtl = initMap(DATA.warungs);

  // 3) 异步拉取真实数据：成功则热替换；null/未启用则保持演示数据
  if (window.SheetLoader) {
    window.SheetLoader.load().then(function (liveWarungs) {
      if (liveWarungs) mapCtl.swapData(liveWarungs);
    });
  }

  /* ============================================================
   * A. 非地图 UI（不依赖 warungs 数据，绝不等待网络）
   * ============================================================ */
  function initPageUI() {

    /* --- 数字滚动动画 --- */
    var counters = document.querySelectorAll('.count-up');
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        counterObserver.unobserve(el);
        var target = parseFloat(el.dataset.target);
        var decimals = parseInt(el.dataset.decimals || '0', 10);
        var duration = 1400;
        var start = performance.now();
        function tick(now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          var val = target * eased;
          el.textContent = decimals > 0
            ? val.toFixed(decimals)
            : Math.round(val).toLocaleString('zh-CN');
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = decimals > 0
            ? target.toFixed(decimals)
            : target.toLocaleString('zh-CN');
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { counterObserver.observe(c); });

    /* --- 档期坑位渲染 --- */
    document.querySelectorAll('.slot-grid').forEach(function (grid) {
      var occupied = parseInt(grid.dataset.occupied || '0', 10);
      var total = parseInt(grid.dataset.total || '8', 10);
      for (var i = 1; i <= total; i++) {
        var cell = document.createElement('div');
        var taken = i <= occupied;
        cell.className = 'slot-cell ' + (taken ? 'slot-cell--taken' : 'slot-cell--open');
        cell.textContent = taken ? '满' : i;
        cell.title = taken ? '已被锁定' : '可锁定坑位';
        grid.appendChild(cell);
      }
    });

    /* --- 移动端导航 --- */
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') navLinks.classList.remove('open');
    });

    /* --- 锚点滚动高亮（配合 html{scroll-behavior:smooth} 平滑滚动） --- */
    var sections = ['market', 'map', 'products', 'schedule', 'process', 'contact'];
    var navAnchors = navLinks.querySelectorAll('a');
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  /* ============================================================
   * B. 地图模块：先用演示数据渲染；swapData() 热替换为真实数据
   * ============================================================ */
  function initMap(initialWarungs) {

    // 当前渲染用数据（演示 → 可被 swapData 替换为真实）
    var warungs = initialWarungs;

    // 默认视野：大雅加达（中心约 -6.26, 106.81，zoom 11）
    var map = L.map('leafletMap', {
      center: [-6.26, 106.81],
      zoom: 11,
      scrollWheelZoom: true
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var uniById = {};
    UNIS.forEach(function (u) { uniById[u.id] = u; });

    var uniMarkers = [];    // { id, marker }（大学是静态清单，只建一次）
    var warungMarkers = []; // { id, universityId, status, marker }（随数据替换重建）

    /* --- 数据来源角标 --- */
    var badge = document.getElementById('mapDataBadge');
    function setBadgeLive() {
      if (!badge) return;
      var now = new Date();
      var hh = ('0' + now.getHours()).slice(-2);
      var mm = ('0' + now.getMinutes()).slice(-2);
      badge.textContent = '🟢 实时数据 · 更新于 ' + hh + ':' + mm;
      badge.classList.add('map-demo-note--live');
    }

    /* --- 大学 popup 内容（依赖当前 warungs，数据替换时需重算） --- */
    function buildUniPopup(u) {
      var nearby = warungs.filter(function (w) { return w.universityId === u.id; });
      var statHtml = Object.keys(STATUS).map(function (key) {
        var n = nearby.filter(function (w) { return w.status === key; }).length;
        return n > 0 ? escapeHtml(STATUS[key].label) + ' <strong>' + n + '</strong>' : null;
      }).filter(Boolean).join(' · ');
      return '<div class="popup-title">' + escapeHtml(u.nameZh) + '</div>' +
        '<div class="popup-sub">' + escapeHtml(u.nameId) + ' · ' + escapeHtml(u.area) + '</div>' +
        '<div class="popup-stat">' + escapeHtml(u.intro) + '</div>' +
        '<div class="popup-stat" style="margin-top:6px">周边点位 ' + nearby.length + ' 家：' + (statHtml || '暂无') + '</div>';
    }

    /* --- 大学徽章 marker（divIcon 大圆形徽章） --- */
    UNIS.forEach(function (u) {
      var short = escapeHtml(u.id.toUpperCase().slice(0, 3));
      var icon = L.divIcon({
        className: '',
        html: '<div class="uni-marker" data-uni="' + escapeHtml(u.id) + '" style="background:' + escapeHtml(u.color) + '">' + short + '</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });
      var m = L.marker([u.lat, u.lng], { icon: icon, title: u.nameZh }).addTo(map);
      m.bindPopup(buildUniPopup(u));
      uniMarkers.push({ id: u.id, marker: m });
    });

    /* --- Warung 小圆点渲染（先清旧图层，再重建） --- */
    function renderWarungs() {
      warungMarkers.forEach(function (wm) { map.removeLayer(wm.marker); });
      warungMarkers = [];
      warungs.forEach(function (w) {
        var st = STATUS[w.status];
        if (!st) return; // 兜底：未知状态不渲染（loader 已校验，双保险）
        var isActive = w.status === 'active';
        var icon = L.divIcon({
          className: '',
          html: '<div class="warung-dot' + (isActive ? ' warung-dot--active' : '') +
                '" data-id="' + escapeHtml(w.id) + '" style="background:' + escapeHtml(st.color) + '"></div>',
          iconSize: [DOT_SIZE, DOT_SIZE],
          iconAnchor: [DOT_SIZE / 2, DOT_SIZE / 2],
          popupAnchor: [0, -DOT_SIZE / 2 - 1]
        });
        var m = L.marker([w.lat, w.lng], { icon: icon, title: w.name }).addTo(map);
        var u = uniById[w.universityId];
        var cats = w.categories.map(function (c) { return '<span class="popup-tag">' + escapeHtml(c) + '</span>'; }).join('');
        // 真实数据带 weekly_orders 时展示（演示数据无此字段，自动不显示）
        var ordersLine = (typeof w.weeklyOrders === 'number')
          ? '<div class="popup-stat" style="margin-top:4px">近 7 天订单 <strong>' + w.weeklyOrders + '</strong></div>' : '';
        m.bindPopup(
          '<div class="popup-title">' + escapeHtml(w.name) + '</div>' +
          '<div class="popup-sub">' + (u ? escapeHtml(u.nameZh) : '') + ' 周边</div>' +
          '<div class="popup-tags">' + cats + '</div>' + ordersLine + '<br>' +
          '<span class="popup-status" style="background:' + escapeHtml(st.color) + '">' + escapeHtml(st.label) + '</span>'
        );
        warungMarkers.push({ id: w.id, universityId: w.universityId, status: w.status, marker: m });
      });
    }
    renderWarungs();

    /* --- 漏斗统计条（从当前数据自动计算，数据替换时重算） --- */
    var funnelEl = document.getElementById('funnelBar');
    function renderFunnel() {
      var funnelHtml = '';
      Object.keys(STATUS).forEach(function (key, i, arr) {
        var n = warungs.filter(function (w) { return w.status === key; }).length;
        funnelHtml +=
          '<div class="funnel__stage">' +
            '<span class="funnel__dot" style="background:' + escapeHtml(STATUS[key].color) + '"></span>' +
            '<div><div class="funnel__num">' + n + '</div>' +
            '<div class="funnel__label">' + escapeHtml(STATUS[key].label) + '</div></div>' +
          '</div>';
        if (i < arr.length - 1) funnelHtml += '<div class="funnel__arrow">→</div>';
      });
      funnelEl.innerHTML = funnelHtml;
    }
    renderFunnel();

    /* --- 图例（仅依赖状态字典，静态渲染一次） --- */
    var legendEl = document.getElementById('mapLegend');
    var legendHtml = '<div class="map-legend__title">图例</div>' +
      '<div class="map-legend__item"><span class="map-legend__swatch map-legend__swatch--uni" style="background:var(--terracotta)"></span>大学（点击飞到校区）</div>';
    Object.keys(STATUS).forEach(function (key) {
      var pulse = key === 'active' ? ' map-legend__swatch--pulse' : '';
      legendHtml += '<div class="map-legend__item"><span class="map-legend__swatch' + pulse +
        '" style="background:' + escapeHtml(STATUS[key].color) + '"></span>' + escapeHtml(STATUS[key].label) + '</div>';
    });
    legendEl.innerHTML = legendHtml;

    /* ================= 筛选 ================= */

    var currentUni = '';    // 当前选中的大学 id（'' = 全部）
    var currentStatus = ''; // 当前选中的状态 key（'' = 全部）

    /* --- 大学下拉（大学清单静态，只建一次） --- */
    var uniFilter = document.getElementById('uniFilter');
    UNIS.forEach(function (u) {
      var opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = u.nameZh + '（' + u.area + '）';
      uniFilter.appendChild(opt);
    });

    uniFilter.addEventListener('change', function () {
      currentUni = uniFilter.value;
      if (currentUni) {
        var u = uniById[currentUni];
        var selectedId = currentUni;
        // 飞到该校视野 zoom 15
        map.flyTo([u.lat, u.lng], 15, { duration: 1.1 });
        uniMarkers.forEach(function (um) {
          if (um.id === selectedId) {
            setTimeout(function () {
              // 防竞态：飞行动画期间用户已切换筛选，则不再自动弹窗
              if (currentUni === selectedId) um.marker.openPopup();
            }, 1150);
          }
        });
      } else {
        map.flyTo([-6.26, 106.81], 11, { duration: 1.1 });
      }
      applyFilters();
    });

    /* --- 状态 chips --- */
    var chipsEl = document.getElementById('statusChips');
    var allChip = document.createElement('button');
    allChip.className = 'status-chip active';
    allChip.textContent = '全部';
    allChip.style.setProperty('--chip-color', 'var(--brown)');
    allChip.dataset.status = '';
    chipsEl.appendChild(allChip);
    Object.keys(STATUS).forEach(function (key) {
      var chip = document.createElement('button');
      chip.className = 'status-chip';
      chip.textContent = STATUS[key].label;
      chip.style.setProperty('--chip-color', STATUS[key].color);
      chip.dataset.status = key;
      chipsEl.appendChild(chip);
    });

    chipsEl.addEventListener('click', function (e) {
      var chip = e.target.closest('.status-chip');
      if (!chip) return;
      // 重复点击已激活的 chip → 复位为「全部」
      if (chip.classList.contains('active') && chip.dataset.status !== '') {
        chip = allChip;
      }
      chipsEl.querySelectorAll('.status-chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      currentStatus = chip.dataset.status;
      applyFilters();
    });

    /* --- 应用筛选：高亮命中、淡化其余 --- */
    function applyFilters() {
      warungMarkers.forEach(function (wm) {
        var el = wm.marker.getElement();
        if (!el) return;
        var dot = el.querySelector('.warung-dot');
        if (!dot) return;
        var matchUni = !currentUni || wm.universityId === currentUni;
        var matchStatus = !currentStatus || wm.status === currentStatus;
        var hit = matchUni && matchStatus;
        dot.classList.toggle('dimmed', !hit);
        // 选中大学时，高亮其周边 Warung
        dot.classList.toggle('highlighted', !!currentUni && matchUni && matchStatus);
      });
      uniMarkers.forEach(function (um) {
        var el = um.marker.getElement();
        if (!el) return;
        var badge2 = el.querySelector('.uni-marker');
        if (badge2) badge2.classList.toggle('dimmed', !!currentUni && um.id !== currentUni);
      });
    }

    /* --- 重置筛选器（数据替换时调用） --- */
    function resetFilters() {
      currentUni = '';
      currentStatus = '';
      uniFilter.value = '';
      chipsEl.querySelectorAll('.status-chip').forEach(function (c) { c.classList.remove('active'); });
      allChip.classList.add('active');
      applyFilters();
    }

    /* --- 小屏地图 invalidateSize 保险 --- */
    window.addEventListener('resize', function () { map.invalidateSize(); });

    /* ================= 数据热替换（SheetLoader 成功后调用） ================= */
    function swapData(liveWarungs) {
      warungs = liveWarungs;
      renderWarungs();   // 清理旧 marker 图层 + 重建
      renderFunnel();    // 重算漏斗
      // 大学 popup 内含周边点位统计，需随数据更新
      uniMarkers.forEach(function (um) {
        um.marker.setPopupContent(buildUniPopup(uniById[um.id]));
      });
      resetFilters();    // 重置筛选器状态（图例仅依赖状态字典，无需重绘）
      setBadgeLive();    // 翻转角标为「🟢 实时数据 · 更新于 HH:MM」
      console.info('[WarungMap] 已切换为实时数据，共 ' + warungs.length + ' 个点位');
    }

    return { swapData: swapData };
  }
})();
