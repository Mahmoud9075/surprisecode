// ── Security: escape any user-supplied text before it goes into innerHTML ──
function escapeHtml(str){
  if(str===null||str===undefined) return '';
  return String(str).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
// only allow safe base64 image data-URIs (blocks javascript: / onerror payloads in the src attribute)
function safeImgSrc(src){
  return (typeof src==='string' && /^data:image\/(png|jpe?g|gif|webp);base64,/.test(src)) ? src : '';
}

// ── Config ──
var API='', lang='ar', theme='light', cart=[];
var WA='201023514568', adminToken=localStorage.getItem('sc_admin_token')||null, reviewStars=5;
var currentRevPage=0, reviews=[], projects=[];
var IS_MOBILE = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

// ── Translations ──
var T={
ar:{nav_home:"الرئيسية",nav_about:"نبذة عني",nav_designs:"الديزاينات",nav_pricing:"الأسعار",nav_steps:"الخطوات",nav_reviews:"آراء العملاء",nav_faq:"أسئلة",
hero_tag:"مفاجآت ديچيتال شيك جداً",hero_title_2:"تفضل معاك طول العمر",hero_sub:"بنحكي قصتكم بأحلى التفاصيل وبتصميم مودرن وشيك.",pre_sub:"مفاجآت تفضل معاك طول العمر",
cta1:"ابدأ حكايتك",cta_track:"تتبع طلبك",b1:"١٠٠٪ آمن",b2:"رد خلال ١٥ دقيقة",b3:"ضمان الجودة",b4:"خصم ١٥٪ للطلب التاني",
about_tag:"عن المطوّر",about_h:"نبذة عني",about_name:"مرحباً بك في SurpriseCode 🎁",
about_p1:"أهلاً 👋 أنا صاحب ومطوّر SurpriseCode، متخرج جديد وشغوف بالبرمجة وتطوير الويب.",
about_p2:"بصمم كل مشروع بحب واهتمام بأدق التفاصيل، عشان لما تهديه لحد غالي يحس إنه مميز فعلاً.",
as1:"مفاجأة",as2:"عميل سعيد",as3:"★ تقييم",
atag1:"تطوير ويب",atag2:"تصميم بحب",atag3:"متخرج جديد",atag4:"أفكار مبتكرة",
designs_tag:"أعمالنا",designs_h:"المجموعة الأساسية",try:"جرّب",add:"للسلة",details:"تفاصيل",
pricing_tag:"الأسعار",pricing_h:"اختار الباقة المناسبة",
co_title:"طلب خاص؟",co_desc:"عندك فكرة مختلفة؟ احكيلنا بالتفصيل.",co_btn:"ابعت طلبك",
steps_tag:"بنعمل إيه",steps_h:"خطواتك عشان تطلب مفاجأتك",
why_tag:"ليه إحنا؟",why_h:"بنهتم بأدق التفاصيل",
reviews_tag:"آراء العملاء",reviews_h:"بيقولوا إيه عننا؟",add_review:"⭐ أضف تقييمك",
faq_tag:"أسئلة شائعة",faq_h:"عندك سؤال؟",
cf_tag:"ابدأ حكايتك",cf_h:"خلّينا نعمل لك أحلى مفاجأة",cf_p:"كل مناسبة حلوة تستاهل لمسة مميزة.",cf_btn:"ابدأ حكايتك",
f_browse:"تصفّح",f_quick:"لينكات سريعة",f_tagline:"بنعمل مفاجآت ديچيتال متتنسيش.",footer_passion:"صُنع بشغف من SurpriseCode",
cart_h:"🛒 سلة التسوق",cart_checkout:"إتمام الطلب",cart_clear:"مسح السلة",empty:"السلة فارغة",total:"الإجمالي",egp:"ج.م",
co_h:"إتمام الطلب",co_transfer:"فودافون كاش",co_s1:"حوّل قيمة الطلب على الرقم أعلاه.",co_s2:"صوّر إيصال التحويل.",co_s3:"املأ بياناتك واضغط إرسال.",co_phone:"رقم تليفونك",
f_name:"اسمك",co_extra:"طلب إضافي (اختياري)",co_confirm:"تأكيد وإرسال",
track_h:"📦 تتبع طلبك",track_phone:"رقم تليفونك",track_btn:"تتبع",
custom_idea:"فكرتك بالتفصيل",custom_budget:"الميزانية التقريبية",
adm_h:"دخول الأدمن",adm_sub:"هذه الصفحة للمدير فقط",adm_user:"اسم المستخدم",adm_pass:"كلمة المرور",adm_btn:"دخول",
adm_tab_proj:"المشاريع",adm_tab_orders:"الطلبات",adm_tab_rev:"التقييمات",adm_tab_stats:"إحصائيات",
adm_visits:"الزوار",adm_projcount:"المشاريع",adm_rev_count:"التقييمات",
adm_add:"إضافة مشروع",adm_pn:"اسم المشروع",adm_pd:"الوصف",adm_pp:"السعر (ج.م)",adm_pl:"لينك التجربة",adm_pimg:"لينكات صور (سطر لكل صورة)",adm_save:"💾 حفظ المشروع",adm_list:"المشاريع الحالية",adm_rev_list:"التقييمات",adm_out:"تسجيل خروج",adm_dash:"لوحة التحكم",
rev_add_h:"⭐ أضف تقييمك",rev_name:"اسمك",rev_occasion:"المناسبة",rev_text:"تجربتك معانا",rev_stars:"تقييمك",rev_submit:"إرسال التقييم",
rev_encourage:"رأيك بيفرق! كلمتين منك بتساعد ناس تانية تقرر وبتفرحنا جداً 🙏",
del:"حذف",name_err:"الاسم أحرف فقط",phone_err:"رقم التليفون أرقام فقط"},
en:{nav_home:"Home",nav_about:"About",nav_designs:"Designs",nav_pricing:"Pricing",nav_steps:"Steps",nav_reviews:"Reviews",nav_faq:"FAQ",
hero_tag:"Very chic digital surprises",hero_title_2:"stays with you forever",hero_sub:"We tell your story with the finest details and a modern chic design.",pre_sub:"Surprises that stay with you forever",
cta1:"Start your story",cta_track:"Track your order",b1:"100% Secure",b2:"Reply in 15 min",b3:"Quality Guaranteed",b4:"15% off 2nd order",
about_tag:"Developer",about_h:"About me",about_name:"Welcome to SurpriseCode 🎁",
about_p1:"Hi 👋 I'm the owner and developer of SurpriseCode, a fresh graduate passionate about coding and web development.",
about_p2:"I craft every project with love and attention to detail so your gift feels truly special.",
as1:"Surprises",as2:"Happy Clients",as3:"★ Rating",
atag1:"Web dev",atag2:"Crafted with love",atag3:"Fresh graduate",atag4:"Creative ideas",
designs_tag:"Our work",designs_h:"The Core Collection",try:"Demo",add:"Add",details:"Details",
pricing_tag:"Pricing",pricing_h:"Choose your package",
co_title:"Custom order?",co_desc:"Have a unique idea? Tell us in detail.",co_btn:"Send request",
steps_tag:"How it works",steps_h:"Your steps to order a surprise",
why_tag:"Why us?",why_h:"We care about the finest details",
reviews_tag:"Reviews",reviews_h:"What they say about us",add_review:"⭐ Add your review",
faq_tag:"FAQ",faq_h:"Got a question?",
cf_tag:"Start your story",cf_h:"Let us craft your sweetest surprise",cf_p:"Every occasion deserves a unique touch.",cf_btn:"Start your story",
f_browse:"Browse",f_quick:"Quick links",f_tagline:"We craft unforgettable digital surprises.",footer_passion:"Built with passion by SurpriseCode",
cart_h:"🛒 Cart",cart_checkout:"Checkout",cart_clear:"Clear cart",empty:"Cart is empty",total:"Total",egp:"EGP",
co_h:"Complete order",co_transfer:"Vodafone Cash",co_s1:"Transfer the amount to the number above.",co_s2:"Screenshot the receipt.",co_s3:"Fill your details and hit send.",co_phone:"Your phone number",
f_name:"Your name",co_extra:"Extra request (optional)",co_confirm:"Confirm & send",
track_h:"📦 Track your order",track_phone:"Your phone number",track_btn:"Track",
custom_idea:"Your idea in detail",custom_budget:"Approximate budget",
adm_h:"Admin login",adm_sub:"Managers only",adm_user:"Username",adm_pass:"Password",adm_btn:"Login",
adm_tab_proj:"Projects",adm_tab_orders:"Orders",adm_tab_rev:"Reviews",adm_tab_stats:"Stats",
adm_visits:"Visitors",adm_projcount:"Projects",adm_rev_count:"Reviews",
adm_add:"Add project",adm_pn:"Project name",adm_pd:"Description",adm_pp:"Price (EGP)",adm_pl:"Demo link",adm_pimg:"Image links (one per line)",adm_save:"💾 Save project",adm_list:"Current projects",adm_rev_list:"Reviews",adm_out:"Logout",adm_dash:"Dashboard",
rev_add_h:"⭐ Add your review",rev_name:"Your name",rev_occasion:"Occasion",rev_text:"Your experience",rev_stars:"Rating",rev_submit:"Submit review",
rev_encourage:"Your opinion matters! A few words help others decide 🙏",
del:"Delete",name_err:"Name must be letters only",phone_err:"Phone must be numbers only"}
};
function t(k){return T[lang][k]||k;}


// ── USD Price Live Rate ──
var usdRate = 50; // fallback
function fetchUSDRate(){
  fetch('https://api.exchangerate-api.com/v4/latest/USD')
  .then(function(r){return r.json();})
  .then(function(data){
    if(data.rates && data.rates.EGP){
      usdRate = data.rates.EGP;
      updateAllPrices();
    }
  })
  .catch(function(){
    // fallback to another free API
    fetch('https://open.er-api.com/v6/latest/USD')
    .then(function(r){return r.json();})
    .then(function(data){
      if(data.rates && data.rates.EGP){
        usdRate = data.rates.EGP;
        updateAllPrices();
      }
    }).catch(function(){});
  });
}

function egpToUSD(egp){ return (egp / usdRate).toFixed(2); }
function usdToEGP(usd){ return Math.round(usd * usdRate); }

function formatPrice(egp){
  var usd = egpToUSD(egp);
  return '<span class="price-usd">$'+usd+'</span>'
    +'<span class="price-sep"> ≈ </span>'
    +'<span class="price-egp">'+egp+' ج.م</span>';
}

function updateAllPrices(){
  // Update all price elements
  document.querySelectorAll('[data-egp-price]').forEach(function(el){
    var egp = parseInt(el.getAttribute('data-egp-price'));
    el.innerHTML = formatPrice(egp);
  });
  // Update pricing grid
  renderPricing();
  renderDesigns();
}

// ── Static Data ──
var STEPS={
ar:[{n:"٠١",t:"اختار مفاجأتك",d:"تصفح مجموعتنا واختار التصميم اللي يعبّر عن مناسبتك."},
    {n:"٠٢",t:"كلمنا على واتساب",d:"ابعتلنا رسالة على واتساب ونأكد الطلب ونبدأ على طول."},
    {n:"٠٣",t:"ابعت التفاصيل",d:"هنبعتلك فورم بسيط تملى فيه التفاصيل والصور والألوان."},
    {n:"٠٤",t:"استلم مفاجأتك",d:"احصل على لينك مفاجأتك جاهز تبعته لأي حد في ثانية."}],
en:[{n:"01",t:"Pick your surprise",d:"Browse our collection and pick the design that fits."},
    {n:"02",t:"Message us",d:"Send a WhatsApp message, we confirm and start right away."},
    {n:"03",t:"Send the details",d:"We send a simple form for your details, photos and colors."},
    {n:"04",t:"Receive your surprise",d:"Get your final link ready to send to anyone in a second."}]
};

var WHY={
ar:[{ic:"✉️",t:"تواصل شيك ومختلف",d:"شارك فرحتك بضغطة واحدة وتوصل لقلوب حبايبك.",big:true,light:false},
    {ic:"✨",t:"ديزاينات مفيش زيها",d:"كل مفاجأة بتتصمم عشان تعكس قصتك ومناسبتك.",big:true,light:true},
    {ic:"❤️",t:"مفاجأة ما تتنسى",d:"أهم تفاصيلك محفوظة بشكل يليق بلحظتك.",big:false,light:false},
    {ic:"🎬",t:"إبداع سينمائي",d:"حركات ولمسات فنية بتعمل تجربة تخطف القلب.",big:false,light:true},
    {ic:"📱",t:"تجربة متكاملة",d:"شياكة متتوصفش على كل الشاشات.",big:false,light:false},
    {ic:"⚡",t:"تسليم سريع",d:"بنسلّم في وقت قياسي من غير ما نأثّر على الجودة.",big:false,light:true}],
en:[{ic:"✉️",t:"Chic sharing",d:"Share your joy in one tap and reach your loved ones.",big:true,light:false},
    {ic:"✨",t:"Unmatched designs",d:"Every surprise reflects your story and occasion.",big:true,light:true},
    {ic:"❤️",t:"Unforgettable",d:"Your finest details kept worthy of your moment.",big:false,light:false},
    {ic:"🎬",t:"Cinematic creativity",d:"Artful motions that steal the heart.",big:false,light:true},
    {ic:"📱",t:"Complete experience",d:"Stunning on every screen.",big:false,light:false},
    {ic:"⚡",t:"Fast delivery",d:"We deliver fast without compromising quality.",big:false,light:true}]
};

var PRICING=[]; // بيتحمّل من السيرفر دلوقتي (/api/pricing-plans) عشان الأدمن يقدر يتحكم فيه
function loadPricing(){
  fetch(API+'/api/pricing-plans').then(function(r){return r.json();}).then(function(data){
    PRICING=data||[];
    renderPricing();
  }).catch(function(){});
}

// ── Sections Visibility (للزوار) ──
function applySectionsVisibility(){
  fetch(API+'/api/sections').then(function(r){return r.json();}).then(function(sections){
    Object.keys(sections||{}).forEach(function(key){
      if(sections[key]===false){
        if(key==='game'){
          var gb=document.getElementById('gameBtnNav'); if(gb) gb.style.display='none';
        } else {
          var el=document.getElementById(key); if(el) el.style.display='none';
        }
      }
    });
  }).catch(function(){});
}

var FAQ_DATA={
ar:[
  {q:"إيه الفرق بين الباقات؟",a:"Basic للمفاجآت البسيطة بتصميم جاهز. Premium بيضيف صور وموسيقى مخصصة. VIP تصميم حصري بالكامل مع فيديو ودعم مباشر."},
  {q:"كام يوم التسليم؟",a:"Basic: 48 ساعة. Premium: 24 ساعة. VIP: 12 ساعة. في حالات الاستعجال تواصل معانا على واتساب."},
  {q:"ممكن أعدل بعد ما استلمت؟",a:"أيوه! بنديك تعديل واحد مجاني خلال 24 ساعة من التسليم. تعديلات زيادة بسعر رمزي."},
  {q:"إزاي بادفع؟",a:"عن طريق فودافون كاش على الرقم 01023514568، وبعدين بتبعتلنا صورة الإيصال على واتساب."},
  {q:"الخصم ١٥٪ بيتحسب إزاي؟",a:"أي طلب تاني بعد الأول بياخد خصم ١٥٪ أوتوماتيك. بس اذكرنا في رسالة الطلب إنك عميل قديم."},
  {q:"ممكن طلب خاص مش موجود في الباقات؟",a:"أكيد! اضغط 'طلب خاص' واحكيلنا فكرتك بالتفصيل وهنعملك عرض سعر مخصص."},
  {q:"إيه هي طرق الدفع المتاحة؟",a:"فودافون كاش وإنستاباي متاحين دلوقتي، والدفع بالفيزا هيبقى متاح قريباً."},
  {q:"لو غيّرت رأيي بعد الدفع، هل ينفع أسترجع فلوسي؟",a:"أيوه، لو كان ده قبل ما نبدأ التنفيذ. بعد ما نبدأ الشغل، للأسف مش هينفع نسترجع المبلغ."},
  {q:"هل المشروع بيفضل شغال بعد التسليم؟",a:"أيوه، اللينك بتاعك بيفضل شغال دايماً وتقدر تشاركه مع أي حد تحب في أي وقت."},
  {q:"ينفع أطلب من برة مصر؟",a:"أكيد! خدمتنا أونلاين بالكامل، تقدر تطلب من أي مكان في العالم والتسليم بيتم عبر لينك مباشر."},
  {q:"هل ممكن أشوف نموذج قبل ما أطلب؟",a:"أيوه، كل مشروع من مشاريعنا عنده رابط تجربة حية تقدر تفتحه وتشوف الشكل النهائي قبل ما تقرر."}
],
en:[
  {q:"What's the difference between packages?",a:"Basic is for simple surprises with ready design. Premium adds custom photos and music. VIP is fully custom with video and direct support."},
  {q:"How long is delivery?",a:"Basic: 48h. Premium: 24h. VIP: 12h. For urgent orders contact us on WhatsApp."},
  {q:"Can I edit after delivery?",a:"Yes! One free revision within 24 hours of delivery. Additional edits at a small fee."},
  {q:"How do I pay?",a:"Via Vodafone Cash to 01023514568, then send us a receipt screenshot on WhatsApp."},
  {q:"How does the 15% discount work?",a:"Any second order gets 15% off automatically. Just mention you're a returning customer."},
  {q:"Can I request something not in the packages?",a:"Absolutely! Click 'Custom Order' and tell us your idea in detail for a custom quote."}
]
};

var SP_NAMES_AR=["أحمد","سارة","محمد","منى","علي","نور","عمر","ريم","يوسف","لينا"];
var SP_NAMES_EN=["Ahmed","Sara","Mohammed","Mona","Ali","Nour"];
var SP_OCCs_AR=["مفاجأة حب","عيد ميلاد","خطوبة","ذكرى سنوية"];

// ── Dots (خفيف على الموبايل) ──
(function(){
  var c=document.getElementById('dots');
  var count=IS_MOBILE?25:55;
  for(var i=0;i<count;i++){
    var d=document.createElement('div');d.className='dot';
    var dur=1.5+Math.random()*2.5,del=Math.random()*5;
    d.style.cssText='left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;animation-duration:'+dur+'s;animation-delay:'+del+'s';
    c.appendChild(d);
  }
})();

// ── Particles (desktop only) ──
(function(){
  if(IS_MOBILE)return;
  var canvas=document.getElementById('particleCanvas');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  var particles=[],mouse={x:-999,y:-999};
  for(var i=0;i<30;i++){
    particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.8+.8,op:Math.random()*.4+.1});
  }
  document.addEventListener('mousemove',function(e){mouse.x=e.clientX;mouse.y=e.clientY;});
  function anim(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(function(p){
      var dx=mouse.x-p.x,dy=mouse.y-p.y,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<100){p.vx+=dx*.001;p.vy+=dy*.001;}
      p.vx*=.98;p.vy*=.98;p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;
      if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(184,153,104,'+p.op+')';ctx.fill();
    });
    requestAnimationFrame(anim);
  }
  anim();
  window.addEventListener('resize',function(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;});
})();

