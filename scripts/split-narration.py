"""Split a generated batch using real ElevenLabs/Scribe word times.
No estimated timing; low-confidence alignment stops without publishing clips.
"""
import json,re,sys,difflib,subprocess,pathlib,hashlib
root=pathlib.Path(__file__).resolve().parent.parent
batch_id=sys.argv[1];words_path=pathlib.Path(sys.argv[2]);audio=pathlib.Path(sys.argv[3]);batch=next(b for b in json.loads((root/'phase2/batches.json').read_text()) if b['id']==batch_id)
clips={c['id']:c for c in json.loads((root/'phase2/scripts.json').read_text())}
def norm(s):
 s=re.sub('[\u064b-\u065f\u0670]','',s).replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي')
 return re.sub(r'[^\w]+','',s,flags=re.U).lower()
raw=json.loads(words_path.read_text());raw=raw.get('words',raw) if isinstance(raw,dict) else raw
words=[w for w in raw if w.get('type','word')=='word' and norm(w.get('text',''))]
heard=[norm(w['text']) for w in words];target=[];spans=[]
for id in batch['clip_ids']:
 tokens=[norm(t) for t in clips[id]['text'].split() if norm(t)]
 spans.append((id,len(target),len(target)+len(tokens)));target.extend(tokens)
map={}
for block in difflib.SequenceMatcher(None,target,heard,autojunk=False).get_matching_blocks():
 for i in range(block.size):map[block.a+i]=block.b+i
bounds=[];checks=[]
for id,start,end in spans:
 matched=[map[i] for i in range(start,end) if i in map];ratio=len(matched)/max(1,end-start)
 if ratio<.7 or not matched:raise SystemExit(f'Alignment requires review: {id}, {ratio:.1%}')
 bounds.append((words[matched[0]]['start'],words[matched[-1]]['end']));checks.append(dict(id=id,matched=round(ratio,4)))
duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(audio)]))
cuts=[0]+[(bounds[i-1][1]+bounds[i][0])/2 for i in range(1,len(bounds))]+[duration]
meta={};outdir=root/'assets/audio/phase2';outdir.mkdir(parents=True,exist_ok=True)
for i,((id,start,end),check) in enumerate(zip(spans,checks)):
 out=outdir/(id+'.mp3');duration=cuts[i+1]-cuts[i];assert duration>0
 subprocess.run(['ffmpeg','-v','error','-y','-ss',str(cuts[i]),'-i',str(audio),'-t',str(duration),'-af','loudnorm=I=-17:TP=-1.5:LRA=9','-ac','1','-ar','44100','-c:a','libmp3lame','-b:a','64k',str(out)],check=True)
 # Sentence-sized caption cues come from the actual spoken word boundaries.
 segment=[w for w in words if cuts[i] <= w['start'] < cuts[i+1]];cues=[]
 for j in range(0,len(segment),9):
  group=segment[j:j+9];cues.append(dict(start=round(max(0,group[0]['start']-cuts[i]),3),end=round(group[-1]['end']-cuts[i],3),text=' '.join(w['text'] for w in group)))
 meta[id]=dict(file='assets/audio/phase2/'+id+'.mp3',text_sha256=clips[id]['sha256'],voice_id='EUojVLG1QfxaqqH4ce6s',voice_name='Razan – Academic & Cultural Narration',model='eleven_multilingual_v2',batch=batch_id,duration=round(duration,3),bytes=out.stat().st_size,sha256=hashlib.sha256(out.read_bytes()).hexdigest(),alignment=check['matched'],cues=cues)
(root/'phase2'/('audio-'+batch_id+'.json')).write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(batch=batch_id,files=len(meta),minimum_alignment=min(c['matched'] for c in checks))))
