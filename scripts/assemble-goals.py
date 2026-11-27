from pathlib import Path
import json,subprocess,hashlib
root=Path(__file__).resolve().parent.parent
scripts=json.loads((root/'phase2/scripts.json').read_text());lookup={c['id']:c for c in scripts};assets=json.loads((root/'core/narration-assets.js').read_text().split('=',1)[1].strip().rstrip(';'));ids=['bond-goal-'+str(i) for i in range(6)]
listing=Path('/tmp/p2-goals-concat.txt');listing.write_text(''.join("file '"+str(root/assets[id]['file'])+"'\n" for id in ids))
out=root/'assets/audio/phase2/bonds-page-0.mp3';subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(listing),'-c','copy',str(out)],check=True)
text=' '.join(lookup[id]['text'] for id in ids);sha=hashlib.sha256(text.encode()).hexdigest();c=lookup['bonds-page-0'];c.update(text=text,sha256=sha,characters=len(text),derived_from=ids)
duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(out)]))
assets[c['id']]=dict(file='assets/audio/phase2/bonds-page-0.mp3',text_sha256=sha,voice_id='EUojVLG1QfxaqqH4ce6s',voice_name='Razan – Academic & Cultural Narration',model='eleven_multilingual_v2',derived_from=ids,duration=duration,bytes=out.stat().st_size,sha256=hashlib.sha256(out.read_bytes()).hexdigest(),credits=0)
(root/'phase2/scripts.json').write_text(json.dumps(scripts,ensure_ascii=False,indent=2)+'\n');(root/'core/narration-assets.js').write_text('window.NarrationAssets = '+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n');print('Complete six-goal narration assembled; no synthesis credits')