// ── Cursor (desktop only) ──
(function(){
  if(IS_MOBILE||window.matchMedia('(hover:none)').matches)return;
  var dot=document.getElementById('cursorDot'),ring=document.getElementById('cursorRing');
  var mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',function(e){
    mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';
  });
  function animR(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animR);}
  animR();
  document.querySelectorAll('button,a,[onclick]').forEach(function(el){
    el.addEventListener('mouseenter',function(){document.body.classList.add('cur-h');});
    el.addEventListener('mouseleave',function(){document.body.classList.remove('cur-h');});
  });
})();

// ── Ripple ──
document.addEventListener('click',function(e){
  var el=e.target.closest('.ripple');
  if(!el)return;
  var r=document.createElement('span');r.className='ripple-fx';
  var rect=el.getBoundingClientRect();
  var size=Math.max(rect.width,rect.height)*2;
  r.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px';
  el.appendChild(r);setTimeout(function(){r.remove();},600);
});

// ── Progress + Scroll ──
window.addEventListener('scroll',function(){
  var d=document.documentElement;
  document.getElementById('progressBar').style.width=(d.scrollTop/(d.scrollHeight-d.clientHeight)*100)+'%';
  var nav=document.getElementById('mainNav');
  if(d.scrollTop>50)nav.classList.add('scrolled');else nav.classList.remove('scrolled');
  var st=document.getElementById('scrollTop');
  if(d.scrollTop>400)st.classList.add('show');else st.classList.remove('show');
},{passive:true});

// ── Hero Title Static ──
// (no morph - title stays fixed)

// ── Counter Animation ──
function animateCounter(el){
  var target=parseInt(el.getAttribute('data-count'));
  var dur=1600,start=performance.now();
  var suffix=target===5?'★':'+';
  function step(now){
    var p=Math.min((now-start)/dur,1);
    var ease=1-Math.pow(1-p,3);
    el.textContent=Math.round(ease*target)+suffix;
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Renders ──
function renderDesigns(){
  var g=document.getElementById('designsGrid');g.innerHTML='';
  if(!projects.length){
    g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--txt3);font-family:var(--serif-ar);font-size:16px">جاري تحميل المشاريع...</div>';
    return;
  }
  projects.forEach(function(p,i){
    var imgs=p.imgs&&p.imgs.length?p.imgs:(p.img?[p.img]:[]);
    var icon=getIcon(p.ic);
    var priceStr;
    if(p.originalPrice && p.originalPrice > p.price){
      var pct = Math.round(100 - (p.price/p.originalPrice*100));
      priceStr = '<span class="price-row"><span class="price-old">'+p.originalPrice+'</span><span class="price-badge-off">🔥'+pct+'%</span><span class="price-now">'+p.price+' '+t('egp')+'</span></span>';
    } else {
      priceStr = p.price+' '+t('egp');
    }
    var detailsLink=p.instagramLink?p.instagramLink:'/project-details.html?id='+p.id;
    var waLink='https://wa.me/'+WA+'?text='+encodeURIComponent('أريد الاستفسار عن: '+p[lang].n);

    // Front face content
    var frontImg='';
    if(imgs.length){
      frontImg='<img src="'+imgs[0]+'" class="flip-front-img" alt="'+p[lang].n+'" loading="lazy">';
    } else {
      frontImg='<div class="flip-front-placeholder">'+icon+'</div>';
    }

    // Wrapper
    var wrap=document.createElement('div');
    wrap.className='flip-wrap reveal';
    wrap.id='dcard-'+p.id;
    wrap.style.transitionDelay=(i*.1)+'s';

    wrap.innerHTML=
      '<div class="flip-inner" id="flip-inner-'+p.id+'">'
        // ── FRONT ──
        +'<div class="flip-front">'
          +'<div class="flip-front-media">'+frontImg+'</div>'
          +'<div class="flip-front-body">'
            +'<div class="flip-front-icon">'+icon+'</div>'
            +'<h3 class="flip-front-name">'+p[lang].n+'</h3>'
            +'<p class="flip-front-desc">'+p[lang].d+'</p>'
            +'<div class="flip-front-price">'+priceStr+'</div>'
          +'</div>'
          +(p.link && p.link!=='#' ? '<a class="flip-live-link" href="'+p.link+'" target="_blank" onclick="event.stopPropagation()">🔗 شوف المشروع لايف</a>' : '')
          +'<button class="flip-hint-btn" onclick="flipCard('+p.id+')" title="اعرف أكتر">🔄 تفاصيل</button>'
        +'</div>'
        // ── BACK ──
        +'<div class="flip-back">'
          +'<div class="flip-back-icon">'+icon+'</div>'
          +'<h3 class="flip-back-name">'+p[lang].n+'</h3>'
          +(p[lang].about ? '<p class="flip-back-about">'+p[lang].about+'</p>' : '<p class="flip-back-about">'+p[lang].d+'</p>')
          +'<div class="flip-back-price">'+priceStr+'</div>'
          +'<div class="flip-back-btns">'
            +'<a class="btn ghost ripple" href="'+detailsLink+'" target="_blank">'+t('details')+'</a>'
            +'<button class="btn fill ripple" onclick="addCart('+p.id+',this)">'+t('add')+'</button>'
          +'</div>'
          +'<a class="flip-wa-btn" href="'+waLink+'" target="_blank">💬</a>'
          +'<button class="flip-back-close" onclick="flipCard('+p.id+')">✕</button>'
        +'</div>'
      +'</div>';

    g.appendChild(wrap);
  });
  observeReveal();
}

function flipCard(id){
  var el=document.getElementById('flip-inner-'+id);
  if(el)el.classList.toggle('flipped');
}


function getIcon(ic){
  var map={'ti-heart':'❤️','ti-cake':'🎂','ti-diamond':'💍','ti-gift':'🎁'};
  return map[ic]||'🎁';
}

var galleryTimers={};
function galleryGo(pid,idx){
  var gal=document.getElementById('gallery-'+pid);if(!gal)return;
  var imgs=gal.querySelectorAll('img');
  var dots=gal.querySelectorAll('.gdot');
  imgs.forEach(function(im,i){im.classList.toggle('active',i===idx);});
  dots.forEach(function(d,i){d.classList.toggle('active',i===idx);});
}

function renderPricing(){
  var g=document.getElementById('pricingGrid');if(!g)return;g.innerHTML='';
  PRICING.forEach(function(p,i){
    var card=document.createElement('div');
    card.className='price-card reveal'+(p.featured?' featured':'');
    card.style.transitionDelay=(i*.1)+'s';
    var badge=p.badge_ar?'<div class="price-badge">'+(lang==='ar'?p.badge_ar:p.badge_en)+'</div>':'';
    var features=(lang==='ar'?p.features_ar:p.features_en).map(function(f){return '<li>'+f+'</li>';}).join('');
    card.innerHTML=badge+'<div class="price-icon">'+p.icon+'</div>'
      +'<div class="price-name">'+(lang==='ar'?p.name_ar:p.name_en)+'</div>'
      +'<div class="price-amount">'+p.price+' <span>'+t('egp')+'</span></div>'
      +'<div class="price-desc">'+(lang==='ar'?p.desc_ar:p.desc_en)+'</div>'
      +'<ul class="price-features">'+features+'</ul>'
      +'<button class="btn fill ripple" onclick="addCartByPlan(\''+p.id+'\',this)" style="width:100%;justify-content:center">'+t('cta1')+'</button>';
    g.appendChild(card);
  });
  observeReveal();
}

function sendCustomOrder(textareaId){
  var txt=document.getElementById(textareaId||'customOrderText2');
  var msg=txt?txt.value.trim():'';
  if(!msg){ toast(lang==='ar'?'اكتب طلبك الأول':'Write your request first'); return; }
  var full = 'عايز طلب خاص: '+msg;
  window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(full), '_blank');
}

