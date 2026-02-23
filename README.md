# Webタスク管理ツール

このプロジェクトは、**個人用の学習・開発目的**で作成されたシンプルなWebタスク管理ツールです。

> **注意**: このアプリケーションは個人利用を想定しており、本番環境での使用や商用利用は想定していません。認証機能やセキュリティ対策は実装されていないため、機密性の高い情報は扱わないでください。

## 技術スタック

### フロントエンド
- React 18
- Webpack 5
- Babel 7

### バックエンド
- Node.js
- Express 4
- JSONファイルによるデータ永続化

## プロジェクト構成

```
web-manage-tasks/
├── README.md
├── client/              # フロントエンド
│   ├── App.jsx         # メインReactコンポーネント
│   ├── index.js        # エントリーポイント
│   ├── package.json
│   ├── webpack.config.js
│   └── public/
│       └── index.html
└── server/              # バックエンド
    ├── index.js        # Express APIサーバー
    ├── package.json
    └── tasks.json      # タスクデータ保存
```

## 機能

- ✅ タスク一覧表示
- ✅ タスク追加
- ✅ タスク削除
- ✅ タスク完了フラグ

## APIエンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET     | /api/tasks    | タスク一覧を取得 |
| POST    | /api/tasks    | 新しいタスクを追加 |
| DELETE  | /api/tasks/:id | 指定したIDのタスクを削除 |

## セットアップ手順

### 1. 依存パッケージのインストール

#### サーバー側
```bash
cd server
npm install
```

#### クライアント側
```bash
cd client
npm install
```

### 2. アプリケーションの起動

#### サーバーを起動（ターミナル1）
```bash
cd server
npm run dev
```
サーバーは http://localhost:3001 で起動します。

#### クライアントを起動（ターミナル2）
```bash
cd client
npm start
```
ブラウザが自動的に開き、http://localhost:8080 でアプリケーションにアクセスできます。

## 開発環境

- Node.js 14以上推奨
- npm または yarn

## 今後の拡張予定

- タスク編集機能
- タスクの並び替え
- タスクフィルタリング（完了/未完了）
- データベース対応（MongoDB、PostgreSQLなど）
- ユーザー認証機能
- タスクの期限設定
- タスクカテゴリ分類