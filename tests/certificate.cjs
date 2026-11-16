const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
for(const mobile of [false,true]){
 const p=await b.newPage({viewport:{width:mobile?390:1280,height:900},hasTouch:mobile,isMobile:mobile});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.TEST_URL||'http://127.0.0.1:8000');assert(await p.locator('.cover-teacher').textContent()==='إعداد المعلمة: آلاء محسن كلاب');
 await p.locator('#begin').click();await p.evaluate(()=>{score=5;go(14)});assert(await p.locator('.certificate-stars').count()===0);assert(await p.locator('#student').count()===0);
 await p.evaluate(()=>{score=null;go(14)});assert(await p.locator('#student').count()===0);
 await p.evaluate(()=>{score=6;go(14)});assert(await p.locator('.certificate-stars span').count()===48);assert(await p.locator('audio').evaluate(a=>a.paused&&!a.autoplay));
 await p.locator('#student').fill('ليان أحمد محسن');await p.locator('#issue').click();
 assert(await p.locator('#cert-name').textContent()==='ليان أحمد محسن');assert((await p.locator('.certificate-footer').textContent()).includes('إعداد المعلمة: آلاء محسن كلاب'));assert((await p.locator('.certificate-footer').textContent()).includes(await p.evaluate(()=>certificateDate)));
 assert(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
 await p.locator('.certificate').screenshot({path:`/tmp/certificate-${mobile?'mobile':'desktop'}.png`});
 const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#download-certificate').click()]);await download.saveAs(`/tmp/certificate-${mobile?'mobile':'desktop'}-download.png`);
 const data=fs.readFileSync(`/tmp/certificate-${mobile?'mobile':'desktop'}-download.png`);assert(data.readUInt32BE(16)===3508);assert(data.readUInt32BE(20)===2480);
 await p.waitForFunction(()=>!document.querySelector('.certificate-stars'));await p.emulateMedia({media:'print'});assert(await p.locator('.certificate-actions').isHidden());assert(await p.locator('.slide-audio').evaluate(e=>getComputedStyle(e).visibility)==='hidden');
 await p.pdf({path:`/tmp/certificate-${mobile?'mobile':'desktop'}.pdf`,preferCSSPageSize:true,printBackground:true});await p.emulateMedia({media:'screen'});
 await p.locator('[data-page="13"]').click();assert(await p.locator('.certificate-stars').count()===0);await p.locator('[data-page="14"]').click();assert(await p.locator('#cert-name').textContent()==='ليان أحمد محسن');await p.locator('#prev').click();assert(await p.locator('.certificate-stars').count()===0);
 await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>go(14));assert(await p.locator('.certificate-stars').count()===0);assert(await p.locator('.certificate').evaluate(e=>getComputedStyle(e).animationName)==='none');
 await p.locator('#student').fill('اسم طويل '.repeat(8).slice(0,70));await p.locator('#issue').click();assert(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));await p.locator('#student').fill('<img src=x onerror=alert(1)>');await p.locator('#issue').click();assert(await p.locator('#cert-name img').count()===0);
 assert.deepEqual(errors,[]);await p.close();
}
await b.close();console.log('PASS: desktop/mobile eligibility, cover credit, Arabic name/date/teacher, 48 stars with cleanup, reduced motion, no narration autoplay, 3508x2480 PNG, A4 landscape PDF, long names and safe text');})().catch(e=>{console.error(e);process.exit(1)});
