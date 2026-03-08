# DUCE School View

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Jotai](https://img.shields.io/badge/Jotai-2-black?style=for-the-badge&logo=atom&logoColor=white)
![TanStack Table](https://img.shields.io/badge/TanStack_Table-8-FF4154?style=for-the-badge&logo=reacttable&logoColor=white)
![Azure](https://img.shields.io/badge/Azure_Blob_Storage-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![Kintone](https://img.shields.io/badge/Kintone-003087?style=for-the-badge&logo=kintone&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

学校向けの工事案件管理システム。Vue.js / Laravel APIの既存システムをNext.js 14 (App Router / Server Action) にリプレイスしたプロジェクト。

---

## 技術スタック

| カテゴリ           | 技術                       |
| ------------------ | -------------------------- |
| フレームワーク     | Next.js 14 (App Router)    |
| UI                 | React 18 / Tailwind CSS 3  |
| 言語               | TypeScript 5               |
| 状態管理           | Jotai 2                    |
| テーブル           | TanStack Table 8           |
| 認証               | jose (JWT)                 |
| メール送信         | Nodemailer (SendGrid SMTP) |
| ファイルキャッシュ | Azure Blob Storage         |
| バックエンド       | Kintone API                |
| ランタイム         | Node.js 22                 |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── (school-view)/
│   │   └── main/
│   │       ├── _actions/          # Server Actions
│   │       ├── _components/       # クライアントコンポーネント
│   │       │   ├── modal/         # 各種モーダル
│   │       │   └── table/         # 案件テーブル
│   │       └── _store/            # Jotai atoms
│   └── store/                     # グローバル atoms
├── lib/
│   ├── api/
│   │   ├── kintoneClient.ts       # Kintone API クライアント
│   │   ├── types/                 # Kintone レコード型定義
│   │   └── usecase/               # API ユースケース
│   ├── cookie/                    # JWT セッション管理
│   ├── constants/                 # 定数
│   └── utils/
│       └── azureBlob.ts           # Azure Blob Storage ユーティリティ
└── components/
    └── ui/                        # 共通UIコンポーネント
```

---

## セットアップ

### 必要環境

- Node.js >= 22

### インストール

```bash
npm install
```

### 環境変数

`.env` ファイルをルートに作成し、以下を設定してください。

```dotenv
# JWT
JWT_SECRET=

# Kintone
KINTONE_BASE_URL=https://xxxxxx.cybozu.com
KINTONE_ANKEN_APP_ID=
KINTONE_ANKEN_APP_TOKEN=
KINTONE_TAIOU_APP_ID=
KINTONE_TAIOU_APP_TOKEN=
KINTONE_AUTH_APP_ID=
KINTONE_AUTH_APP_TOKEN=
KINTONE_BLD_MASTER_ID=
KINTONE_BLD_USER_REL_ID=
KINTONE_BLD_USER_REL_TOKEN=

# Mail (SendGrid SMTP)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.xxxxxx
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME=
MAIL_NOTIFY_TO=
MAIL_NOTIFY_CC=

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER_NAME=dev
AZURE_STORAGE_CACHE_PREFIX=school-view/cache
```

> ⚠️ `AZURE_STORAGE_CONNECTION_STRING` は `;` を含むため、必ず `"` で囲んでください。

### 開発サーバー起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
npm run start
```

---

## 主な機能

- **案件一覧テーブル** — TanStack Table によるソート・フィルタ・ページネーション
- **案件詳細モーダル** — 案件情報・対応明細・添付ファイル (SAS URL) を表示
- **学内用メモ** — ログインユーザーごとのメモ編集
- **お問い合わせ / 未完了連絡** — DUCE 宛てにメール送信
- **完了確認** — クライアント確認日の登録
- **発注手続き** — 発注者情報入力・発注完了メール送信・Kintone 発注日更新

---

## ファイルキャッシュ戦略

Kintone のファイルは Azure Blob Storage にキャッシュし、SAS URL 経由でブラウザに返す。

```
初回アクセス: Kintone → Azure Blob Storage に保存 → SAS URL 発行
以降のアクセス: Azure Blob Storage → SAS URL 発行 (Kintone へのリクエストをスキップ)
```

キャッシュパス: `{AZURE_STORAGE_CONTAINER_NAME}/{AZURE_STORAGE_CACHE_PREFIX}/{fileKey}.{ext}`

---

## 注意事項

- SendGrid の無料枠廃止時は `MAIL_HOST` を別プロバイダの SMTP に差し替えること
- Azure Blob Storage のコンテナは本番環境では `AZURE_STORAGE_CONTAINER_NAME=prod` に変更すること
- Kintone APIトークンは **閲覧 + 編集** 権限が必要
