const app=document.querySelector('#app');
const titles=['ماذا أعرف قبل أن أبدأ؟','الأهداف التعليمية','كيف يتكوّن الصدأ؟','المواد المتفاعلة والناتجة','المواد في الميزان','المعادلة وموازنتها','المختبر الرقمي: الخارصين والبالون','حرارة وغاز','تغيّر اللون','تشكّل راسب','كاشف طبيعي','إنتاج وميض','خريطة الدرس: إنفوجرافيك','الاختبار البعدي','شهادة الإنجاز'];
let page=-1, observed={}, answers={}, score=null, student='';
try{student=(sessionStorage.getItem('lab-student')||'').trim().slice(0,70);}catch{}
let quizTransition=null,certificateRewarded=false;
let introTimer=null, introSeen=false, preAnswers={}, preScore=null;
let currentAudio=null;
let atomsCleanup=()=>{};
const f=s=>`<span class="formula">${s}</span>`;
const activities=[
{title:'الخارصين والبالون',num:2,p:'٨–٩',tools:'دورق مخروطي، قطعة خارصين، بالون، حمض الهيدروكلوريك المخفف، مخبار مدرّج.',intro:'لاحظ كيف يتفاعل الخارصين مع حمض الهيدروكلوريك المخفف داخل الدورق، ويُجمع الغاز في البالون. شاهد ما يحدث في المحاكاة.',question:'ما الذي جعل البالون ينتفخ؟',options:['غاز الهيدروجين الناتج','دخول قطعة الخارصين إلى البالون'],correct:0,explain:'يتآكل الخارصين تدريجيًا وينتج غاز الهيدروجين، فينتفخ البالون. تكوّنت مواد جديدة تختلف عن المواد المتفاعلة.',kind:'balloon'},
{title:'حرارة تنتج وغاز يتصاعد',num:3,p:'١١',tools:'قطعة ألمنيوم صغيرة، حمض الكبريتيك المخفف، أنبوب اختبار، ملقط خشبي.',intro:'تمثّل المحاكاة تفاعل الألمنيوم مع حمض الكبريتيك المخفف داخل الأنبوب الافتراضي. راقب الفقاعات ومؤشر الحرارة الرقمي.',question:'ما دلالتا حدوث التفاعل؟',options:['تصاعد غاز وانطلاق حرارة','تشكّل راسب فقط'],correct:0,explain:'تصاعد غاز الهيدروجين وارتفاع الحرارة دليلان على حدوث التفاعل. ينتج محلول كبريتات الألمنيوم وغاز الهيدروجين.',eq:'2Al(s) + 3H₂SO₄(aq) → Al₂(SO₄)₃(aq) + 3H₂(g)',kind:'heat'},
{title:'تغيّر في اللون',num:4,p:'١١–١٢',tools:'قطعة خبز، حليب، كأس، محلول اليود.',intro:'جرّب إضافة اليود افتراضيًا إلى الخبز ثم إلى الحليب للمقارنة. اختر العينة ولاحظ اللون قبل الإضافة وبعدها.',question:'أي العيّنتين تغيّر لونها عند إضافة اليود؟',options:['الخبز إلى بنفسجي غامق مائل إلى الأسود','الحليب إلى اللون الأخضر'],correct:0,explain:'يتغيّر لون الخبز إلى البنفسجي الغامق المائل إلى الأسود نتيجة تفاعل اليود مع النشا فيه. ولاحظ أنه لا يتغيّر لون الحليب عند إضافة اليود.',kind:'iodine'},
{title:'تشكّل راسب',num:5,p:'١٢',tools:'محلول نترات الفضة، ماء مقطر، ملح طعام، مخبار مدرّج، كأس، ملعقة.',intro:'أضف ملح الطعام والماء المقطر إلى الكأس الرقمي، ثم حرّك افتراضيًا وأضف محلول نترات الفضة. ماذا تلاحظ في المحلول وقاع الكأس؟',question:'ما الراسب المتكوّن، وما لونه؟',options:['كلوريد الفضة، أبيض','غاز الهيدروجين، عديم اللون'],correct:0,explain:'ينتج راسب أبيض من كلوريد الفضة عند تفاعل محلول نترات الفضة مع محلول ملح الطعام. الراسب مادة غير ذائبة في الماء، وتشكّله من دلالات حدوث التفاعل.',eq:'AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)',kind:'precipitate'},
{title:'تغيّر لون كاشف طبيعي',num:6,p:'١٣',tools:'ملفوف أحمر، كأس، أنابيب اختبار، حمض هيدروكلوريك مخفف، محلول بيكربونات الصوديوم، مخبار مدرّج، ماء، لهب بنسن (تمثيل رقمي فقط).',intro:'اكتشف دور ماء الملفوف الأحمر؛ الكاشف مُحضّر ومُبرّد وجاهز افتراضيًا. قارِن لونه عند إضافته إلى الحمض وإلى محلول بيكربونات الصوديوم.',question:'كيف نميّز الحمض من القاعدة بماء الملفوف؟',options:['أحمر مع الحمض وأخضر مع القاعدة','أخضر مع الحمض وأحمر مع القاعدة'],correct:0,explain:'يتغيّر لون كاشف الملفوف الأحمر إلى الأحمر مع الحمض، وإلى الأخضر مع القاعدة. صيغة بيكربونات الصوديوم NaHCO₃. ومحلول الشاي مثال آخر لكاشف طبيعي.',kind:'cabbage'},
{title:'إنتاج وميض',num:7,p:'١٤',tools:'شريط مغنيسيوم، لهب بنسن، ملقط.',intro:'اكتشف ما يحدث لشريط المغنيسيوم المُحضّر افتراضيًا عند التسخين. ستشاهد تمثيلًا رقميًا منخفض الشدة للوميض، دون لهب حقيقي.',question:'ما دلالة التفاعل، وما المادة الناتجة؟',options:['ضوء ووميض، وأكسيد المغنيسيوم الأبيض','راسب أخضر من الخارصين'],correct:0,explain:'يتفاعل المغنيسيوم مع الأكسجين منتجًا ضوءًا ووميضًا، وتتكوّن مادة بيضاء هي أكسيد المغنيسيوم. تنتج بعض التفاعلات ضوءًا كما في الألعاب النارية؛ ناقش مخاطر استخدامها في المناسبات مع معلمك.',eq:'2Mg(s) + O₂(g) → 2MgO(s)',kind:'flash'}
];
function art(kind='hero',done=false,sample='bread'){
let color='#8bd9ed',extra='',label='قبل التفاعل';
if(kind==='iodine'){color=done?(sample==='bread'?'#352044':'#fff9e5'):(sample==='bread'?'#e9c68d':'#fff9e5');label=sample==='bread'?'قطعة خبز':'حليب'}
if(kind==='cabbage'){color=done?(sample==='acid'?'#d6527e':'#4dba92'):'#9e66b1';label=done?(sample==='acid'?'وسط حمضي':'وسط قاعدي'):'ماء الملفوف الأحمر'}
if(kind==='precipitate'&&done)extra='<path d="M154 246 Q230 225 306 246 L306 264H154Z" fill="white" stroke="#c5ceda"/><text x="230" y="290" text-anchor="middle" fill="#53697f" font-size="14">راسب أبيض</text>';
if((kind==='heat'||kind==='balloon')&&done){extra=Array.from({length:9},(_,i)=>`<circle class="bubble" cx="${180+i%4*30}" cy="${220-i%3*20}" r="${4+i%3}" fill="white" style="animation-delay:${i*.22}s"/>`).join('');label=kind==='heat'?'حرارة ↑ • غاز الهيدروجين':'غاز الهيدروجين';}
if(kind==='heat')extra+=`<rect x="344" y="116" width="14" height="123" rx="7" fill="#fff" stroke="#8da7bd"/><rect x="348" y="${done?130:201}" width="6" height="${done?100:29}" rx="3" fill="#e87a8d"/><circle cx="351" cy="246" r="15" fill="#e87a8d"/>`;
if(kind==='balloon'||kind==='hero')extra+=`<ellipse class="${done?'inflating-balloon':''}" cx="230" cy="${done?61:100}" rx="${done?53:17}" ry="${done?48:20}" fill="#b294e3"/><path d="M230 ${done?109:120}V131" stroke="#7049b5" stroke-width="5"/>`;
if(kind==='balloon')extra+='<path d="M211 244L237 235L250 246L224 254Z" fill="#8996a6" stroke="#657489"/><text x="230" y="297" text-anchor="middle" fill="#53697f" font-size="12">خارصين + حمض الهيدروكلوريك المخفف</text>';
if(kind==='flash'){label=done?'أكسيد المغنيسيوم الأبيض':'شريط المغنيسيوم';color=done?'#fff':'#b9c4d5';extra=done?'<circle class="spark" cx="230" cy="155" r="65" fill="#fff5c3"/><path d="M230 107V85M230 201V221M182 155H160M278 155H300M195 120L180 105M265 190L280 205" stroke="#c3a861" stroke-width="4"/>':'';}
return `<svg viewBox="0 0 460 325" role="img" aria-label="${label}"><ellipse cx="230" cy="281" rx="161" ry="13" fill="#d5deec"/><path d="M201 113V167L145 248Q139 269 160 269H300Q321 269 315 248L259 167V113" fill="#fff" fill-opacity=".65" stroke="#7e97b6" stroke-width="4"/><path class="liquid" d="M176 207H284L307 249Q313 260 299 260H161Q148 260 154 249Z" fill="${color}"/><path d="M194 113H266" stroke="#7e97b6" stroke-width="7" stroke-linecap="round"/>${extra}<path d="M172 236L184 215" stroke="white" stroke-width="5" stroke-linecap="round"/><text x="230" y="316" text-anchor="middle" fill="#53697f" font-size="14">${label}</text></svg>`;
}
function journeyIcon(index){
 const paths=[
 '<rect x="6" y="5" width="20" height="24" rx="4"/><path d="M12 5V3H20V5M11 13L13 15L17 11M11 21H21"/>',
 '<circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="6"/><path d="M16 16L27 5M21 5H27V11"/>',
 '<path d="M10 6H22V11H18V25L16 29L14 25V11H10ZM5 19Q2 23 5 25Q8 23 5 19"/>'
 ];
 return index<3?`<svg class="journey-icon" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[index]}</svg>`:'';
}
function stopAudio(){if(currentAudio){currentAudio.pause();currentAudio=null}}
function go(n){LabAudio.stop();Bonds.close();clearTimeout(quizTransition);if(n>=0&&!student.trim())n=-1;Effects.stop(false);clearTimeout(introTimer);stopAudio();page=Math.max(-1,Math.min(titles.length-1,n));render();window.scrollTo(0,0)}
function render(){
 celebrationCleanup();
 Effects.stop(false);
 atomsCleanup();atomsCleanup=()=>{};
if(page===-1){app.innerHTML=`<main class="cover"><div><span class="badge">العلوم والحياة · الصف الثامن الفلسطيني</span><h1>مختبر <span>اكتشف</span><br>الافتراضي</h1><p class="lead">التفاعل الكيميائي ودلالاته</p><p class="cover-teacher">إعداد المعلمة: <strong>آلاء محسن كلاب</strong></p><p>رحلة من الملاحظة إلى الاكتشاف.<br>شاهد، جرّب رقميًا، ثم فسّر ما يحدث.</p><form id="entry-form" class="student-entry"><label for="cover-student">اكتب اسمك يا مبدع 🌟</label><input id="cover-student" name="student" type="text" required maxlength="70" autocomplete="given-name" placeholder="أدخل اسمك هنا"><button id="begin" type="submit">ابدأ رحلة الاكتشاف</button></form><p class="eyebrow">الفصل الثاني · الدرس الثاني · الصفحات ٨–١٤</p></div><aside class="welcome-card" aria-labelledby="welcome-title"><div class="teacher-portrait"><img src="assets/welcome-teacher.png" alt="رسم توضيحي لمعلّمة مبتسمة بحجاب بنقشة الكوفية ترحّب بالطلاب" width="800" height="1000" fetchpriority="high"><span class="portrait-note">رفيقتكم في رحلة الاكتشاف</span></div><div class="welcome-message"><span class="badge">أهلًا بأبطال الاكتشاف ✦</span><h2 id="welcome-title">أهلًا بعلماء المستقبل!</h2><p>طلابي وطالباتي الأعزاء، أهلًا بكم في «مختبر اكتشف الافتراضي»! هنا يبدأ كل اكتشاف بسؤال، وتفتح كل ملاحظة بابًا جديدًا للتعلّم. سنستكشف معًا التفاعل الكيميائي ودلالاته من خلال تجارب رقمية آمنة وممتعة.</p><p class="welcome-signoff">كل سؤال منكم بداية اكتشاف… هيا نلاحظ، ونتعلّم، ونندهش معًا!</p></div></aside></main>`;const nameInput=document.querySelector('#cover-student');nameInput.value=student;
 nameInput.oninput=()=>{nameInput.setCustomValidity('');student=nameInput.value.trim();try{sessionStorage.setItem('lab-student',student);}catch{}};
 document.querySelector('#entry-form').onsubmit=e=>{e.preventDefault();student=nameInput.value.trim();if(!student){nameInput.setCustomValidity('اكتب اسمك يا مبدع قبل بدء المختبر');nameInput.reportValidity();return;}try{sessionStorage.setItem('lab-student',student);}catch{}Lessons.choose(true);};attachAudio();return;}
app.innerHTML=`<header class="topbar"><span class="brand">◈ مختبر اكتشف الافتراضي</span><div class="entry-navigation"><button class="secondary" id="reaction-lessons">العودة إلى الدروس</button><button class="secondary" id="home">العودة إلى الصفحة الرئيسية</button></div></header><main class="shell"><nav class="steps" aria-label="محطات الدرس">${titles.map((t,i)=>`<button data-page="${i}" class="${i===page?'active':''}" ${i===page?'aria-current="step"':''}>${journeyIcon(i)}<span>${i+1}. ${t}</span></button>`).join('')}</nav><div class="meta">محطة ${page+1} من ${titles.length} · التفاعل الكيميائي ودلالاته</div><progress class="journey-progress" max="${titles.length}" value="${page+1}" aria-label="تقدم الرحلة التعليمية"></progress><h2>${titles[page]}</h2><div id="content"></div><nav class="nav"><button class="secondary" id="prev">→ السابق</button><button id="next" ${page===titles.length-1?'disabled':''}>التالي ←</button></nav><footer>المصدر العلمي: صفحات الدرس المرفقة، الترقيم المطبوع ٨–١٤ · محاكاة تعليمية</footer></main>`;
document.querySelector('#home').onclick=Lessons.home;document.querySelector('#reaction-lessons').onclick=Lessons.back;document.querySelector('#prev').onclick=()=>page===0?Lessons.back():go(page-1);document.querySelector('#next').onclick=()=>go(page+1);document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>go(+b.dataset.page));
const c=document.querySelector('#content');
if(page===2){renderMystery(c);attachAudio();return;}
if(page===0){renderPretest(c);attachAudio();return;}
if(page===1){renderGoals(c);attachAudio();return;}
if(page===3)c.innerHTML=`<article class="card"><span class="badge">من نشاط ٢ · ص ٩</span><h3>من المتفاعلات إلى النواتج</h3><p data-explain>المواد التي تبدأ التفاعل تُسمّى المتفاعلات، والمواد المتكوّنة تُسمّى النواتج. تختلف صفات المواد الجديدة عن صفات المواد المتفاعلة.</p><div class="equation">خارصين + حمض الهيدروكلوريك → كلوريد الخارصين + هيدروجين</div><p data-explain>نعبّر عن التفاعل بمعادلة كيميائية موزونة تُظهر المتفاعلات والنواتج وحالاتها الفيزيائية وظروف التفاعل.</p></article>`;else if(page===4)renderBalance(c);else if(page===5)renderEquation(c);else if(page===6)renderZincLab(c);else if(page>=7&&page<=11)renderActivity(c,activities[page-6]);else if(page===12)renderInfographic(c);else if(page===13)renderQuiz(c);else renderCertificate(c);
attachAudio();}
function renderBalance(c){c.innerHTML=`<div class="grid"><article class="card"><span class="badge">نشاط ١ · ص ٨</span><h3>هل تتساوى كفّتا الميزان؟</h3><p data-explain>تأمّل تفاعل الهيدروجين مع الأكسجين لتكوين الماء. غيّر معامل الماء، وقارن عدد ذرات الهيدروجين والأكسجين في المتفاعلات والنواتج.</p><div class="equation">2H₂ + O₂ → <select id="water" aria-label="معامل الماء"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select> H₂O</div><p id="atoms" aria-live="polite"></p></article><article class="card"><div class="scene"><svg viewBox="0 0 460 280" role="img" aria-label="ميزان الذرات"><path d="M230 60V240M165 242H295" stroke="#7049b5" stroke-width="8"/><g id="beam"><path d="M90 95H370M110 95L75 180H145ZM350 95L315 180H385Z" fill="#c5edf3" stroke="#6a90a8" stroke-width="3"/><text x="110" y="220" text-anchor="middle" font-size="18">2H₂ + O₂</text><text id="water-label" x="350" y="220" text-anchor="middle" font-size="18">H₂O</text></g></svg></div><h3>ماذا نستنتج؟</h3><p data-explain>عند تساوي عدد ذرات كل عنصر في طرفي التفاعل تتساوى كتل المواد المتفاعلة والناتجة. الذرات محفوظة ويُعاد ترتيبها.</p></article></div>`;const update=(event)=>{const n=+document.querySelector('#water').value;document.querySelector('#atoms').textContent=`المتفاعلات: H = ٤، O = ٢. النواتج: H = ${2*n}، O = ${n}. ${n===2?'أحسنت! المعادلة موزونة والكتلة محفوظة.':'الميزان غير متوازن. جرّب معاملًا آخر.'}`;document.querySelector('#beam').style.transformOrigin='230px 95px';document.querySelector('#beam').style.transform=`rotate(${(n-2)*8}deg)`;document.querySelector('#water-label').textContent=`${n}H₂O`;if(event){LabAssessment.select(document.querySelector('#water'),n,2);document.querySelector('#water').classList.remove('answer-correct','answer-wrong');document.querySelector('#water').classList.add(n===2?'answer-correct':'answer-wrong');}if(event)Effects.result(n===2,'balance',document.querySelector('#atoms'));};document.querySelector('#water').onchange=update;update();}
function renderEquation(c){c.innerHTML=`<article class="card"><span class="badge">ص ٩–١١</span><h3>من الكلمات إلى الرموز</h3><p data-explain>نكتب أسماء المتفاعلات والنواتج، ثم رموزها وصيغها. يفصل بينها سهم تُكتب عليه ظروف التفاعل. تشير الرموز s إلى الصلب، وl إلى السائل، وg إلى الغاز، وaq إلى المحلول المائي.</p><div class="equation">كالسيوم + أكسجين ⟶ أكسيد الكالسيوم <small>(بالتسخين)</small></div><p data-explain>للموازنة نغيّر المعاملات قبل الصيغ، ولا نغيّر الأرقام الصغيرة داخل الصيغة. نبدأ بالذرة الأكثر عددًا غير الهيدروجين والأكسجين، ثم بقية الذرات، ثم الهيدروجين وأخيرًا الأكسجين.</p><h3>وازن مثال الكالسيوم</h3><div class="equation"><input id="ca" aria-label="معامل الكالسيوم" type="number" min="1" max="9" value="1"> Ca(s) + O₂(g) → <input id="cao" aria-label="معامل أكسيد الكالسيوم" type="number" min="1" max="9" value="1"> CaO(s)</div><button class="action" id="balance">تحقّق من الذرات</button><div id="balance-result" role="status"></div></article><article class="card"><h3>اكتشف مثالًا آخر</h3><p data-explain>تتفاعل كربونات البوتاسيوم مع حمض النتريك لإنتاج نترات البوتاسيوم والماء وثاني أكسيد الكربون. نوازن البوتاسيوم، ثم النيتروجين، فنجد بقية الذرات متساوية.</p><div class="equation">K₂CO₃(aq) + 2HNO₃(aq) → 2KNO₃(aq) + H₂O(l) + CO₂(g)</div><p>في كل طرف: K = ٢، N = ٢، C = ١، H = ٢، O = ٩.</p></article><section id="ammonia-activity" aria-label="جرّب تكوين الأمونيا"></section>`;renderAmmonia(c.querySelector('#ammonia-activity'));document.querySelector('#balance').onclick=()=>{const a=+document.querySelector('#ca').value,b=+document.querySelector('#cao').value;document.querySelector('#balance-result').className='feedback';document.querySelector('#balance-result').textContent=`Ca: ${a} مقابل ${b}، O: 2 مقابل ${b}. `+(a===2&&b===2?'أحسنت، المعادلة موزونة.':'جرّب مجددًا حتى تتساوى ذرات كل عنصر.');const correctEquation=document.createElement('p');correctEquation.className='answer-correct';correctEquation.dir='ltr';correctEquation.textContent='✓ 2Ca + O₂ → 2CaO';document.querySelector('#balance-result').append(correctEquation);c.querySelectorAll('#ca,#cao').forEach(n=>{n.classList.remove('answer-correct','answer-wrong');n.classList.add(+n.value===2?'answer-correct':'answer-wrong');});Effects.result(a===2&&b===2,'calcium',document.querySelector('#balance-result'));};}
const questions=[['ما المواد الناتجة في نشاط الميزان؟',['الماء','الهيدروجين والأكسجين'],0],['أي معاملين يوازنان Ca + O₂ → CaO؟',['١، ١','٢، ٢'],1],['ما الغاز الناتج في نشاط الألمنيوم وحمض الكبريتيك؟',['الهيدروجين','الأكسجين'],0],['ما لون الخبز بعد إضافة اليود؟',['أخضر','بنفسجي غامق مائل إلى الأسود'],1],['ما الراسب الناتج عند مزج محلولي نترات الفضة وملح الطعام؟',['كلوريد الفضة الأبيض','أكسيد المغنيسيوم'],0],['ما لون ماء الملفوف عند إضافته إلى القاعدة؟',['أحمر','أخضر'],1],['ما ناتج تفاعل المغنيسيوم مع الأكسجين؟',['أكسيد المغنيسيوم الأبيض','كلوريد الفضة'],0]];
const retryMessage='أحسنت المحاولة يا بطل! 🌟 لديك فرصة جديدة للحصول على نتيجة أفضل. حاول مرة أخرى، فكل محاولة تقرّبك من النجاح والإبداع!';
function renderQuiz(c){
 c.innerHTML=`<article class="card"><span class="badge">أسئلة مستمدة من أنشطة الدرس</span><p>أجب عن الأسئلة السبعة. تحصل على شهادة الإنجاز عند الإجابة الصحيحة عن ٦ أسئلة على الأقل.</p><form id="quiz">${questions.map((q,i)=>`<div class="quiz-item"><h3>${i+1}. ${q[0]}</h3>${q[1].map((a,j)=>`<label><input required type="radio" name="q${i}" value="${j}" ${answers[i]===j?'checked':''}> ${a}</label>`).join('')}</div>`).join('')}<button class="action" type="submit">اعرض نتيجتي</button></form><div id="quiz-result" role="status" aria-live="polite"></div><button id="quiz-reset" class="secondary" type="button">إعادة الاختبار</button></article>`;
 const form=c.querySelector('#quiz'),result=c.querySelector('#quiz-result');c.querySelector('#quiz-reset').onclick=()=>{answers={};score=null;certificateDate=null;certificateRewarded=false;go(13);};
 const explanations=['الماء هو الناتج؛ الهيدروجين والأكسجين متفاعلان.','2Ca + O₂ → 2CaO؛ يتساوى عدد الذرات في الطرفين.','ينتج غاز الهيدروجين من تفاعل الألمنيوم مع الحمض.','يتغير النشا في الخبز مع اليود إلى بنفسجي غامق مائل إلى الأسود.','يتكون راسب كلوريد الفضة الأبيض غير الذائب.','الكاشف الطبيعي يصبح أخضر في الوسط القاعدي.','المغنيسيوم يتحد مع الأكسجين منتجًا أكسيد المغنيسيوم الأبيض.'];
 function gradeItem(i,award=false){const item=form.querySelectorAll('.quiz-item')[i];LabAssessment.paint(item,'input',answers[i],questions[i][2]);let f=item.querySelector('.graded-explanation');if(!f){f=document.createElement('p');f.className='graded-explanation';f.setAttribute('role','status');item.append(f);}f.textContent=explanations[i];if(award){const ok=answers[i]===questions[i][2];Effects.result(ok,'post-'+i,item,f);if(ok)LabAssessment.hold(form,n=>answers[+n.name.slice(1)]!==undefined);}}
 questions.forEach((q,i)=>{if(answers[i]!==undefined)gradeItem(i);});

 function showResult(){
  form.querySelectorAll('input,button[type=submit]').forEach(el=>el.disabled=true);questions.forEach((q,i)=>gradeItem(i));
  result.className='feedback quiz-summary';c.querySelector('#quiz-reset').hidden=score<6;
  result.innerHTML=`<h3>نتيجتك: ${score} / 7</h3>${score>=6?'<p>أحسنت! تنتقل الآن إلى شهادة الإنجاز.</p>':`<p>${retryMessage}</p><button type="button" class="action" id="retry-quiz">إعادة المحاولة</button>`}`;
  const retry=c.querySelector('#retry-quiz');if(retry)retry.onclick=()=>{answers={};score=null;certificateDate=null;certificateRewarded=false;go(13);};
 }
 form.onchange=e=>{if(!e.target.matches('input[type=radio]'))return;const i=+e.target.name.slice(1);if(answers[i]!==undefined)return;answers[i]=+e.target.value;gradeItem(i,true);};
 form.onsubmit=e=>{
  e.preventDefault();if(score!==null)return;
  if(!questions.every((q,i)=>answers[i]!==undefined)){form.reportValidity();return;}
  score=questions.reduce((total,q,i)=>total+(answers[i]===q[2]?1:0),0);
  showResult();
  // Finish the graded-answer rewards before certificate Bravo; navigation cancels both.
  const attemptRoot=c;
  Effects.whenIdle().then(()=>{
   if(!attemptRoot.isConnected||page!==13)return;
   if(score>=6)quizTransition=setTimeout(()=>{if(page===13)go(14);},1800);
  });
 };
 if(score!==null)showResult();
}
let certificateDate=null,celebrationCleanup=()=>{};
const certificateText='تقديرًا لاجتيازه/اجتيازها بنجاح رحلة التعلّم التفاعلي في درس التفاعل الكيميائي ودلالاته، وإظهاره/إظهارها مهارات الملاحظة والاستكشاف والتفكير العلمي';
function celebrateCertificate(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const layer=document.createElement('div');layer.className='certificate-stars';layer.setAttribute('aria-hidden','true');
 for(let i=0;i<48;i++){const star=document.createElement('span');star.textContent=i%3?'✦':'★';star.style.cssText=`--x:${Math.random()*100}vw;--drift:${(Math.random()-.5)*24}vw;--size:${12+Math.random()*25}px;--delay:${Math.random()*1.8}s;--duration:${2.8+Math.random()*1.2}s`;layer.append(star);}
 document.body.append(layer);const timer=setTimeout(()=>layer.remove(),6500);
 celebrationCleanup=()=>{clearTimeout(timer);layer.remove();};
}
function renderCertificate(c){
 if(score===null||score<6){c.innerHTML='<article class="card"><h3>شهادتك تنتظر اكتشافاتك</h3><p>أكمل الاختبار بدرجة ٦ من ٧ على الأقل لإصدار الشهادة.</p><button id="toquiz">الذهاب إلى الاختبار</button></article>';document.querySelector('#toquiz').onclick=()=>go(13);return;}
 certificateDate=certificateDate||new Date().toLocaleDateString('ar-PS');
 c.innerHTML='<div id="cert"></div>';
  c.querySelector('#cert').innerHTML=`<article class="certificate"><div class="certificate-science" aria-hidden="true">⚛ · ⚗ · ⚛</div><div class="eyebrow">مختبر اكتشف الافتراضي · جائزة الاستكشاف العلمي</div><div class="certificate-medal" aria-hidden="true">★</div><h2>شهادة إنجاز</h2><p class="certificate-intro">تُمنح هذه الشهادة للطالب/ة</p><strong id="cert-name"></strong><p class="certificate-copy">${certificateText}</p><div class="certificate-motto">ملاحظة · استكشاف · تفكير علمي</div><div class="certificate-footer"><span>إعداد المعلمة: آلاء محسن كلاب</span><span>تاريخ الإنجاز: ${certificateDate}</span></div><p class="legend">النتيجة: ${score} / ٧ · العلوم والحياة · الصف الثامن الفلسطيني</p></article><div class="certificate-actions"><button id="download-certificate">تحميل شهادة الإنجاز</button><button class="secondary" id="print">طباعة / حفظ PDF</button><p class="legend" role="status" id="certificate-status">صورة عالية الجودة · طباعة A4 أفقية</p></div>`;
  c.querySelector('#cert-name').textContent=student;
  c.querySelector('#download-certificate').onclick=downloadCertificate;
  c.querySelector('#print').onclick=()=>window.print();
 celebrateCertificate();
 if(!certificateRewarded){certificateRewarded=true;Effects.certificate();}
}
async function downloadCertificate(){
 const button=document.querySelector('#download-certificate'),status=document.querySelector('#certificate-status');button.disabled=true;
 try{
  await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=3508;canvas.height=2480;
  const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
  ctx.fillStyle='#fffcf3';ctx.fillRect(0,0,W,H);
  const gold=ctx.createLinearGradient(0,0,W,H);gold.addColorStop(0,'#8c6117');gold.addColorStop(.45,'#e4c575');gold.addColorStop(1,'#9c721e');
  ctx.strokeStyle=gold;ctx.lineWidth=18;ctx.strokeRect(65,65,W-130,H-130);ctx.lineWidth=4;ctx.strokeRect(95,95,W-190,H-190);ctx.strokeRect(128,128,W-256,H-256);
  for(const x of [165,W-165])for(const y of [165,H-165]){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillStyle=gold;ctx.fillRect(-25,-25,50,50);ctx.restore();}
  ctx.textAlign='center';ctx.direction='rtl';
  function text(value,y,size,color='#263e47',bold=false){ctx.fillStyle=color;ctx.font=`${bold?'bold ':''}${size}px Tahoma, Arial, sans-serif`;ctx.fillText(value,W/2,y);}
  text('مختبر اكتشف الافتراضي · جائزة الاستكشاف العلمي',300,52,'#80601e');
  // Fine chemistry linework is part of the award, unlike the temporary star layer.
  ctx.save();ctx.strokeStyle='#cbb371';ctx.lineWidth=5;
  for(const x of [650,W-650]){for(const angle of [0,Math.PI/3,-Math.PI/3]){ctx.beginPath();ctx.ellipse(x,560,155,58,angle,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.arc(x,560,14,0,Math.PI*2);ctx.fillStyle='#b59348';ctx.fill();}
  ctx.restore();
  const medalGold=ctx.createLinearGradient(W/2-135,375,W/2+135,645);medalGold.addColorStop(0,'#947027');medalGold.addColorStop(.5,'#f5dfa0');medalGold.addColorStop(1,'#b98d31');
  ctx.beginPath();ctx.arc(W/2,510,135,0,Math.PI*2);ctx.fillStyle=medalGold;ctx.fill();ctx.strokeStyle='#a88230';ctx.lineWidth=4;ctx.stroke();ctx.beginPath();ctx.arc(W/2,510,119,0,Math.PI*2);ctx.strokeStyle='#fff2c0';ctx.stroke();
  text('★',568,165,'#fff9df');
  text('شهادة إنجاز',875,160,'#80601e',true);
  text('تُمنح هذه الشهادة للطالب/ة',1040,60);
  let nameSize=112;ctx.font=`bold ${nameSize}px Tahoma, Arial, sans-serif`;
  while(ctx.measureText(student).width>W-650&&nameSize>42){nameSize-=2;ctx.font=`bold ${nameSize}px Tahoma, Arial, sans-serif`;}
  text(student,1230,nameSize,'#245866',true);
  ctx.strokeStyle=gold;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(950,1295);ctx.lineTo(W-950,1295);ctx.stroke();
  ctx.font='62px Tahoma, Arial, sans-serif';let line='',lines=[];
  for(const word of certificateText.split(' ')){const candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width>W-720){lines.push(line);line=word;}else line=candidate;}if(line)lines.push(line);
  lines.forEach((value,i)=>text(value,1460+i*112,62));
  text('ملاحظة · استكشاف · تفكير علمي',1950,54,'#80601e',true);
  text('إعداد المعلمة: آلاء محسن كلاب',2140,62,'#245866',true);
  text(`تاريخ الإنجاز: ${certificateDate}     ·     النتيجة: ${score} / ٧`,2260,46);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('export');
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='شهادة الإنجاز.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='تم تجهيز شهادة الإنجاز كصورة عالية الجودة.';
 }catch{status.textContent='تعذر تنزيل الصورة؛ يمكنك استخدام زر طباعة / حفظ PDF.';}finally{button.disabled=false;}
}
// Only recordings supplied by the teacher are played; there is no generated voice.
function attachWelcomeAudio(){
 const box=document.createElement('div');box.className='compact-welcome';
 box.innerHTML=`<button type="button" id="welcome-button" class="welcome-toggle" data-effect-silent aria-pressed="false"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12H11L18 6V26L11 20H5Z" fill="currentColor"/><g class="welcome-waves" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11Q27 16 22 21"/><path d="M26 7Q34 16 26 25"/></g></svg><span>المعلمة آلاء ترحب بكم</span></button><audio hidden preload="metadata" src="assets/audio/welcome-alaa.mp3" aria-label="الترحيب الجديد بصوت المعلمة آلاء"></audio>`;
 document.querySelector('#welcome-title').after(box);
 const button=box.querySelector('button'),player=box.querySelector('audio');let pending=false,revision=0;
 function update(){const playing=!player.paused&&!player.ended;button.classList.toggle('is-playing',playing);button.setAttribute('aria-pressed',String(playing));button.title=playing?'إيقاف الترحيب مؤقتًا':player.currentTime>0&&!player.ended?'استكمال الترحيب':'المعلمة آلاء ترحب بكم';}
 async function start(){const ticket=++revision;pending=true;Effects.stop();currentAudio=player;try{if(player.ended)player.currentTime=0;await player.play();if(!box.isConnected){player.pause();return;}if(ticket!==revision)return;pending=false;update();}catch{if(ticket!==revision)return;pending=false;if(currentAudio===player)currentAudio=null;update();button.title='اضغط للمحاولة مجددًا';}}
 button.onclick=()=>{if(pending||!player.paused){revision++;pending=false;player.pause();if(currentAudio===player)currentAudio=null;update();}else start();};
 player.onplay=()=>{if(!box.isConnected){player.pause();return;}if(player.paused)return;if(currentAudio&&currentAudio!==player)currentAudio.pause();currentAudio=player;update();};
 player.onpause=player.onended=()=>{if(currentAudio===player)currentAudio=null;update();};player.onerror=()=>{pending=false;if(currentAudio===player)currentAudio=null;update();button.title='تعذر تشغيل التسجيل؛ حاول مجددًا';};
 // No autoplay or document-level gesture retry: this recording starts only from its button.
}
function attachSlideAudio(file){
 const box=document.createElement('div');box.className='slide-audio';
 box.innerHTML=`<button type="button" class="welcome-toggle teacher-audio-toggle" data-effect-silent aria-pressed="false"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12H11L18 6V26L11 20H5Z" fill="currentColor"/><g class="welcome-waves" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11Q27 16 22 21"/><path d="M26 7Q34 16 26 25"/></g></svg><span>استمع إلى شرح المعلمة</span></button><audio hidden preload="metadata" aria-label="شرح المعلمة آلاء"></audio>`;
 document.querySelector('#content').prepend(box);
 const button=box.querySelector('button'),player=box.querySelector('audio');player.src=`assets/audio/${file}`;let pending=false,revision=0;
 function update(){const playing=!player.paused&&!player.ended;button.classList.toggle('is-playing',playing);button.setAttribute('aria-pressed',String(playing));button.title=playing?'إيقاف شرح المعلمة مؤقتًا':player.currentTime>0&&!player.ended?'استكمال شرح المعلمة':'استمع إلى شرح المعلمة';}
 async function start(){const ticket=++revision;pending=true;stopAudio();Effects.stop();currentAudio=player;try{if(player.ended)player.currentTime=0;await player.play();if(!box.isConnected){player.pause();return;}if(ticket!==revision)return;pending=false;update();}catch{if(ticket!==revision)return;pending=false;if(currentAudio===player)currentAudio=null;update();button.title='تعذر تشغيل التسجيل؛ اضغط للمحاولة مجددًا';}}
 button.onclick=()=>{if(pending||!player.paused){revision++;pending=false;player.pause();if(currentAudio===player)currentAudio=null;update();}else start();};
 player.onplay=()=>{if(!box.isConnected){player.pause();return;}if(player.paused)return;if(currentAudio&&currentAudio!==player)currentAudio.pause();currentAudio=player;update();};
 player.onpause=player.onended=()=>{if(currentAudio===player)currentAudio=null;update();};player.onerror=()=>{pending=false;if(currentAudio===player)currentAudio=null;update();button.title='تعذر تشغيل التسجيل؛ اضغط للمحاولة مجددًا';};
}
function attachAudio(){
 if(page===-1){attachWelcomeAudio();return;}
 if(page===12||page===14)return;
 const slideRecordings={0:'ماذا أعرف قبل أن أبدأ _.mp3',1:'goals.mp3',2:'rust-formation.mp3',3:'reactants-products.mp3',4:'materials-balance.mp3',5:'equations-balancing.mp3',6:'zinc-balloon.mp3',7:'حرارة وغاز .mp3',8:'تغير اللون .mp3',9:'precipitate.mp3',10:'natural-indicator.mp3',11:'magnesium-flash.mp3',13:'post-test.mp3',14:'certificate.mp3'};
 if(slideRecordings[page])attachSlideAudio(slideRecordings[page]);
}
const preQuestions=[
 ['أيّ مما يأتي يُعدّ تغيّرًا كيميائيًا؟',['انصهار الجليد.','صدأ الحديد.','تقطيع الورق.'],1,'صدأ الحديد تغيّر كيميائي تتكوّن فيه مادة جديدة.'],
 ['ماذا نسمّي المواد الموجودة قبل حدوث التفاعل الكيميائي؟',['المواد الناتجة.','المواد المتفاعلة.','المواد المترسبة.'],1,'المواد التي تبدأ التفاعل تُسمّى المواد المتفاعلة.'],
 ['ماذا قد يدل ظهور فقاعات غازية عند تفاعل مادتين؟',['حدوث تفاعل كيميائي.','غليان الماء دائمًا.','عدم حدوث أي تغيّر.'],0,'في سياق تفاعل المادتين قد يدل تصاعد الغاز على حدوث تفاعل كيميائي؛ الفقاعات وحدها ليست دليلًا قاطعًا في كل حالة.'],
 ['لماذا نوازن المعادلة الكيميائية؟',['لجعل أسماء المواد متشابهة.','لزيادة عدد المواد الناتجة.','لتحقيق تساوي عدد ذرات كل عنصر في طرفي المعادلة.'],2,'الموازنة تحقق تساوي عدد ذرات كل عنصر في الطرفين.']
];
function renderPretest(c){
 c.innerHTML=`<article class="card"><span class="badge">اختبار قبلي · نقطة انطلاقك</span><p>لنكتشف ما تعرفه! هذا الاختبار للتعلّم فقط، ولا تُحتسب نتيجته في شهادة الإنجاز. يمكنك متابعة الدرس مهما كانت النتيجة.</p><form id="pretest">${preQuestions.map((q,i)=>`<fieldset class="quiz-item"><legend>${i+1}. ${q[0]}</legend>${q[1].map((a,j)=>`<label><input type="radio" required name="pre${i}" value="${j}" ${preAnswers[i]===j?'checked':''}> ${a}</label>`).join('')}<div id="pre-feedback-${i}" aria-live="polite"></div></fieldset>`).join('')}<button class="action" type="submit">اكتشف نتيجتك</button></form><div id="pre-result" role="status"></div><button id="pre-continue" class="secondary action">لنبدأ التعلّم ←</button></article>`;
 const gradePre=(i,award=false)=>{const item=document.querySelectorAll('#pretest .quiz-item')[i],el=document.querySelector(`#pre-feedback-${i}`),ok=preAnswers[i]===preQuestions[i][2];LabAssessment.paint(item,'input',preAnswers[i],preQuestions[i][2]);el.className='feedback '+(ok?'':'wrong');el.textContent=(ok?'✓ ':'✗ ')+preQuestions[i][3];if(award){Effects.result(ok,'pre-'+i,item,el);if(ok)LabAssessment.hold(document.querySelector('#pretest'),n=>preAnswers[+n.name.slice(3)]!==undefined);}};
 const results=()=>{document.querySelector('#pretest').querySelectorAll('input,button[type=submit]').forEach(n=>n.disabled=true);preQuestions.forEach((q,i)=>{LabAssessment.paint(document.querySelectorAll('#pretest .quiz-item')[i],'input',preAnswers[i],q[2]);const ok=preAnswers[i]===q[2],el=document.querySelector(`#pre-feedback-${i}`);el.className=`feedback ${ok?'':'wrong'}`;el.textContent=(ok?'✓ أحسنت! ':'فرصة لنتعلّم: ')+q[3];});document.querySelector('#pre-result').className='feedback';document.querySelector('#pre-result').textContent=`نتيجتك ${preScore} من 4. ${preScore===4?'بداية رائعة!':'هذه نقطة انطلاقك، وستكتشف الإجابات خلال الرحلة.'} تابع الدرس بثقة؛ هذه النتيجة لا تؤثر في شهادتك.`;};
 if(preScore!==null)results();else preQuestions.forEach((q,i)=>{if(preAnswers[i]!==undefined)gradePre(i);});
 document.querySelector('#pretest').onchange=e=>{if(!e.target.matches('input[type=radio]'))return;const i=+e.target.name.slice(3);if(preAnswers[i]!==undefined)return;preAnswers[i]=+e.target.value;gradePre(i,true);};
 document.querySelector('#pretest').onsubmit=e=>{e.preventDefault();if(preScore!==null||!preQuestions.every((q,i)=>preAnswers[i]!==undefined))return;preScore=preQuestions.reduce((sum,q,i)=>sum+(preAnswers[i]===q[2]?1:0),0);results();};
 const retry=document.createElement('button');retry.type='button';retry.className='secondary';retry.id='pre-retry';retry.textContent='إعادة الاختبار القبلي';c.querySelector('#pre-result').after(retry);retry.onclick=()=>{preAnswers={};preScore=null;go(0);};document.querySelector('#pre-continue').onclick=()=>go(1);
}
function renderGoals(c){c.innerHTML=`<article class="card"><span class="badge">خريطة اكتشافاتنا</span><h3>في نهاية الدرس، يُتوقع من الطالب أن يكون قادرًا على أن:</h3><ol class="goals"><li>يميّز بين المواد المتفاعلة والمواد الناتجة.</li><li>يُعرّف التفاعل الكيميائي.</li><li>يوازن معادلة كيميائية بسيطة.</li><li>يُعدّد دلالات حدوث التفاعل الكيميائي.</li><li>يُحاكي تجربة كيميائية باستخدام المختبر الرقمي.</li></ol><p>سنبدأ بالشرح والأنشطة بالترتيب، ثم نراجع اكتشافاتنا في الاختبار البعدي ونصدر شهادة الإنجاز.</p></article>`;}

// This assembly is a digital puzzle: animation starts only after all three pieces.
function studentAvatar(){return `<div class="student-guide"><p id="student-hint">هيا نبدأ!</p></div>`;}

function labFlask(step,complete){
 const bubbles=complete?Array.from({length:8},(_,i)=>`<circle class="bubble" cx="${170+i%4*19}" cy="${226-i%3*11}" r="${3+i%3}" fill="white" style="animation-delay:${i*.2}s"/>`).join(''):'';
 return `<svg viewBox="0 0 400 320" role="img" aria-label="دورق التجربة: ${step} من ٣ خطوات مكتملة"><ellipse cx="200" cy="281" rx="150" ry="12" fill="#d5dfef"/><path d="M177 112V166L122 249Q117 268 136 268H264Q283 268 278 249L223 166V112" fill="#ffffffa8" stroke="#7997b5" stroke-width="4"/>${step>=2?'<path d="M148 210H252L272 250Q278 259 263 259H137Q123 259 130 250Z" fill="#a0e3f2"/>':''}${step>=1?'<path d="M181 245L202 235L219 246L193 254Z" fill="#8a99aa" stroke="#5b6d83"/>':''}${bubbles}<path d="M171 112H229" stroke="#7997b5" stroke-width="6" stroke-linecap="round"/>${step>=3?`<path d="M200 107V119" stroke="#8058bd" stroke-width="6"/><ellipse class="${complete?'inflating-balloon':''}" cx="200" cy="${complete?60:90}" rx="${complete?50:19}" ry="${complete?47:21}" fill="#ae8edc"/>`:''}<text x="200" y="310" text-anchor="middle" fill="#53697f" font-size="13">${complete?'رائع! فقاعات غاز وبالون منتفخ':step===0?'الدورق فارغ — اختر المادة الأولى':step===1?'أُضيف الخارصين افتراضيًا':step===2?'أُضيف الحمض — ثبّت البالون لإكمال التجهيز':'اكتمل تجهيز المختبر الرقمي'}</text></svg>`;
}
function renderZincLab(c){
 let step=0,finished=false;delete observed.balloon;
 const items=[['zinc','قطعة الخارصين','<path d="M12 39L39 18L61 36L32 52Z" fill="#99a8bb" stroke="#64788c" stroke-width="3"/>'],['acid','حمض الهيدروكلوريك المخفف','<path d="M25 12H47V26L57 53H15L25 26Z" fill="#a8e6f2" stroke="#6898b4" stroke-width="3"/><path d="M24 12H48" stroke="#8058bd" stroke-width="6"/>'],['balloon','البالون','<ellipse cx="36" cy="28" rx="21" ry="25" fill="#ac8bd9"/><path d="M36 52V62" stroke="#8058bd" stroke-width="4"/>']];
 c.innerHTML=`<div class="safe">مختبر رقمي فقط. ترتيب القطع هنا لغز تعليمي؛ لا يمثّل تعليمات لإجراء تجربة حقيقية. تبدأ المحاكاة بعد اكتمال التجهيز.</div><article class="card zinc-lab"><span class="badge">لاحظ · رتّب · اكتشف</span><h3>أنت تقود التجربة!</h3><p>اضغط على المادة لإضافتها، أو اسحبها إلى الدورق. ابدأ بالخارصين، ثم الحمض المخفف، ثم ثبّت البالون. لن تبدأ المحاكاة قبل اكتمال الترتيب.</p><div class="lab-workbench"><div class="lab-materials" aria-label="المواد والأدوات">${items.map(([id,label,icon])=>`<button class="lab-item" data-material="${id}" draggable="true"><svg viewBox="0 0 72 66" aria-hidden="true">${icon}</svg><span>${label}</span><span class="item-check" aria-hidden="true"></span></button>`).join('')}</div><div id="flask-drop" class="flask-drop" role="group" aria-label="منطقة الدورق: أفلت المادة هنا"><div id="lab-visual">${labFlask(0,false)}</div><span class="drop-caption">اسحب إلى هنا أو اضغط على المادة</span></div>${studentAvatar()}</div><ol class="lab-checklist"><li data-step="0">الخارصين</li><li data-step="1">الحمض المخفف</li><li data-step="2">البالون</li></ol><p id="lab-status" class="feedback" role="status">اختر قطعة الخارصين أولًا.</p><button id="reset-lab" class="secondary">إعادة التجربة</button></article><article class="card" data-learning-gated hidden><h3>ماذا تلاحظ؟</h3><p>${activities[0].question}</p><div class="choices">${activities[0].options.map((o,i)=>`<button data-choice="${i}" disabled>${o}</button>`).join('')}</div><p id="feedback" role="status"></p><section id="explain" class="explanation hidden"><h3>التفسير العلمي</h3><p>${activities[0].explain}</p></section></article>`;
 const zone=document.querySelector('#flask-drop'),status=document.querySelector('#lab-status'),hint=document.querySelector('#student-hint');
 function place(id){
  if(finished){status.textContent='أكملت التجربة! يمكنك إعادتها من الزر أدناه.';return;}
  if(!items.some(item=>item[0]===id))return;
  if(id!==items[step][0]){Effects.step(false,'step',status);status.className='feedback wrong';status.textContent=`محاولة جيدة! ${items.slice(0,step).some(item=>item[0]===id)?'أضفت هذه القطعة بالفعل. ':''}الخطوة التالية: ${items[step][1]}.`;hint.textContent=step===0?'جرّب وضع الخارصين أولًا':'تابع الترتيب بهدوء';return;}
  const button=document.querySelector(`[data-material="${id}"]`);button.disabled=true;button.draggable=false;button.querySelector('.item-check').textContent='✓';step++;Effects.step(true,'step-'+step,status,button);LabAudio.tone(['acid','water','milk','silver'].includes(id)?'pour':id==='stir'?'stir':['iodine','extract'].includes(id)?'drop':id==='burner'?'ignite':'glass');
  document.querySelectorAll('[data-step]').forEach((el,i)=>el.classList.toggle('completed',i<step));
  document.querySelector('#lab-visual').innerHTML=labFlask(step,step===3);
  status.className='feedback';
  if(step<3){status.textContent=`أحسنت! أضفت ${items[step-1][1]}. التالي: ${items[step][1]}.`;hint.textContent=step===1?'رائع، اختر الحمض الآن':'بقي تثبيت البالون!';return;}
  LabAudio.tone('bubble',{duration:2.5});finished=true;status.textContent='ترتيب ممتاز! لاحظ الفقاعات وانتفاخ البالون تدريجيًا…';hint.textContent='رائع، لاحظ الفقاعات';
  introTimer=setTimeout(()=>{if(!zone.isConnected)return;observed.balloon=true;LabAudio.tone('complete');status.textContent='أبدعت! اكتملت المحاكاة؛ الغاز الناتج ملأ البالون. اختر ملاحظتك الآن.';document.querySelector('#feedback').closest('.card').hidden=false;document.querySelector('#feedback').closest('.card').querySelectorAll('[data-choice]').forEach(b=>b.disabled=false);},2600);
 }
 document.querySelectorAll('[data-material]').forEach(b=>{b.onclick=()=>place(b.dataset.material);b.ondragstart=e=>{e.dataTransfer.setData('text/plain',b.dataset.material);e.dataTransfer.effectAllowed='copy';};});
 zone.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';zone.classList.add('drag-over');};zone.ondragleave=()=>zone.classList.remove('drag-over');zone.ondrop=e=>{e.preventDefault();zone.classList.remove('drag-over');place(e.dataTransfer.getData('text/plain'));};
 document.querySelector('#reset-lab').onclick=()=>{clearTimeout(introTimer);stopAudio();render();};
 document.querySelector('#feedback').closest('.card').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const ok=b.dataset.choice==='0';document.querySelector('#feedback').className=`feedback ${ok?'':'wrong'}`;document.querySelector('#feedback').textContent=ok?'ملاحظة دقيقة! اكتشف التفسير أدناه.':'راجع الفقاعات والبالون ثم حاول مجددًا.';document.querySelector('#explain').classList.remove('hidden');document.querySelector('#feedback').textContent+=' '+activities[0].explain;LabAssessment.paint(c.querySelector('#feedback').closest('.card').querySelector('.choices'),'[data-choice]',+b.dataset.choice,0,{retry:!ok});Effects.result(ok,'observation',document.querySelector('#feedback'));});
}

