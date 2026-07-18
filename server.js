require('dotenv').config();
const express      = require('express');
const bcrypt       = require('bcryptjs');
const cors         = require('cors');
const path         = require('path');
const fs           = require('fs');
const crypto       = require('crypto');
const nodemailer   = require('nodemailer');
const compression  = require('compression');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const { readDB, writeDB, listBackups, restoreBackup, getOtp, setOtp, deleteOtp } = require('./db');

const app  = express();
const PORT = process.env.PORT || 8080;

// ── Session Secret (لتوقيع التوكنات) ───────────────────────────────────────────
// لازم يبقى في .env باسم SESSION_SECRET. لو مش موجود، بننشئ واحد عشوائي كل تشغيل
// (يعني كل مرة تعمل restart للسيرفر، كل الأدمنز المسجلين هيتطلب منهم يدخلوا تاني - ده أأمن)
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET مش موجود في .env — تم توليد واحد مؤقت. حط SESSION_SECRET ثابت في .env عشان الجلسات متتلغيش مع كل إعادة تشغيل.');
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  try {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && Date.now() > payload.exp) return null; // انتهت صلاحية الجلسة
    return payload;
  } catch (_) { return null; }
}

// ── Email ─────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.ADMIN_EMAIL, pass: process.env.GMAIL_APP_PASS }
});
// ملحوظة: أكواد الـ OTP بقت متخزنة في قاعدة البيانات (شوف db.js) مش في الذاكرة هنا

function generateOTP() { return Math.floor(100000 + Math.random() * 900000).toString(); }

