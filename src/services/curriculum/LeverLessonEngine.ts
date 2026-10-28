import {NativeHarpTuning, StringLetter, LeverPositionMap, TUNING_STRING_BASELINES, PLAYABLE_MAJOR_KEYS} from './TuningMatrixEngine';
export const MODE_INTERVALS = {major:[0,2,4,5,7,9,11,12],dorian:[0,2,3,5,7,9,10,12],phrygian:[0,1,3,5,7,8,10,12],lydian:[0,2,4,6,7,9,11,12],mixolydian:[0,2,4,5,7,9,10,12],aeolian:[0,2,3,5,7,8,10,12],locrian:[0,1,3,5,6,8,10,12]} as const;
export type LeverMode=keyof typeof MODE_INTERVALS;
const letters='CDEFGAB';
const natural=[0,2,4,5,7,9,11];
export const FIFTHS=['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];
export function rootMidi(root:string,octave=4):number {
 const i=letters.indexOf(root[0]);if(i<0)throw new Error('Unknown root');
 return (octave+1)*12+natural[i]+[...root.slice(1)].reduce((n,a)=>n+(a==='#'?1:a==='b'?-1:0),0);
}
export function scaleNotes(root:string,mode:LeverMode) {
 const midi=rootMidi(root); const first=letters.indexOf(root[0]);
 return MODE_INTERVALS[mode].map((interval,i)=>{
  const letter=letters[(first+i)%7] as StringLetter;
  const noteMidi=midi+interval;const pc=((noteMidi%12)+12)%12;
  let accidental=(pc-natural[letters.indexOf(letter)]+12)%12;if(accidental>6)accidental-=12;
  return {midi:noteMidi,letter,label:letter+(accidental>0?'#'.repeat(accidental):'b'.repeat(-accidental))};
 });
}
export function solveLevers(tuning:NativeHarpTuning,root:string,mode:LeverMode):LeverPositionMap|null {
 const result={} as LeverPositionMap;
 for(const n of scaleNotes(root,mode).slice(0,7)) {
  const delta=(n.midi-TUNING_STRING_BASELINES[tuning][n.letter].openMidi+120)%12;
  if(delta!==0&&delta!==1)return null;result[n.letter]=delta;
 }return result;
}
export interface LeverLesson {root:string;mode:LeverMode;parent:string;title:string;}
export function leverLessons(tuning:NativeHarpTuning):LeverLesson[] {
 return [...PLAYABLE_MAJOR_KEYS[tuning].slice(0,7).map(root=>({root,mode:'major' as LeverMode,parent:root,title:root+' major'})),
 ...(['dorian','phrygian','lydian','mixolydian','aeolian','locrian'] as LeverMode[]).map((mode,i)=>({root:'DEFGAB'[i],mode,parent:'C',title:'DEFGAB'[i]+' '+mode}))];
}
export function signatureOf(key:string):number {return ({Cb:-7,Gb:-6,Db:-5,Ab:-4,Eb:-3,Bb:-2,F:-1,C:0,G:1,D:2,A:3,E:4,B:5,'F#':6,'C#':7} as Record<string,number>)[key];}
