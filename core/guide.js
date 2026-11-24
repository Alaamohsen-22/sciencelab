const LabGuide=(()=>{
 const art=()=>`<div class="lab-guide-art"><img data-guide-main src="assets/welcome-teacher.png" alt="المعلمة المرشدة بحجاب الكوفية الفلسطينية" width="1122" height="1402"><img class="guide-mouth" src="assets/welcome-teacher.png" alt="" aria-hidden="true" width="1122" height="1402"></div>`;

 let enabled=false,container=null,text='',lastContext='',timer=null,announcement=null;
 try{enabled=localStorage.getItem('lab-guide-enabled')==='yes';}catch{}
 function react(expression,message){clearTimeout(announcement);if(!container?.isConnected)return;container.dataset.expression=expression;if(message){text=message;} }
 function status(message){const button=container?.querySelector('[data-guide-listen]');if(button)button.title=message;}
 function speak(message=text){LabAudio.unlock();text=message;react('explain',message);if(!LabAudio.say(message)){status(LabAudio.muted||LabAudio.volume===0?'الصوت مكتوم وفق الإعداد المحفوظ.':'لا يتوفر صوت عربي مناسب على هذا الجهاز؛ تسجيلات المعلمة الأصلية متاحة في مواضعها.');return false;}status('استمع إلى شرح المعلمة');return true;}
 function mount(host,message){clearTimeout(announcement);container=host;host.className='lab-guide';host.dataset.expression='welcome';host.innerHTML=art();text=message;host.classList.toggle('is-speaking',LabAudio.speaking);const recording=document.querySelector('#content > .slide-audio');if(recording){host.append(recording);}else{const button=document.createElement('button');button.type='button';button.dataset.guideListen='';button.dataset.effectSilent='';button.className='welcome-toggle';button.textContent='استمع إلى شرح المعلمة';button.onclick=()=>speak(text);host.append(button);}

 if(enabled&&LabAudio.unlocked&&!LabAudio.speaking&&message!==lastContext)speak(message);lastContext=message;
 }
 document.addEventListener('lab-voice-error',()=>status('تعذر تشغيل صوت الجهاز؛ اضغط للمحاولة مجددًا.'));document.addEventListener('lab-audio-state',e=>{clearTimeout(timer);if(!container?.isConnected)return;container.classList.toggle('is-speaking',e.detail.speaking);if(e.detail.expression)container.dataset.expression=e.detail.expression;if(e.detail.duration)timer=setTimeout(()=>container?.classList.remove('is-speaking'),e.detail.duration*1000);});
 function announce(message,host){if(!enabled)return;clearTimeout(announcement);const attempt=()=>{if(!host.isConnected||host.hidden||document.hidden)return;if(LabAudio.speaking){announcement=setTimeout(attempt,250);return;}speak(message);};announcement=setTimeout(attempt,750);}
 return {art,mount,speak,react,announce,get text(){return text;}};
})();
