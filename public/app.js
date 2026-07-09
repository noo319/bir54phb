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
    home: 'Главная',
    profile: 'Профиль',
    pubg: 'PUBG Mobile',
    prime: 'Prime Plus',
    choose: 'Выберите раздел',
    shop: 'MAYKI UC SHOP 24/7',
    gameStore: 'Игровой магазин',
    premiumStore: 'Премиальный магазин PUBG Mobile',
    delivery: 'Доставка: 2-5 минут',
    buy: 'Купить',
    custom: 'Купить своё количество',
    enterUc: 'Укажите сумму UC',
    cart: 'Корзина',
    totalUc: 'Всего UC',
    total: 'Общая сумма',
    checkout: 'Оформить заказ',
    clear: 'Очистить корзину',
    payment: 'Выберите способ оплаты',
    notReady: 'Бот пока не готов. Пожалуйста, подождите, пока мы полностью завершим разработку и подключение оплаты.',
    support: 'Поддержка',
    channel: 'Канал',
    orders: 'История заказов',
    spent: 'Потрачено',
    balance: 'Баланс',
    pubgId: 'Введите ваш PUBG ID',
    save: 'Сохранить',
    back: 'Назад',
    added: 'Добавлено в корзину',
    saved: 'Сохранено',
    empty: 'Корзина пустая',
    onlyNow: 'Пока доступны только UC и Prime Plus.',
    noOrders: 'Пока нет заказов',
    account: 'Управление аккаунтом',
    pubgSubtitle: 'UC / Prime Plus',
    telegramTitle: 'TELEGRAM',
    telegramSubtitle: 'Premium / Stars скоро',
    steamTitle: 'STEAM',
    steamSubtitle: 'Скоро',
    aboutTitle: '⚡ MAYKI UC BOT 24/7 VIP',
    aboutText: 'Быстрое, удобное и автоматическое Telegram Mini App. Данные аккаунта открываются напрямую из Telegram.',
    privacy: 'Политика конфиденциальности',
    terms: 'Пользовательское соглашение',
    normalUc: 'Обычные UC',
    promoUc: 'Акционные UC',
    activationId: 'Активация по ID',
    primeById: 'ПО АЙДИ',
    bonuses: 'бонусов',
    language: 'Язык',
    orderCount: 'Заказов',
    orderHistory: 'История заказов',
    paymentDisabled: 'Система оплаты пока находится в разработке',
    totalPayment: 'Итого к оплате',
    paymentMethod: 'Способ оплаты',
    telegramSoonMessage: 'Telegram Premium и Stars будут добавлены позже.',
    steamSoonMessage: 'Steam будет добавлен позже.'
  },
  en: {
    home: 'Home',
    profile: 'Profile',
    pubg: 'PUBG Mobile',
    prime: 'Prime Plus',
    choose: 'Choose section',
    shop: 'MAYKI UC SHOP 24/7',
    gameStore: 'Game store',
    premiumStore: 'Premium PUBG Mobile Store',
    delivery: 'Delivery: 2-5 minutes',
    buy: 'Buy',
    custom: 'Buy custom amount',
    enterUc: 'Enter UC amount',
    cart: 'Cart',
    totalUc: 'Total UC',
    total: 'Total amount',
    checkout: 'Checkout',
    clear: 'Clear cart',
    payment: 'Select payment method',
    notReady: 'The bot is not ready yet. Please wait until development and payment setup are fully complete.',
    support: 'Support',
    channel: 'Channel',
    orders: 'Order history',
    spent: 'Spent',
    balance: 'Balance',
    pubgId: 'Enter your PUBG ID',
    save: 'Save',
    back: 'Back',
    added: 'Added to cart',
    saved: 'Saved',
    empty: 'Cart is empty',
    onlyNow: 'Only UC and Prime Plus are available for now.',
    noOrders: 'No orders yet',
    account: 'Account management',
    pubgSubtitle: 'UC / Prime Plus',
    telegramTitle: 'TELEGRAM',
    telegramSubtitle: 'Premium / Stars soon',
    steamTitle: 'STEAM',
    steamSubtitle: 'Coming soon',
    aboutTitle: '⚡ MAYKI UC BOT 24/7 VIP',
    aboutText: 'Fast, clean and automatic Telegram Mini App. Account data opens directly from Telegram.',
    privacy: 'Privacy Policy',
    terms: 'User Agreement',
    normalUc: 'Normal UC',
    promoUc: 'Promo UC',
    activationId: 'Activation by ID',
    primeById: 'BY ID',
    bonuses: 'bonuses',
    language: 'Language',
    orderCount: 'Orders',
    orderHistory: 'Order history',
    paymentDisabled: 'Payment system is currently under development',
    totalPayment: 'Total to pay',
    paymentMethod: 'Payment method',
    telegramSoonMessage: 'Telegram Premium and Stars will be added later.',
    steamSoonMessage: 'Steam will be added later.'
  }
};

