"""Reuse two complete encouragement phrases from the approved Razan certificate take.
No voice synthesis, cloning, paid requests or changes to original recordings.
"""
from pathlib import Path
import json,hashlib,subprocess
root=Path(__file__).resolve().parent.parent
scripts=json.loads((root/'phase2/scripts.json').read_text());assets=json.loads((root/'core/narration-assets.js').read_text().split('=',1)[1].strip().rstrip(';'))
source=Path('/tmp/p2-batch-final.mp3')
for id,text,start,end in [('reward-explorer','أحسنت أيها المستكشف!',99.76,102.0),('reward-observer','هذه ثمرة ملاحظتك.',105.0,107.18)]:
 out=root/'assets/audio/phase2'/f'{id}.mp3'
 subprocess.run(['ffmpeg','-v','error','-y','-ss',str(start),'-i',str(source),'-t',str(end-start),'-af','loudnorm=I=-17:TP=-1.5:LRA=9,afade=t=out:st=2.08:d=0.07','-ac','1','-ar','44100','-c:a','libmp3lame','-b:a','64k',str(out)],check=True)
 sha=hashlib.sha256(text.encode()).hexdigest()
 if not any(c['id']==id for c in scripts):scripts.append(dict(id=id,text=text,priority=6,lesson='shared',page=None,kind='reward',selector='',gate='graded',characters=len(text),sha256=sha))
 assets[id]=dict(file='assets/audio/phase2/'+id+'.mp3',text_sha256=sha,voice_id='EUojVLG1QfxaqqH4ce6s',voice_name='Razan – Academic & Cultural Narration',model='eleven_multilingual_v2',derived_from='batch-final',source_start=start,source_end=end,duration=round(end-start,3),bytes=out.stat().st_size,sha256=hashlib.sha256(out.read_bytes()).hexdigest(),credits=0)
(root/'phase2/scripts.json').write_text(json.dumps(scripts,ensure_ascii=False,indent=2)+'\n')
(root/'core/narration-assets.js').write_text('window.NarrationAssets = '+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n')
(root/'core/reward-pool.js').write_text("window.RazanRewardPool = [\n {id:'excellent',label:'أحسنت أيها المستكشف!',sourceFile:'assets/audio/phase2/reward-explorer.mp3'},\n {id:'wonderful',label:'هذه ثمرة ملاحظتك.',sourceFile:'assets/audio/phase2/reward-observer.mp3'},\n {id:'bravo',label:'تهنئة شهادة الإنجاز',sourceFile:'assets/audio/phase2/shared-certificate.mp3',certificateOnly:true}\n];\n")
print('Two real encouragement clips reused; zero additional credits')