function addCartByPlan(id, sourceEl){
  var p=PRICING.find(function(x){return x.id===id;});if(!p)return;
  cart.push({id:p.id,ar:{n:p.name_ar},en:{n:p.name_en},price:p.price});
  updateCart();save();
  flyToCart(sourceEl, p.icon||'🎁');
  toast(lang==='ar'?'تمت الإضافة للسلة ✅':'Added to cart ✅');
}

function renderSteps(){
  var g=document.getElementById('stepsGrid');g.innerHTML='';
  var steps=STEPS[lang];
  var wrap=document.createElement('div');wrap.className='steps-wrap';
  wrap.innerHTML='<svg class="steps-svg" viewBox="0 0 1000 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path class="track-line" d="M 60,50 C 200,15 320,85 500,50 C 680,15 820,85 940,50" fill="none" stroke="var(--gold)" stroke-width="1.5"/></svg>';
  var track=document.createElement('div');track.className='steps-track';
  steps.forEach(function(s,i){
    var node=document.createElement('div');
    node.className='step-node reveal';
    node.setAttribute('data-index',i);
    node.style.marginTop=(i%2===1?'90':'0')+'px';
    node.style.transitionDelay=(i*.15)+'s';
    node.innerHTML='<div class="step-circle"><span>'+s.n+'</span></div>'
      +'<div class="step-content"><h3>'+s.t+'</h3><p>'+s.d+'</p></div>';
    track.appendChild(node);
  });
  wrap.appendChild(track);g.appendChild(wrap);
  var svgPath=wrap.querySelector('.track-line');
  if(svgPath){
    var io=new IntersectionObserver(function(es){
      if(es[0].isIntersecting){svgPath.style.animation='drawLine 2s ease .2s forwards';io.disconnect();}
    },{threshold:.2});
    io.observe(wrap);
  }
  observeSteps();observeReveal();
}

function renderWhy(){
  var g=document.getElementById('whyGrid');g.innerHTML='';
  WHY[lang].forEach(function(w,i){
    var card=document.createElement('div');
    card.className='why-card reveal'+(w.light?' light-bg':'');
    card.style.transitionDelay=(i*.07)+'s';
    card.innerHTML='<div class="why-ic">'+w.ic+'</div><h3>'+w.t+'</h3><p>'+w.d+'</p>';
    g.appendChild(card);
  });
  observeReveal();
}

function renderFAQ(){
  var g=document.getElementById('faqList');if(!g)return;g.innerHTML='';
  var items=FAQ_DATA[lang];
  items.forEach(function(item,i){
    var div=document.createElement('div');div.className='faq-item reveal';
    div.style.transitionDelay=(i*.06)+'s';
    div.innerHTML='<div class="faq-q" onclick="toggleFAQ(this)"><span>'+item.q+'</span><span class="faq-icon">+</span></div>'
      +'<div class="faq-a"><p>'+item.a+'</p></div>';
    g.appendChild(div);
  });
  observeReveal();
}

function toggleFAQ(el){
  var item=el.parentElement;
  var wasOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(i){i.classList.remove('open');});
  if(!wasOpen)item.classList.add('open');
}

// ── Reviews ──
function renderReviews(){
  var all=reviews.length?reviews:getSampleReviews();
  var track=document.getElementById('reviewsCarousel');
  track.innerHTML='<div class="reviews-track" id="reviewsTrack">'
    +all.map(function(r){
      var stars='';for(var i=0;i<5;i++)stars+='<span>'+(i<r.stars?'★':'☆')+'</span>';
      var safeSrc = safeImgSrc(r.img);
      var imgHtml = safeSrc ? '<img src="'+safeSrc+'" class="review-photo" alt="review photo">' : '';
      return '<div class="review-card reveal"><div class="review-stars">'+stars+'</div>'
        +imgHtml
        +'<p class="review-text">'+escapeHtml(r.text)+'</p>'
        +'<div class="review-author"><div class="review-avatar">'+escapeHtml(String(r.name||'').charAt(0))+'</div>'
        +'<div class="review-info"><h4>'+escapeHtml(r.name)+'</h4><span>'+escapeHtml(r.occasion)+'</span></div></div></div>';
    }).join('')+'</div>';
  var dots=document.getElementById('reviewsDots');dots.innerHTML='';
  var perPage=window.innerWidth>900?3:window.innerWidth>600?2:1;
  var pages=Math.ceil(all.length/perPage);
  for(var i=0;i<pages;i++){
    var d=document.createElement('div');d.className='rdot'+(i===0?' active':'');
    (function(idx){d.onclick=function(){goToRevPage(idx,perPage);};})(i);
    dots.appendChild(d);
  }
  currentRevPage=0;
  clearInterval(window._revTimer);
  if(pages>1){
    window._revTimer=setInterval(function(){
      currentRevPage=(currentRevPage+1)%pages;
      goToRevPage(currentRevPage,perPage);
    },4500);
  }
  observeReveal();
}

function getSampleReviews(){
  return[
    {name:"سارة محمود",occasion:"مفاجأة حب",text:"والله مش قادرة أوصف قد إيه المفاجأة كانت حلوة! حبيبي انبهر جداً وقال إنها أجمل هدية اتهداهالها.",stars:5},
    {name:"أحمد علي",occasion:"عيد ميلاد",text:"السرعة في التسليم والجودة العالية خلوني أنصح كل صحابي. شكراً SurpriseCode!",stars:5},
    {name:"منى حسن",occasion:"خطوبة",text:"التصميم كان فاخر جداً ومختلف. العروسين انبهروا بالشكل والتفاصيل الدقيقة.",stars:5}
  ];
}

function goToRevPage(idx,perPage){
  if(!perPage)perPage=window.innerWidth>900?3:window.innerWidth>600?2:1;
  var track=document.getElementById('reviewsTrack');if(!track)return;
  var card=track.querySelector('.review-card');if(!card)return;
  var w=card.offsetWidth+20;
  var dir=lang==='ar'?1:-1;
  track.style.transform='translateX('+(dir*idx*perPage*w)+'px)';
  currentRevPage=idx;
  document.querySelectorAll('.rdot').forEach(function(d,i){d.classList.toggle('active',i===idx);});
}

function renderStarPicker(){
  var sp=document.getElementById('starPicker');if(!sp)return;
  sp.innerHTML='';reviewStars=5;
  for(var i=1;i<=5;i++){
    var s=document.createElement('span');s.textContent='★';s.className='active';
    (function(val){
      s.onclick=function(){reviewStars=val;sp.querySelectorAll('span').forEach(function(x,j){x.classList.toggle('active',j<val);});};
      s.onmouseenter=function(){sp.querySelectorAll('span').forEach(function(x,j){x.classList.toggle('active',j<val);});};
    })(i);
    sp.appendChild(s);
  }
  sp.onmouseleave=function(){sp.querySelectorAll('span').forEach(function(x,j){x.classList.toggle('active',j<reviewStars);});};
}

