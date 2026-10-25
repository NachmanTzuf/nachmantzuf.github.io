import {Reveal} from '../common/Reveal';
import {HarpSoundSynthesizer} from '../../services/audio/HarpSoundSynthesizer';
import {TUNING_STRING_BASELINES} from '../../services/curriculum/TuningMatrixEngine';
import React, {useRef, useState, useEffect} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {CelticHarpCanvas, CelticHarpCanvasRef} from '../3d/CelticHarpCanvas';
import {TuningMatrixEngine, PLAYABLE_MAJOR_KEYS, StringLetter} from '../../services/curriculum/TuningMatrixEngine';
import {UserAccountDatabase} from '../../services/account/UserAccountDatabase';

const orders = {Eb_Major_Native: 'AEBFCGD', C_Major_Native: 'FCGDAEB', Bb_Major_Native: 'EBFCGDA'};
const letters = [...'CDEFGABC'] as StringLetter[];
export function LeverTrainingScreen({onBackToHome, initialStage}: {onBackToHome: () => void; initialStage?:number}) {
  const db = UserAccountDatabase.getInstance();
  const tuning = TuningMatrixEngine.getActiveTuning();
  const keys = PLAYABLE_MAJOR_KEYS[tuning];
  const canvas = useRef<CelticHarpCanvasRef>(null);
  const synth=useRef(new HarpSoundSynthesizer('celtic_nylon'));
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);synth.current.dispose();},[]);
  const later=(fn:()=>void,ms:number)=>{timers.current.push(setTimeout(fn,ms));};
  const [intro,setIntro]=useState(initialStage===undefined || initialStage===0 ? 0 : 5);
  const [playing,setPlaying]=useState(false),[playingNote,setPlayingNote]=useState(-1),[showControls,setShowControls]=useState(false);
  const [stage, setStage] = useState(initialStage ?? db.getActiveProfile().leverStage ?? 0);
  const [round, setRound] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [states, setStates] = useState(Array(8).fill(false));
  
  const [practice, setPractice] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const locked = useRef(false);
  const started = useRef(Date.now());
  const sessionId = useRef(`levers_${Date.now()}`);
  const target = keys[targetIndex];
  const signature = targetIndex + {Eb_Major_Native:-3,C_Major_Native:0,Bb_Major_Native:-2}[tuning];
  const config = TuningMatrixEngine.getLeverConfiguration(tuning, target);
  const up = [...orders[tuning]].slice(0, targetIndex);
  const down = [...'CDEFGAB'].filter(l => !up.includes(l));
  const count = Math.min(keys.length, stage + 2);
  const setLever = (i: number, value: boolean) => {
    if (locked.current) return;
    setStates(prev => {const next = [...prev]; next[i] = value; return next;});
    canvas.current?.setLeverState(i + 1, value);
  };
  const check = () => {
    if (locked.current) return;
    locked.current = true;
    const correct = letters.every((l,i) => states[i] === !!config[l]);
    setResult(correct);
    setPlaying(true);synth.current.initAudio();synth.current.unlockSynchronously();
    const root=TuningMatrixEngine.getRootMidiForKey(target,4);
    [0,2,4,5,7,9,11,12].forEach((interval,i)=>later(()=>{
      setPlayingNote(i);const letter='CDEFGAB'[('CDEFGAB'.indexOf(target[0])+i)%7] as StringLetter;
      canvas.current?.triggerLightStrike(letter==='C'&&i>0?8:'CDEFGAB'.indexOf(letter)+1);
      synth.current.playPluck(440*Math.pow(2,(root+interval-69)/12),1100,.9);
    },i*550+180));
    later(()=>{setPlaying(false);setPlayingNote(-1);},8*550+180);
    setScore(n => n + (correct ? 1 : 0));
    db.recordTrial({sessionId: sessionId.current, levelId: `lever_stage_${stage + 1}`, track: 'levers', tonicKey: target,
      stimulusDegree: up.join('') || 'all down', guessedDegree: letters.filter((_,i) => states[i]).join('') || 'all down',
      isCorrect: correct, latencyMs: Date.now() - started.current, roundIndex: round + 1});
    if (round === 19) {
      const finalScore = score + (correct ? 1 : 0);
      const trials = db.getUserTrials(db.getActiveProfile().id).filter(t=>t.sessionId===sessionId.current);
      db.recordSession({trialSessionId:sessionId.current,levelId:`lever_stage_${stage+1}`,levelCode:`L${stage+1}`,track:'levers',
        durationSeconds:(Date.now()-Number(sessionId.current.split('_')[1]))/1000,totalRounds:20,correctRounds:finalScore,
        accuracyPct:finalScore*5,passed:finalScore>=18,averageLatencyMs:trials.reduce((n,t)=>n+t.latencyMs,0)/trials.length,
        fastestLatencyMs:Math.min(...trials.map(t=>t.latencyMs))});
      if(finalScore>=18) db.updateActiveProfile({leverStage:Math.max(db.getActiveProfile().leverStage||0,Math.min(6,stage+1))});
    }
  };
  const next = () => {
    if (!locked.current || playing) return;
    locked.current = false;
    if (round === 19) {
      if (score >= 18) setStage(Math.min(6, stage+1));
      setRound(0); setScore(0); sessionId.current = `levers_${Date.now()}`;
    } else setRound(n => n+1);
    // Introduce each available scale before random mixed practice.
    const nextIndex = round === 19 ? 0 : round + 1 < count ? round + 1 : Math.floor(Math.random()*count);
    setTargetIndex(nextIndex); setPractice(false); setResult(null); started.current = Date.now();
  };
  const pretty=(v:string)=>v.replace(/b/g,'♭').replace(/#/g,'♯');
  const mismatch=letters.map((l,i)=>({l,i,wanted:!!config[l]})).filter(x=>states[x.i]!==x.wanted);
  const lessonTitles=['Your harp at rest','One lever, one semitone','Around the circle','Count from your harp','One letter, every octave'];
  const lessonText=[`With every lever down, your harp is in ${pretty(keys[0])} major. This is your starting point: zero raised groups.`,
    'Press a lever on the harp to raise its string by one semitone. Lower it to return to the open pitch. A lever never lowers a string below its open pitch. A major scale follows 2 · 2 · 1 · 2 · 2 · 2 · 1 semitones between its eight notes.',
    'Each clockwise step moves up a perfect fifth: seven semitones. The new major scale needs one more raised letter group. Counterclockwise, lower the last group you raised.',
    `Start at ${pretty(keys[0])}, not always C. Raise groups in this order: ${[...orders[tuning]].join(' → ')}. One step = one group; two steps = two groups. Key-signature number = ${{Eb_Major_Native:-3,C_Major_Native:0,Bb_Major_Native:-2}[tuning]} + raised groups. Negative means flats; positive means sharps; zero means neither.`,
    'A group means every string with that letter. This harp has two C strings: change both C levers together. Read the target, set the physical levers, then confirm. You will hear all eight notes.'];
  const circle=['C','G','D','A','E','B','F#','C#','Ab','Eb','Bb','F'];
  const circleTarget=target;
  const circleView=<svg viewBox="0 0 280 280" style={{width:'100%',maxWidth:280,alignSelf:'center'}} role="img" aria-label={`Circle of fifths, ${pretty(target)} major, ${targetIndex} clockwise steps from ${pretty(keys[0])}`}><circle cx="140" cy="140" r="102" fill="none" stroke="#ac986d" strokeWidth="1"/>{circle.map((key,i)=>{const a=(i*30-90)*Math.PI/180,x=140+102*Math.cos(a),y=140+102*Math.sin(a),active=key===circleTarget,native=key===keys[0];return <g key={key}><circle cx={x} cy={y} r="19" fill={active?'#bca16d':'#304136'} stroke={active||native?'#ead7a9':'#64735e'}/><text x={x} y={y+5} textAnchor="middle" fill={active?'#203327':'#edddba'} fontSize="14">{pretty(key)}</text></g>})}<text x="140" y="132" textAnchor="middle" fill="#ead6aa" fontSize="32">{targetIndex}</text><text x="140" y="155" textAnchor="middle" fill="#d3c09a" fontSize="12">groups raised</text><text x="140" y="177" textAnchor="middle" fill="#d3c09a" fontSize="11">clockwise →</text></svg>;
  return <View style={{flex:1,backgroundColor:'#483b2a'}}>
    <Image source={{uri:'/images/ingame_bg_levers.jpg'}} style={StyleSheet.absoluteFillObject}/>
    <CelticHarpCanvas ref={canvas} initialLeverStates={states} onLeverToggled={(i,v)=>setLever(i-1,v)} fixedInGameAngle customAngle={-0.95} customScale={0.84} targetY={0.60} minimalHeroMode style={[StyleSheet.absoluteFillObject,{width:'100%',height:'100%'}]}/>
    <View style={styles.top}><TouchableOpacity onPress={onBackToHome}><Text style={styles.text}>‹ Home</Text></TouchableOpacity><Text style={styles.text}>{round+1} / 20 · Lever journey</Text></View>
    {practice&&result===null&&<><View pointerEvents="none" style={{position:'absolute',top:65,left:20,right:20}}><Text style={styles.title}>{pretty(target)} major</Text><Text style={styles.text}>Press the levers on your harp</Text></View><View style={styles.controls}><TouchableOpacity onPress={()=>{setPractice(false);setIntro(5);}}><Text style={styles.small}>Show the circle of fifths</Text></TouchableOpacity><TouchableOpacity onPress={()=>setShowControls(!showControls)}><Text style={styles.small}>Alternative lever controls {showControls?'−':'+'}</Text></TouchableOpacity>{showControls&&<View style={{flexDirection:'row',gap:4}}>{letters.map((l,i)=><TouchableOpacity key={i} accessibilityLabel={`${l}${i===7?' upper':''} lever ${states[i]?'up':'down'}`} onPress={()=>setLever(i,!states[i])} style={styles.lever}><Text style={styles.text}>{l}{states[i]?'↑':'↓'}</Text></TouchableOpacity>)}</View>}<TouchableOpacity style={styles.button} onPress={check}><Text style={styles.text}>Confirm scale →</Text></TouchableOpacity></View></>}
    {!practice&&<Reveal key={`${intro}-${target}`} style={styles.overlay}><ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',padding:28,gap:16}}><Text style={styles.small}>{intro<5?`THE LEVER METHOD · ${intro+1} / 5`:'LEARN THE SCALE'}</Text><Text style={styles.title}>{intro<5?lessonTitles[intro]:`${pretty(target)} major`}</Text>{circleView}<Text style={styles.explanation}>{intro<5?lessonText[intro]:`${signature===0?'No sharps or flats':`${Math.abs(signature)} ${signature<0?'flats':'sharps'}`} · ${targetIndex} raised groups from ${pretty(keys[0])}`}</Text>{intro>=5&&<><Text style={styles.explanation}>Raise {up.join(' · ')||'none'}<Text>{'\n'}Lower {down.join(' · ')||'none'}</Text></Text><Text style={styles.small}>{up.map(l=>`${pretty(TUNING_STRING_BASELINES[tuning][l as StringLetter].open)} → ${pretty(TUNING_STRING_BASELINES[tuning][l as StringLetter].engaged)}`).join('   ·   ')||'All strings stay at their open pitch.'}</Text></>}<TouchableOpacity style={styles.button} onPress={()=>{if(intro<5)setIntro(intro+1);else{setPractice(true);started.current=Date.now();}}}><Text style={styles.text}>{intro<5?'Continue at your pace →':'Set the levers →'}</Text></TouchableOpacity>{intro>0&&intro<5&&<TouchableOpacity onPress={()=>setIntro(intro-1)}><Text style={styles.small}>‹ Previous explanation</Text></TouchableOpacity>}</ScrollView></Reveal>}
    {result!==null&&<Reveal style={styles.overlay}><ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',padding:26,gap:22}}><Text style={[styles.title,{fontSize:40}]}>{result?'Correct':'Incorrect'}</Text><Text style={styles.title}>{pretty(target)} major</Text><Text style={styles.explanation}>{result?'Every lever is in place.':`${8-mismatch.length} of 8 levers correct`}</Text>{!!mismatch.length&&<Text style={styles.explanation}>{mismatch.map(x=>`${x.l}${x.i===7?' upper':''} ${x.wanted?'↑ raise':'↓ lower'}`).join(' · ')}</Text>}<View style={{flexDirection:'row',justifyContent:'space-between'}}>{[1,2,3,4,5,6,7,8].map((n,i)=><View key={n} style={{width:30,height:42,alignItems:'center',justifyContent:'center',borderBottomWidth:2,borderColor:playingNote===i?'#f4d499':'#81765d',backgroundColor:playingNote===i?'rgba(210,183,126,.25)':'transparent'}}><Text style={[styles.text,{fontSize:13}]}>{pretty(TUNING_STRING_BASELINES[tuning]['CDEFGAB'[('CDEFGAB'.indexOf(target[0])+i)%7] as StringLetter][config['CDEFGAB'[('CDEFGAB'.indexOf(target[0])+i)%7] as StringLetter]?'engaged':'open'])}</Text></View>)}</View><Text style={styles.small}>Listen to the correct scale · start to finish</Text><TouchableOpacity disabled={playing} style={[styles.button,{opacity:playing ? .5 : 1}]} onPress={next}><Text style={styles.text}>{playing?'Playing the scale…':round===19?`${score} / 20 · ${score>=18?'Next stage':'Practice again'} →`:'Next scale →'}</Text></TouchableOpacity></ScrollView></Reveal>}
  </View>;
}
const styles=StyleSheet.create({top:{position:'absolute',top:22,left:18,right:18,flexDirection:'row',justifyContent:'space-between',zIndex:100},title:{fontFamily:'Cinzel-Bold',fontSize:30,color:'#f0d9ab',textAlign:'center'},text:{color:'#edddc0',fontSize:16,textAlign:'center',lineHeight:25},explanation:{color:'#edddc0',fontSize:18,lineHeight:29,textAlign:'center'},small:{color:'#cdbd9e',fontSize:12,lineHeight:20,textAlign:'center',padding:4},controls:{position:'absolute',bottom:28,left:16,right:16},lever:{flex:1,paddingVertical:8,borderWidth:1,borderColor:'#8c8068',backgroundColor:'rgba(54,43,30,.85)',borderRadius:8},button:{padding:17,marginTop:8,borderWidth:1,borderColor:'#c5a872',borderRadius:14,backgroundColor:'rgba(54,53,35,.9)'},overlay:{...StyleSheet.absoluteFillObject,zIndex:90,backgroundColor:'rgba(29,39,29,.7)',backgroundImage:'linear-gradient(180deg,rgba(44,50,34,.12),rgba(36,47,31,.75),rgba(44,50,34,.12))'} as any});
