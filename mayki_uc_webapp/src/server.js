import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const productsPath = path.join(root, 'data', 'products.json');
const runtimePath = path.join(root, 'data', 'runtime.json');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(x => x.trim()).filter(Boolean);
const ALLOW_BROWSER_DEMO = String(process.env.ALLOW_BROWSER_DEMO || 'true').toLowerCase() === 'true';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir));

async function loadProducts() {
  const raw = await fs.readFile(productsPath, 'utf8');
  return JSON.parse(raw);
}

async function loadRuntime() {
  try {
    return JSON.parse(await fs.readFile(runtimePath, 'utf8'));
  } catch {
    return { users: {}, orders: [] };
  }
}

async function saveRuntime(data) {
  await fs.writeFile(runtimePath, JSON.stringify(data, null, 2));
}

function parseInitData(initData) {
  return Object.fromEntries(new URLSearchParams(initData));
}

function verifyTelegramInitData(initData) {
  if (!BOT_TOKEN || !initData) {
    return { ok: false, reason: 'Missing BOT_TOKEN or initData' };
  }

  const params = parseInitData(initData);
  const hash = params.hash;
  if (!hash) return { ok: false, reason: 'Missing hash' };

  delete params.hash;
  const dataCheckString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const calculated = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  try {
    const valid = crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
    if (!valid) return { ok: false, reason: 'Invalid signature' };
  } catch {
    return { ok: false, reason: 'Invalid hash length' };
  }

  const user = params.user ? JSON.parse(params.user) : null;
  return { ok: true, user, params };
}

function demoUser() {
  return {
    id: 8573174269,
    first_name: 'MAYKI User',
    username: 'mayki_client',
    photo_url: '/assets/mayki-logo.jpeg',
    language_code: 'ru'
  };
}

function requireTelegramUser(req) {
  const initData = req.headers['x-telegram-init-data'] || req.body?.initData || '';
  const verified = verifyTelegramInitData(initData);
  if (verified.ok) return verified.user;

  // Safe preview fallback: lets you preview on Railway/browser before BotFather is configured.
  // Disable by setting ALLOW_BROWSER_DEMO=false after final Telegram linking.
  if (ALLOW_BROWSER_DEMO || process.env.NODE_ENV !== 'production' || !BOT_TOKEN) return demoUser();
  return null;
}

async function upsertUser(tgUser) {
  const db = await loadRuntime();
  const id = String(tgUser.id);
  const existing = db.users[id] || {};
  db.users[id] = {
    telegramId: tgUser.id,
    firstName: tgUser.first_name || '',
    lastName: tgUser.last_name || '',
    username: tgUser.username || '',
    photoUrl: tgUser.photo_url || '/assets/mayki-logo.jpeg',
    languageCode: tgUser.language_code || 'ru',
    balanceRub: existing.balanceRub || 0,
    bonuses: existing.bonuses || 0,
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await saveRuntime(db);
  return db.users[id];
}

app.get('/health', (_, res) => res.json({ ok: true, app: 'MAYKI UC BOT 24/7 VIP' }));

app.get('/api/config', async (_, res) => {
  const products = await loadProducts();
  res.json({
    brand: {
      botName: 'MAYKI UC BOT 24/7 VIP',
      shopName: 'MAYKI UC SHOP 24/7',
      descriptionRu: 'Игровой магазин',
      descriptionEn: 'Premium PUBG Mobile Store',
      supportUrl: process.env.SUPPORT_URL || 'https://t.me/Mayki_UC_manager',
      channelUrl: process.env.CHANNEL_URL || 'https://t.me/Mayki_uc_shop'
    },
    products
  });
});

app.post('/api/auth/telegram', async (req, res) => {
  const tgUser = requireTelegramUser(req);
  if (!tgUser) return res.status(401).json({ ok: false, error: 'Telegram auth failed' });
  const user = await upsertUser(tgUser);
  const db = await loadRuntime();
  const orders = db.orders.filter(o => String(o.telegramId) === String(user.telegramId));
  const spentRub = orders.reduce((sum, o) => sum + Number(o.totalRub || 0), 0);
  res.json({ ok: true, user: { ...user, ordersCount: orders.length, spentRub } });
});

app.get('/api/products', async (_, res) => res.json(await loadProducts()));

app.post('/api/orders', async (req, res) => {
  const tgUser = requireTelegramUser(req);
  if (!tgUser) return res.status(401).json({ ok: false, error: 'Telegram auth failed' });
  await upsertUser(tgUser);

  const { items = [], pubgId = '', paymentMethod = '' } = req.body || {};
  const order = {
    id: `MYK-${Date.now()}`,
    telegramId: tgUser.id,
    username: tgUser.username || '',
    pubgId,
    paymentMethod,
    items,
    totalRub: items.reduce((sum, x) => sum + Number(x.priceRub || 0) * Number(x.qty || 1), 0),
    status: 'development_payment_disabled',
    createdAt: new Date().toISOString()
  };
  const db = await loadRuntime();
  db.orders.unshift(order);
  await saveRuntime(db);
  res.json({
    ok: true,
    order,
    messageRu: 'Бот пока не готов. Пожалуйста, подождите, пока мы полностью завершим разработку и подключение оплаты.',
    messageEn: 'The bot is not ready yet. Please wait until development and payment setup are complete.'
  });
});

app.get('/api/orders/me', async (req, res) => {
  const tgUser = requireTelegramUser(req);
  if (!tgUser) return res.status(401).json({ ok: false, error: 'Telegram auth failed' });
  const db = await loadRuntime();
  res.json({ ok: true, orders: db.orders.filter(o => String(o.telegramId) === String(tgUser.id)) });
});

app.post('/api/admin/command', async (req, res) => {
  const { adminId, command, args } = req.body || {};
  if (!ADMIN_IDS.includes(String(adminId))) return res.status(403).json({ ok: false, error: 'Forbidden' });
  res.json({ ok: true, command, args, note: 'Admin command API placeholder ready for bot integration.' });
});

app.get('*', (_, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.listen(PORT, () => console.log(`MAYKI Mini App running on :${PORT}`));
