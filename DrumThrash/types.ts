export type MusicKey = 'A' | 'Bb' | 'B' | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#';
export type Scale = 'Major' | 'Minor';
export type DrumPattern = 'Pop Rock' | 'Four On The Floor' | 'Funk' | 'Reggae' | 'Techno' | 'Hip-Hop' | 'Latin';
export type SynthPreset = 'Sawtooth' | 'Warm Pad' | 'Electric Piano' | 'Sine Lead' | 'FM Pluck' | 'Square Lead' | 'Wobble Bass' | 'Classic Organ' | 'String Ensemble' | 'Brass Section' | 'Clean Guitar';

// Arpeggiator types
export type ArpeggiatorRate = '1n' | '2n' | '4n' | '8n' | '16n' | '32n';
export type ArpeggiatorDirection = 'up' | 'down' | 'upDown' | 'random';
export type HarmonyInterval = '2nd' | '3rd' | '5th' | '6th' | '7th';

export interface DrumStep {
  kick?: boolean;
  snare?: boolean;
  hihat?: boolean;
}

export interface CustomDrumPattern {
  name: string;
  pattern: (DrumStep | null)[];
}

export interface JamState {
  progression: string[];
  bpm: number;
  musicKey: MusicKey;
  scale: Scale;
  drumPattern: DrumPattern | string; // Can be a preset name or a custom pattern name
  kickVolume: number;
  snareVolume: number;
  hihatVolume: number;
  synthVolume: number;
  bassVolume: number;
  kickPan: number;
  snarePan: number;
  hihatPan: number;
  synthPan: number;
  selectedPresetIndex: number;
  synthPreset: SynthPreset;
  useInversions: boolean;
  synthOctave: number;
  synthFilterCutoff: number;
  synthFilterResonance: number;
  voicingVariation: boolean;
  spreadVoicing: boolean;
  harmonyInterval: HarmonyInterval | null;
  harmonyVolume: number;
  // Arpeggiator state
  arpeggiatorEnabled: boolean;
  arpeggiatorRate: ArpeggiatorRate;
  arpeggiatorDirection: ArpeggiatorDirection;
  arpeggiatorGate: number; // 0.1 to 1.0
  // Custom Drum Patterns
  customDrumPatterns: CustomDrumPattern[];
}

export interface PresetProgression {
  name: string;
  roman: string[];
}