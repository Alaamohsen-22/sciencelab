from pathlib import Path
import json,subprocess,hashlib
root=Path(__file__).resolve().parent.parent
scripts=json.loads((root/'phase2/scripts.json').read_text());assets=json.loads((root/'core/narration-assets.js').read_text().split('=',1)[1].strip().rstrip(';'))
id='reaction-result-cabbage';old=assets[id];c=next(c for c in scripts if c['id']==id)
# Spoken chemical-name normalization duplicated a formula label in this take.
# Keep the scientific explanation and the tea example, remove the redundant phrase only.
text=c['text'].replace(' صيغة بيكربونات الصوديوم بيكربونات الصوديوم.','')
if text!=c['text']:
 cues=old['cues'];start=87.003
 # First cue offset reveals this clip's exact position in the batch.
 raw=json.loads(Path('/tmp/p2-batch-final.words.json').read_text());words=raw.get('words',raw) if isinstance(raw,dict) else raw
 # Clip boundaries are reproduced from the neighboring word midpoint.
 first=next(i for i,w in enumerate(words) if w.get('type','word')=='word' and w.get('text')=='كاشف' and 87<w['start']<88)
 # Actual original clip start is the midpoint before the leading bridge sentence.
 # Read start from the source split's first word/cue: the bridge begins at the last 'لنربط' before 88s.
 ix=max(i for i,w in enumerate(words) if w.get('text','').strip('،.')=='لنربط' and w['start']<88)
 prev=max(i for i in range(ix) if words[i].get('type','word')=='word')
 start=(words[prev]['end']+words[ix]['start'])/2
 end=(99.556+99.858)/2
 out=root/old['file'];tmp=Path('/tmp/p2-cabbage-polished.mp3')
 filt=f'[0:a]atrim=start={start}:end=92.42,asetpts=PTS-STARTPTS[a];[0:a]atrim=start=95.82:end={end},asetpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=0:a=1,loudnorm=I=-17:TP=-1.5:LRA=9[out]'
 subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/p2-batch-final.mp3','-filter_complex',filt,'-map','[out]','-ac','1','-ar','44100','-c:a','libmp3lame','-b:a','64k',str(tmp)],check=True);out.write_bytes(tmp.read_bytes())
 c.update(text=text,characters=len(text),sha256=hashlib.sha256(text.encode()).hexdigest());old.update(text_sha256=c['sha256'],bytes=out.stat().st_size,sha256=hashlib.sha256(out.read_bytes()).hexdigest(),duration=end-start-(95.82-92.42),edit='Removed duplicated spoken formula-name label; original written formula is unchanged.')
 for cue in old['cues']:
  if cue['start']>92.42-start:cue['start']=max(0,cue['start']-3.4);cue['end']=max(cue['start'],cue['end']-3.4)
 old.pop('cues',None)
 (root/'phase2/scripts.json').write_text(json.dumps(scripts,ensure_ascii=False,indent=2)+'\n');(root/'core/narration-assets.js').write_text('window.NarrationAssets = '+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n')
 print('Removed duplicate spoken name without synthesis or curriculum changes')
