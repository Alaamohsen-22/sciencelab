/* Shared, original sound effects; teacher recordings remain independent. */
const Effects=(()=>{
 let enabled=true,context=null,ready=null,active=null,activeKind=null,activeGain=null,version=0,ducked=null,seen=new WeakMap(),suppressClick=false,pendingKind=null;
 const buffers={},priority={click:1,error:2,success:3};
 try{enabled=localStorage.getItem('lab-effects')!=='muted';}catch{}
 function restore(){if(ducked){ducked.audio.volume=ducked.volume;ducked=null;}}
 function stop(){version++;if(active){active.onended=null;try{active.stop();}catch{}active.disconnect();active=null;if(activeGain){activeGain.disconnect();activeGain=null;}}activeKind=null;pendingKind=null;restore();}
 function unlock(){
  if(!enabled)return;
  try{if(!context){context=new (window.AudioContext||window.webkitAudioContext)();ready=Promise.all(Object.keys(priority).map(async kind=>{try{const response=await fetch(`assets/sounds/${kind}.wav`);if(!response.ok)return;buffers[kind]=await context.decodeAudioData(await response.arrayBuffer());}catch{}}));}
  if(context.state==='suspended')context.resume().catch(()=>{});}catch{}
 }
 async function play(kind){
  if(!enabled||!context)return;
  if(kind==='click'&&((active&&activeKind!=='click')||(pendingKind&&pendingKind!=='click')))return;pendingKind=kind;const ticket=++version;await ready;
  if(!enabled||ticket!==version||context.state!=='running'||!buffers[kind])return;
  if(kind==='click'&&active&&activeKind!=='click')return;
  stop();const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers[kind];gain.gain.value=.65;source.connect(gain);gain.connect(context.destination);active=source;activeGain=gain;activeKind=kind;
  if(kind==='success'){const audio=[...document.querySelectorAll('audio')].find(a=>!a.paused);if(audio){ducked={audio,volume:audio.volume};audio.volume*=.3;}}
  source.onended=()=>{if(active===source){active=null;activeKind=null;activeGain=null;restore();}source.disconnect();gain.disconnect();};source.start();
  document.dispatchEvent(new CustomEvent('lab-effect',{detail:{kind}}));
 }
 function result(ok,key,scope,target=scope){
  suppressClick=true;
  if(!scope)return;
  let keys=seen.get(scope);if(!keys){keys=new Set();seen.set(scope,keys);}
  const repeated=ok&&keys.has(key);
  if(ok){keys.add(key);let badge=target.querySelector('.fx-reward');if(!badge){badge=document.createElement('span');badge.className='fx-reward';badge.setAttribute('aria-label','إجابة صحيحة');target.append(badge);}badge.textContent='✓';if(!repeated){badge.classList.remove('fx-pop');void badge.offsetWidth;badge.classList.add('fx-pop');}}
  if(repeated)return;
  play(ok?'success':'error');
 }
 function batch(entries){let anyNew=false,wrong=false;for(const {ok,key,scope} of entries){let keys=seen.get(scope);if(!keys){keys=new Set();seen.set(scope,keys);}if(ok){if(!keys.has(key))anyNew=true;keys.add(key);const badge=document.createElement('span');badge.className='fx-reward fx-pop';badge.textContent='✓';badge.setAttribute('aria-label','إجابة صحيحة');scope.append(badge);}else wrong=true;}suppressClick=true;if(anyNew)play('success');else if(wrong)play('error');}
 function reset(scope){seen.delete(scope);}
 const toggle=document.createElement('button');toggle.id='effects-toggle';toggle.type='button';
 function updateToggle(){toggle.textContent=enabled?'🔊':'🔇';toggle.setAttribute('aria-pressed',String(enabled));toggle.setAttribute('aria-label',enabled?'كتم المؤثرات الصوتية':'تشغيل المؤثرات الصوتية');toggle.title=toggle.getAttribute('aria-label');}
 toggle.onclick=()=>{enabled=!enabled;if(!enabled)stop();else unlock();try{localStorage.setItem('lab-effects',enabled?'on':'muted');}catch{}updateToggle();};updateToggle();document.body.append(toggle);
 document.addEventListener('click',unlock,{capture:true});document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
 document.addEventListener('click',e=>{if(e.target.closest('#effects-toggle'))return;const el=e.target.closest('button,input[type=radio],select');if(!el||el.disabled||el.hasAttribute('data-effect-silent'))return;const skip=suppressClick;suppressClick=false;if(!skip)play('click');});
 // Drag-and-drop and change/submit handlers also use result(); clear only the click suppression flag.
 document.addEventListener('pointerdown',()=>{suppressClick=false;},{capture:true});document.addEventListener('keydown',()=>{suppressClick=false;},{capture:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 return {result,batch,reset,play,stop};
})();
