/* Educational sound design; these tones do not represent sounds of real ions. */
const CompoundSound=(()=>{
 let ctx,source,gain,muted=false,volume=.45,voice=null;
 try{muted=localStorage.getItem('compound-muted')==='yes';volume=+(localStorage.getItem('compound-volume')||.45);}catch{}
 const specs={drop:[780,360,.22],paper:[390,570,.35],wire:[220,360,.16],current:[240,480,.6],bubble:[240,700,.18],pop:[140,55,.13],ion:[360,650,.5],crystal:[660,990,.45],flame:[150,210,.45],error:[210,180,.2]};
 function enabled(){return !muted&&document.querySelector('#effects-toggle')?.getAttribute('aria-pressed')!=='false';}
 function stop(){try{source?.stop();source?.disconnect();gain?.disconnect();}catch{}source=null;window.speechSynthesis?.cancel();}
 function play(kind){stop();Effects.stop(false);if(!enabled())return;try{ctx??=new(window.AudioContext||window.webkitAudioContext)();ctx.resume().catch(()=>{});const [a,b,d]=specs[kind]||specs.drop,t=ctx.currentTime;source=ctx.createOscillator();gain=ctx.createGain();source.type=kind==='pop'?'triangle':'sine';source.frequency.setValueAtTime(a,t);source.frequency.exponentialRampToValueAtTime(b,t+d);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.15*volume,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+d);source.connect(gain);gain.connect(ctx.destination);source.start(t);source.stop(t+d+.02);document.dispatchEvent(new CustomEvent('compound-sound',{detail:{kind,duration:d}}));}catch{}}
 function findVoice(){voice=window.speechSynthesis?.getVoices().find(v=>/^ar/i.test(v.lang)&&/Salma|Hoda|Zariyah|Amira|Amina|Laila|Zeina|Fatima|Shakir.*female|أنثى/i.test(v.name))||null;return voice;}
 function narrate(text){stop();Effects.stop(false);if(!enabled()||!findVoice())return false;const u=new SpeechSynthesisUtterance(text);u.voice=voice;u.lang=voice.lang;u.rate=.92;u.volume=volume;speechSynthesis.speak(u);return true;}
 function toggle(){muted=!muted;stop();Effects.stop(false);try{localStorage.setItem('compound-muted',muted?'yes':'no');}catch{}return muted;}
 function setVolume(v){volume=Math.min(1,Math.max(0,+v));stop();try{localStorage.setItem('compound-volume',volume);}catch{}}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});document.addEventListener('click',e=>{if(e.target.closest('#effects-toggle')&&!enabled())stop();});
 return {play,stop,narrate,findVoice,toggle,setVolume,enabled,get muted(){return muted;},get volume(){return volume;}};
})();
