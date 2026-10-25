/**
 * EARPA MUSICAL RESPONSES CATALOG (200 ITEMS)
 * Exactly 100 unique handcrafted musical responses for correct guesses
 * and 100 unique handcrafted musical responses for incorrect guesses.
 * Built with musical wordplay, acoustic physics, lutherie lore, and tonal gravity insights.
 * Zero generic cliches.
 */

export interface MusicalResponse {
  id: string;
  type: 'CORRECT' | 'INCORRECT';
  text: string;
  subtext?: string;
  flavor: 'PUN' | 'ACOUSTICS' | 'LUTHERIE' | 'GRAVITY' | 'REFLEX' | 'BARDIC';
}

export class MusicalResponsesCatalog {
  // =========================================================================
  // 100 HANDCRAFTED POSITIVE RESPONSES FOR CORRECT GUESSES
  // =========================================================================
  public static readonly CORRECT_100: MusicalResponse[] = [
    { id: 'COR_001', type: 'CORRECT', text: 'Sharp as a tack, yet 100% natural!', flavor: 'PUN' },
    { id: 'COR_002', type: 'CORRECT', text: 'You stayed grounded: zero pitch drift, pure tonal gravity.', flavor: 'GRAVITY' },
    { id: 'COR_003', type: 'CORRECT', text: 'Tonic equilibrium achieved! You saw right through the overtone.', flavor: 'ACOUSTICS' },
    { id: 'COR_004', type: 'CORRECT', text: 'No accidental slip: you nailed that scale degree dead center.', flavor: 'PUN' },
    { id: 'COR_005', type: 'CORRECT', text: 'Clean as an unmuted Sitka spruce resonance.', flavor: 'LUTHERIE' },
    { id: 'COR_006', type: 'CORRECT', text: 'Pitch-perfect instinct! The tonic anchor held firm.', flavor: 'BARDIC' },
    { id: 'COR_007', type: 'CORRECT', text: 'Harmonic bullseye! That degree resolved straight into your hands.', flavor: 'GRAVITY' },
    { id: 'COR_008', type: 'CORRECT', text: 'The soundboard sang, and your ear spoke the absolute truth.', flavor: 'LUTHERIE' },
    { id: 'COR_009', type: 'CORRECT', text: 'Lightning ears! Sub-second reflex with zero cognitive drag.', flavor: 'REFLEX' },
    { id: 'COR_010', type: 'CORRECT', text: 'You caught that frequency before the soundboard even finished blooming.', flavor: 'ACOUSTICS' },
    { id: 'COR_011', type: 'CORRECT', text: 'Pure consonance! Your ear is tuned tighter than gut harp wire.', flavor: 'LUTHERIE' },
    { id: 'COR_012', type: 'CORRECT', text: 'Not even a phantom overtone could throw you off the trail.', flavor: 'ACOUSTICS' },
    { id: 'COR_013', type: 'CORRECT', text: 'That note wanted to wander, but your ears held the anchor firm.', flavor: 'GRAVITY' },
    { id: 'COR_014', type: 'CORRECT', text: 'Major key mastery on display: pure acoustic sunshine.', flavor: 'PUN' },
    { id: 'COR_015', type: 'CORRECT', text: 'You caught the leading tone right as it leaped for home!', flavor: 'GRAVITY' },
    { id: 'COR_016', type: 'CORRECT', text: 'That was not a lucky guess; that was pure harmonic intuition.', flavor: 'BARDIC' },
    { id: 'COR_017', type: 'CORRECT', text: 'Your ears are reading the staff in four-dimensional space.', flavor: 'PUN' },
    { id: 'COR_018', type: 'CORRECT', text: 'Spot on! The Celtic bard inside you is awake and hungry.', flavor: 'BARDIC' },
    { id: 'COR_019', type: 'CORRECT', text: 'Pure fundamental frequency extraction. Zero hesitation.', flavor: 'ACOUSTICS' },
    { id: 'COR_020', type: 'CORRECT', text: 'In perfect accord with the acoustic laws of the universe.', flavor: 'PUN' },
    { id: 'COR_021', type: 'CORRECT', text: 'That string vibration was barely 50ms old when you snagged it!', flavor: 'REFLEX' },
    { id: 'COR_022', type: 'CORRECT', text: 'You did not climb the interval ladder; you felt its weight instantly.', flavor: 'GRAVITY' },
    { id: 'COR_023', type: 'CORRECT', text: 'Locked in! The sharping levers themselves tremble in admiration.', flavor: 'LUTHERIE' },
    { id: 'COR_024', type: 'CORRECT', text: 'Flawless pitch appraisal. That degree is officially conquered.', flavor: 'BARDIC' },
    { id: 'COR_025', type: 'CORRECT', text: 'You felt the gravitational pull toward Do and named it on sight.', flavor: 'GRAVITY' },
    { id: 'COR_026', type: 'CORRECT', text: 'The overtone spectrum tried to distract, but you locked fundamental.', flavor: 'ACOUSTICS' },
    { id: 'COR_027', type: 'CORRECT', text: 'Sweet resolution! That was like finding the final bar of an ancient reel.', flavor: 'BARDIC' },
    { id: 'COR_028', type: 'CORRECT', text: 'Harmonic clarity of the highest order. Carry on, Maestro!', flavor: 'PUN' },
    { id: 'COR_029', type: 'CORRECT', text: 'Boom! That degree had no hiding place inside the soundbox.', flavor: 'LUTHERIE' },
    { id: 'COR_030', type: 'CORRECT', text: 'Tuning pin precision: dialed in to within a single vibration.', flavor: 'LUTHERIE' },
    { id: 'COR_031', type: 'CORRECT', text: 'Instantaneous auditory reflex! You beat the reverb tail.', flavor: 'REFLEX' },
    { id: 'COR_032', type: 'CORRECT', text: 'You heard the tonic shadow and called the degree out by name.', flavor: 'GRAVITY' },
    { id: 'COR_033', type: 'CORRECT', text: 'Pure ear-training wizardry: straight to the root of the matter.', flavor: 'PUN' },
    { id: 'COR_034', type: 'CORRECT', text: 'You hear notes the way a hawk spots prey from the clouds.', flavor: 'BARDIC' },
    { id: 'COR_035', type: 'CORRECT', text: 'A textbook example of functional relative pitch at work.', flavor: 'GRAVITY' },
    { id: 'COR_036', type: 'CORRECT', text: 'The Sitka spruce plate rang true, and so did your intuition.', flavor: 'LUTHERIE' },
    { id: 'COR_037', type: 'CORRECT', text: 'That note was floating in mid-air until your tap gave it shelter.', flavor: 'BARDIC' },
    { id: 'COR_038', type: 'CORRECT', text: 'Zero cognitive calculation: pure acoustic instinct unleashed.', flavor: 'REFLEX' },
    { id: 'COR_039', type: 'CORRECT', text: 'Your neural audio processor is operating at 96kHz today!', flavor: 'ACOUSTICS' },
    { id: 'COR_040', type: 'CORRECT', text: 'A clean strike: no hesitation, no second-guessing, pure music.', flavor: 'BARDIC' },
    { id: 'COR_041', type: 'CORRECT', text: 'That degree was leaning with all its mass, and you caught it.', flavor: 'GRAVITY' },
    { id: 'COR_042', type: 'CORRECT', text: 'The whole harmonic series bowed to your response.', flavor: 'ACOUSTICS' },
    { id: 'COR_043', type: 'CORRECT', text: 'No flat remarks needed: that was pure melodic gold.', flavor: 'PUN' },
    { id: 'COR_044', type: 'CORRECT', text: 'Soundboard bliss! You nailed the emotional color of that tone.', flavor: 'LUTHERIE' },
    { id: 'COR_045', type: 'CORRECT', text: 'The mystery string is revealed. The sanctuary echoes your triumph.', flavor: 'BARDIC' },
    { id: 'COR_046', type: 'CORRECT', text: 'You caught the delicate balance between active urge and rest.', flavor: 'GRAVITY' },
    { id: 'COR_047', type: 'CORRECT', text: 'Snagged in record time! Your ears have built their own compass.', flavor: 'REFLEX' },
    { id: 'COR_048', type: 'CORRECT', text: 'That was so fast, the sound wave barely made it across the room.', flavor: 'ACOUSTICS' },
    { id: 'COR_049', type: 'CORRECT', text: 'True pitch sensitivity: hearing function over raw distance.', flavor: 'GRAVITY' },
    { id: 'COR_050', type: 'CORRECT', text: 'A half-century of harpers could not have called that quicker.', flavor: 'BARDIC' },
    { id: 'COR_051', type: 'CORRECT', text: 'You read that harmonic fingerprint like an open ancient book.', flavor: 'BARDIC' },
    { id: 'COR_052', type: 'CORRECT', text: 'Resonant brilliance! The string bridge pin vibrates in approval.', flavor: 'LUTHERIE' },
    { id: 'COR_053', type: 'CORRECT', text: 'You parsed the interval without counting steps: pure musicality.', flavor: 'GRAVITY' },
    { id: 'COR_054', type: 'CORRECT', text: 'Clean as a Celtic dawn over the Cliffs of Moher.', flavor: 'BARDIC' },
    { id: 'COR_055', type: 'CORRECT', text: 'That pitch had nowhere to hide in your soundstage.', flavor: 'ACOUSTICS' },
    { id: 'COR_056', type: 'CORRECT', text: 'Pure melodic intuition: you caught the soul of the scale degree.', flavor: 'GRAVITY' },
    { id: 'COR_057', type: 'CORRECT', text: 'The sharping levers salute your tonal vigilance!', flavor: 'LUTHERIE' },
    { id: 'COR_058', type: 'CORRECT', text: 'Your reflex latency is entering master session player territory.', flavor: 'REFLEX' },
    { id: 'COR_059', type: 'CORRECT', text: 'Acoustic mastery: parsing frequency and function simultaneously.', flavor: 'ACOUSTICS' },
    { id: 'COR_060', type: 'CORRECT', text: 'A golden strike on the harp of your inner ear.', flavor: 'BARDIC' },
    { id: 'COR_061', type: 'CORRECT', text: 'You felt the downward urge and anticipated the tonic home.', flavor: 'GRAVITY' },
    { id: 'COR_062', type: 'CORRECT', text: 'That guess was tuned to A440 perfection.', flavor: 'PUN' },
    { id: 'COR_063', type: 'CORRECT', text: 'You plucked the right answer right out of thin air!', flavor: 'PUN' },
    { id: 'COR_064', type: 'CORRECT', text: 'The acoustic envelope opened up, and you stepped right inside.', flavor: 'ACOUSTICS' },
    { id: 'COR_065', type: 'CORRECT', text: 'Soundboard resonance validated: that degree is in your pocket.', flavor: 'LUTHERIE' },
    { id: 'COR_066', type: 'CORRECT', text: 'You hear the scale degree personality before the note decays.', flavor: 'GRAVITY' },
    { id: 'COR_067', type: 'CORRECT', text: 'Lightning fast auditory cortex firing on all cylinders!', flavor: 'REFLEX' },
    { id: 'COR_068', type: 'CORRECT', text: 'An effortless translation from sound wave to scale degree.', flavor: 'ACOUSTICS' },
    { id: 'COR_069', type: 'CORRECT', text: 'True relative pitch in action: anchoring the key like a boulder.', flavor: 'GRAVITY' },
    { id: 'COR_070', type: 'CORRECT', text: 'Pure O\'Carolan instinct running through your fingertips.', flavor: 'BARDIC' },
    { id: 'COR_071', type: 'CORRECT', text: 'That pitch was caught before the room impulse response settled.', flavor: 'ACOUSTICS' },
    { id: 'COR_072', type: 'CORRECT', text: 'Zero hesitation: the hallmark of a seasoned session musician.', flavor: 'REFLEX' },
    { id: 'COR_073', type: 'CORRECT', text: 'You caught the leading edge of the pluck transient instantly.', flavor: 'LUTHERIE' },
    { id: 'COR_074', type: 'CORRECT', text: 'A note well-struck is a battle half-won. Excellent ear!', flavor: 'BARDIC' },
    { id: 'COR_075', type: 'CORRECT', text: 'You heard the tonic anchor holding down the fort.', flavor: 'GRAVITY' },
    { id: 'COR_076', type: 'CORRECT', text: 'Subtle acoustic details cannot slip past your radar.', flavor: 'ACOUSTICS' },
    { id: 'COR_077', type: 'CORRECT', text: 'Your ears are playing the harp with invisible fingers.', flavor: 'BARDIC' },
    { id: 'COR_078', type: 'CORRECT', text: 'No microtonal drift here: dead center in 12-TET space.', flavor: 'ACOUSTICS' },
    { id: 'COR_079', type: 'CORRECT', text: 'You recognized that note like an old friend by the hearth.', flavor: 'BARDIC' },
    { id: 'COR_080', type: 'CORRECT', text: 'Pure harmonic synergy between your ears and the soundbox.', flavor: 'LUTHERIE' },
    { id: 'COR_081', type: 'CORRECT', text: 'The tension resolved, and so did your decisive input.', flavor: 'GRAVITY' },
    { id: 'COR_082', type: 'CORRECT', text: 'That is the sharpest reflex in the entire Celtic realm!', flavor: 'REFLEX' },
    { id: 'COR_083', type: 'CORRECT', text: 'You isolated the fundamental through all the rich spruce bloom.', flavor: 'LUTHERIE' },
    { id: 'COR_084', type: 'CORRECT', text: 'No notes were harmed in the making of that flawless response.', flavor: 'PUN' },
    { id: 'COR_085', type: 'CORRECT', text: 'The tonal gravity was pulling hard, and you rode the wave home.', flavor: 'GRAVITY' },
    { id: 'COR_086', type: 'CORRECT', text: 'An acoustic masterpiece of instant tone identification.', flavor: 'ACOUSTICS' },
    { id: 'COR_087', type: 'CORRECT', text: 'You felt the urge to resolve before the sound faded away.', flavor: 'GRAVITY' },
    { id: 'COR_088', type: 'CORRECT', text: 'Quick as a dancer\'s jig, true as an archer\'s arrow.', flavor: 'BARDIC' },
    { id: 'COR_089', type: 'CORRECT', text: 'The spruce wood plate sang your praise on that one!', flavor: 'LUTHERIE' },
    { id: 'COR_090', type: 'CORRECT', text: 'You caught that scale step without even blinking.', flavor: 'REFLEX' },
    { id: 'COR_091', type: 'CORRECT', text: 'Functional pitch perception at its peak performance.', flavor: 'GRAVITY' },
    { id: 'COR_092', type: 'CORRECT', text: 'Your ear is becoming an acoustic spectrometer.', flavor: 'ACOUSTICS' },
    { id: 'COR_093', type: 'CORRECT', text: 'That note was in your grasp the millisecond the finger released.', flavor: 'LUTHERIE' },
    { id: 'COR_094', type: 'CORRECT', text: 'A clean hit! That degree has met its match.', flavor: 'BARDIC' },
    { id: 'COR_095', type: 'CORRECT', text: 'Zero harmonic distortion in your mental representation.', flavor: 'ACOUSTICS' },
    { id: 'COR_096', type: 'CORRECT', text: 'You caught the subtle modal flavor right away.', flavor: 'GRAVITY' },
    { id: 'COR_097', type: 'CORRECT', text: 'Sub-second earsmithing: the mark of a true master.', flavor: 'REFLEX' },
    { id: 'COR_098', type: 'CORRECT', text: 'The tonic foundation held, and you identified its satellite.', flavor: 'GRAVITY' },
    { id: 'COR_099', type: 'CORRECT', text: 'Pure melodic brilliance! Your path up the summit is blazing.', flavor: 'BARDIC' },
    { id: 'COR_100', type: 'CORRECT', text: 'Centuries of Irish tradition echo in that flawless pluck.', flavor: 'BARDIC' },
  ];

