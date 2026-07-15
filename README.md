# SurpriseCode — دليل الرفع على GitHub وVercel

## الملفات
```
surprisecode/
├── server.js          ← الـ Backend (Express)
├── db.js              ← طبقة تخزين البيانات (Neon Postgres)
├── vercel.json         ← إعداد النشر على Vercel
├── package.json
├── .env                ← القيم الحقيقية (ما بيترفعش على GitHub خالص)
├── .env.example         ← نموذج فاضي آمن يترفع على GitHub
├── .gitignore
└── public/
    ├── index.html
    ├── style.css
    └── script.js       ← متصل بالـ Backend
```

---

## ليه فيه db.js دلوقتي؟

المشروع كان بيحفظ كل حاجة (مشاريع، طلبات، تقييمات...) في ملف `db.json` على السيرفر
نفسه. ده بيشتغل تمام على سيرفر عادي بيفضل شغال (زي Render)، لكن **مش بيشتغل على
Vercel** — لأن Vercel بيشغل السيرفر كـ "Serverless Function" بيتقفل بعد كل طلب،
وأي حاجة اتكتبت في ملف محلي بتتمسح.

الحل: البيانات كلها بقت بتتخزن في قاعدة بيانات **Neon** (نسخة مجانية من Postgres،
مصممة أصلاً عشان تشتغل مع Vercel). الكود في `server.js` نفسه ما اتغيرش في المنطق —
بس `readDB()` و`writeDB()` بقوا بيقروا/يكتبوا من Neon بدل الملف المحلي.

---

## خطوة ١ — اعمل قاعدة بيانات Neon (مجانية)

1. روح على [neon.tech](https://neon.tech) وسجّل (فيه Free Tier سخي، هيكفي المشروع ده براحة)
2. اعمل **New Project**
3. من الداشبورد، انسخ الـ **Connection String** (شكله تقريبًا
   `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`)
4. حطه في `.env` بتاعك المحلي جنب `DATABASE_URL=`

## خطوة ٢ — جرّب محليًا الأول

```bash
cd surprisecode
npm install
node server.js
# افتح http://localhost:8080 وجرّب تعمل طلب أو تقييم وشوفهم بيتحفظوا صح
```

---

## خطوة ٣ — ارفع على GitHub

```bash
git init
git add .
git commit -m "SurpriseCode first commit"
# على github.com → New Repository → surprisecode (سيبه Private لو عايز)
git remote add origin https://github.com/اسمك/surprisecode.git
git branch -M main
git push -u origin main
```

**تأكد قبل ما تعمل push إن:**
- ملف `.env` مش موجود في الـ commit (اتأكد بـ `git status` إنه مش من ضمن الملفات)
- مفيش أي باسورد أو كود حقيقي متكتوب في أي ملف تاني (README، تعليقات...)

---

## خطوة ٤ — ارفع على Vercel

1. اتفضل على [vercel.com](https://vercel.com) وسجّل بـ GitHub
2. اضغط **Add New → Project** واختار الـ repo بتاعك
3. Vercel هيكتشف `vercel.json` أوتوماتيك، مش محتاج تغيّر إعدادات Build
4. في **Environment Variables** ضيف بالظبط نفس المتغيرات اللي في `.env` بتاعك محليًا:
   - `ADMIN_EMAIL`
   - `GMAIL_APP_PASS`
   - `ADMIN_USER`
   - `ADMIN_PASS`
   - `SESSION_SECRET`
   - `DATABASE_URL`
5. اضغط **Deploy** ✅
6. بعد ما يخلص، هيديك رابط زي `surprisecode.vercel.app` — افتحه وجرّب كل حاجة (تسجيل دخول الأدمن، طلب، تقييم) وشوفها بتتحفظ فعلاً

---

## ملاحظات مهمة

- **البيانات كلها** (مشاريع، طلبات، تقييمات، إعدادات) متخزنة في Neon دلوقتي — مش هتتمسح مع أي إعادة نشر أو إعادة تشغيل
- **نسخة احتياطية يومية** بتتحفظ تلقائي جوه Neon نفسه (آخر 14 يوم) — لو حصل خطأ ومسحت حاجة غلط، فيه راوت أدمن `GET /api/admin/backups` يوريك النسخ المتاحة، و`POST /api/admin/backups/:date/restore` يرجع لنسخة معينة
- لو غيرت أي حاجة في السيرفر، `git push` بس هيكفي — Vercel بيعيد النشر أوتوماتيك مع كل push على main
- عايز تضيف مشاريع جديدة أو تعدل الأسعار؟ من لوحة الأدمن في الموقع نفسه — مش محتاج تلمس الكود
