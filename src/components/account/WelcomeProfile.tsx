import React,{useState} from 'react';
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Image} from 'react-native';
import {UserAccountDatabase,UserProfile} from '../../services/account/UserAccountDatabase';
import {NativeHarpTuning,TuningMatrixEngine} from '../../services/curriculum/TuningMatrixEngine';
import {PhotoPicker} from './ProfilePhoto';
import {Reveal} from '../common/Reveal';
export function WelcomeProfile({onDone}:{onDone:()=>void}) {
 const [step,setStep]=useState(0),[name,setName]=useState(''),[photo,setPhoto]=useState('');
 const [tuning,setTuning]=useState<NativeHarpTuning>('Eb_Major_Native');const [notation,setNotation]=useState<'numbers'|'solfege'|'notes'>('numbers');
 const [experience,setExperience]=useState<UserProfile['experienceLevel']>('Beginner Harper');const [skip,setSkip]=useState(false);
 const save=()=>{const db=UserAccountDatabase.getInstance();db.createAccount({username:`harper_${Date.now()}`,displayName:name.trim(),avatarIcon:'',avatarColor:'#c3a36d',experienceLevel:experience,activeTuning:tuning});db.updateActiveProfile({avatarPhoto:photo,notationPreference:notation,onboardingComplete:true,progress:{single:skip?6:1,melody:1}});TuningMatrixEngine.setActiveTuning(tuning);onDone();};
 const choice=(label:string,selected:boolean,fn:()=>void)=><TouchableOpacity key={label} onPress={fn} style={[s.choice,selected&&s.selected]}><Text style={s.text}>{label}</Text></TouchableOpacity>;
 return <View style={{flex:1,backgroundColor:'#20372d'}}><Image source={{uri:'/images/ingame_bg_single.jpg'}} style={[StyleSheet.absoluteFillObject,{opacity:.5}]}/><ScrollView contentContainerStyle={s.page}>
 <Reveal key={step} style={{width:'100%',gap:22}}><Text style={s.eyebrow}>EARPA · YOUR JOURNEY</Text><Text style={s.title}>{['What shall we call you?','Make it yours','Your harp’s native tuning','How do you name notes?','Your experience','Where shall we begin?'][step]}</Text>
 {step===0&&<TextInput autoFocus accessibilityLabel="Your name" placeholder="Your name" placeholderTextColor="#baad92" value={name} onChangeText={setName} style={s.input}/>}
 {step===1&&<PhotoPicker uri={photo} name={name} onChange={setPhoto}/>}
 {step===2&&(['Eb_Major_Native','C_Major_Native','Bb_Major_Native'] as const).map((v,i)=>choice(['E♭ major','C major','B♭ major'][i],tuning===v,()=>{setTuning(v);setStep(3);} ))}
 {step===3&&(['numbers','solfege','notes'] as const).map((v,i)=>choice(['1 · 2 · 3 — degrees','Do · Re · Mi — solfège','C · D · E — note names'][i],notation===v,()=>{setNotation(v);setStep(4);} ))}
 {step===4&&(['Beginner Harper','Apprentice Bard','Master Harper'] as const).map((v,i)=>choice(['I’m beginning','I have some experience','I’m confident'][i],experience===v,()=>{setExperience(v);setSkip(false);setStep(5);} ))}
 {step===5&&<>{choice('Start with the foundations',!skip,()=>setSkip(false))}{experience!=='Beginner Harper'&&choice('Skip the first five · begin at level 6',skip,()=>setSkip(true))}<Text style={s.small}>You can revisit every lesson along the path.</Text></>}
 {(step<2||step===5)&&<TouchableOpacity disabled={step===0&&!name.trim()} onPress={()=>step===5?save():setStep(step+1)} style={[s.choice,s.selected,{opacity:step===0&&!name.trim()?0.4:1}]}><Text style={s.text}>{step===5?'Begin journey':step===1&&!photo?'Continue without a photo':'Continue'} →</Text></TouchableOpacity>}
 {step>0&&<TouchableOpacity onPress={()=>setStep(step-1)}><Text style={s.small}>‹ Back</Text></TouchableOpacity>}</Reveal>
 </ScrollView><View style={{padding:24,gap:12}}><View accessibilityLabel={`Setup step ${step+1} of 6`} style={{height:3,backgroundColor:'#617263',borderRadius:3}}><View style={{height:3,width:`${(step+1)/6*100}%`,backgroundColor:'#e0c18b'}}/></View><Text style={s.small}>{step+1} / 6 · Saved on this browser</Text></View></View>
}
const s=StyleSheet.create({page:{flexGrow:1,padding:28,justifyContent:'center'},eyebrow:{color:'#d0bd96',textAlign:'center',fontSize:11,letterSpacing:3},title:{fontFamily:'Cinzel-Bold',fontSize:32,lineHeight:42,color:'#f2e3c4',textAlign:'center'},text:{color:'#f0dfbd',fontSize:17,textAlign:'center'},small:{color:'#c0b59d',fontSize:12,lineHeight:19,textAlign:'center'},input:{color:'#f0dfbd',borderBottomWidth:1,borderColor:'#b39b70',padding:16,fontSize:24,textAlign:'center'},choice:{padding:18,borderWidth:1,borderColor:'rgba(218,197,153,.25)',borderRadius:14,backgroundColor:'rgba(26,44,34,.5)'},selected:{borderColor:'#c3a36d',backgroundColor:'rgba(195,163,109,.15)'}});
