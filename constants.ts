import { MusicKey, Scale, DrumPattern, PresetProgression, SynthPreset, ArpeggiatorRate, ArpeggiatorDirection, HarmonyInterval } from './types';

export const MUSIC_KEYS: MusicKey[] = ['A', 'Bb', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
export const SCALES: Scale[] = ['Major', 'Minor'];
export const DRUM_PATTERNS: DrumPattern[] = ['Pop Rock', 'Four On The Floor', 'Funk', 'Reggae', 'Techno', 'Hip-Hop', 'Latin'];
export const SYNTH_PRESETS: SynthPreset[] = ['Sawtooth', 'Warm Pad', 'Electric Piano', 'Sine Lead', 'FM Pluck', 'Square Lead', 'Wobble Bass', 'Classic Organ', 'String Ensemble', 'Brass Section', 'Clean Guitar'];

// Arpeggiator constants
export const ARPEGGIATOR_RATES: ArpeggiatorRate[] = ['32n', '16n', '8n', '4n', '2n', '1n'];
export const ARPEGGIATOR_DIRECTIONS: ArpeggiatorDirection[] = ['up', 'down', 'upDown', 'random'];

// Harmony constants
export const HARMONY_INTERVALS: HarmonyInterval[] = ['2nd', '3rd', '5th', '6th', '7th'];


export const PRESET_PROGRESSIONS: PresetProgression[] = [
  { name: "Pop-Hymne (I-V-vi-IV)", roman: ['I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'IV'] },
  { name: "Gefühlvolle Ballade (vi-V-I-IV)", roman: ['vi', 'V', 'I', 'IV', 'vi', 'V', 'I', 'IV'] },
  { name: "Hit-Ballade (vi-IV-I-V)", roman: ['vi', 'IV', 'I', 'V', 'vi', 'IV', 'I', 'V'] },
  { name: "50er Doo-Wop (I-vi-IV-V)", roman: ['I', 'vi', 'IV', 'V', 'I', 'vi', 'IV', 'V'] },
  { name: "Classic Rock (I-IV-V)", roman: ['I', 'IV', 'V', 'V', 'I', 'IV', 'V', 'V'] },
  { name: "Jazz-Standard (ii-V-I)", roman: ['iim7', 'V7', 'Imaj7', 'Imaj7', 'iim7', 'V7', 'Imaj7', 'Imaj7'] },
  { name: "Einfacher Blues (I-IV-I-V)", roman: ['I7', 'IV7', 'I7', 'V7', 'I7', 'IV7', 'I7', 'V7'] },
  { name: "Moll-Kadenz (i-iv-V-i)", roman: ['im', 'ivm', 'V', 'im', 'im', 'ivm', 'V', 'im'] },
  { name: "Andalusische Kadenz (i-VII-VI-V)", roman: ['im', 'VII', 'VI', 'V', 'im', 'VII', 'VI', 'V'] },
  { name: "Rock-Power (I-bVII-IV-I)", roman: ['I', 'bVII', 'IV', 'I', 'I', 'bVII', 'IV', 'I'] },
  { name: "Folk-Standard (I-ii-IV-V)", roman: ['I', 'ii', 'IV', 'V', 'I', 'ii', 'IV', 'V'] },
  { name: "Uplifting Chorus (IV-I-V-vi)", roman: ['IV', 'I', 'V', 'vi', 'IV', 'I', 'V', 'vi'] },
];