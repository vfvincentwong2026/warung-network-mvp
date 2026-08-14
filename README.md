# Warung Network MVP

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **赋能雅加达大学城 Warung 的智能订货网络 —— 让店主在 WhatsApp 上完成一切**

---

## 📖 项目简介

**Warung Network MVP** 是一个聚焦于**雅加达大学城周边 1 公里范围内 Warung（印尼传统小卖部）** 的智能订货与动销网络。

印尼拥有超过 **300 万家 Warung**，占据零售市场 **68% 的份额**[reference:0]。大学城周边的 Warung 具有客群年轻、数字化意愿高、消费高频等特点，是快消品品牌触达印尼年轻消费者的**黄金渠道**。

本项目通过 **WhatsApp + n8n 自动化工作流**[reference:1][reference:2]，为 Warung 店主提供：

- 🤖 **7×24 小时智能接单**：学生扫码即可通过 WhatsApp 下单
- 💳 **无缝 QRIS 支付**：支持 GoPay、ShopeePay、OVO 等主流电子钱包[reference:3]
- 📱 **零学习成本**：店主只需一部手机，无需安装任何新 App
- 📊 **数据驱动选品**：实时追踪销售数据，反向指导品牌选品与动销策略

---

## 🎯 项目使命

**让印尼大学城周边的 Warung 店主，在高峰时段轻松多赚 20% 的钱。**

同时，为已落地印尼的快消品工厂和尚未进入印尼市场的品牌，提供一个**低成本、高精准度的市场进入与动销渠道**。

---

## ✨ 核心功能

| 功能模块 | 描述 | 状态 |
| :--- | :--- | :--- |
| **WhatsApp 自动接单** | 学生发送商品代码，机器人自动确认订单 | 🚧 开发中 |
| **QRIS 支付集成** | 自动生成支付二维码，学生扫码即付[reference:4] | 🚧 开发中 |
| **店主订单通知** | 支付成功后自动通知店主备餐 | 🚧 开发中 |
| **Google Sheets 数据看板** | 实时记录订单数据，生成销售报表 | 📋 规划中 |
| **智能补货提醒** | 根据销售数据主动提醒店主补货 | 📋 规划中 |
| **品牌数据报告** | 为合作品牌提供大学城消费洞察 | 📋 规划中 |

---

## 🏗️ 技术架构
┌─────────────────────────────────────────────────────────────┐
│ 学生端 │
│ WhatsApp (扫码下单) │
└─────────────────────────┬───────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ WhatsApp Business API │
│ (Meta 官方通道 / 第三方 BSP) │
└─────────────────────────┬───────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ n8n 工作流引擎 │
│ ┌──────────────┴──────────────┐ │
│ ▼ ▼ │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ 消息解析节点 │ │ 支付处理节点 │ │
│ └─────────────┘ └─────────────┘ │
│ │ │ │
│ └──────────────┬──────────────┘ │
│ ▼ │
│ ┌─────────────┐ │
│ │ Google Sheets│ │
│ │ 数据存储 │ │
│ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 店主端 │
│ WhatsApp (接收订单通知) │
└─────────────────────────────────────────────────────────────┘

text

### 核心技术栈

