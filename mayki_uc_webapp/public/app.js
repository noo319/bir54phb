const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#090709');
  tg.setBackgroundColor('#070607');
}

const state = {
  route: 'home',
  lang: localStorage.getItem('mayki_lang') || 'ru',
  config: null,
  user: null,
  products: null,
  cart: {},
  pubgId: localStorage.getItem('mayki_pubg_id') || '',
  orders: []
};

const t = {
  ru: {
    home: 'Главная', profile: 'Профиль', pubg: 'PUBG Mobile', prime: 'Prime Plus',
    choose: 'Выберите раздел', delivery: 'Доставка: 2-5 минут', buy: 'Купить', custom: 'Купить своё количество',
    enterUc: 'Укажите сумму UC', cart: 'Корзина', totalUc: 'Всего UC', total: 'Общая сумма', checkout: 'Оформить заказ',
    clear: 'Очистить корзину', payment: 'Выберите способ оплаты', notReady: 'Бот пока не готов. Пожалуйста, подождите, пока мы полностью завершим разработку и подключение оплаты.',
    support: 'Поддержка', channel: 'Канал', orders: 'История заказов', spent: 'Потрачено', balance: 'Баланс', pubgId: 'Введите ваш PUBG ID', save: 'Сохранить', back: 'Назад', added: 'Добавлено в корзину', empty: 'Корзина пустая', onlyNow: 'Пока доступны только UC и Prime Plus.', noOrders: 'Пока нет заказов', account: 'Управление аккаунтом'
  },
  en: {
    home: 'Home', profile: 'Profile', pubg: 'PUBG Mobile', prime: 'Prime Plus',
    choose: 'Choose section', delivery: 'Delivery: 2-5 minutes', buy: 'Buy', custom: 'Buy custom amount',
    enterUc: 'Enter UC amount', cart: 'Cart', totalUc: 'Total UC', total: 'Total amount', checkout: 'Checkout',
    clear: 'Clear cart', payment: 'Select payment method', notReady: 'The bot is not ready yet. Please wait until development and payment setup are complete.',
    support: 'Support', channel: 'Channel', orders: 'Order history', spent: 'Spent', balance: 'Balance', pubgId: 'Enter your PUBG ID', save: 'Save', back: 'Back', added: 'Added to cart', empty: 'Cart is empty', onlyNow: 'Only UC and Prime Plus are available for now.', noOrders: 'No orders yet', account: 'Account management'
  }
};
const $ = s => document.querySelector(s);
const main = $('#main');
const L = k => t[state.lang][k] || k;
const rub = n => `${Number(n || 0).toLocaleString('ru-RU')} ₽`;

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tg?.initData || '' };
  const res = await fetch(path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function init() {
  state.config = await api('/api/config');
  state.products = state.config.products;
  $('#supportBtn').href = state.config.brand.supportUrl;
  $('#channelBtn').href = state.config.brand.channelUrl;
  $('#brandTitle').textContent = state.config.brand.botName.replace(' 24/7 VIP', '');
  $('#brandSubtitle').textContent = state.config.brand.descriptionRu;
  const auth = await api('/api/auth/telegram', { method: 'POST', body: JSON.stringify({ initData: tg?.initData || '' }) });
  state.user = auth.user;
  try { state.orders = (await api('/api/orders/me')).orders || []; } catch {}
  bindGlobal();
  navigate('home');
  setTimeout(() => $('#loader').classList.add('hide'), 500);
}

function bindGlobal() {
  document.body.addEventListener('click', e => {
    const route = e.target.closest('[data-route]')?.dataset.route;
    if (route) navigate(route);
  });
}
function navigate(route) {
  state.route = route;
  document.querySelectorAll('#dock button').forEach(b => b.classList.toggle('active', b.dataset.route === route));
  if (route === 'home') return renderHome();
  if (route === 'pubg') return renderPubg();
  if (route === 'prime') return renderPrime();
  if (route === 'profile') return renderProfile();
}
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

function renderHome() {
  main.innerHTML = `
    <section class="section-title"><div><h2>${L('choose')}</h2><p>MAYKI UC SHOP 24/7</p></div><button class="tab" id="langBtn">${state.lang === 'ru' ? 'EN' : 'RU'}</button></section>
    <div class="grid-cats">
      <article class="category-card" data-route="pubg" style="--image:linear-gradient(120deg,rgba(0,0,0,.35),rgba(0,0,0,.05)),url('/assets/mayki-logo.jpeg')"><div><h3>PUBG MOBILE</h3><p>UC / Prime Plus</p></div></article>
      <article class="category-card" data-route="prime" style="--image:radial-gradient(circle at 75% 30%,rgba(255,32,32,.35),transparent 26%),linear-gradient(120deg,#201114,#09080a)"><div><h3>TELEGRAM</h3><p>Premium / Stars soon</p></div></article>
      <article class="category-card" onclick="toast('${L('onlyNow')}')" style="--image:linear-gradient(120deg,#101314,#141010)"><div><h3>STEAM</h3><p class="muted">Coming soon</p></div></article>
    </div>
    <div class="card" style="margin-top:16px"><b>⚡ MAYKI UC BOT 24/7 VIP</b><p class="muted">Fast, clean and automatic Telegram Mini App. Account data opens directly from Telegram.</p></div>
    <div class="legal"><a href="#">Политика конфиденциальности</a><br/><a href="#">Пользовательское соглашение</a></div>
  `;
  $('#langBtn').onclick = () => { state.lang = state.lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('mayki_lang', state.lang); renderHome(); };
}

function cartItems() {
  return Object.values(state.cart).filter(x => x.qty > 0);
}
function cartTotal() {
  return cartItems().reduce((sum, x) => sum + x.priceRub * x.qty, 0);
}
function cartUc() {
  return cartItems().reduce((sum, x) => sum + (x.amount || 0) * x.qty, 0);
}
function addToCart(item, qty = 1) {
  const existing = state.cart[item.id] || { ...item, qty: 0, type: item.amount ? 'uc' : 'prime' };
  existing.qty = Math.max(0, existing.qty + qty);
  state.cart[item.id] = existing;
  if (existing.qty === 0) delete state.cart[item.id];
}
function renderPubg() {
  const products = state.products.pubg_uc;
  main.innerHTML = `
    <section class="section-title"><div><h2>${L('pubg')}</h2><p>${L('delivery')}</p></div></section>
    <div class="card">
      <label class="muted">${L('pubgId')}</label>
      <div class="custom-box"><input class="input" id="pubgId" value="${state.pubgId}" placeholder="PUBG ID"/><button class="primary-btn" id="savePubg">${L('save')}</button></div>
      <div class="tabs"><button class="tab active">Обычные UC</button><button class="tab">Акционные UC</button></div>
      <div class="custom-box"><label>${L('custom')}</label><input class="input" id="customUc" type="number" placeholder="${L('enterUc')}" /></div>
    </div>
    <section class="products-grid" style="margin-top:14px">${products.map(productCard).join('')}</section>
    ${renderCart()}
  `;
  $('#savePubg').onclick = () => { state.pubgId = $('#pubgId').value.trim(); localStorage.setItem('mayki_pubg_id', state.pubgId); toast('PUBG ID saved'); };
  $('#customUc').onchange = e => {
    const amount = Number(e.target.value || 0);
    if (!amount) return;
    const price = Math.ceil(amount * (state.products.pubg_uc.find(x => x.id === 'uc_660').priceRub / 660));
    addToCart({ id: `custom_${Date.now()}`, title: `${amount} UC`, amount, priceRub: price }, 1); renderPubg();
  };
  bindProductButtons(renderPubg);
  bindCheckout();
}
function productCard(p) {
  const qty = state.cart[p.id]?.qty || 0;
  return `<article class="product"><h4>${p.title}</h4><div class="uc-icon"></div><div class="price">${rub(p.priceRub)}</div>${qty ? `<div class="qty-row"><button data-minus="${p.id}">-</button><b>${qty}</b><button data-plus="${p.id}">+</button></div>` : `<button class="buy" data-plus="${p.id}">${L('buy')}</button>`}</article>`;
}
function bindProductButtons(rerender) {
  document.querySelectorAll('[data-plus]').forEach(btn => btn.onclick = () => { const item = findProduct(btn.dataset.plus); addToCart(item, 1); toast(L('added')); rerender(); });
  document.querySelectorAll('[data-minus]').forEach(btn => btn.onclick = () => { const item = findProduct(btn.dataset.minus); addToCart(item, -1); rerender(); });
}
function findProduct(id) {
  return [...state.products.pubg_uc, ...state.products.prime_plus].find(x => x.id === id);
}
function renderPrime() {
  main.innerHTML = `
    <section class="section-title"><div><h2>⭐ Prime Plus</h2><p>ПО АЙДИ</p></div></section>
    <div class="prime-list">${state.products.prime_plus.map(p => `<article class="card prime-item"><div class="star">⭐</div><div><b>${p.title}</b><p class="muted">PUBG ID</p></div><button class="primary-btn" data-prime="${p.id}">${rub(p.priceRub)}</button></article>`).join('')}</div>
    ${renderCart()}
  `;
  document.querySelectorAll('[data-prime]').forEach(btn => btn.onclick = () => { addToCart(findProduct(btn.dataset.prime), 1); toast(L('added')); renderPrime(); });
  bindCheckout();
}
function renderCart() {
  const items = cartItems();
  return `<section class="card" style="margin-top:16px"><h3>🛒 ${L('cart')}</h3><p>• ${L('totalUc')}: ${cartUc()} UC<br/>• ${L('total')}: ${rub(cartTotal())}</p>${items.length ? items.map(x => `<div class="cart-line"><span>${x.qty} × ${x.title}</span><b>${rub(x.priceRub * x.qty)}</b></div>`).join('') : `<p class="muted">${L('empty')}</p>`}<div class="checkout"><button class="primary-btn" id="checkoutBtn">✅ ${L('checkout')}</button><button class="tab" id="clearCart">🧹 ${L('clear')}</button></div><div id="payBox"></div></section>`;
}
function bindCheckout() {
  const checkout = $('#checkoutBtn'); if (!checkout) return;
  checkout.onclick = () => {
    if (!cartItems().length) return toast(L('empty'));
    $('#payBox').innerHTML = `<div class="pay-methods" style="margin-top:12px"><b>${L('payment')}</b>${state.products.payments.map(p => `<button data-pay="${p}">${p}</button>`).join('')}</div>`;
    document.querySelectorAll('[data-pay]').forEach(btn => btn.onclick = () => createOrder(btn.dataset.pay));
  };
  $('#clearCart').onclick = () => { state.cart = {}; navigate(state.route); };
}
async function createOrder(paymentMethod) {
  const body = { items: cartItems(), pubgId: state.pubgId, paymentMethod };
  const res = await api('/api/orders', { method: 'POST', body: JSON.stringify(body) });
  toast(state.lang === 'ru' ? res.messageRu : res.messageEn);
  state.cart = {};
  try { state.orders = (await api('/api/orders/me')).orders || []; } catch {}
  setTimeout(() => navigate('profile'), 900);
}
function renderProfile() {
  const u = state.user || {};
  const spent = state.orders.reduce((s,o)=>s+Number(o.totalRub||0),0);
  main.innerHTML = `
    <section class="section-title"><div><h2>${L('profile')}</h2><p>${L('account')}</p></div></section>
    <div class="card profile-card">
      <div class="profile-head"><img src="${u.photoUrl || '/assets/mayki-logo.jpeg'}"/><div><h3>${u.firstName || 'MAYKI User'}</h3><p class="muted">@${u.username || 'telegram_user'}</p><span class="pill-link">${u.bonuses || 0} бонусов</span></div></div>
      <div class="stats"><div class="stat"><b>${state.orders.length}</b><span>${L('orders')}</span></div><div class="stat"><b>${rub(spent)}</b><span>${L('spent')}</span></div></div>
      <div class="stat"><b>${rub(u.balanceRub || 0)}</b><span>${L('balance')}</span></div>
      <p class="muted">TG ID: ${u.telegramId || u.id || '—'}<br/>Language: ${u.languageCode || state.lang}</p>
    </div>
    <section class="section-title"><div><h2>${L('orders')}</h2></div></section>
    <div class="prime-list">${state.orders.length ? state.orders.map(o => `<div class="history-item"><b>${o.id}</b><br/>${rub(o.totalRub)} • ${o.paymentMethod || '—'}<br/>${new Date(o.createdAt).toLocaleString('ru-RU')}<br/><span class="muted">${o.status}</span></div>`).join('') : `<div class="card muted">${L('noOrders')}</div>`}</div>
  `;
}

init().catch(err => { console.error(err); $('#loader').classList.add('hide'); toast('App error: ' + err.message); });