function submitReview(){
  var name=document.getElementById('rev_name').value.trim();
  var occasion=document.getElementById('rev_occasion').value.trim();
  var text=document.getElementById('rev_text').value.trim();
  if(!name||!text){toast(lang==='ar'?'اكمل البيانات':'Fill all fields');return;}
  if(!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(name)){
    document.getElementById('rev_name').classList.add('error');
    toast(t('name_err'));return;
  }
  var rev={name:name,occasion:occasion||'—',text:text,stars:reviewStars,img:window._revImgData||null};
  fetch(API+'/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rev)})
  .then(function(r){return r.json();})
  .then(function(){
    reviews.push(rev);
    window._revImgData=null;
    var prev=document.getElementById('revImgPreview');if(prev)prev.style.display='none';
    closeModal('reviewModal');renderReviews();launchConfetti();
    toast(lang==='ar'?'شكراً على تقييمك ⭐':'Thank you ⭐');
  }).catch(function(){
    reviews.push(rev);
    window._revImgData=null;
    closeModal('reviewModal');renderReviews();launchConfetti();
    toast(lang==='ar'?'شكراً على تقييمك ⭐':'Thank you ⭐');
  });
}

// ── Cart ──
function renderCart(){
  var b=document.getElementById('cartItems'),tot=document.getElementById('cartTotal');
  b.innerHTML='';var total=0;
  if(!cart.length){
    b.innerHTML='<div class="empty-cart"><div class="empty-ic">🛒</div><div>'+t('empty')+'</div></div>';
    tot.innerHTML='';return;
  }
  cart.forEach(function(p,i){
    total+=p.price;
    b.innerHTML+='<div class="cart-item" style="animation-delay:'+(i*.08)+'s"><span>'+p[lang].n+'</span>'
      +'<span style="display:flex;align-items:center;gap:8px">'+p.price+' '+t('egp')
      +'<button class="icon-btn" onclick="removeCart('+i+')" style="color:var(--gold);cursor:pointer">✕</button></span></div>';
  });
  tot.innerHTML='<span>'+t('total')+'</span><span>'+total+' '+t('egp')+'</span>';
}
function flyToCart(sourceEl, emoji){
  var cartBtn=document.querySelector('.cart-btn');
  if(!sourceEl||!cartBtn)return;
  var startRect=sourceEl.getBoundingClientRect();
  var endRect=cartBtn.getBoundingClientRect();
  var startX=startRect.left+startRect.width/2;
  var startY=startRect.top+startRect.height/2;
  var endX=endRect.left+endRect.width/2;
  var endY=endRect.top+endRect.height/2;
  var midX=(startX+endX)/2;
  var midY=Math.min(startY,endY)-90;

  var fly=document.createElement('div');
  fly.innerHTML='✈️<span style="position:absolute;top:2px;right:-2px;font-size:13px">'+(emoji||'🎁')+'</span>';
  fly.style.cssText='position:fixed;z-index:9999;font-size:26px;pointer-events:none;left:0;top:0;'
    +'transform:translate('+startX+'px,'+startY+'px);opacity:1;';
  document.body.appendChild(fly);

  var duration=2000;
  var startTime=null;
  function animate(ts){
    if(!startTime)startTime=ts;
    var t=Math.min((ts-startTime)/duration,1);
    var x=(1-t)*(1-t)*startX + 2*(1-t)*t*midX + t*t*endX;
    var y=(1-t)*(1-t)*startY + 2*(1-t)*t*midY + t*t*endY;
    var angle=(endX-startX)>0?15:-195;
    var scale=1-(t*0.65);
    fly.style.transform='translate('+x+'px,'+y+'px) rotate('+angle+'deg) scale('+scale+')';
    fly.style.opacity=t>0.85 ? String(1-(t-0.85)/0.15) : '1';
    if(t<1){
      requestAnimationFrame(animate);
    } else {
      fly.remove();
      var badge=document.getElementById('cartBadge');
      if(badge){badge.classList.remove('bump');void badge.offsetWidth;badge.classList.add('bump');}
      cartBtn.classList.remove('cart-shake');void cartBtn.offsetWidth;cartBtn.classList.add('cart-shake');
    }
  }
  requestAnimationFrame(animate);
}

function addCart(id, sourceEl){
  var p=projects.find(function(x){return x.id===id;});if(!p)return;
  cart.push(p);updateCart();save();
  flyToCart(sourceEl, getIcon(p.ic));
  toast(lang==='ar'?'تمت الإضافة للسلة ✅':'Added to cart ✅');
}
function removeCart(i){cart.splice(i,1);updateCart();save();renderCart();}
function clearCart(){cart=[];updateCart();save();renderCart();toast(lang==='ar'?'تم مسح السلة':'Cart cleared');}
function renderCheckout(){
  loadPaymentMethods();
  var b=document.getElementById('coSummary');b.innerHTML='';var tot=0;
  if(!cart.length){b.innerHTML='<div class="empty-cart"><div class="empty-ic">🛒</div><div>'+t('empty')+'</div></div>';return;}
  cart.forEach(function(p){tot+=p.price;b.innerHTML+='<div class="cart-item"><span>'+p[lang].n+'</span><span>'+p.price+' '+t('egp')+'</span></div>';});
  b.innerHTML+='<div class="total-row"><span>'+t('total')+'</span><span>'+tot+' '+t('egp')+'</span></div>';
  buildCheckout();
}
function buildCheckout(){
  var n=document.getElementById('co_name')?document.getElementById('co_name').value:'';
  var ph=document.getElementById('co_phone')?document.getElementById('co_phone').value:'';
  var e=document.getElementById('co_extra')?document.getElementById('co_extra').value:'';
  var tot=0;
  var lines=cart.map(function(p){tot+=p.price;return '• '+p[lang].n+' ('+p.price+' ج.م)';}).join('\n');
  var msg='طلب جديد — SurpriseCode\n\nالاسم: '+(n||'—')+'\nالتليفون: '+(ph||'—')+'\n\nالمنتجات:\n'+(lines||'—')+'\nالإجمالي: '+tot+' ج.م\n\nإضافي: '+(e||'—')+'\n(مرفق صورة التحويل)';
  var el=document.getElementById('co_send');
  if(el)el.href='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);
}
function updateCart(){document.getElementById('cartBadge').textContent=cart.length;renderCart();}
var currentPaymentMethod='vodafone'; // vodafone | instapay | card
function copyNum(){
  var num = currentPaymentMethod==='instapay' ? (window._pmInstapay||'01023514568') : (window._pmVodafone||'01023514568');
  navigator.clipboard&&navigator.clipboard.writeText(num);
  toast(lang==='ar'?'تم نسخ الرقم ✅':'Number copied ✅');
}
function loadPaymentMethods(){
  fetch(API+'/api/payment-methods').then(function(r){return r.json();}).then(function(pm){
    window._pmVodafone = pm.vodafoneCash && pm.vodafoneCash.number || '01023514568';
    window._pmInstapay = pm.instapay && pm.instapay.handle || '01023514568';
    window._pmData = pm;
    renderPaymentMethods();
  }).catch(function(){});
}
function renderPaymentMethods(){
  var wrap=document.getElementById('coPaymentMethods'); if(!wrap||!window._pmData) return;
  var pm=window._pmData;
  var tabs='<div style="display:flex;gap:6px;margin-bottom:10px">';
  if(pm.vodafoneCash&&pm.vodafoneCash.active) tabs+='<button type="button" class="pm-tab'+(currentPaymentMethod==='vodafone'?' active':'')+'" onclick="switchPaymentMethod(\'vodafone\')">📱 فودافون كاش</button>';
  if(pm.instapay&&pm.instapay.active) tabs+='<button type="button" class="pm-tab'+(currentPaymentMethod==='instapay'?' active':'')+'" onclick="switchPaymentMethod(\'instapay\')">🏦 إنستاباي</button>';
  tabs+='<button type="button" class="pm-tab'+(pm.card&&pm.card.active?'':' disabled')+(currentPaymentMethod==='card'?' active':'')+'" '+(pm.card&&pm.card.active?'onclick="switchPaymentMethod(\'card\')"':'')+'>💳 فيزا '+(pm.card&&pm.card.active?'':'(قريباً)')+'</button>';
  tabs+='</div>';
  if(pm.card&&pm.card.active){
    tabs+='<div class="secure-pay-badge">🔒 مدفوعات آمنة عبر Paymob</div>';
  }

  var box='';
  if(currentPaymentMethod==='vodafone'){
    box='<div class="pay-box"><span>فودافون كاش</span><span style="display:flex;align-items:center;gap:8px"><b>'+window._pmVodafone+'</b>'
      +'<button class="icon-btn" onclick="copyNum()" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></span></div>';
  } else if(currentPaymentMethod==='instapay'){
    box='<div class="pay-box"><span>إنستاباي</span><span style="display:flex;align-items:center;gap:8px"><b>'+window._pmInstapay+'</b>'
      +'<button class="icon-btn" onclick="copyNum()" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></span></div>';
  } else if(currentPaymentMethod==='card'){
    box='<div class="pay-box" style="justify-content:center;color:var(--txt3)">الدفع بالفيزا هيبقى متاح قريباً 💳</div>';
  }
  wrap.innerHTML = tabs + box;
}
function switchPaymentMethod(method){
  currentPaymentMethod=method;
  renderPaymentMethods();
}
function orderSent(e){
  if(e&&e.preventDefault)e.preventDefault();
  var name=document.getElementById('co_name')?document.getElementById('co_name').value.trim():'';
  var phone=document.getElementById('co_phone')?document.getElementById('co_phone').value.trim():'';
  if(!name||!phone){toast(lang==='ar'?'اكتب اسمك ورقمك الأول':'Enter your name and phone first');return false;}
  var extra=document.getElementById('co_extra')?document.getElementById('co_extra').value:'';
  var tot=cart.reduce(function(acc,p){return acc+p.price;},0);
  var lines=cart.map(function(p){return '• '+p[lang].n+' ('+p.price+' ج.م)';}).join('\n');

  function openWa(orderNum){
    var trackLine = orderNum ? ('\nرقم الطلب للتتبع: #'+orderNum) : '';
    var msg='طلب جديد — SurpriseCode\n\nالاسم: '+(name||'—')+'\nالتليفون: '+(phone||'—')+trackLine+'\n\nالمنتجات:\n'+(lines||'—')+'\nالإجمالي: '+tot+' ج.م\n\nإضافي: '+(extra||'—')+'\n(مرفق صورة التحويل)';
    window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(msg), '_blank');
    cart=[];updateCart();save();
    setTimeout(function(){
      window.location.href = '/thank-you.html' + (orderNum ? ('?order='+orderNum) : '');
    }, 500);
  }

  if(cart.length&&name&&phone){
    fetch(API+'/api/orders',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:name,phone:phone,items:cart.map(function(p){return p[lang].n;}),itemIds:cart.map(function(p){return p.id;}),total:tot,note:extra})
    }).then(function(r){return r.json();}).then(function(data){
      openWa(data&&data.orderNum);
    }).catch(function(){ openWa(null); });
  } else {
    openWa(null);
  }
  return false;
}

// ── Custom Order ──
(function(){
  var input=document.getElementById('custom_idea');
  var send=document.getElementById('custom_send');
  if(!send)return;
  function buildMsg(){
    var name=document.getElementById('custom_name')?document.getElementById('custom_name').value:'';
    var phone=document.getElementById('custom_phone')?document.getElementById('custom_phone').value:'';
    var idea=input?input.value:'';
    var budget=document.getElementById('custom_budget')?document.getElementById('custom_budget').value:'';
    var msg='طلب خاص — SurpriseCode\n\nالاسم: '+(name||'—')+'\nالتليفون: '+(phone||'—')+'\n\nالفكرة:\n'+(idea||'—')+'\n\nالميزانية: '+(budget||'—');
    send.href='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);
  }
  ['custom_name','custom_phone','custom_idea','custom_budget'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.addEventListener('input',buildMsg);
  });
  buildMsg();
})();

// ── Track Order ──
function trackOrder(){
  var phone=document.getElementById('track_phone').value.trim();
  var result=document.getElementById('trackResult');
  if(!phone){toast(lang==='ar'?'ادخل رقم التليفون':'Enter phone number');return;}
  result.innerHTML='<p style="color:var(--txt3);font-size:14px">جاري البحث...</p>';
  fetch(API+'/api/orders/track/'+phone)
  .then(function(r){return r.json();})
  .then(function(data){
    if(!data.ok){
      result.innerHTML='<p style="color:var(--txt3);font-size:14px;text-align:center;padding:16px">'+( lang==='ar'?'لا يوجد طلبات بهذا الرقم':'No orders found for this number')+'</p>';
      return;
    }
    var statusMap={pending:lang==='ar'?'⏳ قيد المراجعة':'⏳ Pending',done:lang==='ar'?'✅ تم التسليم':'✅ Delivered',cancelled:lang==='ar'?'❌ ملغي':'❌ Cancelled'};
    result.innerHTML=data.orders.map(function(o){
      return '<div class="track-result-item"><h4>طلب #'+o.orderNum+'</h4>'
        +'<p style="font-size:13px;color:var(--txt2);margin-bottom:6px">'+new Date(o.date).toLocaleDateString('ar-EG')+'</p>'
        +'<span class="order-status status-'+(o.status||'pending')+'">'+(statusMap[o.status||'pending'])+'</span>'
        +'<p style="font-size:13px;color:var(--txt3);margin-top:8px">الإجمالي: '+o.total+' ج.م</p></div>';
    }).join('');
  }).catch(function(){
    result.innerHTML='<p style="color:var(--txt3);font-size:14px;text-align:center;padding:16px">'+(lang==='ar'?'تأكد إن السيرفر شغّال':'Make sure the server is running')+'</p>';
  });
}

// ── Validation ──
function validateName(input){
  var clean=input.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g,'');
  if(input.value!==clean){input.value=clean;input.classList.add('error');setTimeout(function(){input.classList.remove('error');},500);}
}
function validatePhone(input){
  var clean=input.value.replace(/[^0-9+\s-]/g,'');
  if(input.value!==clean){input.value=clean;input.classList.add('error');setTimeout(function(){input.classList.remove('error');},500);}
}

// ── Modals ──
function openModal(id){
  document.getElementById(id).classList.add('open');
  if(id==='cartModal')renderCart();
  if(id==='reviewModal')renderStarPicker();
}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal').forEach(function(m){
  m.addEventListener('click',function(e){if(e.target===m)m.classList.remove('open');});
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape')document.querySelectorAll('.modal.open').forEach(function(m){m.classList.remove('open');});
});

// ── Admin ──
function showAdmTab(tab,btn){
  if(tab==='security'){loadLoginLog();loadSubAdmins();}
  document.querySelectorAll('.adm-pane').forEach(function(p){p.style.display='none';});
  document.querySelectorAll('.adm-tab').forEach(function(b){b.classList.remove('active');});
  var pane=document.getElementById('adm'+tab.charAt(0).toUpperCase()+tab.slice(1));
  if(pane)pane.style.display='block';
  btn.classList.add('active');
  if(tab==='stats')loadAdminStats();
  if(tab==='reviews')renderAdminRevList();
  if(tab==='orders')loadAdminOrders();
  if(tab==='pricing')loadAdminPlans();
  if(tab==='settings'){loadMaintenance();loadSectionsToggles();}
}
// ── OTP Login System ──
var otpResendTimer=null;

