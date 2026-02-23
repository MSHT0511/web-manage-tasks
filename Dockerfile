# Node.js 18 Alpine - 軽量で高速なLTSバージョン
FROM node:18-alpine

# 作業ディレクトリの設定
WORKDIR /app

# ルートのpackage.jsonをコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# クライアントの依存関係をインストール
COPY client/package*.json ./client/
RUN cd client && npm install

# サーバーの依存関係をインストール
COPY server/package*.json ./server/
RUN cd server && npm install

# ソースコードをコピー
COPY . .

# ポートを公開
EXPOSE 3000 3001

# 開発サーバーを起動（concurrentlyで両方のサービスを並行起動）
CMD ["npm", "run", "dev"]
