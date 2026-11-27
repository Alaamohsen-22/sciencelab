from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
out=root/'core/narration-assets.js';data=json.loads(out.read_text().split('=',1)[1].strip().rstrip(';'))
for p in sorted((root/'phase2').glob('audio-batch-*.json')):data.update(json.loads(p.read_text()))
override=root/'phase2/audio-overrides.json'
if override.exists():data.update(json.loads(override.read_text()))
out.write_text('window.NarrationAssets = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(data),'available MP3s')
