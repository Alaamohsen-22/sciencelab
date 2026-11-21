const BondDiagram=(()=>{
 const point=(x,y,r,a)=>[x+r*Math.cos(a),y+r*Math.sin(a)];
 const mix=(a,b,t)=>a+(b-a)*t;
 const dot=(id,x,y,origin,glow=false)=>`<circle class="bond-electron ${glow?'bond-electron-lit':''}" data-electron="${id}" data-origin="${origin}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="5.5" fill="${origin==='Li'||origin==='Mg'||origin==='C'||origin==='A'?'#a26acb':'#2699af'}"/>`;
 function nucleus(id,label,x,y,rings){return `<g data-atom="${id}">${rings.map(r=>`<circle cx="${x}" cy="${y}" r="${r}" class="bond-shell"/>`).join('')}<circle cx="${x}" cy="${y}" r="23" class="bond-nucleus"/><text class="bond-symbol" x="${x}" y="${y+8}" text-anchor="middle" direction="ltr">${label}</text></g>`;}
 function svg(content,summary,extra=''){return `<svg class="bond-diagram" viewBox="0 0 700 450" role="img" aria-label="${summary}" ${extra}><title>${summary}</title>${content}</svg>`;}
 function ionic(m,stage,p,manual){
  const mg=m.id==='mgcl2',donor={id:m.donor,x:mg?350:175,y:205,rings:mg?[26,51,83]:[35,80],config:m.atoms[0][1]},receivers=mg?[{id:'Cl1',x:580,y:205,rings:[26,51,83],config:[2,8,7],symbol:'Cl'},{id:'Cl2',x:120,y:205,rings:[26,51,83],config:[2,8,7],symbol:'Cl'}]:[{id:'F',x:490,y:205,rings:[35,80],config:[2,7],symbol:'F'}];
  const transfers=new Set(manual?.transfers||[]),moving=manual?null:(stage>=2&&stage<2+m.targets.length?stage-2:null),ions=manual?transfers.size>0:stage>=2+m.targets.length,final=manual?!!manual.complete:stage===m.stages.length-1;
  if(!manual)for(let i=0;i<m.targets.length;i++)if(stage>2+i)transfers.add(m.targets[i]);
  let out='';
  if(final){out+=`<g class="bond-attraction" aria-label="تجاذب كهربائي">${receivers.map(r=>`<path d="M${Math.min(donor.x,r.x)+88} 205H${Math.max(donor.x,r.x)-88}"/><text x="${(donor.x+r.x)/2}" y="330" text-anchor="middle">تجاذب</text>`).join('')}</g>`;}
  const donated=transfers.size;
  out+=nucleus(donor.id,donor.id+(ions&&donated?(donated===2?'²⁺':'⁺'):''),donor.x,donor.y,ions&&donated===m.targets.length?donor.rings.slice(0,-1):donor.rings);
  donor.config.forEach((n,shell)=>{for(let j=0;j<n;j++){
   const outer=shell===donor.config.length-1,a=outer?(j*Math.PI):(-Math.PI/2+j*2*Math.PI/n),pos=point(donor.x,donor.y,donor.rings[shell],a);
   if(outer&&(transfers.has(m.targets[j])||moving===j))continue;
   out+=dot(`${donor.id}-${shell}-${j}`,...pos,donor.id,outer&&stage===1);
  }});
  for(const r of receivers){
   const accepted=transfers.has(r.id);out+=nucleus(r.id,r.symbol+(ions&&accepted?'⁻':''),r.x,r.y,r.rings);
   r.config.forEach((n,shell)=>{const outer=shell===r.config.length-1;for(let j=0;j<n;j++){const a=-Math.PI/2+j*2*Math.PI/(outer?8:n);out+=dot(`${r.id}-${shell}-${j}`,...point(r.x,r.y,r.rings[shell],a),r.id);}});
   if(accepted){const j=m.targets.indexOf(r.id);out+=dot(`${donor.id}-${donor.config.length-1}-${j}`,...point(r.x,r.y,r.rings.at(-1),-Math.PI/2+7*Math.PI/4),donor.id);}
   out+=`<text x="${r.x}" y="${r.y+121}" text-anchor="middle" class="bond-count" direction="ltr">${r.symbol}: ${accepted?r.config.map((n,i)=>i===r.config.length-1?n+1:n).join(', '):r.config.join(', ')}</text>`;
  }
  if(moving!==null){const r=receivers[moving],start=point(donor.x,donor.y,donor.rings.at(-1),moving*Math.PI),end=point(r.x,r.y,r.rings.at(-1),-Math.PI/2+7*Math.PI/4),t=matchMedia('(prefers-reduced-motion: reduce)').matches?(p<.5?0:1):Math.min(1,p/.75);
   const x=mix(start[0],end[0],t),y=mix(start[1],end[1],t)-55*Math.sin(t*Math.PI);
   out+=`<path class="bond-flight-path" d="M${start[0]} ${start[1]}Q${(start[0]+end[0])/2} ${Math.min(start[1],end[1])-100} ${end[0]} ${end[1]}"/>`+dot(`${donor.id}-${donor.config.length-1}-${moving}`,x,y,donor.id,true);
  }
  const dc=donor.config.slice();dc[dc.length-1]-=donated;if(dc.at(-1)===0)dc.pop();
  out+=`<text x="${donor.x}" y="${donor.y+121}" text-anchor="middle" class="bond-count" direction="ltr">${donor.id}: ${dc.join(', ')}</text>`;
  if(final)out+=`<text data-final-formula x="350" y="408" class="bond-formula" direction="ltr" text-anchor="middle">${m.formula}</text>`;
  return svg(out,`${m.formula} — نموذج انتقال الإلكترونات وتكوّن الأيونات`, `data-transferred="${transfers.size}" data-final="${final}"`);
 }
 function covalent(m,stage,p,manual){
  const methane=m.id==='ch4',oxygen=m.id==='o2',r=oxygen?77:methane?69:63;
  let near=manual?(manual.pairs>0||manual.complete?1:0):(methane?(stage>2?1:stage===2?p:0):(stage>1?1:stage===1?p:0));
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)near=near<.5?0:1;
  const atoms=methane?[{id:'C',symbol:'C',x:350,y:220,r},{id:'H1',symbol:'H',x:350,y:mix(65,104,near),r:52},{id:'H2',symbol:'H',x:mix(565,466,near),y:220,r:52},{id:'H3',symbol:'H',x:350,y:mix(375,336,near),r:52},{id:'H4',symbol:'H',x:mix(135,234,near),y:220,r:52}]:[{id:'A',symbol:oxygen?'O':'H',x:mix(185,oxygen?285:295,near),y:210,r},{id:'B',symbol:oxygen?'O':'H',x:mix(515,oxygen?415:405,near),y:210,r}];
  let pairs=manual?.pairs||0,movingPair=null,progress=p;
  if(!manual){const start=methane?3:2;if(stage>=start&&stage<start+m.pairs){pairs=stage-start;movingPair=pairs;}else if(stage>=start+m.pairs)pairs=m.pairs;}
  const final=manual?!!manual.complete:stage===m.stages.length-1;
  // Final bond strokes remain behind the conserved electron dots.
  let out='';
  const sharedPositions=i=>{if(methane){const h=atoms[i+1],angle=Math.atan2(h.y-220,h.x-350),ca=point(350,220,69,angle),hb=point(h.x,h.y,h.r,angle+Math.PI),cx=(ca[0]+hb[0])/2,cy=(ca[1]+hb[1])/2;return h.x===350?[[cx-7,cy],[cx+7,cy]]:[[cx,cy-7],[cx,cy+7]];}return [[343,oxygen?196+i*26:210],[357,oxygen?196+i*26:210]];};
  if(final||pairs>0||movingPair!==null&&p>=.75){const visible=final?m.pairs:pairs+(movingPair!==null&&p>=.75?1:0);if(methane)out+=atoms.slice(1,1+visible).map(h=>`<line class="bond-covalent-line" x1="350" y1="220" x2="${h.x}" y2="${h.y}"/>`).join('');else for(let i=0;i<visible;i++)out+=`<line class="bond-covalent-line" x1="${atoms[0].x}" x2="${atoms[1].x}" y1="${oxygen?202+i*16:210}" y2="${oxygen?202+i*16:210}"/>`;}
  for(const a of atoms){out+=nucleus(a.id,a.symbol,a.x,a.y,a.symbol==='C'||a.symbol==='O'?[23,a.r]:[a.r]);if(a.symbol==='C'||a.symbol==='O')for(let j=0;j<2;j++)out+=dot(`${a.id}-inner-${j}`,...point(a.x,a.y,23,Math.PI/2+j*Math.PI),a.id);}
  if(oxygen){for(const a of atoms){const side=a.id==='A'?-1:1;const lone=[[a.x+side*66,a.y-10],[a.x+side*66,a.y+10],[a.x-10,a.y-66],[a.x+10,a.y-66]];lone.forEach((xy,j)=>out+=dot(`${a.id}-lone-${j}`,...xy,a.id));}}
  for(let i=0;i<m.pairs;i++){
   const a=atoms[0],b=methane?atoms[i+1]:atoms[1];
   let starts;if(methane){const angle=Math.atan2(b.y-a.y,b.x-a.x);starts=[point(a.x,a.y,a.r,angle),point(b.x,b.y,b.r,angle+Math.PI)];}else starts=[[a.x+a.r,oxygen?a.y-13+i*26:a.y],[b.x-b.r,oxygen?b.y-13+i*26:b.y]];
   const ends=sharedPositions(i),moving=movingPair===i,done=i<pairs,amount=done?1:moving?(matchMedia('(prefers-reduced-motion: reduce)').matches?(progress<.5?0:1):Math.min(progress/.75,1)):0;
   for(let j=0;j<2;j++)out+=dot(`${j===0?a.id:b.id}-share-${i}`,mix(starts[j][0],ends[j][0],amount),mix(starts[j][1],ends[j][1],amount),j===0?a.id:b.id,moving||stage===1&&methane);
  }
  if(final)out+=`<text data-final-formula x="350" y="435" class="bond-formula" text-anchor="middle" direction="ltr">${methane?'CH₄':oxygen?'O=O':'H–H'}</text>`;
  return svg(out,`${m.formula} — مشاركة ${m.pairs} من الأزواج الإلكترونية`, `data-pairs="${pairs}" data-final="${final}"`);
 }
 return {render(m,stage=0,p=0,manual=null){return m.type==='ionic'?ionic(m,stage,p,manual):covalent(m,stage,p,manual);}};
})();
