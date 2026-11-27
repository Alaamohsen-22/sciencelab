"""Prepare deterministic, separate voice scripts from the verified curriculum data.
No API calls, no changes to the written lessons. Result/feedback clips are gated.
"""
import json,hashlib,re,sys
from pathlib import Path
if Path('phase2/scripts.json').exists() and '--regenerate' not in sys.argv:
 print('Existing reviewed scripts preserved; no overwrite or API calls.');sys.exit(0)
D=json.loads(Path('/tmp/phase2-data.json').read_text())
clips=[]
def add(id,text,priority=1,lesson='shared',page=None,kind='concept',selector='',gate='page'):
 text=re.sub(r'\s+',' ',text).strip()
 clips.append(dict(id=id,text=text,priority=priority,lesson=lesson,page=page,kind=kind,selector=selector,gate=gate,sha256=hashlib.sha256(text.encode()).hexdigest(),characters=len(text)))
# Each entry is a safe page introduction. Results live in separately gated clips.
reaction=[
'قبل أن نبدأ، اختبر أفكارك. اختر إجابة لكل سؤال، ثم لاحظ التفسير بعد التصحيح. لا تدخل نتيجة الاختبار القبلي في علامتك البعدية.',
'في هذه الرحلة ستفسر التفاعل الكيميائي وتتعرف إلى دلالاته. تأمل الأهداف المكتوبة، واربط كل هدف بما ستنفذه وتلاحظه في المختبر.',
'أمامك مسمار حديد. أضف الماء، ثم عرّضه للهواء، ثم تابع مرور الزمن المسرّع. ما الذي يتغير؟ احتفظ بتوقعك، ثم استند إلى الملاحظة في إجابتك.',
'نميّز المواد التي يبدأ بها التفاعل من المواد التي تتكوّن بعده. اتبع اتجاه السهم في المثال، ثم صنّف المواد وفق موضعها قبل التفاعل وبعده.',
'هل تتساوى أعداد الذرات في الطرفين؟ غيّر معامل الماء، ثم عُدّ ذرات الهيدروجين والأكسجين. المعامل يقع أمام الصيغة، ولا يغيّر هوية المادة.',
'تختصر المعادلة الكيميائية أسماء المواد برموز وصيغ. السهم يربط المتفاعلات بالنواتج، وقد تُكتب عليه ظروف التفاعل. غيّر المعاملات، لا الأرقام داخل الصيغ. جرّب موازنة الكالسيوم، ثم أنجز نشاط الأمونيا.',
'جهز الدورق والخارصين والحمض المخفف والبالون في المختبر الرقمي. اتبع ترتيب الأدوات، وراقب البالون وما يحدث داخل الدورق. لا نستنتج قبل تنفيذ التفاعل.',
'افحص الأنبوب الافتراضي والفلز والحمض المخفف. نفّذ الإضافة، ثم قارن مؤشر الحرارة وحركة الفقاعات قبل التفاعل وبعده. أي دليلين تستطيع ملاحظتهما؟',
'اختر الخبز أو الحليب، ثم أضف اليود افتراضيًا. قارن لون العينة قبل الإضافة وبعدها، وأعد التجربة بالعينة الأخرى قبل أن تفسر النتيجة.',
'أمامك الماء المقطر وملح الطعام ومحلول نترات الفضة. رتب الإضافات، ثم حرّك المحلول وراقب قاع الكأس. هل ترى مادة جديدة تختلف عن المحلول؟',
'الكاشف الطبيعي محضّر ومبرّد في هذه المحاكاة. قارن أثر الحمض وأثر محلول بيكربونات الصوديوم في ماء الملفوف. غيّر عاملًا واحدًا ولاحظ اللون.',
'تجربة المغنيسيوم هنا رقمية بالكامل. استخدم أدوات المحاكاة وتابع التغير البصري منخفض الشدة. لاحظ المادة قبل التسخين وبعده، ثم فسّر الدليل.',
'اجمع أدلتك في خريطة الدرس. افتح مفهوم التفاعل، ثم ميزان الذرات، ثم دلالات حدوث التفاعل. كبّر الرسوم واربط كل ملاحظة بتفسيرها، دون الاعتماد على علامة واحدة خارج سياقها.',
'حان وقت الاختبار البعدي. أمامك سبعة أسئلة، لكل سؤال نقطة. تُحسب الإجابة الأولى في المحاولة، ويمكنك إعادة الاختبار. اقرأ السؤال كاملًا قبل الاختيار.',
'هذه محطة الإنجاز. تظهر الشهادة وفق شرط النجاح الأصلي: ست إجابات صحيحة من سبع على الأقل. عند استحقاقها تحمل اسمك وتاريخ إنجازك، ويمكنك تنزيلها وطباعتها.'
]
bonds=[
'كيف ترتبط الذرات لتكوّن المواد؟ الرابطة الكيميائية قوة تربط الذرات أو الأيونات في المواد. سنفسر الانتقال في الرابطة الأيونية، والمشاركة في الرابطة التساهمية. ابدأ بالسؤال، ثم شاهد الأمثلة ونفّذها بنفسك.',
'ابدأ بذرتي الليثيوم والفلور. التوزيع الإلكتروني لليثيوم اثنان، واحد؛ وللفلور اثنان، سبعة. اضغط زر المشاهدة لتتبع إلكترون التكافؤ، ثم جرّب نقله بنفسك في النشاط.',
'أمامك ذرة مغنيسيوم وذرتا كلور. توزيع المغنيسيوم اثنان، ثمانية، اثنان؛ وتوزيع كل ذرة كلور اثنان، ثمانية، سبعة. تتبّع إلكتروني التكافؤ في المثال، ثم كوّن الارتباط بنفسك.',
'لذرة الهيدروجين إلكترون واحد. شاهد اقتراب الذرتين، وتتبع الإلكترونين في منطقة التداخل. بعد المثال اختر إلكترونًا من كل ذرة ونفّذ المشاركة بنفسك.',
'توزيع الأكسجين اثنان، ستة. تتبع إلكترونات التكافؤ في الذرتين. شاهد المثال لتتعرف إلى عدد الأزواج المشتركة، ثم أنشئ الرابطة بنفسك وقارن تمثيلك بالرسم.',
'أمامك كربون وأربع ذرات هيدروجين. للكربون أربعة إلكترونات تكافؤ، ولكل هيدروجين إلكترون واحد. اختر جهة رابطة، وشارك إلكترونًا من الكربون وإلكترونًا من الهيدروجين المقابل. كرّر ذلك في الجهات الأربع، ثم تحقق.',
'اكتشف الفرق بين انتقال الإلكترونات ومشاركتها. صنّف الأمثلة واحدًا واحدًا، واستند إلى كيفية تكوّن الرابطة، لا إلى حفظ اسم الصيغة وحده.',
'خريطة الروابط تجمع علاقات الدرس. افتح مسار الأيونية، ثم التساهمية، ثم قارن الأمثلة. اتبع الأسهم، وكبّر رسم الأزواج أو انتقال الإلكترونات لتراجع الدليل قبل الاختبار.',
'أمامك ستة أسئلة، نقطة لكل سؤال. تُصحّح كل إجابة بعد اختيارها مع تفسيرها. يمكنك إعادة الاختبار كاملًا؛ وتحقيق خمس إجابات صحيحة يحقق نسبة النجاح المطلوبة، مع بقاء متطلبات الشهادة الأصلية.',
'تجمع شهادة الروابط بين مشاهدة الأمثلة الخمسة، وإنجاز الأنشطة والتقويم والمقارنة، والنجاح في الاختبار. عندما تستوفي المتطلبات تظهر شهادتك باسمك ونتيجتك وتاريخ إنجازك.'
]
compounds=[
'مرحبًا في مختبر المدرسة. أمامك أكسيد الكالسيوم وحمض الهيدروكلوريك وكلوريد الصوديوم وهيدروكسيد الصوديوم. كيف نميّز بينها؟ اختبر معرفتك أولًا، ثم ابحث عن الأدلة في محطات الحموض والقواعد والأملاح والأكاسيد.',
'مرحبًا في محطة الحموض. تتكوّن أيونات الهيدروجين في الماء وفق التمثيل المبسط في المنهاج. اكتشف أثر الكاشف والتوصيل الكهربائي والتفاعل مع الفلز. لا تلمس مواد المختبر ولا تتذوقها؛ التجارب الخطرة رقمية فقط.',
'مرحبًا في محطة القواعد. تتكوّن أيونات الهيدروكسيل في الماء. قارن أثر القاعدة في الكاشف، ثم أكمل الدائرة وافحص التوصيل. لا نختبر القواعد بلمسها أو تذوقها؛ بعض القواعد كاوية.',
'كيف يتكوّن الملح؟ أضف الحمض إلى القاعدة قطرة قطرة في النموذج الرقمي، وراقب مؤشر حالة المحلول. تابع الأيونات ثم تبخر الماء. لا يدل اللون الزهري لدوار الشمس وحده على نقطة التعادل.',
'الأكسيد مركب يتكوّن من الأكسجين وعنصر آخر. قارن مثال الكبريت بمثال الكالسيوم. لون اللهب لا يساوي لون الغاز، ولا نعمم على كل أكاسيد الفلزات واللافلزات. لا تُجرِ التجربة خارج المحاكاة.',
'راجع العائلات الأربع في خريطة المركبات. افتح كل عائلة واربط مفهومها وأمثلتها واستخداماتها بالدليل المناسب. تأمل رسم التعادل، ثم صنّف عبوات البداية قبل الاختبار.',
'الاختبار البعدي يربط الملاحظة بالتفسير. ستصنّف وتطابق وتتوقع وتكمل المعادلات وتوازنها. اختر أو اكتب إجابتك ثم صحّحها؛ تُحسب الإجابة الأولى ويمكنك إعادة الاختبار.'
]
for lesson,pages in [('reaction',reaction),('bonds',bonds),('compounds',compounds)]:
 for page,text in enumerate(pages):
  add(f'{lesson}-page-{page}',text,1 if page not in ([0,13,14] if lesson=='reaction' else [0,8,9] if lesson=='bonds' else [0,6]) else 4,lesson,page,'page','.shell>h2,.bond-heading h2,.cp-heading h2')
