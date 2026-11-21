/* Original UI tones and real teacher reward recordings share a single audio source. */
const Effects=(()=>{
 let enabled=true,context=null,ready=null,rewardsReady=null,active=null,activeKind=null,activeGain=null,finishSource=null;
 let epoch=0,running=false,queue=[],pausedTeacher=null,lastReward=null,seen=new WeakMap(),suppressClick=false;
 const buffers={},rewards=[];
 try{enabled=localStorage.getItem('lab-effects')!=='muted';}catch{}
 const root=()=>document.querySelector('#content')||document.querySelector('.cover');
 function resumeTeacher(){
  const held=pausedTeacher;pausedTeacher=null;
  if(!held||!held.audio.isConnected||held.root!==root()||document.hidden||!held.audio.paused||held.audio.ended)return;
  if(held.audio.currentSrc!==held.src||Math.abs(held.audio.currentTime-held.time)>.15)return;
  if([...document.querySelectorAll('audio')].some(a=>!a.paused))return;
  held.audio.play().catch(()=>{});
 }
 function pauseTeacher(){
  if(pausedTeacher)return;
  const audio=[...document.querySelectorAll('audio')].find(a=>!a.paused&&!a.ended);
  if(audio){pausedTeacher={audio,root:root(),time:audio.currentTime,src:audio.currentSrc};audio.pause();}
 }
 function stopSource(){
  const resolve=finishSource;finishSource=null;
  if(active){active.onended=null;try{active.stop();}catch{}active.disconnect();active=null;}
  if(activeGain){activeGain.disconnect();activeGain=null;}activeKind=null;resolve?.(false);
 }
 function stop(resume=false){epoch++;queue=[];running=false;stopSource();if(resume)resumeTeacher();else pausedTeacher=null;}
 async function decode(url){const response=await fetch(url);if(!response.ok)throw Error('Audio unavailable');return context.decodeAudioData(await response.arrayBuffer());}
 function unlock(){
  if(!enabled)return;
  try{
   if(!context){context=new (window.AudioContext||window.webkitAudioContext)();
    ready=Promise.all(['click','error','success'].map(async kind=>{try{buffers[kind]=await decode(`assets/sounds/${kind}.wav`);}catch{}}));
    rewardsReady=(async()=>{try{const response=await fetch('assets/audio/rewards/manifest.json');if(!response.ok)return;const list=await response.json();await Promise.all(list.map(async item=>{try{const buffer=await decode(`assets/audio/rewards/${item.file}`);rewards.push({...item,buffer});}catch{}}));}catch{}})();
   }
   if(context.state==='suspended')context.resume().catch(()=>{});
  }catch{}
 }
 function source(kind,buffer,token,detail={}){
  if(!buffer||!enabled||token!==epoch||context.state!=='running')return Promise.resolve(false);
  stopSource();
  return new Promise(resolve=>{
   const node=context.createBufferSource(),gain=context.createGain();node.buffer=buffer;gain.gain.value=kind==='reward'?.9:.65;node.connect(gain);gain.connect(context.destination);
   active=node;activeGain=gain;activeKind=kind;finishSource=resolve;
   node.onended=()=>{node.onended=null;try{node.stop();}catch{}if(active===node){active=null;activeGain=null;activeKind=null;finishSource=null;}node.disconnect();gain.disconnect();resolve(true);};
   node.start();document.dispatchEvent(new CustomEvent('lab-effect',{detail:{kind,...detail}}));
  });
 }
 function chooseReward(){const available=rewards.filter(r=>rewards.length===1||r.id!==lastReward);return available[Math.floor(Math.random()*available.length)];}
 async function drain(){
  if(running)return;running=true;const token=epoch;
  try{
   await ready;
   while(enabled&&token===epoch&&queue.length){
    const entry=queue.shift();if(!entry.root?.isConnected||entry.root!==root())continue;
    pauseTeacher();
    if(!await source('success',buffers.success,token))break;
    if(token!==epoch||!enabled)break;
    await rewardsReady;if(token!==epoch||!enabled)break;
    const reward=(entry.preferredReward&&rewards.find(r=>r.id===entry.preferredReward))||chooseReward();
    if(reward){lastReward=reward.id;if(!await source('reward',reward.buffer,token,{id:reward.id,label:reward.label}))break;}
   }
  }finally{if(token===epoch){running=false;queue=[];resumeTeacher();}}
 }
 async function play(kind,preferredReward=null){
  if(!enabled||!context)return;
  if(kind==='success'){queue.push({root:root(),preferredReward});drain();return;}
  if(running||queue.length)return;
  const token=epoch;await ready;
  if(token!==epoch||!enabled||running||queue.length)return;
  await source(kind,buffers[kind],token);
 }
 // Certificate awards use the existing real Bravo recording, never the random pool.
 async function certificate(){
  stop();unlock();if(!enabled||!context)return;
  const token=epoch,awardRoot=root();running=true;
  try{
   await rewardsReady;
   if(!enabled||token!==epoch||root()!==awardRoot||!awardRoot?.isConnected||document.hidden)return;
   if(context.state==='suspended')await context.resume();
   if(token!==epoch||!enabled)return;
   const bravo=rewards.find(r=>r.id==='bravo');
   if(bravo){lastReward=bravo.id;await source('reward',bravo.buffer,token,{id:bravo.id,label:bravo.label});}
  }catch{}finally{if(token===epoch)running=false;}
 }
 function result(ok,key,scope,target=scope,educational=true,preferredReward=null){
  suppressClick=true;
  if(!scope)return;
  let keys=seen.get(scope);if(!keys){keys=new Set();seen.set(scope,keys);}
  const repeated=ok&&keys.has(key);
  if(ok){keys.add(key);let badge=target.querySelector('.fx-reward');if(!badge){badge=document.createElement('span');badge.className='fx-reward';badge.setAttribute('aria-label','إجابة صحيحة');target.append(badge);}badge.textContent='✓';if(!repeated){badge.classList.remove('fx-pop');void badge.offsetWidth;badge.classList.add('fx-pop');}}
  if(repeated)return;
  play(ok?(educational?'success':'click'):'error',preferredReward);
 }
 // A completed tool step keeps its visual feedback and a simple interaction tone.
 function step(ok,key,scope,target=scope){result(ok,key,scope,target,false);}
 // Grade the post-test without revealing answers or adding feedback cards.
 async function assessment(correctCount){
  stop(true);unlock();if(!enabled||!context||correctCount<1)return;
  for(let i=0;i<correctCount;i++)queue.push({root:root()});
  await drain();
 }
 function batch(entries){let newCorrect=0,wrong=false;for(const {ok,key,scope} of entries){let keys=seen.get(scope);if(!keys){keys=new Set();seen.set(scope,keys);}if(ok){if(!keys.has(key))newCorrect++;keys.add(key);const badge=document.createElement('span');badge.className='fx-reward fx-pop';badge.textContent='✓';badge.setAttribute('aria-label','إجابة صحيحة');scope.append(badge);}else wrong=true;}suppressClick=true;if(newCorrect){for(let i=0;i<newCorrect;i++)play('success');}else if(wrong)play('error');}
 function reset(scope){seen.delete(scope);}
 const toggle=document.createElement('button');toggle.id='effects-toggle';toggle.type='button';
 function updateToggle(){toggle.textContent=enabled?'🔊':'🔇';toggle.setAttribute('aria-pressed',String(enabled));toggle.setAttribute('aria-label',enabled?'كتم المؤثرات الصوتية':'تشغيل المؤثرات الصوتية');toggle.title=toggle.getAttribute('aria-label');}
 toggle.onclick=()=>{enabled=!enabled;if(!enabled)stop(true);else unlock();try{localStorage.setItem('lab-effects',enabled?'on':'muted');}catch{}updateToggle();};updateToggle();document.body.append(toggle);
 document.addEventListener('click',e=>{unlock();if(e.target.closest('.teacher-audio-toggle,.welcome-toggle,.listen,.replay,.pause,.reset-experiment,#reset-lab,#rust-reset,#atoms-replay,#ammonia-reset'))stop(false);},{capture:true});document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
 document.addEventListener('click',e=>{if(e.target.closest('#effects-toggle'))return;const el=e.target.closest('button,input[type=radio],select');if(!el||el.disabled||el.hasAttribute('data-effect-silent'))return;const skip=suppressClick;suppressClick=false;if(!skip)play('click');});
 // Drag-and-drop and change/submit handlers also use result(); clear only the click suppression flag.
 document.addEventListener('pointerdown',()=>{suppressClick=false;},{capture:true});document.addEventListener('keydown',()=>{suppressClick=false;},{capture:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 return {result,step,batch,assessment,reset,play,stop,certificate};
})();