const $ = s => document.querySelector(s);
const main = $('#main');
const L = k => (t[state.lang] && t[state.lang][k]) || (t.ru && t.ru[k]) || k;
const rub = n => `${Number(n || 0).toLocaleString('ru-RU')} ₽`;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': tg?.initData || ''
  };
  const res = await fetch(path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function init() {
  state.config = await api('/api/config');
  state.products = state.config.products;

  const supportBtn = $('#supportBtn');
  const channelBtn = $('#channelBtn');
  if (supportBtn) supportBtn.href = state.config.brand.supportUrl;
  if (channelBtn) channelBtn.href = state.config.brand.channelUrl;

  const auth = await api('/api/auth/telegram', {
    method: 'POST',
    body: JSON.stringify({ initData: tg?.initData || '' })
  });
  state.user = auth.user;

  try {
    state.orders = (await api('/api/orders/me')).orders || [];
  } catch {
    state.orders = [];
  }

  bindGlobal();
  updateStaticTexts();
  navigate('home');
  setTimeout(() => $('#loader')?.classList.add('hide'), 500);
}

function bindGlobal() {
  document.body.addEventListener('click', e => {
    const route = e.target.closest('[data-route]')?.dataset.route;
    if (route) navigate(route);
  });
}

function setLanguage(lang) {
  state.lang = lang === 'en' ? 'en' : 'ru';
  localStorage.setItem('mayki_lang', state.lang);
  updateStaticTexts();
  navigate(state.route);
}

function updateStaticTexts() {
  const brandTitle = $('#brandTitle');
  const brandSubtitle = $('#brandSubtitle');
  if (brandTitle && state.config?.brand?.botName) {
    brandTitle.textContent = state.config.brand.botName.replace(' 24/7 VIP', '');
  }
  if (brandSubtitle) brandSubtitle.textContent = L('gameStore');

  const supportBtn = $('#supportBtn');
  const channelBtn = $('#channelBtn');
  if (supportBtn) setFloatingLabel(supportBtn, L('support'));
  if (channelBtn) setFloatingLabel(channelBtn, L('channel'));

  const dockLabels = {
    home: L('home'),
    pubg: 'UC\nPUBG',
    prime: 'Prime+',
    profile: L('profile')
  };

  document.querySelectorAll('#dock button[data-route]').forEach(button => {
    const label = dockLabels[button.dataset.route];
    const span = button.querySelector('span, .label, .dock-label');
    if (span && label) span.textContent = label;
  });

  document.documentElement.lang = state.lang;
}

function setFloatingLabel(el, label) {
  const target = el.querySelector('span, .label, b');
  if (target) target.textContent = label;
  el.setAttribute('aria-label', label);
  el.setAttribute('title', label);
}

function navigate(route) {
  state.route = route;
  document.querySelectorAll('#dock button').forEach(b => {
    b.classList.toggle('active', b.dataset.route === route);
  });

  if (route === 'home') return renderHome();
  if (route === 'pubg') return renderPubg();
  if (route === 'prime') return renderPrime();
  if (route === 'profile') return renderProfile();
}

function toast(msg) {
  const el = $('#toast');
  if (!el) return alert(msg);
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

function renderHome() {
  main.innerHTML = `
    <section class="section-title">
      <div>
        <h2>${L('choose')}</h2>
        <p>${L('shop')}</p>
      </div>
      <button class="tab" id="langBtn">${state.lang === 'ru' ? 'EN' : 'RU'}</button>
    </section>

    <div class="grid-cats">
      <article class="category-card" data-route="pubg" style="--image:linear-gradient(120deg,rgba(0,0,0,.35),rgba(0,0,0,.05)),url('/assets/mayki-logo.jpeg')">
        <div>
          <h3>PUBG MOBILE</h3>
          <p>${L('pubgSubtitle')}</p>
        </div>
      </article>

      <article class="category-card" onclick="toast('${escapeHtml(L('telegramSoonMessage'))}')" style="--image:radial-gradient(circle at 75% 30%,rgba(255,32,32,.35),transparent 26%),linear-gradient(120deg,#201114,#09080a)">
        <div>
          <h3>${L('telegramTitle')}</h3>
          <p>${L('telegramSubtitle')}</p>
        </div>
      </article>

      <article class="category-card" onclick="toast('${escapeHtml(L('steamSoonMessage'))}')" style="--image:linear-gradient(120deg,#101314,#141010)">
        <div>
          <h3>${L('steamTitle')}</h3>
          <p class="muted">${L('steamSubtitle')}</p>
        </div>
      </article>
    </div>

    <div class="card" style="margin-top:16px">
      <b>${L('aboutTitle')}</b>
      <p class="muted">${L('aboutText')}</p>
    </div>

    <div class="legal">
      <a href="#">${L('privacy')}</a><br/>
      <a href="#">${L('terms')}</a>
    </div>
  `;

  $('#langBtn').onclick = () => setLanguage(state.lang === 'ru' ? 'en' : 'ru');
}

function cartItems() {
  return Object.values(state.cart).filter(x => x.qty > 0);
}

function cartTotal() {
  return cartItems().reduce((sum, x) => sum + Number(x.priceRub || 0) * x.qty, 0);
}

function cartUc() {
  return cartItems().reduce((sum, x) => sum + Number(x.amount || 0) * x.qty, 0);
}

function addToCart(item, qty = 1) {
  if (!item) return;
  const existing = state.cart[item.id] || { ...item, qty: 0, type: item.amount ? 'uc' : 'prime' };
  existing.qty = Math.max(0, existing.qty + qty);
  state.cart[item.id] = existing;
  if (existing.qty === 0) delete state.cart[item.id];
}

function renderPubg() {
  const products = state.products.pubg_uc || [];

  main.innerHTML = `
    <section class="section-title">
      <div>
        <h2>${L('pubg')}</h2>
        <p>${L('delivery')}</p>
      </div>
    </section>

    <div class="card">
      <label class="muted">${L('pubgId')}</label>
      <div class="custom-box">
        <input class="input" id="pubgId" value="${escapeHtml(state.pubgId)}" placeholder="PUBG ID"/>
        <button class="primary-btn" id="savePubg">${L('save')}</button>
      </div>

      <div class="tabs">
        <button class="tab active">${L('normalUc')}</button>
        <button class="tab">${L('promoUc')}</button>
      </div>

      <div class="custom-box">
        <label>${L('custom')}</label>
        <input class="input" id="customUc" type="number" placeholder="${L('enterUc')}" />
      </div>
    </div>

    <section class="products-grid" style="margin-top:14px">
      ${products.map(productCard).join('')}
    </section>

    ${renderCart()}
  `;

  $('#savePubg').onclick = () => {
    state.pubgId = $('#pubgId').value.trim();
    localStorage.setItem('mayki_pubg_id', state.pubgId);
    toast(L('saved'));
  };

  $('#customUc').onchange = e => {
    const amount = Number(e.target.value || 0);
    if (!amount || amount < 1) return;

    const baseProduct = products.find(x => x.id === 'uc_660') || products[0];
    const pricePerUc = baseProduct ? Number(baseProduct.priceRub || 0) / Number(baseProduct.amount || 1) : 1.2;
    const price = Math.ceil(amount * pricePerUc);

    addToCart({
      id: `custom_${Date.now()}`,
      title: `${amount} UC`,
      amount,
      priceRub: price
    }, 1);

    renderPubg();
  };

  bindProductButtons(renderPubg);
  bindCheckout();
}

function productCard(p) {
  const qty = state.cart[p.id]?.qty || 0;
  return `
    <article class="product">
      <h4>${escapeHtml(p.title)}</h4>
      <div class="uc-icon"></div>
      <div class="price">${rub(p.priceRub)}</div>
      ${
        qty
          ? `<div class="qty-row"><button data-minus="${p.id}">-</button><b>${qty}</b><button data-plus="${p.id}">+</button></div>`
          : `<button class="buy" data-plus="${p.id}">${L('buy')}</button>`
      }
    </article>
  `;
}

function bindProductButtons(rerender) {
  document.querySelectorAll('[data-plus]').forEach(btn => {
    btn.onclick = () => {
      const item = findProduct(btn.dataset.plus);
      addToCart(item, 1);
      toast(L('added'));
      rerender();
    };
  });

  document.querySelectorAll('[data-minus]').forEach(btn => {
    btn.onclick = () => {
      const item = findProduct(btn.dataset.minus);
      addToCart(item, -1);
      rerender();
    };
  });
}

function findProduct(id) {
  return [
    ...(state.products?.pubg_uc || []),
    ...(state.products?.prime_plus || [])
  ].find(x => x.id === id);
}

function translatedPrimeTitle(p) {
  const title = String(p.title || '');

  if (state.lang === 'ru') return title;

  const lower = title.toLowerCase();
  if (lower.includes('1') || lower.includes('месяц')) return 'Prime Plus 1 month';
  if (lower.includes('3')) return 'Prime Plus 3 months';
  if (lower.includes('6')) return 'Prime Plus 6 months';
  if (lower.includes('12')) return 'Prime Plus 12 months';

  return title
    .replace('месяц', 'month')
    .replace('месяца', 'months')
    .replace('месяцев', 'months');
}

function renderPrime() {
  main.innerHTML = `
    <section class="section-title">
      <div>
        <h2>⭐ Prime Plus</h2>
        <p>${L('primeById')}</p>
      </div>
    </section>

    <div class="prime-list">
      ${(state.products.prime_plus || []).map(p => `
        <article class="card prime-item">
          <div class="star">⭐</div>
          <div>
            <b>${escapeHtml(translatedPrimeTitle(p))}</b>
            <p class="muted">${L('activationId')}</p>
          </div>
          <button class="primary-btn" data-prime="${p.id}">${rub(p.priceRub)}</button>
        </article>
      `).join('')}
    </div>

    ${renderCart()}
  `;

  document.querySelectorAll('[data-prime]').forEach(btn => {
    btn.onclick = () => {
      addToCart(findProduct(btn.dataset.prime), 1);
      toast(L('added'));
      renderPrime();
    };
  });

  bindCheckout();
}

function renderCart() {
  const items = cartItems();

  return `
    <section class="card" style="margin-top:16px">
      <h3>🛒 ${L('cart')}</h3>
      <p>
        • ${L('totalUc')}: ${cartUc()} UC<br/>
        • ${L('total')}: ${rub(cartTotal())}
      </p>

      ${
        items.length
          ? items.map(x => `<div class="cart-line"><span>${x.qty} × ${escapeHtml(x.title)}</span><b>${rub(x.priceRub * x.qty)}</b></div>`).join('')
          : `<p class="muted">${L('empty')}</p>`
      }

      <div class="checkout">
        <button class="primary-btn" id="checkoutBtn">✅ ${L('checkout')}</button>
        <button class="tab" id="clearCart">🧹 ${L('clear')}</button>
      </div>

      <div id="payBox"></div>
    </section>
  `;
}

function bindCheckout() {
  const checkout = $('#checkoutBtn');
  if (!checkout) return;

  checkout.onclick = () => {
    if (!cartItems().length) return toast(L('empty'));

    $('#payBox').innerHTML = `
      <div class="pay-methods" style="margin-top:12px">
        <b>${L('payment')}</b>
        ${(state.products.payments || []).map(p => `<button data-pay="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join('')}
      </div>
    `;

    document.querySelectorAll('[data-pay]').forEach(btn => {
      btn.onclick = () => createOrder(btn.dataset.pay);
    });
  };

  $('#clearCart').onclick = () => {
    state.cart = {};
    navigate(state.route);
  };
}

async function createOrder(paymentMethod) {
  const body = {
    items: cartItems(),
    pubgId: state.pubgId,
    paymentMethod
  };

  const res = await api('/api/orders', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  toast(state.lang === 'ru' ? res.messageRu : res.messageEn);
  state.cart = {};

  try {
    state.orders = (await api('/api/orders/me')).orders || [];
  } catch {
    state.orders = [];
  }

  setTimeout(() => navigate('profile'), 900);
}

function renderProfile() {
  const u = state.user || {};
  const spent = state.orders.reduce((s, o) => s + Number(o.totalRub || 0), 0);
  const userName = escapeHtml(u.firstName || u.first_name || 'MAYKI User');
  const username = escapeHtml(u.username || 'telegram_user');

  main.innerHTML = `
    <section class="section-title">
      <div>
        <h2>${L('profile')}</h2>
        <p>${L('account')}</p>
      </div>
    </section>

    <div class="card profile-card">
      <div class="profile-head">
        <img src="${escapeHtml(u.photoUrl || u.photo_url || '/assets/mayki-logo.jpeg')}" alt="profile"/>
        <div>
          <h3>${userName}</h3>
          <p class="muted">@${username}</p>
          <span class="pill-link">${Number(u.bonuses || 0)} ${L('bonuses')}</span>
        </div>
      </div>

      <div class="stats">
        <div class="stat">
          <b>${state.orders.length}</b>
          <span>${L('orderCount')}</span>
        </div>
        <div class="stat">
          <b>${rub(spent)}</b>
          <span>${L('spent')}</span>
        </div>
      </div>

      <div class="stat">
        <b>${rub(u.balanceRub || 0)}</b>
        <span>${L('balance')}</span>
      </div>

      <p class="muted">
        TG ID: ${escapeHtml(u.telegramId || u.id || '—')}<br/>
        ${L('language')}: ${escapeHtml(u.languageCode || state.lang)}
      </p>
    </div>

    <section class="section-title">
      <div><h2>${L('orderHistory')}</h2></div>
    </section>

    <div class="prime-list">
      ${
        state.orders.length
          ? state.orders.map(o => `
            <div class="history-item">
              <b>${escapeHtml(o.id)}</b><br/>
              ${rub(o.totalRub)} • ${escapeHtml(o.paymentMethod || '—')}<br/>
              ${new Date(o.createdAt).toLocaleString(state.lang === 'ru' ? 'ru-RU' : 'en-US')}<br/>
              <span class="muted">${escapeHtml(o.status || L('paymentDisabled'))}</span>
            </div>
          `).join('')
          : `<div class="card muted">${L('noOrders')}</div>`
      }
    </div>
  `;
}

init().catch(err => {
  console.error(err);
  $('#loader')?.classList.add('hide');
  toast('App error: ' + err.message);
});
