export type LessonTrack = 'single' | 'melody' | 'levers';
type CompletedSession = {track: LessonTrack; levelId: string; totalRounds: number};
/** A completed level-10 session hides only that path's home lesson shortcut.
 * Unlocking/skipping to level 10 alone is deliberately not completion. */
export const hasCompletedLessonMilestone = (sessions: readonly CompletedSession[], track: LessonTrack) =>
  sessions.some(s => s.track === track && s.totalRounds > 0 && Number(s.levelId.match(/(\d+)$/)?.[1]) === 10);
