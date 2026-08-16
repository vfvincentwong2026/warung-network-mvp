/* ============================================================
 * Warung Network — 演示数据 (Demo Data)
 * ------------------------------------------------------------
 * ⚠️ 本文件当前为演示数据（Demo Data）。
 *    实时网络数据将于渠道激活后由后端接口替换。
 *    替换方式：保持下方数据结构不变，改为 fetch 真实接口即可。
 *
 * 数据结构说明：
 *   universities[] — 大学（地图上的大圆形徽章 marker）
 *     id        : 唯一标识（warung.universityId 引用它）
 *     nameZh    : 中文名
 *     nameId    : 印尼语名
 *     area      : 所在区域
 *     lat / lng : 坐标（数字，不带引号）
 *     intro     : 一句话简介
 *     color     : 该大学的主题色（用于地图徽章）
 *
 *   warungs[] — Warung 终端小店（地图上的小圆点 marker）
 *     id           : 唯一标识
 *     name         : 店名
 *     universityId : 所属大学 id
 *     categories   : 经营品类数组
 *     status       : 漏斗状态，取值为 WARUNG_STATUS 中的 key
 *     lat / lng    : 坐标（所属大学坐标 ±0.005 度内）
 * ============================================================ */

/* ============================================================
 * Google Sheets 数据源配置（详见 docs/方案-GoogleSheets数据源对接.md）
 * ------------------------------------------------------------
 * 启用方法：
 *   1. 按方案 §3 将 Google Sheets 的「公开数据」tab「发布到网络」为 CSV，
 *      复制生成的 URL（形如 .../pub?gid=...&single=true&output=csv）
 *   2. 把 URL 填入下方 SHEET_CSV_URL，并把 SHEET_ENABLED 改为 true
 * 未启用 / 加载失败 / 数据全部校验不通过时，前端自动降级为
 * 本文件下方的内置演示数据，网站永远可用。
 * ============================================================ */
window.WARUNG_CONFIG = {
  SHEET_ENABLED: true,
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8BqiZr8TGOUTHXv6UrRskirrvco3m8XSmToEIa5pRgIigPedE-sVPxFQu5dn1gzgdpignRqNSNXvW/pub?gid=37760839&single=true&output=csv"
};

/* 漏斗状态字典：顺序即漏斗顺序（配色适配深色地图底图，勿改 key/label） */
const WARUNG_STATUS = {
  target:      { key: 'target',      label: '目标点位', color: 'rgba(255,255,255,0.28)' },
  contacted:   { key: 'contacted',   label: '已接触',   color: '#4EA3FF' },
  negotiating: { key: 'negotiating', label: '洽谈中',   color: '#F5A623' },
  signed:      { key: 'signed',      label: '已签约',   color: '#34C759' },
  active:      { key: 'active',      label: '活跃',     color: '#30D158' }
};

const UNIVERSITIES = [
  {
    id: 'ui',
    nameZh: '印度尼西亚大学',
    nameId: 'Universitas Indonesia',
    area: 'Depok',
    lat: -6.3628,
    lng: 106.8267,
    intro: '印尼排名第一的国立大学，约 5 万名学生，大学城核心消费高地。',
    color: '#E3A72F'
  },
  {
    id: 'gunadarma',
    nameZh: '古纳达马大学',
    nameId: 'Universitas Gunadarma',
    area: 'Margonda',
    lat: -6.3573,
    lng: 106.8427,
    intro: '大型私立大学，毗邻 UI，Margonda 学生街日均人流极旺。',
    color: '#7E6B8F'
  },
  {
    id: 'pnj',
    nameZh: '雅加达国立理工学院',
    nameId: 'Politeknik Negeri Jakarta',
    area: 'Depok',
    lat: -6.3718,
    lng: 106.8236,
    intro: '国立理工学院，工科生密集，高频次便利消费典型客群。',
    color: '#3E7C59'
  },
  {
    id: 'unj',
    nameZh: '雅加达国立大学',
    nameId: 'Universitas Negeri Jakarta',
    area: 'Rawamangun',
    lat: -6.1934,
    lng: 106.8820,
    intro: '东雅加达老牌国立大学，师范类生源庞大，校园生活圈成熟。',
    color: '#2F6B4F'
  },
  {
    id: 'binus',
    nameZh: '建国大学',
    nameId: 'BINUS University',
    area: 'Kemanggisan',
    lat: -6.2019,
    lng: 106.7820,
    intro: '华裔学生比例最高的私立名校，对亚洲新品牌接受度极强。',
    color: '#B5461D'
  },
  {
    id: 'trisakti',
    nameZh: '特里莎克蒂大学',
    nameId: 'Universitas Trisakti',
    area: 'Grogol',
    lat: -6.1676,
    lng: 106.7892,
    intro: '西雅加达大型私立大学，Grogol 商圈与校园消费互相带动。',
    color: '#8A3324'
  },
  {
    id: 'atmajaya',
    nameZh: '阿特玛查雅大学',
    nameId: 'Universitas Atma Jaya',
    area: 'Semanggi',
    lat: -6.2195,
    lng: 106.8234,
    intro: '位于 Semanggi 市中心核心地段，学生消费力位居前列。',
    color: '#C65D21'
  },
  {
    id: 'uin',
    nameZh: 'UIN 国立伊斯兰大学',
    nameId: 'UIN Syarif Hidayatullah',
    area: 'Ciputat',
    lat: -6.3054,
    lng: 106.7555,
    intro: '南雅加达最大的国立伊斯兰大学，清真合规消费的代表场景。',
    color: '#4E7A3A'
  },
  {
    id: 'pancasila',
    nameZh: '潘查希拉大学',
    nameId: 'Universitas Pancasila',
    area: 'Srengseng Sawah',
    lat: -6.3376,
    lng: 106.8328,
    intro: '历史悠久的私立大学，与 UI 生活圈相邻，点位协同价值高。',
    color: '#9C6644'
  }
];

