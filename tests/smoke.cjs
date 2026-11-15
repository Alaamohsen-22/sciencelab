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
const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(process.env.TEST_URL||'http://127.0.0.1:8000');
await p.locator('.teacher-portrait img').evaluate(i=>i.decode());
await p.locator('.listen').click();await p.waitForFunction(()=>document.querySelector('.audio-status').textContent.includes('لم يُضف'));
assert(await p.locator('audio').evaluate(a=>a.paused&&!a.getAttribute('src')),'Missing recording stays silent');
await p.getByRole('button',{name:'ابدأ الاستكشاف'}).click();
assert(await p.locator('h2').textContent()==='لغز العالم الصغير: ماذا حدث داخل المختبر؟');
assert(await p.locator('#mystery-question').isHidden());await p.locator('#start-mystery').click();
assert(await p.locator('.inflating-balloon').count()===1);await p.locator('#mystery-question').waitFor({state:'visible'});
await p.locator('[data-mystery="1"]').click();assert(await p.locator('#discover').isHidden());await p.locator('[data-mystery="0"]').click();await p.locator('#discover').click();
// Low score does not prevent progress or change the post-test score.
for(let i=0;i<4;i++)await p.locator(`input[name=pre${i}][value="${[0,0,1,0][i]}"]`).check();
await p.getByRole('button',{name:'اكتشف نتيجتك'}).click();assert((await p.locator('#pre-result').textContent()).includes('0 من 4'));assert(await p.evaluate(()=>score===null));
await p.locator('#pre-continue').click();assert((await p.locator('h2').textContent()).includes('الأهداف'));
await p.locator('#prev').click();assert((await p.locator('#pre-result').textContent()).includes('0 من 4'));
for(let i=0;i<4;i++)await p.locator(`input[name=pre${i}][value="${[1,1,0,2][i]}"]`).check();
await p.getByRole('button',{name:'اكتشف نتيجتك'}).click();assert((await p.locator('#pre-result').textContent()).includes('4 من 4'));assert(await p.evaluate(()=>score===null));
await p.locator('#next').click();await p.locator('#next').click();await p.selectOption('#water','2');assert((await p.locator('#atoms').textContent()).includes('أحسنت'));
await p.locator('#next').click();await p.locator('#run').click();await p.locator('[data-choice="0"]').click();assert(await p.locator('#explain').isVisible());
await p.locator('#next').click();assert((await p.locator('#content').textContent()).includes('مواد جديدة'));
await p.locator('#next').click();await p.locator('#ca').fill('2');await p.locator('#cao').fill('2');await p.locator('#balance').click();assert((await p.locator('#balance-result').textContent()).includes('أحسنت'));
for(let n=7;n<=11;n++){await p.locator('#next').click();assert(await p.evaluate(()=>page)===n);await p.locator('#run').click();await p.locator('[data-choice="1"]').click();assert(await p.locator('#explain').isHidden());await p.locator('[data-choice="0"]').click();assert(await p.locator('#explain').isVisible());if(n===8||n===10){await p.locator('#sample').selectOption(n===8?'milk':'base');await p.locator('#run').click();assert((await p.locator('#sim-status').textContent()).includes(n===8?'لم يتغيّر':'أخضر'));}await p.locator('#reset').click();assert(await p.locator('[data-choice="0"]').isDisabled());}
await p.locator('[data-page="13"]').click();assert(await p.locator('#toquiz').isVisible());await p.locator('#toquiz').click();
// A poor post-test cannot unlock the certificate, even with full pre-test marks.
for(let i=0;i<7;i++)await p.locator(`input[name=q${i}][value="${[1,0,1,0,1,0,1][i]}"]`).check();await p.getByRole('button',{name:'اعرض نتيجتي'}).click();await p.locator('#next').click();assert(await p.locator('#toquiz').isVisible());await p.locator('#toquiz').click();
for(let i=0;i<7;i++)await p.locator(`input[name=q${i}][value="${[0,1,0,1,0,1,0][i]}"]`).check();await p.getByRole('button',{name:'اعرض نتيجتي'}).click();assert((await p.locator('#quiz-result').textContent()).includes('7'));await p.locator('#next').click();await p.locator('#student').fill('طالبة الاكتشاف');await p.locator('#issue').click();assert(await p.locator('#cert-name').textContent()==='طالبة الاكتشاف');assert(await p.locator('#print').isVisible());assert(await p.locator('#next').isDisabled());
// Test each section's local player, pause/resume, replay and navigation stop.
for(const n of [-1,0,2,3,5,6,7,12,13]){await p.evaluate(n=>go(n),n);await p.locator('input[type=file]').setInputFiles({name:'teacher.wav',mimeType:'audio/wav',buffer:buf});assert(await p.locator('audio').evaluate(a=>a.paused));await p.locator('.listen').click();await p.waitForTimeout(150);assert(await p.locator('audio').evaluate(a=>!a.paused&&a.currentTime>0));await p.locator('.pause').click();const position=await p.locator('audio').evaluate(a=>a.currentTime);assert(await p.locator('audio').evaluate(a=>a.paused));await p.locator('.listen').click();assert(await p.locator('audio').evaluate(a=>!a.paused&&a.currentTime>=0));await p.locator('.replay').click();assert(await p.locator('audio').evaluate((a,position)=>a.currentTime<position+.15,position));await p.evaluate(()=>go(-1));assert(await p.evaluate(()=>currentAudio===null));}
await p.reload(); // Clear session uploads: check permanent WAV fallback and no autoplay.
await p.route('**/assets/audio/welcome.wav',route=>route.fulfill({status:200,contentType:'audio/wav',body:buf}));await p.locator('.listen').click();await p.waitForFunction(()=>document.querySelector('audio').currentTime>0);assert((await p.locator('audio').getAttribute('src')).endsWith('welcome.wav'));await p.locator('#begin').click();assert(await p.evaluate(()=>currentAudio===null));
await p.reload();await p.route('**/assets/audio/welcome.mp3',route=>route.fulfill({status:200,contentType:'audio/mpeg',body:encoded.stdout}));await p.locator('.listen').click();await p.waitForFunction(()=>document.querySelector('audio').currentTime>0);assert((await p.locator('audio').getAttribute('src')).endsWith('welcome.mp3'));
// All step links and navigation boundaries work; no page overflows.
for(const width of [390,1280]){await p.setViewportSize({width,height:900});for(let n=0;n<14;n++){await p.evaluate(n=>go(n),n);assert(await p.locator('progress').getAttribute('value')===String(n+1));assert(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`overflow ${width} ${n}`);await p.locator('#home').click();assert(await p.locator('#begin').isVisible());await p.locator('#begin').click();await p.locator(`[data-page="${n}"]`).click();assert(await p.evaluate(()=>page)===n);}await p.evaluate(()=>go(0));await p.locator('#prev').click();assert(await p.locator('#begin').isVisible());}
await p.locator('#begin').click();await p.locator('#start-mystery').click();await p.locator('#home').click();await p.waitForTimeout(2700);assert(await p.locator('#begin').isVisible());assert.deepEqual(errors,[]);
console.log('PASS: complete journey, mystery timing/answers, pre-test 0/4 and 4/4 independent of post-test, objectives, all existing simulations, equations, post-test and certificate, all navigation/progress, teacher audio only, silent when missing, local upload, pause/resume/replay/stop, published WAV/MP3 paths, responsive layout, no JS errors');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