# Scientific explanations after actual observations or completed viewing only.
for i,a in enumerate(D['activities']):
 add('reaction-result-'+a['kind'],'لنربط الملاحظة بالتفسير. '+a['explain'],2,'reaction',i+6,'result','#explain','experiment:'+a['kind'])
 for j,(tool,label) in enumerate(D['recipes'][a['kind']] if isinstance(D['recipes'][a['kind']],list) else list(D['recipes'][a['kind']].values())[0]):
  add(f"reaction-step-{a['kind']}-{j}",'الخطوة التالية: '+label+'. استخدم الأداة في المحاكاة، ثم راقب ما يتغير.',2,'reaction',i+6,'step',f'[data-material="{tool}"]','step:'+tool)
for j,text in enumerate(D['bonds']['goals']):add('bond-goal-'+str(j),text,1,'bonds',0,'goal','.goals')
for i,m in enumerate(D['bonds']['models']):
 add('bond-result-'+m['id'],'ماذا شاهدنا؟ '+m['explain'],2,'bonds',i+1,'result','[data-explanation]','watched:'+m['id'])
 for j,stage in enumerate(m['stages']):add(f"bond-stage-{m['id']}-{j}",stage[0],2,'bonds',i+1,'step',f'.bond-stage-list [data-stage="{j}"]','bond-phase:'+m['id']+':'+str(j))
