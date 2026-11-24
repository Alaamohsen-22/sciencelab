/* Pointer fallback for browsers that omit native dragstart/drop. No action outside its own lab. */
(()=>{
 let drag=null;
 const sourceSelector='[draggable="true"][data-material],[draggable="true"][data-electron-token],[draggable="true"][data-formula],[draggable="true"][data-drag-action],[draggable="true"][data-action]';
 const zoneSelector='.flask-drop,[data-drop-zone],[data-receiver],[data-share-zone],[data-slot]';
 const owner=n=>n?.closest('.cp-lab,.bond-practice,.ammonia-card,.lab-workbench,[data-learning-lab]');
 function reset(){drag?.source.classList.remove('pointer-dragging');drag=null;}
 function dropAt(x,y){if(!drag||drag.dropped||!drag.source.isConnected||drag.source.disabled)return;const zone=document.elementFromPoint(x,y)?.closest(zoneSelector);if(!zone||!owner(drag.source)||owner(zone)!==owner(drag.source))return;drag.dropped=true;const s=drag.source,action=s.dataset.dragAction||s.dataset.action,data=action?(s.closest('[data-lab]')?s.closest('[data-lab]').dataset.lab+':':'')+action:s.dataset.material||s.dataset.electronToken||s.dataset.formula;
  const event=new Event('drop',{bubbles:true,cancelable:true});Object.defineProperty(event,'dataTransfer',{value:{getData:type=>type==='text/plain'?data:'',dropEffect:'copy',effectAllowed:'copy'}});zone.dispatchEvent(event);
 }
 document.addEventListener('pointerdown',e=>{const source=e.target.closest(sourceSelector);if(source&&!source.disabled)drag={source,x:e.clientX,y:e.clientY,start:performance.now(),pointer:e.pointerType,moved:false,native:false,dropped:false};},{capture:true});
 document.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>12&&(drag.pointer!=='touch'||performance.now()-drag.start>250)){if(!drag.moved)LabAudio.tone('pickup');drag.moved=true;drag.source.classList.add('pointer-dragging');}},{capture:true,passive:true});
 document.addEventListener('pointerup',e=>{if(!drag)return;if(!drag.native&&drag.moved)dropAt(e.clientX,e.clientY);if(!drag.native)reset();},{capture:true});
 document.addEventListener('pointercancel',()=>{if(drag&&!drag.native)reset();},{capture:true});
 document.addEventListener('dragstart',e=>{if(!drag||!e.target.closest(sourceSelector))return;drag.native=true;drag.moved=true;LabAudio.tone('pickup');},{capture:true});
 document.addEventListener('drop',e=>{if(drag&&e.target.closest(zoneSelector))drag.dropped=true;},{capture:true});
 document.addEventListener('dragend',e=>{if(drag&&!drag.dropped)dropAt(e.clientX,e.clientY);reset();},{capture:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
})();
