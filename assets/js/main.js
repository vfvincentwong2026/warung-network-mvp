/* ============================================================
 * Warung Network — 主逻辑（v4 白色主题三语版 + 签约 SKU 货架 + 校园 WhatsApp 社群）
 * 依赖：Leaflet 1.9.x（CDN）+ assets/js/data.js（window.WARUNG_DATA）
 *      + assets/js/sheet-loader.js（window.SheetLoader，可选）
 * 兼容 file:// 直开：不使用 ES Module / fetch 本地文件
 *
 * 启动策略（避免 Sheet 启用后整页阻塞）：
 *   1. 非地图 UI（i18n/导航/数字动画/档期/滚动渐显）立即初始化；
 *   2. 地图【先用演示数据立即渲染】，页面秒开；
 *   3. SheetLoader.load() 异步返回真实数据后热替换并点亮「实时数据」角标；
 *      返回 null 则保持演示数据不变。
 *
 * 性能：地图 preferCanvas + L.circleMarker（canvas 渲染），222+ 点位不卡顿。
 * i18n：data-i18n / data-i18n-aria 属性 + 本地三语字典（本地常量，安全）；
 *      混合量级单位（亿/万）的数字+单位整体进字典，杜绝直译错误；
 *      切换语言时漏斗/图例/chips/下拉/popup/徽章 title 全部重渲染，
 *      localStorage 记忆选择，默认中文。
 * ============================================================ */
