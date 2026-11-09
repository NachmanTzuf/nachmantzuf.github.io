import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,Freeze,staticFile,useCurrentFrame,interpolate,Easing} from 'remotion';
import {Harp3DCanvas} from './CurrentHarp';
const gold='#ddc891',cream='#f6efdc',ink='#091c18';
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const enter=(f:number,n=16)=>Easing.bezier(.16,1,.3,1)(Math.max(0,Math.min(1,f/n)));
export function Field({children}:{children:React.ReactNode}){const f=useCurrentFrame();return <AbsoluteFill style={{background:ink,color:cream,fontFamily:'Arial',overflow:'hidden'}}><AbsoluteFill style={{background:'radial-gradient(ellipse at 55% 45%,#375844,#122f25 48%,#071b16 90%)'}}/><svg width="1080" height="1920" style={{position:'absolute',opacity:.15}}><defs><pattern id="braid" width="240" height="240" patternUnits="userSpaceOnUse"><path d="M0 120Q120 -40 240 120Q120 280 0 120M120 0Q-40 120 120 240Q280 120 120 0" stroke={gold} fill="none"/></pattern></defs><rect width="1080" height="1920" fill="url(#braid)"/></svg><div style={{position:'absolute',left:-160,top:560,width:1400,height:600,border:'2px solid #ddc89118',borderRadius:'50%',transform:`perspective(1200px) rotateX(65deg) rotateZ(${f*.06}deg)`}}/>{children}</AbsoluteFill>}
function Phone({image,clip,start=0,freeze,w=650}:{image?:string;clip?:string;start?:number;freeze?:number;w?:number}){const content=image?<Img src={staticFile(image)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<OffthreadVideo muted src={staticFile(clip!)} startFrom={Math.round(start*30)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>;return <div style={{width:w,height:w*852/393,padding:6,background:'linear-gradient(130deg,#a1b19c,#23372b 35%,#a5ab96 55%,#26372d)',borderRadius:w*.095,boxShadow:'0 32px 65px #0008'}}><div style={{position:'relative',width:'100%',height:'100%',overflow:'hidden',borderRadius:w*.08}}>{freeze!==undefined?<Freeze frame={Math.round(freeze*30)}>{content}</Freeze>:content}</div></div>}
function Beads({values,active=0,small=false}:{values:string[];active?:number;small?:boolean}){const f=useCurrentFrame();return <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:small?6:28,perspective:900}}>{values.map((n,i)=>{const p=enter(f-i*4,15);return <React.Fragment key={i}>{i>0&&<span style={{color:gold,fontSize:small?20:55,opacity:p}}>›</span>}<div style={{flexShrink:0,width:small?80:120,height:small?80:120,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:small?42:58,fontFamily:'Georgia',border:'1px solid #ddc89188',color:i===active?ink:cream,background:i===active?'radial-gradient(circle at 32% 22%,#fff6ce,#d8b65d 60%,#806329)':'radial-gradient(circle at 32% 22%,#4d745c,#173c2b 60%,#071b16)',boxShadow:'inset -8px -12px 24px #0005,0 16px 20px #0005',transform:`translateY(${(1-p)*70+(i===active?Math.sin(f*.1)*4:0)}px) rotateY(${(1-p)*75}deg)`,opacity:p}}>{n}</div></React.Fragment>})}</div>}
function Wave({bars=false}:{bars?:boolean}){const f=useCurrentFrame();return <svg width="930" height="360" viewBox="0 0 930 360">{Array.from({length:48},(_,i)=>{const h=25+(Math.sin(i*.6-f*.13)*.5+.5)*(80+90*Math.sin(i*.13)**2);return <rect key={i} x={i*19+8} y={180-h/2} width={bars?12:5} height={h} rx="4" fill={i%4===0?gold:'#87af91'} opacity={.5+(i%5)/10}/>})}</svg>}
function Wheel({target=0}:{target?:number}){const f=useCurrentFrame();const keys=['E♭','B♭','F','C','G','D','A','E','B','F♯','D♭','A♭'];const active=target===2?2:Math.min(2,Math.floor(f/45));return <div style={{width:900,height:900,position:'relative',perspective:1400}}><svg width="900" height="900"><circle cx="450" cy="450" r="318" stroke="#ddc89155" strokeWidth="3" fill="none"/><circle cx="450" cy="450" r="235" stroke="#ddc89122" strokeWidth="22" fill="none"/>{keys.map((k,i)=>{const a=(i-3)*Math.PI*2/12,x=450+Math.cos(a)*318,y=450+Math.sin(a)*318;return <g key={k}><circle cx={x} cy={y} r="45" fill={i<=active?gold:'#163b2b'} stroke={gold}/><text x={x} y={y+18} textAnchor="middle" fill={i<=active?ink:cream} fontSize="40">{k}</text></g>})}<text x="450" y="425" textAnchor="middle" fill={gold} fontSize="60">+1 group</text><text x="450" y="500" textAnchor="middle" fill={cream} fontSize="42">A → E → B</text></svg></div>}
export const AD_SHOTS=[
 {from:0,to:90,title:'Play by ear.',kind:'harp'},
 {from:90,to:160,title:'Let it flow.',kind:'wave'},
 {from:160,to:235,title:'A trained ear.',kind:'home'},
 {from:235,to:315,title:'Listen deliberately.',kind:'bars'},
 {from:315,to:400,title:'One note. A feeling.',kind:'beads'},
 {from:400,to:475,title:'Hear the relationship.',kind:'orbit'},
 {from:475,to:550,title:'Listen. Recognise.',kind:'game'},
 {from:550,to:620,title:'A little, every day.',kind:'journey'},
 {from:620,to:700,title:'First, find home.',kind:'cadence'},
 {from:700,to:775,title:'Feel the pull.',kind:'gravity'},
 {from:775,to:850,title:'Hear it resolve.',kind:'resolution'},
 {from:850,to:930,title:'Watch yourself grow.',kind:'map'},
 {from:930,to:1000,title:'Single notes.',kind:'home'},
 {from:1000,to:1070,title:'Melodic patterns.',kind:'melody'},
 {from:1070,to:1140,title:'Real 3D levers.',kind:'lever'},
 {from:1140,to:1200,title:'Three paths. One ear.',kind:'trio'},
 {from:1200,to:1270,title:'Stop guessing.',kind:'harp'},
 {from:1270,to:1350,title:'Speak through your instrument.',kind:'final'},
];
function AdScene({shot}:{shot:typeof AD_SHOTS[number]}){const f=useCurrentFrame(),p=enter(f),k=shot.kind;const phoneImages:Record<string,string>={home:'home-single',melody:'home-melody',journey:'journey-stats',map:'map-single'};return <>
 <div style={{position:'absolute',left:85,top:100,fontSize:42,letterSpacing:9,color:gold}}>EARPA / PLAY BY EAR</div>
 <div style={{position:'absolute',left:85,right:85,top:195,fontFamily:'Georgia',fontSize:88,lineHeight:1.06,transform:`translateY(${(1-p)*65}px)`,opacity:p,zIndex:3}}>{shot.title}</div>
 {['harp','orbit','lever','final'].includes(k)?<div style={{position:'absolute',left:15,top:k==='lever'?430:400,transform:`translateX(${(1-p)*200}px)`,opacity:p}}><Harp3DCanvas width={1050} height={1250} theta={k==='lever'?1.0:1.05+f*.006} radius={2.5} targetY={.55} phi={1.28} harpScale={.77} leverEvents={k==='lever'?[{leverNum:6,flipFrame:20}]:[]} pluckEvents={[{stringNum:1,startFrame:15},{stringNum:3,startFrame:25},{stringNum:5,startFrame:35}]}/></div>:
 phoneImages[k]||k==='game'?<div style={{position:'absolute',left:214,top:400,transform:`perspective(1600px) translateY(${(1-p)*100}px) rotateY(${(1-p)*-28}deg)`,opacity:p}}><Phone w={640} image={phoneImages[k]?'plus/'+phoneImages[k]+'.png':undefined} clip={k==='game'?'refined/single-round-4.mp4':undefined}/></div>:
 k==='trio'?<div style={{position:'absolute',top:590,left:47,display:'flex',gap:21}}>{['single','melody','levers'].map((n,i)=><div key={n} style={{transform:`translateY(${(1-enter(f-i*5))*180+(i===1?-65:65)}px)`,opacity:enter(f-i*5)}}><Phone w={300} image={'plus/home-'+n+'.png'}/><div style={{fontSize:42,textAlign:'center',marginTop:22,color:gold}}>{['Single','Melody','Levers'][i]}</div></div>)}</div>:
 k==='wave'||k==='bars'?<div style={{position:'absolute',left:75,top:650}}><Wave bars={k==='bars'}/><div style={{fontSize:78,fontFamily:'Georgia',textAlign:'center',marginTop:70,color:gold}}>{k==='wave'?'Instinct in motion':'Train your listening'}</div><div style={{marginTop:90}}><Beads values={['Hear','Feel','Play']} active={Math.min(2,Math.floor(f/24))} small={false}/></div></div>:
 <div style={{position:'absolute',left:70,right:70,top:650}}>{k==='cadence'?<><Beads values={['I','IV','V','I']} active={Math.min(3,Math.floor(f/18))}/><div style={{marginTop:100,fontSize:64,textAlign:'center'}}>A musical home</div></>:k==='gravity'?<><div style={{height:400,position:'relative'}}>{['4','3','2','1'].map((n,i)=><div key={n} style={{position:'absolute',left:80+i*210,top:interpolate(f,[i*10,i*10+25],[0,120+i*35],clamp)}}><Beads values={[n]} active={0}/></div>)}</div><div style={{fontSize:64,textAlign:'center'}}>Each note has a direction</div></>:<><Beads values={k==='resolution'?['4','3','2','1']:['1','2','3']} active={Math.min(k==='resolution'?3:2,Math.floor(f/20))}/><div style={{marginTop:90}}><Wave/></div></>}</div>}
 {k==='final'&&<div style={{position:'absolute',bottom:150,left:85,right:85,fontFamily:'Georgia',fontSize:95,color:gold,textAlign:'center'}}>EARPA</div>}
 </>}
