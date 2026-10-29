import React,{useEffect,useState} from 'react';
import {View,Text,TouchableOpacity,Modal,Platform,Linking} from 'react-native';
import {UserAccountDatabase} from '../../services/account/UserAccountDatabase';
import {hasCompletedLessonMilestone,LessonTrack} from './lessonVisibility';
type Entry={id:string;title:string;track:string;url:string;seconds:number};
export function LessonLibrary({track,persistent=false}:{track:LessonTrack;persistent?:boolean}){
 const [entries,setEntries]=useState<Entry[]>([]),[selected,setSelected]=useState<Entry|null>(null),[error,setError]=useState(false),[,refresh]=useState(0);
 const db=UserAccountDatabase.getInstance();
 useEffect(()=>db.subscribe(()=>refresh(n=>n+1)),[db]);
 useEffect(()=>{let active=true;fetch('/videos/mission/manifest.json?v=motion-plus-20261029',{cache:'no-store'}).then(r=>r.ok?r.json():[]).then(data=>{if(active&&Array.isArray(data))setEntries(data);}).catch(()=>{});return()=>{active=false;};},[]);
 useEffect(()=>{setSelected(null);setError(false);},[track,db.getActiveProfile().id]);
 const close=()=>{setSelected(null);setError(false);};
 useEffect(()=>{if(!selected||Platform.OS!=='web')return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close();};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[selected]);
 const available=entries.filter(e=>e.track===track);
 const profile=db.getActiveProfile();
 const completed=hasCompletedLessonMilestone(db.getUserSessions(profile.id),track) || (track==='levers' ? (profile.leverStage || 0)+1 : profile.progress?.[track] || 1)>=10;
 if(!available.length||(!persistent&&completed))return null;
 return <>{Platform.OS==='web'&&<style>{`@keyframes lessonGlass {0%,100%{box-shadow:inset 0 1px 1px #ffffff70,0 2px 8px #d4af3712}50%{box-shadow:inset 0 1px 5px #ffffff90,0 2px 14px #d4af3738}} :is(#path-lesson-button,[id^="journey-lesson-"]){backdrop-filter:blur(18px) saturate(150%);background:linear-gradient(120deg,#ffffff30,#ffffff08 50%,#d4af3720);animation:lessonGlass 3.6s ease-in-out infinite;transition:filter .2s} :is(#path-lesson-button,[id^="journey-lesson-"]):hover{filter:brightness(1.15)} @media(prefers-reduced-motion:reduce){:is(#path-lesson-button,[id^="journey-lesson-"]){animation:none}}`}</style>}
 <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Watch ${track==='single'?'single-note':track} lesson`} nativeID={persistent?`journey-lesson-${track}`:"path-lesson-button"} onPress={()=>{setSelected(available[0]);setError(false);}} style={{width:132,minHeight:36,paddingHorizontal:14,paddingVertical:7,justifyContent:'center',borderRadius:18,borderWidth:1,borderColor:'rgba(212,175,55,.35)',backgroundColor:'rgba(25,39,30,.78)',zIndex:30}}><Text style={{color:'#eedcb7',textAlign:'center',fontSize:13}}>▷ {persistent?({single:'Single note',melody:'Melody',levers:'Levers'}[track]):'Quick lesson'}</Text></TouchableOpacity>
 <Modal visible={!!selected} transparent={false} animationType="fade" statusBarTranslucent onRequestClose={close}>
 <View style={{flex:1,backgroundColor:'#10251d'}}>
 {selected&&(Platform.OS==='web'?<video key={selected.id} aria-label={selected.title} autoPlay controls playsInline preload="auto" src={selected.url} onError={()=>setError(true)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',border:0,borderRadius:0,background:'#10251d'}}/>:<TouchableOpacity onPress={()=>Linking.openURL(selected.url)} style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{color:'#eedcb7'}}>Play lesson</Text></TouchableOpacity>)}
 <TouchableOpacity accessibilityRole="button" accessibilityLabel="Home, close lesson" onPress={close} style={{position:'absolute',top:Platform.OS==='web'?12:48,left:14,zIndex:100,minHeight:44,paddingHorizontal:18,justifyContent:'center',borderRadius:24,borderWidth:1,borderColor:'#eedcb755',backgroundColor:'rgba(13,26,20,.78)',...(Platform.OS==='web'?{marginTop:'env(safe-area-inset-top)' as any}:{} )}}><Text style={{color:'#fff5dc',fontSize:16,fontWeight:'600'}}>⌂ Home</Text></TouchableOpacity>
 {error&&<View style={{position:'absolute',left:25,right:25,top:'45%',padding:22,backgroundColor:'#142e25',borderRadius:20}}><Text accessibilityRole="alert" style={{color:'#eedcb7',textAlign:'center'}}>The lesson could not load. Check your connection, return Home and try again.</Text></View>}
 </View></Modal></>;
}
