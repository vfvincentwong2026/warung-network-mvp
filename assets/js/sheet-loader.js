/* ============================================================
 * Warung Network — Google Sheets 数据源加载器
 * 方案文档：docs/方案-GoogleSheets数据源对接.md
 *
 * 用法：
 *   window.SheetLoader.load() → Promise
 *     resolve(warungs[]) — 真实数据（校验通过，至少 1 行）
 *     resolve(null)      — 未启用 / 超时 / 网络错 / 全部校验失败 → 调用方降级演示数据
 *
 * 安全说明：
 *   - 本模块只做「拉取 + 校验 + 结构转换」，不接触 DOM；
 *     数据字段最终渲染前仍由 main.js 的 escapeHtml() 统一转义。
 * ============================================================ */
(function () {
  'use strict';

  var FETCH_TIMEOUT_MS = 8000;

  /* 期望列（与「公开数据」tab QUERY 输出一致，首行为表头需跳过）：
   * id, name, university_id, lat, lng, categories, status, weekly_orders */

  /* ---------- 标准 CSV 解析器（状态机） ----------
   * 正确处理：引号包裹字段、字段内逗号、字段内换行、双引号转义（"" → "）
   * 禁止用 split(',') —— 店名/品类里出现逗号会错位。 */
  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;
    var i = 0;
    // 去掉 BOM
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

    while (i < text.length) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; } // 转义双引号
          inQuotes = false; i++; continue;
        }
        field += ch; i++; continue;
      }
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { row.push(field); field = ''; i++; continue; }
      if (ch === '\r') { i++; continue; } // 兼容 CRLF
      if (ch === '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
        i++; continue;
      }
      field += ch; i++;
    }
    // 收尾最后一个字段/行
    if (field !== '' || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    // 注意：此处不过滤空行 —— 保留原始行序，校验告警的行号才能对上真实表格行
    return rows;
  }

  /* ---------- 逐行校验 + 结构转换 ----------
   * 不合格行跳过 + console.warn，绝不中断、绝不让脏数据炸掉地图。 */
  function validateRows(rows) {
    var unis = (window.WARUNG_DATA && window.WARUNG_DATA.universities) || [];
    var statusWhitelist = (window.WARUNG_DATA && window.WARUNG_DATA.status) || {};
    var uniById = {};
    unis.forEach(function (u) { uniById[u.id] = u; });

    var seenIds = {};
    var out = [];

    rows.forEach(function (r, idx) {
      // parseCSV 不过滤空行，保留原始行序：lineNo 与 Google Sheets 真实行号一致（表头=第 1 行）
      var lineNo = idx + 2;
      // 空白行（尾部多余换行等）静默跳过，不产生告警
      var isBlank = r.every(function (c) { return String(c).trim() === ''; });
      if (isBlank) return;

      var id = String(r[0] || '').trim();
      var name = String(r[1] || '').trim();
      var universityId = String(r[2] || '').trim();
      var lat = parseFloat(String(r[3] || '').trim());
      var lng = parseFloat(String(r[4] || '').trim());
      var categoriesRaw = String(r[5] || '').trim();
      var status = String(r[6] || '').trim();
      // weekly_orders 严格解析：非有限数 / 负数 / 非整数 一律按 null 处理（popup 已兼容 null）
      var woRaw = String(r[7] || '').trim();
      var woNum = woRaw === '' ? NaN : Number(woRaw);
      var weeklyOrders = (isFinite(woNum) && woNum >= 0 && Math.floor(woNum) === woNum) ? woNum : null;

      function reject(reason) {
        console.warn('[SheetLoader] 跳过第 ' + lineNo + ' 行（' + (id || '无 id') + '）：' + reason);
      }

      if (!id) return reject('id 为空');
      if (!name) return reject('店名为空');
      if (seenIds[id]) return reject('id 重复');
      var uni = uniById[universityId];
      if (!uni) return reject('university_id「' + universityId + '」不在大学清单内');
      if (!statusWhitelist[status]) return reject('status「' + status + '」不在白名单（target/contacted/negotiating/signed/active）');
      if (isNaN(lat) || isNaN(lng)) return reject('lat/lng 无法解析为数字');
      // 坐标粗校验：与所属大学坐标 ±0.02° 内
      if (Math.abs(lat - uni.lat) > 0.02 || Math.abs(lng - uni.lng) > 0.02) {
        return reject('坐标偏离所属大学（' + uni.nameZh + '）超过 ±0.02°，疑为录入错误');
      }

      var categories = categoriesRaw
        .split(/[,，]/)
        .map(function (c) { return c.trim(); })
        .filter(Boolean);
      if (categories.length === 0) return reject('categories 为空');

      seenIds[id] = true;
      out.push({
        id: id,
        name: name,
        universityId: universityId,
        categories: categories,
        status: status,
        lat: lat,
        lng: lng,
        weeklyOrders: isNaN(weeklyOrders) ? null : weeklyOrders
      });
    });

    return out;
  }

  /* ---------- 主入口 ---------- */
  function load() {
    return new Promise(function (resolve) {
      var cfg = window.WARUNG_CONFIG || {};
      if (!cfg.SHEET_ENABLED || !cfg.SHEET_CSV_URL) {
        resolve(null); // 未启用：静默降级
        return;
      }

      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);

      fetch(cfg.SHEET_CSV_URL, { signal: controller.signal })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (text) {
          clearTimeout(timer);
          var rows = parseCSV(text);
          if (rows.length < 2) { // 只有表头或全空
            console.warn('[SheetLoader] CSV 无有效数据行，降级演示数据');
            resolve(null);
            return;
          }
          var warungs = validateRows(rows.slice(1)); // 跳过表头行
          if (warungs.length === 0) {
            console.warn('[SheetLoader] 全部行校验失败，降级演示数据');
            resolve(null);
            return;
          }
          console.info('[SheetLoader] 已加载真实数据 ' + warungs.length + ' 条');
          resolve(warungs);
        })
        .catch(function (err) {
          clearTimeout(timer);
          var why = err && err.name === 'AbortError' ? '请求超时（' + FETCH_TIMEOUT_MS + 'ms）' : ('网络/解析错误：' + (err && err.message));
          console.warn('[SheetLoader] ' + why + '，降级演示数据');
          resolve(null); // 静默降级，不抛出
        });
    });
  }

  window.SheetLoader = { load: load };
})();
