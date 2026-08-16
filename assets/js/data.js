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

/* 漏斗状态字典：顺序即漏斗顺序 */
const WARUNG_STATUS = {
  target:      { key: 'target',      label: '目标点位', color: '#9C9489' },
  contacted:   { key: 'contacted',   label: '已接触',   color: '#2E6FA8' },
  negotiating: { key: 'negotiating', label: '洽谈中',   color: '#E07B2A' },
  signed:      { key: 'signed',      label: '已签约',   color: '#2F7D4E' },
  active:      { key: 'active',      label: '活跃',     color: '#34C759' }
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
  /* ---------- Universitas Indonesia (ui) ----------
   * 轨道 B 实地踩点主力校区：以「已接触 / 洽谈中」为主，
   * 含 1 家「活跃」（脉冲动画展示）与 1 家「已签约」。 */
  { id: 'w001', name: 'Warung Bu Sari',               universityId: 'ui', categories: ['Indomie 煮面', '咖啡'],   status: 'active',      lat: -6.3612, lng: 106.8245 },
  { id: 'w002', name: 'Warteg Bahari',                universityId: 'ui', categories: ['Warteg 家常菜', '冰茶'], status: 'signed',      lat: -6.3643, lng: 106.8290 },
  { id: 'w003', name: 'Kedai Kopi Keliling',          universityId: 'ui', categories: ['咖啡', '零食'],           status: 'negotiating', lat: -6.3598, lng: 106.8289 },
  { id: 'w004', name: 'Warung Nasi Padang Sederhana', universityId: 'ui', categories: ['Nasi Padang'],            status: 'negotiating', lat: -6.3650, lng: 106.8240 },
  { id: 'w005', name: 'Kantin Sehat Melati',          universityId: 'ui', categories: ['零食', '冰茶'],           status: 'contacted',   lat: -6.3619, lng: 106.8302 },

  /* ---------- Universitas Gunadarma (gunadarma) ---------- */
  { id: 'w006', name: 'Warung Makan Berkah',  universityId: 'gunadarma', categories: ['Warteg 家常菜', '炸物 Gorengan'], status: 'signed',    lat: -6.3561, lng: 106.8412 },
  { id: 'w007', name: 'Warteg Barokah',       universityId: 'gunadarma', categories: ['Warteg 家常菜'],                  status: 'contacted', lat: -6.3588, lng: 106.8443 },
  { id: 'w008', name: 'Kedai Kopi Kangen',    universityId: 'gunadarma', categories: ['咖啡', '炸物 Gorengan'],           status: 'target',    lat: -6.3555, lng: 106.8450 },
  { id: 'w009', name: 'Warung Gultik Pagi',   universityId: 'gunadarma', categories: ['Indomie 煮面'],                    status: 'target',    lat: -6.3590, lng: 106.8400 },

  /* ---------- Politeknik Negeri Jakarta (pnj) ---------- */
  { id: 'w010', name: 'Warung Nasi Uduk Ibu Tini',  universityId: 'pnj', categories: ['冰茶', '炸物 Gorengan'], status: 'contacted', lat: -6.3705, lng: 106.8220 },
  { id: 'w011', name: 'Kedai Gorengan Ceria',       universityId: 'pnj', categories: ['炸物 Gorengan'],         status: 'target',    lat: -6.3731, lng: 106.8252 },
  { id: 'w012', name: 'Warteg Sederhana Margonda',  universityId: 'pnj', categories: ['Warteg 家常菜'],         status: 'target',    lat: -6.3700, lng: 106.8260 },
  { id: 'w013', name: 'Kedai Kopi Balai',           universityId: 'pnj', categories: ['咖啡'],                  status: 'target',    lat: -6.3730, lng: 106.8210 },

  /* ---------- Universitas Negeri Jakarta (unj) ---------- */
  { id: 'w014', name: 'Warung Mie Ayam Jaya',    universityId: 'unj', categories: ['Indomie 煮面', '零食'], status: 'contacted', lat: -6.1920, lng: 106.8805 },
  { id: 'w015', name: 'Warteg Rawamangun',       universityId: 'unj', categories: ['Warteg 家常菜'],        status: 'target',    lat: -6.1948, lng: 106.8835 },
  { id: 'w016', name: 'Kedai Es Teh Segar',      universityId: 'unj', categories: ['冰茶'],                 status: 'target',    lat: -6.1918, lng: 106.8840 },
  { id: 'w017', name: 'Warung Bubur Ayam Barito', universityId: 'unj', categories: ['粥品'],                status: 'target',    lat: -6.1950, lng: 106.8795 },

  /* ---------- BINUS University (binus) ---------- */
  { id: 'w018', name: 'Warung Nasi Goreng Pakde',   universityId: 'binus', categories: ['炸物 Gorengan', '冰茶'], status: 'target', lat: -6.2005, lng: 106.7805 },
  { id: 'w019', name: 'Kedai Kopi Kemanggisan',     universityId: 'binus', categories: ['咖啡'],                  status: 'target', lat: -6.2035, lng: 106.7835 },
  { id: 'w020', name: 'Warteg Asri',                universityId: 'binus', categories: ['Warteg 家常菜'],         status: 'target', lat: -6.2002, lng: 106.7840 },
  { id: 'w021', name: 'Warung Soto Betawi H. Mamat', universityId: 'binus', categories: ['粥品', '冰茶'],         status: 'target', lat: -6.2038, lng: 106.7800 },

  /* ---------- Universitas Trisakti (trisakti) ---------- */
  { id: 'w022', name: 'Warung Tegal Makmur',    universityId: 'trisakti', categories: ['Warteg 家常菜'],         status: 'target', lat: -6.1662, lng: 106.7875 },
  { id: 'w023', name: 'Kedai Roti Bakar Malam', universityId: 'trisakti', categories: ['零食', '咖啡'],           status: 'target', lat: -6.1690, lng: 106.7908 },
  { id: 'w024', name: 'Warung Ayam Geprek Lava', universityId: 'trisakti', categories: ['炸物 Gorengan'],         status: 'target', lat: -6.1658, lng: 106.7912 },
  { id: 'w025', name: 'Es Kelapa Muda Ceria',   universityId: 'trisakti', categories: ['冰茶'],                   status: 'target', lat: -6.1692, lng: 106.7868 },

  /* ---------- Universitas Atma Jaya (atmajaya) ---------- */
  { id: 'w026', name: 'Warung Kopi Semanggi',     universityId: 'atmajaya', categories: ['咖啡', '零食'],             status: 'contacted', lat: -6.2182, lng: 106.8218 },
  { id: 'w027', name: 'Kantin Mahasiswa Ceria',   universityId: 'atmajaya', categories: ['零食', '冰茶'],             status: 'target',    lat: -6.2210, lng: 106.8250 },
  { id: 'w028', name: 'Warung Pecel Lele Lamongan', universityId: 'atmajaya', categories: ['炸物 Gorengan', '冰茶'],    status: 'target',    lat: -6.2178, lng: 106.8252 },
  { id: 'w029', name: 'Warteg Pojok Rindu',       universityId: 'atmajaya', categories: ['Warteg 家常菜'],            status: 'target',    lat: -6.2212, lng: 106.8205 },

  /* ---------- UIN Syarif Hidayatullah (uin) ---------- */
  { id: 'w030', name: 'Warung Bu Haji',           universityId: 'uin', categories: ['Warteg 家常菜', '冰茶'], status: 'target', lat: -6.3040, lng: 106.7540 },
  { id: 'w031', name: 'Kedai Nasi Kebuli Ciputat', universityId: 'uin', categories: ['Nasi Padang'],          status: 'target', lat: -6.3070, lng: 106.7570 },
  { id: 'w032', name: 'Warteg Amanah',            universityId: 'uin', categories: ['Warteg 家常菜'],         status: 'target', lat: -6.3038, lng: 106.7575 },
  { id: 'w033', name: 'Warung Martabak Manis',    universityId: 'uin', categories: ['零食'],                  status: 'target', lat: -6.3072, lng: 106.7530 },

  /* ---------- Universitas Pancasila (pancasila) ---------- */
  { id: 'w034', name: 'Warung Sedap Malam',      universityId: 'pancasila', categories: ['Indomie 煮面', '咖啡'], status: 'contacted', lat: -6.3362, lng: 106.8310 },
  { id: 'w035', name: 'Kedai Pisang Goreng Madu', universityId: 'pancasila', categories: ['炸物 Gorengan'],       status: 'target',    lat: -6.3390, lng: 106.8342 },
  { id: 'w036', name: 'Warung Sop Buah Segar',   universityId: 'pancasila', categories: ['冰茶', '零食'],         status: 'target',    lat: -6.3358, lng: 106.8345 },
  { id: 'w037', name: 'Warteg Rukun Santosa',    universityId: 'pancasila', categories: ['Warteg 家常菜'],        status: 'target',    lat: -6.3392, lng: 106.8300 },
  { id: 'w038', name: 'Warung Indomie Pojok',    universityId: 'pancasila', categories: ['Indomie 煮面'],         status: 'target',    lat: -6.3360, lng: 106.8288 }
];

/* 暴露给 main.js（file:// 直开兼容，不使用 ES Module） */
window.WARUNG_DATA = {
  status: WARUNG_STATUS,
  universities: UNIVERSITIES,
  warungs: WARUNGS
};
