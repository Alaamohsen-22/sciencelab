from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parent.parent
clips=json.loads((root/'phase2/scripts.json').read_text());known={c['id'] for c in clips};D=json.loads(Path('/tmp/phase2-data.json').read_text());new=[]
def add(id,text,lesson,page,kind,gate):
 if id in known:return
 v=dict(id=id,text=text,priority=5,lesson=lesson,page=page,kind=kind,selector='',gate=gate,characters=len(text),sha256=hashlib.sha256(text.encode()).hexdigest());clips.append(v);new.append(v);known.add(id)
def q(id,text,options,explain,lesson,page):
 add(id+'-question','تأمل هذا السؤال. '+text+' الخيارات: '+'؛ '.join(options),lesson,page,'question','question:'+id)
 add(id+'-feedback','لنراجع الدليل. '+explain,lesson,page,'feedback','graded:'+id)
for i,a in enumerate(D['activities']):q('reaction-observation-'+a['kind'],a['question'],a['options'],a['explain'],'reaction',6+i)
extra=[
('rust','هل تغيّر شكل الحديد فقط، أم تكوّنت مادة جديدة؟',['تغيّر شكل الحديد فقط.','تكوّنت مادة جديدة.'],'الصدأ مادة جديدة تنتج عن تفاعل الحديد مع الأكسجين بوجود الرطوبة.','reaction',2),
('atom-inference','ماذا حدث للذرات عند تكوّن المادة الجديدة؟',['الذرات محفوظة، وتغيّرت الروابط بينها.','اختفت الذرات.'],'الذرات يعاد ترتيبها وتبقى محفوظة.','reaction',2),
('balance-inference','لماذا استقر الميزان عند معامل الماء اثنين؟',['لتساوي عدد ذرات كل عنصر في الطرفين','لأن الذرات اختفت','لأن الماء عنصر'],'الذرات والكتلة محفوظتان في طرفي المعادلة.','reaction',4),
('equation-inference','لماذا غيّرنا المعاملات ولم نغيّر صيغة أكسيد الكالسيوم؟',['لأن تغيير الصيغة يغيّر المادة','لإخفاء الأكسجين','لزيادة أنواع العناصر'],'المعامل يغيّر عدد الوحدات؛ تغيير الصيغة يغيّر هوية المركب.','reaction',5),
('ammonia-inference','ما تفسير تساوي ذرات النيتروجين والهيدروجين في طرفي المعادلة؟',['الذرات يعاد ترتيبها وتبقى محفوظة','تختفي الذرات','تتحول الذرات إلى أنواع أخرى'],'يحفظ التفاعل ذرات العناصر، ويعيد ترتيبها.','reaction',5),
('hcl-check','لماذا تعد الرابطة في جزيء حمض الهيدروكلوريك تساهمية؟',['لأن الذرتين تتشاركان بزوج إلكتروني','لأن الهيدروجين يفقد إلكترونه بالكامل للكلور','لأن الذرتين تصبحان أيونين موجبين'],'تتشارك ذرتا الهيدروجين والكلور بزوج واحد في رابطة تساهمية أحادية.','bonds',3),
('base-conductivity','لماذا يوصل محلول هيدروكسيد الصوديوم التيار عند اكتمال الدائرة؟',['لوجود أيونات متحركة','لأن الزجاج يوصل التيار','لأن المحلول أزرق'],'تنقل أيونات الصوديوم والهيدروكسيل المتحركة الشحنة داخل المحلول.','compounds',2),
('oxide-calcium','لماذا تحولت الورقة الحمراء بعد إضافة الماء إلى أكسيد الكالسيوم؟',['لأن الوسط قاعدي','لأن الغاز أزرق','لأن الأكسجين اختفى'],'يتفاعل أكسيد الكالسيوم مع الماء ليعطي هيدروكسيد الكالسيوم؛ يظهر أثرًا قاعديًا.','compounds',4),
('salt-classify','أي زوج يحتوي أملاحًا فقط؟',['كلوريد الصوديوم وكبريتات المغنيسيوم','حمض الهيدروكلوريك وهيدروكسيد الصوديوم','ثاني أكسيد الكربون وأكسيد الكالسيوم'],'كلوريد الصوديوم وكبريتات المغنيسيوم ملحان أيونيان.','compounds',3)]
for args in extra:q('runtime-'+args[0],*args[1:])
(root/'phase2/scripts.json').write_text(json.dumps(clips,ensure_ascii=False,indent=2)+'\n')
batches=json.loads((root/'phase2/batches.json').read_text())
if new:batches.append(dict(id='batch-8',clip_ids=[c['id'] for c in new],text='\n\n'.join(c['text'] for c in new),characters=sum(c['characters'] for c in new)))
(root/'phase2/batches.json').write_text(json.dumps(batches,ensure_ascii=False,indent=2)+'\n')
print(len(clips),'scripts;',sum(c['characters'] for c in clips),'characters; additional',len(new))
