/* Learning signals carry no grades back into lesson engines. */
const LabLearning = (() => {
  function context() {
    if (document.querySelector('.bond-lesson')) return {lesson:'bonds',page:Bonds.status()?.page ?? 0};
    if (document.querySelector('.cp-lesson')) return {lesson:'compounds',page:Compounds.status()?.page ?? 0};
    return {lesson:'reaction',page:typeof page==='number'?page:-1};
  }
  function emit(kind, detail={}) {
    document.dispatchEvent(new CustomEvent('lab-learning-event',{detail:{kind,...context(),...detail}}));
  }
  function answer(ok,key,scope) {
    if (typeof LabRuntime!=='undefined' && LabRuntime.isDemonstrating) return;
    const title=scope?.closest('[data-question],[data-extra-question],article,.card,.quiz-item')?.querySelector('h3')?.textContent;
    emit('answer',{ok:!!ok,key:String(key),label:title||'سؤال تعليمي',origin:scope});
  }
  return {context,emit,answer};
})();
