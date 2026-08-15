/* ============================================================
 * Warung Network — 主逻辑
 * 依赖：Leaflet 1.9.x（CDN）+ assets/js/data.js（window.WARUNG_DATA）
 * 兼容 file:// 直开：不使用 ES Module / fetch 本地文件
 * ============================================================ */
(function () {
  'use strict';

  var DATA = window.WARUNG_DATA;
  if (!DATA) { console.error('data.js 未加载'); return; }

  var STATUS = DATA.status;
  var UNIS = DATA.universities;
  var WARUNGS = DATA.warungs;

  /* ================= 0. 工具 ================= */

  // HTML 转义：所有来自数据文件的字段在拼入 innerHTML / bindPopup 前必须过此函数，
  // 堵住未来替换为后端真实数据时的 XSS 入口。
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

  /* ================= 1. Leaflet 地图 ================= */

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

  var uniMarkers = [];    // { id, marker }
  var warungMarkers = []; // { id, universityId, status, marker }

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

    var nearby = WARUNGS.filter(function (w) { return w.universityId === u.id; });
    var statHtml = Object.keys(STATUS).map(function (key) {
      var n = nearby.filter(function (w) { return w.status === key; }).length;
      return n > 0 ? escapeHtml(STATUS[key].label) + ' <strong>' + n + '</strong>' : null;
    }).filter(Boolean).join(' · ');

    m.bindPopup(
      '<div class="popup-title">' + escapeHtml(u.nameZh) + '</div>' +
      '<div class="popup-sub">' + escapeHtml(u.nameId) + ' · ' + escapeHtml(u.area) + '</div>' +
      '<div class="popup-stat">' + escapeHtml(u.intro) + '</div>' +
      '<div class="popup-stat" style="margin-top:6px">周边点位 ' + nearby.length + ' 家：' + (statHtml || '暂无') + '</div>'
    );
    uniMarkers.push({ id: u.id, marker: m });
  });

  /* --- Warung 小圆点 marker（divIcon，按漏斗状态着色） --- */
  WARUNGS.forEach(function (w) {
    var st = STATUS[w.status];
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
    m.bindPopup(
      '<div class="popup-title">' + escapeHtml(w.name) + '</div>' +
      '<div class="popup-sub">' + (u ? escapeHtml(u.nameZh) : '') + ' 周边</div>' +
      '<div class="popup-tags">' + cats + '</div><br>' +
      '<span class="popup-status" style="background:' + escapeHtml(st.color) + '">' + escapeHtml(st.label) + '</span>'
    );
    warungMarkers.push({ id: w.id, universityId: w.universityId, status: w.status, marker: m });
  });

  /* ================= 2. 漏斗统计条（从数据自动计算） ================= */

  var funnelEl = document.getElementById('funnelBar');
  var funnelHtml = '';
  Object.keys(STATUS).forEach(function (key, i, arr) {
    var n = WARUNGS.filter(function (w) { return w.status === key; }).length;
    funnelHtml +=
      '<div class="funnel__stage">' +
        '<span class="funnel__dot" style="background:' + escapeHtml(STATUS[key].color) + '"></span>' +
        '<div><div class="funnel__num">' + n + '</div>' +
        '<div class="funnel__label">' + escapeHtml(STATUS[key].label) + '</div></div>' +
      '</div>';
    if (i < arr.length - 1) funnelHtml += '<div class="funnel__arrow">→</div>';
  });
  funnelEl.innerHTML = funnelHtml;

  /* ================= 3. 图例 ================= */

  var legendEl = document.getElementById('mapLegend');
  var legendHtml = '<div class="map-legend__title">图例</div>' +
    '<div class="map-legend__item"><span class="map-legend__swatch map-legend__swatch--uni" style="background:var(--terracotta)"></span>大学（点击飞到校区）</div>';
  Object.keys(STATUS).forEach(function (key) {
    var pulse = key === 'active' ? ' map-legend__swatch--pulse' : '';
    legendHtml += '<div class="map-legend__item"><span class="map-legend__swatch' + pulse +
      '" style="background:' + escapeHtml(STATUS[key].color) + '"></span>' + escapeHtml(STATUS[key].label) + '</div>';
  });
  legendEl.innerHTML = legendHtml;

  /* ================= 4. 筛选 ================= */

  var currentUni = '';    // 当前选中的大学 id（'' = 全部）
  var currentStatus = ''; // 当前选中的状态 key（'' = 全部）

  /* --- 大学下拉 --- */
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
      var badge = el.querySelector('.uni-marker');
      if (badge) badge.classList.toggle('dimmed', !!currentUni && um.id !== currentUni);
    });
  }

  /* ================= 5. 数字滚动动画 ================= */

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

  /* ================= 6. 档期坑位渲染 ================= */

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

  /* ================= 7. 移动端导航 + 滚动高亮 ================= */

  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') navLinks.classList.remove('open');
  });

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

  /* ================= 8. 小屏地图 invalidateSize 保险 ================= */
  window.addEventListener('resize', function () { map.invalidateSize(); });
})();
