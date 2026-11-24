const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 for(const width of [1280,390,320]){
  const page=await browser.newPage({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.cues=[];document.addEventListener('bond-sound',e=>cues.push({kind:e.detail.kind,bonds:document.querySelectorAll('[data-methane-bond]').length}));});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:8031');await page.locator('#cover-student').fill('جود فلسطين');await page.locator('[data-lesson=bonds]').click();
  await page.locator('[data-bond-page="5"]').click();const m=page.locator('.bond-methane');
  await m.locator('[data-zoom-practice]').click();assert(await m.locator('.is-zoomed').count()===1);assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));await m.locator('[data-zoom-practice]').click();
  // Cancel a bond during the movement: no stale completion is allowed.
  await m.locator('[data-carbon-electron]').click();await m.locator('[data-hydrogen="1"]').click();await m.locator('[data-reset-practice]').click();await page.waitForTimeout(850);assert(await m.locator('[data-methane-bond]').count()===0);assert(await m.locator('[data-verify]').isDisabled());
  await page.evaluate(()=>cues.length=0);
  for(const [i,h]of [3,1,0,2].entries()){
   await m.locator('[data-carbon-electron]').click();await m.locator(`[data-hydrogen="${h}"]`).click();await page.waitForFunction(()=>document.querySelector('.methane-controls').getAttribute('aria-busy')==='false');
   assert(await m.locator('[data-methane-bond]').count()===i+1);assert(await m.locator('[data-electron]').count()===10);assert(await m.locator(`[data-hydrogen="${h}"]`).isDisabled());
  }
  const cues=await page.evaluate(()=>window.cues);assert.deepEqual(cues.map(c=>c.kind),['share','single-bond','share','single-bond','share','single-bond','share','single-bond']);assert.deepEqual(cues.filter(c=>c.kind==='single-bond').map(c=>c.bonds),[1,2,3,4]);
  await m.locator('[data-verify]').click();assert(await m.locator('[data-final-formula]').textContent()==='CH₄');assert(await m.locator('[data-verify]').isDisabled());await m.screenshot({path:`/tmp/methane-revision-${width}.png`});
  await page.locator('[data-bond-page="4"]').click();await page.locator('[data-bond-page="5"]').click();assert(await page.locator('.bond-methane [data-final-formula]').count()===1);
  await page.locator('[data-bond-page="3"]').click();const hcl=page.locator('.bond-hcl-example');assert(await hcl.locator('.bond-hcl-simulation').getAttribute('data-hcl-state')==='idle');assert(await hcl.locator('.bond-hcl-view [data-hcl-electron]').count()===18);
  await hcl.locator('[data-hcl-watch]').click();await page.waitForTimeout(1400);await hcl.locator('[data-hcl-pause]').click();const stage=await hcl.locator('.bond-hcl-simulation').getAttribute('data-hcl-stage'),count=await page.evaluate(()=>cues.length);await page.waitForTimeout(250);assert(await hcl.locator('.bond-hcl-simulation').getAttribute('data-hcl-stage')===stage);assert(await page.evaluate(()=>cues.length)===count);
  await hcl.locator('[data-hcl-resume]').click();await page.waitForFunction(()=>document.querySelector('.bond-hcl-simulation').dataset.hclState==='complete');assert(await hcl.locator('.bond-hcl-view [data-hcl-bond]').count()===1);assert(await hcl.locator('.bond-hcl-view [data-hcl-electron]').count()===18);
  await hcl.locator('[data-hcl-replay]').click();await page.locator('[data-watch]').click();assert(await hcl.locator('.bond-hcl-simulation').getAttribute('data-hcl-state')==='paused');
  const manual=hcl.locator('.bond-hcl-practice');await manual.locator('[data-hcl-share]').click();assert((await manual.locator('[data-answer-feedback]').textContent()).includes('حاول مرة أخرى'));assert(await page.locator('.bond-simulation').getAttribute('data-state')==='paused');
  for(const atom of ['H','Cl'])await manual.locator(`[data-hcl-electron-token="${atom}"]`).click();await manual.locator('[data-hcl-share]').click();await page.waitForFunction(()=>!document.querySelector('[data-hcl-verify]').disabled);assert(await manual.locator('[data-hcl-bond]').count()===1);assert(await manual.locator('[data-hcl-electron]').count()===18);assert(await manual.locator('[data-hcl-formula]').count()===0);await manual.locator('[data-hcl-verify]').click();assert(await manual.locator('[data-hcl-formula]').count()===1);await manual.locator('[data-hcl-zoom]').click();assert(await manual.locator('.is-zoomed').count()===1);await manual.locator('[data-hcl-reset]').click();assert(await manual.locator('[data-hcl-bond]').count()===0);
  await hcl.locator('.bond-hcl-check [data-choice="0"]').click();assert(await hcl.locator('.bond-hcl-check [data-choice="0"]').isDisabled());assert(await page.evaluate(()=>Bonds.status().required)===18);
  await page.locator('[data-bond-page="7"]').click();assert((await page.locator('.bond-heading h2').textContent()).includes('خريطة الروابط'));assert(await page.locator('.bond-map svg').count()>=4);assert(await page.locator('.bond-map table').count()===1);assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));await page.locator('.bond-map').screenshot({path:`/tmp/bonds-map-${width}.png`});await page.locator('#bond-start-posttest').click();assert(await page.evaluate(()=>Bonds.status().page)===8);assert(await page.locator('.bond-quiz-item').count()===1);
  assert.deepEqual(errors,[]);await page.close();console.log('PASS revision',width);
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