  // =========================================================================
  // 100 HANDCRAFTED CONSTRUCTIVE RESPONSES FOR INCORRECT GUESSES
  // =========================================================================
  public static readonly INCORRECT_100: MusicalResponse[] = [
    { id: 'INC_001', type: 'INCORRECT', text: 'Caught in the gravitational undertow! That note was aching to fall to the tonic.', flavor: 'GRAVITY' },
    { id: 'INC_002', type: 'INCORRECT', text: 'A subtle harmonic overtone decoy! Your ear heard the 3rd harmonic whispering.', flavor: 'ACOUSTICS' },
    { id: 'INC_003', type: 'INCORRECT', text: 'Close call! That note leaned into the leading tone and almost pulled you up.', flavor: 'GRAVITY' },
    { id: 'INC_004', type: 'INCORRECT', text: 'Don\'t fret: even the finest harpers get snagged by that subdominant longing.', flavor: 'PUN' },
    { id: 'INC_005', type: 'INCORRECT', text: 'The tritone trap strikes again! That unresolved tension wanted an escape.', flavor: 'PUN' },
    { id: 'INC_006', type: 'INCORRECT', text: 'A minor misunderstanding in a major world. Reset your cadence compass!', flavor: 'PUN' },
    { id: 'INC_007', type: 'INCORRECT', text: 'You climbed the interval ladder instead of feeling the gravitational weight. Relax and feel it.', flavor: 'GRAVITY' },
    { id: 'INC_008', type: 'INCORRECT', text: 'The Sitka spruce body bloom masked the fundamental for a heartbeat.', flavor: 'LUTHERIE' },
    { id: 'INC_009', type: 'INCORRECT', text: 'That note was playing acoustic hide-and-seek in the reverb tail.', flavor: 'ACOUSTICS' },
    { id: 'INC_010', type: 'INCORRECT', text: 'You caught the shadow of the note, not its anchor! Shake it off and listen again.', flavor: 'BARDIC' },
    { id: 'INC_011', type: 'INCORRECT', text: 'Almost there! You mistook the restless tension for comfortable resolution.', flavor: 'GRAVITY' },
    { id: 'INC_012', type: 'INCORRECT', text: 'A sharp slip of the finger! Remember, each degree has its own emotional weight.', flavor: 'PUN' },
    { id: 'INC_013', type: 'INCORRECT', text: 'The fourth degree is a sly fox: it loves disguising itself as the third.', flavor: 'GRAVITY' },
    { id: 'INC_014', type: 'INCORRECT', text: 'Don\'t worry about the dissonance: every master left some dents in the soundboard.', flavor: 'LUTHERIE' },
    { id: 'INC_015', type: 'INCORRECT', text: 'You jumped too fast! Take half a beat to feel the gravitational attraction.', flavor: 'REFLEX' },
    { id: 'INC_016', type: 'INCORRECT', text: 'That seventh degree has magnetic pull toward the octave: it tricked your reflex.', flavor: 'GRAVITY' },
    { id: 'INC_017', type: 'INCORRECT', text: 'The overtone series set a trap, and you stepped right on the tripwire.', flavor: 'ACOUSTICS' },
    { id: 'INC_018', type: 'INCORRECT', text: 'A flat response to a lively note! Breathe deep and let the cadence re-center you.', flavor: 'PUN' },
    { id: 'INC_019', type: 'INCORRECT', text: 'The soundbox cavity resonance at 140Hz can be deceiving. Listen to the high transient.', flavor: 'LUTHERIE' },
    { id: 'INC_020', type: 'INCORRECT', text: 'Close neighbor! You were just one scale degree off in the direction of tension.', flavor: 'GRAVITY' },
    { id: 'INC_021', type: 'INCORRECT', text: 'That note was sliding down toward the root; you caught it mid-fall.', flavor: 'GRAVITY' },
    { id: 'INC_022', type: 'INCORRECT', text: 'The sharping lever slipped in your mind! Check the key anchor again.', flavor: 'LUTHERIE' },
    { id: 'INC_023', type: 'INCORRECT', text: 'You heard the consonant triad note, but the mystery was the passing step.', flavor: 'ACOUSTICS' },
    { id: 'INC_024', type: 'INCORRECT', text: 'No shame in a false resolve: that is how our auditory pathways learn.', flavor: 'BARDIC' },
    { id: 'INC_025', type: 'INCORRECT', text: 'Listen not to how high the note is, but how badly it wants to resolve.', flavor: 'GRAVITY' },
    { id: 'INC_026', type: 'INCORRECT', text: 'The second degree can feel very stable until compared directly with the tonic.', flavor: 'GRAVITY' },
    { id: 'INC_027', type: 'INCORRECT', text: 'A momentary acoustic illusion in the stereofield. Clean the slate!', flavor: 'ACOUSTICS' },
    { id: 'INC_028', type: 'INCORRECT', text: 'Even Turlough O\'Carolan had to tune twice before playing. Reset the key!', flavor: 'BARDIC' },
    { id: 'INC_029', type: 'INCORRECT', text: 'You caught the fifth overtone instead of the fundamental root frequency.', flavor: 'ACOUSTICS' },
    { id: 'INC_030', type: 'INCORRECT', text: 'That leading tone snaps upward so fast, it can fool even seasoned harpers.', flavor: 'GRAVITY' },
    { id: 'INC_031', type: 'INCORRECT', text: 'A temporary detour off the stone path! Listen to the upcoming cadence.', flavor: 'BARDIC' },
    { id: 'INC_032', type: 'INCORRECT', text: 'Pushed by the rhythm rather than the pitch. Slow down and feel the soundboard.', flavor: 'REFLEX' },
    { id: 'INC_033', type: 'INCORRECT', text: 'That sixth degree carries a sweet sadness that easily masquerades as the second.', flavor: 'GRAVITY' },
    { id: 'INC_034', type: 'INCORRECT', text: 'An acoustic slip-up: the room impulse convolution gave you an echo.', flavor: 'ACOUSTICS' },
    { id: 'INC_035', type: 'INCORRECT', text: 'Do not measure the distance from the last note; relate it back to the tonic center!', flavor: 'GRAVITY' },
    { id: 'INC_036', type: 'INCORRECT', text: 'The string bridge pin caught a harmonic vibration. Try feeling the belly resonance.', flavor: 'LUTHERIE' },
    { id: 'INC_037', type: 'INCORRECT', text: 'A natural misjudgment! That note had some modal flavor confusing the ear.', flavor: 'PUN' },
    { id: 'INC_038', type: 'INCORRECT', text: 'You guessed the note that resolves it, rather than the note itself! Look forward.', flavor: 'GRAVITY' },
    { id: 'INC_039', type: 'INCORRECT', text: 'The ear got dizzy on the arpeggio roll. Re-anchor your ears to the low bass.', flavor: 'LUTHERIE' },
    { id: 'INC_040', type: 'INCORRECT', text: 'That note wanted to fall into the mediant so hard, you anticipated the landing.', flavor: 'GRAVITY' },
    { id: 'INC_041', type: 'INCORRECT', text: 'A rogue frequency caught your attention! Keep your focus on the tonic anchor.', flavor: 'ACOUSTICS' },
    { id: 'INC_042', type: 'INCORRECT', text: 'Off by a single diatonic notch. The ear is calibrating its internal caliper.', flavor: 'BARDIC' },
    { id: 'INC_043', type: 'INCORRECT', text: 'That submediant degree was whispering sweet lies about the dominant pillar.', flavor: 'GRAVITY' },
    { id: 'INC_044', type: 'INCORRECT', text: 'The nylon string pluck transient was slightly fleshy; listen through to the decay.', flavor: 'LUTHERIE' },
    { id: 'INC_045', type: 'INCORRECT', text: 'You heard the shadow of the octave. Check whether it sits low or high.', flavor: 'ACOUSTICS' },
    { id: 'INC_046', type: 'INCORRECT', text: 'Tension vs Resolution: that note was holding tension, not resting at home.', flavor: 'GRAVITY' },
    { id: 'INC_047', type: 'INCORRECT', text: 'A brief discord in the sanctuary. Clear the mind and catch the next cadence.', flavor: 'BARDIC' },
    { id: 'INC_048', type: 'INCORRECT', text: 'You analyzed with your brain instead of hearing with your intuition. Trust the pull.', flavor: 'GRAVITY' },
    { id: 'INC_049', type: 'INCORRECT', text: 'That fifth degree is so stable, it sometimes makes neighboring notes sound like home.', flavor: 'GRAVITY' },
    { id: 'INC_050', type: 'INCORRECT', text: 'The wood soundboard plate filtered out a hint of treble. Keep your ears sharp!', flavor: 'LUTHERIE' },
    { id: 'INC_051', type: 'INCORRECT', text: 'A misstep on the stepping stones! The mountain trail is steep, but you will climb it.', flavor: 'BARDIC' },
    { id: 'INC_052', type: 'INCORRECT', text: 'The sound wave bounced off the stone archway and fooled the arrival angle.', flavor: 'ACOUSTICS' },
    { id: 'INC_053', type: 'INCORRECT', text: 'You felt the upward energy of the leading tone, but guessed its target instead.', flavor: 'GRAVITY' },
    { id: 'INC_054', type: 'INCORRECT', text: 'No foul! That pitch was right on the borderline of your auditory buffer.', flavor: 'REFLEX' },
    { id: 'INC_055', type: 'INCORRECT', text: 'The third degree is pure sunlight; the fourth is the yearning question mark.', flavor: 'GRAVITY' },
    { id: 'INC_056', type: 'INCORRECT', text: 'Your ear fell into the minor trap! Remember we are anchored in major warmth.', flavor: 'PUN' },
    { id: 'INC_057', type: 'INCORRECT', text: 'That finger roll arpeggio left a lingering overtone in the air.', flavor: 'LUTHERIE' },
    { id: 'INC_058', type: 'INCORRECT', text: 'Listen for the gravitational center. The tonic is where the stone rests.', flavor: 'GRAVITY' },
    { id: 'INC_059', type: 'INCORRECT', text: 'A momentary lapse in harmonic vigilance. The next cadence will set you free.', flavor: 'BARDIC' },
    { id: 'INC_060', type: 'INCORRECT', text: 'You caught the tail of the envelope rather than the attack transient.', flavor: 'ACOUSTICS' },
    { id: 'INC_061', type: 'INCORRECT', text: 'The second degree leans down; the seventh snaps up. Feel the direction of the magnet.', flavor: 'GRAVITY' },
    { id: 'INC_062', type: 'INCORRECT', text: 'A quick slip on a mossy cobblestone. Shake off the dust and listen deeply.', flavor: 'BARDIC' },
    { id: 'INC_063', type: 'INCORRECT', text: 'That was the restless fourth degree masquerading as the peaceful fifth.', flavor: 'GRAVITY' },
    { id: 'INC_064', type: 'INCORRECT', text: 'The harp soundbox gave you a warm resonance bump that obscured the fundamental.', flavor: 'LUTHERIE' },
    { id: 'INC_065', type: 'INCORRECT', text: 'Don\'t let the octave leap trick you: the functional role never changes.', flavor: 'GRAVITY' },
    { id: 'INC_066', type: 'INCORRECT', text: 'A near miss! That degree was right next door on the diatonic scale.', flavor: 'BARDIC' },
    { id: 'INC_067', type: 'INCORRECT', text: 'You heard the consonant color and forgot to test its downward pull.', flavor: 'GRAVITY' },
    { id: 'INC_068', type: 'INCORRECT', text: 'Sound wave interference in the air! Center your mental tuning fork.', flavor: 'ACOUSTICS' },
    { id: 'INC_069', type: 'INCORRECT', text: 'The seventh degree is the hungry wolf at the gate of the octave. Remember its bite!', flavor: 'BARDIC' },
    { id: 'INC_070', type: 'INCORRECT', text: 'A little too eager on the trigger! Let the note sing for 200ms before guessing.', flavor: 'REFLEX' },
    { id: 'INC_071', type: 'INCORRECT', text: 'That degree was searching for its root; you gave it the wrong destination.', flavor: 'GRAVITY' },
    { id: 'INC_072', type: 'INCORRECT', text: 'The spruce wood resonance was singing in harmony with the note.', flavor: 'LUTHERIE' },
    { id: 'INC_073', type: 'INCORRECT', text: 'A classic scale degree mix-up: tension mistaken for resolution.', flavor: 'GRAVITY' },
    { id: 'INC_074', type: 'INCORRECT', text: 'The Celtic mist settled over the soundboard. The upcoming chords will clear it.', flavor: 'BARDIC' },
    { id: 'INC_075', type: 'INCORRECT', text: 'You heard an inversion artifact! Listen to the lowest fundamental bass.', flavor: 'ACOUSTICS' },
    { id: 'INC_076', type: 'INCORRECT', text: 'That note wanted to fall like rain into Do, not leap to the sky.', flavor: 'GRAVITY' },
    { id: 'INC_077', type: 'INCORRECT', text: 'A stumble before the milestone is just training for the bardic summit.', flavor: 'BARDIC' },
    { id: 'INC_078', type: 'INCORRECT', text: 'That was the subdominant pulling downward, not the dominant resting high.', flavor: 'GRAVITY' },
    { id: 'INC_079', type: 'INCORRECT', text: 'The lever bracket had a slight rattle in your perception. Recalibrate!', flavor: 'LUTHERIE' },
    { id: 'INC_080', type: 'INCORRECT', text: 'Listen for the question mark in the tone. An unresolved note always asks.', flavor: 'GRAVITY' },
    { id: 'INC_081', type: 'INCORRECT', text: 'You got caught in the overtone swirl! Focus strictly on the primary pluck.', flavor: 'ACOUSTICS' },
    { id: 'INC_082', type: 'INCORRECT', text: 'A step too far up the mountain! Return to the tonic center.', flavor: 'BARDIC' },
    { id: 'INC_083', type: 'INCORRECT', text: 'The fourth degree was pretending to be the third. Catch it next time!', flavor: 'GRAVITY' },
    { id: 'INC_084', type: 'INCORRECT', text: 'Your reflex beat your harmonic processor by 50ms. Patience brings precision.', flavor: 'REFLEX' },
    { id: 'INC_085', type: 'INCORRECT', text: 'Soundboard formants can color a pitch; feel its functional gravity instead.', flavor: 'LUTHERIE' },
    { id: 'INC_086', type: 'INCORRECT', text: 'That note was sliding downhill toward the root; keep your hands ready at the bottom.', flavor: 'GRAVITY' },
    { id: 'INC_087', type: 'INCORRECT', text: 'A phantom frequency deceived the ear. The next cadence will restore truth.', flavor: 'ACOUSTICS' },
    { id: 'INC_088', type: 'INCORRECT', text: 'You were listening to interval distance; switch your ears to tonic gravity mode.', flavor: 'GRAVITY' },
    { id: 'INC_089', type: 'INCORRECT', text: 'The sixth degree is sweet and pastoral, but it is not the home fires of the root.', flavor: 'BARDIC' },
    { id: 'INC_090', type: 'INCORRECT', text: 'A slight flutter in the acoustic breeze. Steady your hand and listen.', flavor: 'LUTHERIE' },
    { id: 'INC_091', type: 'INCORRECT', text: 'That pitch had an upward snap you misread as downward drift.', flavor: 'GRAVITY' },
    { id: 'INC_092', type: 'INCORRECT', text: 'Room reverberation can widen a note; focus on the very first 30ms of contact.', flavor: 'ACOUSTICS' },
    { id: 'INC_093', type: 'INCORRECT', text: 'The second degree wanted so badly to be the root. Do not give in to its trickery!', flavor: 'GRAVITY' },
    { id: 'INC_094', type: 'INCORRECT', text: 'Even ancient Irish bards missed a note when playing by candlelight.', flavor: 'BARDIC' },
    { id: 'INC_095', type: 'INCORRECT', text: 'Listen to how that tone yearns for resolution. The tonic is peace; this was tension.', flavor: 'GRAVITY' },
    { id: 'INC_096', type: 'INCORRECT', text: 'The nylon string vibration decayed into a sympathetic octave. Catch the start.', flavor: 'LUTHERIE' },
    { id: 'INC_097', type: 'INCORRECT', text: 'A rushed tap! Let the chord progression wash through your ears first.', flavor: 'REFLEX' },
    { id: 'INC_098', type: 'INCORRECT', text: 'That note was orbiting the dominant pillar, not resting inside it.', flavor: 'GRAVITY' },
    { id: 'INC_099', type: 'INCORRECT', text: 'A quick slip of the mental lever! The next trial is yours to conquer.', flavor: 'PUN' },
    { id: 'INC_100', type: 'INCORRECT', text: 'Every wrong guess polishes the ear\'s gemstone. Listen to this resolution!', flavor: 'BARDIC' },
  ];

