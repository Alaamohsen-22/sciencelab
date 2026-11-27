/* One visible recovery/mute action; no recordings or narration are replaced. */
(()=>{
 let queued=false;
 function refresh(){const host=document.querySelector('.topbar')||document.querySelector('.cover');if(!host)return;let b=host.querySelector('[data-audio-access]');if(!b){b=document.createElement('button');b.type='button';b.className='secondary';b.dataset.audioAccess='';b.dataset.effectSilent='';b.dataset.phase2Ui='';b.onclick=()=>{const off=LabAudio.muted||LabAudio.effectsMuted||LabAudio.volume===0;if(off){LabAudio.listen();LabAudio.setEffectsMuted(false);Effects.play('click');}else LabAudio.setMuted(true);refresh();};host.append(b);}const off=LabAudio.muted||LabAudio.effectsMuted||LabAudio.volume===0;const label=off?'🔊 تشغيل الصوت':'🔊 كتم الصوت';if(b.textContent!==label)b.textContent=label;b.setAttribute('aria-pressed',String(!off));}
 document.addEventListener('lab-audio-settings',refresh);document.addEventListener('lab-effects-state',refresh);new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh();});}).observe(document.querySelector('#app'),{childList:true,subtree:true});refresh();
})();