# A separate voiced question and feedback for every original data-defined assessment.
def question(prefix,q,lesson,page=None):
 add(prefix+'-question','فكّر في هذا السؤال. '+q['text']+' الخيارات: '+'؛ '.join(q['options']),5,lesson,page,'question','','question:'+q.get('id',prefix))
 add(prefix+'-feedback','لنراجع الدليل. '+q['explain'],5,lesson,page,'feedback','','graded:'+q.get('id',prefix))
for i,q in enumerate(D['preQuestions']):question('reaction-pre-'+str(i),dict(text=q[0],options=q[1],explain=q[3]),'reaction',0)
for i,q in enumerate(D['questions']):question('reaction-post-'+str(i),dict(text=q[0],options=q[1],explain=['الماء هو الناتج؛ الهيدروجين والأكسجين متفاعلان.','تتساوى ذرات الكالسيوم والأكسجين في الطرفين عند الموازنة.','ينتج غاز الهيدروجين من تفاعل الألمنيوم مع الحمض.','يتغير النشا في الخبز مع اليود إلى لون بنفسجي غامق مائل إلى الأسود.','يتكون راسب كلوريد الفضة الأبيض.','يتحول الكاشف الطبيعي إلى الأخضر في الوسط القاعدي.','يتحد المغنيسيوم مع الأكسجين منتجًا أكسيد المغنيسيوم الأبيض.'][i]),'reaction',13)
for i,m in enumerate(D['bonds']['models']):question('bond-check-'+m['id'],m['question'],'bonds',i+1)
for key,q in D['bonds']['extras'].items():question('bond-extra-'+key,q,'bonds',2 if key=='ionic' else 5)
for i,q in enumerate(D['bonds']['quiz']):question('bond-quiz-'+str(i),q,'bonds',8)
for kind,qs in D['compounds']['checks'].items():
 for q in qs:question('compound-'+q['id'],q,'compounds',dict(acid=1,base=2,salt=3,oxide=4)[kind])