| 组件 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **自动化引擎** | [n8n](https://n8n.io/) | 开源工作流自动化，自托管部署[reference:5] |
| **消息通道** | WhatsApp Business API | Meta 官方 API，需配置 Webhook[reference:6] |
| **数据存储** | Google Sheets | 零成本、易操作的数据记录方案 |
| **支付通道** | QRIS (GoPay / ShopeePay) | 印尼国家标准二维码支付[reference:7] |
| **部署环境** | Docker / VPS | 轻量级容器化部署 |

---

## 🚀 快速开始

### 前置条件

- Node.js (v18+)
- Docker (可选)
- Meta Developer 账号 [注册地址](https://developers.facebook.com/)
- WhatsApp Business 账号
- Google 账号 (用于 Google Sheets API)

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/vfvincentwong2026/warung-network-mvp.git
cd warung-network-mvp
2. 安装 n8n
bash
# 全局安装 n8n
npm install n8n -g

# 或使用 Docker 部署
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
3. 配置 WhatsApp Business API
前往 Meta for Developers 创建 App

添加 WhatsApp 产品

获取以下凭证：

WhatsApp Business Account ID

Phone Number ID

Permanent Access Token

在 n8n 中添加 WhatsApp Business Cloud 凭证

4. 配置 Webhook
在 Meta Developer Console 中，将 Webhook Callback URL 设置为你的 n8n webhook 地址：

text
https://your-n8n-domain.com/webhook/your-workflow-id
⚠️ 注意：WhatsApp 每个 App 只能注册一个 Webhook URL。建议在测试阶段使用 ngrok 等工具暴露本地服务。

5. 配置 Google Sheets
创建 Google Sheet，首行设置列名：订单ID、时间、商品、数量、金额、支付状态、店主ID

在 n8n 中添加 Google Sheets OAuth2 凭证

在 Google Sheets 节点中填入 Spreadsheet ID

6. 导入 n8n 工作流
bash
# 工作流定义文件位于
src/n8n_workflows/
├── order-processing.json    # 订单处理主流程
├── payment-webhook.json     # 支付回调流程
└── data-reporting.json      # 数据报表流程
在 n8n 界面中依次导入以上 JSON 文件，配置各节点的凭证。

📱 使用指南
学生端流程
text
1. 扫描 Warung 店门口的 QR 码
   ↓
2. 添加 Warung 的 WhatsApp 账号
   ↓
3. 发送商品代码（如 "M1" = Indomie + 蛋）
   ↓
4. 机器人自动回复确认 + 生成 QRIS 支付码
   ↓
5. 学生扫码支付（GoPay / ShopeePay / OVO）[reference:12]
   ↓
6. 店主收到支付成功通知 → 备餐
   ↓
7. 学生到店取餐
店主端体验
店主只需要：

一部智能手机

安装 WhatsApp

接收订单通知 → 备餐 → 交给学生

无需学习任何新 App。

📊 商业模式验证
本项目 MVP 阶段验证以下核心命题：

验证命题	验证标准
店主愿意用	≥70% 签约店主在首周内完成 ≥1 次下单
品牌愿意付	≥1 个品牌同意以 15%-20% 佣金试合作
单位经济为正	单店月均毛利 > 获客成本 + 运营成本
收入模型
收入来源	目标客户	收费模式
分销佣金	已落地印尼的品牌	销售额的 15%-25%
终端陈列服务	已落地印尼的品牌	按月 / 按设备收费
数据报告订阅	所有品牌	按月 / 按季度订阅
市场进入服务	未进入印尼的品牌	项目制收费
🗺️ 项目路线图
text
Phase 1: MVP 验证 (4-6 周)
├── UI Depok 校区周边 10-15 家 Warung 签约[reference:13]
├── WhatsApp + n8n + QRIS 基础流程打通
└── 验证商业模式三命题
        ↓
Phase 2: 复制扩张 (2-3 个月)
├── 扩展至 2-3 所大学 (UI + UNJ + BINUS)
├── 签约 50+ 家 Warung
└── 引入首个品牌合作方
        ↓
Phase 3: 数据服务 (3-6 个月)
├── 推出「大学城消费洞察报告」订阅服务
├── 推出「新品大学城测试」服务
└── 启动「市场进入即服务」(Market Entry as a Service)
        ↓
Phase 4: 平台化 (6-12 个月)
├── 自建 B2B 订货平台 (替代 Google Sheets)[reference:14]
├── 开放 API 给第三方品牌
└── 复制模式至印尼其他城市
🤝 如何贡献
我们欢迎所有形式的贡献！请参阅 CONTRIBUTING.md 了解详细指南。

贡献方式
🐛 报告 Bug：提交 Issue

💡 提出新功能：提交 Feature Request

📝 改进文档：提交 Pull Request

💻 贡献代码：Fork 仓库 → 创建分支 → 提交 PR

开发环境
bash
# 安装依赖
npm install

# 运行测试
npm test

# 代码格式化
npm run format
📁 项目结构
text
warung-network-mvp/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── architecture.md      # 架构设计文档
│   ├── api-spec.md          # API 接口规范
│   └── deployment.md        # 部署指南
├── src/
│   ├── n8n_workflows/       # n8n 工作流定义 (JSON)
│   │   ├── order-processing.json
│   │   ├── payment-webhook.json
│   │   └── data-reporting.json
│   ├── whatsapp_bot/        # WhatsApp 机器人逻辑 (Node.js)
│   │   ├── message-handler.js
│   │   └── order-parser.js
│   └── data_pipeline/       # 数据处理脚本 (Python)
│       └── report-generator.py
├── tests/
│   ├── unit/
│   └── integration/
├── .gitignore
├── LICENSE
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── SECURITY.md
📄 许可证
本项目采用 MIT License 开源许可证。

text
MIT License

Copyright (c) 2026 Warung Network MVP

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
详见 LICENSE 文件。

🙏 致谢
n8n - 开源工作流自动化平台

Meta for Developers - WhatsApp Business API

QRIS - 印尼国家标准二维码支付系统

📬 联系与交流
项目维护者：Vincent Wong

GitHub：vfvincentwong2026

Email：[your.email@example.com]

⭐ 如果这个项目对你有帮助，请给一个 Star！