function requestOTP(){
  var email=document.getElementById('adm_email').value.trim();
  var errEl=document.getElementById('loginError');
  errEl.style.display='none';
  if(!email){errEl.textContent='ادخل إيميلك';errEl.style.display='block';return;}
  
  var btn=document.getElementById('otpBtn');
  btn.textContent='جاري الإرسال...';btn.disabled=true;
  
  fetch(API+'/api/admin/request-otp',{method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email:email})
  })
  .then(function(r){return r.json();})
  .then(function(data){
    btn.disabled=false;btn.textContent='📧 ابعتلي الكود';
    if(data.ok){
      document.getElementById('otpStep1').style.display='none';
      document.getElementById('otpStep2').style.display='block';
      startResendTimer(60);
      toast('✅ تم إرسال الكود على إيميلك!');
      setTimeout(function(){document.getElementById('adm_otp').focus();},300);
    } else {
      errEl.textContent=data.msg||'حدث خطأ';
      errEl.style.display='block';
    }
  })
  .catch(function(){
    btn.disabled=false;btn.textContent='📧 ابعتلي الكود';
    errEl.textContent='تأكد إن السيرفر شغّال';
    errEl.style.display='block';
  });
}

function verifyOTP(){
  var email=document.getElementById('adm_email').value.trim();
  var otp=document.getElementById('adm_otp').value.trim();
  var errEl=document.getElementById('otpError');
  errEl.style.display='none';
  if(otp.length!==6){errEl.textContent='الكود 6 أرقام';errEl.style.display='block';return;}
  
  var btn=document.getElementById('verifyBtn');
  btn.textContent='جاري التحقق...';btn.disabled=true;
  
  fetch(API+'/api/admin/verify-otp',{method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email:email,otp:otp})
  })
  .then(function(r){return r.json();})
  .then(function(data){
    btn.disabled=false;btn.textContent='✅ تأكيد الدخول';
    if(data.ok){
      adminToken=data.token;
      localStorage.setItem('sc_admin_token',data.token);
      clearInterval(otpResendTimer);
      document.getElementById('adminLogin').style.display='none';
      document.getElementById('adminPanel').style.display='block';
      document.getElementById('admTitle').textContent=t('adm_dash');
      showAdmTab('stats',document.querySelector('.adm-tab'));
      loadAdminProjects();
      toast('🎉 أهلاً بيك في لوحة التحكم!');
    } else {
      errEl.textContent=data.msg||'الكود غلط';
      errEl.style.display='block';
      document.getElementById('adm_otp').value='';
      document.getElementById('adm_otp').focus();
    }
  })
  .catch(function(){
    btn.disabled=false;btn.textContent='✅ تأكيد الدخول';
    errEl.textContent='تأكد إن السيرفر شغّال';
    errEl.style.display='block';
  });
}

function backToEmail(){
  document.getElementById('otpStep2').style.display='none';
  document.getElementById('otpStep1').style.display='block';
  document.getElementById('adm_otp').value='';
  clearInterval(otpResendTimer);
}

function startResendTimer(secs){
  var remaining=secs;
  var timerEl=document.getElementById('resendTimer');
  var resendBtn=document.getElementById('resendBtn');
  resendBtn.style.display='none';
  clearInterval(otpResendTimer);
  otpResendTimer=setInterval(function(){
    remaining--;
    if(timerEl)timerEl.textContent='إعادة الإرسال بعد '+remaining+' ث';
    if(remaining<=0){
      clearInterval(otpResendTimer);
      if(timerEl)timerEl.textContent='';
      if(resendBtn)resendBtn.style.display='inline';
    }
  },1000);
}

function adminLogout(){
  adminToken=null;
  localStorage.removeItem('sc_admin_token');
  clearInterval(otpResendTimer);
  document.getElementById('adminPanel').style.display='none';
  document.getElementById('adminLogin').style.display='block';
  document.getElementById('admTitle').textContent=t('adm_h');
  document.getElementById('adm_otp') && (document.getElementById('adm_otp').value='');
  document.getElementById('otpStep1').style.display='block';
  document.getElementById('otpStep2').style.display='none';
}

// ── Sub Admins ──


function toggleSubAdmin(id,active){
  fetch(API+'/api/admin/sub-admins/'+id,{method:'PUT',
    headers:{'Content-Type':'application/json','x-admin-token':adminToken},
    body:JSON.stringify({active:active})
  }).then(function(){loadSubAdmins();toast(active?'تم التفعيل':'تم الإيقاف');});
}

function deleteSubAdmin(id){
  if(!confirm('حذف الأدمن؟'))return;
  fetch(API+'/api/admin/sub-admins/'+id,{method:'DELETE',headers:{'x-admin-token':adminToken}})
  .then(function(){loadSubAdmins();toast('تم الحذف');});
}

function renderAdminList(){
  // Auto-restore token if lost
  if(!adminToken) adminToken=localStorage.getItem('sc_admin_token')||null;
  var l=document.getElementById('adminProjList');if(!l)return;l.innerHTML='';
  projects.forEach(function(p){
    var d=document.createElement('div');d.className='admin-item';
    d.style.flexWrap='wrap';d.style.gap='8px';
    // Image thumb
    var thumb='';
    if(p.imgs&&p.imgs.length){
      thumb='<img src="'+p.imgs[0]+'" style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0">';
    } else {
      thumb='<span style="font-size:24px;flex-shrink:0">'+getIcon(p.ic)+'</span>';
    }
    d.innerHTML=thumb
      +'<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;color:var(--txt)">'+p.ar.n+'</div>'
      +'<div style="font-size:12px;color:var(--gold)">'+p.price+' ج.م</div></div>';
    var actions=document.createElement('div');actions.className='proj-actions';
    var editBtn=document.createElement('button');editBtn.className='edit-btn';editBtn.textContent='✏️ تعديل';
    (function(id){editBtn.onclick=function(){editProject(id);showAdmTab('projects',document.querySelector('.adm-tab'));};})(p.id);
    var delBtn=document.createElement('button');delBtn.className='del-btn';delBtn.textContent='🗑️';
    (function(id){delBtn.onclick=function(){if(confirm(lang==='ar'?'حذف المشروع؟':'Delete?'))deleteProject(id);};})(p.id);
    actions.appendChild(editBtn);actions.appendChild(delBtn);
    d.appendChild(actions);
    l.appendChild(d);
  });
}
function renderAdminRevList(){
  var l=document.getElementById('adminRevList');if(!l)return;l.innerHTML='';
  if(!reviews.length){l.innerHTML='<p style="color:var(--txt3);font-size:14px;text-align:center;padding:20px">لا يوجد تقييمات</p>';return;}
  reviews.forEach(function(r,i){
    var d=document.createElement('div');d.className='admin-item';
    d.innerHTML='<span style="flex:1"><b>'+escapeHtml(r.name)+'</b> ★'+r.stars+'<br><small style="color:var(--txt3)">'+escapeHtml(String(r.text||'').substring(0,50))+'...</small></span>';
    var x=document.createElement('button');x.className='del-btn';x.textContent=t('del');
    x.onclick=function(){
      fetch(API+'/api/admin/reviews/'+r.id,{method:'DELETE',headers:{'x-admin-token':adminToken}})
      .then(function(){reviews.splice(i,1);renderReviews();renderAdminRevList();toast(lang==='ar'?'تم الحذف':'Deleted');})
      .catch(function(){reviews.splice(i,1);renderReviews();renderAdminRevList();});
    };
    d.appendChild(x);l.appendChild(d);
  });
}
function updateOrderStatus(id,status){
  fetch(API+'/api/admin/orders/'+id+'/status',{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify({status:status})})
  .then(function(){toast(lang==='ar'?'تم التحديث ✅':'Updated ✅');});
}
// addProject replaced by saveProject
function deleteProject(id){
  fetch(API+'/api/admin/projects/'+id,{method:'DELETE',headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(data){
    if(data.ok){projects=projects.filter(function(p){return p.id!==id;});renderDesigns();renderAdminList();loadAdminStats();toast(lang==='ar'?'تم الحذف':'Deleted');}
  });
}

// ── Social Proof ──
function showSocialProof(){
  if(IS_MOBILE)return;
  var names=lang==='ar'?SP_NAMES_AR:SP_NAMES_EN;
  var occs=SP_OCCs_AR;
  var name=names[Math.floor(Math.random()*names.length)];
  var occ=occs[Math.floor(Math.random()*occs.length)];
  var msgs_ar=['طلب '+occ,'أضاف '+occ+' للسلة','اشترى '+occ];
  var msg=msgs_ar[Math.floor(Math.random()*msgs_ar.length)];
  var wrap=document.getElementById('socialProof');
  var n=document.createElement('div');n.className='sp-notif';
  n.innerHTML='<span style="font-size:22px">🎁</span><span><b>'+name+'</b> — '+msg+'<br><small style="color:var(--txt3)">منذ '+(Math.floor(Math.random()*30)+1)+' دقيقة</small></span>';
  wrap.appendChild(n);
  setTimeout(function(){n.classList.add('hide');setTimeout(function(){if(n.parentNode)n.remove();},500);},4000);
}
setInterval(showSocialProof,18000);
setTimeout(showSocialProof,8000);

// ── Confetti ──
function launchConfetti(){
  var colors=['#b89968','#cdb084','#e8d5b0','#2b3327','#ece3d8','#fff'];
  var wrap=document.getElementById('confettiWrap');
  var canvas=document.createElement('canvas');
  wrap.innerHTML='';wrap.appendChild(canvas);
  wrap.style.cssText='position:fixed;inset:0;z-index:9995;pointer-events:none';
  canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  var ctx=canvas.getContext('2d');
  var pieces=[];
  for(var i=0;i<100;i++){
    pieces.push({x:Math.random()*canvas.width,y:-20,r:Math.random()*5+2,
      color:colors[Math.floor(Math.random()*colors.length)],
      vx:(Math.random()-.5)*3.5,vy:Math.random()*3+1.5,
      rot:Math.random()*360,rspeed:(Math.random()-.5)*6,opacity:1});
  }
  var frame=0;
  function draw(){
    frame++;ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(function(p){
      p.x+=p.vx;p.y+=p.vy;p.rot+=p.rspeed;
      if(frame>70)p.opacity-=.02;
      ctx.save();ctx.globalAlpha=Math.max(0,p.opacity);
      ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color;ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);
      ctx.restore();
    });
    if(frame<120)requestAnimationFrame(draw);else wrap.innerHTML='';
  }
  draw();
}

// ── Toast ──
var _toastTimer;
function toast(m){
  var e=document.getElementById('toast');e.textContent=m;e.classList.add('show');
  clearTimeout(_toastTimer);_toastTimer=setTimeout(function(){e.classList.remove('show');},2500);
}

// ── Lang / Theme ──
function applyLang(){
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-t]').forEach(function(el){
    var k=el.getAttribute('data-t');var v=t(k);if(v&&v!==k)el.textContent=v;
  });
  document.getElementById('langLbl').textContent=lang==='ar'?'EN':'ع';
  var ps=document.getElementById('preSub');if(ps)ps.textContent=t('pre_sub');
  var backIc=document.getElementById('backIc');
  if(backIc)backIc.innerHTML=lang==='ar'
    ?'<polyline points="9 18 15 12 9 6"/>'
    :'<polyline points="15 18 9 12 15 6"/>';
  var heroTitle=document.querySelector('.hero-title');
  if(heroTitle)heroTitle.style.fontFamily=lang==='ar'?'var(--serif-ar)':'var(--display)';
  renderSteps();renderWhy();renderDesigns();loadPricing();renderReviews();renderFAQ();renderCart();updateCart();applySectionsVisibility();
  setTimeout(function(){observeReveal();},80);
}
function toggleLang(){lang=lang==='ar'?'en':'ar';save();applyLang();}
function toggleTheme(){
  theme=theme==='dark'?'light':'dark';
  document.body.setAttribute('data-theme',theme);
  var btn=document.getElementById('themeBtnWrap');
  if(btn){
    if(theme==='dark'){
      btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    } else {
      btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  }
  save();
}
function scrollTo2(id){
  document.getElementById('navLinks').classList.remove('open');
  var el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'});
}
function goBack(){window.scrollTo({top:0,behavior:'smooth'});}
function toggleMenu(){document.getElementById('navLinks').classList.toggle('open');}

// ── Observers ──
function observeSteps(){
  var nodes=document.querySelectorAll('.step-node');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('active');});},{threshold:.35});
  nodes.forEach(function(n){io.observe(n);});
}
function observeReveal(){
  var els=document.querySelectorAll('.reveal:not(.show)');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('show');
        e.target.querySelectorAll('[data-count]').forEach(animateCounter);
        io.unobserve(e.target);
      }
    });
  },{threshold:.08});
  els.forEach(function(el){io.observe(el);});
}