for q in D['compounds']['equations']:question('compound-'+q['id'],q,'compounds')
for kind in ['pre','quiz']:
 for q in D['compounds'][kind]:question('compound-'+q['id'],q,'compounds',0 if kind=='pre' else 6)
# Original usage cards: distinct content, never auto-played during assessments.
for family,rows in D['compounds']['uses'].items():
 for i,(formula,name,use,icon) in enumerate(rows):add('use-'+family+'-'+str(i),name+'. '+use+'. تأمل الصيغة واستخدام المركب في البطاقة.',1,'compounds',dict(acid=1,base=2,salt=3,oxide=4)[family],'usage','[data-use]','usage:'+family+':'+str(i))
for f in D['facts']:add('fact-'+f['id'],'من نافذة الاكتشاف. '+f['title']+'. '+f['text'],7,'shared',None,'fact','.discovery-window','optional:'+f['id'])
for id,text in [('lab-welcome','أهلًا بك في مختبر اكتشف. اختر بوابتك العلمية؛ جميع الدروس مفتوحة لك. تدرّب، وجرّب، واستند إلى الدليل. تحفظ حقيبة الإنجازات رحلتك تلقائيًا.'),('correct','تفكير علمي متميز! لقد استندت إلى الدليل وتوصلت إلى الإجابة الصحيحة.'),('retry','فكّر مرة أخرى. راجع الملاحظة أو الرسم، وقارن بين الخيارات بهدوء. تستطيع المحاولة من جديد.'),('stars','إنجاز علمي رائع! أُضيفت النجوم إلى حقيبة إنجازاتك.'),('medal','اكتشاف مذهل! حصلت على وسام جديد في رحلتك العلمية.'),('lesson','لقد أبدعت! أتممت مهمات هذا الدرس، وقطعت خطوة جديدة نحو الإتقان.'),('certificate','أحسنت أيها المستكشف! استوفيت شروط شهادة الإنجاز. هذه ثمرة ملاحظتك وتجاربك وتفكيرك العلمي.'),('hint','راقب ما يتغير وما يبقى ثابتًا. غيّر عاملًا واحدًا، ثم استخدم الدليل لتفسير ما تراه.'),('transition','هيا ننتقل إلى المحطة التالية. احتفظ بملاحظتك واربطها بالسؤال الجديد.')]:add('shared-'+id,text,4 if id in ['lab-welcome','transition'] else 6,'shared',None,'event','','event:'+id)
# Full seven lab procedures and observations sourced from the simulation itself are expanded separately.
labsteps={'acid-paper':['اختر المحلول ولون الورقة، ثم اغمسها افتراضيًا. غيّر أحد الاختيارين للمقارنة.','الحموض تحوّل الورقة الزرقاء إلى الحمراء، وتبقى الحمراء على لونها. الماء المقطر المتعادل لا يغير لون الورقتين.'], 'acid-current':['صِل الأسلاك، واغمس قطبي الكربون، ثم أغلق المفتاح. تتبع مسار الدائرة.','يضيء المصباح عند اكتمال الدائرة. تنقل الأيونات المتحركة الشحنة داخل المحلول، وتتحرك الإلكترونات في الأسلاك.'], 'hydrogen':['أضف الحمض المخفف، ثم شريط المغنيسيوم، ثم شاهد الكشف الرقمي الآمن عن الغاز. لا تُجرِ هذه التجربة منزليًا.','تتصاعد فقاعات غاز الهيدروجين ويتآكل المغنيسيوم، ويُسمع صوت فرقعة قصير في الكشف الرقمي. يتفاعل مغنيسيوم واحد مع جزيئين من حمض الهيدروكلوريك ليعطي كلوريد المغنيسيوم والهيدروجين.'], 'base-paper':['اختر محلول الرماد أو هيدروكسيد الصوديوم ولون الورقة، ثم اغمسها. لا تلمس المواد ولا تتذوقها.','تحول القواعد الورقة الحمراء إلى الزرقاء، وتبقى الزرقاء على لونها.'], 'base-current':['صِل أسلاك الدائرة، واغمس قطبي الكربون في محلول هيدروكسيد الصوديوم، ثم أغلق المفتاح.','عند اكتمال الدائرة يضيء المصباح؛ أيونات الصوديوم والهيدروكسيل المتحركة تنقل الشحنة في المحلول.'], 'neutral':['جهّز القاعدة ثم أضف الحمض قطرة قطرة. تابع مؤشر الحالة، وتوقف عند التعادل قبل التبخر.','في هذا النموذج تعادل أربع إضافات متساوية كمية القاعدة. يتحد الهيدروجين الموجب والهيدروكسيل السالب لتكوين الماء، وتبقى أيونات الصوديوم والكلوريد. عند تبخر الماء تظهر بلورات كلوريد الصوديوم. زيادة الحمض تجعل المحلول حمضيًا.'], 'oxide':['ضع المادة ثم سخنها افتراضيًا، واختبر أثر الناتج بالماء والكاشف المبلل. لا تستنشق الغاز؛ المشهد رقمي فقط.','يحترق الكبريت بلهب أزرق ويكوّن ثاني أكسيد الكبريت العديم اللون. يظهر أثر حمضي مع الماء فتحمر الورقة الزرقاء المبللة. وفي المثال الآخر يكون أكسيد الكالسيوم قاعديًا مع الماء. أكسيد الألومنيوم متردد، ولا نعمم التصنيف على كل الأكاسيد.']}
for id,(procedure,result) in labsteps.items():
 page=1 if id in ['acid-paper','acid-current','hydrogen'] else 2 if id.startswith('base') else 3 if id=='neutral' else 4
 add('lab-'+id,procedure,2,'compounds',page,'procedure',f'[data-lab="{id}"]','before:'+id)
 add('lab-result-'+id,result,2,'compounds',page,'result',f'[data-lab="{id}"] .cp-observation','experiment:'+id)
