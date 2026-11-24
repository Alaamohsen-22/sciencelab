/* Compatibility API backed by the shared exclusive audio bus. */
const BondAudio=(()=>{
 const specs={appear:[300,420,.22,'sine'],highlight:[540,600,.25,'sine'],transfer:[240,650,1.15,'sine'],receive:[650,440,.18,'sine'],ion:[400,560,.28,'triangle'],approach:[260,400,.65,'sine'],share:[420,570,.32,'sine'],'single-bond':[330,495,.3,'triangle'],'double-bond':[392,588,.42,'triangle'],'ionic-bond':[294,440,.42,'triangle'],molecule:[330,660,.55,'sine'],error:[220,196,.22,'sine']};
 function play(kind,options={}){const [from,to,duration,wave]=specs[kind]||specs.share;const played=LabAudio.tone(kind==='transfer'?'transfer':kind==='share'?'share':kind.includes('bond')?'bond':'paper',{channel:'bonds',from,to,wave,duration:options.duration||duration,progress:options.progress||0});if(played)document.dispatchEvent(new CustomEvent('bond-sound',{detail:{kind,duration:options.duration||duration,progress:options.progress||0}}));}
 return {play,stop:()=>LabAudio.stop('bonds'),unlock:()=>LabAudio.unlock(),toggle:()=>LabAudio.toggle(),get muted(){return LabAudio.muted;}};
})();
