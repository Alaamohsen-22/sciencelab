/* Short, non-blocking 3D rewards. Reduced-motion users get the same information. */
const LabRewardVisuals=(()=>{
 const phrases=['اكتشاف مذهل!','إنجاز علمي رائع!','أحسنت أيها المستكشف!','تفكير علمي متميز!','لقد أبدعت!','خطوة جديدة نحو الإتقان!'];let previous=-1,active=0,timers=new Set();
 const quiet=()=>document.body.classList.contains('phase1-reduced')||matchMedia('(prefers-reduced-motion:reduce)').matches;
 function sound(kind){if(!LabAudio.muted&&!LabAudio.speaking&&!LabAudio.channel)LabAudio.tone(kind,{channel:'achievement'});}
 function flash(message,large=false){let box=document.querySelector('.p2-reward-toast');if(!box){box=document.createElement('div');box.className='p2-reward-toast';box.setAttribute('role','status');box.setAttribute('aria-live','polite');box.dataset.phase2Ui='';document.body.append(box);}box.textContent=message;box.classList.toggle('p2-major',large);clearTimeout(box._timer);box._timer=setTimeout(()=>box.remove(),large?3500:2100);}
 function burst(x,y,large){if(quiet())return;const scene=document.createElement('div');scene.className='p2-gold-burst';scene.style.setProperty('--burst-x',x+'px');scene.style.setProperty('--burst-y',y+'px');scene.setAttribute('aria-hidden','true');for(let i=0;i<(large?24:10);i++){const p=document.createElement('i');p.style.setProperty('--angle',i*360/(large?24:10)+'deg');p.style.setProperty('--travel',(large?170:70)+Math.random()*35+'px');p.style.setProperty('--delay',Math.random()*.1+'s');scene.append(p);}document.body.append(scene);setTimeout(()=>scene.remove(),1600);}
 function medal(index=0){if(quiet())return;document.querySelector('.p2-station-medal')?.remove();const n=document.createElement('div');n.className='p2-station-medal';n.setAttribute('aria-hidden','true');n.innerHTML=LabAchievements.badgeArt(index);document.body.append(n);setTimeout(()=>n.remove(),2400);}
 function earned(d){
  let index;do{index=Math.floor(Math.random()*phrases.length);}while(index===previous);previous=index;const major=['lesson','mastery'].includes(d.kind);flash(phrases[index]+' · +'+d.value+' نجمة',major);LabGuide.react('cheer');
  const origin=d.origin?.isConnected?d.origin.getBoundingClientRect():null,x=origin?Math.min(innerWidth-35,Math.max(35,origin.left+origin.width/2)):innerWidth/2,y=origin?Math.max(100,Math.min(innerHeight-80,origin.top+origin.height/2)):innerHeight*.6;
  burst(x,y,major);const beforeLevel=LabAchievements.LEVELS.findLastIndex(l=>d.before>=l[0]),afterLevel=LabAchievements.LEVELS.findLastIndex(l=>d.total>=l[0]);if(afterLevel>beforeLevel){medal(afterLevel);flash('مستوى جديد · '+LabAchievements.LEVELS[afterLevel][1],true);}else if(major)medal(d.kind==='mastery'?5:4);const counter=document.querySelector('.p2-count');
  if(quiet()||active>=3){counter?.animate([{transform:'scale(1)'},{transform:'scale(1.14)'},{transform:'scale(1)'}],{duration:quiet()?0:350});return;}
  active++;const star=document.createElement('div');star.className='p2-flying-star';star.setAttribute('aria-hidden','true');star.innerHTML='<span>★</span><b>+'+d.value+'</b>';star.style.left=x+'px';star.style.top=y+'px';document.body.append(star);
  const target=counter?.getBoundingClientRect(),tx=target?target.left+target.width/2-x:0,ty=target?target.top+target.height/2-y:-y+35;
  const motion=star.animate([{transform:'translate(-50%,-50%) perspective(600px) translateZ(0) rotateY(0) scale(.3)',opacity:0},{transform:'translate(-50%,-50%) perspective(600px) translateZ(180px) rotateY(180deg) scale(1.4)',opacity:1,offset:.32},{transform:`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) perspective(600px) translateZ(0) rotateY(360deg) scale(.22)`,opacity:.9}],{duration:1250,easing:'cubic-bezier(.2,.7,.25,1)',fill:'forwards'});
  motion.onfinish=()=>{star.remove();active--;document.querySelector('.p2-count')?.animate([{transform:'scale(1)'},{transform:'scale(1.22)'},{transform:'scale(1)'}],{duration:320});sound(major?'medal':'star');document.dispatchEvent(new CustomEvent('lab-star-arrived',{detail:{value:d.value,total:d.total}}));};
 }
 document.addEventListener('lab-reward-earned',e=>earned(e.detail));
 document.addEventListener('lab-station-earned',()=>{medal(2);flash('وسام المحطة · إنجاز علمي رائع!',true);burst(innerWidth/2,innerHeight*.35,true);sound('medal');});
 document.addEventListener('click',e=>{if(e.target.closest('[data-lesson]'))sound('gate');},{capture:true});
 return {flash};
})();
