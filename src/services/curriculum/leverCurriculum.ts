import {LevelDefinition,SINGLE_NOTE_LEVELS} from './curriculumData';
export const LEVER_LEVELS: LevelDefinition[] = Array.from({length:7},(_,i)=>({...SINGLE_NOTE_LEVELS[0],id:`lever_stage_${i+1}`,code:`L-${i+1}`,levelNumber:i+1,title:`${i+2} scales`,rounds:20,description:`Set levers for ${i+2} major scales. Learn the next circle-of-fifths step, then mix familiar scales.`,module:'Lever scales'}));