// ── Save / Load ──
function save(){try{localStorage.setItem('sc',JSON.stringify({lang:lang,theme:theme,cart:cart}));}catch(e){}}
function load(){try{var s=JSON.parse(localStorage.getItem('sc'));if(s){lang=s.lang||'ar';theme=s.theme||'light';cart=s.cart||[];}}catch(e){}}
function loadReviews(){
  fetch(API+'/api/reviews')
  .then(function(r){return r.json();})
  .then(function(data){if(data&&data.length)reviews=data;})
  .catch(function(){});
}


// ── Floating Petals ──
(function(){
  var petals=['🌸','🌹','⭐','✨','💫','🌟'];
  function spawnPetal(){
    var el=document.createElement('div');
    el.className='petal';
    el.textContent=petals[Math.floor(Math.random()*petals.length)];
    el.style.left=(Math.random()*100)+'%';
    el.style.animationDuration=(8+Math.random()*12)+'s';
    el.style.animationDelay=(Math.random()*5)+'s';
    el.style.fontSize=(10+Math.random()*8)+'px';
    el.style.opacity=(0.3+Math.random()*0.4);
    document.getElementById('heroBg').appendChild(el);
    setTimeout(function(){if(el.parentNode)el.remove();spawnPetal();},(8+Math.random()*12)*1000);
  }
  for(var i=0;i<8;i++) setTimeout(spawnPetal, i*800);
})();


// ── حماية الموقع ──
// منع Right Click على الصور
document.addEventListener('contextmenu', function(e){
  if(e.target.tagName==='IMG') e.preventDefault();
});
// منع DevTools shortcuts (بس مش بتمنع كلها)
document.addEventListener('keydown', function(e){
  if(e.key==='F12') e.preventDefault();
  if(e.ctrlKey && e.shiftKey && e.key==='I') e.preventDefault();
  if(e.ctrlKey && e.key==='u') e.preventDefault();
});
// Console warning
console.log('%c⚠️ تحذير!', 'color:red;font-size:24px;font-weight:bold');
console.log('%cلو حد طلب منك تعمل حاجة هنا - ده اختراق محتمل! 🚨', 'color:orange;font-size:14px');


// ── Admin: Stats with Charts ──
var allOrdersCache = [];
var currentOrderFilter = 'all';