  private static lastCorrectIndex = -1;
  private static lastIncorrectIndex = -1;
  private static recentCorrectIndices: number[] = [];
  private static recentIncorrectIndices: number[] = [];

  /**
   * Selects a fresh, non-repetitive response for a correct guess.
   */
  public static getRandomCorrectResponse(): MusicalResponse {
    const list = this.CORRECT_100;
    let chosenIdx = Math.floor(Math.random() * list.length);

    // Keep anti-fatigue memory of last 25 responses
    for (let attempts = 0; attempts < 10; attempts++) {
      if (!this.recentCorrectIndices.includes(chosenIdx)) break;
      chosenIdx = Math.floor(Math.random() * list.length);
    }

    this.recentCorrectIndices.push(chosenIdx);
    if (this.recentCorrectIndices.length > 25) {
      this.recentCorrectIndices.shift();
    }
    this.lastCorrectIndex = chosenIdx;
    return list[chosenIdx];
  }

  /**
   * Selects a fresh, non-repetitive constructive response for an incorrect guess.
   */
  public static getRandomIncorrectResponse(): MusicalResponse {
    const list = this.INCORRECT_100;
    let chosenIdx = Math.floor(Math.random() * list.length);

    for (let attempts = 0; attempts < 10; attempts++) {
      if (!this.recentIncorrectIndices.includes(chosenIdx)) break;
      chosenIdx = Math.floor(Math.random() * list.length);
    }

    this.recentIncorrectIndices.push(chosenIdx);
    if (this.recentIncorrectIndices.length > 25) {
      this.recentIncorrectIndices.shift();
    }
    this.lastIncorrectIndex = chosenIdx;
    return list[chosenIdx];
  }
}
