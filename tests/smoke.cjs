const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
// A silent audio fixture verifies media transport and playback, not a bundled sound.
const buf=Buffer.alloc(64044);buf.write('RIFF');buf.writeUInt32LE(64036,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(8000,24);buf.writeUInt32LE(16000,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(64000,40);
const encoded=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-i','pipe:0','-f','mp3','pipe:1'],{input:buf});assert.equal(encoded.status,0,'Encode MP3 test fixture');
(async()=>{
assert(!/speechSynthesis|SpeechSynthesisUtterance/.test(fs.readFileSync('app.js','utf8')),'No generated voice API');
const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const p=await b.newPage();async function finishAtoms(page){await page.locator('#atom-discovery').scrollIntoViewIfNeeded();await page.locator('#atoms-question').waitFor({state:'visible'});await page.locator('[data-atom-answer="0"]').click();}const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(process.env.TEST_URL||'http://127.0.0.1:8000');
await p.locator('.teacher-portrait img').evaluate(i=>i.decode());
await p.evaluate(()=>go(0));await p.locator('.listen').click();await p.waitForFunction(()=>document.querySelector('.audio-status').textContent.includes('لم يُضف'));
assert(await p.locator('audio').evaluate(a=>a.paused&&!a.getAttribute('src')),'Missing recording stays silent');await p.evaluate(()=>go(-1));
await p.getByRole('button',{name:'ابدأ الاستكشاف'}).click();
assert(await p.locator('h2').textContent()==='ماذا أعرف قبل أن أبدأ؟');
// Low score does not prevent progress or change the post-test score.
for(let i=0;i<4;i++)await p.locator(`input[name=pre${i}][value="${[0,0,1,0][i]}"]`).check();
await p.getByRole('button',{name:'اكتشف نتيجتك'}).click();assert((await p.locator('#pre-result').textContent()).includes('0 من 4'));assert(await p.evaluate(()=>score===null));
await p.locator('#pre-continue').click();assert((await p.locator('h2').textContent()).includes('الأهداف'));
await p.locator('#prev').click();assert((await p.locator('#pre-result').textContent()).includes('0 من 4'));
for(let i=0;i<4;i++)await p.locator(`input[name=pre${i}][value="${[1,1,0,2][i]}"]`).check();
await p.getByRole('button',{name:'اكتشف نتيجتك'}).click();assert((await p.locator('#pre-result').textContent()).includes('4 من 4'));assert(await p.evaluate(()=>score===null));
await p.locator('#next').click();await p.locator('#next').click();
assert(await p.locator('h2').textContent()==='كيف يتكوّن الصدأ؟');
assert(await p.locator('#rust-air').isDisabled());assert(await p.locator('#rust-time').isDisabled());assert(await p.locator('#rust-question').isHidden());assert(await p.locator('#rust-definition').isHidden());
assert(await p.locator('.student-guide').isVisible());assert((await p.locator('.rust-time-note').textContent()).includes('لا يتكوّن فورًا'));
await p.locator('#rust-water').click();assert(await p.locator('#rust-time').isDisabled());await p.locator('#rust-air').click();assert(await p.locator('.rust-patch').count()===0);
await p.locator('#rust-time').click();assert(await p.locator('.rust-patch').count()===0);await p.waitForTimeout(1000);assert(await p.locator('.rust-patch').count()>=1);assert(await p.locator('#rust-question').isHidden());await p.locator('#rust-question').waitFor({state:'visible'});assert(await p.locator('.rust-patch').count()===4);
await p.locator('[data-rust-answer="shape"]').click();assert(await p.locator('#rust-definition').isHidden());await p.locator('[data-rust-answer="new"]').click();await finishAtoms(p);assert(await p.locator('#rust-definition').isVisible());assert((await p.locator('#rust-definition').textContent()).includes('الأكسجين بوجود الرطوبة'));
await p.locator('#rust-reset').click();assert(await p.locator('.rust-patch').count()===0);assert(await p.locator('#rust-definition').isHidden());assert(await p.locator('#rust-air').isDisabled());
await p.locator('#rust-water').click();await p.locator('#rust-air').click();await p.locator('#rust-time').click();await p.locator('#rust-reset').click();await p.waitForTimeout(1000);assert(await p.locator('.rust-patch').count()===0);
await p.locator('#rust-water').click();await p.locator('#rust-air').click();await p.locator('#rust-time').click();await p.locator('#rust-question').waitFor({state:'visible'});await p.locator('[data-rust-answer="new"]').click();await finishAtoms(p);await p.locator('#discover').click();
assert((await p.locator('#content').textContent()).includes('المتفاعلات'));
await p.locator('#next').click();await p.selectOption('#water','2');assert((await p.locator('#atoms').textContent()).includes('أحسنت'));
await p.locator('#next').click();await p.locator('#ca').fill('2');await p.locator('#cao').fill('2');await p.locator('#balance').click();assert((await p.locator('#balance-result').textContent()).includes('أحسنت'));
await p.locator('#next').click();
// Wrong order never changes the flask or starts a reaction.
await p.locator('[data-material="acid"]').click();assert((await p.locator('#lab-status').textContent()).includes('الخطوة التالية: قطعة الخارصين'));assert(await p.locator('.bubble').count()===0);assert(await p.locator('[data-material="zinc"]').isEnabled());
await p.locator('[data-material="zinc"]').press('Enter');assert(await p.locator('[data-material="zinc"]').isDisabled());
await p.locator('[data-material="balloon"]').click();assert(await p.locator('.bubble').count()===0);
await p.locator('[data-material="acid"]').click();assert(await p.locator('.bubble').count()===0);assert(await p.locator('[data-choice="0"]').isDisabled());
await p.locator('[data-material="balloon"]').click();assert(await p.locator('.bubble').count()>0);assert(await p.locator('.inflating-balloon').count()===1);await p.locator('[data-choice="0"]').waitFor({state:'visible'});await p.waitForFunction(()=>!document.querySelector('[data-choice="0"]').disabled);await p.locator('[data-choice="0"]').click();assert(await p.locator('#explain').isVisible());
await p.locator('#reset-lab').click();assert(await p.locator('.bubble').count()===0);assert(await p.locator('[data-material="zinc"]').isEnabled());assert(await p.locator('#explain').isHidden());
// Real browser drag-and-drop uses the same ordered validator as clicks.
await p.locator('[data-material="balloon"]').dragTo(p.locator('#flask-drop'));assert(await p.locator('.bubble').count()===0);
for(const item of ['zinc','acid','balloon'])await p.locator(`[data-material="${item}"]`).dragTo(p.locator('#flask-drop'));
await p.waitForFunction(()=>!document.querySelector('[data-choice="0"]').disabled);assert(await p.locator('.lab-checklist .completed').count()===3);
await p.locator('#reset-lab').click();for(const item of ['zinc','acid','balloon'])await p.locator(`[data-material="${item}"]`).click();await p.locator('#reset-lab').click();await p.waitForTimeout(2700);assert(await p.locator('[data-choice="0"]').isDisabled());
const cases=[
 [7,null,['aluminum','clip','acid'],'تصاعد غاز الهيدروجين'],
 [8,'bread',['bread','iodine'],'الخبز بنفسجي'],[8,'milk',['milk','iodine'],'لا يتغيّر لون الحليب'],
 [9,null,['salt','water','stir','silver'],'راسب أبيض'],
 [10,'acid',['acid','extract'],'أحمر'],[10,'base',['base','extract'],'أخضر'],
 [11,null,['magnesium','tongs','burner'],'أكسيد المغنيسيوم']
];
for(const mode of ['click','drag'])for(const [n,sample,materials,outcome] of cases){
 await p.evaluate(n=>go(n),n);if(sample)await p.locator('#sample').selectOption(sample);
 assert(await p.locator('.student-guide').count()===1);
 const add=async id=>mode==='drag'?p.locator(`[data-material="${id}"]`).dragTo(p.locator('.flask-drop')):p.locator(`[data-material="${id}"]`).click();
 const before=await p.locator('.experiment-visual').innerHTML();await add(materials.at(-1));assert(await p.locator('.experiment-visual').innerHTML()===before);assert((await p.locator('.experiment-status').textContent()).includes('الخطوة التالية'));
 for(const id of materials){assert(await p.locator('[data-choice="0"]').isDisabled());await add(id);}
 assert((await p.locator('.experiment-visual').textContent()).includes(outcome));await p.waitForFunction(()=>!document.querySelector('[data-choice="0"]').disabled);
 await p.locator('[data-choice="1"]').click();assert(await p.locator('#explain').isHidden());await p.locator('[data-choice="0"]').click();assert(await p.locator('#explain').isVisible());
 await p.locator('.reset-experiment').click();assert(await p.locator('[data-choice="0"]').isDisabled());assert(await p.locator('#explain').isHidden());assert(await p.locator(`[data-material="${materials[0]}"]`).isEnabled());
}
// Switching samples cancels the previous result and its pending completion.
await p.evaluate(()=>go(8));await p.locator('[data-material="bread"]').click();await p.locator('[data-material="iodine"]').click();await p.locator('#sample').selectOption('milk');await p.waitForTimeout(2700);assert(await p.locator('[data-choice="0"]').isDisabled());assert(await p.locator('[data-material="milk"]').isEnabled());
await p.locator('[data-page="14"]').click();assert(await p.locator('#toquiz').isVisible());await p.locator('#toquiz').click();
// A poor post-test cannot unlock the certificate, even with full pre-test marks.
for(let i=0;i<7;i++)await p.locator(`input[name=q${i}][value="${[1,0,1,0,1,0,1][i]}"]`).check();await p.getByRole('button',{name:'اعرض نتيجتي'}).click();await p.locator('#next').click();assert(await p.locator('#toquiz').isVisible());await p.locator('#toquiz').click();
for(let i=0;i<7;i++)await p.locator(`input[name=q${i}][value="${[0,1,0,1,0,1,0][i]}"]`).check();await p.getByRole('button',{name:'اعرض نتيجتي'}).click();assert((await p.locator('#quiz-result').textContent()).includes('7'));await p.locator('#next').click();await p.locator('#student').fill('طالبة الاكتشاف');await p.locator('#issue').click();assert(await p.locator('#cert-name').textContent()==='طالبة الاكتشاف');assert(await p.locator('#print').isVisible());assert(await p.locator('#next').isDisabled());
// Test each section's local player, pause/resume, replay and navigation stop.
for(const n of [0,7,12,13,14]){await p.evaluate(n=>go(n),n);await p.locator('input[type=file]').setInputFiles({name:'teacher.wav',mimeType:'audio/wav',buffer:buf});assert(await p.locator('audio').evaluate(a=>a.paused));await p.locator('.listen').click();await p.waitForTimeout(150);assert(await p.locator('audio').evaluate(a=>!a.paused&&a.currentTime>0));await p.locator('.pause').click();const position=await p.locator('audio').evaluate(a=>a.currentTime);assert(await p.locator('audio').evaluate(a=>a.paused));await p.locator('.listen').click();assert(await p.locator('audio').evaluate(a=>!a.paused&&a.currentTime>=0));await p.locator('.replay').click();assert(await p.locator('audio').evaluate((a,position)=>a.currentTime<position+.15,position));await p.evaluate(()=>go(0));assert(await p.evaluate(()=>currentAudio===null));}
await p.reload();await p.evaluate(()=>go(7)); // Clear session uploads: check permanent WAV fallback and no autoplay.
await p.route('**/assets/audio/activities.mp3',route=>route.fulfill({status:404,body:''}));await p.route('**/assets/audio/activities.wav',route=>route.fulfill({status:200,contentType:'audio/wav',body:buf}));await p.locator('.listen').click();await p.waitForFunction(()=>document.querySelector('audio').currentTime>0);assert((await p.locator('audio').getAttribute('src')).endsWith('activities.wav'));await p.locator('#next').click();assert(await p.evaluate(()=>currentAudio===null));
await p.reload();await p.evaluate(()=>go(7));await p.route('**/assets/audio/activities.mp3',route=>route.fulfill({status:200,contentType:'audio/mpeg',body:encoded.stdout}));await p.locator('.listen').click();await p.waitForFunction(()=>document.querySelector('audio').currentTime>0);assert((await p.locator('audio').getAttribute('src')).endsWith('activities.mp3'));
for(const width of [390,1280]){await p.setViewportSize({width,height:900});await p.evaluate(()=>go(-1));const expected=['ماذا أعرف قبل أن أبدأ؟','الأهداف التعليمية','كيف يتكوّن الصدأ؟'];assert(await p.locator('[data-entry]').count()===0);await p.locator('#begin').click();for(let i=0;i<3;i++){assert(await p.locator('h2').first().textContent()===expected[i]);await p.locator('#next').click();}assert(await p.locator('h2').textContent()==='المواد المتفاعلة والناتجة');assert(await p.locator('#content').getByText('تعريف التفاعل الكيميائي',{exact:true}).count()===0);for(let i=2;i>=0;i--){await p.locator('#prev').click();assert(await p.locator('h2').textContent()===expected[i]);}}
// All step links and navigation boundaries work; no page overflows.
for(const width of [390,1280]){await p.setViewportSize({width,height:900});for(let n=0;n<15;n++){await p.evaluate(n=>go(n),n);assert(await p.locator('progress').getAttribute('value')===String(n+1));assert(await p.locator('#content').evaluate(c=>c.firstElementChild.matches('.recording-panel,.slide-audio')),'audio above lesson');assert(!(await p.locator('#content').textContent()).includes('في نشاط الكتاب'));assert(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`overflow ${width} ${n}`);await p.locator('#home').click();assert(await p.locator('#begin').isVisible());await p.locator('#begin').click();await p.locator(`[data-page="${n}"]`).click();assert(await p.evaluate(()=>page)===n);}await p.evaluate(()=>go(0));await p.locator('#prev').click();assert(await p.locator('#begin').isVisible());}
await p.locator('#begin').click();await p.locator('[data-page="2"]').click();await p.locator('#rust-water').click();await p.locator('#rust-air').click();await p.locator('#rust-time').click();await p.locator('#home').click();await p.waitForTimeout(2700);assert(await p.locator('#begin').isVisible());assert.deepEqual(errors,[]);
const touch=await b.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});const phone=await touch.newPage();await phone.goto(process.env.TEST_URL||'http://127.0.0.1:8000');await phone.locator('#begin').tap();await phone.locator('[data-page="2"]').tap();await phone.locator('#rust-water').tap();await phone.locator('#rust-air').tap();await phone.locator('#rust-time').tap();await phone.locator('#rust-question').waitFor({state:'visible'});await phone.locator('[data-rust-answer="new"]').tap();await finishAtoms(phone);assert(await phone.locator('#rust-definition').isVisible());await phone.locator('[data-page="6"]').tap();for(const item of ['zinc','acid','balloon'])await phone.locator(`[data-material="${item}"]`).tap();await phone.waitForFunction(()=>!document.querySelector('[data-choice="0"]').disabled);assert(await phone.locator('.bubble').count()>0);await phone.locator('#reset-lab').tap();assert(await phone.locator('.bubble').count()===0);for(const [n,sample,materials,outcome] of cases){await phone.evaluate(n=>go(n),n);if(sample)await phone.locator('#sample').selectOption(sample);for(const id of materials)await phone.locator(`[data-material="${id}"]`).tap();await phone.waitForFunction(()=>!document.querySelector('[data-choice="0"]').disabled);assert((await phone.locator('.experiment-visual').textContent()).includes(outcome));assert(await phone.locator('.student-guide').isVisible());assert(!(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));await phone.locator('.reset-experiment').tap();assert(await phone.locator('[data-choice="0"]').isDisabled());}await touch.close();
console.log('PASS: ordered lab click, keyboard, drag/drop and mobile taps, wrong order, reset and timer cancellation, audio above content,  complete journey, rust timing/answers/definition/reset, pre-test 0/4 and 4/4 independent of post-test, objectives, all existing simulations, equations, post-test and certificate, all navigation/progress, teacher audio only, silent when missing, local upload, pause/resume/replay/stop, published WAV/MP3 paths, responsive layout, no JS errors');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
