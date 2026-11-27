/* Durable, idempotent rewards. Scientific marks and certificate rules stay in their engines. */
const LabAchievements = (() => {
  const CONFIG = Object.freeze({task:5,answer:2,experiment:10,lesson:15,mastery:20});
  const LESSONS = {reaction:'التفاعل الكيميائي ودلالاته',bonds:'الروابط الكيميائية',compounds:'أنواع المركبات الكيميائية'};
  const LEVELS = [[0,'المستكشف المبتدئ'],[35,'المستكشف النشط'],[100,'الباحث العلمي'],[200,'عالم التجارب'],[350,'خبير المختبر'],[550,'بطل الاكتشاف']];
  const EXPERIMENTS = {reaction:['rust','balloon','heat','iodine','precipitate','cabbage','flash'],bonds:['lif','mgcl2','h2','o2','ch4'],compounds:['acid-paper','acid-current','hydrogen','base-paper','base-current','neutral','oxide']};
  const NAMES={rust:'تكوّن الصدأ',balloon:'الخارصين والبالون',heat:'حرارة وغاز',iodine:'تغيّر اللون',precipitate:'تشكّل راسب',cabbage:'الكاشف الطبيعي',flash:'إنتاج وميض',lif:'تكوين LiF',mgcl2:'تكوين MgCl₂',h2:'تكوين H₂',o2:'تكوين O₂',ch4:'تكوين CH₄',hcl:'تكوين HCl','acid-paper':'الحموض ودوار الشمس','acid-current':'توصيل الحموض',hydrogen:'الكشف الرقمي عن الهيدروجين','base-paper':'القواعد ودوار الشمس','base-current':'توصيل القواعد',neutral:'التعادل وبلورات الملح',oxide:'تكوّن الأكاسيد'};
  const BADGES=[['first','وسام أول اكتشاف','أول إنجاز تعليمي'],['experiments','وسام عالم التجارب','تنفيذ خمس تجارب'],['thinking','وسام التفكير العلمي','عشر إجابات صحيحة'],['persistence','وسام المثابرة','تصحيح خطأ أو تحسين نتيجة'],['mastery','وسام الإتقان','تحقيق معيار الإتقان الأصلي'],['hero','وسام بطل المختبر','إتمام الدروس الثلاثة']];
  let displayedTotal=0,deferHUDUntil=0;let ledger,storageKey='',studentName='',scheduled=false,lastWrong='',lastWrongTime=0,saveWarning=false;
  const empty=()=>({version:2,awards:{},tests:[],certificates:{},wrong:{},stations:{}});
  const safeName=()=>{try{return ((typeof student==='string'&&student.trim())||sessionStorage.getItem('lab-student')||document.querySelector('#cover-student')?.value||'').trim().slice(0,70);}catch{return '';}};
  function keyFor(name){let n=2166136261;for(const c of name.normalize('NFKC')){n^=c.codePointAt(0);n=Math.imul(n,16777619);}return 'lab-achievements-v2-'+(n>>>0).toString(16);}
  function read(){try{const d=JSON.parse(localStorage.getItem(storageKey));if(d?.version===2&&d.awards&&Array.isArray(d.tests)&&d.certificates&&d.wrong&&d.stations)return d;}catch{}return empty();}
  function load(){const name=safeName();if(name!==studentName||!ledger){studentName=name;storageKey=keyFor(name);ledger=read();}}
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(ledger));saveWarning=false;}catch{saveWarning=true;}document.dispatchEvent(new Event('lab-achievements-change'));}
  function entries(){return Object.values(ledger.awards).filter(a=>a&&Number.isFinite(a.value)&&a.value>=0&&a.value<=20&&LESSONS[a.lesson]);}
  function total(){return entries().reduce((n,a)=>n+a.value,0);}
  function merge(){const d=read();ledger.awards={...d.awards,...ledger.awards};ledger.certificates={...d.certificates,...ledger.certificates};ledger.wrong={...d.wrong,...ledger.wrong};ledger.stations={...d.stations,...ledger.stations};const tests=new Map([...d.tests,...ledger.tests].map(t=>[t.id,t]));ledger.tests=[...tests.values()].slice(-60);}
  function award(id,kind,lesson,label,origin){
    load();if(!studentName||!LESSONS[lesson]||!(kind in CONFIG))return false;merge();if(ledger.awards[id])return false;
    const before=total();ledger.awards[id]={kind,lesson,label:String(label||'إنجاز تعليمي').slice(0,150),value:CONFIG[kind],date:new Date().toISOString()};save();
    document.dispatchEvent(new CustomEvent('lab-reward-earned',{detail:{id,kind,lesson,label,value:CONFIG[kind],before,total:total(),origin}}));return true;
  }
  function requirements(id){
    const exp=EXPERIMENTS[id].map(k=>'experiment:'+id+':'+k);
    if(id==='reaction')return [...exp,'task:reaction:balance','task:reaction:calcium','task:reaction:balanced','task:reaction:atoms-manual','test:reaction:post'];
    if(id==='bonds')return [...exp,...['intro-check','lif-check','mgcl2-check','h2-check','o2-check','ch4-check','ionic-extra','covalent-extra',...EXPERIMENTS.bonds.map(k=>'compare-'+k)].map(k=>'answer:bonds:'+({ 'intro-check':0,'ionic-extra':2,'covalent-extra':5}[k]??(k.startsWith('compare-')?6:EXPERIMENTS.bonds.indexOf(k.replace('-check',''))+1))+':'+k),'test:bonds:post'];
    return [...exp,'task:compounds:acid-ions','task:compounds:base-ions','test:compounds:post'];
  }
  function has(id){return !!ledger.awards[id]||id.startsWith('test:')&&ledger.tests.some(t=>'test:'+t.lesson+':'+t.key===id);}
  function progress(id){const all=requirements(id);return Math.round(all.filter(has).length/all.length*100);}
  function badges(){const list=entries();return new Set([...(list.length?['first']:[]),...(list.filter(a=>a.kind==='experiment').length>=5?['experiments']:[]),...(list.filter(a=>a.kind==='answer').length>=10?['thinking']:[]),...(Object.values(ledger.wrong).some(v=>v.solved)||ledger.tests.some((t,i,a)=>a.slice(0,i).some(p=>p.lesson===t.lesson&&p.key===t.key&&p.score<t.score))?['persistence']:[]),...(list.some(a=>a.kind==='mastery')?['mastery']:[]),...(Object.keys(LESSONS).every(id=>ledger.awards['lesson:'+id])?['hero']:[])]);}
  function finish(lesson,origin){
    // Completing optional rewards never changes scientific marks or unlocks content.
    if(progress(lesson)===100)award('lesson:'+lesson,'lesson',lesson,'إكمال '+LESSONS[lesson],origin);
  }
  function answer(d){
    const id='answer:'+d.lesson+':'+d.page+':'+d.key;
    if(!d.ok){const now=performance.now();if(lastWrong===id&&now-lastWrongTime<300)return;lastWrong=id;lastWrongTime=now;ledger.wrong[id]??={solved:false};save();return;}
    if(ledger.wrong[id])ledger.wrong[id].solved=true;
    // Each correct answer has one stable reward, including predictions and post-tests.
    if(d.lesson==='bonds'&&d.key==='verified'){const key=EXPERIMENTS.bonds[d.page-1];if(key)award('experiment:bonds:'+key,'experiment','bonds',NAMES[key],d.origin);
    }else if(d.lesson==='bonds' && /^(?:methane-verified|hcl-verified|(?:lif|mgcl2|h2|o2|ch4)-verified)$/.test(d.key)){
      const key=d.key.replace('-verified','').replace('methane','ch4');award('experiment:bonds:'+key,'experiment','bonds',NAMES[key],d.origin);
    } else if(d.lesson==='bonds' && /-practice$/.test(d.key)) {
      const key=d.key.replace('-practice','');award('experiment:bonds:'+key,'experiment','bonds',NAMES[key],d.origin);
    } else if(d.lesson==='reaction' && ['balance','calcium','balanced'].includes(d.key)) {
      award('task:reaction:'+d.key,'task','reaction',d.label,d.origin);
    } else if(d.lesson==='bonds' && /pair|transfer|bond-/.test(d.key)) {
      award('task:bonds:'+d.page+':'+d.key,'task','bonds','تكوين رابطة صحيحة',d.origin);
    } else award(id,'answer',d.lesson,d.label,d.origin);
    finish(d.lesson,d.origin);updateStations(d.lesson,d.page);
  }
  function test(d){
    if(!Number.isInteger(d.score)||!Number.isInteger(d.total)||d.score<0||d.score>d.total)return;
    ledger.tests.push({id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),lesson:d.lesson,key:d.key,score:d.score,total:d.total,date:new Date().toISOString()});ledger.tests=ledger.tests.slice(-60);save();
    if(d.key==='post'&&d.score>=d.pass)award('mastery:'+d.lesson,'mastery',d.lesson,'الإتقان في '+LESSONS[d.lesson],d.origin);
    finish(d.lesson,d.origin);
  }
  function updateStations(lesson,pageIndex){
    if(!Number.isInteger(pageIndex)||pageIndex<0)return;const id=lesson+':'+pageIndex;
    const ids=Object.keys(ledger.awards);const experimentAt={reaction:{2:'rust',6:'balloon',7:'heat',8:'iodine',9:'precipitate',10:'cabbage',11:'flash'},bonds:{1:'lif',2:'mgcl2',3:'h2',4:'o2',5:'ch4'},compounds:{}};
    let done=false;
    if(lesson==='compounds'&&pageIndex>=1&&pageIndex<=4){const needed=[['acid-paper','acid-current','hydrogen'],['base-paper','base-current'],['neutral'],['oxide']][pageIndex-1];done=needed.every(k=>has('experiment:compounds:'+k));}
    else {const exp=experimentAt[lesson]?.[pageIndex];done=!!exp&&has('experiment:'+lesson+':'+exp)&&ids.some(k=>k.startsWith('answer:'+lesson+':'+pageIndex+':'));if(lesson==='reaction'&&pageIndex===2)done=done&&has('task:reaction:atoms-manual')&&has('answer:reaction:2:atom-inference');}
    if(done&&!ledger.stations[id]){ledger.stations[id]={lesson,page:pageIndex,date:new Date().toISOString()};save();document.dispatchEvent(new CustomEvent('lab-station-earned',{detail:{lesson,page:pageIndex}}));}
  }
  document.addEventListener('lab-learning-event',e=>{load();if(!studentName)return;const d=e.detail;if(!LESSONS[d.lesson])return;
    if(d.kind==='answer')answer(d);
    if(d.kind==='experiment'||d.kind==='task'){award(d.kind+':'+d.lesson+':'+d.key,d.kind,d.lesson,NAMES[d.key]||d.label||'مهمة علمية',d.origin);finish(d.lesson,d.origin);updateStations(d.lesson,d.page);}
    if(d.kind==='test')test(d);
    if(d.kind==='certificate'){if(!ledger.certificates[d.lesson]){ledger.certificates[d.lesson]={lesson:d.lesson,name:d.name,score:d.score,total:d.total,date:d.date};save();}}
    schedule();
  });
  document.addEventListener('compound-lab-step',e=>{const d=e.detail;if(d.mode!=='manual')return;const ready=['neutral','hydrogen'].includes(d.id)?d.stage>=3:d.id==='oxide'?d.stage>=3:d.stage>=2;if(ready)LabLearning.emit('experiment',{lesson:'compounds',key:d.id,origin:document.querySelector(`[data-lab="${d.id}"]`)});});
  const badgeSVG=(n=0)=>{
    const icons=[
      '<circle cx="60" cy="58" r="22" fill="none" stroke="#126b48" stroke-width="4"/><path d="m48 72 7-20 16-9-7 20Z" fill="#ce303c" stroke="#202a30" stroke-width="2"/>',
      '<g fill="none" stroke="#149bba" stroke-width="2.5"><ellipse cx="60" cy="58" rx="27" ry="10"/><ellipse cx="60" cy="58" rx="27" ry="10" transform="rotate(60 60 58)"/><ellipse cx="60" cy="58" rx="27" ry="10" transform="rotate(120 60 58)"/></g><circle cx="60" cy="58" r="7" fill="#ce303c"/>',
      '<path d="M52 34h16m-13 0v22L43 77q-3 6 4 6h26q7 0 4-6L65 56V34" fill="#b2e5e9" stroke="#126b48" stroke-width="3"/><path d="M48 68h24l4 10H44Z" fill="#149bba"/><circle cx="58" cy="62" r="3" fill="white"/>',
      '<path d="m58 34 12 8-12 24-12-8Z" fill="#149bba" stroke="#126b48" stroke-width="3"/><path d="M69 48q21 20-3 31H43m12-16v16m-15 6h40" fill="none" stroke="#202a30" stroke-width="4"/><circle cx="62" cy="53" r="5" fill="#f4c34f"/>',
      '<path d="M41 47 60 36 80 48v23L60 83 41 71Z M41 47l19 14 20-13M60 61v22" fill="none" stroke="#126b48" stroke-width="3"/><g fill="#149bba"><circle cx="41" cy="47" r="6"/><circle cx="80" cy="48" r="6"/><circle cx="60" cy="83" r="6"/></g><circle cx="60" cy="61" r="7" fill="#ce303c"/>',
      '<path d="m60 30 8 17 19 2-14 13 4 19-17-9-17 9 4-19-14-13 19-2Z" fill="#f4c34f" stroke="#b97a1b" stroke-width="2"/><path d="m36 35 2-6 3 6 5 2-5 2-3 5-2-5-5-2m52 3 2-5 2 5 5 2-5 2-2 5-2-5-5-2" fill="#ce303c"/>'
    ];
    return `<svg viewBox="0 0 120 136" aria-hidden="true"><defs><linearGradient id="badge-g${n}" x2=".8" y2="1"><stop stop-color="#fff1a6"/><stop offset=".45" stop-color="#f4c34f"/><stop offset="1" stop-color="#ad7020"/></linearGradient></defs><path d="m29 85-6 45 37-17 37 17-6-45" fill="${n%2?'#126b48':'#ce303c'}"/><path d="m60 5 46 26v54l-46 27-46-27V31Z" fill="url(#badge-g${n})" stroke="#bc892e" stroke-width="3"/><path d="m60 15 36 22v42l-36 22-36-22V37Z" fill="#fff8e9" stroke="#126b48" stroke-width="3"/>${icons[n%6]}<path d="M31 75q6 17 22 18m36-18q-6 17-22 18" fill="none" stroke="#126b48" stroke-width="4"/></svg>`;
  };
  function element(tag,cls,text){const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;n.dataset.phase2Ui='';return n;}
  function openBag(){
    load();LabAudio.stop();const dialog=element('dialog','p2-bag');dialog.setAttribute('aria-labelledby','p2-bag-title');
    const head=element('header','p2-bag-head'),title=element('h2','','رحلتي العلمية – حقيبة إنجازاتي');title.id='p2-bag-title';const close=element('button','secondary','إغلاق والعودة');close.dataset.effectSilent='';close.onclick=()=>dialog.close();head.append(title,close);dialog.append(head);
    const totalStars=total(),levelIndex=LEVELS.findLastIndex(x=>totalStars>=x[0]),level=LEVELS[levelIndex],next=LEVELS[levelIndex+1],summary=element('section','p2-level');summary.innerHTML=badgeSVG(levelIndex);const info=element('div');info.append(element('h3','',level[1]),element('strong','p2-star-value','★ '+totalStars+' نجمة'),element('p','',next?`${next[0]-totalStars} نجمة إلى ${next[1]}`:'بلغت أعلى مستوى في الرحلة'));summary.append(info);dialog.append(summary);
    dialog.append(element('p','p2-bag-student',studentName||'ابدأ رحلتك باسمك لحفظ إنجازاتك.'));
    const list=entries(),stats=element('section','p2-stats');[['المهمات المنجزة',list.filter(x=>['task','answer'].includes(x.kind)).length],['المحطات المكتملة',Object.keys(ledger.stations).length],['التجارب المنفذة',list.filter(x=>x.kind==='experiment').length],['التقدم الكلي',Math.round(Object.keys(LESSONS).reduce((n,id)=>n+progress(id),0)/3)+'%']].forEach(([label,value])=>{const card=element('div');card.append(element('strong','',value),element('span','',label));stats.append(card);});dialog.append(stats);
    const journey=element('section','p2-journey');journey.append(element('h3','','خريطة رحلتي العلمية'));Object.entries(LESSONS).forEach(([id,name])=>{const row=element('div','p2-journey-row');row.append(element('strong','',name),element('span','',progress(id)+'%'));const bar=element('progress');bar.max=100;bar.value=progress(id);bar.setAttribute('aria-label','إنجاز المهمات الأساسية في '+name);row.append(bar);journey.append(row);});journey.append(element('small','','يقيس التقدم إنجاز التجارب والمهمات الأساسية والاختبار؛ النجوم لا تغيّر العلامة ولا تفتح أو تغلق الدروس.'));dialog.append(journey);
    const badgesBox=element('section','p2-badges');badgesBox.append(element('h3','','أوسمتي العلمية'));const earned=badges();BADGES.forEach(([id,name,rule],i)=>{const b=element('article','p2-badge '+(earned.has(id)?'earned':'locked'));b.innerHTML=badgeSVG(i+10);b.append(element('strong','',name),element('span','',earned.has(id)?'مكتسب ✓':rule));badgesBox.append(b);});dialog.append(badgesBox);
    const experiments=element('details','p2-history');experiments.append(element('summary','','تجاربي ومهماتي المنجزة'));const ul=element('ul');list.filter(x=>!['mastery','lesson'].includes(x.kind)).forEach(a=>ul.append(element('li','',`${a.label} · ${a.value} نجمة`)));if(!ul.children.length)ul.append(element('li','','تنتظرك أولى اكتشافاتك.'));experiments.append(ul);dialog.append(experiments);
    const tests=element('section','p2-tests');tests.append(element('h3','','نتائج الاختبارات'));if(!ledger.tests.length)tests.append(element('p','','تظهر نتائجك هنا بعد تصحيح الاختبار.'));ledger.tests.slice(-12).reverse().forEach(t=>tests.append(element('p','',`${LESSONS[t.lesson]} · ${t.key==='post'?'بعدي':'قبلي'}: ${t.score} / ${t.total} · ${new Date(t.date).toLocaleDateString('ar-PS')}`)));dialog.append(tests);
    const certificates=element('section','p2-certificates');certificates.append(element('h3','','شهاداتي المحفوظة'));Object.values(ledger.certificates).forEach(cert=>{const b=element('button','secondary','عرض شهادة '+LESSONS[cert.lesson]);b.dataset.effectSilent='';b.onclick=()=>showCertificate(cert);certificates.append(b);});if(!Object.keys(ledger.certificates).length)certificates.append(element('p','','تُحفظ الشهادة بعد استحقاقها وظهورها وفق شروط الدرس الأصلية.'));dialog.append(certificates);
    const settings=element('details','p2-preferences');settings.append(element('summary','','تفضيلات الاستماع والحركة'));const fx=element('button','secondary',LabAudio.muted?'تشغيل الأصوات':'كتم الأصوات');fx.setAttribute('aria-pressed',String(LabAudio.muted));fx.dataset.effectSilent='';fx.onclick=()=>{LabAudio.setMuted(!LabAudio.muted);fx.textContent=LabAudio.muted?'تشغيل الأصوات':'كتم الأصوات';fx.setAttribute('aria-pressed',String(LabAudio.muted));};settings.append(fx);const sfx=element('button','secondary',LabAudio.effectsMuted?'تشغيل المؤثرات فقط':'إيقاف المؤثرات فقط');sfx.dataset.effectSilent='';sfx.setAttribute('aria-pressed',String(LabAudio.effectsMuted));sfx.onclick=()=>{LabAudio.setEffectsMuted(!LabAudio.effectsMuted);sfx.textContent=LabAudio.effectsMuted?'تشغيل المؤثرات فقط':'إيقاف المؤثرات فقط';sfx.setAttribute('aria-pressed',String(LabAudio.effectsMuted));};settings.append(sfx);if(typeof LabNarration!=='undefined')settings.append(LabNarration.preferences());settings.append(element('small','','تبقى جميع المهمات والدرجات متاحة عند كتم الصوت.'));dialog.append(settings);
    if(saveWarning)dialog.append(element('p','p2-storage-warning','المتصفح منع التخزين؛ تبقى الإنجازات في هذه الجلسة فقط. اسمح بتخزين بيانات الموقع للاحتفاظ بها.'));
    dialog.append(element('p','p2-save-note','تُحفظ الرحلة تلقائيًا لهذا الاسم على هذا المتصفح، ما دامت بيانات الموقع محفوظة.'));
    document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.onclick=e=>{if(e.target===dialog)dialog.close();};dialog.showModal();close.focus();
  }
  function showCertificate(cert){const d=element('dialog','p2-saved-certificate');const art=element('article','certificate');art.append(element('div','eyebrow','مختبر اكتشف الافتراضي'),element('h2','','شهادة إنجاز'),element('p','','تُمنح هذه الشهادة للطالب/ة'),element('strong','',cert.name),element('p','','عن إنجاز درس '+LESSONS[cert.lesson]),element('p','',`النتيجة: ${cert.score} / ${cert.total}`),element('p','','تاريخ الإنجاز: '+cert.date),element('p','','إعداد المعلمة: آلاء محسن كلاب'));const close=element('button','secondary','إغلاق');close.onclick=()=>d.close();const print=element('button','','طباعة / حفظ PDF');print.onclick=()=>{document.body.classList.add('p2-print-saved');window.print();document.body.classList.remove('p2-print-saved');};d.append(art,print,close);document.body.append(d);d.addEventListener('close',()=>d.remove(),{once:true});d.showModal();}
  function refresh(){
    load();const cover=document.querySelector('.cover');
    if(cover&&!cover.hasAttribute('data-p2-ordered')){cover.dataset.p2Ordered='';const intro=cover.firstElementChild,welcome=cover.querySelector('.welcome-card'),form=cover.querySelector('#entry-form');const message=cover.querySelector('.welcome-message');if(intro&&welcome&&form){const header=element('header','p2-cover-heading');header.removeAttribute('data-phase2-ui');const h1=intro.querySelector('h1');const teacher=intro.querySelector('.cover-teacher');const lead=intro.querySelector('.lead');const badge=intro.querySelector('.badge');header.append(badge,h1,lead,teacher);cover.prepend(header);const lower=document.createElement('div');lower.className='p2-cover-bottom';while(intro.firstChild)lower.append(intro.firstChild);intro.remove();cover.append(welcome,lower);lower.append(form);if(message)message.append(...[]);try{const input=form.querySelector('input');if(!input.value){input.value=localStorage.getItem('lab-last-student')||'';}}catch{}}}
    const target=document.querySelector('.topbar')||cover;if(!target)return;let bar=target.querySelector(':scope>.p2-hud');if(!bar){bar=element('nav','p2-hud');bar.setAttribute('aria-label','النجوم والإنجازات');const counter=element('strong','p2-count');counter.setAttribute('aria-label','رصيد النجوم');const progressBox=element('span','p2-hud-progress');const progressBar=element('span','p2-hud-meter');progressBar.setAttribute('role','progressbar');progressBar.setAttribute('aria-valuemin','0');progressBar.setAttribute('aria-valuemax','100');progressBar.setAttribute('aria-label','الإنجاز الكلي');progressBar.append(element('i'));progressBox.append(progressBar);const bag=element('button','p2-bag-button','حقيبة إنجازاتي');bag.dataset.effectSilent='';bag.setAttribute('aria-haspopup','dialog');bag.onclick=openBag;const back=element('button','secondary p2-lab-back','خريطة المختبر');back.dataset.effectSilent='';back.onclick=()=>{if(safeName())Lessons.back();else document.querySelector('#cover-student')?.focus();};bar.append(counter,progressBox,bag,back);target.append(bar);}
    const shown=performance.now()<deferHUDUntil?displayedTotal:total();if(bar.querySelector('.p2-count').textContent!=='★ '+shown)bar.querySelector('.p2-count').textContent='★ '+shown;const percentage=Math.round(Object.keys(LESSONS).reduce((n,id)=>n+progress(id),0)/3);bar.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(percentage));bar.querySelector('.p2-hud-meter i').style.width=percentage+'%';bar.querySelector('.p2-lab-back').hidden=!!cover||!!document.querySelector('#lesson-catalog');
    document.querySelectorAll('[data-reward-slot]').forEach(slot=>{const id=slot.dataset.rewardSlot;const stars=entries().filter(a=>a.lesson===id).reduce((n,a)=>n+a.value,0);slot.removeAttribute('aria-hidden');const value='★ '+stars+(ledger.awards['lesson:'+id]?' · مكتملة ✓':'');if(slot.textContent!==value)slot.textContent=value;slot.closest('.p1-station')?.classList.toggle('p2-completed',!!ledger.awards['lesson:'+id]);});
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh();});}
  document.addEventListener('submit',e=>{if(e.target.id==='entry-form'){try{localStorage.setItem('lab-last-student',e.target.querySelector('input').value.trim().slice(0,70));}catch{}schedule();}},{capture:true});
  window.addEventListener('storage',e=>{if(e.key===storageKey){ledger=read();schedule();}});
  new MutationObserver(schedule).observe(document.querySelector('#app'),{childList:true,subtree:true});
  document.addEventListener('lab-reward-earned',e=>{const quiet=document.body.classList.contains('phase1-reduced')||matchMedia('(prefers-reduced-motion:reduce)').matches;if(!quiet){displayedTotal=e.detail.before;deferHUDUntil=performance.now()+1600;setTimeout(schedule,1620);}});document.addEventListener('lab-star-arrived',()=>{deferHUDUntil=0;schedule();});document.addEventListener('lab-achievements-change',schedule);refresh();
  return {CONFIG,LEVELS,badgeArt:badgeSVG,openBag,refresh:schedule,snapshot(){load();return JSON.parse(JSON.stringify({...ledger,total:total(),progress:Object.fromEntries(Object.keys(LESSONS).map(id=>[id,progress(id)])),badges:[...badges()]}));}};
})();
