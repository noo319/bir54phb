# MAYKI UC BOT 24/7 VIP — Telegram Mini App

مشروع كامل كبداية احترافية لـ Telegram Mini App مرتبط ببوت تيليجرام.

## الميزات الموجودة

- تصميم احترافي أسود / أحمر نيون مستوحى من شعار MAYKI.
- صفحة رئيسية للمتجر.
- قسم PUBG Mobile UC.
- قسم Prime Plus.
- ملف شخصي يقرأ بيانات المستخدم من Telegram Mini App `initData`.
- حفظ المستخدمين والطلبات محليًا داخل ملف `data/runtime.json` كبداية.
- سلة مشتريات مع + / - وكمية مخصصة.
- أسعار الروبل التي تم تحديدها.
- طرق الدفع: СБП / Банковские карты РФ / USDT.
- عند الدفع تظهر رسالة أن النظام غير جاهز بعد.
- أزرار دعم وقناة:
  - Support: https://t.me/Mayki_UC_manager
  - Channel: https://t.me/Mayki_uc_shop
- جاهز للرفع على GitHub وربطه مع Railway.

## التشغيل محليًا

```bash
npm install
cp .env.example .env
npm run dev
```

افتح:

```text
http://localhost:3000
```

## النشر على Railway

1. ارفع الملفات إلى GitHub.
2. افتح Railway.
3. New Project → Deploy from GitHub repo.
4. أضف Environment Variables:

```env
BOT_TOKEN=توكن البوت من BotFather
ADMIN_IDS=Telegram_ID_المشرف
WEBAPP_URL=https://your-railway-domain.up.railway.app
SUPPORT_URL=https://t.me/Mayki_UC_manager
CHANNEL_URL=https://t.me/Mayki_uc_shop
```

## الربط مع Telegram Mini App

1. افتح BotFather.
2. اختر البوت.
3. Bot Settings → Menu Button أو Web App.
4. ضع رابط Railway الخاص بالموقع.
5. داخل البوت أضف زر مثل:

```text
ОТКРЫТЬ ПРИЛОЖЕНИЕ
```

ويفتح رابط الموقع.

## ملاحظات مهمة

- في بيئة التطوير بدون `BOT_TOKEN` يستخدم الموقع مستخدم تجريبي حتى تقدر تشاهد التصميم.
- عند إضافة `BOT_TOKEN` في Railway، السيرفر يتحقق من توقيع Telegram `initData` بشكل آمن.
- الدفع حاليًا غير مفعل فعليًا؛ الأزرار تعرض رسالة جاهزية فقط كما طلبت.
- يمكن لاحقًا ربط الدفع الحقيقي أو لوحة المشرف أو بوت الإشعارات.

## المنتجات الحالية

### UC

- 60 UC — 75₽
- 325 UC — 400₽
- 385 UC — 480₽
- 660 UC — 780₽
- 720 UC — 860₽
- 985 UC — 1180₽
- 1045 UC — 1260₽
- 1320 UC — 1560₽
- 1800 UC — 1900₽
- 3850 UC — 3750₽
- 8100 UC — 7400₽

### Prime Plus

- 1 месяц — 950₽
- 3 месяца — 2500₽
- 6 месяцев — 4900₽
- 12 месяцев — 9450₽