export function V5PulseVertical(){return <Field><Audio src={staticFile('plus/marketing-mix.wav')}/>{AD_SHOTS.map(s=><Sequence key={s.from} from={s.from} durationInFrames={s.to-s.from}><AdScene shot={s}/></Sequence>)}</Field>}

type LessonShot={from:number;to:number;title:string;image?:string;clip?:string;start?:number;freeze?:number;label:string;values?:string[];mode?:string};
export const SINGLE:LessonShot[]=[
 {from:0,to:4,title:'Welcome to Earpa',clip:'plus/app-loading.mp4',label:'Single notes · a real session',mode:'harp'},
 {from:4,to:13,title:'Press Play. Listen.',clip:'refined/single-launch.mp4',label:'The cadence establishes home',values:['I','IV','V','I']},
 {from:13,to:19,title:'Guess what you heard',clip:'refined/single-answer-one.mp4',label:'Correct answer: 1 · Do',values:['1']},
 {from:19,to:25,title:'Listen again',clip:'refined/single-answer-three.mp4',start:6,label:'Chords first. Then one note.',values:['I','IV','V','I']},
 {from:25,to:31,title:'Correct: 2 → 1',clip:'refined/single-round-4.mp4',label:'Re returns to Do',values:['2','1']},
 {from:31,to:37,title:'A fresh round',clip:'refined/single-round-4.mp4',start:5,label:'Listen before you choose',values:['I','IV','V','I']},
 {from:37,to:43,title:'Already home',clip:'refined/single-round-5.mp4',label:'Degree 1 feels at rest',values:['1']},
 {from:43,to:46,title:'Later rounds',clip:'refined/single-round-8.mp4',start:1.5,label:'Edited forward · same real session',mode:'wave'},
 {from:46,to:49,title:'Keep listening',clip:'refined/single-round-13.mp4',start:1.5,label:'Later rounds · edited forward',mode:'wave'},
 {from:49,to:52,title:'Finish the level',clip:'refined/single-round-15.mp4',start:1.5,label:'Round 15 · hear the correction',values:['2','1']},
 {from:52,to:60,title:'Your next step',image:'refined/single-results.png',label:'8 / 15 · practise degree 2',mode:'harp'},
];
export const LEVER:LessonShot[]=[
 {from:0,to:8,title:'One lever. One semitone.',clip:'refined/lever-physical-change.mp4',freeze:3.5,label:'A small motion changes the pitch',mode:'lever'},
 {from:8,to:17,title:'One step around the circle',label:'E♭ harp · raise A, then E, then B',mode:'wheel'},
 {from:17,to:24,title:'E♭ → B♭ major',clip:'refined/lever-physical-change.mp4',freeze:0,label:'3 flats − 1 flat = 2 flats',values:['A♭','A']},
 {from:24,to:28,title:'Tap the actual lever',clip:'refined/lever-physical-change.mp4',label:'Raise A. Keep the others down.',mode:'lever'},
 {from:28,to:35,title:'Confirm. Then listen.',clip:'refined/lever-correct.mp4',label:'B♭ major · root to root',values:['B♭','C','D','E♭','F','G','A','B♭']},
 {from:35,to:42,title:'Every lever is checked',clip:'refined/lever-correct.mp4',freeze:6.9,label:'The whole scale must match',values:['✓']},
 {from:42,to:49,title:'An earlier E♭ attempt',clip:'refined/lever-wrong.mp4',label:'Earlier example · A was left raised',values:['A','A♭']},
 {from:49,to:56,title:'One clear correction',clip:'refined/lever-wrong.mp4',freeze:6.9,label:'7 / 8 correct · lower A',values:['A','A♭']},
 {from:56,to:60,title:'Lower the physical lever',clip:'refined/lever-lower.mp4',label:'A returns to A♭',mode:'lever'},
 {from:60,to:69,title:'Hear the full scale',clip:'refined/lever-completion.mp4',label:'E♭ major · root to root',values:['E♭','F','G','A♭','B♭','C','D','E♭']},
 {from:69,to:77,title:'A complete level',image:'refined/lever-score.png',label:'3 / 4 scales matched',values:['3','4','5']},
 {from:77,to:85,title:'Next: add E as well',label:'Raise A + E · F major · 1 flat',mode:'wheel'},
 {from:85,to:90,title:'Build. Confirm. Listen.',image:'refined/lever-score.png',label:'3 rounds, then 4, then at most 5',mode:'harp'},
];
export const MELODY:LessonShot[]=[
 {from:0,to:5,title:'Hear a whole pattern',image:'plus/home-melody.png',label:'Melody · a real practice session',mode:'harp'},
 {from:5,to:15,title:'Home. Then two notes.',clip:'plus/melody-launch.mp4',label:'Listen to the order',values:['I','IV','V','I']},
 {from:15,to:18,title:'Choose the first note',clip:'plus/melody-first-answer.mp4',label:'One answer entered. One still to go.',values:['1','?']},
 {from:18,to:23,title:'Now the second note',clip:'plus/melody-answer.mp4',label:'Not quite · the answer was 2 → 2',values:['2','2']},
 {from:23,to:29,title:'Hear the exact pattern',clip:'plus/melody-answer.mp4',freeze:2.4,label:'The app replays both correct notes',values:['2','2']},
 {from:29,to:35,title:'A later attempt',clip:'plus/melody-round2-answer.mp4',start:4,label:'Listen again · new melody',values:['I','IV','V','I']},
 {from:35,to:41,title:'Correct: 1 → 2',clip:'plus/melody-round3-answer.mp4',label:'Right notes. Right order.',values:['1','2']},
 {from:41,to:46,title:'Repeat the pattern',clip:'plus/melody-round3-answer.mp4',freeze:2.1,label:'Replay the melody · no scale walk',values:['1','2']},
 {from:46,to:49,title:'Later rounds',clip:'plus/melody-round8-answer.mp4',start:.4,label:'Edited forward · real session',mode:'wave'},
 {from:49,to:52,title:'Keep the order',clip:'plus/melody-round15-answer.mp4',start:.4,label:'Final round · listen to feedback',mode:'wave'},
 {from:52,to:60,title:'See what comes next',image:'plus/melody-results.png',label:'3 / 15 · practise degree 1',mode:'harp'},
];
function TeachingShot({s,track}:{s:LessonShot;track:string}){const f=useCurrentFrame(),p=enter(f,20),wheel=s.mode==='wheel',side=s.mode==='harp'||s.mode==='lever',pw=side?500:530;const g=s.from+f/30;let active=-1;if(s.values){const onset=track==='levers'&&s.from===28?30.32:track==='levers'&&s.from===60?62.31:track==='single'&&s.from===25?27.25:track==='single'&&s.from===4?7.6:track==='single'&&s.from===19?19.7:track==='single'&&s.from===31?32.65:track==='melody'&&s.from===5?6:track==='melody'&&s.from===18?19.1:track==='melody'&&s.from===35?36.1:s.from;const beat=s.values.length>4?.55:s.values[0]==='I'?.95:track==='melody'?1:.95;active=g<onset?-1:Math.min(s.values.length-1,Math.floor((g-onset)/beat));}return <>
 <div style={{position:'absolute',left:115,right:90,top:140,fontFamily:'Georgia',fontSize:80,lineHeight:1.08,opacity:p,transform:`translateY(${(1-p)*25}px)`,zIndex:3}}>{s.title}</div>
 {wheel?<div style={{position:'absolute',left:90,top:440}}><Wheel target={s.from===77?2:0}/><div style={{marginTop:65}}><Beads values={s.from===77?['A','E']:['E♭','B♭','F']} active={s.from===77?1:Math.min(2,Math.floor(f/45))}/></div></div>:<div style={{position:'absolute',left:side?115:(1080-pw-12)/2,top:340,transform:`perspective(1600px) rotateY(${(1-p)*8}deg)`,opacity:p}}><Phone w={pw} image={s.image} clip={s.clip} start={s.start} freeze={s.freeze}/></div>}
 {side&&(s.mode==='lever'?<div style={{position:'absolute',left:650,top:650,width:310,height:600,border:'2px solid #ddc89166',borderRadius:32,overflow:'hidden',background:'radial-gradient(ellipse,#386049,#102c22)',boxShadow:'0 20px 45px #0005'}}><div style={{position:'absolute',top:22,left:0,right:0,textAlign:'center',color:gold,fontSize:34,zIndex:3}}>Lever detail</div><Harp3DCanvas width={310} height={600} theta={1} radius={1.1} targetY={.95} phi={1.3} harpScale={.73} leverEvents={[{leverNum:6,flipFrame:50,unflipFrame:s.from===56?78:undefined}]}/></div>:<div style={{position:'absolute',left:650,top:750,width:310,height:650}}><Harp3DCanvas width={310} height={650} theta={1.15+f*.0015} radius={2.7} targetY={.5} phi={1.3} harpScale={.73} pluckEvents={[{stringNum:1,startFrame:25},{stringNum:2,startFrame:60}]}/></div>)}
 <div style={{position:'absolute',left:90,right:90,bottom:100,zIndex:5,textAlign:'center'}}>
 {s.values&&<div style={{marginBottom:30}}><Beads values={s.values} active={active} small={s.values.length>4}/></div>}
 {s.mode==='wave'&&<div style={{height:150,overflow:'hidden',marginBottom:20,transform:'scaleY(.5)',transformOrigin:'bottom'}}><Wave/></div>}
 <div style={{color:gold,fontSize:58,lineHeight:1.15,background:'linear-gradient(90deg,transparent,#112c23ee,transparent)',padding:'12px 0'}}>{s.label}</div>
 </div>
 </>}
export function MotionLesson({track='single'}:{track?:'single'|'melody'|'levers'}){const f=useCurrentFrame(),shots=track==='single'?SINGLE:track==='melody'?MELODY:LEVER,total=track==='levers'?90:60;return <Field><Audio src={staticFile(track==='melody'?'plus/melody-mix.wav':'refined/'+track+'-mix.wav')}/>{shots.map(s=><Sequence key={s.from} from={s.from*30} durationInFrames={(s.to-s.from)*30}><TeachingShot s={s} track={track}/></Sequence>)}<div style={{position:'absolute',bottom:55,left:115,right:115,height:4,background:'#ffffff25'}}><div style={{height:4,width:`${f/(total*30)*100}%`,background:gold}}/></div></Field>}