const labRecipes={
 heat:[['aluminum','قطعة ألمنيوم'],['clip','ملقط خشبي'],['acid','حمض الكبريتيك المخفف']],
 iodine:{bread:[['bread','قطعة خبز'],['iodine','محلول اليود']],milk:[['milk','حليب'],['iodine','محلول اليود']]},
 precipitate:[['salt','ملح الطعام'],['water','ماء مقطر'],['stir','ملعقة للتحريك'],['silver','محلول نترات الفضة']],
 cabbage:{acid:[['acid','حمض الهيدروكلوريك المخفف'],['extract','ماء الملفوف الأحمر المُحضّر']],base:[['base','محلول بيكربونات الصوديوم'],['extract','ماء الملفوف الأحمر المُحضّر']]},
 flash:[['magnesium','شريط مغنيسيوم'],['tongs','ملقط'],['burner','تسخين افتراضي']],
 balloon:[['zinc','قطعة الخارصين'],['acid','حمض الهيدروكلوريك المخفف'],['balloon','البالون']]
};
function materialIcon(id){
 const metal=['aluminum','magnesium','zinc'].includes(id),tool=['clip','tongs','stir'].includes(id);
 let shape=metal?'<path d="M15 40L41 17L58 34L30 52Z" fill="#9eafc3" stroke="#60758c" stroke-width="3"/>':tool?'<path d="M23 12L41 53M45 12L35 44" stroke="#9c7dbb" stroke-width="7" stroke-linecap="round"/>':id==='balloon'?'<ellipse cx="36" cy="28" rx="21" ry="25" fill="#b294e3"/><path d="M36 51V61" stroke="#8058bd" stroke-width="4"/>':id==='bread'?'<path d="M15 23Q11 6 35 8Q62 7 58 24V53H15Z" fill="#e3c28e" stroke="#b89360" stroke-width="3"/>':id==='burner'?'<path d="M22 56H50M36 56V32" stroke="#7895ad" stroke-width="7"/><path d="M36 9Q17 32 36 33Q53 31 36 9" fill="#b6b1ef"/>':'<path d="M25 12H47V25L56 54H16L25 25Z" fill="#b9eaf4" stroke="#709bb4" stroke-width="3"/><path d="M24 12H48" stroke="#9a7ac8" stroke-width="6"/>';
 return `<svg viewBox="0 0 72 66" aria-hidden="true">${shape}</svg>`;
}
function experimentScene(kind,step,done,sample,recipe){
 if(kind==='balloon')return labFlask(step,done);
 const added=recipe.slice(0,step).map(x=>x[0]);let body='',extra='',caption=step?`أضفت: ${recipe[step-1][1]}`:'منطقة التجربة جاهزة — اختر المادة الأولى';
 if(kind==='heat'){
 body='<path d="M170 70V244Q200 279 230 244V70" fill="#ffffffa8" stroke="#7d97b5" stroke-width="4"/>';
 if(added.includes('acid'))body+='<path d="M174 172H226V242Q200 270 174 242Z" fill="#a1e3f1"/>';
 if(added.includes('aluminum'))body+='<path d="M185 240L205 229L218 244L198 253Z" fill="#95a8bd"/>';
 if(added.includes('clip'))body+='<path d="M130 130H239" stroke="#bc9973" stroke-width="11" stroke-linecap="round"/>';
 if(done){extra=Array.from({length:7},(_,i)=>`<circle class="bubble" cx="${184+i%3*15}" cy="${228-i%2*15}" r="4" fill="white" style="animation-delay:${i*.24}s"/>`).join('');extra+='<rect x="270" y="111" width="12" height="125" rx="6" fill="white" stroke="#8fa6b8"/><rect x="273" y="127" width="6" height="109" rx="3" fill="#dd859c"/><circle cx="276" cy="242" r="13" fill="#dd859c"/>';caption='تصاعد غاز الهيدروجين وارتفاع الحرارة';}
 }else if(kind==='flash'){
 body='<path d="M145 265H255" stroke="#a1b6c8" stroke-width="5"/>';
 if(added.includes('tongs'))body+='<path d="M95 117L217 164L103 135" fill="none" stroke="#7992aa" stroke-width="7"/>';
 if(added.includes('magnesium'))body+=`<path d="M211 158L233 190" stroke="${done?'white':'#9aaabd'}" stroke-width="12"/>`;
 if(done){extra='<circle class="spark" cx="223" cy="170" r="49" fill="#fff1bc"/><path d="M223 103V117M223 221V237M156 170H171M275 170H290" stroke="#c8b380" stroke-width="4"/><path d="M197 250H250L241 241H209Z" fill="white" stroke="#c9d4df"/>';caption='وميض هادئ ومادة بيضاء: أكسيد المغنيسيوم';}
 }else if(kind==='iodine'&&sample==='bread'){
 body='<ellipse cx="200" cy="245" rx="99" ry="20" fill="white" stroke="#c3d6e7"/>';
 if(step)body+=`<path d="M145 155Q122 116 198 117Q278 119 255 155V232H145Z" fill="${done?'#3f2558':'#e5c78e'}" stroke="#b89a74" stroke-width="3"/>`;
 if(done)caption='الخبز بنفسجي غامق مائل إلى الأسود';
 }else{
 body='<path d="M133 99V258H267V99" fill="#ffffffa8" stroke="#7d97b5" stroke-width="4"/>';
 let color='#c5ebf3',hasLiquid=false;
 if(kind==='iodine'){hasLiquid=step>=1;color='#fffbed';if(done)caption='لا يتغيّر لون الحليب';}
 if(kind==='precipitate'){hasLiquid=added.includes('water');if(added.includes('salt'))body+='<path d="M167 251L201 240L232 251Z" fill="white" stroke="#becddd"/>';if(added.includes('stir'))body+='<path d="M243 120L182 245" stroke="#af99c9" stroke-width="5"/>';if(done)caption='تشكّل راسب أبيض من كلوريد الفضة';}
 if(kind==='cabbage'){hasLiquid=step>=1;color=done?(sample==='acid'?'#d95b82':'#5dbb91'):'#d9eef5';if(done)caption=sample==='acid'?'أصبح الكاشف أحمر في الوسط الحمضي':'أصبح الكاشف أخضر في الوسط القاعدي';}
 if(hasLiquid)body+=`<path class="liquid" d="M137 176H263V254H137Z" fill="${color}" fill-opacity=".9"/>`;
 if(kind==='precipitate'&&done)body+='<path d="M138 246Q200 225 262 246V254H138Z" fill="white" stroke="#c1d0df"/>';
 }
 return `<svg viewBox="0 0 400 320" role="img" aria-label="${caption}"><ellipse cx="200" cy="279" rx="145" ry="12" fill="#dce5f0"/>${body}${extra}<text x="200" y="310" text-anchor="middle" fill="#53697f" font-size="12">${caption}</text></svg>`;
}
function mountExperiment(host,kind,sample,onComplete,onReset=()=>{}){
 clearTimeout(introTimer);let step=0,complete=false;
 const recipe=Array.isArray(labRecipes[kind])?labRecipes[kind]:labRecipes[kind][sample];
 host.innerHTML=`<div class="lab-workbench"><div class="lab-materials" aria-label="مواد التجربة">${recipe.map(([id,label])=>`<button class="lab-item" data-material="${id}" draggable="true">${materialIcon(id)}<span>${label}</span><span class="item-check" aria-hidden="true"></span></button>`).join('')}</div><div class="flask-drop" role="group" aria-label="منطقة التجربة: أفلت المادة هنا"><div class="experiment-visual">${experimentScene(kind,0,false,sample,recipe)}</div><span class="drop-caption">اسحب المادة هنا أو اضغط عليها</span></div>${studentAvatar()}</div><ol class="lab-checklist">${recipe.map((x,i)=>`<li data-step="${i}">${x[1]}</li>`).join('')}</ol><p class="feedback experiment-status" role="status">ابدأ بإضافة ${recipe[0][1]}.</p><button class="secondary reset-experiment">إعادة التجربة</button>`;
 const zone=host.querySelector('.flask-drop'),status=host.querySelector('.experiment-status'),hint=host.querySelector('#student-hint');
 hint.textContent='هيا نبدأ!';
 function place(id){
 if(complete)return;
 if(!recipe.some(x=>x[0]===id))return;
 if(id!==recipe[step][0]){Effects.step(false,'step',status);status.className='feedback wrong experiment-status';status.textContent=`محاولة جيدة! الخطوة التالية: ${recipe[step][1]}.`;hint.textContent='تابع الترتيب بهدوء';return;}
 const button=host.querySelector(`[data-material="${id}"]`);button.disabled=true;button.draggable=false;button.querySelector('.item-check').textContent='✓';step++;Effects.step(true,'step-'+step,status,button);LabAudio.tone(['acid','water','milk','silver'].includes(id)?'pour':id==='stir'?'stir':['iodine','extract'].includes(id)?'drop':id==='burner'?'ignite':'glass');
 host.querySelectorAll('[data-step]').forEach((el,i)=>el.classList.toggle('completed',i<step));
 complete=step===recipe.length;host.querySelector('.experiment-visual').innerHTML=experimentScene(kind,step,complete,sample,recipe);status.className='feedback experiment-status';
 if(!complete){status.textContent=`أحسنت! أضفت ${recipe[step-1][1]}. التالي: ${recipe[step][1]}.`;hint.textContent='رائع! تابع الإضافة';return;}
 LabAudio.tone(kind==='heat'?'bubble':kind==='flash'?'ignite':kind==='iodine'||kind==='cabbage'?'paper':'stir',{duration:1.3});status.textContent='أبدعت في ترتيب المواد! لاحظ ما يحدث…';hint.textContent='رائع! ماذا تلاحظ؟';introTimer=setTimeout(()=>{if(!host.isConnected)return;status.textContent='اكتملت التجربة الرقمية؛ سجّل ملاحظتك الآن.';onComplete();LabAudio.tone('complete');},2600);
 }
 host.querySelectorAll('[data-material]').forEach(b=>{b.onclick=()=>place(b.dataset.material);b.ondragstart=e=>{e.dataTransfer.setData('text/plain',b.dataset.material);e.dataTransfer.effectAllowed='copy';};});
 zone.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';zone.classList.add('drag-over');};zone.ondragleave=()=>zone.classList.remove('drag-over');zone.ondrop=e=>{e.preventDefault();zone.classList.remove('drag-over');place(e.dataTransfer.getData('text/plain'));};
 host.querySelector('.reset-experiment').onclick=()=>{onReset();mountExperiment(host,kind,sample,onComplete,onReset);};
}
function renderActivity(c,a){
 const key=a.kind;delete observed[key];
 c.innerHTML=`<div class="safe">محاكاة رقمية فقط. أضف المواد داخل الواجهة بالضغط أو السحب. هذا ترتيب تعليمي رقمي وليس تعليمات لتنفيذ تجربة حقيقية.</div><article class="card"><span class="badge">نشاط ${a.num} · ص ${a.p}</span><h3>أنت تقود التجربة!</h3><div class="tools">${a.tools}</div><p>${a.intro}</p>${key==='iodine'?'<label>اختر العينة <select id="sample"><option value="bread">الخبز</option><option value="milk">الحليب</option></select></label>':key==='cabbage'?'<label>اختر الوسط <select id="sample"><option value="acid">حمض الهيدروكلوريك المخفف</option><option value="base">محلول بيكربونات الصوديوم</option></select></label><p class="legend">ماء الملفوف مُحضّر ومبرّد وجاهز افتراضيًا.</p>':''}<div id="experiment"></div></article><article class="card" data-learning-gated hidden><h3>ماذا تلاحظ؟</h3><p>${a.question}</p><div class="choices">${a.options.map((o,i)=>`<button data-choice="${i}" disabled>${o}</button>`).join('')}</div><p id="feedback" role="status"></p><section id="explain" class="explanation hidden"><h3>التفسير العلمي</h3><p>${a.explain}</p>${a.eq?`<div class="equation">${a.eq}</div>`:''}</section></article>`;
 const reset=()=>{Effects.reset(c.querySelector('#feedback'));delete observed[key];c.querySelector('#feedback').closest('.card').hidden=true;LabAssessment.clear(c.querySelector('#feedback').closest('.card'));c.querySelector('#feedback').closest('.card').querySelectorAll('[data-choice]').forEach(b=>b.disabled=true);c.querySelector('#feedback').textContent='';c.querySelector('#explain').classList.add('hidden');};
 const start=()=>{reset();mountExperiment(c.querySelector('#experiment'),key,c.querySelector('#sample')?.value,()=>{observed[key]=true;c.querySelector('#feedback').closest('.card').hidden=false;c.querySelector('#feedback').closest('.card').querySelectorAll('[data-choice]').forEach(b=>b.disabled=false);},reset);};start();
 if(c.querySelector('#sample'))c.querySelector('#sample').onchange=start;
 c.querySelector('#feedback').closest('.card').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const ok=+b.dataset.choice===a.correct;c.querySelector('#feedback').className=`feedback ${ok?'':'wrong'}`;c.querySelector('#feedback').textContent=ok?'ملاحظة دقيقة! اقرأ التفسير.':'راجع ما ظهر في التجربة ثم حاول مجددًا.';c.querySelector('#explain').classList.remove('hidden');c.querySelector('#feedback').textContent+=' '+a.explain;LabAssessment.paint(c.querySelector('#feedback').closest('.card').querySelector('.choices'),'[data-choice]',+b.dataset.choice,a.correct,{retry:!ok});Effects.result(ok,'observation',c.querySelector('#feedback'));});
}
function rustScene(water,air,level){
 const patches=[
 '<path d="M163 113L175 110L182 122L172 139L160 130Z"/>',
 '<path d="M170 147L185 141L184 166L175 176L163 164Z"/>',
 '<path d="M164 185L181 178L184 203L174 221L161 205Z"/>',
 '<path d="M146 88L170 82L191 89L188 102L161 104Z"/><path d="M168 228L180 220L174 250L164 239Z"/>'
 ];
 return `<svg viewBox="0 0 400 320" role="img" aria-label="${level?'مسمار تتكوّن عليه طبقة صدأ بنية محمرة تدريجيًا':'مسمار حديد لامع'}"><defs><linearGradient id="nail-metal"><stop stop-color="#6c7f95"/><stop offset=".45" stop-color="#f6fbff"/><stop offset=".7" stop-color="#c7d5e2"/><stop offset="1" stop-color="#8296ac"/></linearGradient></defs><ellipse cx="190" cy="274" rx="130" ry="14" fill="#dbe5f1"/>${water?'<ellipse cx="190" cy="262" rx="104" ry="13" fill="#9edfec" fill-opacity=".7"/><path d="M225 187Q201 215 225 222Q247 215 225 187" fill="#a6e5f1"/>':''}<path d="M159 102H183V230L171 256L159 230Z" fill="url(#nail-metal)" stroke="#7f92a8" stroke-width="2"/><rect x="141" y="81" width="60" height="23" rx="5" fill="url(#nail-metal)" stroke="#7f92a8" stroke-width="2"/><path d="M165 115V169" stroke="white" stroke-width="3" opacity=".8"/><g fill="#a84d2b" stroke="#be6842" stroke-width="2">${patches.slice(0,level).map(p=>`<g class="rust-patch">${p}</g>`).join('')}</g>${air?'<g class="air-stream" fill="none" stroke="#91bed4" stroke-width="3" stroke-linecap="round"><path d="M225 90H285Q302 90 297 76"/><path d="M235 110H315"/><path d="M222 130H280Q301 130 295 145"/></g><text x="278" y="173" text-anchor="middle" fill="#688da7" font-size="13">هواء يحتوي على الأكسجين</text>':''}<text x="190" y="310" text-anchor="middle" fill="#53697f" font-size="13">${level?'طبقة بنية محمرة من الصدأ':water?'مسمار مبلّل بالماء':'مسمار حديد لامع'}</text></svg>`;
}
function renderMystery(c){
 let step=0,level=0;
 c.innerHTML=`<article class="card"><span class="badge">لاحظ التحوّل · ثم فسّر</span><h3>من مسمار لامع إلى طبقة بنية محمرة</h3><p>أضف الماء إلى المسمار الافتراضي، ثم عرّضه للهواء. توقّع ما سيحدث مع مرور الوقت.</p><div class="lab-workbench rust-workbench"><div class="lab-materials"><button class="lab-item" id="rust-water">${materialIcon('water')}<span>أضف الماء</span></button><button class="lab-item" id="rust-air" disabled><svg viewBox="0 0 72 66" aria-hidden="true"><path d="M12 22H48Q65 22 57 10M18 34H62M12 46H45Q60 46 53 57" fill="none" stroke="#8abbd2" stroke-width="4" stroke-linecap="round"/></svg><span>عرّضه للهواء</span></button><button class="lab-item" id="rust-time" disabled><svg viewBox="0 0 72 66" aria-hidden="true"><circle cx="36" cy="32" r="23" fill="white" stroke="#a48acb" stroke-width="4"/><path d="M36 17V32L48 39" fill="none" stroke="#8058bd" stroke-width="4" stroke-linecap="round"/></svg><span>مرور الوقت</span></button></div><div class="flask-drop"><div id="rust-visual">${rustScene(false,false,0)}</div></div>${studentAvatar()}</div><p class="rust-time-note">المحاكاة تسرّع الزمن لتوضيح التغيّر؛ الصدأ لا يتكوّن فورًا، بل يحتاج إلى وقت بوجود الأكسجين والرطوبة.</p><p id="rust-status" class="feedback" role="status">ابدأ بإضافة الماء إلى المسمار.</p><button id="rust-reset" class="secondary">إعادة التجربة</button></article><article class="card hidden" id="rust-question"><h3>هل تغيّر شكل الحديد فقط، أم تكوّنت مادة جديدة؟</h3><div class="choices"><button data-rust-answer="shape">تغيّر شكل الحديد فقط.</button><button data-rust-answer="new">تكوّنت مادة جديدة.</button></div><p id="rust-feedback" role="status"></p><section class="explanation hidden" id="rust-definition"><h3>ماذا اكتشفنا؟</h3><p>الصدأ مادة جديدة تنتج عن تفاعل الحديد مع الأكسجين بوجود الرطوبة. لذلك لا يقتصر ما حدث على تغيّر شكل الحديد.</p><h3>تعريف التفاعل الكيميائي</h3><p>التغيّر في التركيب الكيميائي للمواد، الذي ينتج مواد جديدة بصفات جديدة، يُسمّى تفاعلًا كيميائيًا، عندما لا يمكن إعادة المواد الجديدة إلى حالتها الأصلية بطرق عادية.</p><span class="badge">تعريف الدرس · ص ٩</span><p>هيا نواصل اكتشاف المواد المتفاعلة والناتجة ودلالات التفاعل!</p><button id="discover">هيا نكتشف المزيد ←</button></section></article>`;
 const visual=c.querySelector('#rust-visual'),status=c.querySelector('#rust-status'),hint=c.querySelector('#student-hint');
 function paint(){visual.innerHTML=rustScene(step>=1,step>=2,level);}
 c.querySelector('#rust-water').onclick=()=>{if(step!==0)return;step=1;paint();c.querySelector('#rust-water').disabled=true;c.querySelector('#rust-air').disabled=false;status.textContent='أحسنت! أصبح المسمار مبلّلًا. عرّضه للهواء الآن.';hint.textContent='هل سيتغيّر المسمار؟';Effects.step(true,'water',status);LabAudio.tone('pour');};
 c.querySelector('#rust-air').onclick=()=>{if(step!==1)return;step=2;paint();c.querySelector('#rust-air').disabled=true;c.querySelector('#rust-time').disabled=false;status.textContent='الماء والهواء موجودان، والمسمار ما زال لامعًا. اضغط «مرور الوقت».';hint.textContent='لنراقب أثر الوقت';Effects.step(true,'air',status);};
 c.querySelector('#rust-time').onclick=()=>{if(step!==2)return;step=3;c.querySelector('#rust-time').disabled=true;status.textContent='نسرّع الزمن الآن… راقب ظهور اللون البني المحمر تدريجيًا.';hint.textContent='راقب لون السطح!';
  const tick=()=>{if(!visual.isConnected)return;level++;paint();if(level<4){introTimer=setTimeout(tick,800);return;}status.textContent='ظهرت طبقة صدأ بنية محمرة بعد مرور زمن مُسرّع. ماذا تستنتج؟';hint.textContent='هل تكوّنت مادة جديدة؟';c.querySelector('#rust-question').classList.remove('hidden');Effects.step(true,'time',status);};
  introTimer=setTimeout(tick,800);
 };
 const atomDiscovery=attachAtomDiscovery(c);atomsCleanup=()=>atomDiscovery.dispose();
 c.querySelectorAll('[data-rust-answer]').forEach(b=>b.onclick=()=>{const ok=b.dataset.rustAnswer==='new',feedback=c.querySelector('#rust-feedback');feedback.className=`feedback ${ok?'':'wrong'}`;feedback.textContent=ok?'أحسنت الملاحظة! تكوّنت مادة جديدة هي الصدأ.':'محاولة جيدة! الطبقة البنية المحمرة تختلف عن الحديد اللامع؛ فكّر في تكوّن مادة جديدة ثم حاول مجددًا.';atomDiscovery.reveal(ok);LabAssessment.paint(c.querySelector('#rust-question .choices'),'[data-rust-answer]',b.dataset.rustAnswer==='new'?1:0,1,{retry:!ok});Effects.result(ok,'rust-answer',feedback);});
 c.querySelector('#rust-reset').onclick=()=>{clearTimeout(introTimer);stopAudio();render();};c.querySelector('#discover').onclick=()=>go(3);
}

