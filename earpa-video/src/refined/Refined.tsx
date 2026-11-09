import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig,interpolate,Easing,Freeze} from 'remotion';
import {Harp3DCanvas} from '../earpa/Harp3DCanvas';
const gold='#ddc891',cream='#f6efdc',ink='#091c18';
const ease=(f:number,n=22)=>Easing.bezier(.16,1,.3,1)(Math.max(0,Math.min(1,f/n)));
function Back({children}:{children:React.ReactNode}){const f=useCurrentFrame();return <AbsoluteFill style={{background:ink,color:cream,fontFamily:'Arial',overflow:'hidden'}}><AbsoluteFill style={{background:'radial-gradient(ellipse at 65% 42%,#365b47 0%,#142e25 43%,#071611 90%)'}}/><svg width="100%" height="100%" style={{position:'absolute',opacity:.13}}><defs><pattern id="weave" width="180" height="180" patternUnits="userSpaceOnUse"><path d="M0 90 Q90 -30 180 90 Q90 210 0 90M90 0 Q-30 90 90 180 Q210 90 90 0" fill="none" stroke={gold}/></pattern></defs><rect width="100%" height="100%" fill="url(#weave)"/></svg><div style={{position:'absolute',width:900,height:900,border:'1px solid #ddc89118',borderRadius:'50%',left:'40%',top:'12%',transform:`rotate(${f*.03}deg)`}}/>{children}</AbsoluteFill>}
function Device({children,w=700}:{children:React.ReactNode;w?:number}){return <div style={{width:w,height:w*852/393,padding:7,boxSizing:'content-box',borderRadius:w*.1,background:'linear-gradient(135deg,#a4aa9c,#222b24 28%,#a4ab9c 53%,#3c473c)',boxShadow:'0 35px 90px #0008'}}><div style={{position:'relative',width:'100%',height:'100%',overflow:'hidden',borderRadius:w*.085,background:'#10251d'}}>{children}</div></div>}
const imageStyle:React.CSSProperties={width:'100%',height:'100%',objectFit:'cover'};
function Clip({name,start=0}:{name:string;start?:number}){return <OffthreadVideo muted src={staticFile('refined/'+name+'.mp4')} startFrom={Math.round(start*30)} style={imageStyle}/>}
function Still({name}:{name:string}){return <Img src={staticFile(name)} style={name.endsWith('lever-circle.png')?{...imageStyle,width:'103%',maxWidth:'none'}:imageStyle}/>}
function PhoneContent({kind}:{kind:string}){if(kind==='home')return <Still name="refined/home.png"/>;if(kind==='results')return <Still name="refined/single-results.png"/>;if(kind==='map')return <Still name="textures/real/pure_verified_realm_coastal_roadmap.png"/>;if(kind==='melody')return <Still name="textures/real/pure_verified_melody_tab_working.png"/>;return <Clip name={kind}/>;}
const cuts=[0,120,240,400,540,660,810,930,1050,1172,1350];
const titles=['Play by ear.','Let it flow.','Train your musical instinct.','Feel the pull home.','A little practice. A clearer ear.','First, find home.','Hear your progress.','Three ways to grow.','Real levers. Real understanding.','Speak through your instrument.'];
export function RefinedMarketing(){const f=useCurrentFrame(),{width,height}=useVideoConfig(),v=height>width;const i=cuts.findIndex((c,j)=>f>=c&&f<cuts[j+1]),local=f-cuts[i],p=ease(local);const pw=v?680:395;
 return <Back><Audio src={staticFile('refined/marketing-mix.wav')}/>
 <div style={{position:'absolute',left:v?76:110,top:v?70:65,color:gold,fontSize:v?60:36,letterSpacing:7}}>EARPA / PLAY BY EAR</div>
 <div style={{position:'absolute',left:v?76:110,top:v?155:245,width:v?928:820,fontSize:v?78:100,fontFamily:'Georgia',lineHeight:1.08,letterSpacing:-3,opacity:p,transform:`translateY(${(1-p)*55}px)`}}>{titles[i]}</div>
 {i===0||i===8||i===9?<div style={{position:'absolute',left:v?40:900,top:v?440:95,opacity:p,transform:`translateY(${(1-p)*75}px)`}}><Harp3DCanvas width={v?1000:950} height={v?1250:900} theta={i===8?-1.0:1.35+local*.001} phi={1.28} radius={i===8?2.15:2.5} targetY={.55} harpScale={.77} leverEvents={i===8?[{leverNum:6,flipFrame:1090}]:[]} pluckEvents={[{stringNum:5,startFrame:cuts[i]+25,amplitude:.023},{stringNum:3,startFrame:cuts[i]+65,amplitude:.02}]}/></div>:
 i===2||i===3?<div style={{position:'absolute',left:v?70:975,top:v?610:190,width:v?940:800,height:800}}><svg width="100%" height="100%" viewBox="0 0 800 800"><circle cx="400" cy="400" r="300" fill="none" stroke="#ddc89155"/><circle cx="400" cy="400" r="210" fill="none" stroke="#ddc89133"/>{[1,2,3,4,5,6,7].map((d,j)=>{const a=(j/7*Math.PI*2)-Math.PI/2,rad=i===3?Math.max(20,280-local*1.5*(j===1?1:0)):280,x=400+Math.cos(a)*rad,y=400+Math.sin(a)*rad;return <g key={d}><line x1="400" y1="400" x2={x} y2={y} stroke="#ddc89130"/><circle cx={x} cy={y} r="36" fill={d===2?gold:'#173d2b'} stroke={gold}/><text x={x} y={y+13} textAnchor="middle" fontSize="36" fill={d===2?ink:cream}>{d}</text></g>})}<circle cx="400" cy="400" r="88" fill="#102e22" stroke={gold} strokeWidth="2"/><text x="400" y="413" textAnchor="middle" fill={gold} fontSize="40">HOME</text></svg><div style={{textAlign:'center',fontSize:v?60:40,color:gold}}>Listen · Recognise · Resolve</div></div>:
 i===7?<div style={{position:'absolute',left:v?55:920,top:v?590:230,display:'flex',gap:v?24:20,alignItems:'center'}}>{['home','melody','lever-physical-change'].map((s,j)=><div key={s} style={{transform:`translateY(${j===1?-35:35}px)`,opacity:ease(local-j*7)}}><Device w={v?300:270}><PhoneContent kind={s}/></Device><div style={{textAlign:'center',fontSize:v?60:40,color:gold,marginTop:24}}>{['Single','Melody','Levers'][j]}</div></div>)}</div>:
 <div style={{position:'absolute',left:v?(1080-pw)/2:1220,top:v?370:85,transform:`translateY(${(1-p)*65}px) rotateY(${interpolate(local,[0,150],[-5,5],{extrapolateRight:'clamp'})}deg)`,opacity:p}}><Device w={pw}><PhoneContent kind={i===1?'home':i===4?'map':i===5?'single-launch':'results'}/></Device></div>}
 {i===9&&<div style={{position:'absolute',left:v?78:112,top:v?350:620,color:gold,fontSize:38,letterSpacing:8}}>EARPA</div>}
 {!v&&<div style={{position:'absolute',left:114,bottom:145,color:'#b6c9b5',fontSize:36}}>Celtic harp · Ear training</div>}
 </Back>;
}
type Shot={from:number;to:number;title:string;sub:string;clip?:string;start?:number;image?:string;freeze?:number;pointer?:boolean};
const single:Shot[]=[
 {from:0,to:4,title:'Welcome to Earpa',sub:'One minute inside a real practice session',clip:'app-loading'},
 {from:4,to:13,title:'Press Play. Listen.',sub:'The cadence establishes a musical home.',clip:'single-launch'},
 {from:13,to:19,title:'Guess what you heard',sub:'This guess was wrong. The correct note is 1.',clip:'single-answer-one'},
 {from:19,to:25,title:'Listen again',sub:'I → IV → V → I, then one mystery note.',clip:'single-answer-three',start:6},
 {from:25,to:31,title:'Correct: 2 → 1',sub:'Hear Re walk down to Do.',clip:'single-round-4'},
 {from:31,to:37,title:'A new round begins',sub:'The same process. A fresh listening challenge.',clip:'single-round-4',start:5},
 {from:37,to:43,title:'Correct: home itself',sub:'Degree 1 already feels at rest.',clip:'single-round-5'},
 {from:43,to:46,title:'Later rounds',sub:'Later rounds · edited forward',clip:'single-round-8',start:1.5},
 {from:46,to:49,title:'Later rounds',sub:'Later rounds · edited forward',clip:'single-round-13',start:1.5},
 {from:49,to:52,title:'Finish the level',sub:'Round 15 · hear the correction',clip:'single-round-15',start:1.5},
 {from:52,to:60,title:'See what to practise next',sub:'Actual session: 8 / 15 · focus on degree 2',image:'refined/single-results.png'},
];
const lever:Shot[]=[
 {from:0,to:8,title:'One lever. One semitone.',sub:'A small movement changes the vibrating length.',clip:'lever-physical-change',freeze:3.5,pointer:true},
 {from:8,to:17,title:'A circle, not a memory test',sub:'Clockwise: raise one more letter group.',image:'refined/lever-circle.png'},
 {from:17,to:24,title:'E♭ → B♭ major',sub:'Raise A♭ to A. Three flats become two.',image:'refined/lever-practice.png'},
 {from:24,to:28,title:'Tap the actual lever',sub:'A rises. The other levers stay down.',clip:'lever-physical-change',pointer:true},
 {from:28,to:35,title:'Confirm. Then listen.',sub:'B♭ major · root to root',clip:'lever-correct'},
 {from:35,to:42,title:'Every lever is checked',sub:'The game confirms the exact scale you built.',clip:'lever-correct',freeze:6.9},
 {from:42,to:49,title:'Now return to E♭',sub:'Leaving A raised gives an incorrect setup.',clip:'lever-wrong'},
 {from:49,to:56,title:'A useful correction',sub:'Seven of eight correct. Lower A.',clip:'lever-wrong',freeze:6.9},
 {from:56,to:60,title:'Lower the physical lever',sub:'A natural returns to A♭.',clip:'lever-lower',pointer:true},
 {from:60,to:69,title:'Hear the full scale',sub:'The final round ends with the correct scale.',clip:'lever-completion'},
 {from:69,to:77,title:'A short, complete level',sub:'Level two: 3 / 4 scales matched.',image:'refined/lever-score.png'},
 {from:77,to:85,title:'One new skill at a time',sub:'Next: keep A raised and add E. F major.',image:'refined/lever-level-three.png'},
 {from:85,to:90,title:'Build. Confirm. Listen.',sub:'3 rounds, then 4, then a maximum of 5.',image:'refined/lever-score.png'},
];
function LessonShot({s,from}:{s:Shot;from:number}){const f=useCurrentFrame(),p=ease(f);return <><div style={{position:'absolute',left:70,top:65,right:60,fontFamily:'Georgia',fontSize:88,lineHeight:1.1,opacity:p,transform:`translateY(${(1-p)*25}px)`}}>{s.title}</div><div style={{position:'absolute',left:163,top:270}}><Device w={740}>{s.image?<Still name={s.image}/>:s.freeze!==undefined?<Freeze frame={s.from===0?Math.min(f,Math.round(s.freeze*30)):Math.round(s.freeze*30)}><Clip name={s.clip!}/></Freeze>:<Clip name={s.clip!} start={s.start}/>} {s.pointer&&f>55&&f<95&&<div style={{position:'absolute',left:'55.7%',top:'31.2%',width:45,height:45,borderRadius:50,border:`3px solid ${gold}`,transform:`translate(-50%,-50%) scale(${1+(f-55)/40})`,opacity:1-(f-55)/40}}/>}</Device></div></>}
export function RefinedLesson({track='single'}:{track?:'single'|'levers'}){const f=useCurrentFrame(),shots=track==='single'?single:lever,total=track==='single'?60:90;return <Back><Audio src={staticFile('refined/'+track+'-mix.wav')}/><div style={{display:'none',position:'absolute',top:65,left:74,fontSize:24,color:gold,letterSpacing:5}}>{track==='single'?'SINGLE NOTES / A REAL SESSION':'LEVERS / LEARN BY DOING'}</div>{shots.map(s=><Sequence key={s.from} from={s.from*30} durationInFrames={(s.to-s.from)*30}><LessonShot s={s} from={s.from}/></Sequence>)}<div style={{position:'absolute',bottom:20,left:75,right:75,height:3,background:'#ffffff20'}}><div style={{height:3,background:gold,width:`${f/(total*30)*100}%`}}/></div></Back>}
