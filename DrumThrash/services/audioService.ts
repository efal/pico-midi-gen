import * as Tone from 'tone';
import { RecursivePartial } from 'tone/build/esm/core/util/Interface';
import { DrumPattern, DrumStep, SynthPreset, ArpeggiatorDirection, ArpeggiatorRate, HarmonyInterval } from '../types';

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_TO_INDEX: { [key: string]: number } = {
    'C': 0, 'B#': 0,
    'C#': 1, 'Db': 1,
    'D': 2,
    'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4,
    'F': 5, 'E#': 5,
    'F#': 6, 'Gb': 6,
    'G': 7,
    'G#': 8, 'Ab': 8,
    'A': 9,
    'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11,
};

class AudioServiceClass {
    private isInitialized = false;

    private drums: { kick: any, snare: any, hihat: any } | null = null;
    private useSampledDrums = false;
    private chordSynth: Tone.PolySynth<Tone.MonoSynth> | null = null;
    private harmonySynth: Tone.PolySynth<Tone.MonoSynth> | null = null;
    private bassSynth: Tone.MonoSynth | null = null;
    private limiter: Tone.Limiter | null = null;

    private kickVolume: Tone.Volume | null = null;
    private snareVolume: Tone.Volume | null = null;
    private hihatVolume: Tone.Volume | null = null;
    private synthVolume: Tone.Volume | null = null;
    private bassVolume: Tone.Volume | null = null;
    private harmonyVolume: Tone.Volume | null = null;
    
    private kickPanner: Tone.Panner | null = null;
    private snarePanner: Tone.Panner | null = null;
    private hihatPanner: Tone.Panner | null = null;
    private synthPanner: Tone.Panner | null = null;

    private synthFilter: Tone.Filter | null = null;
    private stereoDelay: Tone.PingPongDelay | null = null;
    private reverb: Tone.Reverb | null = null;

    private drumSequence: Tone.Sequence | null = null;
    private chordSequence: Tone.Sequence | null = null;
    private harmonySequence: Tone.Sequence | null = null;
    private bassSequence: Tone.Sequence | null = null;
    
    private _bpm = 80;
    private _useInversions = true;
    private _synthOctave = 0;
    private _voicingVariation = true;
    private _spreadVoicing = true;
    private _harmonyInterval: HarmonyInterval | null = null;

    private _synthFilterCutoff = 8000;
    private _synthFilterResonance = 1;

    private _arpeggiatorEnabled = false;
    private _arpeggiatorRate: ArpeggiatorRate = '16n';
    private _arpeggiatorDirection: ArpeggiatorDirection = 'up';
    private _arpeggiatorGate = 0.8;

    public static drumPatterns: Record<DrumPattern, (DrumStep | null)[]> = {
        'Pop Rock': [
          { kick: true, hihat: true }, { hihat: true }, { snare: true, hihat: true }, { hihat: true },
          { kick: true, hihat: true }, { hihat: true }, { snare: true, hihat: true }, { hihat: true },
        ],
        'Four On The Floor': [
            { kick: true, hihat: true }, { kick: true, hihat: true }, { kick: true, snare: true, hihat: true }, { kick: true, hihat: true },
            { kick: true, hihat: true }, { kick: true, hihat: true }, { kick: true, snare: true, hihat: true }, { kick: true, hihat: true },
        ],
        'Funk': [
            { kick: true, hihat: true }, { hihat: true }, { snare: true, hihat: true }, { kick: true, hihat: true },
            { hihat: true }, { kick: true, hihat: true }, { snare: true, hihat: true }, { hihat: true },
        ],
        'Reggae': [
            null, { hihat: true }, { kick: true, snare: true, hihat: true }, { hihat: true },
            null, { hihat: true }, { kick: true, snare: true, hihat: true }, { hihat: true },
        ],
        'Techno': [
            { kick: true }, { hihat: true }, { kick: true, hihat: true }, { hihat: true },
            { kick: true }, { hihat: true }, { kick: true, hihat: true }, { hihat: true },
        ],
        'Hip-Hop': [
            { kick: true, hihat: true }, { hihat: true }, { hihat: true }, { snare: true, hihat: true },
            { hihat: true }, { kick: true, hihat: true }, { hihat: true }, { snare: true, hihat: true },
        ],
        'Latin': [
            { kick: true, hihat: true }, { hihat: true }, { snare: true, hihat: true }, { kick: true, hihat: true, snare: true },
            { kick: true, hihat: true }, { hihat: true }, { snare: true, hihat: true }, { snare: true, hihat: true },
        ],
    };

