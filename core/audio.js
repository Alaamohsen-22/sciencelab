/* One exclusive audio bus for recordings, feedback, speech and scientific events. */
const LabAudio=(()=>{
 let ctx,master,current=null,revision=0,unlocked=false,volume=.55,muted=false;const gains=new Map();
 try{volume=+(localStorage.getItem('lab-volume')||.55);muted=localStorage.getItem('lab-effects')==='muted';}catch{}
 let speaking=false,voiceEnd=null;const emit=(type,detail={})=>{if(type==='lab-audio-state'){speaking=!!detail.speaking;clearTimeout(voiceEnd);if(detail.duration)voiceEnd=setTimeout(()=>emit('lab-audio-state',{speaking:false}),detail.duration*1000);}document.dispatchEvent(new CustomEvent(type,{detail}));};
 function stop(channel){if(channel&&current?.channel!==channel)return;const old=current;current=null;revision++;old?.stop();emit('lab-audio-state',{speaking:false});}
 function claim(channel,halt){if(muted)return false;if(current?.channel!==channel)stop();current={channel,stop:halt};return true;}
 function release(channel){if(current?.channel===channel){current=null;emit('lab-audio-state',{speaking:false});}}
 function unlock(){unlocked=true;try{ctx??=new(window.AudioContext||window.webkitAudioContext)();if(!master){master=ctx.createGain();master.connect(ctx.destination);}master.gain.value=muted?0:volume;if(ctx.state==='suspended')ctx.resume().catch(()=>{});}catch{} }
 function register(gain,base){gains.set(gain,base);gain.gain.value=muted?0:base*volume;}
 function unregister(gain){gains.delete(gain);}
 function setVolume(v){volume=Math.max(0,Math.min(1,+v));if(volume===0)stop();if(master)master.gain.value=muted?0:volume;for(const [g,b]of gains)g.gain.value=muted?0:volume*b;document.querySelectorAll('audio').forEach(a=>a.volume=muted?0:volume);try{localStorage.setItem('lab-volume',volume);}catch{}emit('lab-audio-settings');}
 function setMuted(value){muted=!!value;if(muted)stop();setVolume(volume);emit('lab-audio-settings');}
 function toggle(){const t=document.querySelector('#effects-toggle');if(t)t.click();else setMuted(!muted);return muted;}
 const profiles={pickup:[480,670,.12,'triangle'],glass:[1200,900,.18,'sine'],pour:[350,190,.65,'noise'],drop:[900,400,.2,'sine'],stir:[170,310,.7,'noise'],bubble:[240,680,.6,'bubbles'],pop:[150,50,.13,'noise'],wire:[180,330,.15,'triangle'],current:[140,210,.45,'sine'],ignite:[180,430,.45,'noise'],boil:[180,410,1,'bubbles'],crystal:[690,1050,.55,'triangle'],paper:[420,590,.35,'sine'],complete:[440,660,.5,'triangle'],transfer:[230,690,1.125,'sine'],share:[420,570,.32,'sine'],bond:[330,495,.3,'triangle'],error:[200,170,.2,'sine']};
 function tone(kind,{channel='science',duration,from,to,wave,progress=0}={}){
  if(!unlocked||muted||volume===0)return;unlock();if(!ctx||ctx.state!=='running')return;const p=profiles[kind]||profiles.pickup,[a,b,d,type]=p,len=Math.max(.05,duration||d),start=ctx.currentTime,nodes=[];let token;
  stop(channel);const halt=()=>{nodes.forEach(n=>{try{n.stop?.();n.disconnect();}catch{}});};if(!claim(channel,halt))return;token=++revision;
  const gain=ctx.createGain();gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.16,start+.015);gain.gain.exponentialRampToValueAtTime(.001,start+len);gain.connect(master);nodes.push(gain);
  const shape=wave||type;
  if(shape==='noise'||shape==='bubbles'){
   const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*len),ctx.sampleRate),data=buffer.getChannelData(0);let smooth=0;for(let i=0;i<data.length;i++){smooth=(smooth+(Math.random()*2-1)*.22)/1.18;const pulse=shape==='bubbles'?Math.pow(Math.max(0,Math.sin(i/ctx.sampleRate*35)),9):1;data[i]=smooth*pulse;}
   const n=ctx.createBufferSource(),filter=ctx.createBiquadFilter();n.buffer=buffer;filter.type='bandpass';filter.Q.value=kind==='glass'?6:.8;filter.frequency.setValueAtTime(from||a,start);filter.frequency.exponentialRampToValueAtTime(to||b,start+len);n.connect(filter);filter.connect(gain);nodes.push(n,filter);n.start(start);n.stop(start+len);n.onended=()=>{halt();if(token===revision)current=null;};
  }else{const n=ctx.createOscillator();n.type=shape;const f=from||a;n.frequency.setValueAtTime(f+((to||b)-f)*progress,start);n.frequency.exponentialRampToValueAtTime(to||b,start+len);n.connect(gain);nodes.push(n);n.start(start);n.stop(start+len);n.onended=()=>{halt();if(token===revision)current=null;};}
  emit('lab-science-sound',{kind,channel,duration:len});return true;
 }
 let voiceName='';try{voiceName=localStorage.getItem('lab-voice')||'';}catch{}
 function voice(){const voices=window.speechSynthesis?.getVoices()||[],ar=voices.filter(v=>/^ar/i.test(v.lang));const v=ar.find(v=>v.name===voiceName)||ar.find(v=>/Salma|Hoda|Zariyah|Amira|Amina|Laila|Zeina|Fatima|أنثى/i.test(v.name));if(v){voiceName=v.name;try{localStorage.setItem('lab-voice',voiceName);}catch{}}return v||null;}
 function say(text){if(!unlocked||muted||volume===0||!voice()||!text)return false;stop('guide');const u=new SpeechSynthesisUtterance(text);u.voice=voice();u.lang=u.voice.lang;u.rate=.92;u.volume=volume;const halt=()=>speechSynthesis.cancel();if(!claim('guide',halt))return false;u.onstart=()=>emit('lab-audio-state',{speaking:true});u.onboundary=()=>emit('lab-voice-boundary');u.onend=u.onerror=()=>{if(current?.channel==='guide')current=null;emit('lab-audio-state',{speaking:false});};speechSynthesis.speak(u);return true;}
 document.addEventListener('pointerdown',unlock,{capture:true,once:true});document.addEventListener('keydown',unlock,{capture:true,once:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 document.addEventListener('play',e=>{if(e.target.tagName!=='AUDIO')return;const a=e.target;a.volume=muted?0:volume;if(muted){a.pause();return;}claim('recording',()=>a.pause());emit('lab-audio-state',{speaking:true});},{capture:true});for(const event of ['pause','ended','error'])document.addEventListener(event,e=>{if(e.target.tagName==='AUDIO')emit('lab-audio-state',{speaking:false});},{capture:true});
 document.addEventListener('lab-effect',e=>{if(e.detail.kind==='reward')emit('lab-audio-state',{speaking:true,duration:e.detail.duration||2,expression:'cheer'});});
 return {stop,claim,release,unlock,register,unregister,setVolume,setMuted,toggle,tone,say,voice,get speaking(){return speaking;},get channel(){return current?.channel||null;},get volume(){return volume;},get muted(){return muted;},get unlocked(){return unlocked;}};
})();