(function () {
  'use strict';

  var DATA = window.WARUNG_DATA;
  if (!DATA) { console.error('data.js 未加载'); return; }

  var STATUS = DATA.status;
  var UNIS = DATA.universities;

  /* ================= 0. 工具 ================= */

  // HTML 转义：所有来自数据文件/表格的字段在拼入 innerHTML / bindPopup 前必须过此函数。
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var isMobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
  var DOT_RADIUS = isMobile ? 7 : 5;

  /* ================= 1. 三语字典（本地常量，非用户输入，可安全 innerHTML） ================= */

  var I18N = {
    zh: {
      'doc.title': 'Warung Network · 中国消费品牌进入印尼的第一站',
      'meta.desc': 'Warung Network —— 中国消费品牌进入印尼的第一站。用雅加达大学城 Warung 终端网络，让你的新品 48 小时完成真实市场验证。',
      'aria.nav.main': '主导航', 'aria.menu': '打开菜单', 'aria.map': 'Warung 终端网络地图',
      'aria.funnel': '渠道漏斗统计', 'aria.footer': '页脚导航',
      'nav.sub': '雅加达 · Jakarta', 'nav.market': '市场机会', 'nav.map': '终端地图',
      'nav.products': '产品服务', 'nav.schedule': '档期', 'nav.process': '流程', 'nav.contact': '联系',
      'nav.cta': '索取快报', 'nav.mitra': '店主入驻',
      'hero.eyebrow': 'Peluncur Produk Baru · 新品发射台',
      'hero.title': '让你的新品，<br><span class="hero__accent">48 小时</span>铺进雅加达大学城',
      'hero.subtitle': '中国消费品牌进入印尼的<strong>第一站</strong> —— 用 300 万家 Warung 里的大学城终端网络，做真实货架上的市场验证。',
      'hero.cta.map': '查看终端地图', 'hero.cta.report': '索取消费快报',
      'hero.note': '蜜雪冰城们在印尼开了 2,600+ 家店 —— 但不是每个品牌都烧得起自建渠道。',
      'hero.strip1.num': '2.85 亿', 'hero.strip2.num': '7,500 万', 'hero.strip4.num': '300 万',
      'hero.strip1': '人口', 'hero.strip2': 'Z 世代', 'hero.strip3': 'QRIS 增长', 'hero.strip4': 'Warung 终端',
      'market.eyebrow': 'Peluang Pasar · 市场机会',
      'market.title': '全球第四人口大国，正在为中国品牌开门',
      'market.lead': '年轻、移动支付爆发、街角小店仍是零售主力 —— 进入印尼的最佳切口，就在大学城的 Warung。',
      'stat1.num': '2.85 亿', 'stat1.label': '总人口 · 全球第四',
      'stat2.label': '年龄中位数', 'stat2.unit': '岁',
      'stat3.num': '7,500 万', 'stat3.label': 'Z 世代人口',
      'stat4.label': 'QRIS 支付 2024 年交易量增长',
      'stat5.num': '300 万', 'stat5.label': '印尼 Warung 小店总数',
      'stat6.label': 'Warung 占印尼零售份额',
      'brands.title': '中国品牌已在抢滩',
      'brand.popmart.name': '泡泡玛特', 'brand.popmart': '雅加达门店开业排队数小时，潮玩热度超预期。',
      'brand.chagee.name': '霸王茶姬', 'brand.chagee': '东南亚扩张提速，雅加达核心商圈接连落店。',
      'brand.skintific.name': 'Skintific', 'brand.skintific': '中国团队孵化的护肤品牌，已成印尼电商护肤头部。',
      'brand.miniso.name': '名创优品', 'brand.miniso': '深耕多年，印尼门店规模已达数百家。',
      'brands.note': '巨头用资本铺出渠道网络，腰部品牌需要的是 —— 一条低成本的验证快车道。',
      'map.eyebrow': 'Peta Jaringan · 终端地图',
      'map.title': '🗺️ Warung 城市终端地图',
      'map.lead': '大雅加达 9 所大学城周边的 Warung 终端网络。点击大学徽章飞到校区视野，点击小圆点查看门店详情。',
      'filter.uni': '按大学筛选', 'filter.uni.all': '全部大学（大雅加达视野）', 'filter.status': '按状态筛选',
      'chip.all': '全部',
      'products.eyebrow': 'Produk · 产品货架',
      'products.title': '四级产品，从一份快报到完整落地',
      'products.lead': '全部预付制 —— 先锁档期，再开测。',
      'p1.name': '消费快报', 'p1.suffix': '起',
      'p1.li1': '雅加达大学生消费洞察月报', 'p1.li2': '品类热度 + 价格带分析', 'p1.li3': 'Warung 终端一线见闻',
      'p1.meta': '交付周期：5 个工作日',
      'p2.badge': '最受欢迎', 'p2.name': '48 小时闪电测',
      'p2.li1': '样品铺进 10 家校园 Warung', 'p2.li2': '48 小时封闭盲测 + 一手反馈', 'p2.li3': '3 天交付图文报告 + 现场视频',
      'p2.meta': '交付周期：3 天',
      'p3.name': '两周标准试销',
      'p3.li1': '30+ 点位、两周真实试销', 'p3.li2': '复购率 / 动销率 / 陈列反馈', 'p3.li3': '定价与规格本地化建议',
      'p3.meta': '交付周期：2 周 + 3 天报告',
      'p4.name': '市场进入服务', 'p4.price': '面议',
      'p4.li1': 'BPOM / 清真认证路径辅导', 'p4.li2': '经销网络与 KOL 对接', 'p4.li3': '首发 campaign 联合执行',
      'p4.meta': '交付周期：按项目定制',
      'tag.prepaid': '预付制',
      'schedule.eyebrow': 'Jadwal Uji · 测试档期',
      'schedule.title': '每月固定档期，8 个坑位，预付锁位',
      'schedule.lead': '为保证数据采集质量，每个测试档期仅开放 8 个品牌坑位。全额预付后锁定档期，逾期不顺延。',
      'slotA.name': '本月档期 A', 'slotA.date': '每月 1 日 – 15 日', 'slotA.foot': '剩余 <strong>5</strong> / 8 个坑位',
      'slotB.name': '本月档期 B', 'slotB.date': '每月 16 日 – 月末', 'slotB.foot': '剩余 <strong>7</strong> / 8 个坑位',
      'slots.note': '档期示例 · 实际坑位以咨询为准',
      'rule1.t': '预付锁位', 'rule1.d': '全额预付即锁定坑位，以到账时间为准。',
      'rule2.t': '样品先行', 'rule2.d': '开测前 7 天样品须抵达雅加达仓库。',
      'rule3.t': '错过等下期', 'rule3.d': '档期固定，逾期不顺延、不退款，可转下期。',
      'slot.full': '满', 'slot.taken.tip': '已被锁定', 'slot.open.tip': '可锁定坑位',
      'process.eyebrow': 'Cara Kerja · 运作流程',
      'process.title': '四步，把样品变成一份能决策的报告',
      'step1.t': '寄样品', 'step1.d': '样品寄至雅加达仓库，我们完成入库清点与盲测封装处理。',
      'step2.t': '48h 铺进校园店', 'step2.d': '48 小时内铺进大学城 Warung 真实货架，直面真实学生客群。',
      'step3.t': '封闭盲测采集数据', 'step3.d': '全程封闭式盲测，采集购买意愿、口味反馈、价格敏感度。',
      'step4.t': '3 天交付报告 + 视频', 'step4.d': '结构化数据报告 + 货架实拍视频，直接进入你的决策会议。',
      'compliance.title': '合规说明',
      'compliance.li1': '所有测试均为<strong>封闭式盲测</strong>，样品为<strong>非卖品</strong>，不进入公开销售环节。',
      'compliance.li2': '团队熟悉印尼 <strong>BPOM</strong> 注册与<strong>清真（Halal）认证</strong>流程，可为正式入市提供路径辅导。',
      'compliance.li3': '测试过程遵守印尼食品与消费品相关法规，保护品牌方知识产权。',
      'why.eyebrow': 'Kenapa Kami · 为什么是我们',
      'why.title': '别人给你问卷，我们给你货架',
      't1.t': '真终端，非问卷', 't1.d': '数据来自 Warung 真实货架与真实学生购买场景，不是坐在办公室里的想象。',
      't2.t': '3 天出结果', 't2.d': '从铺货到报告最快 3 天。市场窗口不等人，验证速度就是竞争力。',
      't3.t': '合规护航', 't3.d': '封闭盲测、非卖品流程，熟悉 BPOM 与清真认证，把合规风险挡在门外。',
      't4.t': '中印双语团队', 't4.d': '雅加达本地团队执行，中文对接交付，没有翻译损耗，没有信息黑箱。',
      'cta.title': '先读一份快报，再决定要不要进场',
      'cta.lead': '索取《雅加达大学生消费快报 · 样板版》—— 看看我们的数据颗粒度，值不值 ¥8,000。',
      'cta.wechat': '微信：warung-network',
      'footer.tagline': '中国消费品牌进入印尼的第一站',
      'footer.mitra': '店主入驻',
      'footer.copy': '© 2026 Warung Network · Jakarta &amp; Hangzhou · 地图数据 © OpenStreetMap contributors © CARTO',
      /* SKU 货架 + 校园社群 */
      'sku.eyebrow': 'Etalase SKU · 签约货盘', 'sku.title': '签约 SKU 货架',
      'sku.hardware.title': '首推智能硬件 Top 10',
      'sku.hardware.intro': '为印尼大学生严选的中国智能硬件货盘 · 社群预售 + 校园快闪 + Warung 自提',
      'sku.meals.title': '一日三餐 · Warung 场景 SKU',
      'sku.meals.intro': '印尼校园真实餐饮地图 · 4 个时段 16 个高频品项，全部由签约 Warung 终端承接',
      'sku.meals.spice': '辣度',
      'sku.tag': '签约 SKU',
      'sku.benchmark': '对标',
      'community.eyebrow': 'Komunitas Kampus · 校园社群',
      'community.title': '校园社群网络',
      'community.lead': '双边网络：左边 34 所校园终端店承接货架，右边 34 个校园 WhatsApp 社群承接复购。',
      'community.note': '社群招募中 · 由校园大使运营',
      'community.join': '💬 加入校园社群',
      /* 动态内容模板（{x} 为占位符） */
      'legend.title': '图例', 'legend.uni': '大学（点击飞到校区）',
      'badge.live': '🟢 实时数据 · 更新于 {time}',
      'popup.nearby': '周边', 'popup.orders': '近 7 天订单',
      'popup.uni.nearby': '周边点位 {n} 家：', 'popup.uni.none': '暂无'
    },
    en: {
      'doc.title': 'Warung Network · First Stop for Chinese Brands Entering Indonesia',
      'meta.desc': 'Warung Network — the first stop for Chinese consumer brands entering Indonesia. 48-hour real-market validation via the Jakarta campus warung network.',
      'aria.nav.main': 'Main navigation', 'aria.menu': 'Open menu', 'aria.map': 'Warung network map',
      'aria.funnel': 'Channel funnel statistics', 'aria.footer': 'Footer navigation',
      'nav.sub': 'Jakarta · Indonesia', 'nav.market': 'Market', 'nav.map': 'Map',
      'nav.products': 'Products', 'nav.schedule': 'Slots', 'nav.process': 'Process', 'nav.contact': 'Contact',
      'nav.cta': 'Get the Report', 'nav.mitra': 'For Warung Owners',
      'hero.eyebrow': 'New-Product Launchpad · Jakarta',
      'hero.title': 'Launch your product into Jakarta campus stores in <span class="hero__accent">48 hours</span>',
      'hero.subtitle': 'The <strong>first stop</strong> for Chinese consumer brands entering Indonesia — real-shelf market validation through a campus warung network drawn from 3 million warung nationwide.',
      'hero.cta.map': 'Explore the Map', 'hero.cta.report': 'Get the Report',
      'hero.note': 'Mixue & co. have opened 2,600+ stores in Indonesia — but not every brand can afford to build its own channel.',
      'hero.strip1.num': '285 M', 'hero.strip2.num': '75 M', 'hero.strip4.num': '3 M',
      'hero.strip1': 'population', 'hero.strip2': 'Gen Z', 'hero.strip3': 'QRIS growth', 'hero.strip4': 'warung outlets',
      'market.eyebrow': 'Peluang Pasar · Market Opportunity',
      'market.title': 'The world\u2019s 4th most populous country is opening its doors to Chinese brands',
      'market.lead': 'Young, mobile-payment boom, and street-corner kiosks still dominate retail — the best entry wedge is the campus warung.',
      'stat1.num': '285 M', 'stat1.label': 'Total population · world\u2019s 4th',
      'stat2.label': 'Median age', 'stat2.unit': 'yrs',
      'stat3.num': '75 M', 'stat3.label': 'Gen Z population',
      'stat4.label': 'QRIS transaction growth, 2024',
      'stat5.num': '3 M', 'stat5.label': 'Total warung kiosks in Indonesia',
      'stat6.label': 'Warung share of Indonesian retail',
      'brands.title': 'Chinese brands are already landing',
      'brand.popmart.name': 'Pop Mart', 'brand.popmart': 'Jakarta stores drew hours-long queues; designer-toy fever beat expectations.',
      'brand.chagee.name': 'CHAGEE', 'brand.chagee': 'SEA expansion accelerating, with stores across Jakarta\u2019s prime malls.',
      'brand.skintific.name': 'Skintific', 'brand.skintific': 'A skincare brand incubated by a Chinese team, now a top skincare seller on Indonesian e-commerce.',
      'brand.miniso.name': 'MINISO', 'brand.miniso': 'Years of deep presence; hundreds of stores across Indonesia.',
      'brands.note': 'Giants bought channel networks with capital. Mid-sized brands need a low-cost validation fast lane.',
      'map.eyebrow': 'Peta Jaringan · Terminal Map',
      'map.title': '🗺️ Warung City Terminal Map',
      'map.lead': 'The warung network around 9 universities across Greater Jakarta. Click a campus badge to fly in; click a dot for store details.',
      'filter.uni': 'Filter by university', 'filter.uni.all': 'All universities (Greater Jakarta view)', 'filter.status': 'Filter by status',
      'chip.all': 'All',
      'products.eyebrow': 'Produk · Product Shelf',
      'products.title': 'Four tiers — from a single report to full market entry',
      'products.lead': 'All prepaid — lock your slot first, then we test.',
      'p1.name': 'Consumer Report', 'p1.suffix': 'from',
      'p1.li1': 'Monthly Jakarta student consumer insights', 'p1.li2': 'Category heat + price-band analysis', 'p1.li3': 'Frontline notes from warung shelves',
      'p1.meta': 'Delivery: 5 business days',
      'p2.badge': 'Most popular', 'p2.name': '48-Hour Flash Test',
      'p2.li1': 'Samples shelved in 10 campus warung', 'p2.li2': '48h closed blind test + first-hand feedback', 'p2.li3': 'Report + on-site video in 3 days',
      'p2.meta': 'Delivery: 3 days',
      'p3.name': 'Two-Week Standard Pilot',
      'p3.li1': '30+ outlets, two weeks of real pilot sales', 'p3.li2': 'Repurchase, sell-through & shelf feedback', 'p3.li3': 'Pricing & format localization advice',
      'p3.meta': 'Delivery: 2 weeks + 3-day report',
      'p4.name': 'Market Entry Service', 'p4.price': 'Let\u2019s talk',
      'p4.li1': 'BPOM & Halal certification guidance', 'p4.li2': 'Distributor & KOL matchmaking', 'p4.li3': 'Joint launch-campaign execution',
      'p4.meta': 'Delivery: per project',
      'tag.prepaid': 'Prepaid',
      'schedule.eyebrow': 'Jadwal Uji · Test Slots',
      'schedule.title': 'Fixed monthly windows — 8 seats, prepaid to lock',
      'schedule.lead': 'To protect data quality, each window opens only 8 brand seats. Full prepayment locks the slot; no rollover.',
      'slotA.name': 'Window A', 'slotA.date': '1st – 15th monthly', 'slotA.foot': '<strong>5</strong> / 8 seats left',
      'slotB.name': 'Window B', 'slotB.date': '16th – month-end', 'slotB.foot': '<strong>7</strong> / 8 seats left',
      'slots.note': 'Sample schedule · actual availability on inquiry',
      'rule1.t': 'Prepay to lock', 'rule1.d': 'Full prepayment locks the seat, by payment arrival time.',
      'rule2.t': 'Samples first', 'rule2.d': 'Samples must reach our Jakarta warehouse 7 days before testing.',
      'rule3.t': 'Miss it, wait', 'rule3.d': 'Fixed windows — no rollover, no refund; transferable to the next window.',
      'slot.full': 'Full', 'slot.taken.tip': 'Already locked', 'slot.open.tip': 'Available to lock',
      'process.eyebrow': 'Cara Kerja · How It Works',
      'process.title': 'Four steps from sample to a decision-ready report',
      'step1.t': 'Ship samples', 'step1.d': 'Ship samples to our Jakarta warehouse; we handle intake and blind-test packaging.',
      'step2.t': '48h shelf placement', 'step2.d': 'On real campus-warung shelves within 48 hours, facing real students.',
      'step3.t': 'Closed blind-test data', 'step3.d': 'Fully closed blind tests capturing purchase intent, taste feedback, price sensitivity.',
      'step4.t': 'Report + video in 3 days', 'step4.d': 'Structured data report plus on-shelf video — straight into your decision meeting.',
      'compliance.title': 'Compliance',
      'compliance.li1': 'All tests are <strong>closed blind tests</strong>; samples are <strong>not for sale</strong> and never enter open retail.',
      'compliance.li2': 'The team knows <strong>BPOM</strong> registration and <strong>Halal certification</strong>, and can guide your formal market entry.',
      'compliance.li3': 'Testing complies with Indonesian food & consumer-goods regulations and protects brand IP.',
      'why.eyebrow': 'Kenapa Kami · Why Us',
      'why.title': 'Others hand you surveys. We hand you shelves.',
      't1.t': 'Real shelves, not surveys', 't1.d': 'Data from real warung shelves and real student purchases — not office guesswork.',
      't2.t': 'Results in 3 days', 't2.d': 'Shelf-to-report in as fast as 3 days. Market windows don\u2019t wait — validation speed is an edge.',
      't3.t': 'Compliance escort', 't3.d': 'Closed blind tests, not-for-sale flow, BPOM & Halal know-how — compliance risk stays outside.',
      't4.t': 'Chinese–Indonesian team', 't4.d': 'Executed by our Jakarta team, delivered in Chinese — no translation loss, no black box.',
      'cta.title': 'Read one report before you decide to enter',
      'cta.lead': 'Get the "Jakarta Student Consumer Report · Sample Edition" — see whether our data granularity is worth ¥8,000.',
      'cta.wechat': 'WeChat: warung-network',
      'footer.tagline': 'The first stop for Chinese consumer brands entering Indonesia',
      'footer.mitra': 'For Warung Owners',
      'footer.copy': '© 2026 Warung Network · Jakarta &amp; Hangzhou · Map data © OpenStreetMap contributors © CARTO',
      'sku.eyebrow': 'Etalase SKU · Signed Shelf', 'sku.title': 'Signed SKU Shelf',
      'sku.hardware.title': 'Top 10 Smart Hardware Picks',
      'sku.hardware.intro': 'Chinese smart hardware curated for Indonesian students · community presale + campus pop-ups + warung pickup',
      'sku.meals.title': 'Three Meals a Day · Warung-Scene SKUs',
      'sku.meals.intro': 'A real food map of Indonesian campuses · 16 high-frequency items across 4 dayparts, all fulfilled by signed warung outlets',
      'sku.meals.spice': 'Spice',
      'sku.tag': 'Signed SKU',
      'sku.benchmark': 'Benchmark',
      'community.eyebrow': 'Komunitas Kampus · Campus Community',
      'community.title': 'Campus Community Network',
      'community.lead': 'A two-sided network: 34 campus terminal stores hold the shelves; 34 campus WhatsApp groups drive repeat purchases.',
      'community.note': 'Recruiting members · run by campus ambassadors',
      'community.join': '💬 Join Campus Community',
      'legend.title': 'Legend', 'legend.uni': 'Universities (click to fly in)',
      'badge.live': '🟢 Live data · updated {time}',
      'popup.nearby': 'nearby', 'popup.orders': 'Orders (7 days)',
      'popup.uni.nearby': '{n} outlets nearby: ', 'popup.uni.none': 'none yet'
    },
    id: {
      'doc.title': 'Warung Network · Pintu Pertama Merek Tiongkok Masuk Indonesia',
      'meta.desc': 'Warung Network — pintu pertama merek konsumer Tiongkok masuk Indonesia. Validasi pasar nyata 48 jam lewat jaringan warung kampus Jakarta.',
      'aria.nav.main': 'Navigasi utama', 'aria.menu': 'Buka menu', 'aria.map': 'Peta jaringan warung',
      'aria.funnel': 'Statistik funnel kanal', 'aria.footer': 'Navigasi footer',
      'nav.sub': 'Jakarta · Indonesia', 'nav.market': 'Pasar', 'nav.map': 'Peta',
      'nav.products': 'Produk', 'nav.schedule': 'Jadwal', 'nav.process': 'Proses', 'nav.contact': 'Kontak',
      'nav.cta': 'Minta Laporan', 'nav.mitra': 'Mitra Warung',
      'hero.eyebrow': 'Peluncur Produk Baru · Jakarta',
      'hero.title': 'Produk baru Anda masuk warung kampus Jakarta dalam <span class="hero__accent">48 jam</span>',
      'hero.subtitle': '<strong>Pintu pertama</strong> merek konsumer Tiongkok masuk Indonesia — validasi pasar di rak nyata melalui jaringan warung kampus dari 3 juta warung di seluruh Indonesia.',
      'hero.cta.map': 'Lihat Peta', 'hero.cta.report': 'Minta Laporan',
      'hero.note': 'Mixue dkk. membuka 2.600+ gerai di Indonesia — tapi tidak semua merek sanggup membangun kanal sendiri.',
      'hero.strip1.num': '285 jt', 'hero.strip2.num': '75 jt', 'hero.strip4.num': '3 jt',
      'hero.strip1': 'populasi', 'hero.strip2': 'Gen Z', 'hero.strip3': 'pertumbuhan QRIS', 'hero.strip4': 'outlet warung',
      'market.eyebrow': 'Peluang Pasar',
      'market.title': 'Negara berpenduduk terbesar ke-4 dunia membuka pintu bagi merek Tiongkok',
      'market.lead': 'Muda, ledakan pembayaran digital, warung tetap tulang punggung ritel — jalur masuk terbaik adalah warung kawasan kampus.',
      'stat1.num': '285 jt', 'stat1.label': 'Total populasi · ke-4 dunia',
      'stat2.label': 'Usia median', 'stat2.unit': 'thn',
      'stat3.num': '75 jt', 'stat3.label': 'Populasi Gen Z',
      'stat4.label': 'Pertumbuhan transaksi QRIS 2024',
      'stat5.num': '3 jt', 'stat5.label': 'Total warung di Indonesia',
      'stat6.label': 'Pangsa warung di ritel Indonesia',
      'brands.title': 'Merek Tiongkok sudah mendarat',
      'brand.popmart.name': 'Pop Mart', 'brand.popmart': 'Gerai Jakarta antre berjam-jam; demam mainan melebihi ekspektasi.',
      'brand.chagee.name': 'CHAGEE', 'brand.chagee': 'Ekspansi Asia Tenggara dipercepat, gerai bermunculan di mal utama Jakarta.',
      'brand.skintific.name': 'Skintific', 'brand.skintific': 'Merek skincare besutan tim Tiongkok, kini pemain utama skincare e-commerce Indonesia.',
      'brand.miniso.name': 'MINISO', 'brand.miniso': 'Hadir bertahun-tahun; ratusan gerai di seluruh Indonesia.',
      'brands.note': 'Raksasa membangun kanal dengan modal. Merek menengah butuh jalur cepat validasi berbiaya rendah.',
      'map.eyebrow': 'Peta Jaringan',
      'map.title': '🗺️ Peta Jaringan Warung Kota',
      'map.lead': 'Jaringan warung di sekitar 9 kampus se-Jabodetabek. Klik lencana kampus untuk mendekat; klik titik untuk detail toko.',
      'filter.uni': 'Filter per kampus', 'filter.uni.all': 'Semua kampus (tampilan Jabodetabek)', 'filter.status': 'Filter per status',
      'chip.all': 'Semua',
      'products.eyebrow': 'Etalase Produk',
      'products.title': 'Empat level — dari satu laporan hingga masuk pasar penuh',
      'products.lead': 'Semua prabayar — kunci jadwal dulu, baru uji.',
      'p1.name': 'Laporan Konsumen', 'p1.suffix': 'mulai',
      'p1.li1': 'Insight bulanan konsumsi mahasiswa Jakarta', 'p1.li2': 'Analisis tren kategori + harga', 'p1.li3': 'Catatan langsung dari rak warung',
      'p1.meta': 'Pengiriman: 5 hari kerja',
      'p2.badge': 'Terpopuler', 'p2.name': 'Uji Kilat 48 Jam',
      'p2.li1': 'Sampel masuk 10 warung kampus', 'p2.li2': 'Uji buta tertutup 48 jam + umpan balik langsung', 'p2.li3': 'Laporan + video lapangan dalam 3 hari',
      'p2.meta': 'Pengiriman: 3 hari',
      'p3.name': 'Uji Jual Standar 2 Minggu',
      'p3.li1': '30+ titik, uji jual nyata dua minggu', 'p3.li2': 'Repurchase, sell-through & umpan balik rak', 'p3.li3': 'Saran lokalisasi harga & kemasan',
      'p3.meta': 'Pengiriman: 2 minggu + laporan 3 hari',
      'p4.name': 'Layanan Masuk Pasar', 'p4.price': 'Hubungi kami',
      'p4.li1': 'Pendampingan sertifikasi BPOM & Halal', 'p4.li2': 'Koneksi distributor & KOL', 'p4.li3': 'Eksekusi kampanye peluncuran bersama',
      'p4.meta': 'Pengiriman: sesuai proyek',
      'tag.prepaid': 'Prabayar',
      'schedule.eyebrow': 'Jadwal Uji',
      'schedule.title': 'Jadwal tetap bulanan — 8 slot, prabayar untuk kunci',
      'schedule.lead': 'Demi kualitas data, setiap periode hanya membuka 8 slot merek. Prabayar penuh mengunci slot; tidak bisa diundur.',
      'slotA.name': 'Periode A', 'slotA.date': 'Tgl 1 – 15 tiap bulan', 'slotA.foot': 'Sisa <strong>5</strong> / 8 slot',
      'slotB.name': 'Periode B', 'slotB.date': 'Tgl 16 – akhir bulan', 'slotB.foot': 'Sisa <strong>7</strong> / 8 slot',
      'slots.note': 'Contoh jadwal · ketersediaan aktual via konsultasi',
      'rule1.t': 'Prabayar = kunci', 'rule1.d': 'Prabayar penuh mengunci slot, berdasarkan waktu dana masuk.',
      'rule2.t': 'Sampel dulu', 'rule2.d': 'Sampel tiba di gudang Jakarta 7 hari sebelum uji.',
      'rule3.t': 'Terlewat? Periode berikutnya', 'rule3.d': 'Jadwal tetap — tidak diundur, tidak refund; bisa pindah periode berikutnya.',
      'slot.full': 'Penuh', 'slot.taken.tip': 'Sudah terkunci', 'slot.open.tip': 'Bisa dikunci',
      'process.eyebrow': 'Cara Kerja',
      'process.title': 'Empat langkah dari sampel ke laporan siap keputusan',
      'step1.t': 'Kirim sampel', 'step1.d': 'Kirim sampel ke gudang Jakarta; kami urus penerimaan dan pengemasan uji buta.',
      'step2.t': 'Masuk rak dalam 48 jam', 'step2.d': 'Masuk rak warung kampus dalam 48 jam, langsung ke mahasiswa.',
      'step3.t': 'Data uji buta tertutup', 'step3.d': 'Uji buta tertutup penuh: minat beli, umpan balik rasa, sensitivitas harga.',
      'step4.t': 'Laporan + video 3 hari', 'step4.d': 'Laporan data terstruktur + video rak nyata — langsung ke rapat keputusan Anda.',
      'compliance.title': 'Kepatuhan',
      'compliance.li1': 'Semua uji bersifat <strong>uji buta tertutup</strong>; sampel <strong>bukan untuk dijual</strong> dan tidak masuk ritel terbuka.',
      'compliance.li2': 'Tim memahami registrasi <strong>BPOM</strong> dan <strong>sertifikasi Halal</strong>, siap mendampingi masuk pasar resmi.',
      'compliance.li3': 'Pengujian mematuhi regulasi pangan & barang konsumsi Indonesia serta melindungi IP merek.',
      'why.eyebrow': 'Kenapa Kami',
      'why.title': 'Yang lain kasih kuesioner. Kami kasih rak.',
      't1.t': 'Rak nyata, bukan kuesioner', 't1.d': 'Data dari rak warung dan pembelian mahasiswa nyata — bukan tebakan kantoran.',
      't2.t': 'Hasil dalam 3 hari', 't2.d': 'Dari rak ke laporan hanya 3 hari. Jendela pasar tak menunggu — kecepatan validasi adalah keunggulan.',
      't3.t': 'Pengawalan kepatuhan', 't3.d': 'Uji buta tertutup, alur non-jual, paham BPOM & Halal — risiko kepatuhan terkendali.',
      't4.t': 'Tim dwibahasa Tiongkok–Indonesia', 't4.d': 'Dieksekusi tim lokal Jakarta, dilaporkan dalam bahasa Mandarin — tanpa kehilangan terjemahan, tanpa kotak hitam.',
      'cta.title': 'Baca satu laporan dulu sebelum memutuskan masuk',
      'cta.lead': 'Minta "Laporan Konsumen Mahasiswa Jakarta · Edisi Sampel" — nilai sendiri apakah kedalaman data kami sebanding dengan ¥8.000.',
      'cta.wechat': 'WeChat: warung-network',
      'footer.tagline': 'Pintu pertama merek konsumer Tiongkok masuk Indonesia',
      'footer.mitra': 'Mitra Warung',
      'footer.copy': '© 2026 Warung Network · Jakarta &amp; Hangzhou · Data peta © OpenStreetMap contributors © CARTO',
      'sku.eyebrow': 'Etalase SKU · SKU Terkontrak', 'sku.title': 'Etalase SKU Terkontrak',
      'sku.hardware.title': 'Top 10 Hardware Pintar Pilihan',
      'sku.hardware.intro': 'Hardware pintar Tiongkok terkurasi untuk mahasiswa Indonesia · presale komunitas + pop-up kampus + ambil di warung',
      'sku.meals.title': 'Makan Tiga Kali Sehari · SKU Skenario Warung',
      'sku.meals.intro': 'Peta kuliner kampus Indonesia yang nyata · 16 item berfrekuensi tinggi di 4 waktu makan, semua dilayani warung terkontrak',
      'sku.meals.spice': 'Pedas',
      'sku.tag': 'SKU Terkontrak',
      'sku.benchmark': 'Benchmark',
      'community.eyebrow': 'Komunitas Kampus',
      'community.title': 'Jaringan Komunitas Kampus',
      'community.lead': 'Jaringan dua sisi: 34 toko terminal kampus memegang rak; 34 grup WhatsApp kampus mendorong pembelian ulang.',
      'community.note': 'Perekrutan anggota · dikelola duta kampus',
      'community.join': '💬 Gabung Komunitas Kampus',
      'legend.title': 'Legenda', 'legend.uni': 'Kampus (klik untuk mendekat)',
      'badge.live': '🟢 Data langsung · diperbarui {time}',
      'popup.nearby': 'sekitar', 'popup.orders': 'Pesanan 7 hari',
      'popup.uni.nearby': '{n} titik di sekitar: ', 'popup.uni.none': 'belum ada'
    }
  };

  /* 品类 zh → en / id 映射（Warung 语境词保留印尼语原词）；未知品类回退原文 */
  var CAT_I18N = {
    '炒饭 Nasi Goreng':   { en: 'Nasi Goreng (Fried Rice)',   id: 'Nasi Goreng' },
    'Nasi Padang':        { en: 'Nasi Padang',                id: 'Nasi Padang' },
    '炸物 Gorengan':      { en: 'Gorengan Fritters',          id: 'Gorengan' },
    'Indomie 煮面':       { en: 'Indomie Noodles',            id: 'Indomie Rebus' },
    '烤串 Sate':          { en: 'Sate Skewers',               id: 'Sate' },
    'Warteg 家常菜':      { en: 'Warteg Home Cooking',        id: 'Warteg' },
    '粥品':               { en: 'Congee (Bubur)',             id: 'Bubur' },
    '椰浆饭 Nasi Uduk':   { en: 'Nasi Uduk (Coconut Rice)',   id: 'Nasi Uduk' },
    '零食':               { en: 'Snacks',                     id: 'Camilan' },
    '果汁 Jus':           { en: 'Juice (Jus)',                id: 'Jus' },
    '冰茶':               { en: 'Iced Tea',                   id: 'Es Teh' },
    '咖啡':               { en: 'Coffee',                     id: 'Kopi' }
  };

  /* ================= 2. 语言状态 ================= */

  var LANG_KEY = 'warung-lang';
  var currentLang = 'zh';
  try {
    var saved = localStorage.getItem(LANG_KEY);
    if (saved && I18N[saved]) currentLang = saved;
  } catch (e) { /* file:// 或隐私模式下 localStorage 不可用时静默用默认中文 */ }

  function T(key) {
    var dict = I18N[currentLang] || {};
    return dict[key] != null ? dict[key] : (I18N.zh[key] != null ? I18N.zh[key] : key);
  }
  function stLabel(statusKey) {
    var st = STATUS[statusKey];
    if (!st) return statusKey;
    return currentLang === 'en' ? st.labelEn : currentLang === 'id' ? st.labelId : st.labelZh;
  }
  function uniName(u) {
    return currentLang === 'zh' ? u.nameZh : currentLang === 'id' ? u.nameId : (u.nameEn || u.nameId);
  }
  function uniIntro(u) {
    return currentLang === 'en' ? (u.introEn || u.intro) : currentLang === 'id' ? (u.introId || u.intro) : u.intro;
  }
  function trCat(c) {
    var m = CAT_I18N[c];
    if (!m || currentLang === 'zh') return c;
    return m[currentLang] || c;
  }
  /* 千分位 locale 跟随当前语言 */
  function numLocale() {
    return currentLang === 'en' ? 'en-US' : currentLang === 'id' ? 'id-ID' : 'zh-CN';
  }

  /* 静态文案 + aria-label + meta description：按当前语言填充（字典为本地常量，可 innerHTML） */
  function applyStaticI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = T(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', T(el.getAttribute('data-i18n-aria')));
    });
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', T('meta.desc'));
    document.title = T('doc.title');
    document.documentElement.setAttribute('lang',
      currentLang === 'zh' ? 'zh-CN' : currentLang === 'id' ? 'id' : 'en');
  }

  /* 档期坑位（i18n 感知，切语言需重渲染） */
  function renderSlots() {
    document.querySelectorAll('.slot-grid').forEach(function (grid) {
      grid.innerHTML = '';
      var occupied = parseInt(grid.dataset.occupied || '0', 10);
      var total = parseInt(grid.dataset.total || '8', 10);
      for (var i = 1; i <= total; i++) {
        var cell = document.createElement('div');
        var taken = i <= occupied;
        cell.className = 'slot-cell ' + (taken ? 'slot-cell--taken' : 'slot-cell--open');
        cell.textContent = taken ? T('slot.full') : i;
        cell.title = taken ? T('slot.taken.tip') : T('slot.open.tip');
        grid.appendChild(cell);
      }
    });
  }

  /* SKU / 社群数据对象的三语字段取值（回退中文） */
  function pickL10n(obj, base) {
    var k = base + (currentLang === 'en' ? 'En' : currentLang === 'id' ? 'Id' : 'Zh');
    return obj[k] || obj[base + 'Zh'] || '';
  }

  /* --- 签约 SKU 货架 + 校园社群入口（本地常量数据，切语言需重渲染） --- */
  function renderSkuAndCommunity() {
    var hw = document.getElementById('hardwareGrid');
    if (hw) {
      hw.innerHTML = '';
      (DATA.skusHardware || []).forEach(function (s) {
        var card = document.createElement('article');
        card.className = 'sku-card';
        card.innerHTML =
          /* 产品图置顶（白底 contain 居中，懒加载）；emoji 图标去掉，画面更干净 */
          (s.image ? '<img class="sku-card__img" src="' + escapeHtml(s.image) + '" alt="' + escapeHtml(pickL10n(s, 'name')) + '" loading="lazy">' : '') +
          '<div class="sku-card__top"><span class="sku-card__tag">' + escapeHtml(T('sku.tag')) + '</span></div>' +
          '<h3 class="sku-card__name">' + escapeHtml(pickL10n(s, 'name')) + '</h3>' +
          '<p class="sku-card__desc">' + escapeHtml(pickL10n(s, 'desc')) + '</p>' +
          '<div class="sku-card__foot"><span class="sku-card__price">' + escapeHtml(s.priceRp) + '</span>' +
          '<span class="sku-card__channel">' + escapeHtml(pickL10n(s, 'channel')) + '</span></div>' +
          /* 对标行：mono 小字，点击新开页跳对标品官网 */
          (s.benchmark ? '<a class="sku-card__bench" href="' + escapeHtml(s.productUrl) + '" target="_blank" rel="noopener">' +
            escapeHtml(T('sku.benchmark')) + ' ' + escapeHtml(s.benchmark) + ' · ' + escapeHtml(s.priceRef) + '</a>' : '');
        hw.appendChild(card);
      });
    }
    var meals = document.getElementById('mealsGrid');
    if (meals) {
      meals.innerHTML = '';
      (DATA.skusMeals || []).forEach(function (m) {
        var card = document.createElement('article');
        card.className = 'meal-card';
        var itemsHtml = (m.items || []).map(function (it) {
          var spice = Math.max(0, Math.min(3, it.spice || 0));
          var dots = '';
          for (var i = 0; i < 3; i++) dots += i < spice ? '●' : '○';
          var tag = pickL10n(it, 'tag');
          return '<li class="meal-item">' +
            '<span class="meal-item__name">' + escapeHtml(pickL10n(it, 'name')) + '</span>' +
            '<span class="meal-item__spice" title="' + escapeHtml(T('sku.meals.spice')) + ' ' + spice + '/3" aria-label="' + escapeHtml(T('sku.meals.spice')) + ' ' + spice + '/3">' + dots + '</span>' +
            '<span class="meal-item__price">' + escapeHtml(it.price) + '</span>' +
            (tag ? '<span class="meal-item__tag">' + escapeHtml(tag) + '</span>' : '') +
            '</li>';
        }).join('');
        card.innerHTML =
          '<div class="meal-card__time">' + escapeHtml(m.icon) + ' ' + escapeHtml(pickL10n(m, 'slot')) + '</div>' +
          '<ul class="meal-card__list">' + itemsHtml + '</ul>';
        meals.appendChild(card);
      });
    }
    var comm = document.getElementById('communityGrid');
    if (comm) {
      comm.innerHTML = '';
      UNIS.forEach(function (u) {
        if (!u.whatsappGroup) return;
        var card = document.createElement('div');
        card.className = 'community-card';
        card.innerHTML =
          '<span class="community-card__name">' + escapeHtml(uniName(u)) + '</span>' +
          '<a class="community-card__join" href="' + escapeHtml(u.whatsappGroup) + '" target="_blank" rel="noopener">' +
          escapeHtml(T('community.join')) + '</a>';
        comm.appendChild(card);
      });
    }
  }

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

  /* 语言切换总入口 */
  function setLang(lang) {
    if (!I18N[lang] || lang === currentLang) return;
    currentLang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyStaticI18n();
    renderSlots();
    renderSkuAndCommunity(); // SKU 货架 + 校园社群卡随语言重渲染
    mapCtl.setLang(); // 重渲染漏斗/图例/chips/下拉/popup/徽章 title/角标
    document.querySelectorAll('#langSwitch button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  /* ============================================================
   * A. 非地图 UI（不依赖 warungs 数据，绝不等待网络）
   * ============================================================ */
  function initPageUI() {

    /* --- 静态文案首次填充 --- */
    applyStaticI18n();

    /* --- 语言切换器 --- */
    var switcher = document.getElementById('langSwitch');
    switcher.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-lang]');
      if (btn) setLang(btn.dataset.lang);
    });
    switcher.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === currentLang);
    });

    /* --- 数字滚动动画（2s，克制节奏；千分位 locale 跟随语言） --- */
    var counters = document.querySelectorAll('.count-up');
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        counterObserver.unobserve(el);
        var target = parseFloat(el.dataset.target);
        var decimals = parseInt(el.dataset.decimals || '0', 10);
        var duration = 2000;
        var start = performance.now();
        function tick(now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          var val = target * eased;
          el.textContent = decimals > 0
            ? val.toFixed(decimals)
            : Math.round(val).toLocaleString(numLocale());
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = decimals > 0
            ? target.toFixed(decimals)
            : target.toLocaleString(numLocale());
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { counterObserver.observe(c); });

    /* --- 档期坑位 + SKU/社群卡首次渲染（须在渐显 observer 注册之前，动态卡片才能被观察到） --- */
    renderSlots();
    renderSkuAndCommunity();

    /* --- 滚动渐显（淡入 + 上移 12px，300ms ease-out） --- */
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(
      '.section__eyebrow, .section__title, .section__lead, ' +
      '.stat-card, .brand-chip, .product-card, .slot-month, .rule, .step, .trust-card, ' +
      '.sku-card, .meal-card, .community-card, ' +
      '.compliance, .funnel, .map-filters, ' +
      '.hero__eyebrow, .hero__title, .hero__subtitle, .hero__ctas, .hero__note, .hero__strip, ' +
      '.cta__title, .cta__lead, .cta__contacts'
    ).forEach(function (el) {
      el.classList.add('reveal');
      revealObserver.observe(el);
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

    /* --- 锚点滚动高亮 --- */
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
   * B. 地图模块：先用演示数据渲染；swapData() 热替换；setLang() 重渲染
   * ============================================================ */
  function initMap(initialWarungs) {

    var warungs = initialWarungs;
    var liveTime = ''; // 实时数据加载完成的本地时间（切语言时重排角标文案）

    var map = L.map('leafletMap', {
      center: [-6.26, 106.81],
      zoom: 11,
      scrollWheelZoom: true,
      preferCanvas: true
    });

    // CartoDB Positron 浅色底图（零 API key）
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    var uniById = {};
    UNIS.forEach(function (u) { uniById[u.id] = u; });

    var uniMarkers = [];    // { id, marker }
    var warungMarkers = []; // { id, universityId, status, marker, pulse, w }

    /* --- 数据来源角标：默认隐藏，仅真实数据时点亮 --- */
    var badge = document.getElementById('mapDataBadge');
    function setBadgeLive() {
      if (!badge) return;
      if (!liveTime) {
        var now = new Date();
        liveTime = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
      }
      badge.textContent = T('badge.live').replace('{time}', liveTime);
      badge.classList.add('map-demo-note--live');
    }

    /* --- 大学 popup 内容（依赖当前 warungs + 当前语言） --- */
    function buildUniPopup(u) {
      var nearby = warungs.filter(function (w) { return w.universityId === u.id; });
      var statHtml = Object.keys(STATUS).map(function (key) {
        var n = nearby.filter(function (w) { return w.status === key; }).length;
        return n > 0 ? escapeHtml(stLabel(key)) + ' <strong>' + n + '</strong>' : null;
      }).filter(Boolean).join(' · ');
      return '<div class="popup-title">' + escapeHtml(uniName(u)) + '</div>' +
        '<div class="popup-sub">' + escapeHtml(u.nameId) + ' · ' + escapeHtml(u.area) + '</div>' +
        '<div class="popup-stat">' + escapeHtml(uniIntro(u)) + '</div>' +
        '<div class="popup-stat" style="margin-top:6px">' +
          escapeHtml(T('popup.uni.nearby').replace('{n}', nearby.length)) + (statHtml || escapeHtml(T('popup.uni.none'))) + '</div>' +
        (u.whatsappGroup ? '<br><a class="popup-join" href="' + escapeHtml(u.whatsappGroup) + '" target="_blank" rel="noopener">' + escapeHtml(T('community.join')) + '</a>' : '');
    }

    /* --- 大学徽章 marker（divIcon，仅 34 个；title 用当前语言校名） --- */
    UNIS.forEach(function (u) {
      var short = escapeHtml(u.id.toUpperCase().slice(0, 3));
      var icon = L.divIcon({
        className: '',
        html: '<div class="uni-marker" data-uni="' + escapeHtml(u.id) + '">' + short + '</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });
      var m = L.marker([u.lat, u.lng], { icon: icon, title: uniName(u) }).addTo(map);
      m.bindPopup(buildUniPopup(u));
      uniMarkers.push({ id: u.id, marker: m });
    });

    /* --- Warung 圆点基础样式（细边，白底可读） --- */
    function dotStyle(statusKey) {
      return {
        radius: DOT_RADIUS,
        color: 'rgba(17,17,17,0.55)',
        weight: 1,
        fillColor: STATUS[statusKey].color,
        fillOpacity: 1,
        bubblingMouseEvents: false
      };
    }

    function buildWarungPopup(w, st) {
      var u = uniById[w.universityId];
      var cats = w.categories.map(function (c) { return '<span class="popup-tag">' + escapeHtml(trCat(c)) + '</span>'; }).join('');
      // 真实数据带 weekly_orders 时展示（演示数据无此字段，自动不显示）
      var ordersLine = (typeof w.weeklyOrders === 'number')
        ? '<div class="popup-stat" style="margin-top:4px">' + escapeHtml(T('popup.orders')) + ' <strong>' + w.weeklyOrders + '</strong></div>' : '';
      // target 状态底色为半透明深灰，文字需近黑（对应 .popup-status--light）
      var statusCls = 'popup-status' + (w.status === 'target' ? ' popup-status--light' : '');
      return '<div class="popup-title">' + escapeHtml(w.name) + '</div>' +
        '<div class="popup-sub">' + (u ? escapeHtml(uniName(u)) + ' ' : '') + escapeHtml(T('popup.nearby')) + '</div>' +
        '<div class="popup-tags">' + cats + '</div>' + ordersLine + '<br>' +
        '<span class="' + statusCls + '" style="background:' + escapeHtml(st.color) + '">' + escapeHtml(stLabel(w.status)) + '</span>';
    }

    /* --- Warung 小圆点渲染（canvas circleMarker；先清旧图层，再重建） --- */
    function renderWarungs() {
      warungMarkers.forEach(function (wm) {
        map.removeLayer(wm.marker);
        if (wm.pulse) map.removeLayer(wm.pulse);
      });
      warungMarkers = [];
      warungs.forEach(function (w) {
        var st = STATUS[w.status];
        if (!st) return; // 兜底：未知状态不渲染（loader 已校验，双保险）
        var m = L.circleMarker([w.lat, w.lng], dotStyle(w.status)).addTo(map);
        m.bindPopup(buildWarungPopup(w, st));
        // 活跃点位：脉冲环独立 divIcon overlay（数量极少，不参与 canvas）
        var pulse = null;
        if (w.status === 'active') {
          pulse = L.marker([w.lat, w.lng], {
            icon: L.divIcon({ className: '', html: '<div class="warung-pulse"></div>', iconSize: [10, 10], iconAnchor: [5, 5] }),
            interactive: false,
            keyboard: false
          }).addTo(map);
        }
        warungMarkers.push({ id: w.id, universityId: w.universityId, status: w.status, marker: m, pulse: pulse, w: w });
      });
    }
    renderWarungs();

    /* --- 漏斗统计条 --- */
    var funnelEl = document.getElementById('funnelBar');
    function renderFunnel() {
      var funnelHtml = '';
      Object.keys(STATUS).forEach(function (key, i, arr) {
        var n = warungs.filter(function (w) { return w.status === key; }).length;
        funnelHtml +=
          '<div class="funnel__stage">' +
            '<span class="funnel__dot" style="background:' + escapeHtml(STATUS[key].color) + '"></span>' +
            '<span class="funnel__num">' + n + '</span>' +
            '<span class="funnel__label">' + escapeHtml(stLabel(key)) + '</span>' +
          '</div>';
        if (i < arr.length - 1) funnelHtml += '<div class="funnel__arrow">/</div>';
      });
      funnelEl.innerHTML = funnelHtml;
    }
    renderFunnel();

    /* --- 图例 --- */
    var legendEl = document.getElementById('mapLegend');
    function renderLegend() {
      var legendHtml = '<div class="map-legend__title">' + escapeHtml(T('legend.title')) + '</div>' +
        '<div class="map-legend__item"><span class="map-legend__swatch map-legend__swatch--uni"></span>' + escapeHtml(T('legend.uni')) + '</div>';
      Object.keys(STATUS).forEach(function (key) {
        var pulse = key === 'active' ? ' map-legend__swatch--pulse' : '';
        legendHtml += '<div class="map-legend__item"><span class="map-legend__swatch' + pulse +
          '" style="background:' + escapeHtml(STATUS[key].color) + '"></span>' + escapeHtml(stLabel(key)) + '</div>';
      });
      legendEl.innerHTML = legendHtml;
    }
    renderLegend();

    /* ================= 筛选 ================= */

    var currentUni = '';
    var currentStatus = '';

    /* --- 大学下拉（option 文本随语言重排） --- */
    var uniFilter = document.getElementById('uniFilter');
    function renderUniOptions() {
      // 保留第一个「全部大学」option（走 data-i18n），重建其余
      uniFilter.querySelectorAll('option[data-uni]').forEach(function (o) { o.remove(); });
      UNIS.forEach(function (u) {
        var opt = document.createElement('option');
        opt.value = u.id;
        opt.dataset.uni = u.id;
        opt.textContent = uniName(u) + ' · ' + u.area;
        uniFilter.appendChild(opt);
      });
    }
    renderUniOptions();

    uniFilter.addEventListener('change', function () {
      currentUni = uniFilter.value;
      if (currentUni) {
        var u = uniById[currentUni];
        var selectedId = currentUni;
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

    /* --- 状态 chips（标签随语言重排） --- */
    var chipsEl = document.getElementById('statusChips');
    var allChip = document.createElement('button');
    allChip.className = 'status-chip active';
    allChip.style.setProperty('--chip-color', '#111111');
    allChip.dataset.status = '';
    chipsEl.appendChild(allChip);
    Object.keys(STATUS).forEach(function (key) {
      var chip = document.createElement('button');
      chip.className = 'status-chip';
      chip.style.setProperty('--chip-color', STATUS[key].color);
      chip.dataset.status = key;
      chipsEl.appendChild(chip);
    });
    function renderChips() {
      allChip.textContent = T('chip.all');
      chipsEl.querySelectorAll('.status-chip[data-status]').forEach(function (c) {
        if (c.dataset.status) c.textContent = stLabel(c.dataset.status);
      });
    }
    renderChips();

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

    /* --- 应用筛选：canvas circleMarker 用 setStyle 淡化/高亮 --- */
    function applyFilters() {
      warungMarkers.forEach(function (wm) {
        var matchUni = !currentUni || wm.universityId === currentUni;
        var matchStatus = !currentStatus || wm.status === currentStatus;
        var hit = matchUni && matchStatus;
        var highlighted = !!currentUni && hit;
        if (hit) {
          wm.marker.setStyle(highlighted
            ? { opacity: 1, fillOpacity: 1, color: '#111111', weight: 2 }  // 选中大学：黑色描边加粗
            : dotStyle(wm.status));
        } else {
          wm.marker.setStyle({ opacity: 0.15, fillOpacity: 0.12, color: 'rgba(17,17,17,0.25)', weight: 1 });
        }
        if (wm.pulse) {
          var pel = wm.pulse.getElement();
          if (pel) {
            var ring = pel.querySelector('.warung-pulse');
            if (ring) ring.classList.toggle('dimmed', !hit);
          }
        }
      });
      uniMarkers.forEach(function (um) {
        var el = um.marker.getElement();
        if (!el) return;
        var badge2 = el.querySelector('.uni-marker');
        if (badge2) badge2.classList.toggle('dimmed', !!currentUni && um.id !== currentUni);
      });
    }

    /* --- 重置筛选器 --- */
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
      renderWarungs();   // 清理旧图层（含脉冲 overlay）+ 重建
      renderFunnel();    // 重算漏斗
      // 大学 popup 内含周边点位统计，需随数据更新
      uniMarkers.forEach(function (um) {
        um.marker.setPopupContent(buildUniPopup(uniById[um.id]));
      });
      resetFilters();
      setBadgeLive();    // 点亮「实时数据 · 更新于 HH:MM」角标
      console.info('[WarungMap] 已切换为实时数据，共 ' + warungs.length + ' 个点位');
    }

    /* ================= 语言切换重渲染 ================= */
    function setLang() {
      renderFunnel();
      renderLegend();
      renderChips();
      renderUniOptions();
      uniFilter.value = currentUni; // renderUniOptions 重建 option 后恢复选中态
      // popup 文案 + 徽章 title 按当前语言重建
      warungMarkers.forEach(function (wm) {
        wm.marker.setPopupContent(buildWarungPopup(wm.w, STATUS[wm.status]));
      });
      uniMarkers.forEach(function (um) {
        um.marker.setPopupContent(buildUniPopup(uniById[um.id]));
        var el = um.marker.getElement();
        if (el) el.title = uniName(uniById[um.id]);
      });
      if (liveTime) setBadgeLive(); // 实时角标文案跟随语言
    }

    return { swapData: swapData, setLang: setLang };
  }
})();
