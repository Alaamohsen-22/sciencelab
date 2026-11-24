/* CH4 practice only. The original automatic simulation and all other practices are unchanged. */
const BondMethane=(()=>{
 const names=['الأولى','الثانية','الثالثة','الرابعة'];
 function diagram(s,flight=null){
  const cx=350,cy=225,angles=[-Math.PI/2,0,Math.PI/2,Math.PI],dot=(id,x,y,origin,lit=false)=>`<circle data-electron="${id}" data-origin="${origin}" cx="${x}" cy="${y}" r="6" fill="${origin==='C'?'#a26acb':'#2699af'}" class="${lit?'bond-electron-lit':''}"/>`;
  let out=dot('C-inner-1',350,200,'C')+dot('C-inner-2',350,250,'C');
  let atoms='',links='';
  for(let i=0;i<4;i++){
   const a=angles[i],formed=s.formed.has(i),moving=flight?.id===i,t=moving?flight.progress:formed?1:0,near=165-50*t,hx=cx+Math.cos(a)*near,hy=cy+Math.sin(a)*near;
   const sx=cx+Math.cos(a)*70,sy=cy+Math.sin(a)*70,ex=hx-Math.cos(a)*50,ey=hy-Math.sin(a)*50,mx=(sx+ex)/2,my=(sy+ey)/2,px=-Math.sin(a)*6,py=Math.cos(a)*6;
   const electronic=formed?1:moving?t:0;
   if(formed)links+=`<line class="bond-covalent-line" data-methane-bond="${i}" x1="350" y1="225" x2="${hx}" y2="${hy}"/>`;
   out+=dot('C-'+i,sx+(mx+px-sx)*electronic,sy+(my+py-sy)*electronic,'C',s.selected&&!formed)+dot('H-'+i,ex+(mx-px-ex)*electronic,ey+(my-py-ey)*electronic,'H');
   atoms+=`<g><circle class="bond-shell" cx="${hx}" cy="${hy}" r="50"/><circle class="bond-nucleus" cx="${hx}" cy="${hy}" r="21"/><text class="bond-symbol" x="${hx}" y="${hy+8}" text-anchor="middle">H</text><text class="methane-number" x="${hx+33}" y="${hy-29}" text-anchor="middle">${i+1}</text></g>`;
  }
  return `<svg class="bond-diagram methane-diagram" viewBox="0 0 700 450" role="img" aria-label="نشاط الميثان: ${s.formed.size} روابط من أربع، والأرقام لتمييز ذرات الهيدروجين"><title>كربون وأربع ذرات هيدروجين؛ عشرة إلكترونات محفوظة</title>${links}<circle class="bond-shell" cx="350" cy="225" r="70"/><circle class="bond-shell" cx="350" cy="225" r="25"/><circle class="bond-nucleus" cx="350" cy="225" r="21"/><text class="bond-symbol" x="350" y="233" text-anchor="middle">C</text>${atoms}${out}${s.checked?'<text class="bond-formula" data-final-formula x="350" y="440" text-anchor="middle">CH₄</text>':''}</svg>`;
 }
 function mount(host,{saved,onCorrect,onVerified,onReset,pauseWatching}){
  const s=saved;s.formed??=new Set();s.selected??=false;s.checked??=false;s.zoom??=false;
  let disposed=false,busy=false,frame=null,finish=null,generation=0;
  host.classList.add('bond-methane');
  host.addEventListener('pointerdown',pauseWatching);
  function stop(){generation++;cancelAnimationFrame(frame);clearTimeout(finish);busy=false;BondAudio.stop();}
  function render(flight=null){
   host.innerHTML=`<span class="badge">الروابط المكتملة: <bdi>${s.formed.size} / 4</bdi></span><h3>الآن دورك يا عالم! · كوّن الميثان</h3><p class="methane-instruction"><b>١.</b> اختر إلكترونًا من الكربون. <b>٢.</b> اختر ذرة هيدروجين غير مرتبطة لتشارك بإلكترونها.</p><div class="bond-practice-view ${s.zoom?'is-zoomed':''}">${diagram(s,flight)}</div><div class="methane-toolbar"><span>الأرقام 1–4 تميّز ذرات H فقط.</span><button class="secondary" data-zoom-practice data-effect-silent aria-pressed="${s.zoom}">${s.zoom?'تصغير الرسم':'تكبير الرسم'}</button></div><div class="methane-controls" aria-busy="${busy}"><button class="methane-carbon" data-carbon-electron data-effect-silent aria-pressed="${s.selected}" ${busy||s.formed.size===4?'disabled':''}><b>C <span aria-hidden="true">●</span></b><span>${s.selected?'تم اختيار إلكترون الكربون ✓':'١. اختر إلكترونًا من الكربون'}</span><small>المتبقي: ${4-s.formed.size}</small></button><div class="methane-hydrogens" aria-label="اختر الهيدروجين الذي سيشارك الكربون">${names.map((name,i)=>`<button data-hydrogen="${i}" data-effect-silent ${busy||s.formed.has(i)?'disabled':''} class="${s.formed.has(i)?'is-bonded':''}"><b>H <span class="methane-number-label">${i+1}</span></b><span>${s.formed.has(i)?'مرتبطة بالكربون ✓':'٢. الهيدروجين '+name}</span></button>`).join('')}</div></div><p class="methane-status" role="status">${busy?'تشارك الذرتان بالإلكترونين…':s.checked?'✓ تم التحقق: جزيء الميثان مكتمل بأربع روابط تساهمية أحادية.':s.formed.size===4?'أكملت الروابط الأربع. اضغط «تحقق من الرابطة».':s.selected?'اضغط على إحدى ذرات الهيدروجين غير المرتبطة.':'ابدأ باختيار إلكترون من الكربون.'}</p><div class="methane-actions"><button data-verify data-effect-silent ${busy||s.formed.size<4||s.checked?'disabled':''}>تحقق من الرابطة</button><button class="secondary" data-reset-practice data-effect-silent>إعادة النشاط</button></div><p data-answer-feedback aria-live="polite">${s.checked?'✓ جزيء CH₄: أربع روابط تساهمية أحادية، في كل رابطة زوج مشترك.':''}</p>`;
   host.querySelector('[data-carbon-electron]').onclick=()=>{if(busy||s.formed.size===4)return;pauseWatching();s.selected=!s.selected;render();};
   host.querySelectorAll('[data-hydrogen]').forEach(button=>button.onclick=()=>connect(+button.dataset.hydrogen));
   host.querySelector('[data-verify]').onclick=()=>{if(busy||s.checked||s.formed.size!==4)return;s.checked=true;render();onVerified(host);};
   host.querySelector('[data-reset-practice]').onclick=()=>{stop();Effects.stop(false);Effects.reset(host);s.formed.clear();s.selected=false;s.checked=false;onReset();render();};
   host.querySelector('[data-zoom-practice]').onclick=()=>{s.zoom=!s.zoom;host.querySelector('.bond-practice-view').classList.toggle('is-zoomed',s.zoom);const button=host.querySelector('[data-zoom-practice]');button.setAttribute('aria-pressed',String(s.zoom));button.textContent=s.zoom?'تصغير الرسم':'تكبير الرسم';};
  }
  function connect(id){
   if(disposed||busy||s.formed.has(id)||id<0||id>3)return;
   pauseWatching();if(!s.selected){onCorrect(false,'methane-select-first',host,'اختر إلكترونًا من الكربون أولًا، ثم ذرة هيدروجين.');return;}
   stop();Effects.stop(false);busy=true;const token=generation,begin=performance.now();render({id,progress:0});BondAudio.play('share');
   const tick=now=>{if(disposed||token!==generation||!host.isConnected)return;const p=Math.min(1,Math.max(0,(now-begin)/380));host.querySelector('.bond-practice-view').innerHTML=diagram(s,{id,progress:matchMedia('(prefers-reduced-motion: reduce)').matches?(p<1?0:1):p});if(p<1){frame=requestAnimationFrame(tick);return;}
    s.formed.add(id);s.selected=false;render();host.querySelector('.methane-status').textContent=`✓ تكوّنت رابطة C–H مع الهيدروجين ${names[id]}.`;BondAudio.play('single-bond');onCorrect(true,'methane-bond-'+id,host,'','زوج مشترك واحد كوّن رابطة تساهمية أحادية.');
    finish=setTimeout(()=>{if(disposed||token!==generation||!host.isConnected)return;busy=false;render();},360);
   };frame=requestAnimationFrame(tick);
  }
  render();return ()=>{disposed=true;stop();host.removeEventListener('pointerdown',pauseWatching);};
 }
 return {mount};
})();
