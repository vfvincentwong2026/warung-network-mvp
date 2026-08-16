# Google Sheets 数据源对接方案

> 目标：地推手机录入 → 网站地图自动读取渲染，零后端、零成本。
> 原则：隐私分层（联系人信息绝不上公网）、断网/接口失败可降级回演示数据。

---

## 1. 架构

```
地推手机（Google Sheets App 录入）
   ↓
【内部总表 tab】（私有，含店主电话/备注等敏感字段）
   ↓ QUERY 公式自动生成
【公开数据 tab】（仅非敏感字段）
   ↓ 「发布到网络」生成 CSV 链接
网站前端 fetch CSV → 校验 → 渲染地图
   ↓ 失败时
降级回 data.js 内置演示数据（地图标注 Demo）
```

## 2. Sheet 结构（两张 tab）

### tab 1: `内部总表`（永不发布）

| 列 | 字段 | 必填 | 说明 |
|---|---|---|---|
| A | id | ✅ | 格式 W-<大学>-<序号>，如 W-UI-001 |
| B | name | ✅ | 店名 |
| C | university_id | ✅ | 下拉选（ui/gunadarma/pnj/unj/binus/trisakti/atmajaya/uin/pancasila） |
| D | lat | ✅ | 数字 |
| E | lng | ✅ | 数字 |
| F | categories | ✅ | 逗号分隔，如 "咖啡, 零食" |
| G | status | ✅ | 下拉选：target/contacted/negotiating/signed/active |
| H | owner_name | | 店主姓名（敏感） |
| I | whatsapp | | 店主 WhatsApp（敏感） |
| J | signed_date | | 签约日期 |
| K | weekly_orders | | 近 7 天订单数 |
| L | notes | | 地推备注（敏感） |
| M | last_visit | | 最近拜访日期 |

### tab 2: `公开数据`（只有这个 tab 发布到网络）

A1 单元格放 QUERY 公式，自动镜像非敏感列：

```
=QUERY('内部总表'!A:M, "select A, B, C, D, E, F, G, K where A is not null", 1)
```

生成列：`id, name, university_id, lat, lng, categories, status, weekly_orders`

## 3. 发布步骤（一次性，5 分钟）

1. 建表：Google Sheets 新建表格，按 §2 建两个 tab
2. C/G 列设置数据验证下拉（数据 → 数据验证）
3. 「文件 → 共享 → 发布到网络」→ 选择**仅「公开数据」tab** → 格式 CSV → 发布
4. 复制生成的 CSV URL，形如：
   `https://docs.google.com/spreadsheets/d/<SHEET_ID>/pub?gid=<GID>&single=true&output=csv`
5. 把 URL 填入网站 `assets/js/data.js` 顶部的 `SHEET_CSV_URL` 配置项

> ⚠️ 注意：「发布到网络」≠「共享链接」。只有发布操作会产生可跨域读取的 CSV；务必确认只发布了「公开数据」tab。
> ⚠️ Google 发布缓存约 5 分钟，录入后不会秒级上地图，可接受。

## 4. 前端改造（本次代码变更）

- `data.js`：新增 `window.WARUNG_CONFIG = { SHEET_CSV_URL: "", SHEET_ENABLED: false }`；内置演示数据保留为降级兜底
- 新增 `assets/js/sheet-loader.js`：
  - 页面加载时若 `SHEET_ENABLED=true` 且 URL 非空 → fetch CSV
  - CSV 解析（支持引号包裹、逗号、换行的标准解析，不手写 split(',')）
  - **逐行校验**：status 必须在白名单、lat/lng 必须是数字且在所属大学 ±0.02° 粗范围内、id 去重；不合格行跳过并 console.warn，绝不让脏数据炸掉地图
  - 全部失败 → 静默降级到演示数据
- `main.js`：地图数据来源抽象为 `getWarungs()`，sheet 数据优先
- 地图角标联动：
  - 演示数据 → 「演示数据 Demo Data」（现状）
  - 真实数据 → 「🟢 实时数据 · 更新于 HH:MM」

## 5. 数据录入 SOP（地推）

1. 踩点发现新店 → 手机 Sheets App 在「内部总表」末尾新增一行
2. 必填 7 列（id/name/university_id/lat/lng/categories/status），坐标站在店门口用手机地图读数
3. 状态流转只改 G 列，不删行
4. 每天收工前检查一遍当天新增行无乱码

## 6. 风险与边界

| 风险 | 应对 |
|---|---|
| 误发布内部总表泄露店主电话 | 发布时只选「公开数据」tab；README 红线标注 |
| 地推填错坐标/status | 前端白名单校验，脏行自动跳过 |
| Google 服务在国内访问不稳定 | 品牌方在国内访问网站时 fetch 失败 → 自动降级演示数据，网站永远可用 |
| 未来数据量大后 Sheets 不够用 | 方案 v2.0 已规划 Phase 4 平台化，届时换 Cloudflare D1，前端接口不变 |
