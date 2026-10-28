import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {Harp3DCanvas} from '../earpa/Harp3DCanvas';
import suite from './suite.json';
type Props={suiteId:keyof typeof suite};
const gold='#e3c88e',cream='#f2ead8';
const fifths=['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];
function Wheel({root,tonic=root}:{root:string;tonic?:string}){return <svg width="440" height="440" viewBox="0 0 440 440"><circle cx="220" cy="220" r="170" fill="#102b26" stroke={gold} strokeWidth="2"/>{fifths.map((k,i)=>{const a=(i*30-90)*Math.PI/180,x=220+170*Math.cos(a),y=220+170*Math.sin(a);return <g key={k}><circle cx={x} cy={y} r="26" fill={k===root?gold:'#1b3730'} stroke={gold}/><text x={x} y={y+7} textAnchor="middle" fontSize="22" fill={k===root?'#15251e':cream}>{k.replace('b','♭')}</text></g>})}<text x="220" y="220" textAnchor="middle" fontSize="32" fill={cream}>{tonic.replace('b','♭')}</text><text x="220" y="252" textAnchor="middle" fontSize="18" fill={gold}>hear your home note</text></svg>}
function Scene({shot,index,kind,duration}:{shot:any;index:number;kind:string;duration:number}){
 const frame=useCurrentFrame(),{fps,width,height}=useVideoConfig();
 const vertical=width<height,calm=kind==='lesson'||kind==='masterclass';
 const enter=spring({frame,fps,config:{damping:22,stiffness:145}});
 const exit=interpolate(frame,[duration-10,duration],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const phone=vertical&&!calm;const showScreen=phone&&index>0;
 const lever=shot.screen==='camac_levers';const configs:Record<string,number[]>={Eb:[],Bb:[6],F:[6,3],C:[6,3,7],G:[6,3,7,4],D:shot.mode==='dorian'?[6,3,7]:[6,3,7,4,1,8]};
 const leverEvents=lever?(configs[shot.root]||[]).map((leverNum,i)=>({leverNum,flipFrame:calm?0:20+i*12})):[];
 const plucks=Array.from({length:16},(_,i)=>({stringNum:(i%8)+1,startFrame:30+i*15,amplitude:.018}));
 return <AbsoluteFill style={{opacity:exit,color:cream,background:'radial-gradient(ellipse at 65% 42%,#23463a 0%,#0a1718 60%,#071010 100%)',fontFamily:'Georgia,serif'}}>
  <div style={{position:'absolute',inset:40,border:'1px solid rgba(227,200,142,.15)',borderRadius:vertical?64:28}}/>
  <div style={{position:'absolute',top:vertical?105:90,left:vertical?90:110,right:vertical?90:900,translate:`0px ${(1-enter)*55}px`,opacity:enter}}>
   <div style={{fontFamily:'Arial',fontSize:vertical?23:20,letterSpacing:6,color:gold,marginBottom:25}}>EARPA · {calm?'LISTEN & LEARN':'PLAY BY EAR'}</div>
   <div style={{fontSize:vertical?68:76,lineHeight:1.12,fontWeight:400}}>{shot.title}</div>
   {!phone&&<div style={{fontFamily:'Arial',fontSize:vertical?34:29,lineHeight:1.5,color:'#b9c9bd',marginTop:26}}>{shot.detail}</div>}
  </div>
  {showScreen?<div style={{position:'absolute',top:420,left:125,width:830,height:1250,borderRadius:86,padding:17,background:'linear-gradient(135deg,#b4b3ab,#454642 30%,#bebcb2 80%,#555)',boxShadow:'0 45px 110px #0009',transform:`perspective(2000px) rotateY(${Math.sin(frame/65)*3}deg) translateY(${(1-enter)*90}px)`}}><Img src={staticFile(`textures/real/app_screen_${shot.screen}.png`)} style={{width:'100%',height:'100%',objectFit:'contain',borderRadius:70,background:'#071010'}}/><div style={{position:'absolute',top:28,left:330,width:170,height:44,borderRadius:30,background:'#080a09'}}/></div>:
  <div style={{position:'absolute',left:vertical?40:880,top:vertical?430:50,transform:`translateY(${(1-enter)*70}px)`}}><Harp3DCanvas width={vertical?1000:1000} height={vertical?1000:980} theta={-.85+Math.sin(frame/(calm?220:80))*(calm?.12:.38)} phi={1.32} radius={kind==='masterclass'&&index===1?1.25:2.65} targetY={kind==='masterclass'&&index===1?.85:.49} harpScale={.73} tiltZ={calm?0:Math.sin(frame/90)*.025} pluckEvents={plucks} leverEvents={leverEvents}/></div>}
  {lever&&calm&&!(kind==='masterclass'&&index===1)&&<div style={{position:'absolute',top:1250,left:170,right:170,display:'flex',justifyContent:'space-between'}}>{[...'CDEFGABC'].map((letter,i)=>{const up=leverEvents.some(e=>e.leverNum===i+1&&frame>=e.flipFrame);return <div key={i} style={{textAlign:'center',color:up?gold:'#93a79a',fontFamily:'Arial',fontSize:23}}><div style={{height:42,width:8,borderRadius:5,background:up?gold:'#62796c',margin:'0 auto 12px',transform:`rotate(${up?25:-25}deg)`}}/>{letter}{[2,5,6].includes(i)&&!up?'♭':[0,1,3,4,7].includes(i)&&up?'♯':''}{i===7?'⁵':''}<div style={{fontSize:15,marginTop:7}}>{up?'UP':'DOWN'}</div></div>})}</div>}
  {kind==='masterclass'&&index===1&&<div style={{position:'absolute',top:430,left:150,right:150,color:gold,fontFamily:'Arial',fontSize:28,textAlign:'center'}}>Shorter speaking length → higher pitch<div style={{margin:'24px auto',height:4,width:560*(frame<45?1:.94387),background:gold}}/>L → 0.944 L · one semitone</div>}
  {lever&&calm&&!(kind==='masterclass'&&index===1)&&<div style={{position:'absolute',left:vertical?320:150,top:vertical?1320:460,scale:vertical?.8:1}}><Wheel root={shot.mode==='dorian'?'C':shot.root} tonic={shot.root}/></div>}
  {!calm&&<div style={{position:'absolute',top:vertical?1710:820,left:vertical?130:110,right:vertical?130:1020,height:75,display:'flex',gap:vertical?10:8,alignItems:'center'}}>{Array.from({length:36},(_,i)=><div key={i} style={{flex:1,height:12+63*Math.exp(-((frame+i*2)%15)/6)*(0.5+0.5*Math.sin(i*.8)**2),borderRadius:6,background:'linear-gradient(#f2db99,#689c87)'}}/>)}</div>}
  {phone&&<div style={{position:'absolute',bottom:92,left:100,right:100,textAlign:'center',fontFamily:'Arial',fontSize:32,lineHeight:1.4,color:'#d2dbce'}}>{shot.detail}</div>}
  {calm&&<div style={{position:'absolute',bottom:65,left:90,right:90,fontFamily:'Arial',fontSize:22,color:'#b5bdb2'}}>ANIMATED DEMONSTRATION · {index+1}</div>}
 </AbsoluteFill>;
}
export function MotionSuite({suiteId}:Props){
 const data=suite[suiteId],{fps}=useVideoConfig();const frames=data.seconds*fps;
 const duration=Math.floor(frames/data.shots.length);
 return <AbsoluteFill><Audio src={staticFile(`audio/mission/${suiteId}.mp3`)}/>{data.shots.map((shot,i)=><Sequence key={i} from={i*duration} durationInFrames={i===data.shots.length-1?frames-i*duration:duration} premountFor={fps}><Scene shot={shot} index={i} kind={data.kind} duration={duration}/></Sequence>)}
 {data.kind==='master'&&<Sequence from={930} durationInFrames={420} premountFor={fps}><OffthreadVideo src={staticFile('videos/earpa_45s_v5_clean_solo_master.mp4')} startFrom={930} muted style={{width:'100%',height:'100%'}}/></Sequence>}
 </AbsoluteFill>;
}