for id,text,gate in [('acid-ion','عند تأين حمض الهيدروكلوريك في الماء تتكون أيونات الهيدروجين الموجبة والكلوريد السالبة. نستخدم الهيدروجين الموجب تمثيلًا مبسطًا كما في المنهاج. ولحمض الكبريتيك في النموذج المبسط أيونا هيدروجين موجب وأيون كبريتات بشحنتين سالبتين.','molecule:acid'),('base-ion','يتفكك هيدروكسيد البوتاسيوم في الماء إلى أيون بوتاسيوم موجب وأيون هيدروكسيل سالب. تبقى مجموعة الهيدروكسيل معًا. طبّق الفكرة على هيدروكسيد الصوديوم، واحفظ عدد الذرات ومجموع الشحنة.','molecule:base')]:add('compound-'+id,text,1,'compounds',1 if id.startswith('acid') else 2,'result','[data-molecule]','gate:'+gate)
# Normalize chemical tokens only in separate audio copy, never written curriculum.
pron={'MgCl₂':'كلوريد المغنيسيوم','LiF':'فلوريد الليثيوم','HCl':'حمض الهيدروكلوريك','H₂SO₄':'حمض الكبريتيك','HNO₃':'حمض النيتريك','CH₃COOH':'حمض الخليك','NaOH':'هيدروكسيد الصوديوم','KOH':'هيدروكسيد البوتاسيوم','Mg(OH)₂':'هيدروكسيد المغنيسيوم','NaHCO₃':'بيكربونات الصوديوم','NaCl':'كلوريد الصوديوم','MgSO₄':'كبريتات المغنيسيوم','CuSO₄':'كبريتات النحاس','PbO₂':'ثاني أكسيد الرصاص','ZnO':'أكسيد الخارصين','SiO₂':'أكسيد السيليكون','Al₂O₃':'أكسيد الألومنيوم','Ca(OH)₂':'هيدروكسيد الكالسيوم','CaO':'أكسيد الكالسيوم','CH₄':'الميثان','NH₃':'الأمونيا','SO₂':'ثاني أكسيد الكبريت','CO₂':'ثاني أكسيد الكربون','H₂O':'الماء','O₂':'الأكسجين','H₂':'الهيدروجين','N₂':'النيتروجين','H⁺':'أيون الهيدروجين الموجب','OH⁻':'أيون الهيدروكسيل السالب','Cl⁻':'أيون الكلوريد السالب','K⁺':'أيون البوتاسيوم الموجب','Na⁺':'أيون الصوديوم الموجب'}
for c in clips:
 for k,v in sorted(pron.items(),key=lambda kv:-len(kv[0])):c['text']=c['text'].replace(k,v)
 c['text']=c['text'].replace('→',' ينتج ').replace('⟶',' ينتج ').replace(' + ',' مع ')
 c['characters']=len(c['text']);c['sha256']=hashlib.sha256(c['text'].encode()).hexdigest()
clips.sort(key=lambda c:(c['priority'],c['lesson'],c['page'] if c['page'] is not None else 99,c['id']))
Path('phase2/scripts.json').write_text(json.dumps(clips,ensure_ascii=False,indent=2)+'\n')
Path('phase2/audio-plan.json').write_text(json.dumps(dict(voice_name='Razan – Academic & Cultural Narration',voice_id='EUojVLG1QfxaqqH4ce6s',model='eleven_multilingual_v2',scripts=len(clips),characters=sum(c['characters'] for c in clips),estimated_credits=sum(c['characters'] for c in clips),estimate_basis='Connected ElevenLabs estimate: 113 credits for 113 characters; one generation per clip. Estimate, not a read of remaining balance.',balance='unavailable via connector; user explicitly authorized generation without reading balance',priority_order=[1,2,3,4,5,6,7]),ensure_ascii=False,indent=2)+'\n')
print(len(clips),'scripts;',sum(c['characters'] for c in clips),'characters')
