# Warung Network 官网 — Cloudflare Pages 部署指南

本项目是**纯静态网站**（无框架、无构建步骤），可直接部署到 Cloudflare Pages。

## 文件结构

```
├── index.html          # 单页长滚动官网
├── _headers            # Cloudflare Pages 缓存策略
├── assets/
│   ├── css/style.css   # 全站样式
│   └── js/
│       ├── data.js     # 演示数据（大学 + Warung 点位，替换真实数据改这里）
│       └── main.js     # 地图 / 筛选 / 动画逻辑
```

## 方式一：连接 GitHub 仓库（推荐，支持 git push 自动部署）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 授权并选择仓库 `vfvincentwong2026/warung-network-mvp`。
3. 构建设置：
   - **Framework preset**：None
   - **构建命令（Build command）**：**留空**
   - **输出目录（Build output directory）**：`/`
4. 点击 **Save and Deploy**。之后每次 `git push` 到主分支都会自动重新部署。

## 方式二：命令行直接上传（Wrangler）

```bash
# 首次使用需登录：npx wrangler login
# 在项目根目录执行：
npx wrangler pages deploy . --project-name warung-network-mvp
```

部署完成后会获得 `https://warung-network-mvp.pages.dev` 域名，可在 Pages 项目设置中绑定自定义域名。

## 部署前必做

- 打开 `index.html` 搜索「占位」，将 WhatsApp / 微信联系方式替换为真实信息。
- `assets/js/data.js` 当前为**演示数据**，渠道激活后按文件内注释替换为真实点位数据（保持数据结构不变即可）。

## 本地预览

直接双击 `index.html` 即可在浏览器打开（file:// 兼容）；或在根目录运行任意静态服务器，例如：

```bash
npx serve .
```
