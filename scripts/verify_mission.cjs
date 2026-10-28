const path=require('path'),fs=require('fs'),assert=require('assert');
const root=require('path').resolve(__dirname,'..');
const ts=require(path.join(root,'node_modules/typescript'));
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {MODE_INTERVALS,scaleNotes,solveLevers,leverLessons}=require(root+'/src/services/curriculum/LeverLessonEngine.ts');
const {PLAYABLE_MAJOR_KEYS,TUNING_STRING_BASELINES}=require(root+'/src/services/curriculum/TuningMatrixEngine.ts');
let checked=0;
for(const tuning of Object.keys(PLAYABLE_MAJOR_KEYS)){
 for(const root of PLAYABLE_MAJOR_KEYS[tuning]){
  assert(solveLevers(tuning,root,'major'),tuning+' '+root);
  checked++;
  const parentNotes=scaleNotes(root,'major');
  Object.keys(MODE_INTERVALS).forEach((mode,index)=>{
   const modalRoot=parentNotes[index].label;
   assert.deepEqual(solveLevers(tuning,modalRoot,mode),solveLevers(tuning,root,'major'));
   const modal=scaleNotes(modalRoot,mode);
   assert.equal(modal[7].midi-modal[0].midi,12);
   checked++;
  });
 }
 for(const lesson of leverLessons(tuning)){
  const notes=scaleNotes(lesson.root,lesson.mode),config=solveLevers(tuning,lesson.root,lesson.mode);
  assert(config);assert.equal(notes.length,8);assert.equal(notes[7].midi-notes[0].midi,12);
  notes.forEach((n,i)=>{assert.equal((TUNING_STRING_BASELINES[tuning][n.letter].openMidi+config[n.letter])%12,n.midi%12);assert.equal(n.midi-notes[0].midi,MODE_INTERVALS[lesson.mode][i]);});
  checked++;
 }
}
assert.deepEqual(solveLevers('Eb_Major_Native','Bb','major'),{B:0,C:0,D:0,E:0,F:0,G:0,A:1});
assert.equal(solveLevers('Eb_Major_Native','Ab','major'),null);
assert.equal(solveLevers('C_Major_Native','F','major'),null);
assert.deepEqual(scaleNotes('D','dorian').map(n=>n.midi),[62,64,65,67,69,71,72,74]);
assert.deepEqual(scaleNotes('G','mixolydian').map(n=>n.midi),[67,69,71,72,74,76,77,79]);
assert.deepEqual(scaleNotes('A','aeolian').map(n=>n.midi),[69,71,72,74,76,77,79,81]);
const {reminderDue,validTime,localDay}=require(root+'/src/services/notifications/ReminderSchedule.ts');
const at=(h,m)=>new Date(2026,9,28,h,m);
assert(validTime('00:00'));assert(validTime('23:59'));assert(!validTime('24:00'));assert(!validTime('10:60'));
assert(!reminderDue({enabled:true,time:'10:00'},at(9,59)));
assert(reminderDue({enabled:true,time:'10:00'},at(10,0)));
assert(reminderDue({enabled:true,time:'10:00'},at(10,59)));
assert(!reminderDue({enabled:true,time:'10:00'},at(11,0)));
assert(!reminderDue({enabled:true,time:'10:00',lastNotifiedDate:localDay(at(10,0))},at(10,1)));
assert(!reminderDue({enabled:false,time:'10:00'},at(10,0)));
console.log(JSON.stringify({musicCases:checked,modalPlayback:'PASS',unreachableKeys:'PASS',reminderBoundaryAndDedup:'PASS',serverPushDelivery:'NOT TESTED'},null,2));
