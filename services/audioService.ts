
import * as Tone from 'tone';
import { DrumPattern, DrumStep, SynthPreset, ArpeggiatorDirection, ArpeggiatorRate, HarmonyInterval, SynthConfig } from '../types';

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
const NOTE_TO_INDEX: { [key: string]: number } = {
    'C': 0,
    'C#': 1, 'Db': 1,
    'D': 2,
    'D#': 3, 'Eb': 3,
    'E': 4,
    'F': 5,
    'F#': 6, 'Gb': 6,
    'G': 7,
    'G#': 8, 'Ab': 8,
    'A': 9,
    'Bb': 10,
    'B': 11,
};

class AudioServiceClass {
    private isInitialized = false;
    private _isResetting = false; // Guard against race conditions

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
    private bassPanner: Tone.Panner | null = null;
    private harmonyPanner: Tone.Panner | null = null;

    private synthFilter: Tone.Filter | null = null;
    private stereoDelay: Tone.PingPongDelay | null = null;
    private reverb: Tone.JCReverb | null = null;

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

    private _arpeggiatorEnabled = false;
    private _arpeggiatorRate: ArpeggiatorRate = '16n';
    private _arpeggiatorDirection: ArpeggiatorDirection = 'up';
    private _arpeggiatorGate = 0.8;

    private _targetLoopCount: number | null = null;
    private _currentLoop = 0;
    private _onEndedCallback: (() => void) | null = null;

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