function renderAmmonia(host){
 const formula={N2:'N₂',H2:'H₂',NH3:'NH₃',N:'N',H:'H',NH2:'NH₂',H2O:'H₂O'};
 const targets=[['N2','غاز النيتروجين'],['H2','غاز الهيدروجين'],['NH3','غاز الأمونيا']];
 let stage=1,picked=[],selected=null,slots=[null,null,null],coefficients=[1,1,1];
 host.className='card ammonia-card';
 function draw(){
 host.innerHTML=`<h3>جرّب تكوين الأمونيا</h3><p>يتفاعل غاز النيتروجين مع غاز الهيدروجين لإنتاج غاز الأمونيا. هل تستطيع تكوين المعادلة الكيميائية الموزونة؟</p><ol class="ammonia-stages" aria-label="مراحل النشاط">${['اختر الصيغ','ركّب المعادلة','وازن المعادلة'].map((x,i)=>`<li ${stage===i+1?'aria-current="step"':''} class="${stage>i+1?'done':stage===i+1?'current':''}">${i+1}. ${x}</li>`).join('')}</ol><div id="ammonia-task"></div><p id="ammonia-feedback" role="status"></p><div id="ammonia-success" class="hidden" role="status"></div><button class="secondary" id="ammonia-reset">إعادة المحاولة</button>`;
 const task=host.querySelector('#ammonia-task');
 if(stage===1){task.innerHTML=`<p>اختر الصيغة التي تمثّل <strong>${targets[picked.length][1]}</strong>. أكمل اختيار الغازات الثلاثة أولًا.</p><div class="formula-cards">${['N','H2','NH2','N2','H2O','NH3','H'].map(id=>`<button class="formula-card" data-formula="${id}" ${picked.includes(id)?'disabled':''}><span dir="ltr">${formula[id]}</span></button>`).join('')}</div><p class="legend">${picked.length?`اختياراتك الصحيحة: ${picked.map(id=>formula[id]).join('، ')}`:'انتبه إلى نوع الذرات وعددها في كل صيغة.'}</p>`;
 task.querySelectorAll('[data-formula]').forEach(b=>b.onclick=()=>{if(b.dataset.formula!==targets[picked.length][0]){feedback('فكّر في رمز العنصر وعدد ذرات جزيء الغاز المطلوب، ثم جرّب بطاقة أخرى.',false);const nodes=[...task.querySelectorAll('[data-formula]')];LabAssessment.paint(task,'[data-formula]',nodes.indexOf(b),nodes.findIndex(n=>n.dataset.formula===targets[picked.length][0]),{lock:false});return;}const choice=b.dataset.formula;picked.push(choice);if(picked.length===3)stage=2;draw();const nodes=[...task.querySelectorAll('[data-formula]')],selected=nodes.findIndex(n=>n.dataset.formula===choice);if(selected>=0)LabAssessment.paint(task,'[data-formula]',selected,selected,{lock:false});Effects.result(true,'formula-'+choice,host,host.querySelector('#ammonia-feedback'));});
 }else if(stage===2){task.innerHTML=`<p>اسحب الصيغة إلى مكانها، أو اضغط على بطاقتها ثم على الخانة. ضع الغازين المتفاعلين قبل السهم والأمونيا بعده.</p><div class="formula-cards">${picked.map(id=>`<button class="formula-card" data-formula="${id}" draggable="true" aria-pressed="false"><span dir="ltr">${formula[id]}</span></button>`).join('')}</div><div class="ammonia-slots" dir="ltr">${[0,1,2].map((_,i)=>`${i?`<span aria-hidden="true">${i===1?'+':'→'}</span>`:''}<button class="ammonia-slot secondary" data-slot="${i}" aria-label="${['المتفاعل الأول','المتفاعل الثاني','الناتج'][i]}"><span dir="${slots[i]?'ltr':'rtl'}">${slots[i]?formula[slots[i]]:['المتفاعل الأول','المتفاعل الثاني','الناتج'][i]}</span></button>`).join('')}</div>`;
 task.querySelectorAll('[data-formula]').forEach(b=>{b.onclick=()=>{selected=b.dataset.formula;task.querySelectorAll('[data-formula]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});feedback('اختر الخانة التي تناسب الصيغة المحددة.',true);};b.ondragstart=e=>{e.dataTransfer.setData('text/plain',b.dataset.formula);e.dataTransfer.effectAllowed='copy';};});
 task.querySelectorAll('[data-slot]').forEach(b=>{const place=id=>{if(!picked.includes(id)){feedback('اختر بطاقة صيغة أولًا، ثم اضغط على خانتها.',false);return;}const index=+b.dataset.slot;if((index===2&&id!=='NH3')||(index!==2&&id==='NH3')){feedback('راجع موقع المواد قبل التفاعل وبعده، واتجاه السهم.',false);return;}if(slots.some((value,i)=>i!==index&&value===id)){feedback('استخدم كل صيغة مرة واحدة. ما الغاز الآخر الذي تحتاجه؟',false);return;}if(slots[index]===id)return;slots[index]=id;selected=null;if(slots.every(Boolean))stage=3;draw();Effects.result(true,'slot-'+index,host,host.querySelector('#ammonia-feedback'));};b.onclick=()=>place(selected);b.ondragover=e=>{e.preventDefault();b.classList.add('drag-over');};b.ondragleave=()=>b.classList.remove('drag-over');b.ondrop=e=>{e.preventDefault();b.classList.remove('drag-over');place(e.dataTransfer.getData('text/plain'));};});
 }else{
 task.innerHTML=`<p>اختر المعامل أمام كل صيغة، ثم قارن الذرات. الأرقام السفلية ثابتة ولا تتغيّر.</p><div class="ammonia-equation" dir="ltr">${slots.map((id,i)=>`${i?`<span>${i===1?'+':'→'}</span>`:''}<label><span class="sr-only">معامل ${formula[id]}</span><select data-coefficient="${i}" aria-label="معامل ${formula[id]}">${[1,2,3].map(n=>`<option value="${n}" ${coefficients[i]===n?'selected':''}>${n}</option>`).join('')}</select> <span>${formula[id]}</span></label>`).join('')}</div><div class="atom-table" aria-live="polite"></div><button id="ammonia-check">تحقق من إجابتي</button>`;
 counts();task.querySelectorAll('[data-coefficient]').forEach(select=>select.onchange=()=>{LabAssessment.clear(task);coefficients[+select.dataset.coefficient]=+select.value;counts();host.querySelector('#ammonia-success').classList.add('hidden');host.querySelector('#ammonia-success').innerHTML='';host.querySelector('#ammonia-feedback').textContent='';});
 task.querySelector('#ammonia-check').onclick=()=>{const atoms=getCounts();task.querySelectorAll('[data-coefficient]').forEach(select=>LabAssessment.select(select,+select.value,{N2:1,H2:3,NH3:2}[slots[+select.dataset.coefficient]]));if(atoms.n!==atoms.productN){feedback('راجع عدد ذرات النيتروجين في طرفي المعادلة.',false);return;}if(atoms.h!==atoms.productH){feedback('راجع عدد ذرات الهيدروجين في طرفي المعادلة.',false);return;}feedback('ذرات النيتروجين والهيدروجين متساوية في الطرفين!',true);Effects.result(true,'balanced',host,host.querySelector('#ammonia-feedback'));const success=host.querySelector('#ammonia-success');success.classList.remove('hidden');success.innerHTML=`<div class="ammonia-award"><div class="award-stars" aria-hidden="true"><span class="little-star star-one">✦</span><span class="gold-star">★</span><span class="little-star star-two">✧</span><span class="little-star star-three">✦</span></div><h4>⭐ معادلة موزونة</h4><div class="equation" dir="ltr">N₂ + 3H₂ → 2NH₃</div><p>عدد ذرات النيتروجين في المتفاعلات = 2، وفي النواتج = 2.</p><p>عدد ذرات الهيدروجين في المتفاعلات = 6، وفي النواتج = 6.</p></div>`;};
 }
 host.querySelector('#ammonia-reset').onclick=()=>{Effects.reset(host);stage=1;picked=[];selected=null;slots=[null,null,null];coefficients=[1,1,1];draw();};
 }
 function feedback(message,ok){const el=host.querySelector('#ammonia-feedback');el.className=`feedback ${ok?'':'wrong'}`;el.textContent=message;if(!ok)Effects.result(false,'ammonia-error',host,el);}
 function getCounts(){return {n:coefficients[slots.indexOf('N2')]*2,h:coefficients[slots.indexOf('H2')]*2,productN:coefficients[2],productH:coefficients[2]*3};}
 function counts(){const a=getCounts();host.querySelector('.atom-table').innerHTML=`<table><caption>قارن عدد الذرات في طرفي المعادلة</caption><thead><tr><th scope="col">العنصر</th><th scope="col">المتفاعلات</th><th scope="col">النواتج</th></tr></thead><tbody><tr><th scope="row">النيتروجين N</th><td id="ammonia-n-left">${a.n}</td><td id="ammonia-n-right">${a.productN}</td></tr><tr><th scope="row">الهيدروجين H</th><td id="ammonia-h-left">${a.h}</td><td id="ammonia-h-right">${a.productH}</td></tr></tbody></table>`;}
 draw();
}

function infographicIcon(kind){
 const shapes={
 heat:'<path d="M17 9V40Q9 52 22 56Q36 55 28 40V9Q22 1 17 9Z" fill="#fff" stroke="#7d66b6" stroke-width="3"/><path d="M22 19V44" stroke="#d77789" stroke-width="5" stroke-linecap="round"/><circle cx="22" cy="48" r="5" fill="#d77789"/><circle cx="45" cy="37" r="6" fill="#a2dfed"/><circle cx="49" cy="19" r="4" fill="#a2dfed"/><circle cx="40" cy="8" r="3" fill="#a2dfed"/>',
 iodine:'<path d="M10 27Q5 12 29 12Q53 12 49 27V53H10Z" fill="#e9c994" stroke="#b59770" stroke-width="2"/><path d="M26 27Q14 43 27 47Q40 44 26 27Z" fill="#583274"/><path d="M49 4L42 17" stroke="#9e86bd" stroke-width="6" stroke-linecap="round"/>',
 precipitate:'<path d="M12 8V53H51V8" fill="#fff" stroke="#7d9db8" stroke-width="3"/><path d="M14 28H49V51H14Z" fill="#c7eaf3"/><path d="M14 45Q31 36 49 45V51H14Z" fill="#fff" stroke="#a8bccd"/><circle cx="29" cy="34" r="2" fill="#fff"/>',
 cabbage:'<path d="M8 12V45Q18 60 28 45V12M36 12V45Q46 60 56 45V12" fill="#fff" stroke="#8f9bb4" stroke-width="3"/><path d="M11 30H25V45Q18 55 11 45Z" fill="#d66a8c"/><path d="M39 30H53V45Q46 55 39 45Z" fill="#5fb88b"/>',
 flash:'<path d="M32 6L37 23L55 29L38 35L32 55L25 36L7 29L25 23Z" fill="#f4d98a" stroke="#c7a75c" stroke-width="2"/><path d="M48 9L53 4M7 10L12 15M49 49L54 54" stroke="#a58ac6" stroke-width="3" stroke-linecap="round"/>'
 };
 return `<svg viewBox="0 0 64 64" aria-hidden="true">${shapes[kind]}</svg>`;
}
function renderInfographic(c){
 const signs=[
 ['heat','حرارة + غاز','الألمنيوم وحمض الكبريتيك المخفف','ترتفع الحرارة ويتصاعد غاز الهيدروجين.','١١'],
 ['iodine','تغيّر اللون','اليود مع الخبز','يتحوّل إلى بنفسجي غامق مائل إلى الأسود. لا يتغيّر لون الحليب في المقارنة.','١١–١٢'],
 ['precipitate','تشكّل راسب','نترات الفضة مع محلول ملح الطعام','يتكوّن كلوريد الفضة: راسب أبيض غير ذائب في الماء.','١٢'],
 ['cabbage','تغيّر لون الكاشف','ماء الملفوف الأحمر','أحمر مع الحمض، وأخضر مع القاعدة (محلول بيكربونات الصوديوم).','١٣'],
 ['flash','ضوء ووميض','المغنيسيوم مع الأكسجين','ينتج وميض وتتكوّن مادة بيضاء: أكسيد المغنيسيوم.','١٤']
 ];
 c.innerHTML=`<article class="lesson-infographic" aria-label="إنفوجرافيك التفاعل الكيميائي ودلالاته"><header class="info-heading"><span class="info-kicker">مختبر اكتشف الافتراضي · خريطة الدرس</span><h3>كيف نعرف أن تفاعلًا كيميائيًا قد حدث؟</h3><p>مواد جديدة بصفات جديدة… نلاحظ الدليل، ثم نفسّر.</p><div class="info-tags"><span>الصف الثامن الفلسطيني</span><span>العلوم والحياة · الفصل الثاني</span></div></header><section class="info-concept"><span class="info-number">١</span><div><h4>الفكرة الأساسية</h4><p>التفاعل الكيميائي تغيّر في التركيب الكيميائي للمواد ينتج مواد جديدة بصفات جديدة، لا يمكن إعادتها إلى حالتها الأصلية بطرق عادية.</p><div class="info-flow"><div><strong>المتفاعلات</strong><small>المواد قبل التفاعل</small></div><span aria-hidden="true">←</span><div><strong>النواتج</strong><small>مواد جديدة بعد التفاعل</small></div></div></div></section><section class="info-balance"><span class="info-number">٢</span><div><h4>الذرات محفوظة… نوازن المعادلة</h4><div class="info-formula" dir="ltr">2H₂ + O₂ → 2H₂O</div><div class="info-atom-count"><span>المتفاعلات<br><b dir="ltr">H = ٤ · O = ٢</b></span><span aria-hidden="true">=</span><span>النواتج<br><b dir="ltr">H = ٤ · O = ٢</b></span></div><p>نغيّر المعاملات أمام الصيغ، ونُبقي الأرقام السفلية ثابتة. تتساوى أعداد ذرات كل عنصر والكتل في طرفي التفاعل.</p></div></section><section class="info-evidence"><div class="info-section-title"><span class="info-number">٣</span><h4>دلالات نلاحظها في المختبر الرقمي</h4></div><div class="info-signs">${signs.map(([kind,title,example,observation,p],i)=>`<section class="info-sign"><div class="info-sign-icon">${infographicIcon(kind)}</div><div><span class="info-sign-index">دليل ${i+1} · ص ${p}</span><h5>${title}</h5><strong>${example}</strong><p>${observation}</p></div></section>`).join('')}</div></section><div class="info-takeaway"><strong>قبل أن تجيب: لاحظ ← حدّد الدليل ← فسّر تكوّن المادة الجديدة.</strong><p>التجارب هنا محاكاة رقمية فقط؛ لا تنفّذ تجارب الأحماض أو اللهب بمفردك.</p></div><footer class="info-signature"><div class="info-source">ملخّص تعليمي لدرس «التفاعل الكيميائي ودلالاته»<br>الدرس الثاني · الصفحات المطبوعة ٨–١٤</div><div class="info-teacher"><img src="assets/welcome-teacher.png" width="72" height="88" alt="الصورة التوضيحية للمعلمة المستخدمة على الغلاف"><div><span>إعداد وتوقيع المعلمة</span><strong>آلاء محسن كلاب</strong><svg viewBox="0 0 180 14" aria-hidden="true"><path d="M3 9Q48 1 86 8T177 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div></div></footer></article>`;
}

function attachAtomDiscovery(c){
 const definition=c.querySelector('#rust-definition');
 const section=document.createElement('article');section.className='card atom-discovery hidden';section.id='atom-discovery';section.dataset.state='idle';
 const atoms=[['h0','H',100,95],['h1','H',155,95],['h2','H',100,210],['h3','H',155,210],['o0','O',425,150],['o1','O',485,150]];
 section.innerHTML=`<h3>كيف تتحد الذرات لتكوين مادة جديدة؟</h3><p class="atom-model-note">نموذج تعليمي مبسّط لإعادة ترتيب الذرات، وليس تمثيلًا حرفيًا لآلية التفاعل.</p><div class="atom-legend"><span><i class="hydrogen-dot"></i> H · هيدروجين</span><span><i class="oxygen-dot"></i> O · أكسجين</span></div><div class="atom-scene"><svg viewBox="0 0 640 300" role="img" aria-label="جزيئان من الهيدروجين وجزيء من الأكسجين يعاد ترتيب ذراتها لتكوين جزيئين من الماء"><g class="old-bonds" stroke="#92a9bf" stroke-width="6" stroke-linecap="round"><line data-bond="h0,h1"/><line data-bond="h2,h3"/><line data-bond="o0,o1"/><line data-bond="o0,o1" transform="translate(0 8)"/></g><g class="new-bonds" stroke="#9d88bf" stroke-width="6" stroke-linecap="round" opacity="0"><line data-bond="o0,h0"/><line data-bond="o0,h1"/><line data-bond="o1,h2"/><line data-bond="o1,h3"/></g>${atoms.map(([id,element,x,y])=>`<g data-atom="${id}" data-element="${element}" transform="translate(${x} ${y})"><circle r="${element==='H'?20:26}" fill="${element==='H'?'#a4e5f0':'#a78acb'}" stroke="${element==='H'?'#518b9e':'#705196'}" stroke-width="2"/><text y="6" text-anchor="middle" font-size="18" font-weight="bold" fill="#263c55">${element}</text></g>`).join('')}<g class="reactant-labels" fill="#4f627b" font-size="16" text-anchor="middle"><text x="128" y="40">جزيئان من الهيدروجين H₂</text><text x="455" y="95">جزيء أكسجين O₂</text></g><g class="product-labels" fill="#4f627b" font-size="17" text-anchor="middle" opacity="0"><text x="180" y="225">ماء H₂O</text><text x="450" y="225">ماء H₂O</text></g></svg></div><ol class="atom-phases"><li data-phase="0">١. قبل التفاعل</li><li data-phase="1">٢. أثناء التفاعل</li><li data-phase="2">٣. بعد التفاعل</li></ol><p id="atom-stage" role="status">جزيئان من الهيدروجين وجزيء من الأكسجين: المواد المتفاعلة.</p><div class="atom-conservation">عدد الذرات محفوظ: <span dir="ltr">H = ٤ · O = ٢</span> قبل التفاعل وبعده.</div><button class="secondary" id="atoms-replay">شاهد المثال الكامل</button><button class="secondary" id="atoms-manual">نفّذ خطوة بنفسك</button><section id="atoms-question" class="explanation hidden"><h3>ماذا حدث للذرات أثناء التفاعل الكيميائي؟</h3><div class="choices"><button data-atom-answer="0">أُعيد ترتيب الذرات وتكوّنت روابط جديدة نتجت عنها مادة جديدة.</button><button data-atom-answer="1">اختفت الذرات المتفاعلة.</button><button data-atom-answer="2">تحولت ذرات الهيدروجين إلى ذرات أكسجين.</button></div><p id="atoms-feedback" role="status"></p><span class="atom-success-star hidden" aria-label="إجابة صحيحة">★</span></section>`;
 // Move the existing definition node intact; no copied or rewritten definition.
 const finalCard=document.createElement('article');finalCard.className='card hidden';finalCard.id='atom-definition-card';finalCard.append(definition);
 c.querySelector('#rust-question').after(section,finalCard);
 const positions=Object.fromEntries(atoms.map(([id,,x,y])=>[id,[x,y]]));
 const middle={h0:[95,65],h1:[230,70],h2:[410,65],h3:[550,95],o0:[245,220],o1:[405,235]};
 const end={h0:[128,117],h1:[232,117],h2:[398,117],h3:[502,117],o0:[180,160],o1:[450,160]};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let frame=null,started=false,disposed=false,observer=null;
 const question=section.querySelector('#atoms-question'),status=section.querySelector('#atom-stage');
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 function paint(t){
  const coordinates={};
  for(const [id,initial]of Object.entries(positions)){let p;if(reduced)p=t<2?initial:t<5.5?middle[id]:end[id];else if(t<4){const a=smooth((t-1.5)/2.5);p=initial.map((v,i)=>v+(middle[id][i]-v)*a);}else{const a=smooth((t-4)/3);p=middle[id].map((v,i)=>v+(end[id][i]-v)*a);}coordinates[id]=p;section.querySelector(`[data-atom="${id}"]`).setAttribute('transform',`translate(${p[0]} ${p[1]})`);}
  section.querySelectorAll('[data-bond]').forEach(line=>{const [a,b]=line.dataset.bond.split(',');['x1','y1','x2','y2'].forEach((key,i)=>line.setAttribute(key,(i<2?coordinates[a]:coordinates[b])[i%2]));});
  section.querySelector('.old-bonds').setAttribute('opacity',reduced?(t<2?1:0):1-smooth((t-1.5)/1.2));
  section.querySelector('.new-bonds').setAttribute('opacity',reduced?(t>=5.5?1:0):smooth((t-5)/2));
  section.querySelector('.reactant-labels').setAttribute('opacity',t<1.5?1:0);section.querySelector('.product-labels').setAttribute('opacity',t>=7?1:0);
  const phase=t<1.5?0:t<7?1:2;section.querySelectorAll('[data-phase]').forEach(el=>{el.classList.toggle('current',+el.dataset.phase===phase);});
  const messages=['قبل التفاعل: جزيئان من الهيدروجين وجزيء من الأكسجين.','أثناء التفاعل: تتفكك الروابط القديمة ويُعاد ترتيب الذرات نفسها لتكوين روابط جديدة.','بعد التفاعل: جزيئان من الماء، في كل منهما ذرة أكسجين وذرتا هيدروجين.'];if(status.textContent!==messages[phase])status.textContent=messages[phase];
 }
 function start(){if(disposed||section.classList.contains('hidden'))return;cancelAnimationFrame(frame);started=true;section.dataset.state='running';question.classList.add('hidden');finalCard.classList.add('hidden');definition.classList.add('hidden');section.querySelector('#atoms-feedback').textContent='';section.querySelector('.atom-success-star').classList.add('hidden');Effects.reset(section);LabAssessment.clear(question.querySelector('.choices'));question.querySelectorAll('[data-atom-answer]').forEach(b=>b.disabled=false);paint(0);const begin=performance.now();const tick=now=>{if(disposed||!section.isConnected)return;const t=Math.min(8,(now-begin)/1000);paint(t);if(t<8)frame=requestAnimationFrame(tick);else{section.dataset.state='complete';question.classList.remove('hidden');}};frame=requestAnimationFrame(tick);}

 section.querySelector('#atoms-replay').onclick=start;let manualTime=0;section.querySelector('#atoms-manual').onclick=()=>{cancelAnimationFrame(frame);manualTime=manualTime>=8?0:Math.min(8,manualTime+2);if(manualTime===0){LabAssessment.clear(question.querySelector('.choices'));question.querySelectorAll('[data-atom-answer]').forEach(b=>b.disabled=false);}paint(manualTime);LabAudio.tone(manualTime>=6?'bond':'pickup');section.dataset.state=manualTime>=8?'complete':'manual';question.classList.toggle('hidden',manualTime<8);};
 section.querySelectorAll('[data-atom-answer]').forEach(b=>b.onclick=()=>{const ok=b.dataset.atomAnswer==='0',feedback=section.querySelector('#atoms-feedback');feedback.className=`feedback ${ok?'':'wrong'}`;feedback.textContent=ok?'صحيح! الذرات محفوظة، وتكوّنت مادة جديدة.':'تتبّع كرات H وO نفسها: هل اختفت أو تغيّر نوعها، أم تغيّرت الروابط بينها؟';LabAssessment.paint(section.querySelector('.choices'),'[data-atom-answer]',+b.dataset.atomAnswer,0,{retry:!ok});Effects.result(ok,'atom-inference',section,feedback);section.querySelector('.atom-success-star').classList.toggle('hidden',!ok);finalCard.classList.toggle('hidden',!ok);definition.classList.toggle('hidden',!ok);});
 paint(0);
 return {reveal(ok){section.classList.toggle('hidden',!ok);finalCard.classList.add('hidden');definition.classList.add('hidden');if(!ok){cancelAnimationFrame(frame);started=false;question.classList.add('hidden');}else{section.dataset.state='idle';paint(0);}},dispose(){disposed=true;cancelAnimationFrame(frame);observer?.disconnect();}};
}

render();