const WARUNGS = [
  { id: 'w001', name: 'Kios Pak Slamet', universityId: 'ui', categories: ['炒饭 Nasi Goreng'], status: 'active', lat: -6.35879, lng: 106.82731 },
  { id: 'w002', name: 'Kedai Cempaka', universityId: 'ui', categories: ['Nasi Padang'], status: 'negotiating', lat: -6.36298, lng: 106.83003 },
  { id: 'w003', name: 'Toko Kelontong Bu Tini', universityId: 'ui', categories: ['炸物 Gorengan', 'Indomie 煮面'], status: 'contacted', lat: -6.359, lng: 106.82799 },
  { id: 'w004', name: 'Depot Bu Marwati', universityId: 'ui', categories: ['烤串 Sate'], status: 'target', lat: -6.36114, lng: 106.82417 },
  { id: 'w005', name: 'Depot Pak Haji', universityId: 'ui', categories: ['Indomie 煮面', '烤串 Sate'], status: 'target', lat: -6.36514, lng: 106.82708 },
  { id: 'w006', name: 'Kios Bang Rizal', universityId: 'ui', categories: ['烤串 Sate'], status: 'contacted', lat: -6.35896, lng: 106.82908 },
  { id: 'w007', name: 'Depot Cahaya', universityId: 'ui', categories: ['Indomie 煮面', 'Warteg 家常菜'], status: 'target', lat: -6.35975, lng: 106.8247 },
  { id: 'w008', name: 'Depot Barokah', universityId: 'ui', categories: ['炒饭 Nasi Goreng', '粥品'], status: 'signed', lat: -6.363, lng: 106.83094 },
  { id: 'w009', name: 'Warteg Bu Rukiyah Cabang', universityId: 'ui', categories: ['炸物 Gorengan', '椰浆饭 Nasi Uduk', '零食'], status: 'target', lat: -6.36577, lng: 106.82304 },
  { id: 'w010', name: 'Toko Kelontong Teratai', universityId: 'ui', categories: ['炸物 Gorengan'], status: 'target', lat: -6.36498, lng: 106.82591 },
  { id: 'w011', name: 'Warteg Bu Marwati', universityId: 'ui', categories: ['Nasi Padang', '果汁 Jus'], status: 'target', lat: -6.35911, lng: 106.82886 },
  { id: 'w012', name: 'Depot Mbak Nia', universityId: 'ui', categories: ['Nasi Padang', '零食', '冰茶'], status: 'target', lat: -6.36478, lng: 106.8299 },
  { id: 'w013', name: 'Kios Bu Lestari Cabang', universityId: 'ui', categories: ['Nasi Padang', '冰茶'], status: 'target', lat: -6.3617, lng: 106.82496 },
  { id: 'w014', name: 'Kedai Bu Endang', universityId: 'ui', categories: ['烤串 Sate', '炒饭 Nasi Goreng', '零食'], status: 'target', lat: -6.36325, lng: 106.82183 },
  { id: 'w015', name: 'Depot Bahagia Cabang', universityId: 'ui', categories: ['炒饭 Nasi Goreng', 'Indomie 煮面', '炸物 Gorengan'], status: 'negotiating', lat: -6.36673, lng: 106.82806 },
  { id: 'w016', name: 'Warung Kopi Bu Tini', universityId: 'ui', categories: ['零食', '粥品', 'Nasi Padang'], status: 'target', lat: -6.36194, lng: 106.82603 },
  { id: 'w017', name: 'Toko Kelontong Bahagia', universityId: 'ui', categories: ['零食', '冰茶'], status: 'contacted', lat: -6.36559, lng: 106.82912 },
  { id: 'w018', name: 'Kedai Kamboja', universityId: 'ui', categories: ['零食', 'Nasi Padang'], status: 'target', lat: -6.36051, lng: 106.82413 },
  { id: 'w019', name: 'Angkringan Bu Yuni', universityId: 'ui', categories: ['粥品'], status: 'negotiating', lat: -6.36001, lng: 106.82672 },
  { id: 'w020', name: 'Warung Bu Ani', universityId: 'ui', categories: ['Nasi Padang'], status: 'contacted', lat: -6.36524, lng: 106.82235 },
  { id: 'w021', name: 'Warung Bu Painem', universityId: 'ui', categories: ['粥品', '咖啡'], status: 'contacted', lat: -6.36198, lng: 106.8283 },
  { id: 'w022', name: 'Depot Pak Teguh', universityId: 'ui', categories: ['冰茶', '咖啡'], status: 'target', lat: -6.3598, lng: 106.82923 },
  { id: 'w023', name: 'Kedai Bang Jago', universityId: 'ui', categories: ['烤串 Sate'], status: 'target', lat: -6.3634, lng: 106.82282 },
  { id: 'w024', name: 'Depot Bang Rizal', universityId: 'ui', categories: ['果汁 Jus'], status: 'contacted', lat: -6.3661, lng: 106.82607 },
  { id: 'w025', name: 'Angkringan Bu Dewi', universityId: 'ui', categories: ['炒饭 Nasi Goreng'], status: 'contacted', lat: -6.36274, lng: 106.82856 },
  { id: 'w026', name: 'Kios Bu Dewi', universityId: 'ui', categories: ['零食', '烤串 Sate', '咖啡'], status: 'target', lat: -6.36293, lng: 106.82449 },
  { id: 'w027', name: 'Warkop Bu Lestari', universityId: 'ui', categories: ['粥品', '炸物 Gorengan'], status: 'target', lat: -6.3627, lng: 106.82451 },
  { id: 'w028', name: 'Warung Kopi Bu Yati Cabang', universityId: 'ui', categories: ['咖啡', 'Warteg 家常菜'], status: 'signed', lat: -6.36043, lng: 106.82301 },
  { id: 'w029', name: 'Warung Bu Rukiyah', universityId: 'gunadarma', categories: ['炸物 Gorengan', '烤串 Sate', '果汁 Jus'], status: 'target', lat: -6.36176, lng: 106.84557 },
  { id: 'w030', name: 'Angkringan Bu Wulan', universityId: 'gunadarma', categories: ['炒饭 Nasi Goreng'], status: 'target', lat: -6.35322, lng: 106.83999 },
  { id: 'w031', name: 'Warteg Bu Dewi', universityId: 'gunadarma', categories: ['Indomie 煮面', '冰茶', '烤串 Sate'], status: 'target', lat: -6.35325, lng: 106.84303 },
  { id: 'w032', name: 'Warung Bu Wahyu', universityId: 'gunadarma', categories: ['Nasi Padang', '粥品'], status: 'target', lat: -6.35415, lng: 106.84365 },
  { id: 'w033', name: 'Kedai Mbak Sinta Cabang', universityId: 'gunadarma', categories: ['零食'], status: 'target', lat: -6.35717, lng: 106.84584 },
  { id: 'w034', name: 'Warung Pak Eko', universityId: 'gunadarma', categories: ['椰浆饭 Nasi Uduk', 'Warteg 家常菜'], status: 'target', lat: -6.36033, lng: 106.84373 },
  { id: 'w035', name: 'Warkop Pak Agus', universityId: 'gunadarma', categories: ['零食', '果汁 Jus', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.35497, lng: 106.84384 },
  { id: 'w036', name: 'Warteg Mbak Rina', universityId: 'gunadarma', categories: ['零食', '椰浆饭 Nasi Uduk', 'Indomie 煮面'], status: 'target', lat: -6.36015, lng: 106.84289 },
  { id: 'w037', name: 'Warung Kopi Bu Lasmi II', universityId: 'gunadarma', categories: ['果汁 Jus', '粥品'], status: 'target', lat: -6.3602, lng: 106.84302 },
  { id: 'w038', name: 'Kios Makmur Cabang', universityId: 'gunadarma', categories: ['炒饭 Nasi Goreng', 'Nasi Padang'], status: 'target', lat: -6.35489, lng: 106.83947 },
  { id: 'w039', name: 'Kedai Bang Rizal', universityId: 'gunadarma', categories: ['Indomie 煮面', '椰浆饭 Nasi Uduk', '零食'], status: 'target', lat: -6.35766, lng: 106.84605 },
  { id: 'w040', name: 'Warung Kopi Bu Tini Cabang', universityId: 'gunadarma', categories: ['Warteg 家常菜', 'Indomie 煮面'], status: 'target', lat: -6.35398, lng: 106.84496 },
  { id: 'w041', name: 'Warung Pak Herman', universityId: 'gunadarma', categories: ['粥品', '果汁 Jus'], status: 'contacted', lat: -6.35996, lng: 106.84203 },
  { id: 'w042', name: 'Kios Bang Ilham', universityId: 'gunadarma', categories: ['粥品', '咖啡'], status: 'target', lat: -6.36119, lng: 106.84055 },
  { id: 'w043', name: 'Depot Pak Bambang', universityId: 'gunadarma', categories: ['Warteg 家常菜', 'Nasi Padang'], status: 'target', lat: -6.35732, lng: 106.8409 },
  { id: 'w044', name: 'Kedai Pak Teguh', universityId: 'gunadarma', categories: ['粥品', '零食'], status: 'target', lat: -6.3558, lng: 106.83775 },
  { id: 'w045', name: 'Warteg Kamboja', universityId: 'gunadarma', categories: ['椰浆饭 Nasi Uduk', '零食'], status: 'target', lat: -6.35619, lng: 106.84439 },
  { id: 'w046', name: 'Toko Kelontong Bu Ratna', universityId: 'gunadarma', categories: ['零食', '炒饭 Nasi Goreng', '炸物 Gorengan'], status: 'target', lat: -6.35706, lng: 106.84093 },
  { id: 'w047', name: 'Depot Bu Ratna', universityId: 'gunadarma', categories: ['冰茶', '咖啡', '果汁 Jus'], status: 'target', lat: -6.35857, lng: 106.84193 },
  { id: 'w048', name: 'Warkop Berkah', universityId: 'gunadarma', categories: ['炒饭 Nasi Goreng', '冰茶', '零食'], status: 'target', lat: -6.35833, lng: 106.84042 },
  { id: 'w049', name: 'Warteg Bang Fajar', universityId: 'gunadarma', categories: ['零食'], status: 'negotiating', lat: -6.36223, lng: 106.847 },
  { id: 'w050', name: 'Angkringan Pak Haji', universityId: 'gunadarma', categories: ['咖啡', '椰浆饭 Nasi Uduk'], status: 'negotiating', lat: -6.36063, lng: 106.84192 },
  { id: 'w051', name: 'Kedai Melati', universityId: 'gunadarma', categories: ['果汁 Jus', 'Nasi Padang'], status: 'target', lat: -6.35615, lng: 106.83947 },
  { id: 'w052', name: 'Toko Kelontong Sederhana II', universityId: 'gunadarma', categories: ['Warteg 家常菜'], status: 'target', lat: -6.35893, lng: 106.84493 },
  { id: 'w053', name: 'Kios Pak Agus', universityId: 'gunadarma', categories: ['Warteg 家常菜', '果汁 Jus', '粥品'], status: 'target', lat: -6.3614, lng: 106.84263 },
  { id: 'w054', name: 'Warteg Pak Darmawan Cabang', universityId: 'gunadarma', categories: ['Indomie 煮面', '冰茶'], status: 'target', lat: -6.3608, lng: 106.84653 },
  { id: 'w055', name: 'Depot Bu Ani II', universityId: 'pnj', categories: ['粥品', '炒饭 Nasi Goreng', '咖啡'], status: 'target', lat: -6.37097, lng: 106.82027 },
  { id: 'w056', name: 'Warung Kopi Bu Dewi', universityId: 'pnj', categories: ['炒饭 Nasi Goreng'], status: 'target', lat: -6.36975, lng: 106.82385 },
  { id: 'w057', name: 'Warteg Bu Sari', universityId: 'pnj', categories: ['炸物 Gorengan', '椰浆饭 Nasi Uduk', 'Indomie 煮面'], status: 'target', lat: -6.37437, lng: 106.82133 },
  { id: 'w058', name: 'Depot Teratai', universityId: 'pnj', categories: ['烤串 Sate', '炒饭 Nasi Goreng'], status: 'target', lat: -6.37352, lng: 106.82344 },
  { id: 'w059', name: 'Warteg Pak Bambang II', universityId: 'pnj', categories: ['Warteg 家常菜'], status: 'target', lat: -6.3712, lng: 106.82702 },
  { id: 'w060', name: 'Warteg Anggrek', universityId: 'pnj', categories: ['咖啡', '炒饭 Nasi Goreng'], status: 'target', lat: -6.37323, lng: 106.82317 },
  { id: 'w061', name: 'Kedai Bu Tini', universityId: 'pnj', categories: ['烤串 Sate', 'Nasi Padang'], status: 'target', lat: -6.37473, lng: 106.8276 },
  { id: 'w062', name: 'Warkop Pak Bambang', universityId: 'pnj', categories: ['Indomie 煮面', '炸物 Gorengan'], status: 'target', lat: -6.3677, lng: 106.82354 },
  { id: 'w063', name: 'Warkop Pak Slamet', universityId: 'pnj', categories: ['炸物 Gorengan', '果汁 Jus'], status: 'target', lat: -6.37314, lng: 106.82161 },
  { id: 'w064', name: 'Depot Harapan', universityId: 'pnj', categories: ['冰茶', 'Warteg 家常菜'], status: 'target', lat: -6.37446, lng: 106.82022 },
  { id: 'w065', name: 'Warkop Pak Teguh', universityId: 'pnj', categories: ['炸物 Gorengan'], status: 'target', lat: -6.37391, lng: 106.82645 },
  { id: 'w066', name: 'Angkringan Pak Teguh', universityId: 'pnj', categories: ['果汁 Jus'], status: 'target', lat: -6.37147, lng: 106.82276 },
  { id: 'w067', name: 'Depot Bu Yati', universityId: 'pnj', categories: ['Indomie 煮面', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.37223, lng: 106.82421 },
  { id: 'w068', name: 'Warung Bang Jago', universityId: 'pnj', categories: ['冰茶'], status: 'target', lat: -6.37289, lng: 106.81969 },
  { id: 'w069', name: 'Kedai Pak Slamet', universityId: 'pnj', categories: ['烤串 Sate', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.37114, lng: 106.82401 },
  { id: 'w070', name: 'Kedai Pak Joko', universityId: 'pnj', categories: ['零食'], status: 'negotiating', lat: -6.36957, lng: 106.82605 },
  { id: 'w071', name: 'Depot Bang Fajar', universityId: 'pnj', categories: ['Nasi Padang', '零食'], status: 'target', lat: -6.36779, lng: 106.82062 },
  { id: 'w072', name: 'Depot Bu Ani', universityId: 'pnj', categories: ['粥品'], status: 'target', lat: -6.37164, lng: 106.82729 },
  { id: 'w073', name: 'Kios Bang Ilham II', universityId: 'pnj', categories: ['炸物 Gorengan', '零食'], status: 'negotiating', lat: -6.37228, lng: 106.82171 },
  { id: 'w074', name: 'Warung Kopi Bang Jago', universityId: 'pnj', categories: ['椰浆饭 Nasi Uduk', '炸物 Gorengan', '粥品'], status: 'target', lat: -6.37505, lng: 106.82318 },
  { id: 'w075', name: 'Kios Pak Bambang', universityId: 'pnj', categories: ['Nasi Padang', '果汁 Jus'], status: 'target', lat: -6.37018, lng: 106.8255 },
  { id: 'w076', name: 'Angkringan Bahagia', universityId: 'pnj', categories: ['果汁 Jus', '冰茶', '粥品'], status: 'contacted', lat: -6.36794, lng: 106.82361 },
  { id: 'w077', name: 'Warung Bang Udin', universityId: 'pnj', categories: ['椰浆饭 Nasi Uduk', 'Indomie 煮面'], status: 'target', lat: -6.37347, lng: 106.82665 },
  { id: 'w078', name: 'Angkringan Cahaya', universityId: 'pnj', categories: ['Nasi Padang'], status: 'target', lat: -6.37487, lng: 106.82519 },
  { id: 'w079', name: 'Toko Kelontong Pak Darmawan', universityId: 'unj', categories: ['Indomie 煮面'], status: 'target', lat: -6.19595, lng: 106.88334 },
  { id: 'w080', name: 'Kedai Mawar', universityId: 'unj', categories: ['炒饭 Nasi Goreng', '粥品', '炸物 Gorengan'], status: 'target', lat: -6.19115, lng: 106.87742 },
  { id: 'w081', name: 'Warteg Seroja', universityId: 'unj', categories: ['果汁 Jus', '烤串 Sate', '粥品'], status: 'contacted', lat: -6.19367, lng: 106.88418 },
  { id: 'w082', name: 'Warung Kopi Sentosa', universityId: 'unj', categories: ['冰茶', 'Warteg 家常菜', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.19404, lng: 106.88137 },
  { id: 'w083', name: 'Warung Kopi Flamboyan', universityId: 'unj', categories: ['炸物 Gorengan', '炒饭 Nasi Goreng', '粥品'], status: 'target', lat: -6.19533, lng: 106.87794 },
  { id: 'w084', name: 'Warkop Kamboja', universityId: 'unj', categories: ['Warteg 家常菜', '炒饭 Nasi Goreng', 'Indomie 煮面'], status: 'contacted', lat: -6.1914, lng: 106.88475 },
  { id: 'w085', name: 'Warkop Bang Rizal', universityId: 'unj', categories: ['烤串 Sate', '炒饭 Nasi Goreng'], status: 'target', lat: -6.19229, lng: 106.87777 },
  { id: 'w086', name: 'Warkop Pak Darmawan', universityId: 'unj', categories: ['咖啡', '零食'], status: 'target', lat: -6.19695, lng: 106.87939 },
  { id: 'w087', name: 'Kedai Bang Aldi II', universityId: 'unj', categories: ['炸物 Gorengan'], status: 'target', lat: -6.19084, lng: 106.88334 },
  { id: 'w088', name: 'Depot Bu Tini', universityId: 'unj', categories: ['冰茶', '咖啡'], status: 'target', lat: -6.18931, lng: 106.88496 },
  { id: 'w089', name: 'Angkringan Bu Siti', universityId: 'unj', categories: ['炒饭 Nasi Goreng', 'Warteg 家常菜'], status: 'target', lat: -6.19306, lng: 106.87969 },
  { id: 'w090', name: 'Warkop Bu Yati', universityId: 'unj', categories: ['粥品', '零食'], status: 'target', lat: -6.19318, lng: 106.88522 },
  { id: 'w091', name: 'Kedai Bu Wulan', universityId: 'unj', categories: ['咖啡', '粥品'], status: 'contacted', lat: -6.19225, lng: 106.88029 },
  { id: 'w092', name: 'Warung Kopi Jaya', universityId: 'unj', categories: ['Indomie 煮面', '炸物 Gorengan'], status: 'target', lat: -6.19316, lng: 106.88084 },
  { id: 'w093', name: 'Kios Mbak Nia II', universityId: 'unj', categories: ['粥品', '零食'], status: 'target', lat: -6.19498, lng: 106.88468 },
  { id: 'w094', name: 'Kios Pak Haji II', universityId: 'unj', categories: ['烤串 Sate'], status: 'target', lat: -6.19208, lng: 106.87866 },
  { id: 'w095', name: 'Warung Cahaya', universityId: 'unj', categories: ['零食', '炒饭 Nasi Goreng', '咖啡'], status: 'target', lat: -6.19483, lng: 106.87928 },
  { id: 'w096', name: 'Depot Mbak Sinta II', universityId: 'unj', categories: ['Warteg 家常菜', '烤串 Sate'], status: 'target', lat: -6.19305, lng: 106.88555 },
  { id: 'w097', name: 'Warung Pak Slamet', universityId: 'unj', categories: ['炒饭 Nasi Goreng', '烤串 Sate', 'Nasi Padang'], status: 'target', lat: -6.19311, lng: 106.88048 },
  { id: 'w098', name: 'Warung Kopi Berkah Cabang', universityId: 'unj', categories: ['粥品'], status: 'target', lat: -6.19543, lng: 106.8838 },
  { id: 'w099', name: 'Angkringan Bu Wahyu', universityId: 'unj', categories: ['粥品', 'Indomie 煮面'], status: 'target', lat: -6.19418, lng: 106.88574 },
  { id: 'w100', name: 'Depot Mbak Ayu', universityId: 'unj', categories: ['冰茶', '零食', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.19761, lng: 106.87892 },
  { id: 'w101', name: 'Toko Kelontong Bu Dewi', universityId: 'unj', categories: ['果汁 Jus', '冰茶'], status: 'target', lat: -6.19598, lng: 106.88381 },
  { id: 'w102', name: 'Warung Bang Rizal', universityId: 'unj', categories: ['烤串 Sate', 'Nasi Padang'], status: 'target', lat: -6.18902, lng: 106.88535 },
  { id: 'w103', name: 'Kios Mawar', universityId: 'unj', categories: ['椰浆饭 Nasi Uduk'], status: 'target', lat: -6.19454, lng: 106.87871 },
  { id: 'w104', name: 'Kios Bang Fajar', universityId: 'binus', categories: ['咖啡', '粥品'], status: 'target', lat: -6.20425, lng: 106.78126 },
  { id: 'w105', name: 'Toko Kelontong Mbak Nia', universityId: 'binus', categories: ['冰茶'], status: 'contacted', lat: -6.2031, lng: 106.77905 },
  { id: 'w106', name: 'Warung Kopi Bu Yuni', universityId: 'binus', categories: ['咖啡', '烤串 Sate', '粥品'], status: 'target', lat: -6.19816, lng: 106.78344 },
  { id: 'w107', name: 'Kios Bu Rukiyah', universityId: 'binus', categories: ['粥品', '烤串 Sate'], status: 'target', lat: -6.19974, lng: 106.78016 },
  { id: 'w108', name: 'Warteg Mawar', universityId: 'binus', categories: ['Nasi Padang', '冰茶', '炒饭 Nasi Goreng'], status: 'target', lat: -6.20188, lng: 106.77887 },
  { id: 'w109', name: 'Kedai Bang Dedi', universityId: 'binus', categories: ['炒饭 Nasi Goreng', '烤串 Sate', '果汁 Jus'], status: 'target', lat: -6.20554, lng: 106.78071 },
  { id: 'w110', name: 'Angkringan Mbak Sinta', universityId: 'binus', categories: ['烤串 Sate', '冰茶'], status: 'target', lat: -6.2036, lng: 106.78371 },
  { id: 'w111', name: 'Kios Pak Joko', universityId: 'binus', categories: ['咖啡'], status: 'contacted', lat: -6.19875, lng: 106.78334 },
  { id: 'w112', name: 'Kios Pak Darmawan', universityId: 'binus', categories: ['果汁 Jus', '粥品'], status: 'target', lat: -6.20388, lng: 106.7817 },
  { id: 'w113', name: 'Angkringan Bu Painem', universityId: 'binus', categories: ['Indomie 煮面', 'Warteg 家常菜'], status: 'target', lat: -6.20014, lng: 106.78443 },
  { id: 'w114', name: 'Warung Jaya', universityId: 'binus', categories: ['冰茶'], status: 'target', lat: -6.20232, lng: 106.78056 },
  { id: 'w115', name: 'Kedai Bu Rukiyah', universityId: 'binus', categories: ['烤串 Sate', '果汁 Jus', '粥品'], status: 'target', lat: -6.19863, lng: 106.78148 },
  { id: 'w116', name: 'Warung Kopi Berkah', universityId: 'binus', categories: ['Nasi Padang', '咖啡', '炒饭 Nasi Goreng'], status: 'target', lat: -6.20075, lng: 106.77961 },
  { id: 'w117', name: 'Warteg Mbak Ayu', universityId: 'binus', categories: ['果汁 Jus', 'Indomie 煮面', '炸物 Gorengan'], status: 'target', lat: -6.20012, lng: 106.78117 },
  { id: 'w118', name: 'Warung Bahagia II', universityId: 'binus', categories: ['冰茶'], status: 'target', lat: -6.20371, lng: 106.78232 },
  { id: 'w119', name: 'Warteg Pak Bambang', universityId: 'binus', categories: ['咖啡'], status: 'target', lat: -6.20088, lng: 106.78056 },
  { id: 'w120', name: 'Kios Sejahtera', universityId: 'binus', categories: ['Indomie 煮面', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.19977, lng: 106.78171 },
  { id: 'w121', name: 'Angkringan Pak Darmawan', universityId: 'binus', categories: ['Nasi Padang'], status: 'target', lat: -6.19866, lng: 106.7801 },
  { id: 'w122', name: 'Toko Kelontong Bu Lestari', universityId: 'binus', categories: ['果汁 Jus', '烤串 Sate'], status: 'target', lat: -6.20078, lng: 106.78282 },
  { id: 'w123', name: 'Depot Bu Wulan', universityId: 'binus', categories: ['烤串 Sate'], status: 'target', lat: -6.20525, lng: 106.78028 },
  { id: 'w124', name: 'Toko Kelontong Melati Cabang', universityId: 'binus', categories: ['烤串 Sate', '冰茶', '果汁 Jus'], status: 'target', lat: -6.20345, lng: 106.78432 },
  { id: 'w125', name: 'Angkringan Bu Lasmi', universityId: 'binus', categories: ['粥品', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.20018, lng: 106.78277 },
  { id: 'w126', name: 'Angkringan Cahaya Cabang', universityId: 'binus', categories: ['炸物 Gorengan'], status: 'target', lat: -6.20265, lng: 106.7806 },
  { id: 'w127', name: 'Toko Kelontong Bu Kartini', universityId: 'binus', categories: ['咖啡', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.20394, lng: 106.78288 },
  { id: 'w128', name: 'Warung Kenanga', universityId: 'binus', categories: ['炸物 Gorengan'], status: 'target', lat: -6.20396, lng: 106.78174 },
  { id: 'w129', name: 'Depot Bu Kartini', universityId: 'trisakti', categories: ['Warteg 家常菜'], status: 'contacted', lat: -6.16285, lng: 106.79001 },
  { id: 'w130', name: 'Kedai Anggrek', universityId: 'trisakti', categories: ['冰茶', '果汁 Jus'], status: 'target', lat: -6.16855, lng: 106.79319 },
  { id: 'w131', name: 'Angkringan Bu Lasmi II', universityId: 'trisakti', categories: ['Nasi Padang', 'Indomie 煮面'], status: 'target', lat: -6.17043, lng: 106.78678 },
  { id: 'w132', name: 'Kios Pak Eko', universityId: 'trisakti', categories: ['Indomie 煮面'], status: 'target', lat: -6.16596, lng: 106.79182 },
  { id: 'w133', name: 'Warkop Maju Bersama', universityId: 'trisakti', categories: ['炸物 Gorengan', 'Nasi Padang', '零食'], status: 'target', lat: -6.17119, lng: 106.79126 },
  { id: 'w134', name: 'Warung Pak Supri', universityId: 'trisakti', categories: ['Warteg 家常菜'], status: 'target', lat: -6.16807, lng: 106.79099 },
  { id: 'w135', name: 'Warteg Berkah', universityId: 'trisakti', categories: ['Nasi Padang', 'Warteg 家常菜', '粥品'], status: 'target', lat: -6.17174, lng: 106.79158 },
  { id: 'w136', name: 'Kedai Pak Budi', universityId: 'trisakti', categories: ['Indomie 煮面', '果汁 Jus'], status: 'target', lat: -6.16655, lng: 106.78898 },
  { id: 'w137', name: 'Warung Bu Wahyu Cabang', universityId: 'trisakti', categories: ['炒饭 Nasi Goreng'], status: 'target', lat: -6.16543, lng: 106.78814 },
  { id: 'w138', name: 'Warung Makmur', universityId: 'trisakti', categories: ['咖啡', 'Nasi Padang'], status: 'target', lat: -6.16478, lng: 106.79072 },
  { id: 'w139', name: 'Kedai Bang Ilham Cabang', universityId: 'trisakti', categories: ['炒饭 Nasi Goreng'], status: 'target', lat: -6.16833, lng: 106.78967 },
  { id: 'w140', name: 'Warung Kopi Anggrek II', universityId: 'trisakti', categories: ['粥品', 'Indomie 煮面', '果汁 Jus'], status: 'target', lat: -6.16627, lng: 106.79018 },
  { id: 'w141', name: 'Warteg Bang Dedi', universityId: 'trisakti', categories: ['Nasi Padang'], status: 'target', lat: -6.16703, lng: 106.79244 },
  { id: 'w142', name: 'Depot Bang Dedi', universityId: 'trisakti', categories: ['Warteg 家常菜'], status: 'target', lat: -6.16513, lng: 106.79305 },
  { id: 'w143', name: 'Warung Sentosa', universityId: 'trisakti', categories: ['咖啡', 'Indomie 煮面'], status: 'target', lat: -6.17025, lng: 106.79204 },
  { id: 'w144', name: 'Kios Bu Sari', universityId: 'trisakti', categories: ['粥品'], status: 'target', lat: -6.17038, lng: 106.78984 },
  { id: 'w145', name: 'Warteg Bu Yati', universityId: 'trisakti', categories: ['烤串 Sate'], status: 'target', lat: -6.16522, lng: 106.78966 },
  { id: 'w146', name: 'Warung Kopi Bang Dedi Cabang', universityId: 'trisakti', categories: ['果汁 Jus', '炸物 Gorengan', '炒饭 Nasi Goreng'], status: 'target', lat: -6.16969, lng: 106.79229 },
  { id: 'w147', name: 'Warkop Bu Lasmi', universityId: 'trisakti', categories: ['Warteg 家常菜', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.1668, lng: 106.79237 },
  { id: 'w148', name: 'Depot Bang Jago', universityId: 'trisakti', categories: ['零食'], status: 'target', lat: -6.16878, lng: 106.78872 },
  { id: 'w149', name: 'Toko Kelontong Bu Yuni', universityId: 'trisakti', categories: ['炒饭 Nasi Goreng', '炸物 Gorengan', 'Nasi Padang'], status: 'target', lat: -6.1649, lng: 106.79017 },
  { id: 'w150', name: 'Warung Kopi Harapan', universityId: 'trisakti', categories: ['Indomie 煮面', '零食', 'Warteg 家常菜'], status: 'target', lat: -6.16633, lng: 106.78947 },
  { id: 'w151', name: 'Kedai Bu Lasmi', universityId: 'trisakti', categories: ['冰茶'], status: 'target', lat: -6.16378, lng: 106.78739 },
  { id: 'w152', name: 'Angkringan Bang Rizal', universityId: 'trisakti', categories: ['粥品'], status: 'target', lat: -6.16637, lng: 106.78858 },
  { id: 'w153', name: 'Warung Kopi Bu Kartini', universityId: 'atmajaya', categories: ['粥品', '炒饭 Nasi Goreng'], status: 'target', lat: -6.21939, lng: 106.81925 },
  { id: 'w154', name: 'Kedai Bu Painem', universityId: 'atmajaya', categories: ['冰茶'], status: 'target', lat: -6.22081, lng: 106.82078 },
  { id: 'w155', name: 'Warkop Bu Wulan', universityId: 'atmajaya', categories: ['果汁 Jus'], status: 'target', lat: -6.21754, lng: 106.82174 },
  { id: 'w156', name: 'Kios Mbak Rina', universityId: 'atmajaya', categories: ['椰浆饭 Nasi Uduk', 'Nasi Padang'], status: 'target', lat: -6.21716, lng: 106.82156 },
  { id: 'w157', name: 'Angkringan Barokah', universityId: 'atmajaya', categories: ['果汁 Jus'], status: 'target', lat: -6.21628, lng: 106.8214 },
  { id: 'w158', name: 'Depot Bu Endang', universityId: 'atmajaya', categories: ['Indomie 煮面', '粥品', '烤串 Sate'], status: 'target', lat: -6.2204, lng: 106.82014 },
  { id: 'w159', name: 'Kedai Mbak Nia', universityId: 'atmajaya', categories: ['椰浆饭 Nasi Uduk', '炒饭 Nasi Goreng'], status: 'target', lat: -6.21856, lng: 106.82223 },
  { id: 'w160', name: 'Warung Kopi Pak Supri', universityId: 'atmajaya', categories: ['冰茶'], status: 'target', lat: -6.2168, lng: 106.82325 },
  { id: 'w161', name: 'Warung Kopi Bu Wulan II', universityId: 'atmajaya', categories: ['零食', '粥品'], status: 'target', lat: -6.21548, lng: 106.82179 },
  { id: 'w162', name: 'Warteg Pak Slamet', universityId: 'atmajaya', categories: ['Nasi Padang', 'Indomie 煮面'], status: 'target', lat: -6.21913, lng: 106.82831 },
  { id: 'w163', name: 'Angkringan Anggrek Cabang', universityId: 'atmajaya', categories: ['Nasi Padang', '果汁 Jus'], status: 'target', lat: -6.21788, lng: 106.82412 },
  { id: 'w164', name: 'Toko Kelontong Mbak Ayu', universityId: 'atmajaya', categories: ['Indomie 煮面'], status: 'target', lat: -6.21827, lng: 106.8198 },
  { id: 'w165', name: 'Toko Kelontong Bahagia Cabang', universityId: 'atmajaya', categories: ['烤串 Sate'], status: 'target', lat: -6.2178, lng: 106.82676 },
  { id: 'w166', name: 'Warteg Barokah', universityId: 'atmajaya', categories: ['Nasi Padang', '烤串 Sate'], status: 'target', lat: -6.22099, lng: 106.82641 },
  { id: 'w167', name: 'Warung Harapan', universityId: 'atmajaya', categories: ['烤串 Sate', '粥品'], status: 'contacted', lat: -6.21747, lng: 106.82517 },
  { id: 'w168', name: 'Warung Bu Lestari', universityId: 'atmajaya', categories: ['Indomie 煮面'], status: 'target', lat: -6.21728, lng: 106.82194 },
  { id: 'w169', name: 'Kios Bu Tini', universityId: 'atmajaya', categories: ['炒饭 Nasi Goreng'], status: 'target', lat: -6.2208, lng: 106.82087 },
  { id: 'w170', name: 'Kios Bu Kartini Cabang', universityId: 'atmajaya', categories: ['咖啡'], status: 'target', lat: -6.21756, lng: 106.82219 },
  { id: 'w171', name: 'Toko Kelontong Kamboja', universityId: 'atmajaya', categories: ['Indomie 煮面', 'Nasi Padang'], status: 'target', lat: -6.2222, lng: 106.81843 },
  { id: 'w172', name: 'Warung Kopi Bang Udin', universityId: 'atmajaya', categories: ['烤串 Sate', 'Nasi Padang'], status: 'target', lat: -6.21978, lng: 106.82284 },
  { id: 'w173', name: 'Angkringan Bu Rukiyah', universityId: 'atmajaya', categories: ['粥品'], status: 'target', lat: -6.22186, lng: 106.81998 },
  { id: 'w174', name: 'Warteg Pak Budi', universityId: 'atmajaya', categories: ['Indomie 煮面', '咖啡'], status: 'target', lat: -6.22359, lng: 106.82688 },
  { id: 'w175', name: 'Warteg Bu Painem', universityId: 'atmajaya', categories: ['椰浆饭 Nasi Uduk', 'Nasi Padang'], status: 'target', lat: -6.21828, lng: 106.82527 },
  { id: 'w176', name: 'Kios Pak Supri', universityId: 'uin', categories: ['椰浆饭 Nasi Uduk', '冰茶', 'Warteg 家常菜'], status: 'target', lat: -6.30666, lng: 106.75178 },
  { id: 'w177', name: 'Warung Pak Haji', universityId: 'uin', categories: ['Warteg 家常菜', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.30738, lng: 106.75569 },
  { id: 'w178', name: 'Warteg Bu Yuni', universityId: 'uin', categories: ['炸物 Gorengan', '冰茶'], status: 'target', lat: -6.30616, lng: 106.75706 },
  { id: 'w179', name: 'Depot Pak Herman II', universityId: 'uin', categories: ['炒饭 Nasi Goreng', '烤串 Sate'], status: 'target', lat: -6.3062, lng: 106.75772 },
  { id: 'w180', name: 'Warteg Pak Joko', universityId: 'uin', categories: ['Warteg 家常菜'], status: 'target', lat: -6.30508, lng: 106.75571 },
  { id: 'w181', name: 'Warung Kopi Bang Ilham', universityId: 'uin', categories: ['炒饭 Nasi Goreng'], status: 'target', lat: -6.30848, lng: 106.75468 },
  { id: 'w182', name: 'Warung Kopi Bu Siti', universityId: 'uin', categories: ['Nasi Padang'], status: 'target', lat: -6.30699, lng: 106.75733 },
  { id: 'w183', name: 'Kedai Pak Darmawan', universityId: 'uin', categories: ['粥品'], status: 'target', lat: -6.30358, lng: 106.75998 },
  { id: 'w184', name: 'Kios Bu Siti', universityId: 'uin', categories: ['Warteg 家常菜', 'Nasi Padang'], status: 'target', lat: -6.30621, lng: 106.75497 },
  { id: 'w185', name: 'Kios Sentosa', universityId: 'uin', categories: ['零食'], status: 'contacted', lat: -6.30561, lng: 106.75469 },
  { id: 'w186', name: 'Warkop Bu Sari', universityId: 'uin', categories: ['咖啡', '粥品', '炒饭 Nasi Goreng'], status: 'target', lat: -6.3045, lng: 106.75763 },
  { id: 'w187', name: 'Depot Berkah', universityId: 'uin', categories: ['粥品', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.30083, lng: 106.75757 },
  { id: 'w188', name: 'Warung Kopi Bu Yati', universityId: 'uin', categories: ['Nasi Padang', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.30301, lng: 106.75884 },
  { id: 'w189', name: 'Warteg Bu Ani Cabang', universityId: 'uin', categories: ['粥品', '冰茶', '炒饭 Nasi Goreng'], status: 'target', lat: -6.3068, lng: 106.75732 },
  { id: 'w190', name: 'Kedai Barokah', universityId: 'uin', categories: ['果汁 Jus', 'Nasi Padang'], status: 'target', lat: -6.30536, lng: 106.75769 },
  { id: 'w191', name: 'Warteg Teratai', universityId: 'uin', categories: ['Indomie 煮面', '炒饭 Nasi Goreng', '椰浆饭 Nasi Uduk'], status: 'target', lat: -6.3076, lng: 106.75238 },
  { id: 'w192', name: 'Warung Kopi Barokah', universityId: 'uin', categories: ['炸物 Gorengan', '烤串 Sate'], status: 'target', lat: -6.30256, lng: 106.75459 },
  { id: 'w193', name: 'Warung Kopi Pak Budi', universityId: 'uin', categories: ['零食', '炒饭 Nasi Goreng'], status: 'target', lat: -6.30763, lng: 106.7561 },
  { id: 'w194', name: 'Warteg Bu Wahyu', universityId: 'uin', categories: ['冰茶', '粥品'], status: 'target', lat: -6.30307, lng: 106.75255 },
  { id: 'w195', name: 'Toko Kelontong Bu Ani', universityId: 'uin', categories: ['炒饭 Nasi Goreng', 'Indomie 煮面', '果汁 Jus'], status: 'target', lat: -6.30519, lng: 106.75407 },
  { id: 'w196', name: 'Warung Kopi Pak Joko II', universityId: 'uin', categories: ['椰浆饭 Nasi Uduk'], status: 'target', lat: -6.30477, lng: 106.75218 },
  { id: 'w197', name: 'Angkringan Mawar', universityId: 'uin', categories: ['Warteg 家常菜'], status: 'target', lat: -6.30554, lng: 106.75544 },
  { id: 'w198', name: 'Warkop Jaya', universityId: 'uin', categories: ['冰茶', '粥品'], status: 'target', lat: -6.30302, lng: 106.754 },
  { id: 'w199', name: 'Toko Kelontong Pak Slamet', universityId: 'uin', categories: ['冰茶'], status: 'target', lat: -6.30115, lng: 106.75466 },
  { id: 'w200', name: 'Warteg Bu Ratna', universityId: 'pancasila', categories: ['Nasi Padang'], status: 'target', lat: -6.33293, lng: 106.83699 },
  { id: 'w201', name: 'Kedai Bahagia Cabang', universityId: 'pancasila', categories: ['Nasi Padang'], status: 'target', lat: -6.3345, lng: 106.83015 },
  { id: 'w202', name: 'Warkop Pak Budi', universityId: 'pancasila', categories: ['零食', '烤串 Sate'], status: 'target', lat: -6.33679, lng: 106.83083 },
  { id: 'w203', name: 'Warkop Bang Aldi', universityId: 'pancasila', categories: ['Warteg 家常菜'], status: 'target', lat: -6.33726, lng: 106.8353 },
  { id: 'w204', name: 'Warkop Harapan', universityId: 'pancasila', categories: ['咖啡', '果汁 Jus', '烤串 Sate'], status: 'target', lat: -6.33521, lng: 106.83398 },
  { id: 'w205', name: 'Warung Kopi Sentosa Cabang', universityId: 'pancasila', categories: ['果汁 Jus'], status: 'target', lat: -6.33887, lng: 106.83017 },
  { id: 'w206', name: 'Angkringan Anggrek', universityId: 'pancasila', categories: ['烤串 Sate'], status: 'target', lat: -6.34074, lng: 106.83044 },
  { id: 'w207', name: 'Warkop Bahagia', universityId: 'pancasila', categories: ['炒饭 Nasi Goreng', 'Nasi Padang'], status: 'target', lat: -6.33528, lng: 106.83462 },
  { id: 'w208', name: 'Warung Maju Bersama', universityId: 'pancasila', categories: ['炒饭 Nasi Goreng'], status: 'target', lat: -6.33709, lng: 106.83343 },
  { id: 'w209', name: 'Kedai Bu Ani', universityId: 'pancasila', categories: ['粥品', '炒饭 Nasi Goreng'], status: 'target', lat: -6.33559, lng: 106.83302 },
  { id: 'w210', name: 'Warkop Pak Haji', universityId: 'pancasila', categories: ['Indomie 煮面'], status: 'target', lat: -6.33829, lng: 106.83039 },
  { id: 'w211', name: 'Warkop Cempaka', universityId: 'pancasila', categories: ['粥品', '炒饭 Nasi Goreng'], status: 'target', lat: -6.33735, lng: 106.83217 },
  { id: 'w212', name: 'Toko Kelontong Sederhana', universityId: 'pancasila', categories: ['冰茶'], status: 'target', lat: -6.33904, lng: 106.83482 },
  { id: 'w213', name: 'Angkringan Bu Endang', universityId: 'pancasila', categories: ['烤串 Sate', '炒饭 Nasi Goreng'], status: 'target', lat: -6.33356, lng: 106.83613 },
  { id: 'w214', name: 'Toko Kelontong Bang Fajar II', universityId: 'pancasila', categories: ['Indomie 煮面', '粥品', '冰茶'], status: 'contacted', lat: -6.33781, lng: 106.83215 },
  { id: 'w215', name: 'Kedai Sentosa', universityId: 'pancasila', categories: ['Nasi Padang', 'Indomie 煮面'], status: 'target', lat: -6.33827, lng: 106.83331 },
  { id: 'w216', name: 'Angkringan Bu Lestari', universityId: 'pancasila', categories: ['Indomie 煮面', '零食'], status: 'target', lat: -6.3346, lng: 106.83083 },
  { id: 'w217', name: 'Warung Bu Tini', universityId: 'pancasila', categories: ['炸物 Gorengan', '零食'], status: 'target', lat: -6.33814, lng: 106.82796 },
  { id: 'w218', name: 'Warung Bu Kartini', universityId: 'pancasila', categories: ['冰茶', 'Warteg 家常菜'], status: 'target', lat: -6.33646, lng: 106.83165 },
  { id: 'w219', name: 'Depot Mbak Wati', universityId: 'pancasila', categories: ['炒饭 Nasi Goreng', 'Nasi Padang'], status: 'target', lat: -6.34146, lng: 106.83698 },
  { id: 'w220', name: 'Warung Kopi Bu Endang', universityId: 'pancasila', categories: ['炸物 Gorengan', 'Warteg 家常菜'], status: 'target', lat: -6.33298, lng: 106.83532 },
  { id: 'w221', name: 'Angkringan Seroja', universityId: 'pancasila', categories: ['零食', '粥品', 'Nasi Padang'], status: 'contacted', lat: -6.3398, lng: 106.83679 },
  { id: 'w222', name: 'Warung Bang Dedi', universityId: 'pancasila', categories: ['烤串 Sate'], status: 'target', lat: -6.33889, lng: 106.83584 },
];

/* 暴露给 main.js（file:// 直开兼容，不使用 ES Module） */
window.WARUNG_DATA = {
  status: WARUNG_STATUS,
  universities: UNIVERSITIES,
  warungs: WARUNGS
};