    public static synthPresets: Record<SynthPreset, any> = {
        'Sawtooth': { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 } },
        'Warm Pad': { oscillator: { type: 'square' }, envelope: { attack: 0.4, decay: 0.2, sustain: 0.7, release: 1.2 } },
        'Electric Piano': { oscillator: { type: 'fmsine', modulationIndex: 2, harmonicity: 3, modulationType: 'square' }, envelope: { attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.3 } },
        'Sine Lead': { oscillator: { type: 'sine' }, envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.4 } },
        'FM Pluck': { oscillator: { type: 'fmsine', modulationType: 'triangle', harmonicity: 1.2, modulationIndex: 2.5 }, envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 1.0 } },
        'Square Lead': { oscillator: { type: 'pulse', width: 0.2 }, envelope: { attack: 0.02, decay: 0.4, sustain: 0.4, release: 0.6 } },
        'Wobble Bass': { oscillator: { type: 'fatsawtooth', count: 2, spread: 40 }, filter: { Q: 6, type: "lowpass", rolloff: -24 }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 1 }, filterEnvelope: { attack: 0.06, decay: 0.2, sustain: 0.5, release: 2, baseFrequency: 200, octaves: 4, exponent: 2 } },
        'Classic Organ': { oscillator: { type: 'fatsine', count: 3 }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.2 } },
        'String Ensemble': { oscillator: { type: 'fatsawtooth', count: 3, spread: 40 }, envelope: { attack: 0.6, decay: 0.1, sustain: 0.9, release: 1.5 } },
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
        degrees.set(1, 0);

        if (quality.includes('dim')) {
            degrees.set(3, 3);
        } else if (quality.includes('m') && !quality.includes('maj')) {
            degrees.set(3, 3);
        } else {
            degrees.set(3, 4);
        }

        if (quality.includes('dim') || quality.includes('b5')) {
            degrees.set(5, 6);
        } else if (quality.includes('aug') || quality.includes('+') || quality.includes('#5')) {
            degrees.set(5, 8);
        } else {
            degrees.set(5, 7);
        }

        if (quality.includes('sus4')) {
            degrees.delete(3);
            degrees.set(4, 5);
        } else if (quality.includes('sus2')) {
            degrees.delete(3);
            degrees.set(2, 2);
        }

        if (quality.includes('maj7') || quality.includes('M7')) {
            degrees.set(7, 11);
        } else if (quality.includes('dim7')) {
            degrees.set(7, 9);
        } else if (quality.includes('7')) {
            degrees.set(7, 10);
        }

        const has9 = quality.includes('9');
        const has11 = quality.includes('11');
        const has13 = quality.includes('13');

        if (has13) {
            if (!degrees.has(7)) degrees.set(7, 10);
            if (!degrees.has(9)) degrees.set(9, 14);
            degrees.set(13, 21);
        }
        if (has11) {
            if (!degrees.has(7)) degrees.set(7, 10);
            if (!degrees.has(9)) degrees.set(9, 14);
            degrees.set(11, 17);
        }
        if (has9) {
            if (!degrees.has(7)) degrees.set(7, 10);
            degrees.set(9, 14);
        }

        if (quality.includes('6') && !has13) {
            degrees.set(6, 9);
        }

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

        if (spread && notes.length > 2) {
            const newNotes = [...notes];
            if (notes.length > 3) {
                const thirdInterval = degrees.get(3);
                const seventhInterval = degrees.get(7);
                const thirdIndex = thirdInterval !== undefined ? finalIntervals.indexOf(thirdInterval) : -1;
                const seventhIndex = seventhInterval !== undefined ? finalIntervals.indexOf(seventhInterval) : -1;
                if (thirdIndex > 0) newNotes[thirdIndex] = Tone.Frequency(newNotes[thirdIndex]).transpose(12).toNote();
                if (seventhIndex > 0) newNotes[seventhIndex] = Tone.Frequency(newNotes[seventhIndex]).transpose(12).toNote();
            } else {
                newNotes[1] = Tone.Frequency(newNotes[1]).transpose(12).toNote();
            }
            notes = newNotes.sort((a, b) => Tone.Frequency(a).toMidi() - Tone.Frequency(b).toMidi());
        }
        return notes;
    }

    // Safe dispose helper to prevent errors if node is already gone
    private safeDispose(node: any) {
        if (!node) return;
        try {
            // Disconnect from audio graph first to stop processing
            if (typeof node.disconnect === 'function') {
                node.disconnect();
            }
            // Then dispose
            if (typeof node.dispose === 'function') {
                node.dispose();
            }
        } catch (e) {
            // Fail silently during cleanup
            console.warn('Error during disposal:', e);
        }
    }

    async init() {
        if (this.isInitialized) return;

        Tone.context.lookAhead = 0.1;

        await Tone.start();

        // Limiter with -1dB to give some headroom
        this.limiter = new Tone.Limiter(-1).toDestination();

        // Lighter Reverb settings for better performance
        this.reverb = new Tone.JCReverb({ roomSize: 0.2, wet: 0.1 }).connect(this.limiter);
        this.stereoDelay = new Tone.PingPongDelay({ delayTime: '8n.', feedback: 0.2, wet: 0.1 }).connect(this.reverb);
        this.synthFilter = new Tone.Filter({
            frequency: 8000,
            type: 'lowpass',
            Q: 1
        }).connect(this.stereoDelay);

        this.kickPanner = new Tone.Panner(0).connect(this.limiter);
        this.snarePanner = new Tone.Panner(0).connect(this.limiter);
        this.hihatPanner = new Tone.Panner(0).connect(this.limiter);
        this.bassPanner = new Tone.Panner(0).connect(this.limiter);
        this.synthPanner = new Tone.Panner(0).connect(this.synthFilter);
        this.harmonyPanner = new Tone.Panner(0).connect(this.synthFilter);

        this.kickVolume = new Tone.Volume(-10).connect(this.kickPanner);
        this.snareVolume = new Tone.Volume(-10).connect(this.snarePanner);
        this.hihatVolume = new Tone.Volume(-15).connect(this.hihatPanner);
        this.bassVolume = new Tone.Volume(-10).connect(this.bassPanner);
        this.synthVolume = new Tone.Volume(-15).connect(this.synthPanner);
        this.harmonyVolume = new Tone.Volume(-20).connect(this.harmonyPanner);
        this.harmonyVolume.mute = this._harmonyInterval === null;

        const samplers = {
            kick: new Tone.Sampler({ urls: { C1: 'kick.wav' }, baseUrl: '/assets/sounds/' }),
            snare: new Tone.Sampler({ urls: { C1: 'snare.wav' }, baseUrl: '/assets/sounds/' }),
            hihat: new Tone.Sampler({ urls: { C1: 'hihat.wav' }, baseUrl: '/assets/sounds/' })
        };

        try {
            // Robust loading: Race between Tone.loaded and a timeout.
            // If samples are cached, this is instant. If network hangs, we proceed after 2s
            // to avoid locking the "Resetting..." screen forever.
            await Promise.race([
                Tone.loaded(),
                new Promise(resolve => setTimeout(resolve, 2000))
            ]);

            // Check loaded status loosely to allow proceeding even if one failed
            if (samplers.kick.loaded || samplers.snare.loaded) {
                this.drums = samplers;
                this.useSampledDrums = true;
            } else {
                // If totally failed, throw to trigger fallback
                throw new Error("Drum samples not ready");
            }
        } catch (e) {
            console.warn("Could not load drum samples fully, falling back to synthesized drums.", e);
            this.useSampledDrums = false;
            this.safeDispose(samplers.kick);
            this.safeDispose(samplers.snare);
            this.safeDispose(samplers.hihat);
        }

        if (!this.useSampledDrums) {
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

        this.chordSynth = new Tone.PolySynth({ voice: Tone.MonoSynth, maxPolyphony: 3 }).set(AudioServiceClass.synthPresets['Sawtooth']).connect(this.synthVolume);
        this.harmonySynth = new Tone.PolySynth({ voice: Tone.MonoSynth, maxPolyphony: 3 }).set(AudioServiceClass.synthPresets['Sawtooth']).connect(this.harmonyVolume);
        this.bassSynth = new Tone.MonoSynth({ oscillator: { type: 'fmsine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 } }).connect(this.bassVolume);

        Tone.Transport.bpm.value = this._bpm;
        this.isInitialized = true;
    }

    /**
     * Emergency Reset: Stops everything, destroys all audio nodes, and re-initializes.
     * Implements aggressive cleanup to fix stuck buffers or cpu overload.
     */
    async reset() {
        this._isResetting = true;
        // 1. Stop playback immediately and clear scheduler
        Tone.Transport.stop();
        Tone.Transport.cancel(0);

        // Pause context to stop processing while we rip out cables
        if (Tone.context.state === 'running') {
            try {
                await (Tone.context as any).suspend();
            } catch (e) { /* ignore */ }
        }

        // 2. Clean up sequences first (disconnect logic from audio)
        this.safeDispose(this.drumSequence);
        this.safeDispose(this.chordSequence);
        this.safeDispose(this.harmonySequence);
        this.safeDispose(this.bassSequence);

        this.drumSequence = null;
        this.chordSequence = null;
        this.harmonySequence = null;
        this.bassSequence = null;

        // 3. Dispose instruments and drum samplers/synths
        this.safeDispose(this.chordSynth);
        this.safeDispose(this.harmonySynth);
        this.safeDispose(this.bassSynth);

        if (this.drums) {
            this.safeDispose(this.drums.kick);
            this.safeDispose(this.drums.snare);
            this.safeDispose(this.drums.hihat);
            this.drums = null;
        }

        // 4. Dispose effects chain (bottom up)
        this.safeDispose(this.kickPanner);
        this.safeDispose(this.snarePanner);
        this.safeDispose(this.hihatPanner);
        this.safeDispose(this.bassPanner);
        this.safeDispose(this.synthPanner);
        this.safeDispose(this.harmonyPanner);

        this.safeDispose(this.kickVolume);
        this.safeDispose(this.snareVolume);
        this.safeDispose(this.hihatVolume);
        this.safeDispose(this.bassVolume);
        this.safeDispose(this.synthVolume);
        this.safeDispose(this.harmonyVolume);

        this.safeDispose(this.synthFilter);
        this.safeDispose(this.stereoDelay);
        this.safeDispose(this.reverb);
        this.safeDispose(this.limiter);

        // Dispose context if possible to truly reset (though Tone.js reuses it usually)
        // But we can close it if we really want to be aggressive, but that might break things.
        // Instead, we rely on the garbage collector.

        // Clear references
        this.chordSynth = null;
        this.harmonySynth = null;
        this.bassSynth = null;
        this.kickVolume = null;
        this.snareVolume = null;
        this.hihatVolume = null;
        this.synthVolume = null;
        this.bassVolume = null;
        this.harmonyVolume = null;

        this.isInitialized = false;

        // 5. WAIT. Allow the JS Event Loop and Garbage Collector to catch up.
        // This is crucial for clearing the audio graph.
        await new Promise(resolve => setTimeout(resolve, 150));

        // 6. Re-initialize fresh
        await this.init();

        // 7. Ensure Audio Context is active (safeguard for mobile)
        if (Tone.context.state !== 'running') {
            await Tone.context.resume();
        }
        this._isResetting = false;
    }

    setLoopCount(count: number) {
        this._targetLoopCount = count;
    }

    /**
     * Plays a simple 4-beat count in using a synthesized click.
     * Returns a promise that resolves when counting is done.
     */
    async playCountIn(): Promise<void> {
        if (Tone.context.state !== 'running') {
            await Tone.context.resume();
        }

        return new Promise((resolve) => {
            // Create a temporary synth just for clicks
            const clickSynth = new Tone.MembraneSynth({
                pitchDecay: 0.008,
                octaves: 2,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
            }).toDestination();

            const now = Tone.now();
            const beatDuration = 60 / this._bpm;

            // Schedule 4 clicks
            for (let i = 0; i < 4; i++) {
                const time = now + (i * beatDuration);
                // High pitch on 1, low on 2,3,4
                const note = i === 0 ? 'G5' : 'C5';
                clickSynth.triggerAttackRelease(note, '32n', time, 1);
            }

            // Resolve promise after the 4th beat duration passes
            setTimeout(() => {
                clickSynth.dispose();
                resolve();
            }, (4 * beatDuration) * 1000);
        });
    }

    async start(
        progression: string[],
        patternData: (DrumStep | null)[],
        onNextChord: (index: number) => void,
        loopCount?: number, // New: Optional loop limit
        onEnded?: () => void // New: Callback when loops finish
    ) {
        if (this._isResetting) return; // Safety guard
        if (!this.isInitialized || !this.chordSynth || !this.drums) return;

        if (Tone.context.state !== 'running') {
            await Tone.context.resume();
        }

        this.stop();

        // Ensure Transport is at 0
        Tone.Transport.seconds = 0;

        const finalProgression = this.calculateVoicedProgression(progression);
        const totalBars = finalProgression.length;

        // Setup sequence playback logic
        // Setup sequence playback logic
        this._targetLoopCount = loopCount || null;
        this._onEndedCallback = onEnded || null;
        this._currentLoop = 0;

        this.chordSequence = new Tone.Sequence((time: any, chordInfo: { notes: string[], index: number }) => {
            // Normalize index for looping display
            const displayIndex = chordInfo.index % totalBars;

            // Check for loop completion at the start of a cycle (index 0)
            if (chordInfo.index === 0) {
                this._currentLoop++;
                if (this._targetLoopCount !== null && this._currentLoop > this._targetLoopCount) {
                    // Stop playback
                    this.stop();
                    // Trigger callback
                    if (this._onEndedCallback) {
                        // Use setTimeout to break out of audio thread
                        setTimeout(this._onEndedCallback, 0);
                    }
                    return;
                }
            }

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
            Tone.Draw.schedule(() => onNextChord(displayIndex), time);
        }, finalProgression.map((notes, index) => ({ notes, index })), '1m');

        this.chordSequence.loop = true;
        this.chordSequence.start(0);

        this.bassSequence = new Tone.Sequence((time: any, chord: string) => {
            if (!this.bassSynth) return;
            const rootMatch = chord.match(/^[A-G][#b]?/);
            if (rootMatch) {
                const root = rootMatch[0];
                this.bassSynth.triggerAttackRelease(`${root}2`, '1m', time);
            }
        }, progression, '1m');
        this.bassSequence.loop = true;
        this.bassSequence.start(0);


        this.harmonySequence = new Tone.Sequence((time: any, chord: string) => {
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
            switch (this._harmonyInterval) {
                case '2nd': semitones = 2; break;
                case '3rd': semitones = (isMinor || isDiminished) ? 3 : 4; break;
                case '5th': semitones = isDiminished ? 6 : 7; break;
                case '6th': semitones = (isMinor || isDiminished) ? 8 : 9; break;
                case '7th': semitones = (isMinor || isDominant || isDiminished) ? 10 : 11; break;
                default: return;
            }

            const harmonyNote = Tone.Frequency(root + (4 + this._synthOctave)).transpose(semitones).toNote();
            this.harmonySynth.triggerAttackRelease(harmonyNote, '1m', time);

        }, progression, '1m');
        this.harmonySequence.loop = true;
        this.harmonySequence.start(0);

        this.drumSequence = new Tone.Sequence((time: any, note: DrumStep | null) => {
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
        }, patternData, '8n');

        // Drum sequence length is usually shorter (1 bar), so we just let it loop infinitely 
        // until the Transport stops, which is handled by the scheduled stop above.
        this.drumSequence.start(0);

        Tone.Transport.start();
    }

    pause() {
        if (Tone.Transport.state === 'started') {
            Tone.Transport.pause();
            this.chordSynth?.releaseAll();
            this.harmonySynth?.releaseAll();
            this.bassSynth?.triggerRelease();
        }
    }

    resume() {
        if (Tone.Transport.state === 'paused') {
            Tone.Transport.start();
        }
    }

    stop() {
        Tone.Transport.stop();
        Tone.Transport.cancel(0); // Important: Clears the scheduled stop event if manually stopped

        this.chordSynth?.releaseAll();
        this.harmonySynth?.releaseAll();
        this.bassSynth?.triggerRelease();

        // Dispose sequences to free up memory if they are not going to be reused immediately
        // However, keep them if we just want to pause. But "stop" usually implies we might change things.
        // For now, we just stop them.

        this.safeDispose(this.drumSequence);
        this.safeDispose(this.chordSequence);
        this.safeDispose(this.harmonySequence);
        this.safeDispose(this.bassSequence);

        this.drumSequence = null;
        this.chordSequence = null;
        this.harmonySequence = null;
        this.bassSequence = null;
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
    setBassPan(pan: number) { this.bassPanner?.pan.set({ value: pan }); }

    applySynthConfig(config: SynthConfig) {
        if (!this.chordSynth || !this.harmonySynth || !this.synthFilter) return;

        const { oscillator, envelope, filter } = config;

        this.chordSynth.set({ oscillator, envelope });
        this.harmonySynth.set({ oscillator, envelope });

        this.synthFilter.frequency.value = filter.cutoff;
        this.synthFilter.Q.value = filter.resonance;
    }

    setUseInversions(enabled: boolean) { this._useInversions = enabled; }
    setSynthOctave(octave: number) { this._synthOctave = octave; }
    setVoicingVariation(enabled: boolean) { this._voicingVariation = enabled; }
    setSpreadVoicing(enabled: boolean) { this._spreadVoicing = enabled; }

    setHarmonyInterval(interval: HarmonyInterval | null) {
        this._harmonyInterval = interval;
        if (this.harmonyVolume) {
            this.harmonyVolume.mute = interval === null;
        }
    }

    setHarmonyVolume(vol: number) { this.harmonyVolume?.volume.set({ value: vol }); }
    setHarmonyPan(pan: number) { this.harmonyPanner?.pan.set({ value: pan }); }
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