    public static synthPresets: Record<SynthPreset, RecursivePartial<Tone.MonoSynthOptions>> = {
        'Sawtooth': { oscillator: { type: 'fatsawtooth', count: 3, spread: 30 }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 } },
        'Warm Pad': { oscillator: { type: 'fatsquare', count: 3, spread: 20 }, envelope: { attack: 0.4, decay: 0.2, sustain: 0.7, release: 1.2 } },
        'Electric Piano': { oscillator: { type: 'fmsine', modulationIndex: 2, harmonicity: 3, modulationType: 'square' }, envelope: { attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.3 } },
        'Sine Lead': { oscillator: { type: 'sine' }, envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.4 } },
        'FM Pluck': { oscillator: { type: 'fmsine', modulationType: 'triangle', harmonicity: 1.2, modulationIndex: 2.5 }, envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 1.0 } },
        'Square Lead': { oscillator: { type: 'pulse', width: 0.2 }, envelope: { attack: 0.02, decay: 0.4, sustain: 0.4, release: 0.6 } },
        'Wobble Bass': { oscillator: { type: 'fatsawtooth', count: 2, spread: 40 }, filter: { Q: 6, type: "lowpass", rolloff: -24 }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 1 }, filterEnvelope: { attack: 0.06, decay: 0.2, sustain: 0.5, release: 2, baseFrequency: 200, octaves: 4, exponent: 2 } },
        'Classic Organ': { oscillator: { type: 'fatsine', count: 3 }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.2 } },
        'String Ensemble': { oscillator: { type: 'fatsawtooth', count: 4, spread: 40 }, envelope: { attack: 0.6, decay: 0.1, sustain: 0.9, release: 1.5 } },
        'Brass Section': { oscillator: { type: 'fatsawtooth', count: 3, spread: 15 }, filter: { Q: 2, type: "lowpass", rolloff: -24 }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.6 }, filterEnvelope: { attack: 0.08, decay: 0.4, sustain: 0.6, release: 1, baseFrequency: 400, octaves: 3 } },
        'Clean Guitar': { oscillator: { type: 'fmsine', modulationIndex: 1.2, harmonicity: 2, modulationType: 'sine' }, envelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 1.4 } },
    };

    public static getChordNotes(chordName: string, octave: number = 0, spread: boolean = false): string[] {
        if (!chordName || chordName.toLowerCase() === 'n.c.') {
            return [];
        }
        const rootMatch = chordName.match(/^[A-G][#b]?/);
        if (!rootMatch) return [];
    
        const root = rootMatch[0];
        const quality = chordName.substring(root.length);
        const rootIndex = NOTE_TO_INDEX[root as keyof typeof NOTE_TO_INDEX];
        if (rootIndex === undefined) return [];

        const degrees = new Map<number, number>();
        degrees.set(1, 0); // Root is always degree 1, interval 0

        // Determine 3rd: Major by default unless 'm' (but not 'maj'), 'dim' is specified.
        if (quality.includes('dim')) {
            degrees.set(3, 3); // minor 3rd
        } else if (quality.includes('m') && !quality.includes('maj')) {
            degrees.set(3, 3); // minor 3rd for 'm', 'm7', etc.
        } else {
            degrees.set(3, 4); // Major 3rd for '', '7', 'maj7', etc.
        }

        // Determine 5th
        if (quality.includes('dim') || quality.includes('b5')) {
            degrees.set(5, 6); // diminished 5th
        } else if (quality.includes('aug') || quality.includes('+') || quality.includes('#5')) {
            degrees.set(5, 8); // augmented 5th
        } else {
            degrees.set(5, 7); // Perfect 5th
        }
        
        // Suspended chords override 3rd
        if (quality.includes('sus4')) {
            degrees.delete(3);
            degrees.set(4, 5);
        } else if (quality.includes('sus2')) {
            degrees.delete(3);
            degrees.set(2, 2);
        }

        // Sevenths
        if (quality.includes('maj7') || quality.includes('M7')) {
            degrees.set(7, 11); // Major 7th
        } else if (quality.includes('dim7')) {
             degrees.set(7, 9); // Diminished 7th (bb7)
        } else if (quality.includes('7')) { // Must be after maj7
            degrees.set(7, 10); // Dominant/minor 7th
        }

        // Extensions (add them if specified)
        const has9 = quality.includes('9');
        const has11 = quality.includes('11');
        const has13 = quality.includes('13');

        if (has13) {
            if (!degrees.has(7)) degrees.set(7, 10); // 13 implies 7
            if (!degrees.has(9)) degrees.set(9, 14); // 13 implies 9
            degrees.set(13, 21); // Major 13
        }
        if (has11) {
            if (!degrees.has(7)) degrees.set(7, 10); // 11 implies 7
            if (!degrees.has(9)) degrees.set(9, 14); // 11 implies 9
            degrees.set(11, 17); // Perfect 11
        }
        if (has9) {
            if (!degrees.has(7)) degrees.set(7, 10); // 9 implies 7
            degrees.set(9, 14); // Major 9
        }
        
        // 6th chords
        if (quality.includes('6') && !has13) {
            degrees.set(6, 9); // Major 6
        }

        // Alterations (overwrite any previous values)
        const alterations = quality.match(/([#b]\d+)/g) || [];
        for (const alt of alterations) {
            switch (alt) {
                case 'b5': degrees.set(5, 6); break;
                case '#5': degrees.set(5, 8); break;
                case 'b9': degrees.set(9, 13); break;
                case '#9': degrees.set(9, 15); break;
                case '#11': degrees.set(11, 18); break;
                case 'b13': degrees.set(13, 20); break;
            }
        }
    
        const finalIntervals = Array.from(degrees.values());
        const baseOctave = 4 + octave;
        let notes = finalIntervals.sort((a, b) => a - b).map(interval => {
            const noteIndex = rootIndex + interval;
            const noteOctave = baseOctave + Math.floor(noteIndex / 12);
            return `${NOTES_SHARP[noteIndex % 12]}${noteOctave}`;
        });
    
        // Smarter Spread voicing
        if (spread && notes.length > 2) {
            const newNotes = [...notes];
            if (notes.length > 3) {
                // For 7th chords and beyond, use a more musical spread by moving the 3rd and 7th up.
                const thirdInterval = degrees.get(3);
                const seventhInterval = degrees.get(7);

                const thirdIndex = thirdInterval !== undefined ? finalIntervals.indexOf(thirdInterval) : -1;
                const seventhIndex = seventhInterval !== undefined ? finalIntervals.indexOf(seventhInterval) : -1;
                
                // Only move them if they are not the root note (which they shouldn't be, but good to check)
                if (thirdIndex > 0) newNotes[thirdIndex] = Tone.Frequency(newNotes[thirdIndex]).transpose(12).toNote();
                if (seventhIndex > 0) newNotes[seventhIndex] = Tone.Frequency(newNotes[seventhIndex]).transpose(12).toNote();
                
            } else {
                // For simple triads, move the middle note (the 3rd) up an octave for an open sound.
                newNotes[1] = Tone.Frequency(newNotes[1]).transpose(12).toNote();
            }
             // Re-sort notes by MIDI value after transposing
            notes = newNotes.sort((a, b) => Tone.Frequency(a).toMidi() - Tone.Frequency(b).toMidi());
        }
        
        return notes;
    }

    async init() {
        if (this.isInitialized) return;
        await Tone.start();
        
        this.limiter = new Tone.Limiter(-3).toDestination();
        
        // Panners
        this.kickPanner = new Tone.Panner(0).connect(this.limiter);
        this.snarePanner = new Tone.Panner(0).connect(this.limiter);
        this.hihatPanner = new Tone.Panner(0).connect(this.limiter);
        
        // Effects Chain
        this.reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).connect(this.limiter);
        this.stereoDelay = new Tone.PingPongDelay({ delayTime: '8n.', feedback: 0.3, wet: 0.2 }).connect(this.reverb);
        this.synthFilter = new Tone.Filter({
            frequency: this._synthFilterCutoff,
            type: 'lowpass',
            Q: this._synthFilterResonance
        }).connect(this.stereoDelay);
        this.synthPanner = new Tone.Panner(0).connect(this.synthFilter);

        // Volume Nodes
        this.kickVolume = new Tone.Volume(-6).connect(this.kickPanner);
        this.snareVolume = new Tone.Volume(-6).connect(this.snarePanner);
        this.hihatVolume = new Tone.Volume(-12).connect(this.hihatPanner);
        this.bassVolume = new Tone.Volume(-6).connect(this.limiter); // Bass connected directly to limiter (no panner)
        this.synthVolume = new Tone.Volume(-9).connect(this.synthPanner);
        this.harmonyVolume = new Tone.Volume(-18).connect(this.synthPanner);
        this.harmonyVolume.mute = this._harmonyInterval === null;

        const samplers = {
            kick: new Tone.Sampler({ urls: { C1: 'kick.wav' }, baseUrl: '/assets/sounds/' }),
            snare: new Tone.Sampler({ urls: { C1: 'snare.wav' }, baseUrl: '/assets/sounds/' }),
            hihat: new Tone.Sampler({ urls: { C1: 'hihat.wav' }, baseUrl: '/assets/sounds/' })
        };
    
        try {
            await Tone.loaded();
            if (samplers.kick.loaded && samplers.snare.loaded && samplers.hihat.loaded) {
                this.drums = samplers;
                this.useSampledDrums = true;
                console.log('Successfully loaded drum samples.');
            } else {
                throw new Error("Drum samples not loaded despite Tone.loaded resolving.");
            }
        } catch (e) {
            console.warn("Could not load drum samples, falling back to synthesized drums.", e);
            this.useSampledDrums = false;
            samplers.kick.dispose();
            samplers.snare.dispose();
            samplers.hihat.dispose();
        }
        
        if (!this.useSampledDrums) {
            console.log("Using synthesized drums.");
            const snareFilter = new Tone.Filter(4000, "highpass").connect(this.snareVolume!);
            this.drums = {
                kick: new Tone.MembraneSynth({
                    pitchDecay: 0.05,
                    octaves: 8,
                    oscillator: { type: 'sine' },
                    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' }
                }),
                snare: new Tone.NoiseSynth({
                    noise: { type: 'white' },
                    envelope: { attack: 0.005, decay: 0.2, sustain: 0.05, release: 0.1 }
                }).connect(snareFilter),
                hihat: new Tone.NoiseSynth({
                    noise: { type: 'pink' },
                    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.05 }
                })
            };
        }

        this.drums!.kick.connect(this.kickVolume!);
        this.drums!.snare.connect(this.snareVolume!);
        this.drums!.hihat.connect(this.hihatVolume!);

        // FIX: The `maxPolyphony` option is not a valid voice option for the `PolySynth` constructor. It should be set on the instance directly.
        this.chordSynth = new Tone.PolySynth(Tone.MonoSynth).set(AudioServiceClass.synthPresets['Sawtooth']).connect(this.synthVolume);
        this.chordSynth.maxPolyphony = 8;
        // FIX: The `maxPolyphony` option is not a valid voice option for the `PolySynth` constructor. It should be set on the instance directly.
        this.harmonySynth = new Tone.PolySynth(Tone.MonoSynth).set(AudioServiceClass.synthPresets['Sawtooth']).connect(this.harmonyVolume);
        this.harmonySynth.maxPolyphony = 8;
        this.bassSynth = new Tone.MonoSynth({ oscillator: { type: 'fmsine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 } }).connect(this.bassVolume);

        Tone.Transport.bpm.value = this._bpm;
        this.isInitialized = true;
    }
    
    start(progression: string[], patternData: (DrumStep | null)[], onNextChord: (index: number) => void) {
        if (!this.isInitialized || !this.chordSynth || !this.drums) return;
        this.stop();
        
        const finalProgression = this.calculateVoicedProgression(progression);
        
        this.chordSequence = new Tone.Sequence((time, chordInfo) => {
            if (chordInfo.notes.length > 0) {
                 if (this._arpeggiatorEnabled) {
                    const arpRateSeconds = Tone.Time(this._arpeggiatorRate).toSeconds();
                    const noteDuration = arpRateSeconds * this._arpeggiatorGate;
                    const barDurationSeconds = Tone.Time('1m').toSeconds();
                    const numStepsPerBar = Math.floor(barDurationSeconds / arpRateSeconds);
                    const arpeggiatedNotes = this.generateArpeggioSequence(chordInfo.notes, this._arpeggiatorDirection, numStepsPerBar);
                    
                    arpeggiatedNotes.forEach((note, stepIndex) => {
                        const noteTime = time + stepIndex * arpRateSeconds;
                        this.chordSynth?.triggerAttackRelease(note, noteDuration, noteTime);
                    });
                } else {
                    this.chordSynth?.triggerAttackRelease(chordInfo.notes, '1m', time);
                }
            }
            Tone.Draw.schedule(() => onNextChord(chordInfo.index), time);
        }, finalProgression.map((notes, index) => ({ notes, index })), '1m').start(0);

        this.bassSequence = new Tone.Sequence((time, chord) => {
            if (!this.bassSynth) return;
            const rootMatch = chord.match(/^[A-G][#b]?/);
            if (rootMatch) {
                const root = rootMatch[0];
                this.bassSynth.triggerAttackRelease(`${root}2`, '1m', time);
            }
        }, progression, '1m').start(0);

        this.harmonySequence = new Tone.Sequence((time, chord) => {
            if (!this.harmonySynth || !this._harmonyInterval) return;

            if (this._harmonyInterval === '3rd' && chord.includes('sus')) {
                return;
            }

            const rootMatch = chord.match(/^[A-G][#b]?/);
            if (!rootMatch) return;
            
            const root = rootMatch[0];
            const hasMaj7 = chord.includes('maj');
            const isMinor = chord.includes('m') && !hasMaj7;
            const isDominant = chord.includes('7') && !hasMaj7;
            const isDiminished = chord.includes('dim');
            
            let semitones: number;
            switch(this._harmonyInterval) {
                case '2nd': semitones = 2; break; 
                case '3rd': semitones = (isMinor || isDiminished) ? 3 : 4; break;
                case '5th': semitones = isDiminished ? 6 : 7; break;
                case '6th': semitones = (isMinor || isDiminished) ? 8 : 9; break;
                case '7th': semitones = (isMinor || isDominant || isDiminished) ? 10 : 11; break;
                default: return;
            }
            
            const harmonyNote = Tone.Frequency(root + (4 + this._synthOctave)).transpose(semitones).toNote();
            this.harmonySynth.triggerAttackRelease(harmonyNote, '1m', time);

        }, progression, '1m').start(0);

        this.drumSequence = new Tone.Sequence((time, note: DrumStep) => {
            if (!this.drums || !note) return;

            if (this.useSampledDrums) {
                if (note.kick) this.drums.kick.triggerAttackRelease('C1', '8n', time);
                if (note.snare) this.drums.snare.triggerAttackRelease('C1', '8n', time);
                if (note.hihat) this.drums.hihat.triggerAttackRelease('C1', '8n', time, 0.8);
            } else {
                if (note.kick) this.drums.kick.triggerAttackRelease('C1', '8n', time, 1);
                if (note.snare) this.drums.snare.triggerAttackRelease('16n', time, 0.9);
                if (note.hihat) this.drums.hihat.triggerAttackRelease('16n', time, 0.6);
            }
        }, patternData, '8n').start(0);
        
        Tone.Transport.start();
    }
    
    stop() {
        Tone.Transport.stop();
        this.chordSynth?.releaseAll();
        this.harmonySynth?.releaseAll();
        this.bassSynth?.triggerRelease();
        Tone.Transport.cancel(0);
        this.drumSequence?.dispose();
        this.chordSequence?.dispose();
        this.harmonySequence?.dispose();
        this.bassSequence?.dispose();
    }

    setBpm(bpm: number) {
      this._bpm = bpm;
      if (this.isInitialized) {
        Tone.Transport.bpm.value = bpm;
      }
    }
    setKickVolume(vol: number) { this.kickVolume?.volume.set({ value: vol }); }
    setSnareVolume(vol: number) { this.snareVolume?.volume.set({ value: vol }); }
    setHihatVolume(vol: number) { this.hihatVolume?.volume.set({ value: vol }); }
    setSynthVolume(vol: number) { this.synthVolume?.volume.set({ value: vol }); }
    setBassVolume(vol: number) { this.bassVolume?.volume.set({ value: vol }); }
    setKickPan(pan: number) { this.kickPanner?.pan.set({ value: pan }); }
    setSnarePan(pan: number) { this.snarePanner?.pan.set({ value: pan }); }
    setHihatPan(pan: number) { this.hihatPanner?.pan.set({ value: pan }); }
    setSynthPan(pan: number) { this.synthPanner?.pan.set({ value: pan }); }
    setSynthPreset(preset: SynthPreset) {
        this.chordSynth?.set(AudioServiceClass.synthPresets[preset]);
        this.harmonySynth?.set(AudioServiceClass.synthPresets[preset]);
    }
    setUseInversions(enabled: boolean) { this._useInversions = enabled; }
    setSynthOctave(octave: number) { this._synthOctave = octave; }
    setSynthFilterCutoff(freq: number) {
        this._synthFilterCutoff = freq;
        this.synthFilter?.frequency.set({ value: freq });
    }
    setSynthFilterResonance(q: number) {
        this._synthFilterResonance = q;
        this.synthFilter?.Q.set({ value: q });
    }
    setVoicingVariation(enabled: boolean) { this._voicingVariation = enabled; }
    setSpreadVoicing(enabled: boolean) { this._spreadVoicing = enabled; }
    
    setHarmonyInterval(interval: HarmonyInterval | null) {
        this._harmonyInterval = interval;
        if (this.harmonyVolume) {
            this.harmonyVolume.mute = interval === null;
        }
    }

    setHarmonyVolume(vol: number) { this.harmonyVolume?.volume.set({ value: vol }); }
    setArpeggiatorEnabled(enabled: boolean) { this._arpeggiatorEnabled = enabled; }
    setArpeggiatorRate(rate: ArpeggiatorRate) { this._arpeggiatorRate = rate; }
    setArpeggiatorDirection(direction: ArpeggiatorDirection) { this._arpeggiatorDirection = direction; }
    setArpeggiatorGate(gate: number) { this._arpeggiatorGate = gate; }
    
    private calculateVoicedProgression(progression: string[]): string[][] {
        const getNotesForChord = (chord: string) => AudioServiceClass.getChordNotes(chord, this._synthOctave, this._spreadVoicing);
        
        if (!this._useInversions) {
            return progression.map(getNotesForChord);
        }

        const finalProgression: string[][] = [];
        let lastChordNotes: string[] | null = null;

        for (const chord of progression) {
            const currentNotes = getNotesForChord(chord);
            if (currentNotes.length === 0) {
                finalProgression.push([]);
                lastChordNotes = null;
                continue;
            }

            if (!lastChordNotes || lastChordNotes.length === 0) {
                finalProgression.push(currentNotes);
                lastChordNotes = currentNotes;
                continue;
            }

            const lastAverageMidi = lastChordNotes.reduce((sum, n) => sum + Tone.Frequency(n).toMidi(), 0) / lastChordNotes.length;
            const candidates: { voicing: string[], distance: number }[] = [];

            [-1, 0, 1].forEach(octaveOffset => {
                const shiftedNotes = currentNotes.map(n => Tone.Frequency(n).transpose(octaveOffset * 12).toNote());
                
                const inversions: string[][] = [shiftedNotes];
                for (let i = 0; i < shiftedNotes.length - 1; i++) {
                    const lastVoicing = inversions[inversions.length - 1];
                    const nextVoicing = [...lastVoicing.slice(1), Tone.Frequency(lastVoicing[0]).transpose(12).toNote()];
                    inversions.push(nextVoicing);
                }

                inversions.forEach(voicing => {
                    if (voicing.length === 0) return;
                    const currentAverageMidi = voicing.reduce((sum, n) => sum + Tone.Frequency(n).toMidi(), 0) / voicing.length;
                    const distance = Math.abs(currentAverageMidi - lastAverageMidi);
                    if (!isNaN(distance)) {
                        candidates.push({ voicing, distance });
                    }
                });
            });

            if (candidates.length === 0) {
                finalProgression.push(currentNotes);
                lastChordNotes = currentNotes;
                continue;
            }

            candidates.sort((a, b) => a.distance - b.distance);
            
            let bestVoicing: string[];
            if (this._voicingVariation && candidates.length > 1) {
                const topCandidates = candidates.slice(0, 2).map(c => c.voicing);
                bestVoicing = topCandidates[Math.floor(Math.random() * topCandidates.length)];
            } else {
                bestVoicing = candidates[0].voicing;
            }
            
            finalProgression.push(bestVoicing);
            lastChordNotes = bestVoicing;
        }

        return finalProgression;
    }

    private generateArpeggioSequence(notes: string[], direction: ArpeggiatorDirection, steps: number): string[] {
        if (notes.length === 0) return [];
        
        let pattern: string[] = [];
        switch (direction) {
            case 'up':
                pattern = [...notes];
                break;
            case 'down':
                pattern = [...notes].reverse();
                break;
            case 'upDown':
                pattern = [...notes, ...notes.slice(1, -1).reverse()];
                break;
            case 'random':
                const indices = Array.from({ length: steps }, () => Math.floor(Math.random() * notes.length));
                return indices.map(i => notes[i]);
        }
        
        if (pattern.length === 0) return [];
    
        const result: string[] = [];
        for (let i = 0; i < steps; i++) {
            result.push(pattern[i % pattern.length]);
        }
        return result;
    }
}

const audioService = new AudioServiceClass();

export { audioService, AudioServiceClass as AudioService };