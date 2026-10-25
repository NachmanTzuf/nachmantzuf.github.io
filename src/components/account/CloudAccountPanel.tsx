import React,{useState,useEffect} from 'react';
import {View,Text,TextInput,TouchableOpacity} from 'react-native';
import {cloud,syncCloudAccount} from '../../services/account/CloudAccounts';
export function CloudAccountPanel(){
 const [email,setEmail]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 const sync=async()=>{setBusy(true);try{const who=await syncCloudAccount();setMessage(`Saved and synced · ${who}`);}catch(e:any){setMessage(e.message);}finally{setBusy(false);}};
 useEffect(()=>{if(!cloud)return; cloud.auth.getSession().then(({data})=>{if(data.session)void sync();});},[]);
 if(!cloud)return <Text style={{color:'#b8ad97',fontSize:12,textAlign:'center',margin:14}}>Email accounts are being prepared. Local profiles remain saved on this browser.</Text>;
 return <View style={{padding:16,gap:10}}><Text style={{color:'#ead6af',fontFamily:'Cinzel-Bold',fontSize:18}}>Your email account</Text>
 <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" accessibilityLabel="Email address" placeholder="Email address" placeholderTextColor="#b9ac95" style={{color:'#efdfbd',padding:12,borderBottomWidth:1,borderColor:'#ac9062'}}/>
 <TouchableOpacity disabled={busy} onPress={async()=>{if(!email.includes('@')){setMessage('Enter your email address.');return;}setBusy(true);try{const {error}=await cloud!.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}});if(error)throw error;setMessage('Check your email for a sign-in link.');}catch(e:any){setMessage(e.message);}finally{setBusy(false);}}}><Text style={{color:'#e4c88e',padding:10}}>Send sign-in link →</Text></TouchableOpacity>
 <TouchableOpacity disabled={busy} onPress={sync}><Text style={{color:'#e4c88e',padding:10}}>Sync my account</Text></TouchableOpacity>
 <Text accessibilityLiveRegion="polite" style={{color:'#cfc1a8',fontSize:12}}>{busy?'Connecting…':message}</Text></View>;
}