async function sendOTP(email, otp) {
  await transporter.sendMail({
    from: `"SurpriseCode 🎁" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: `🔐 كود الدخول: ${otp}`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#1e2620;border-radius:16px;padding:32px;text-align:center">
      <h2 style="color:#b89968;font-size:28px;margin-bottom:8px">SurpriseCode 🎁</h2>
      <p style="color:#cdc5b4;font-size:15px;margin-bottom:24px">كود الدخول لحساب الأدمن</p>
      <div style="background:#2b3327;border-radius:12px;padding:24px;margin:20px 0;border:2px solid #b89968">
        <div style="color:#b89968;font-size:13px;letter-spacing:2px;margin-bottom:8px">الكود السري</div>
        <div style="color:#fff;font-size:48px;font-weight:900;letter-spacing:10px">${otp}</div>
      </div>
      <p style="color:#9a9583;font-size:13px">الكود صالح لمدة <b style="color:#b89968">10 دقائق</b> فقط</p>
      <p style="color:#5a5446;font-size:11px;margin-top:16px">SurpriseCode © 2026</p>
    </div>`
  });
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({ windowMs: 15*60*1000, max: 100, message: { ok:false, msg:'كتير أوي. استنى شوية.' } });
const otpLimiter = rateLimit({ windowMs: 15*60*1000, max: 5,   message: { ok:false, msg:'كتير أوي. استنى 15 دقيقة.' } });
app.use('/api/', apiLimiter);

// ── IP Block Middleware ───────────────────────────────────────────────────────
app.use(async (req, res, next) => {
  // متطلبش قاعدة البيانات لكل ملف ثابت (css/js/صور...) — بس للصفحات وطلبات الـ API
  // عشان منعملش نداء لقاعدة البيانات مع كل صورة أو ملف في الصفحة (ده هيبطّئ الموقع من غير داعي)
  if (/\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|map)$/i.test(req.path)) return next();
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const db = (await readDB());
    if ((db.blockedIPs||[]).includes(ip)) return res.status(403).json({ ok:false, msg:'محظور' });
    if (db.maintenanceMode && !req.path.startsWith('/api/admin')) {
      if (req.path.endsWith('.html') || req.path === '/') {
        return res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>صيانة</title>
        <style>body{background:#1e2620;color:#ece3d8;font-family:Tajawal,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}
        h1{color:#b89968;font-size:40px}p{font-size:18px;color:#9a9583;margin-top:16px}</style></head>
        <body><div><div style="font-size:64px">🔧</div><h1>SurpriseCode</h1><p>${db.maintenanceMsg}</p></div></body></html>`);
      }
    }
  } catch (e) {
    // لو قاعدة البيانات وقعت لحظة، منسيبش الموقع كله يقف — نخلي الطلب يعدي عادي
    // (أهم حاجة إن حد ما يشوفش رسالة خطأ فنية أو تفاصيل السيرفر الداخلية)
    console.error('IP-block middleware DB error:', e.message);
  }
  next();
});

// ── Open Graph Meta Tags لكل مشروع (عشان معاينة الروابط في واتساب/فيسبوك تبقى صح) ──
app.get('/project-details.html', async (req, res, next) => {
  const id = req.query.id;
  if (!id) return next();
  const db = (await readDB());
  const proj = (db.projects || []).find(p => String(p.id) === String(id));
  if (!proj) return next();

  fs.readFile(path.join(__dirname, 'public', 'project-details.html'), 'utf8', (err, html) => {
    if (err) return next();
    const title = `${proj.ar.n} — SurpriseCode`;
    const desc = proj.ar.d || 'مفاجآت وهدايا رقمية تفاعلية من SurpriseCode';
    const image = (proj.imgs && proj.imgs[0]) || '';
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const ogTags = `
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
`;
    html = html.replace('<title>تفاصيل المشروع — SurpriseCode</title>', `<title>${title}</title>${ogTags}`);
    res.send(html);
  });
});

// ── Static Files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  setHeaders: (res, filePath) => {
    // منع المتصفح من تخزين نسخة قديمة من الموقع — كل تعديل هيظهر فوراً
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// ── Visit Tracking ────────────────────────────────────────────────────────────
app.post('/api/visit', async (req, res) => {
  const { source, country, page } = req.body;
  const db = (await readDB());
  db.visits++;
  if (!db.visitLog) db.visitLog = [];
  
  const today = new Date().toISOString().split('T')[0];
  db.visitLog.push({
    date: today,
    source: source || 'direct',
    country: country || 'unknown',
    page: page || '/',
    time: new Date().toISOString()
  });
  // احتفظ بآخر 10,000 زيارة
  if (db.visitLog.length > 10000) db.visitLog = db.visitLog.slice(-10000);
  await writeDB(db);
  res.json({ visits: db.visits });
});

app.get('/api/visits', async (req, res) => res.json({ visits: (await readDB()).visits }));

// ── Projects ──────────────────────────────────────────────────────────────────
app.get('/api/projects', async (req, res) => res.json((await readDB()).projects));

// ── Game Config (Public) ──────────────────────────────────────────────────────
app.get('/api/game-config', async (req, res) => {
  const db = (await readDB());
  res.json(db.gameConfig || {});
});

// ── OTP ───────────────────────────────────────────────────────────────────────
app.post('/api/admin/request-otp', otpLimiter, async (req, res) => {
  const { email } = req.body;
  if (email !== process.env.ADMIN_EMAIL) {
    await new Promise(r => setTimeout(r, 1000));
    return res.status(401).json({ ok:false, msg:'الإيميل غير مسجل' });
  }
  const existing = await getOtp(email);
  if (existing && existing.expires > Date.now() && existing.attempts >= 3) {
    const mins = Math.ceil((existing.expires - Date.now()) / 60000);
    return res.status(429).json({ ok:false, msg:`كتير أوي. استنى ${mins} دقيقة` });
  }
  const otp = generateOTP();
  await setOtp(email, { otp, expires: Date.now() + 10*60*1000, attempts: (existing?.attempts||0)+1 });
  try {
    await sendOTP(email, otp);
    res.json({ ok:true, msg:'تم إرسال الكود' });
  } catch(e) {
    console.error('Email error:', e.message);
    res.status(500).json({ ok:false, msg:'فشل إرسال الإيميل' });
  }
});

app.post('/api/admin/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const stored = await getOtp(email);
  if (!stored) return res.status(401).json({ ok:false, msg:'لم يتم طلب كود' });
  if (Date.now() > stored.expires) { await deleteOtp(email); return res.status(401).json({ ok:false, msg:'الكود انتهت صلاحيته' }); }
  if (stored.otp !== otp) return res.status(401).json({ ok:false, msg:'الكود غلط' });
  await deleteOtp(email);
  const token = signToken({ email, role: 'admin', exp: Date.now() + 7*24*60*60*1000 });
  const db = (await readDB());
  if (!db.loginLog) db.loginLog = [];
  db.loginLog.unshift({ type:'success', email, time: new Date().toISOString(), ip: req.ip });
  db.loginLog = db.loginLog.slice(0, 100);
  await writeDB(db);
  res.json({ ok:true, token });
});

// ── Sub-admin Login (بكود مؤقت اتبعت على الإيميل) ─────────────────────────────
const subLoginLimiter = rateLimit({ windowMs: 15*60*1000, max: 8, message: { ok:false, msg:'كتير أوي. استنى شوية.' } });
app.post('/api/admin/sub-login', subLoginLimiter, async (req, res) => {
  const { email, code } = req.body;
  const db = (await readDB());
  const sub = (db.subAdmins||[]).find(s => s.email === email && s.active);
  if (!sub || !bcrypt.compareSync(code || '', sub.pass)) {
    return res.status(401).json({ ok:false, msg:'بيانات غلط' });
  }
  const token = signToken({ email, role: 'sub', permissions: sub.permissions||[], exp: Date.now() + 7*24*60*60*1000 });
  db.loginLog = db.loginLog || [];
  db.loginLog.unshift({ type:'success', email, sub:true, time: new Date().toISOString(), ip: req.ip });
  db.loginLog = db.loginLog.slice(0, 100);
  await writeDB(db);
  res.json({ ok:true, token, permissions: sub.permissions||[] });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
async function auth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ ok:false });
  const payload = verifyToken(token);
  if (payload && (payload.role === 'admin' || payload.role === 'sub')) {
    req.adminAuth = payload;
    return next();
  }
  // سجّل المحاولة الفاشلة
  const db = (await readDB());
  if (!db.loginLog) db.loginLog = [];
  db.loginLog.unshift({ type:'fail', ip: req.ip, time: new Date().toISOString() });
  db.loginLog = db.loginLog.slice(0, 100);
  await writeDB(db);
  res.status(401).json({ ok:false });
}

// الأدمن الرئيسي (role==='admin') يقدر يعمل أي حاجة دايمًا.
// مساعد الأدمن (role==='sub') لازم يكون معاه الصلاحية المطلوبة تحديدًا (permissions[])،
// وإلا بيترفض حتى لو التوكن بتاعه سليم — ده اللي كان ناقص وبيخلي أي مساعد يوصل لكل حاجة.
function requirePermission(perm) {
  return function(req, res, next) {
    if (req.adminAuth.role === 'admin') return next();
    if (req.adminAuth.role === 'sub' && (req.adminAuth.permissions || []).includes(perm)) return next();
    return res.status(403).json({ ok:false, msg:'ماعندكش صلاحية تعمل ده' });
  };
}
// راوتس حساسة (المشاريع، الأسعار، الإحصائيات، الإعدادات، المساعدين، الدفع...) للأدمن الرئيسي بس
function requireAdmin(req, res, next) {
  if (req.adminAuth.role === 'admin') return next();
  return res.status(403).json({ ok:false, msg:'للأدمن الرئيسي بس' });
}

// ── Pricing Plans (Public) ────────────────────────────────────────────────────
app.get('/api/pricing-plans', async (req, res) => {
  const db = (await readDB());
  const plans = (db.pricingPlans || []).filter(p => p.active !== false).sort((a,b)=>(a.order||0)-(b.order||0));
  res.json(plans);
});

// ── Admin: Pricing Plans ──────────────────────────────────────────────────────
app.get('/api/admin/pricing-plans', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  res.json((db.pricingPlans || []).sort((a,b)=>(a.order||0)-(b.order||0)));
});

app.post('/api/admin/pricing-plans', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  if (!db.pricingPlans) db.pricingPlans = [];
  const plan = { id: 'plan_' + Date.now(), active: true, order: db.pricingPlans.length + 1, ...req.body };
  db.pricingPlans.push(plan);
  await writeDB(db);
  res.json({ ok:true, plan });
});

app.put('/api/admin/pricing-plans/:id', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  const idx = (db.pricingPlans||[]).findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok:false });
  db.pricingPlans[idx] = { ...db.pricingPlans[idx], ...req.body, id: db.pricingPlans[idx].id };
  await writeDB(db);
  res.json({ ok:true, plan: db.pricingPlans[idx] });
});

// تفعيل/إخفاء باقة من غير حذفها
app.put('/api/admin/pricing-plans/:id/toggle', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  const plan = (db.pricingPlans||[]).find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ ok:false });
  plan.active = req.body.active !== undefined ? req.body.active : !plan.active;
  await writeDB(db);
  res.json({ ok:true, plan });
});

app.delete('/api/admin/pricing-plans/:id', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  db.pricingPlans = (db.pricingPlans||[]).filter(p => p.id !== req.params.id);
  await writeDB(db);
  res.json({ ok:true });
});


app.post('/api/admin/projects', auth, requireAdmin, async (req, res) => {
  const { name, desc, about, price, originalPrice, link, instagramLink, imgs, icon } = req.body;
  if (!name) return res.status(400).json({ ok:false });
  const db = (await readDB());
  const proj = { 
    id:Date.now(), ic: icon || '🎁', 
    ar:{n:name,d:desc||'',about:about||''}, 
    en:{n:name,d:desc||'',about:about||''}, 
    price:parseInt(price)||0, 
    originalPrice: originalPrice ? (parseInt(originalPrice)||0) : 0,
    link:link||'#', 
    instagramLink:instagramLink||'',
    imgs:imgs||[] 
  };
  db.projects.push(proj); await writeDB(db);
  res.json({ ok:true, project:proj });
});

app.delete('/api/admin/projects/:id', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  db.projects = db.projects.filter(p => p.id !== parseInt(req.params.id));
  await writeDB(db); res.json({ ok:true });
});

app.put('/api/admin/projects/:id', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  const idx = db.projects.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ ok:false });
  const { name, desc, about, price, originalPrice, link, instagramLink, imgs, icon } = req.body;
  db.projects[idx] = { ...db.projects[idx], ic: icon || db.projects[idx].ic || '🎁', ar:{n:name,d:desc||'',about:about||db.projects[idx].ar?.about||''}, en:{n:name,d:desc||'',about:about||db.projects[idx].en?.about||''}, price:parseInt(price)||0, originalPrice: originalPrice!==undefined ? (parseInt(originalPrice)||0) : (db.projects[idx].originalPrice||0), link:link||db.projects[idx].link||'#', instagramLink:instagramLink||db.projects[idx].instagramLink||'', imgs:imgs||db.projects[idx].imgs||[] };
  await writeDB(db); res.json({ ok:true, project:db.projects[idx] });
});

// ── Admin: Orders ─────────────────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  const { name, phone, items, total, note, itemIds } = req.body;
  if (!name || !phone) return res.status(400).json({ ok:false });
  const db = (await readDB());
  if (!db.orders) db.orders = [];

  // لو العميل بعت أرقام معرّفات حقيقية (itemIds)، نحسب الإجمالي من السيرفر عشان الأمان
  // لو مبعتش (مثلاً باقة اختارها بس مش مربوطة بمعرّف)، بنستخدم اللي بعته كـ fallback ونعلّمه للمراجعة اليدوية
  let verifiedTotal = null;
  if (Array.isArray(itemIds) && itemIds.length) {
    const allSources = [...(db.projects||[]), ...(db.pricingPlans||[])];
    let sum = 0; let allFound = true;
    itemIds.forEach(id => {
      const src = allSources.find(s => String(s.id) === String(id));
      if (src) sum += src.price; else allFound = false;
    });
    if (allFound) verifiedTotal = sum;
  }

  const order = {
    id:Date.now(), orderNum:'SC'+String(db.orders.length+1).padStart(4,'0'),
    name, phone, items, total: verifiedTotal !== null ? verifiedTotal : total,
    totalVerified: verifiedTotal !== null,
    note, status:'pending', date:new Date().toISOString()
  };
  db.orders.push(order); await writeDB(db);
  res.json({ ok:true, orderNum:order.orderNum });
});

// معدّل طلبات صارم جداً هنا تحديداً — عشان محدش يقدر "يجرب" كل أرقام التليفونات
// ويوصل لبيانات عملاء تانيين (السيرفر بيقبل رقم التليفون بس من غير كود تأكيد تاني)
const trackLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, message: { ok:false, msg:'كتير أوي. استنى شوية.' } });
app.get('/api/orders/track/:phone', trackLimiter, async (req, res) => {
  const db = (await readDB());
  const orders = (db.orders||[]).filter(o => o.phone === req.params.phone);
  if (!orders.length) return res.json({ ok:false, msg:'لا يوجد طلبات' });
  // من غير تفاصيل المنتجات — بس اللي محتاجه العميل يتابع بيه طلبه
  res.json({ ok:true, orders: orders.map(o => ({ orderNum:o.orderNum, status:o.status, date:o.date, total:o.total })) });
});

app.put('/api/admin/orders/:id/status', auth, requirePermission('orders'), async (req, res) => {
  const db = (await readDB());
  if (!db.orders) db.orders = [];
  const order = db.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ ok:false });
  order.status = req.body.status;
  if (req.body.note) order.adminNote = req.body.note;
  await writeDB(db); res.json({ ok:true });
});

app.get('/api/admin/orders', auth, requirePermission('orders'), async (req, res) => res.json((await readDB()).orders || []));

// ── Admin: Reviews ────────────────────────────────────────────────────────────
app.post('/api/reviews', async (req, res) => {
  const { name, occasion, text, stars, img } = req.body;
  if (!name || !text) return res.status(400).json({ ok:false });
  const db = (await readDB());
  if (!db.reviews) db.reviews = [];
  db.reviews.push({ id:Date.now(), name, occasion, text, stars:stars||5, img:img||null, date:new Date().toISOString() });
  await writeDB(db); res.json({ ok:true });
});

app.get('/api/reviews', async (req, res) => res.json((await readDB()).reviews || []));

// ── Game Leaderboard (مشتركة بين كل الزوار — بدل localStorage اللي كانت بتفضل عند كل واحد لوحده) ──
app.get('/api/leaderboard', async (req, res) => {
  const db = (await readDB());
  res.json((db.leaderboard || []).slice(0, 100));
});
app.post('/api/leaderboard', async (req, res) => {
  let { name, score, stage } = req.body || {};
  name = String(name || '').trim().slice(0, 20);
  score = Number(score);
  stage = Number(stage);
  // تحقق بسيط من صحة الأرقام عشان محدش يبعت قيم غريبة يخرب بيها اللوحة
  if (!name || !Number.isFinite(score) || score < 0 || score > 5_000_000 || !Number.isFinite(stage) || stage < 1 || stage > 999) {
    return res.status(400).json({ ok:false, msg:'بيانات غير صالحة' });
  }
  const db = (await readDB());
  if (!db.leaderboard) db.leaderboard = [];
  const idx = db.leaderboard.findIndex(p => p.name === name);
  if (idx >= 0) {
    if (score > db.leaderboard[idx].score) { db.leaderboard[idx].score = score; db.leaderboard[idx].stage = stage; }
  } else {
    db.leaderboard.push({ name, score, stage });
  }
  db.leaderboard.sort((a, b) => b.score - a.score);
  db.leaderboard = db.leaderboard.slice(0, 100);
  await writeDB(db);
  res.json({ ok:true, leaderboard: db.leaderboard });
});

app.delete('/api/admin/reviews/:id', auth, requirePermission('reviews'), async (req, res) => {
  const db = (await readDB());
  if (!db.reviews) db.reviews = [];
  db.reviews = db.reviews.filter(r => r.id !== parseInt(req.params.id));
  await writeDB(db); res.json({ ok:true });
});

// ── Admin: Stats ──────────────────────────────────────────────────────────────
app.get('/api/admin/stats', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  const orders = db.orders || [];
  const log = db.visitLog || [];
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now()-7*24*60*60*1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now()-30*24*60*60*1000).toISOString().split('T')[0];

  // مصادر الزيارات
  const sources = {};
  log.forEach(v => { sources[v.source] = (sources[v.source]||0) + 1; });

  // دول الزيارات
  const countries = {};
  log.forEach(v => { if(v.country && v.country!=='unknown') countries[v.country] = (countries[v.country]||0) + 1; });

  // زيارات حسب التاريخ
  const visitsByDay = {};
  log.forEach(v => { visitsByDay[v.date] = (visitsByDay[v.date]||0) + 1; });

  // كشف تغيّر غريب في الزيارات (مقارنة النهاردة بمتوسط آخر 7 أيام غير النهاردة)
  const last7Days = Object.keys(visitsByDay).filter(d => d !== today && d >= weekAgo);
  const avg7 = last7Days.length ? last7Days.reduce((s,d) => s + visitsByDay[d], 0) / last7Days.length : 0;
  const todayCount = visitsByDay[today] || 0;
  let trafficAnomaly = null;
  if (avg7 >= 5) { // متبنيش على عينة صغيرة جداً
    const changePct = Math.round(((todayCount - avg7) / avg7) * 100);
    if (changePct <= -50) trafficAnomaly = { type: 'drop', pct: changePct };
    else if (changePct >= 150) trafficAnomaly = { type: 'spike', pct: changePct };
  }

  res.json({
    visits: db.visits,
    visitsToday: log.filter(v => v.date === today).length,
    visitsWeek: log.filter(v => v.date >= weekAgo).length,
    visitsMonth: log.filter(v => v.date >= monthAgo).length,
    trafficAnomaly,
    projects: db.projects.length,
    orders: orders.length,
    ordersToday: orders.filter(o => o.date && o.date.startsWith(today)).length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s+(o.total||0), 0),
    revenueToday: orders.filter(o => o.status !== 'cancelled' && o.date && o.date.startsWith(today)).reduce((s,o) => s+(o.total||0), 0),
    reviews: (db.reviews||[]).length,
    sources, countries, visitsByDay,
    blockedIPs: (db.blockedIPs||[]).length
  });
});

// ── Admin: Game Config ────────────────────────────────────────────────────────
app.get('/api/admin/game-config', auth, requireAdmin, async (req, res) => {
  res.json((await readDB()).gameConfig || {});
});

app.put('/api/admin/game-config', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  db.gameConfig = { ...db.gameConfig, ...req.body };
  await writeDB(db); res.json({ ok:true });
});

// ── Sections Visibility (Public) ──────────────────────────────────────────────
app.get('/api/sections', async (req, res) => {
  const db = (await readDB());
  res.json(db.sectionsVisibility || {});
});

// ── Admin: Sections Visibility ────────────────────────────────────────────────
app.get('/api/admin/sections', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  res.json(db.sectionsVisibility || {});
});

app.put('/api/admin/sections', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  db.sectionsVisibility = { ...db.sectionsVisibility, ...req.body };
  await writeDB(db);
  res.json({ ok: true, sectionsVisibility: db.sectionsVisibility });
});

// ── Admin: Maintenance ────────────────────────────────────────────────────────
app.put('/api/admin/maintenance', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  db.maintenanceMode = req.body.active;
  if (req.body.msg) db.maintenanceMsg = req.body.msg;
  await writeDB(db); res.json({ ok:true });
});

app.get('/api/admin/maintenance', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  res.json({ active: db.maintenanceMode, msg: db.maintenanceMsg });
});

// ── Admin: Security ───────────────────────────────────────────────────────────
app.get('/api/admin/login-log', auth, requireAdmin, async (req, res) => res.json((await readDB()).loginLog || []));

app.get('/api/admin/blocked-ips', auth, requireAdmin, async (req, res) => res.json((await readDB()).blockedIPs || []));

app.post('/api/admin/block-ip', auth, requireAdmin, async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ ok:false });
  const db = (await readDB());
  if (!db.blockedIPs) db.blockedIPs = [];
  if (!db.blockedIPs.includes(ip)) { db.blockedIPs.push(ip); await writeDB(db); }
  res.json({ ok:true });
});

app.delete('/api/admin/block-ip/:ip', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  db.blockedIPs = (db.blockedIPs||[]).filter(i => i !== req.params.ip);
  await writeDB(db); res.json({ ok:true });
});

// ── Admin: Sub-admins ─────────────────────────────────────────────────────────
app.get('/api/admin/sub-admins', auth, requireAdmin, async (req, res) => res.json((await readDB()).subAdmins || []));

app.post('/api/admin/sub-admins', auth, requireAdmin, async (req, res) => {
  const { email, name, permissions } = req.body;
  if (!email) return res.status(400).json({ ok:false });
  const db = (await readDB());
  if (!db.subAdmins) db.subAdmins = [];
  // Generate 6-digit OTP as initial code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  db.subAdmins.push({ id:Date.now(), email, name:name||email, pass:bcrypt.hashSync(otp,8), permissions:permissions||['orders'], active:true, created:new Date().toISOString() });
  await writeDB(db);
  // Try to send email with OTP
  transporter.sendMail({
    from: `"SurpriseCode 🎁" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: `🔐 كود دخولك كمساعد أدمن في SurpriseCode`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#1e2620;border-radius:16px;padding:32px;text-align:center">
      <h2 style="color:#b89968">SurpriseCode 🎁</h2>
      <p style="color:#cdc5b4">تمت إضافتك كمساعد أدمن</p>
      <div style="background:#2b3327;border-radius:12px;padding:24px;margin:20px 0;border:2px solid #b89968">
        <div style="color:#b89968;font-size:13px;margin-bottom:8px">كود الدخول الخاص بك</div>
        <div style="color:#fff;font-size:48px;font-weight:900;letter-spacing:10px">${otp}</div>
      </div>
      <p style="color:#9a9583;font-size:13px">استخدم بريدك الإلكتروني وهذا الكود لتسجيل الدخول</p>
    </div>`
  }).catch(e => console.error('Sub-admin email error:', e.message));
  res.json({ ok:true, tempPass:otp });
});

app.put('/api/admin/sub-admins/:id', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  const sub = (db.subAdmins||[]).find(s => s.id === parseInt(req.params.id));
  if (!sub) return res.status(404).json({ ok:false });
  if (req.body.active !== undefined) sub.active = req.body.active;
  if (req.body.permissions) sub.permissions = req.body.permissions;
  await writeDB(db); res.json({ ok:true });
});

app.delete('/api/admin/sub-admins/:id', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  db.subAdmins = (db.subAdmins||[]).filter(s => s.id !== parseInt(req.params.id));
  await writeDB(db); res.json({ ok:true });
});


// ── Payment Methods (Public) ──────────────────────────────────────────────────
// بيرجع للعميل إيه طرق الدفع المتاحة دلوقتي (من غير أي بيانات سرية)
app.get('/api/payment-methods', async (req, res) => {
  const db = (await readDB());
  const pm = db.paymentMethods || {};
  const paymob = db.paymobConfig || {};
  res.json({
    card: { active: !!(paymob.active && paymob.apiKey && paymob.integrationId) },
    vodafoneCash: { active: !!pm.vodafoneCash?.active, number: pm.vodafoneCash?.number || '', name: pm.vodafoneCash?.name || '' },
    instapay:     { active: !!pm.instapay?.active, handle: pm.instapay?.handle || '', name: pm.instapay?.name || '' }
  });
});

// ── Admin: Vodafone Cash / InstaPay config ────────────────────────────────────
app.get('/api/admin/payment-methods', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  res.json(db.paymentMethods || {});
});

app.put('/api/admin/payment-methods', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  db.paymentMethods = { ...db.paymentMethods, ...req.body };
  await writeDB(db);
  res.json({ ok: true, paymentMethods: db.paymentMethods });
});

// ── Paymob Payment (Card / Visa) ──────────────────────────────────────────────
// إعدادات الأدمن لباي موب
app.put('/api/admin/paymob-config', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  db.paymobConfig = { ...db.paymobConfig, ...req.body };
  await writeDB(db);
  res.json({ ok: true, paymobConfig: db.paymobConfig });
});

app.get('/api/admin/paymob-config', auth, requireAdmin, async (req, res) => {
  const db = (await readDB());
  // متبعتش الـ apiKey أو الـ secrets للفرونت إند، بس بنقول هل هو مفعّل ولا لأ
  const cfg = db.paymobConfig || {};
  res.json({ active: !!cfg.active, hasApiKey: !!cfg.apiKey, hasIntegrationId: !!cfg.integrationId });
});

// بدء عملية دفع بالفيزا/الكارت عن طريق Paymob (Intention API)
app.post('/api/payment/paymob/init', async (req, res) => {
  try {
    const db = (await readDB());
    const cfg = db.paymobConfig || {};
    if (!cfg.active || !cfg.apiKey || !cfg.integrationId) {
      return res.status(503).json({ ok: false, msg: 'الدفع بالفيزا غير متاح حالياً' });
    }

    const { name, phone, email, items } = req.body;
    if (!name || !phone || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ ok: false, msg: 'بيانات ناقصة' });
    }

    // نحسب المبلغ من السيرفر نفسه (من المشاريع والباقات المسجّلة) — متعتمدش على رقم بيجي من المتصفح
    const allSources = [...(db.projects||[]), ...(db.pricingPlans||[])];
    let amount = 0;
    const lineItems = [];
    for (const it of items) {
      const src = allSources.find(s => String(s.id) === String(it.id));
      if (!src) return res.status(400).json({ ok: false, msg: 'منتج غير معروف في الطلب' });
      const qty = Math.max(1, parseInt(it.qty) || 1);
      const unitPrice = src.price;
      amount += unitPrice * qty;
      lineItems.push({ name: src.name_ar || src.ar?.n || 'منتج', amount: unitPrice, qty });
    }
    const amountCents = Math.round(amount * 100);

    const intentionResp = await fetch('https://accept.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${cfg.apiKey}`
      },
      body: JSON.stringify({
        amount: amountCents,
        currency: 'EGP',
        payment_methods: [parseInt(cfg.integrationId)],
        items: lineItems.map(it => ({
          name: it.name,
          amount: Math.round(it.amount * 100),
          description: it.name,
          quantity: it.qty
        })),
        billing_data: {
          apartment: 'NA', floor: 'NA', street: 'NA', building: 'NA',
          shipping_method: 'NA', postal_code: 'NA', city: 'Cairo', country: 'EG',
          state: 'Cairo',
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || name,
          phone_number: phone,
          email: email || 'no-email@surprisecode.com'
        },
        customer: {
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || name,
          email: email || 'no-email@surprisecode.com'
        },
        extras: { orderName: name }
      })
    });

    const data = await intentionResp.json();

    if (!intentionResp.ok || !data.client_secret) {
      console.error('Paymob intention error:', data);
      return res.status(502).json({ ok: false, msg: 'فشل بدء عملية الدفع' });
    }

    // رابط صفحة الدفع (Unified Checkout) اللي هيدخلها العميل يدفع فيها
    const paymentUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${cfg.publicKey || ''}&clientSecret=${data.client_secret}`;

    res.json({ ok: true, paymentUrl, clientSecret: data.client_secret });
  } catch (e) {
    console.error('Paymob init error:', e.message);
    res.status(500).json({ ok: false, msg: 'حصل خطأ أثناء بدء الدفع' });
  }
});

// بيتحقق إن الطلب فعلاً جاي من Paymob ومش مزوّر، باستخدام الـ HMAC secret اللي بتحطه من إعدادات باي موب
// الترتيب ده رسمي من توثيق Paymob ولازم يفضل زي ما هو بالظبط
const PAYMOB_HMAC_FIELDS = [
  'amount_cents','created_at','currency','error_occured','has_parent_transaction','id',
  'integration_id','is_3d_secure','is_auth','is_capture','is_refunded','is_standalone_payment',
  'is_voided','order.id','owner','pending','source_data.pan','source_data.sub_type','source_data.type','success'
];
function getPath(obj, path) { return path.split('.').reduce((o,k)=>(o&&o[k]!==undefined?o[k]:''), obj); }
function verifyPaymobHmac(obj, receivedHmac, secret) {
  if (!secret || !receivedHmac) return false;
  const concatenated = PAYMOB_HMAC_FIELDS.map(f => String(getPath(obj, f))).join('');
  const computed = crypto.createHmac('sha512', secret).update(concatenated).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(String(receivedHmac))); }
  catch (_) { return false; }
}

// Webhook تأكيد الدفع من Paymob (يتنادى تلقائي من Paymob لما العميل يدفع)
app.post('/api/payment/paymob/webhook', express.json({ type: '*/*' }), async (req, res) => {
  try {
    const db = (await readDB());
    const cfg = db.paymobConfig || {};
    const { obj } = req.body || {};
    const receivedHmac = req.query.hmac;

    if (!cfg.hmacSecret) {
      console.warn('⚠️ Paymob hmacSecret مش متظبط في الإعدادات — الويب هوك هيتجاهل لحد ما يتحط. حط الـ HMAC secret من لوحة Paymob في إعدادات الأدمن.');
      return res.sendStatus(200);
    }
    if (!obj || !verifyPaymobHmac(obj, receivedHmac, cfg.hmacSecret)) {
      console.warn('🚫 Paymob webhook: HMAC غلط أو ناقص — الطلب اتجاهل (ممكن يكون مزوّر).');
      return res.sendStatus(200); // نرجع 200 برضه عشان مانديش معلومة لمهاجم إن التحقق فشل، بس من غير ما نعالج الطلب
    }

    if (obj.success === true) {
      console.log('✅ Paymob payment success (HMAC verified):', obj.order?.id, obj.amount_cents);
      // ممكن هنا تربط الطلب بالـ order الحقيقي بتاعك لو بعتت order id في الـ extras
    }
    res.sendStatus(200);
  } catch (e) {
    console.error('Paymob webhook error:', e.message);
    res.sendStatus(200); // نرجع 200 عشان باي موب متعديش تحاول تاني كتير
  }
});

// ── Sitemap (بيتحدث تلقائي مع كل مشروع جديد) ──────────────────────────────────
// ── Backups (نسخ احتياطية يومية بتتحفظ تلقائي في قاعدة البيانات) ─────────────────
app.get('/api/admin/backups', auth, requireAdmin, async (req, res) => {
  try { res.json(await listBackups()); }
  catch (e) { res.status(500).json({ ok:false, msg:e.message }); }
});
app.post('/api/admin/backups/:date/restore', auth, requireAdmin, async (req, res) => {
  try {
    const restored = await restoreBackup(req.params.date);
    if (!restored) return res.status(404).json({ ok:false, msg:'مفيش نسخة بالتاريخ ده' });
    res.json({ ok:true, msg:'تم استرجاع النسخة الاحتياطية' });
  } catch (e) { res.status(500).json({ ok:false, msg:e.message }); }
});

app.get('/sitemap.xml', async (req, res) => {
  const db = (await readDB());
  const base = `${req.protocol}://${req.get('host')}`;
  const staticPages = ['', '/policies.html'];
  const projectPages = (db.projects || []).map(p => `/project-details.html?id=${p.id}`);
  const urls = [...staticPages, ...projectPages];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${base}${u}</loc></url>`).join('\n')}
</urlset>`;
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', async (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml`);
});

// ── Catch-all ─────────────────────────────────────────────────────────────────
app.use(async (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ── معالج أخطاء عام ───────────────────────────────────────────────────────────
// أي خطأ حصل في أي راوت (زي عطل مؤقت في قاعدة البيانات) بيتمسك هنا بدل ما يظهر
// للزائر كـ stack trace فيه تفاصيل داخلية عن السيرفر — بيرجع رسالة عادية بس
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack || err);
  if (res.headersSent) return next(err);
  if (req.path.startsWith('/api/')) {
    res.status(500).json({ ok:false, msg:'حصل خطأ في السيرفر، جرب تاني بعد شوية' });
  } else {
    res.status(500).send('حصل خطأ في السيرفر، جرب تاني بعد شوية 🙏');
  }
});


if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`✅ SurpriseCode v9 running on http://localhost:${PORT}`));
}
module.exports = app;
