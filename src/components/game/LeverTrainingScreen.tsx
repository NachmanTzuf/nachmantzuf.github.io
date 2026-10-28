import {MechanicalFifths} from './MechanicalFifths';
import {leverLessons,scaleNotes,solveLevers,signatureOf} from '../../services/curriculum/LeverLessonEngine';
import {Reveal} from '../common/Reveal';
import {HarpSoundSynthesizer} from '../../services/audio/HarpSoundSynthesizer';
import {TUNING_STRING_BASELINES} from '../../services/curriculum/TuningMatrixEngine';
import React, {useRef, useState, useEffect} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {CelticHarpCanvas, CelticHarpCanvasRef} from '../3d/CelticHarpCanvas';
import {ErrorBoundary} from '../common/ErrorBoundary';
import {TuningMatrixEngine, PLAYABLE_MAJOR_KEYS, StringLetter} from '../../services/curriculum/TuningMatrixEngine';
import {UserAccountDatabase} from '../../services/account/UserAccountDatabase';

const orders = {Eb_Major_Native: 'AEBFCGD', C_Major_Native: 'FCGDAEB', Bb_Major_Native: 'EBFCGDA'};
const letters = [...'CDEFGABC'] as StringLetter[];
export function LeverTrainingScreen({onBackToHome, initialStage}: {onBackToHome: () => void; initialStage?:number}) {
  const db = UserAccountDatabase.getInstance();
  const tuning = TuningMatrixEngine.getActiveTuning();
  const keys = PLAYABLE_MAJOR_KEYS[tuning];
  const lessons=leverLessons(tuning);
  const canvas = useRef<CelticHarpCanvasRef>(null);
  const synth=useRef(new HarpSoundSynthesizer('celtic_nylon'));
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);synth.current.dispose();},[]);
  const later=(fn:()=>void,ms:number)=>{timers.current.push(setTimeout(fn,ms));};
  const [intro,setIntro]=useState((initialStage ?? db.getActiveProfile().leverStage ?? 0)===0 ? 0 : 5);
  const [playing,setPlaying]=useState(false),[playingNote,setPlayingNote]=useState(-1),[showControls,setShowControls]=useState(false);
  const [stage, setStage] = useState(Math.min(lessons.length-1,initialStage ?? db.getActiveProfile().leverStage ?? 0));
  const [round, setRound] = useState(0);
  const [targetIndex, setTargetIndex] = useState(Math.min(lessons.length-1,initialStage ?? db.getActiveProfile().leverStage ?? 0));
  const [exploreKey,setExploreKey]=useState<string|null>(null);
  const [states, setStates] = useState(Array(8).fill(false));
  const [submittedStates,setSubmittedStates]=useState<boolean[]|null>(null);
  
  const [practice, setPractice] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const locked = useRef(false);
  const started = useRef(Date.now());
  const sessionId = useRef(`levers_${Date.now()}`);
  const lesson=lessons[targetIndex];
  const target=lesson.root;
  const signature=signatureOf(lesson.parent);
  const config=solveLevers(tuning,target,lesson.mode)!;
  const notes=scaleNotes(target,lesson.mode);
  const up=[...orders[tuning]].filter(l=>config[l as StringLetter]);
  const down=[...'CDEFGAB'].filter(l=>!config[l as StringLetter]);
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
    setSubmittedStates([...states]);
    const correctStates=letters.map(l=>!!config[l]);
    correctStates.forEach((value,i)=>canvas.current?.setLeverState(i+1,value));
    setStates(correctStates);
    setPlaying(true);synth.current.initAudio();synth.current.unlockSynchronously();
    notes.forEach((note,i)=>later(()=>{
      setPlayingNote(i);
      const visibleString=letters.findIndex((l,j)=>TUNING_STRING_BASELINES[tuning][l].openMidi+config[l]+(j===7?12:0)===note.midi);
      if(visibleString>=0)canvas.current?.triggerLightStrike(visibleString+1);
      synth.current.playPluck(440*Math.pow(2,(note.midi-69)/12),1100,.9);
    },i*550+180));
    later(()=>{setPlaying(false);setPlayingNote(-1);},8*550+180);
    setScore(n => n + (correct ? 1 : 0));
    db.recordTrial({sessionId: sessionId.current, levelId: `lever_stage_${stage + 1}`, track: 'levers', tonicKey: lesson.title,
      stimulusDegree: up.join('') || 'all down', guessedDegree: letters.filter((_,i) => states[i]).join('') || 'all down',
      isCorrect: correct, latencyMs: Date.now() - started.current, roundIndex: round + 1});
    if (round === 4) {
      const finalScore = score + (correct ? 1 : 0);
      const trials = db.getUserTrials(db.getActiveProfile().id).filter(t=>t.sessionId===sessionId.current);
      db.recordSession({trialSessionId:sessionId.current,levelId:`lever_stage_${stage+1}`,levelCode:`L${stage+1}`,track:'levers',
        durationSeconds:(Date.now()-Number(sessionId.current.split('_')[1]))/1000,totalRounds:5,correctRounds:finalScore,
        accuracyPct:finalScore*20,passed:finalScore>=4,averageLatencyMs:trials.reduce((n,t)=>n+t.latencyMs,0)/trials.length,
        fastestLatencyMs:Math.min(...trials.map(t=>t.latencyMs))});
      if(finalScore>=4) db.updateActiveProfile({leverStage:Math.max(db.getActiveProfile().leverStage||0,Math.min(lessons.length-1,stage+1))});
    }
  };
  const [guidedFlipped, setGuidedFlipped] = useState(false);
  const [octaveFlipped, setOctaveFlipped] = useState(false);

  const guidedLetter = orders[tuning][0] as StringLetter;
  const guidedStrIdx = letters.indexOf(guidedLetter);

  const playOpenHarpArpeggio = () => {
    synth.current.initAudio();
    synth.current.unlockSynchronously();
    const root = TuningMatrixEngine.getRootMidiForKey(keys[0], 4);
    [0, 4, 7, 12].forEach((interval, i) => later(() => {
      const letter=scaleNotes(keys[0],'major')[[0,2,4,7][i]].letter;
      canvas.current?.triggerLightStrike(letter==='C'&&i>0?8:'CDEFGAB'.indexOf(letter)+1);
      synth.current.playPluck(440 * Math.pow(2, (root + interval - 69) / 12), 1200, 0.88);
    }, i * 220));
  };

  const playGuidedSemitone = () => {
    synth.current.initAudio();
    synth.current.unlockSynchronously();
        const midi = TUNING_STRING_BASELINES[tuning][guidedLetter].openMidi;
    const sNum = guidedStrIdx + 1;

    // 1. Play open pitch
    canvas.current?.triggerLightStrike(sNum);
    synth.current.playPluck(440 * Math.pow(2, (midi - 69) / 12), 700, 0.85);

    // 2. Play raised pitch (+1 semitone) after 420ms
    later(() => {
      canvas.current?.triggerLightStrike(sNum);
      synth.current.playPluck(440 * Math.pow(2, (midi + 1 - 69) / 12), 1100, 0.92);
      setGuidedFlipped(true);
    }, 420);
  };

  const playOctavePair = () => {
    synth.current.initAudio();
    synth.current.unlockSynchronously();
    setLever(0, true);
    setLever(7, true);
    setOctaveFlipped(true);
    const rootMidi = TuningMatrixEngine.getRootMidiForKey('C', 4);
    canvas.current?.triggerLightStrike(1);
    canvas.current?.triggerLightStrike(8);
    synth.current.playPluck(440 * Math.pow(2, (rootMidi + 1 - 69) / 12), 1200, 0.88);
    later(() => {
      canvas.current?.triggerLightStrike(8);
      synth.current.playPluck(440 * Math.pow(2, (rootMidi + 13 - 69) / 12), 1400, 0.88);
    }, 180);
  };

  const next = () => {
    if (!locked.current || playing) return;
    locked.current = false;
    if(round===4&&score>=4&&stage===lessons.length-1){onBackToHome();return;}
    if (round === 4) {
      if (score >= 4) setStage(Math.min(lessons.length-1, stage+1));
      setRound(0); setScore(0); sessionId.current = `levers_${Date.now()}`;
    } else setRound(n => n+1);
    // Introduce each available scale before random mixed practice.
    const nextStage=round===4&&score>=4?Math.min(lessons.length-1,stage+1):stage;
    const nextIndex=round===4?nextStage:(round%2===0?nextStage:Math.max(0,nextStage-1));
    setExploreKey(null);
    setTargetIndex(nextIndex); setPractice(false); setResult(null); setSubmittedStates(null); started.current = Date.now();
  };
  const pretty=(v:string)=>v.replace(/b/g,'♭').replace(/#/g,'♯');
  const mismatch=letters.map((l,i)=>({l,i,wanted:!!config[l]})).filter(x=>(submittedStates??states)[x.i]!==x.wanted);
  const lessonTitles=[
    'Your harp at rest',
    'Action · One lever, one semitone',
    'Around the circle of fifths',
    'The lever math formula',
    'Two C strings · Octave rule'
  ];
  const circleView=<View><MechanicalFifths tuning={tuning} selected={exploreKey??lesson.parent} onSelect={setExploreKey}/>{exploreKey&&exploreKey!==lesson.parent&&<TouchableOpacity onPress={()=>setExploreKey(null)}><Text style={styles.small}>Exploring {exploreKey} major · Return to {lesson.title} lesson</Text></TouchableOpacity>}</View>;


  return <View style={{flex:1,backgroundColor:'#483b2a'}}>
    <Image source={{uri:'/images/ingame_bg_levers.jpg'}} style={StyleSheet.absoluteFillObject}/>
    <ErrorBoundary componentName="LeverHarpCanvas">
      <CelticHarpCanvas ref={canvas} initialLeverStates={states} onLeverToggled={(i,v)=>{
        setLever(i-1,v);
        if (intro === 1 && letters[i-1] === guidedLetter && v) {
          setGuidedFlipped(true);
          synth.current.initAudio();
          synth.current.unlockSynchronously();
          const rootMidi = TuningMatrixEngine.getRootMidiForKey(keys[0], 4);
          const letterIdx = 'CDEFGAB'.indexOf(guidedLetter);
          const intervals = [0, 2, 4, 5, 7, 9, 11];
          const midi = TUNING_STRING_BASELINES[tuning][guidedLetter].openMidi;
          synth.current.playPluck(440 * Math.pow(2, (midi + 1 - 69) / 12), 1100, 0.92);
        }
        if (intro === 4 && (i === 1 || i === 8)) {
          if (states[i === 1 ? 7 : 0]) setOctaveFlipped(true);
        }
      }} fixedInGameAngle customAngle={-0.95} customScale={0.912} targetY={0.590} minimalHeroMode style={[StyleSheet.absoluteFillObject,{width:'100%',height:'100%'}]}/>
    </ErrorBoundary>
    <View style={styles.top}><TouchableOpacity onPress={onBackToHome}><Text style={styles.text}>‹ Home</Text></TouchableOpacity><Text style={styles.text}>{round+1} / 5 · Lever journey</Text></View>
    {practice&&result===null&&<><View pointerEvents="none" style={{position:'absolute',top:65,left:20,right:20}}><Text style={styles.title}>{pretty(lesson.title)}</Text><Text style={styles.text}>Press the levers on your harp</Text></View><View style={styles.controls}><TouchableOpacity onPress={()=>{setPractice(false);setIntro(5);}}><Text style={styles.small}>Show the circle of fifths</Text></TouchableOpacity><TouchableOpacity onPress={()=>setShowControls(!showControls)}><Text style={styles.small}>Alternative lever controls {showControls?'−':'+'}</Text></TouchableOpacity>{showControls&&<View style={{flexDirection:'row',gap:4}}>{letters.map((l,i)=><TouchableOpacity key={i} accessibilityLabel={`${l}${i===7?' upper':''} lever ${states[i]?'up':'down'}`} onPress={()=>setLever(i,!states[i])} style={styles.lever}><Text style={styles.text}>{l}{states[i]?'↑':'↓'}</Text></TouchableOpacity>)}</View>}<TouchableOpacity style={styles.button} onPress={check}><Text style={styles.text}>Confirm scale →</Text></TouchableOpacity></View></>}
    {!practice&&<Reveal key={`${intro}-${target}`} style={styles.overlay}><ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',padding:28,paddingTop:76,paddingBottom:36,gap:16}}>
      <Text style={styles.small}>{intro<5?`INTERACTIVE LEVER METHOD · ${intro+1} / 5`:'LEARN THE SCALE'}</Text>
      <Text style={styles.title}>{intro<5?lessonTitles[intro]:`${pretty(lesson.title)}`}</Text>

      {/* Step 0: Open Harp at Rest */}
      {intro === 0 && (
        <View style={{gap:14,alignItems:'center'}}>
          <Text style={styles.explanation}>
            With every lever down, your Celtic harp rests in {pretty(keys[0])} major. This is your foundation with zero raised groups.
          </Text>
          <TouchableOpacity style={[styles.button,{minWidth:220}]} onPress={playOpenHarpArpeggio}>
            <Text style={styles.text}>♫ Hear harp at rest</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 1: Guided Action - Flip Lever & Hear Semitone */}
      {intro === 1 && (
        <View style={{gap:14,alignItems:'center'}}>
          <Text style={styles.explanation}>
            Engaging a lever physically stops the string at a bridge pin, raising its pitch by exactly one semitone.
          </Text>
          <Text style={[styles.text,{color:'#ead7a9'}]}>
            First group to raise in {pretty(keys[0])} native: {guidedLetter}
          </Text>
          <TouchableOpacity style={[styles.button,{minWidth:240,borderColor:guidedFlipped?'#a3e635':'#c5a872'}]} onPress={() => {
            setLever(guidedStrIdx, true);
            playGuidedSemitone();
          }}>
            <Text style={styles.text}>{guidedFlipped ? `✓ ${guidedLetter} lever raised (+1 semitone)` : `Flip ${guidedLetter} lever & listen`}</Text>
          </TouchableOpacity>
          {guidedFlipped && (
            <Text style={[styles.small,{color:'#a3e635'}]}>
              Notice the pitch shift: open pitch → raised half step.
            </Text>
          )}
        </View>
      )}

      {/* Step 2: Around the Circle */}
      {intro === 2 && (
        <View style={{gap:12}}>
          {circleView}
          <Text style={styles.explanation}>
            Each clockwise step moves up a perfect fifth (seven semitones). Each new major scale requires raising one additional letter group in order: {[...orders[tuning]].join(' → ')}.
          </Text>
        </View>
      )}

      {/* Step 3: Mathematical Formula */}
      {intro === 3 && (
        <View style={{gap:14,alignItems:'center'}}>
          <View style={{padding:16,borderRadius:12,backgroundColor:'rgba(210,183,126,0.12)',borderWidth:1,borderColor:'#ac986d',width:'100%'}}>
            <Text style={[styles.title,{fontSize:20,marginBottom:6}]}>Mathematical Relationship</Text>
            <Text style={[styles.text,{fontSize:15,lineHeight:22}]}>
              • 1 Clockwise Step = 1 Group Raised{'\n'}
              • Key Signature = { ({Eb_Major_Native: '-3 (3 flats)', C_Major_Native: '0 (neutral)', Bb_Major_Native: '-2 (2 flats)'} as Record<string,string>)[tuning] } + Raised Groups{'\n'}
              • Negative = flats · Positive = sharps
            </Text>
          </View>
          <Text style={styles.explanation}>
            For {pretty(keys[1])} Major (1 step clockwise from {pretty(keys[0])}): raise {orders[tuning][0]}. Key signature = { ({Eb_Major_Native: '-2', C_Major_Native: '+1', Bb_Major_Native: '-1'} as Record<string,string>)[tuning] } ({pretty(keys[1])}).
          </Text>
        </View>
      )}

      {/* Step 4: Two C Strings Octave Rule */}
      {intro === 4 && (
        <View style={{gap:14,alignItems:'center'}}>
          <Text style={styles.explanation}>
            Every string sharing that letter must change together. This harp has two C strings: C4 (String 1) and C5 (String 8).
          </Text>
          <TouchableOpacity style={[styles.button,{minWidth:240,borderColor:octaveFlipped?'#a3e635':'#c5a872'}]} onPress={playOctavePair}>
            <Text style={styles.text}>{octaveFlipped ? '✓ Both C levers raised (C4 & C5)' : 'Flip both C levers together'}</Text>
          </TouchableOpacity>
          <Text style={styles.small}>
            Always change both C levers together when modulating keys involving C.
          </Text>
        </View>
      )}

      {/* Independent Trial Overview */}
      {intro >= 5 && (
        <>
          {circleView}
          {lesson.mode!=='major'&&<Text style={styles.explanation}>Use {pretty(lesson.parent)} major levers, but hear {pretty(target)} as home. Same pitches, a different tonic.</Text>}
          <Text style={styles.explanation}>{signature === 0 ? 'No sharps or flats' : `${Math.abs(signature)} ${signature < 0 ? 'flats' : 'sharps'}`} · {up.length} raised groups from {pretty(keys[0])}</Text>
          <Text style={styles.explanation}>Raise {up.join(' · ')||'none'}<Text>{'\n'}Lower {down.join(' · ')||'none'}</Text></Text>
          <Text style={styles.small}>{up.map(l=>`${pretty(TUNING_STRING_BASELINES[tuning][l as StringLetter].open)} → ${pretty(TUNING_STRING_BASELINES[tuning][l as StringLetter].engaged)}`).join('   ·   ')||'All strings stay at their open pitch.'}</Text>
        </>
      )}

      <TouchableOpacity disabled={(intro===1&&!guidedFlipped)||(intro===4&&!octaveFlipped)} style={[styles.button,{opacity:(intro===1&&!guidedFlipped)||(intro===4&&!octaveFlipped)?.5:1}]} onPress={()=>{if(intro<5)setIntro(intro+1);else{timers.current.forEach(clearTimeout);timers.current=[];setPractice(true);started.current=Date.now();}}}>
        <Text style={styles.text}>{intro<5?'Continue at your pace →':'Begin 5-round trial →'}</Text>
      </TouchableOpacity>
      {intro>0&&intro<5&&<TouchableOpacity onPress={()=>setIntro(intro-1)}><Text style={styles.small}>‹ Previous step</Text></TouchableOpacity>}
    </ScrollView></Reveal>}
    {result!==null&&<Reveal style={styles.overlay}><ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',padding:26,paddingTop:76,paddingBottom:36,gap:22}}><Text style={[styles.title,{fontSize:40}]}>{result?'Correct':'Incorrect'}</Text><Text style={styles.title}>{pretty(lesson.title)}</Text><Text style={styles.explanation}>{result?'Every lever is in place.':`${8-mismatch.length} of 8 levers correct`}</Text>{!!mismatch.length&&<Text style={styles.explanation}>{mismatch.map(x=>`${x.l}${x.i===7?' upper':''} ${x.wanted?'↑ raise':'↓ lower'}`).join(' · ')}</Text>}<View style={{flexDirection:'row',justifyContent:'space-between'}}>{[1,2,3,4,5,6,7,8].map((n,i)=><View key={n} style={{width:30,height:42,alignItems:'center',justifyContent:'center',borderBottomWidth:2,borderColor:playingNote===i?'#f4d499':'#81765d',backgroundColor:playingNote===i?'rgba(210,183,126,.25)':'transparent'}}><Text style={[styles.text,{fontSize:13}]}>{pretty(notes[i].label)}</Text></View>)}</View><Text style={styles.small}>Listen to the correct scale · start to finish</Text><TouchableOpacity disabled={playing} style={[styles.button,{opacity:playing ? .5 : 1}]} onPress={next}><Text style={styles.text}>{playing?'Playing the scale…':round===4?`${score} / 5 · ${score>=4?(stage===lessons.length-1?'Journey complete':'Next stage'):'Practice again'} →`:'Next scale →'}</Text></TouchableOpacity></ScrollView></Reveal>}
  </View>;
}
const styles=StyleSheet.create({top:{position:'absolute',top:22,left:18,right:18,flexDirection:'row',justifyContent:'space-between',zIndex:100},title:{fontFamily:'Cinzel-Bold',fontSize:30,color:'#f0d9ab',textAlign:'center'},text:{color:'#edddc0',fontSize:16,textAlign:'center',lineHeight:25},explanation:{color:'#edddc0',fontSize:18,lineHeight:29,textAlign:'center'},small:{color:'#cdbd9e',fontSize:12,lineHeight:20,textAlign:'center',padding:4},controls:{position:'absolute',bottom:28,left:16,right:16},lever:{flex:1,paddingVertical:8,borderWidth:1,borderColor:'#8c8068',backgroundColor:'rgba(54,43,30,.85)',borderRadius:8},button:{padding:17,marginTop:8,borderWidth:1,borderColor:'#c5a872',borderRadius:14,backgroundColor:'rgba(54,53,35,.9)'},overlay:{...StyleSheet.absoluteFillObject,zIndex:90,backgroundColor:'rgba(29,39,29,.7)',backgroundImage:'linear-gradient(180deg,rgba(44,50,34,.12),rgba(36,47,31,.75),rgba(44,50,34,.12))'} as any});