function loadAdminStats(){
  fetch(API+'/api/admin/stats',{headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(data){
    document.getElementById('statVisits').textContent=(data.visitsToday||0).toLocaleString();
    document.getElementById('statVisitsWeek').textContent=(data.visitsWeek||0).toLocaleString();
    document.getElementById('statVisitsMonth').textContent=(data.visitsMonth||0).toLocaleString();
    document.getElementById('statOrders').textContent=(data.ordersToday||0).toLocaleString();
    document.getElementById('statRevenue').textContent=(data.revenueToday||0).toLocaleString();
    document.getElementById('statProjects').textContent=data.projects||0;
    renderSourcesChart(data.sources||{});
    renderCountriesChart(data.countries||{});
    renderTrafficAnomaly(data.trafficAnomaly);
  });
}

function renderTrafficAnomaly(anomaly){
  var existing=document.getElementById('trafficAnomalyBanner');
  if(existing)existing.remove();
  if(!anomaly)return;
  var pane=document.getElementById('admStats');
  if(!pane)return;
  var banner=document.createElement('div');
  banner.id='trafficAnomalyBanner';
  var isDrop=anomaly.type==='drop';
  banner.style.cssText='background:'+(isDrop?'rgba(224,71,58,.1)':'rgba(37,211,102,.1)')+';border:1px solid '+(isDrop?'#e0473a':'#25d366')+';border-radius:12px;padding:12px 16px;margin-bottom:14px;font-size:13px;color:'+(isDrop?'#e0473a':'#25a25a');
  banner.textContent=(isDrop?'⚠️ ':'📈 ')+'الزيارات النهاردة '+(isDrop?'قلّت':'زادت')+' بنسبة '+Math.abs(anomaly.pct)+'% عن المعدل — '+(isDrop?'يستاهل تتأكد إن الموقع شغال صح':'حاجة كويسة، شوف مصدرها من أسفل');
  pane.insertBefore(banner, pane.firstChild);
}

function renderSourcesChart(sources){
  var el=document.getElementById('sourcesChart');if(!el)return;
  var colors={'whatsapp':'#25d366','instagram':'#e1306c','facebook':'#1877f2','direct':'#b89968','other':'#9a9583'};
  var labels={'whatsapp':'واتساب','instagram':'انستاجرام','facebook':'فيسبوك','direct':'مباشر','other':'أخرى'};
  var total=Object.values(sources).reduce(function(a,b){return a+b;},0)||1;
  var html='<div style="display:flex;flex-direction:column;gap:8px">';
  var sorted=Object.entries(sources).sort(function(a,b){return b[1]-a[1];}).slice(0,6);
  sorted.forEach(function(entry){
    var key=entry[0],val=entry[1];
    var pct=Math.round(val/total*100);
    var color=colors[key]||'#b89968';
    var label=labels[key]||key;
    html+='<div>'
      +'<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--txt2);margin-bottom:4px">'
      +'<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+color+';margin-left:6px"></span>'+label+'</span>'
      +'<span style="color:var(--gold);font-weight:700">'+pct+'٪ ('+val+')</span></div>'
      +'<div style="height:8px;background:var(--panel-br);border-radius:4px;overflow:hidden">'
      +'<div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:4px;transition:width 1s ease"></div>'
      +'</div></div>';
  });
  html+='</div>';
  el.innerHTML=html;
}

function renderCountriesChart(countries){
  var el=document.getElementById('countriesChart');if(!el)return;
  var flags={'مصر':'🇪🇬','السعودية':'🇸🇦','الإمارات':'🇦🇪','الكويت':'🇰🇼','قطر':'🇶🇦','البحرين':'🇧🇭','الأردن':'🇯🇴','unknown':'🌍'};
  var total=Object.values(countries).reduce(function(a,b){return a+b;},0)||1;
  var sorted=Object.entries(countries).sort(function(a,b){return b[1]-a[1];}).slice(0,8);
  if(!sorted.length){el.innerHTML='<p style="color:var(--txt3);font-size:13px;text-align:center;padding:12px">لا يوجد بيانات بعد</p>';return;}
  var html='<div style="display:flex;flex-direction:column;gap:7px">';
  sorted.forEach(function(entry){
    var key=entry[0],val=entry[1];
    var pct=Math.round(val/total*100);
    var flag=flags[key]||'🌍';
    html+='<div style="display:flex;align-items:center;gap:8px;font-size:13px">'
      +'<span style="font-size:18px">'+flag+'</span>'
      +'<span style="flex:1;color:var(--txt2)">'+key+'</span>'
      +'<span style="color:var(--gold);font-weight:700;min-width:40px;text-align:left">'+pct+'٪</span>'
      +'<div style="width:80px;height:6px;background:var(--panel-br);border-radius:3px;overflow:hidden">'
      +'<div style="height:100%;width:'+pct+'%;background:var(--gold);border-radius:3px"></div>'
      +'</div></div>';
  });
  html+='</div>';
  el.innerHTML=html;
}

// ── Admin: Orders with filter ──
function filterOrders(status,btn){
  currentOrderFilter=status;
  document.querySelectorAll('#admOrders .adm-tab').forEach(function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
  renderOrderList();
}

function loadAdminOrders(){
  var l=document.getElementById('adminOrderList');
  if(l)l.innerHTML='<p style="color:var(--txt3);font-size:13px;text-align:center;padding:16px">جاري التحميل...</p>';
  fetch(API+'/api/admin/orders',{headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(orders){
    allOrdersCache=(orders||[]).reverse();
    renderOrderList();
  })
  .catch(function(){
    if(l)l.innerHTML='<p style="color:#e05;font-size:13px;text-align:center;padding:16px">خطأ في التحميل — تأكد إن السيرفر شغّال</p>';
  });
}

function renderOrderList(){
  var l=document.getElementById('adminOrderList');if(!l)return;
  var orders=allOrdersCache;
  if(currentOrderFilter!=='all') orders=orders.filter(function(o){return o.status===currentOrderFilter;});
  if(!orders.length){l.innerHTML='<p style="color:var(--txt3);font-size:13px;text-align:center;padding:20px">لا يوجد طلبات</p>';return;}
  var statusMap={pending:'⏳ قيد المراجعة',done:'✅ تم التسليم',cancelled:'❌ ملغي'};
  l.innerHTML=orders.map(function(o){
    return '<div class="admin-item" style="flex-direction:column;align-items:flex-start;gap:6px">'
      +'<div style="display:flex;justify-content:space-between;width:100%;align-items:center;flex-wrap:wrap;gap:6px">'
      +'<b style="color:var(--gold)">#'+o.orderNum+'</b>'
      +'<select onchange="updateOrderStatus('+o.id+',this.value)" style="border:1px solid var(--panel-br);background:var(--bg2);color:var(--txt);border-radius:8px;padding:4px 8px;font-size:12px;cursor:pointer;font-family:var(--body)">'
      +'<option value="pending"'+(o.status==='pending'?' selected':'')+'>⏳ قيد المراجعة</option>'
      +'<option value="done"'+(o.status==='done'?' selected':'')+'>✅ تم التسليم</option>'
      +'<option value="cancelled"'+(o.status==='cancelled'?' selected':'')+'>❌ ملغي</option>'
      +'</select></div>'
      +'<span style="font-size:13px">👤 '+escapeHtml(o.name)+' — 📞 '+escapeHtml(o.phone)+'</span>'
      +'<span style="color:var(--txt3);font-size:12px">'+new Date(o.date).toLocaleString('ar-EG')+' — '+o.total+' ج.م</span>'
      +(o.adminNote?'<span style="color:var(--gold2);font-size:12px">📝 '+escapeHtml(o.adminNote)+'</span>':'')
      +'<div style="display:flex;gap:6px;margin-top:4px">'
      +'<a href="https://wa.me/2'+encodeURIComponent(o.phone)+'?text='+encodeURIComponent('أهلاً '+o.name+'! طلبك #'+o.orderNum+' ')+'" target="_blank" style="font-size:11px;color:#25d366;text-decoration:none;border:1px solid #25d366;padding:3px 8px;border-radius:6px">واتساب</a>'
      +'</div></div>';
  }).join('');
}

// ── Game Config Admin ──
function loadGameConfig(){
  fetch(API+'/api/admin/game-config',{headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(cfg){
    var fields=['knifeScore','fruitScore','stageClear','baseSpeed','baseKnives','coupon10','coupon30','coupon50','welcomeMsg','seasonName'];
    fields.forEach(function(f){
      var el=document.getElementById('gc_'+f);
      if(el&&cfg[f]!==undefined)el.value=cfg[f];
    });
    var btn=document.getElementById('gameToggleBtn');
    if(btn){btn.textContent=cfg.active?'🟢 شغّالة':'🔴 متوقفة';btn.style.color=cfg.active?'#25d366':'#e05';}
  });
}

function saveGameConfig(){
  var cfg={};
  var fields=['knifeScore','fruitScore','stageClear','baseSpeed','baseKnives','coupon10','coupon30','coupon50'];
  fields.forEach(function(f){
    var el=document.getElementById('gc_'+f);
    if(el)cfg[f]=parseFloat(el.value)||0;
  });
  var wm=document.getElementById('gc_welcomeMsg');if(wm)cfg.welcomeMsg=wm.value;
  var sn=document.getElementById('gc_seasonName');if(sn)cfg.seasonName=sn.value;
  fetch(API+'/api/admin/game-config',{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify(cfg)})
  .then(function(r){return r.json();})
  .then(function(d){if(d.ok)toast('✅ تم حفظ إعدادات اللعبة');});
}

function toggleGame(){
  var btn=document.getElementById('gameToggleBtn');
  var isActive=btn&&btn.textContent.includes('شغّالة');
  fetch(API+'/api/admin/game-config',{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify({active:!isActive})})
  .then(function(){loadGameConfig();toast(isActive?'🔴 تم إيقاف اللعبة':'🟢 تم تشغيل اللعبة');});
}

// ── Maintenance ──
function loadMaintenance(){
  fetch(API+'/api/admin/maintenance',{headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(data){
    var badge=document.getElementById('maintStatusBadge');
    if(badge){
      badge.innerHTML = data.active
        ? '<span style="color:#e05;font-weight:700">🔴 الموقع دلوقتي في وضع الصيانة</span>'
        : '<span style="color:#25d366;font-weight:700">🟢 الموقع شغال عادي دلوقتي</span>';
    }
    var msg=document.getElementById('maintMsg');
    if(msg&&data.msg)msg.value=data.msg;
  });
}

function setMaintenance(active){
  fetch(API+'/api/admin/maintenance',{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify({active:active})})
  .then(function(){loadMaintenance();toast(active?'🔴 تم تشغيل وضع الصيانة':'🟢 تم إيقاف وضع الصيانة');});
}

function saveMaintMsg(){
  var msg=document.getElementById('maintMsg');if(!msg)return;
  fetch(API+'/api/admin/maintenance',{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify({msg:msg.value})})
  .then(function(){toast('✅ تم حفظ رسالة الصيانة');});
}

// ── Sections Visibility ──
var SECTION_LABELS={
  about:'🖼️ نبذة عني', designs:'✨ الديزاينات', pricing:'💳 الباقات والأسعار',
  steps:'📋 خطوات الطلب', why:'❤️ ليه تختارنا', reviews:'⭐ آراء العملاء',
  faq:'❓ الأسئلة الشائعة', game:'🎮 اللعبة'
};
function loadSectionsToggles(){
  fetch(API+'/api/admin/sections',{headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(data){ renderSectionsToggles(data||{}); });
}
function renderSectionsToggles(sections){
  var wrap=document.getElementById('sectionsToggleList'); if(!wrap) return;
  wrap.innerHTML='';
  Object.keys(SECTION_LABELS).forEach(function(key){
    var active = sections[key] !== false;
    var row=document.createElement('div'); row.className='admin-item';
    row.innerHTML='<span style="flex:1">'+SECTION_LABELS[key]+'</span>';
    var btn=document.createElement('button');
    btn.className = active ? 'edit-btn' : 'del-btn';
    btn.textContent = active ? '👁️ ظاهر — اضغط للإخفاء' : '🙈 مخفي — اضغط للإظهار';
    (function(k,a){ btn.onclick=function(){ toggleSection(k, !a); }; })(key, active);
    row.appendChild(btn);
    wrap.appendChild(row);
  });
}
function toggleSection(key, active){
  var body={}; body[key]=active;
  fetch(API+'/api/admin/sections',{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify(body)})
  .then(function(r){return r.json();})
  .then(function(data){ renderSectionsToggles(data.sectionsVisibility||{}); toast(active?'✅ القسم بقى ظاهر':'🙈 القسم اتخفى'); });
}

// ── Security ──
function loadLoginLog(){
  fetch(API+'/api/admin/login-log',{headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(log){
    var el=document.getElementById('loginLog');if(!el)return;
    if(!log.length){el.innerHTML='<p style="color:var(--txt3);font-size:13px;text-align:center;padding:12px">لا يوجد سجلات بعد</p>';return;}
    el.innerHTML=log.slice(0,15).map(function(l){
      return '<div class="admin-item" style="font-size:12px">'
        +'<span>'+(l.type==='success'?'✅':'❌')+' '+(l.email||l.ip||'—')+'</span>'
        +'<span style="color:var(--txt3)">'+new Date(l.time).toLocaleString('ar-EG')+'</span></div>';
    }).join('');
  });
}

function loadBlockedIPs(){
  fetch(API+'/api/admin/blocked-ips',{headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(ips){
    var el=document.getElementById('blockedIPsList');if(!el)return;
    if(!ips.length){el.innerHTML='<p style="color:var(--txt3);font-size:13px">لا يوجد IPs محظورة</p>';return;}
    el.innerHTML=ips.map(function(ip){
      return '<div class="admin-item"><span style="font-family:monospace;font-size:13px">🚫 '+ip+'</span>'
      +'<button class="del-btn" onclick="unblockIP(this.dataset.ip)" data-ip="'+ip+'">رفع الحظر</button></div>';
    }).join('');
  });
}

function blockIP(){
  var ip=document.getElementById('newBlockIP').value.trim();
  if(!ip){toast('ادخل الـ IP');return;}
  fetch(API+'/api/admin/block-ip',{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify({ip:ip})})
  .then(function(){document.getElementById('newBlockIP').value='';loadBlockedIPs();toast('✅ تم حظر '+ip);});
}

function unblockIP(ip){
  fetch(API+'/api/admin/block-ip/'+ip,{method:'DELETE',headers:{'x-admin-token':adminToken}})
  .then(function(){loadBlockedIPs();toast('✅ تم رفع الحظر');});
}

// ── Sub Admins ──
function addSubAdmin(){
  var email=document.getElementById('sub_email').value.trim();
  var name=document.getElementById('sub_name').value.trim();
  if(!email){toast('ادخل الإيميل');return;}
  fetch(API+'/api/admin/sub-admins',{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify({email:email,name:name,permissions:['orders','reviews']})})
  .then(function(r){return r.json();})
  .then(function(data){
    if(data.ok){
      document.getElementById('sub_email').value='';document.getElementById('sub_name').value='';
      loadSubAdmins();
      toast('✅ تم الإضافة. كلمة المرور: '+data.tempPass);
    }
  });
}

function loadSubAdmins(){
  fetch(API+'/api/admin/sub-admins',{headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(list){
    var el=document.getElementById('subAdminList');if(!el)return;
    if(!list.length){el.innerHTML='<p style="color:var(--txt3);font-size:13px;text-align:center">لا يوجد أدمن إضافي</p>';return;}
    el.innerHTML=list.map(function(s){
      return '<div class="admin-item"><div style="flex:1"><b style="font-size:13px">'+escapeHtml(s.name)+'</b><br><small style="color:var(--txt3)">'+escapeHtml(s.email)+'</small></div>'
        +'<div style="display:flex;gap:6px">'
        +'<button onclick="toggleSubAdmin('+s.id+','+!s.active+')" class="del-btn" style="font-size:11px;border-color:'+(s.active?'#25d366':'#e05')+';color:'+(s.active?'#25d366':'#e05')+'">'+(s.active?'✅':'⛔')+'</button>'
        +'<button onclick="deleteSubAdmin('+s.id+')" class="del-btn" style="font-size:11px">🗑️</button>'
        +'</div></div>';
    }).join('');
  });
}

function toggleSubAdmin(id,active){
  fetch(API+'/api/admin/sub-admins/'+id,{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify({active:active})})
  .then(function(){loadSubAdmins();toast(active?'تم التفعيل':'تم الإيقاف');});
}

function deleteSubAdmin(id){
  if(!confirm('حذف الأدمن؟'))return;
  fetch(API+'/api/admin/sub-admins/'+id,{method:'DELETE',headers:{'x-admin-token':adminToken}})
  .then(function(){loadSubAdmins();toast('تم الحذف');});
}


// ── Image Upload Handler ──
var uploadedImgs = []; // base64 strings
var editingProjectId = null;

function handleImgUpload(input){
  var files = Array.from(input.files);
  files.forEach(function(file){
    if(!file.type.startsWith('image/')){toast('الملف ده مش صورة!');return;}
    var reader = new FileReader();
    reader.onload = function(e){
      uploadedImgs.push(e.target.result);
      refreshImgPreviews();
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function refreshImgPreviews(){
  var preview = document.getElementById('imgPreviewList');
  if(!preview) return;
  preview.innerHTML = '';
  uploadedImgs.forEach(function(src, i){
    var item = document.createElement('div');
    item.className = 'img-preview-item';
    var img = document.createElement('img');
    img.src = src;
    img.onerror = function(){ this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23eee" width="80" height="80"/><text fill="%23999" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12">خطأ</text></svg>'; };
    var btn = document.createElement('button');
    btn.className = 'img-preview-del';
    btn.textContent = '✕';
    btn.title = 'حذف الصورة';
    (function(idx){ btn.onclick = function(e){ e.stopPropagation(); uploadedImgs.splice(idx,1); refreshImgPreviews(); }; })(i);
    item.appendChild(img);
    item.appendChild(btn);
    preview.appendChild(item);
  });
}

function removeUploadedImg(idx){
  uploadedImgs.splice(idx, 1);
  refreshImgPreviews();
}

function resetProjectForm(){
  ['np_name','np_desc','np_about','np_price','np_original_price','np_instagram','np_icon'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.value='';
  });
  uploadedImgs=[];
  refreshImgPreviews();
  editingProjectId=null;
  var title=document.getElementById('projFormTitle');if(title)title.textContent='➕ إضافة مشروع';
  var btn=document.getElementById('projSaveBtn');if(btn)btn.textContent='💾 حفظ المشروع';
  var cancel=document.getElementById('projCancelEdit');if(cancel)cancel.style.display='none';
  var editId=document.getElementById('np_edit_id');if(editId)editId.value='';
  highlightIconPicker('iconPicker','');
}

function cancelEditProject(){ resetProjectForm(); }

function editProject(id){
  var p = projects.find(function(x){return x.id===id;});
  if(!p)return;
  editingProjectId = id;
  var title=document.getElementById('projFormTitle');if(title)title.textContent='✏️ تعديل المشروع';
  var btn=document.getElementById('projSaveBtn');if(btn)btn.textContent='💾 حفظ التعديل';
  var cancel=document.getElementById('projCancelEdit');if(cancel)cancel.style.display='block';
  var editId=document.getElementById('np_edit_id');if(editId)editId.value=id;
  var nm=document.getElementById('np_name');if(nm)nm.value=p.ar.n||'';
  var desc=document.getElementById('np_desc');if(desc)desc.value=p.ar.d||'';
  var about=document.getElementById('np_about');if(about)about.value=p.ar.about||'';
  var price=document.getElementById('np_price');if(price)price.value=p.price||'';
  var origPrice=document.getElementById('np_original_price');if(origPrice)origPrice.value=p.originalPrice||'';
  var ig=document.getElementById('np_instagram');if(ig)ig.value=p.instagramLink||'';
  var icon=document.getElementById('np_icon');if(icon)icon.value=/^[a-zA-Z-]+$/.test(p.ic||'')?'':(p.ic||'');
  highlightIconPicker('iconPicker',icon?icon.value:'');
  // Load existing images
  uploadedImgs = (p.imgs||[]).slice();
  refreshImgPreviews();
  // Scroll to form
  var form=document.getElementById('admProjects');
  if(form)form.scrollTop=0;
  toast(lang==='ar'?'جاهز للتعديل ✏️':'Ready to edit ✏️');
}

// Compress image before saving
function compressImg(b64,maxW,quality,cb){
  var img=new Image();
  img.onload=function(){
    var w=img.width,h=img.height;
    if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}
    var cv=document.createElement('canvas');cv.width=w;cv.height=h;
    cv.getContext('2d').drawImage(img,0,0,w,h);
    cb(cv.toDataURL('image/jpeg',quality));
  };
  img.src=b64;
}


function copyPoliciesLink(){
  var url = window.location.origin + '/policies.html';
  navigator.clipboard&&navigator.clipboard.writeText(url);
  toast('✅ اتنسخ رابط السياسات: '+url);
}

function loadAdminProjects(){
  fetch(API+'/api/projects')
  .then(function(r){return r.json();})
  .then(function(data){
    projects=data;
    renderDesigns();
    renderAdminList();
  }).catch(function(){});
}

// ── Icon Picker (مشترك بين المشاريع والباقات) ──
var COMMON_ICONS=['🎁','🎂','❤️','💍','👑','💎','🌸','🎉','🎈','✨','🕯️','🌹','🍰','💐','🧸','🎊'];
function buildIconPicker(pickerId, inputId){
  var wrap=document.getElementById(pickerId); if(!wrap) return;
  wrap.innerHTML='';
  COMMON_ICONS.forEach(function(ic){
    var b=document.createElement('button');
    b.type='button'; b.textContent=ic;
    b.style.cssText='font-size:20px;padding:6px 10px;border-radius:10px;border:1.5px solid var(--line);background:var(--panel);cursor:pointer;transition:.2s';
    b.onclick=function(){
      document.getElementById(inputId).value=ic;
      highlightIconPicker(pickerId, ic);
    };
    b.setAttribute('data-icon', ic);
    wrap.appendChild(b);
  });
}
function highlightIconPicker(pickerId, selected){
  var wrap=document.getElementById(pickerId); if(!wrap) return;
  Array.from(wrap.children).forEach(function(b){
    var on=b.getAttribute('data-icon')===selected;
    b.style.borderColor = on ? 'var(--gold)' : 'var(--line)';
    b.style.background = on ? 'rgba(184,153,104,.15)' : 'var(--panel)';
  });
}
buildIconPicker('iconPicker','np_icon');
buildIconPicker('planIconPicker','pl_icon');

// ── Admin: Pricing Plans ──
var editingPlanId = null;
function loadAdminPlans(){
  if(!adminToken) adminToken=localStorage.getItem('sc_admin_token')||null;
  fetch(API+'/api/admin/pricing-plans',{headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(data){ renderAdminPlanList(data||[]); })
  .catch(function(){});
}
function renderAdminPlanList(plans){
  var l=document.getElementById('adminPlanList'); if(!l) return; l.innerHTML='';
  if(!plans.length){ l.innerHTML='<p style="color:var(--txt3);font-size:14px;text-align:center;padding:20px">لا يوجد باقات</p>'; return; }
  plans.forEach(function(p){
    var d=document.createElement('div'); d.className='admin-item'; d.style.flexWrap='wrap'; d.style.gap='8px';
    var offBadge = p.active===false ? '<span style="font-size:10px;color:#e05;border:1px solid #e05;border-radius:6px;padding:1px 6px;margin-inline-start:6px">مخفية</span>' : '';
    d.innerHTML='<span style="font-size:24px;flex-shrink:0">'+(p.icon||'💳')+'</span>'
      +'<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;color:var(--txt)">'+p.name_ar+offBadge+'</div>'
      +'<div style="font-size:12px;color:var(--gold)">'+p.price+' ج.م</div></div>';
    var actions=document.createElement('div'); actions.className='proj-actions';
    var toggleBtn=document.createElement('button'); toggleBtn.className='edit-btn';
    toggleBtn.textContent = p.active===false ? '👁️ إظهار' : '🙈 إخفاء';
    (function(id,active){ toggleBtn.onclick=function(){ togglePlan(id, !active); }; })(p.id, p.active!==false);
    var editBtn=document.createElement('button'); editBtn.className='edit-btn'; editBtn.textContent='✏️ تعديل';
    (function(pl){ editBtn.onclick=function(){ editPlan(pl); }; })(p);
    var delBtn=document.createElement('button'); delBtn.className='del-btn'; delBtn.textContent='🗑️';
    (function(id){ delBtn.onclick=function(){ if(confirm('حذف الباقة نهائياً؟')) deletePlan(id); }; })(p.id);
    actions.appendChild(toggleBtn); actions.appendChild(editBtn); actions.appendChild(delBtn);
    d.appendChild(actions);
    l.appendChild(d);
  });
}
function resetPlanForm(){
  ['pl_name_ar','pl_name_en','pl_price','pl_desc_ar','pl_desc_en','pl_features_ar','pl_features_en','pl_icon'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });
  var f=document.getElementById('pl_featured'); if(f) f.checked=false;
  editingPlanId=null;
  var title=document.getElementById('planFormTitle'); if(title) title.textContent='➕ إضافة باقة';
  var btn=document.getElementById('planSaveBtn'); if(btn) btn.textContent='💾 حفظ الباقة';
  var cancel=document.getElementById('planCancelEdit'); if(cancel) cancel.style.display='none';
  var editId=document.getElementById('pl_edit_id'); if(editId) editId.value='';
  highlightIconPicker('planIconPicker','');
}
function cancelEditPlan(){ resetPlanForm(); }
function editPlan(p){
  editingPlanId=p.id;
  document.getElementById('planFormTitle').textContent='✏️ تعديل الباقة';
  document.getElementById('planSaveBtn').textContent='💾 حفظ التعديل';
  document.getElementById('planCancelEdit').style.display='block';
  document.getElementById('pl_edit_id').value=p.id;
  document.getElementById('pl_name_ar').value=p.name_ar||'';
  document.getElementById('pl_name_en').value=p.name_en||'';
  document.getElementById('pl_price').value=p.price||'';
  document.getElementById('pl_desc_ar').value=p.desc_ar||'';
  document.getElementById('pl_desc_en').value=p.desc_en||'';
  document.getElementById('pl_features_ar').value=(p.features_ar||[]).join('\n');
  document.getElementById('pl_features_en').value=(p.features_en||[]).join('\n');
  document.getElementById('pl_icon').value=p.icon||'';
  document.getElementById('pl_featured').checked=!!p.featured;
  highlightIconPicker('planIconPicker', p.icon||'');
  toast('جاهز للتعديل ✏️');
}
function savePlan(){
  if(!adminToken) adminToken=localStorage.getItem('sc_admin_token')||null;
  if(!adminToken){toast('❌ غير مسجّل دخول');return;}
  var name_ar=document.getElementById('pl_name_ar').value.trim();
  if(!name_ar){toast('اكتب اسم الباقة');return;}
  var body={
    name_ar:name_ar,
    name_en:document.getElementById('pl_name_en').value.trim()||name_ar,
    price:parseInt(document.getElementById('pl_price').value)||0,
    desc_ar:document.getElementById('pl_desc_ar').value.trim(),
    desc_en:document.getElementById('pl_desc_en').value.trim(),
    features_ar:document.getElementById('pl_features_ar').value.split('\n').map(function(s){return s.trim();}).filter(Boolean),
    features_en:document.getElementById('pl_features_en').value.split('\n').map(function(s){return s.trim();}).filter(Boolean),
    icon:document.getElementById('pl_icon').value.trim()||'💳',
    featured:document.getElementById('pl_featured').checked
  };
  if(body.featured){ body.badge_ar='الأشهر'; body.badge_en='Popular'; }
  var url = editingPlanId ? API+'/api/admin/pricing-plans/'+editingPlanId : API+'/api/admin/pricing-plans';
  var method = editingPlanId ? 'PUT' : 'POST';
  fetch(url,{method:method,headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify(body)})
  .then(function(r){return r.json();})
  .then(function(data){
    if(data.ok){
      toast('✅ تم الحفظ');
      resetPlanForm();
      loadAdminPlans();
      loadPricing();
    } else { toast('❌ حصل خطأ'); }
  }).catch(function(){toast('❌ تأكد إن السيرفر شغّال');});
}
function togglePlan(id, active){
  fetch(API+'/api/admin/pricing-plans/'+id+'/toggle',{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify({active:active})})
  .then(function(r){return r.json();})
  .then(function(){ loadAdminPlans(); loadPricing(); toast(active?'✅ اتظهرت':'🙈 اتخفت'); });
}
function deletePlan(id){
  fetch(API+'/api/admin/pricing-plans/'+id,{method:'DELETE',headers:{'x-admin-token':adminToken}})
  .then(function(r){return r.json();})
  .then(function(data){ if(data.ok){ loadAdminPlans(); loadPricing(); toast('تم الحذف'); } });
}

function saveProject(){
  // Always get fresh token
  if(!adminToken) adminToken=localStorage.getItem('sc_admin_token')||null;
  if(!adminToken){toast('❌ غير مسجّل دخول — اعمل refresh وادخل تاني');return;}
  var n=document.getElementById('np_name')?document.getElementById('np_name').value.trim():'';
  if(!n){toast(lang==='ar'?'اكتب اسم المشروع':'Enter project name');return;}
  var desc=document.getElementById('np_desc')?document.getElementById('np_desc').value.trim():'';
  var about=document.getElementById('np_about')?document.getElementById('np_about').value.trim():'';
  var instagram=document.getElementById('np_instagram')?document.getElementById('np_instagram').value.trim():'';
  var price=document.getElementById('np_price')?document.getElementById('np_price').value:0;
  var origPrice=document.getElementById('np_original_price')?document.getElementById('np_original_price').value:'';
  var icon=document.getElementById('np_icon')?document.getElementById('np_icon').value.trim():'';
  var editId=editingProjectId;

  // Show loading state
  var btn=document.getElementById('projSaveBtn');
  if(btn){btn.textContent='⏳ جاري الحفظ...';btn.disabled=true;}

  // Compress all images first (max 800px wide, quality 0.7)
  var toCompress=uploadedImgs.slice();
  var compressed=[];
  function doCompress(i){
    if(i>=toCompress.length){
      doSave(compressed);return;
    }
    var src=toCompress[i];
    if(src&&src.startsWith('data:image')){
      compressImg(src,800,0.72,function(out){compressed.push(out);doCompress(i+1);});
    } else {
      compressed.push(src);doCompress(i+1);
    }
  }
  doCompress(0);

  function doSave(imgs){
    var body={name:n,desc:desc,about:about,price:parseInt(price)||0,originalPrice:origPrice?parseInt(origPrice):0,link:'#',instagramLink:instagram,imgs:imgs,icon:icon};
    var url=editId?API+'/api/admin/projects/'+editId:API+'/api/admin/projects';
    var method=editId?'PUT':'POST';
    console.log('saveProject → token:',adminToken?'موجود':'مفقود!','url:',url,'body keys:',Object.keys(body));
    if(!adminToken){
      toast('❌ مش مسجّل دخول! — اعمل refresh وسجّل دخول تاني');
      if(btn){btn.textContent='💾 حفظ المشروع';btn.disabled=false;}
      return;
    }
    fetch(url,{method:method,headers:{'Content-Type':'application/json','x-admin-token':adminToken},body:JSON.stringify(body)})
    .then(function(r){
      if(!r.ok)throw new Error('HTTP '+r.status);
      return r.json();
    })
    .then(function(data){
      if(btn){btn.textContent='💾 حفظ المشروع';btn.disabled=false;}
      if(data.ok){
        if(editId){
          var idx=projects.findIndex(function(p){return p.id===editId;});
          if(idx>=0)projects[idx]=data.project;
          toast('✅ تم تعديل المشروع بنجاح!');
        } else {
          projects.push(data.project);
          loadAdminStats();
          toast('✅ تم إنشاء المشروع بنجاح!');
        }
        resetProjectForm();renderDesigns();renderAdminList();
      } else {
        toast('❌ خطأ: '+(data.msg||'حاول تاني'));
      }
    })
    .catch(function(err){
      if(btn){btn.textContent='💾 حفظ المشروع';btn.disabled=false;}
      toast('❌ خطأ في الحفظ — تأكد إن السيرفر شغّال');
      console.error('saveProject error:',err);
    });
  }
}

// ── Receipt Upload ──
function handleRevImgUpload(input){
  var file=input.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    var prev=document.getElementById('revImgPreview');
    var label=document.getElementById('revImgLabel');
    if(prev){prev.src=e.target.result;prev.style.display='block';}
    if(label)label.textContent='✅ تم إرفاق الصورة';
    window._revImgData = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleReceiptUpload(input){
  var file=input.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    var prev=document.getElementById('receiptPreview');
    var label=document.getElementById('receiptLabel');
    if(prev){prev.src=e.target.result;prev.style.display='block';}
    if(label)label.textContent='✅ تم رفع الإيصال';
    buildCheckout();
  };
  reader.readAsDataURL(file);
}

// ── QR Code Generator (simple SVG-based) ──
function generateQR(text, containerId){
  // Use free QR API
  var el=document.getElementById(containerId);if(!el)return;
  var encoded=encodeURIComponent(text);
  el.innerHTML='<div class="qr-wrap">'
    +'<img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data='+encoded+'" '
    +'style="border-radius:8px;width:120px;height:120px" alt="QR Code">'
    +'<div class="qr-label">امسح الكود للمشاركة</div>'
    +'</div>';
}

// ── Init ──
load();
document.body.setAttribute('data-theme',theme);
if(theme==='dark'){
  var btn=document.getElementById('themeBtnWrap');
  if(btn)btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
}

fetch(API+'/api/projects')
  .then(function(r){return r.json();})
  .then(function(data){projects=data;loadReviews();applyLang();})
  .catch(function(){applyLang();});

// تتبع مصدر الزيارة
(function(){
  var source='direct';
  var ref=document.referrer||'';
  if(ref.includes('wa.me')||ref.includes('whatsapp'))source='whatsapp';
  else if(ref.includes('instagram'))source='instagram';
  else if(ref.includes('facebook')||ref.includes('fb.com'))source='facebook';
  else if(ref.includes('google'))source='google';
  else if(ref)source='other';
  // تحديد الدولة من اللغة (تقريبي)
  var country='unknown';
  var lang2=navigator.language||'';
  if(lang2.includes('ar-EG'))country='مصر';
  else if(lang2.includes('ar-SA'))country='السعودية';
  else if(lang2.includes('ar-AE'))country='الإمارات';
  else if(lang2.includes('ar-KW'))country='الكويت';
  else if(lang2.includes('ar-QA'))country='قطر';
  else if(lang2.includes('ar'))country='عربي';
  fetch(API+'/api/visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:source,country:country})}).catch(function(){});
})();
setTimeout(function(){document.getElementById('preloader').classList.add('hide');},2000);
