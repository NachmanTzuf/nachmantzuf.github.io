import React,{useState} from 'react';
import {View,Text,TouchableOpacity,Linking,Platform} from 'react-native';
import * as Haptics from 'expo-haptics';
export const FEEDBACK_URL='https://wa.me/972585353148?text='+encodeURIComponent("Hi Nachman, I'm testing Earpa and wanted to share some feedback:");
export function TesterFeedback(){
 const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
 const open=async(sms=false)=>{if(busy)return;setBusy(true);setError('');
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(()=>{});
  try{await Linking.openURL(sms?'sms:+972585353148':FEEDBACK_URL);}catch{
   if(!sms){try{await Linking.openURL('sms:+972585353148');}catch{setError('Unable to open messaging. Contact +972 58 535 3148.');}}
   else setError('Unable to open SMS. Contact +972 58 535 3148.');
  }finally{setBusy(false);}
 };
 return <View style={{gap:8}}><Text style={{color:'#cdbd9e',fontSize:12,letterSpacing:1}}>EARLY TESTER COMMUNITY</Text><TouchableOpacity disabled={busy} accessibilityRole="button" onPress={()=>open()} style={{padding:18,borderRadius:28,backgroundColor:'rgba(255,255,255,.08)',borderWidth:1,borderColor:'rgba(212,175,55,.35)',...(Platform.OS==='web'?{backdropFilter:'blur(20px)'} as any:{})}}><Text style={{color:'#f0d9ab',textAlign:'center',fontSize:16}}>💬 Early Tester Feedback · Direct to Founder</Text><Text style={{color:'#cdbd9e',textAlign:'center',fontSize:12,marginTop:6}}>Tap to send feedback or report a bug directly to our phone</Text></TouchableOpacity><TouchableOpacity disabled={busy} onPress={()=>open(true)}><Text style={{color:'#cdbd9e',textAlign:'center'}}>Prefer SMS? Open a text message</Text></TouchableOpacity>{!!error&&<Text accessibilityRole="alert" style={{color:'#ffd0b8'}}>{error}</Text>}</View>;
}
