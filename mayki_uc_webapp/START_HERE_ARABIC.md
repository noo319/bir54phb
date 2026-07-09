# ابدأ من هنا — MAYKI UC WEBAPP

هذا هو الملف الرئيسي للمشروع.

## طريقة الرفع على GitHub

ارفع محتويات مجلد `mayki_uc_webapp` بالكامل، وليس المجلد المضغوط فقط.

يجب أن تظهر هذه الملفات في الصفحة الرئيسية للـ Repository:

- `package.json`
- `Dockerfile`
- `railway.json`
- `nixpacks.toml`
- `src/`
- `public/`
- `data/`
- `.env.example`
- `README.md`

## طريقة التشغيل على Railway

1. ارفع المشروع على GitHub.
2. افتح Railway.
3. اختر Deploy from GitHub.
4. اختر الـ Repository.
5. Railway سيستخدم `Dockerfile` تلقائيًا.
6. بعد التشغيل، افتح الرابط الذي يعطيك Railway.

## ملاحظات مهمة

- لا ترفع `node_modules`.
- لا تضع Bot Token داخل الملفات.
- ضع التوكن فقط داخل Variables في Railway لاحقًا.
- المشروع يعمل حتى بدون Bot Token للمعاينة داخل المتصفح.
- عند ربطه من BotFather كتطبيق مصغر، سيقرأ بيانات مستخدم تيليجرام تلقائيًا.

## Variables في Railway لاحقًا

```env
BOT_TOKEN=ضع توكن البوت هنا
ADMIN_IDS=ضع Telegram ID للمشرف
SUPPORT_URL=https://t.me/Mayki_UC_manager
CHANNEL_URL=https://t.me/Mayki_uc_shop
ALLOW_BROWSER_DEMO=true
```
