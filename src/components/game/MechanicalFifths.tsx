import React,{useEffect,useRef,useState} from 'react';
import {View,Text,Animated,TouchableOpacity} from 'react-native';
import {NativeHarpTuning,PLAYABLE_MAJOR_KEYS,TUNING_STRING_BASELINES,StringLetter} from '../../services/curriculum/TuningMatrixEngine';
import {FIFTHS,solveLevers,signatureOf} from '../../services/curriculum/LeverLessonEngine';
export function MechanicalFifths({tuning,selected,onSelect}:{tuning:NativeHarpTuning;selected:string;onSelect?:(key:string)=>void}){
 const angle=useRef(new Animated.Value(0)).current;const previous=useRef(0);const [unavailable,setUnavailable]=useState('');
 useEffect(()=>{const i=FIFTHS.indexOf(selected==='C#'?'Db':selected);let next=-i*30;while(next-previous.current>180)next-=360;while(next-previous.current< -180)next+=360;previous.current=next;Animated.spring(angle,{toValue:next,useNativeDriver:false,damping:20,stiffness:130}).start();},[selected]);
 const config=solveLevers(tuning,selected,'major'); const sig=signatureOf(selected);
 return <View style={{alignItems:'center',gap:12}}>
 <View style={{width:280,height:280}}><Animated.View pointerEvents="none" style={{position:'absolute',inset:15,borderRadius:125,borderWidth:4,borderStyle:'dotted',borderColor:'#9c8050',transform:[{rotate:angle.interpolate({inputRange:[-3600,3600],outputRange:['-3600deg','3600deg']})}]}}/>
 {FIFTHS.map((key,i)=>{const alias=key==='Db'&&tuning==='C_Major_Native'?'C#':key;const available=PLAYABLE_MAJOR_KEYS[tuning].includes(alias);const a=(i*30-90)*Math.PI/180;return <TouchableOpacity key={key} accessibilityRole="button" accessibilityLabel={`${alias} major${available?'':', requires retuning'}`} accessibilityState={{selected:alias===selected}} onPress={()=>{if(available){setUnavailable('');onSelect?.(alias);}else setUnavailable(`${alias} major requires retuning this harp.`);}} style={{position:'absolute',left:119+108*Math.cos(a),top:119+108*Math.sin(a),width:42,height:42,borderRadius:21,alignItems:'center',justifyContent:'center',backgroundColor:alias===selected?'#bca16d':'#304136',borderWidth:1,borderColor:available?'#bba478':'#606458'}}><Text style={{color:alias===selected?'#203327':available?'#edddba':'#aaa',fontSize:14}}>{alias.replace('b','♭').replace('#','♯')}</Text></TouchableOpacity>})}
 <View pointerEvents="none" style={{position:'absolute',top:108,left:65,right:65,alignItems:'center'}}><Text style={{color:'#ead6aa',fontSize:27}}>{selected.replace('b','♭')}</Text><Text style={{color:'#d3c09a',fontSize:12}}>{sig===0?'No accidentals':`${Math.abs(sig)} ${sig<0?'flats':'sharps'}`}</Text></View></View>
 {config&&<View style={{flexDirection:'row',gap:5}}>{[...'CDEFGABC'].map((l,i)=><View key={i} style={{alignItems:'center',width:29}}><View style={{width:5,height:30,borderRadius:3,backgroundColor:config[l as StringLetter]?'#e4bf70':'#768079',transform:[{rotate:config[l as StringLetter]?'25deg':'-25deg'}]}}/><Text style={{color:'#edddba',fontSize:11}}>{l}{i===7?'⁵':''}</Text><Text style={{color:'#cdbd9e',fontSize:9}}>{config[l as StringLetter]?'UP':'DOWN'}</Text></View>)}</View>}
 {!!unavailable&&<Text accessibilityRole="alert" style={{color:'#edddba',textAlign:'center'}}>{unavailable}</Text>}
 <Text style={{color:'#cdbd9e',fontSize:12,textAlign:'center'}}>Tap a key to explore. Dim keys require retuning.</Text>
 </View>;
}
