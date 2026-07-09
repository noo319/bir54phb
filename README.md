# MAYKI UC BOT 24/7 VIP — Telegram Mini App

Professional Telegram Mini App / web store for MAYKI UC BOT.

## Features

- Russian + English interface.
- PUBG UC products with ruble prices.
- Prime Plus products.
- Telegram account auto-login through `Telegram.WebApp.initData`.
- Profile page: Telegram ID, username, photo, orders, spent amount, balance.
- Cart with + / - quantity controls and custom UC amount.
- Payment method screen: СБП, Банковские карты РФ, USDT.
- Payments are disabled for now and show the requested “bot not ready yet” message.
- Floating Support / Channel / Profile buttons.
- Railway-ready deployment with Dockerfile.

## Deploy

Upload this folder to GitHub, then connect it to Railway.

Railway will use `Dockerfile`, so it will not fail on `npm ci`.

## Environment Variables

```env
PORT=3000
BOT_TOKEN=
ADMIN_IDS=
SUPPORT_URL=https://t.me/Mayki_UC_manager
CHANNEL_URL=https://t.me/Mayki_uc_shop
ALLOW_BROWSER_DEMO=true
```

## Local run

```bash
npm install
npm start
```

Open: `http://localhost:3000`
