/* ============================================================
 * Mitra 店主落地页逻辑（mitra.html）
 * 默认印尼语；精简三语字典（id/en/zh），localStorage 与主站共用 'warung-lang'
 * 功能：i18n 切换 + FAQ 手风琴 + WhatsApp 入驻 CTA 链接组装（复用白名单防御）
 * 兼容 file:// 直开：不使用 ES Module / fetch
 * ============================================================ */
(function () {
  'use strict';

  var DATA = window.WARUNG_DATA || {};

  /* 所有动态字段拼入 DOM 前必须转义（与主站同一防线习惯） */
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ================= 三语字典（默认印尼语，回退链：当前语言 → id → key 本身） ================= */
  var I18N = {
    id: {
      'doc.title': 'Mitra Warung Network — Warung Anda, Cuan Lebih',
      'meta.desc': 'Gabung Mitra Warung Network — tanpa aplikasi baru, tanpa biaya, cukup WhatsApp. Program mitra tahap awal untuk warung kampus.',
      'hero.eyebrow': 'Mitra Warung Network',
      'hero.title': 'Warung Anda, Cuan Lebih.',
      'hero.sub': 'Tanpa aplikasi baru. Tanpa biaya. Cukup WhatsApp.',
      'cta.wa': 'Gabung via WhatsApp',
      'benefits.title': 'Kenapa gabung?',
      'b1.title': 'Fee pajang produk merek',
      'b1.desc': 'Berkesempatan dapat penghasilan tambahan tiap bulan di luar jualan harian Anda.',
      'b2.title': 'Notifikasi order langsung ke WhatsApp',
      'b2.desc': 'Terima lebih banyak order di jam ramai, tanpa aplikasi tambahan.',
      'b3.title': 'Diskon kulakan & info barang laris',
      'b3.desc': 'Harga kulakan lebih hemat dan tahu produk apa yang paling dicari mahasiswa.',
      'steps.title': 'Cara gabung — 3 langkah',
      's1.title': 'Kirim lokasi & foto warung',
      's1.desc': 'Lewat WhatsApp — cukup share lokasi dan foto depan warung Anda.',
      's2.title': 'Tim kami verifikasi',
      's2.desc': 'Kami cek lokasi dan kesiapan warung, biasanya 1–2 hari.',
      's3.title': 'Terima tugas & penghasilan',
      's3.desc': 'Mulai terima tugas pajang produk dan order — penghasilan masuk tiap bulan.',
      'faq.title': 'Pertanyaan umum',
      'faq.q1': 'Gratis?',
      'faq.a1': 'Ya, 100% gratis. Tidak ada biaya pendaftaran maupun biaya bulanan.',
      'faq.q2': 'Perlu aplikasi?',
      'faq.a2': 'Tidak perlu. Semua berjalan lewat WhatsApp yang sudah Anda pakai sehari-hari.',
      'faq.q3': 'Bagaimana saya dibayar?',
      'faq.a3': 'Transfer via QRIS / DANA, dihitung dan dibayarkan setiap bulan.',
      'faq.q4': 'Warung saya kecil, bisa?',
      'faq.a4': 'Bisa. Selama warung Anda berada dalam radius 1 km dari kampus, Anda bisa mendaftar.',
      'honest': 'Program mitra tahap awal — jadi bagian dari gelombang pertama warung kampus.',
      'home': '← ke Warung Network'
    },
    en: {
      'doc.title': 'Warung Network Partners — Your Warung, More Profit',
      'meta.desc': 'Join Warung Network Partners — no new app, no fees, just WhatsApp. Early partner program for campus warungs.',
      'hero.eyebrow': 'Warung Network Partners',
      'hero.title': 'Your Warung, More Profit.',
      'hero.sub': 'No new app. No fees. Just WhatsApp.',
      'cta.wa': 'Join via WhatsApp',
      'benefits.title': 'Why join?',
      'b1.title': 'Brand display fees',
      'b1.desc': 'An opportunity for extra monthly income on top of your daily sales.',
      'b2.title': 'Order alerts straight to WhatsApp',
      'b2.desc': 'Take more orders at peak hours — no extra app needed.',
      'b3.title': 'Restock discounts & best-seller intel',
      'b3.desc': 'Cheaper restocking and insight into what students want most.',
      'steps.title': 'How to join — 3 steps',
      's1.title': 'Send your location & warung photo',
      's1.desc': 'Via WhatsApp — just share your location and a photo of your storefront.',
      's2.title': 'Our team verifies',
      's2.desc': 'We check your location and readiness, usually within 1–2 days.',
      's3.title': 'Receive tasks & earnings',
      's3.desc': 'Start receiving display tasks and orders — earnings paid monthly.',
      'faq.title': 'FAQ',
      'faq.q1': 'Is it free?',
      'faq.a1': 'Yes, 100% free. No sign-up fee and no monthly fee.',
      'faq.q2': 'Do I need an app?',
      'faq.a2': 'No. Everything runs on the WhatsApp you already use every day.',
      'faq.q3': 'How do I get paid?',
      'faq.a3': 'Via QRIS / DANA transfer, calculated and paid every month.',
      'faq.q4': 'My warung is small — can I join?',
      'faq.a4': 'Yes. As long as your warung is within 1 km of a campus, you can register.',
      'honest': 'Early-stage partner program — be part of the first wave of campus warungs.',
      'home': '← to Warung Network'
    },
    zh: {
      'doc.title': 'Warung Network 店主招募 — 你的店，赚更多',
      'meta.desc': '加入 Warung Network 店主伙伴 —— 不装新 App、不花钱、只要 WhatsApp。校园 Warung 首批招募中。',
      'hero.eyebrow': 'Warung Network 店主伙伴',
      'hero.title': '你的店，赚更多。',
      'hero.sub': '不装新 App。不花钱。只要 WhatsApp。',
      'cta.wa': '通过 WhatsApp 加入',
      'benefits.title': '为什么加入？',
      'b1.title': '品牌陈列费',
      'b1.desc': '在日常流水之外，有机会每月多一笔额外收入。',
      'b2.title': '订单通知直达 WhatsApp',
      'b2.desc': '高峰期接更多单，不需要装任何新 App。',
      'b3.title': '补货优惠与热销品情报',
      'b3.desc': '进货更便宜，还知道学生最想买什么。',
      'steps.title': '三步加入',
      's1.title': '发定位 + 店照',
      's1.desc': '通过 WhatsApp 发定位和店面照片即可。',
      's2.title': '我们审核',
      's2.desc': '核实位置与经营情况，通常 1–2 天。',
      's3.title': '接任务拿收入',
      's3.desc': '开始接陈列任务和订单，收入按月结算。',
      'faq.title': '常见问题',
      'faq.q1': '免费吗？',
      'faq.a1': '是的，100% 免费。没有加盟费，也没有月费。',
      'faq.q2': '要装 App 吗？',
      'faq.a2': '不用。一切都在你每天都在用的 WhatsApp 里完成。',
      'faq.q3': '怎么收钱？',
      'faq.a3': 'QRIS / DANA 转账，按月结算。',
      'faq.q4': '我的店很小，能加入吗？',
      'faq.a4': '可以。只要你的店在校园 1 公里范围内，就可以报名。',
      'honest': '首批招募中 —— 成为第一波校园 Warung 伙伴。',
      'home': '← 返回 Warung Network 主站'
    }
  };

  /* WhatsApp 预填文案固定印尼语（运营侧阅读），不随界面语言变化 */
  var WA_PREFILL = 'Halo, saya pemilik warung, mau gabung Mitra Warung Network';

  var LANG_KEY = 'warung-lang';
  var currentLang = 'id'; // 店主端默认印尼语
  try {
    var saved = localStorage.getItem(LANG_KEY);
    if (saved && I18N[saved]) currentLang = saved;
  } catch (e) {}

  function T(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.id[key] || key;
  }

  /* 静态文案 + meta + <title> 按当前语言填充；字典虽为本地常量，仍统一过 escapeHtml 防线 */
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = escapeHtml(T(el.getAttribute('data-i18n')));
    });
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', T('meta.desc'));
    document.title = T('doc.title');
    document.documentElement.setAttribute('lang',
      currentLang === 'zh' ? 'zh-CN' : currentLang); // 与主站 main.js 的 lang 取值一致
  }

  /* WhatsApp CTA：真实运营号 + 白名单校验（与主站同一机制），不通过则按钮留 # 兜底 */
  function buildWaUrl() {
    var num = DATA.whatsappOpsNumber || '';
    var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(WA_PREFILL);
    return /^https:\/\/wa\.me\/\d+\?text=/.test(url) ? url : '';
  }
  function applyWaCtas() {
    var url = buildWaUrl();
    document.querySelectorAll('.js-wa-cta').forEach(function (a) {
      a.setAttribute('href', url || '#');
      if (url) a.setAttribute('title', url); // 便于地推展示时核对号码
    });
  }

  /* 语言切换 */
  function setLang(lang) {
    if (!I18N[lang] || lang === currentLang) return;
    currentLang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyI18n();
    document.querySelectorAll('#langSwitch button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  var switcher = document.getElementById('langSwitch');
  if (switcher) {
    switcher.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-lang]');
      if (btn) setLang(btn.dataset.lang);
    });
  }

  /* FAQ 手风琴：button 切换 open 类 + hidden + aria-expanded */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentNode;
      var panel = item.querySelector('.faq-a');
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) panel.hidden = !open;
    });
  });

  /* 首次填充 */
  applyI18n();
  applyWaCtas();
  document.querySelectorAll('#langSwitch button').forEach(function (b) {
    b.classList.toggle('active', b.dataset.lang === currentLang);
  });
})();
