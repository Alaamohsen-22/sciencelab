/* Original, programmatically generated educational cues. No recorded speech is synthesized. */
const BondAudio=(()=>{
 let context=null,muted=false,nodes=[],epoch=0;
 try{muted=localStorage.getItem('bond-sound')==='off';}catch{}
 const specs={appear:[300,420,.22,'sine'],highlight:[540,600,.25,'sine'],transfer:[240,650,1.15,'sine'],receive:[650,440,.18,'sine'],ion:[400,560,.28,'triangle'],approach:[260,400,.65,'sine'],share:[420,570,.32,'sine'],'single-bond':[330,495,.3,'triangle'],'double-bond':[392,588,.42,'triangle'],'ionic-bond':[294,440,.42,'triangle'],molecule:[330,660,.55,'sine'],error:[220,196,.22,'sine']};
 function enabled(){return !muted&&document.querySelector('#effects-toggle')?.getAttribute('aria-pressed')!=='false';}
 function stop(){epoch++;for(const {osc,gain}of nodes){try{osc.stop();}catch{}osc.disconnect();gain.disconnect();}nodes=[];}
 function unlock(){if(!enabled())return;try{context??=new(window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume().catch(()=>{});}catch{}}
 function play(kind,options={}){
  stop();if(!enabled())return;unlock();if(!context)return;
  const token=epoch,spec=specs[kind]||specs.share;
  const start=()=>{if(token!==epoch||!enabled()||context.state!=='running')return;
   const [from,to,length,type]=spec,duration=Math.max(.05,Math.min(options.duration??length,length)),progress=options.progress||0;
   const osc=context.createOscillator(),gain=context.createGain(),t=context.currentTime;
   osc.type=type;osc.frequency.setValueAtTime(from+(to-from)*progress,t);osc.frequency.exponentialRampToValueAtTime(to,t+duration);
   gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.065,t+.025);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain);gain.connect(context.destination);nodes.push({osc,gain});osc.start(t);osc.stop(t+duration+.025);
   document.dispatchEvent(new CustomEvent('bond-sound',{detail:{kind,duration,progress}}));
  };
  if(context.state==='running')start();else context.resume().then(start).catch(()=>{});
 }
 function toggle(){muted=!muted;stop();try{localStorage.setItem('bond-sound',muted?'off':'on');}catch{}if(!muted)unlock();return muted;}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 document.addEventListener('click',e=>{if(e.target.closest('#effects-toggle')&&!enabled())stop();});
 return {play,stop,unlock,toggle,get muted(){return muted;}};
})();
