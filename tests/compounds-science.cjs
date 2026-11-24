const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({});vm.runInContext(fs.readFileSync('lessons/compounds/art.js','utf8')+';globalThis.art=CompoundArt;',c);vm.runInContext(fs.readFileSync('lessons/compounds/data.js','utf8')+';globalThis.data=CompoundData;',c);
for(let n=0;n<=8;n++){
 const svg=c.art.neutral({drops:n,stage:n?2:0,progress:1});
 const count=t=>svg.split(`data-ion="${t}"`).length-1;
 assert.equal(count('Na⁺'),4);assert.equal(count('Cl⁻'),n);assert.equal(count('OH⁻'),Math.max(0,4-n));assert.equal(count('H⁺'),Math.max(0,n-4));assert.equal(count('Na⁺')+count('H⁺')-count('Cl⁻')-count('OH⁻'),0,'charge conserved throughout neutralisation');
}
assert(!c.art.neutral({drops:0,stage:0,progress:0}).includes('HCl + NaOH → NaCl + H₂O'),'no final equation before mixing');
const sulfate=c.data.equations.find(q=>q.id==='sulfate');assert.equal(sulfate.options[sulfate.correct],'2H⁺ + SO₄²⁻');assert.equal(c.data.quiz.length,16);assert.equal(c.data.stations.length,4);
for(const qs of [c.data.pre,c.data.quiz,...Object.values(c.data.checks),c.data.equations])for(const q of qs)assert(q.correct>=0&&q.correct<q.options.length);
assert(c.data.equations.find(q=>q.id==='aluminium').explain.includes('متردد'));assert(c.data.equations.find(q=>q.id==='nitrogen').explain.includes('متعدد')||c.data.equations.find(q=>q.id==='nitrogen').explain.includes('أخرى'));
for(const f of fs.readdirSync('lessons/compounds').filter(f=>f.endsWith('.js')))new vm.Script(fs.readFileSync('lessons/compounds/'+f,'utf8'));
console.log('PASS: balanced charge/ion counts at all nine neutralisation states, no premature products, sulfate and oxide exceptions, quiz bounds, scripts parse');
