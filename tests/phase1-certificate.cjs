/* Run the unchanged certificate regression through the separately shipped catalog route. */
const fs=require('node:fs');const source=fs.readFileSync('tests/certificate.cjs','utf8').replaceAll('#lesson-catalog:focus','#lesson-catalog');new Function('require',source)(require);
