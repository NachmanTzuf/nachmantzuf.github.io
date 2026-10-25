import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { LevelDefinition } from '../../services/curriculum/curriculumData';
import {
  UserAccountDatabase,
  SessionLogEntry,
} from '../../services/account/UserAccountDatabase';

export interface SessionInsightsModalProps {
  visible: boolean;
  realm?: 'single' | 'melody' | 'levers';
  level: LevelDefinition;
  sessionLog: SessionLogEntry | null;
  onNextLevel?: () => void;
  onReplay: () => void;
  onBackToSanctuary: () => void;
  onOpenProfileInsights?: () => void;
}

export const SessionInsightsModal: React.FC<SessionInsightsModalProps> = ({visible, realm = 'single', level, sessionLog, onNextLevel, onReplay, onBackToSanctuary}) => {
  if (!visible || !sessionLog) return null;
  const insights = UserAccountDatabase.getInstance().getPedagogicalInsights(sessionLog.trialSessionId || sessionLog.id);
  const strongest = insights.strongestDegrees[0];
  const weakest = insights.weakestDegrees.find(d => d.accuracyPct < 90);
  return <View nativeID="session-summary" style={styles.screen}>
    <Image source={{uri: `/images/ingame_bg_${realm}.jpg`}} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
    <View style={[StyleSheet.absoluteFillObject, {backgroundColor: 'rgba(21,30,24,.52)'}]} />
    <Text style={styles.eyebrow}>{level.code} · PRACTICE COMPLETE</Text>
    <View style={styles.orbit}>
      <Text style={styles.score}>{sessionLog.correctRounds}<Text style={styles.total}> / {sessionLog.totalRounds}</Text></Text>
      <Text style={styles.caption}>rounds correct</Text>
    </View>
    <Text style={styles.title}>{sessionLog.passed ? 'A clear ear' : 'Finding your way'}</Text>
    <View style={styles.rhythm}>{Array.from({length: sessionLog.totalRounds}, (_, i) => <View key={i} style={[styles.mark, {backgroundColor: i < sessionLog.correctRounds ? '#d5b77c' : '#514a3e'}]} />)}</View>
    <Text style={styles.detail}>{strongest ? `Strongest · degree ${strongest.degree}` : 'Your first steps are recorded'}</Text>
    <Text style={styles.detail}>{weakest ? `Next practice · degree ${weakest.degree}` : 'Steady listening across this session'}</Text>
    <Text style={styles.caption}>{Math.round(sessionLog.durationSeconds / 60)} min · {(sessionLog.averageLatencyMs / 1000).toFixed(1)}s average response</Text>
    <View style={styles.actions}>
      {sessionLog.passed && onNextLevel && <TouchableOpacity onPress={onNextLevel} style={styles.primary}><Text style={styles.primaryText}>Continue journey →</Text></TouchableOpacity>}
      <TouchableOpacity onPress={onReplay} style={styles.secondary}><Text style={styles.detail}>Practice again</Text></TouchableOpacity>
      <TouchableOpacity onPress={onBackToSanctuary} style={styles.secondary}><Text style={styles.caption}>Back to sanctuary</Text></TouchableOpacity>
    </View>
  </View>;
};
const styles = StyleSheet.create({
 screen: {...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: '#191a15', padding: 28, alignItems: 'center', justifyContent: 'center'},
 eyebrow: {fontSize: 10, letterSpacing: 2, color: '#b4a68c', marginBottom: 28},
 orbit: {width: 170, height: 170, borderRadius: 85, borderWidth: 1, borderColor: '#b29460', alignItems: 'center', justifyContent: 'center', marginBottom: 24},
 score: {fontSize: 54, color: '#efdbaf', fontFamily: 'Cinzel-Bold'}, total: {fontSize: 20, color: '#a89a80'},
 caption: {fontSize: 12, color: '#a89f8e', textAlign: 'center', lineHeight: 20},
 title: {fontFamily: 'Cinzel-Bold', fontSize: 26, color: '#ead8b6', marginBottom: 16},
 detail: {fontSize: 14, color: '#d3c8b3', lineHeight: 24, textAlign: 'center'},
 rhythm: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 5, marginBottom: 24, maxWidth: 260},
 mark: {width: 6, height: 18, borderRadius: 3}, actions: {width: '100%', marginTop: 28},
 primary: {padding: 15, borderWidth: 1, borderColor: '#a88b59', borderRadius: 6, alignItems: 'center'},
 primaryText: {color: '#eddbb5', fontSize: 15}, secondary: {padding: 12, alignItems: 'center'},
});
