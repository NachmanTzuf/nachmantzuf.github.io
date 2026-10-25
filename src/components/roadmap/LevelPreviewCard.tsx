import React from 'react';
import {Text,TouchableOpacity} from 'react-native';
import {Reveal} from '../common/Reveal';
import {LiquidGlassLevelBadge} from './LiquidGlassLevelBadge';
import {LevelDefinition} from '../../services/curriculum/curriculumData';
export function LevelPreviewCard({level,theme,onPlay,onClose,unlocked=true}:{level:LevelDefinition;theme:'single'|'melody'|'levers';onPlay:()=>void;onClose?:()=>void;unlocked?:boolean}) {return <Reveal key={level.id} style={{alignItems:'stretch',width:170}}>{onClose&&<TouchableOpacity accessibilityLabel="Close level card" onPress={onClose} style={{alignSelf:'flex-end',padding:6}}><Text style={{color:'#efdfbd'}}>×</Text></TouchableOpacity>}<LiquidGlassLevelBadge level={level} theme={theme}/><TouchableOpacity nativeID="level-card-play" disabled={!unlocked} onPress={onPlay} style={{marginTop:5,padding:12,borderRadius:10,backgroundColor:'rgba(36,51,39,.94)',borderWidth:1,borderColor:'#bba274'}}><Text style={{color:'#efdfbd',textAlign:'center',fontSize:12}}>{unlocked?'Play level →':'Locked'}</Text></TouchableOpacity></Reveal>}
