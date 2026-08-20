# PRD：WhatsApp 店主自助入驻机器人

> 版本 v1.0 ｜ 2026-07 ｜ 状态：方案评审
> 前置文档：《商业模式 v2.0》《SOP-手工建表5分钟版》

---

## 1. 一句话定义

店主从 mitra 页点 WhatsApp 按钮 → 机器人用印尼语引导 5 步收集信息 → **自动写入 Google Sheets → 网站地图实时出现新点位**。把"地推扫街录表"升级为"店主自来水上图"。

## 2. 为什么现在做（PM 评估）

| 维度 | 判断 |
|---|---|
| 数据基础 | ✅ 网站已实时读 Google Sheets（8 列结构稳定），写入即上图，零前端改动 |
| 成本 | ✅ 店主主动发消息 = Meta **service conversation，免费**；Cloudflare Workers + Apps Script 免费层足够，**经常性成本 $0/月** |
| 投资人故事 | ✅ "店主 30 秒自助上图"是网络效应的直接演示，比 PPT 里的'自增长飞轮'有力得多 |
| 时机风险 | ⚠️ 当前 inbound 量级很小（contacted 才 41 家），机器人是**为规模化做准备**，不是解决当下瓶颈。当下瓶颈仍是线下触达 |
| 结论 | **做**，但按 MVP 标准做轻（2-3 天工作量），不做 AI 自由对话，只做固定流程状态机 |

## 3. 数据现状（已实测）

- Sheets 共 523 行，8 列：`id, name, university_id, lat, lng, categories, status, weekly_orders`
- 漏斗：target 472 / contacted 41 / negotiating 7 / signed 2 / active 1
- 机器人新写入的行默认 `status=contacted`（直接进入已联络池，地图立即可见）
- id 自增：下一号为 `w524`

## 4. 用户旅程与对话脚本（印尼语）

入口：mitra 页 CTA（wa.me 预填 `Halo, saya mau daftarkan warung saya`）触发关键词 `daftar`。

```
Bot:  Halo! Selamat datang di Warung Network 🎉
      Siapa nama warung Anda?
店主:  Warung Bu Siti

Bot:  Terima kasih! Warung Bu Siti dekat kampus mana?
      [List message：34 所大学分区列表，店主点选]
店主:  [选 Universitas Indonesia]

Bot:  Bagus! Sekarang kirim LOKASI warung Anda:
      klik 📎 → Lokasi → kirim pin warung.
店主:  [发送位置 pin → 自动获得精确 lat/lng]

Bot:  Warung Anda jual apa saja? Balas nomornya, boleh lebih dari satu:
      1️⃣ Nasi Goreng  2️⃣ Nasi Padang  3️⃣ Gorengan
      4️⃣ Kopi  5️⃣ Es Teh  6️⃣ Jus  7️⃣ Indomie  8️⃣ Lainnya
店主:  1, 4, 5

Bot:  Terakhir, kirim foto warung Anda (opsional, ketik "lewati" untuk跳过).
店主:  [照片 / lewati]

Bot:  ✅ Pendaftaran berhasil!
      Warung Bu Siti sudah tampil di peta kami:
      https://warung-network.pages.dev
      Tim kami akan menghubungi Anda dalam 1-2 hari kerja.
```

**设计要点**：位置用 WhatsApp 原生 location pin（精度远超人工填表，这是机器人 vs 手工 SOP 的最大质量优势）；品类用编号多选；全程 5 步、30 秒内完成。

## 5. 架构方案对比

| | A. Workers + Apps Script（推荐） | B. n8n 自托管+隧道 | C. n8n Cloud | D. 纯人工（现状） |
|---|---|---|---|---|
| 月成本 | **$0** | $0（PC 须常开） | ~$20+ | $0 |
| 永远在线 | ✅ | ❌（本地 PC 关机即断） | ✅ | — |
| 开发量 | 1.5-2 天 | 1 天 | 1 天 | 0 |
| 可视化编辑 | ❌ 代码 | ✅ | ✅ | — |
| 复用现有 Cloudflare 栈 | ✅ | 部分 | ❌ | — |
| 后期扩展（AI 对话等） | 中 | 强 | 强 | — |

**推荐方案 A**，链路：

```
店主 WhatsApp
   ↓ (Meta Cloud API webhook)
Cloudflare Worker（验证签名 → 状态机 → 回复消息）
   ↓ (HTTPS POST + 密钥)
Google Apps Script Web App（校验 → append 行 → id 自增）
   ↓
Google Sheets（已发布 CSV）
   ↓ (网站每 8s 超时降级已内置)
warung-network.pages.dev 地图实时渲染
```

全部组件在免费层内；Worker 免费层 10 万请求/天，当前量级用不到 0.1%。

## 6. 数据写入规范

- `id`：Apps Script 读最大序号自增（w524, w525…）
- `university_id`：必须匹配 34 校 slug 之一，否则拒收并重新询问
- `lat/lng`：必须在雅加达 bounding box（-6.45 ~ -6.10, 106.60 ~ 107.05），拒收离谱坐标
- `categories`：编号映射到现有品类词表，自由文本归入"Lainnya"待人工清洗
- `status`：固定写 `contacted`
- `weekly_orders`：留空
- **频率限制**：同一 WhatsApp 号码 24h 内最多提交 2 家点；同一坐标 50m 内已有点位则提示重复

## 7. 安全与风控

- Meta webhook：verify token + `X-Hub-Signature-256` 签名校验（app secret）
- Apps Script：URL 携带长随机密钥，Worker 侧存储于 Cloudflare secrets
- 状态机会话存 Workers KV（TTL 24h），断线可续
- 滥用场景：恶意刷屏 → 号码级限流；虚假点位 → contacted 状态本就需人工推进，污染可控

## 8. 前置依赖（⚠️ 阻断项）

1. **真实运营手机号**（印尼 +62 最佳）——注册 WhatsApp Business 用，同时替换 mitra 页和 data.js 里的占位号 `6281234567890`。一个号码两处用。
2. Meta Business 账号 + 开发者 App（免费，注册约 0.5-1 天；未做 business verification 也可跑通 service 对话）
3. 业主 Google 账号内部署 Apps Script（需业主本人点几下授权，我给精确步骤）

## 9. 里程碑

| 阶段 | 内容 | 工作量 |
|---|---|---|
| M1 | Meta 侧设置（业主配合）+ Apps Script 写表端 | 1 天 |
| M2 | Cloudflare Worker 状态机 + 印尼语脚本 | 1 天 |
| M3 | 端到端测试（真机发消息 → 地图出现）+ 部署 | 0.5 天 |
| M4 | mitra 页 CTA 预填文案对齐触发词 | 0.5 小时 |

## 10. 成功指标

- 上线 30 天：自助入驻提交数 ≥ 10（验证店主愿意自己上图）
- 提交 → 信息完整率 ≥ 70%（5 步走完）
- 地图点位从 523 → 600+ 中自助来源占比（网络效应是否启动的信号）

## 11. 明确不做（本期）

- ❌ AI 自由对话（店主问什么都接）——量级上来后再说
- ❌ 店主自助修改/下架点位——走人工
- ❌ 订餐/支付闭环——那是 L3 试销期的事
