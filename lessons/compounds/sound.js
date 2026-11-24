/* Compatibility API: all scientific cues and narration use the shared bus. */
const CompoundSound=(()=>{
 const aliases={flame:'ignite',ion:'share'};
 function play(kind){const played=LabAudio.tone(aliases[kind]||kind,{channel:'compounds'});if(played)document.dispatchEvent(new CustomEvent('compound-sound',{detail:{kind}}));}
 return {play,stop:()=>LabAudio.stop('compounds'),narrate:t=>LabGuide.speak(t),findVoice:()=>LabAudio.voice(),toggle:()=>LabAudio.toggle(),setVolume:v=>LabAudio.setVolume(v),enabled:()=>!LabAudio.muted,get muted(){return LabAudio.muted;},get volume(){return LabAudio.volume;}};
})();
