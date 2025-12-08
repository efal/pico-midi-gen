// index.tsx
import React9 from "react";
import ReactDOM from "react-dom/client";

// App.tsx
import { useState as useState5, useEffect as useEffect4, useRef as useRef5, useCallback } from "react";

// services/audioService.ts
import * as Tone from "tone";
var NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
var NOTE_TO_INDEX = {
  "C": 0,
  "C#": 1,
  "Db": 1,
  "D": 2,
  "D#": 3,
  "Eb": 3,
  "E": 4,
  "F": 5,
  "F#": 6,
  "Gb": 6,
  "G": 7,
  "G#": 8,
  "Ab": 8,
  "A": 9,
  "Bb": 10,
  "B": 11
};
var AudioServiceClass = class _AudioServiceClass {
  isInitialized = false;
  _isResetting = false;
  // Guard against race conditions
  drums = null;
  useSampledDrums = false;
  chordSynth = null;
  harmonySynth = null;
  bassSynth = null;
  limiter = null;
  kickVolume = null;
  snareVolume = null;
  hihatVolume = null;
  synthVolume = null;
  bassVolume = null;
  harmonyVolume = null;
  kickPanner = null;
  snarePanner = null;
  hihatPanner = null;
  synthPanner = null;
  bassPanner = null;
  harmonyPanner = null;
  synthFilter = null;
  stereoDelay = null;
  reverb = null;
  drumSequence = null;
  chordSequence = null;
  harmonySequence = null;
  bassSequence = null;
  _bpm = 80;
  _useInversions = true;
  _synthOctave = 0;
  _voicingVariation = true;
  _spreadVoicing = true;
  _harmonyInterval = null;
  _arpeggiatorEnabled = false;
  _arpeggiatorRate = "16n";
  _arpeggiatorDirection = "up";
  _arpeggiatorGate = 0.8;
  static drumPatterns = {
    "Pop Rock": [
      { kick: true, hihat: true },
      { hihat: true },
      { snare: true, hihat: true },
      { hihat: true },
      { kick: true, hihat: true },
      { hihat: true },
      { snare: true, hihat: true },
      { hihat: true }
    ],
    "Four On The Floor": [
      { kick: true, hihat: true },
      { kick: true, hihat: true },
      { kick: true, snare: true, hihat: true },
      { kick: true, hihat: true },
      { kick: true, hihat: true },
      { kick: true, hihat: true },
      { kick: true, snare: true, hihat: true },
      { kick: true, hihat: true }
    ],
    "Funk": [
      { kick: true, hihat: true },
      { hihat: true },
      { snare: true, hihat: true },
      { kick: true, hihat: true },
      { hihat: true },
      { kick: true, hihat: true },
      { snare: true, hihat: true },
      { hihat: true }
    ],
    "Reggae": [
      null,
      { hihat: true },
      { kick: true, snare: true, hihat: true },
      { hihat: true },
      null,
      { hihat: true },
      { kick: true, snare: true, hihat: true },
      { hihat: true }
    ],
    "Techno": [
      { kick: true },
      { hihat: true },
      { kick: true, hihat: true },
      { hihat: true },
      { kick: true },
      { hihat: true },
      { kick: true, hihat: true },
      { hihat: true }
    ],
    "Hip-Hop": [
      { kick: true, hihat: true },
      { hihat: true },
      { hihat: true },
      { snare: true, hihat: true },
      { hihat: true },
      { kick: true, hihat: true },
      { hihat: true },
      { snare: true, hihat: true }
    ],
    "Latin": [
      { kick: true, hihat: true },
      { hihat: true },
      { snare: true, hihat: true },
      { kick: true, hihat: true, snare: true },
      { kick: true, hihat: true },
      { hihat: true },
      { snare: true, hihat: true },
      { snare: true, hihat: true }
    ]
  };
  static synthPresets = {
    "Sawtooth": { oscillator: { type: "sawtooth" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 } },
    "Warm Pad": { oscillator: { type: "square" }, envelope: { attack: 0.4, decay: 0.2, sustain: 0.7, release: 1.2 } },
    "Electric Piano": { oscillator: { type: "fmsine", modulationIndex: 2, harmonicity: 3, modulationType: "square" }, envelope: { attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.3 } },
    "Sine Lead": { oscillator: { type: "sine" }, envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.4 } },
    "FM Pluck": { oscillator: { type: "fmsine", modulationType: "triangle", harmonicity: 1.2, modulationIndex: 2.5 }, envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 1 } },
    "Square Lead": { oscillator: { type: "pulse", width: 0.2 }, envelope: { attack: 0.02, decay: 0.4, sustain: 0.4, release: 0.6 } },
    "Wobble Bass": { oscillator: { type: "fatsawtooth", count: 2, spread: 40 }, filter: { Q: 6, type: "lowpass", rolloff: -24 }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 1 }, filterEnvelope: { attack: 0.06, decay: 0.2, sustain: 0.5, release: 2, baseFrequency: 200, octaves: 4, exponent: 2 } },
    "Classic Organ": { oscillator: { type: "fatsine", count: 3 }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.2 } },
    "String Ensemble": { oscillator: { type: "fatsawtooth", count: 3, spread: 40 }, envelope: { attack: 0.6, decay: 0.1, sustain: 0.9, release: 1.5 } },
    "Brass Section": { oscillator: { type: "fatsawtooth", count: 3, spread: 15 }, filter: { Q: 2, type: "lowpass", rolloff: -24 }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.6 }, filterEnvelope: { attack: 0.08, decay: 0.4, sustain: 0.6, release: 1, baseFrequency: 400, octaves: 3 } },
    "Clean Guitar": { oscillator: { type: "fmsine", modulationIndex: 1.2, harmonicity: 2, modulationType: "sine" }, envelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 1.4 } }
  };
  static getChordNotes(chordName, octave = 0, spread = false) {
    if (!chordName || chordName.toLowerCase() === "n.c.") {
      return [];
    }
    const rootMatch = chordName.match(/^[A-G][#b]?/);
    if (!rootMatch) return [];
    const root2 = rootMatch[0];
    const quality = chordName.substring(root2.length);
    const rootIndex = NOTE_TO_INDEX[root2];
    if (rootIndex === void 0) return [];
    const degrees = /* @__PURE__ */ new Map();
    degrees.set(1, 0);
    if (quality.includes("dim")) {
      degrees.set(3, 3);
    } else if (quality.includes("m") && !quality.includes("maj")) {
      degrees.set(3, 3);
    } else {
      degrees.set(3, 4);
    }
    if (quality.includes("dim") || quality.includes("b5")) {
      degrees.set(5, 6);
    } else if (quality.includes("aug") || quality.includes("+") || quality.includes("#5")) {
      degrees.set(5, 8);
    } else {
      degrees.set(5, 7);
    }
    if (quality.includes("sus4")) {
      degrees.delete(3);
      degrees.set(4, 5);
    } else if (quality.includes("sus2")) {
      degrees.delete(3);
      degrees.set(2, 2);
    }
    if (quality.includes("maj7") || quality.includes("M7")) {
      degrees.set(7, 11);
    } else if (quality.includes("dim7")) {
      degrees.set(7, 9);
    } else if (quality.includes("7")) {
      degrees.set(7, 10);
    }
    const has9 = quality.includes("9");
    const has11 = quality.includes("11");
    const has13 = quality.includes("13");
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
    if (quality.includes("6") && !has13) {
      degrees.set(6, 9);
    }
    const alterations = quality.match(/([#b]\d+)/g) || [];
    for (const alt of alterations) {
      switch (alt) {
        case "b5":
          degrees.set(5, 6);
          break;
        case "#5":
          degrees.set(5, 8);
          break;
        case "b9":
          degrees.set(9, 13);
          break;
        case "#9":
          degrees.set(9, 15);
          break;
        case "#11":
          degrees.set(11, 18);
          break;
        case "b13":
          degrees.set(13, 20);
          break;
      }
    }
    const finalIntervals = Array.from(degrees.values());
    const baseOctave = 4 + octave;
    let notes = finalIntervals.sort((a, b) => a - b).map((interval) => {
      const noteIndex = rootIndex + interval;
      const noteOctave = baseOctave + Math.floor(noteIndex / 12);
      return `${NOTES_SHARP[noteIndex % 12]}${noteOctave}`;
    });
    if (spread && notes.length > 2) {
      const newNotes = [...notes];
      if (notes.length > 3) {
        const thirdInterval = degrees.get(3);
        const seventhInterval = degrees.get(7);
        const thirdIndex = thirdInterval !== void 0 ? finalIntervals.indexOf(thirdInterval) : -1;
        const seventhIndex = seventhInterval !== void 0 ? finalIntervals.indexOf(seventhInterval) : -1;
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
  safeDispose(node) {
    if (!node) return;
    try {
      if (typeof node.disconnect === "function") {
        node.disconnect();
      }
      if (typeof node.dispose === "function") {
        node.dispose();
      }
    } catch (e) {
      console.warn("Error during disposal:", e);
    }
  }
  async init() {
    if (this.isInitialized) return;
    Tone.context.lookAhead = 0.1;
    await Tone.start();
    this.limiter = new Tone.Limiter(-1).toDestination();
    this.reverb = new Tone.JCReverb({ roomSize: 0.2, wet: 0.1 }).connect(this.limiter);
    this.stereoDelay = new Tone.PingPongDelay({ delayTime: "8n.", feedback: 0.2, wet: 0.1 }).connect(this.reverb);
    this.synthFilter = new Tone.Filter({
      frequency: 8e3,
      type: "lowpass",
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
      kick: new Tone.Sampler({ urls: { C1: "kick.wav" }, baseUrl: "/assets/sounds/" }),
      snare: new Tone.Sampler({ urls: { C1: "snare.wav" }, baseUrl: "/assets/sounds/" }),
      hihat: new Tone.Sampler({ urls: { C1: "hihat.wav" }, baseUrl: "/assets/sounds/" })
    };
    try {
      await Promise.race([
        Tone.loaded(),
        new Promise((resolve) => setTimeout(resolve, 2e3))
      ]);
      if (samplers.kick.loaded || samplers.snare.loaded) {
        this.drums = samplers;
        this.useSampledDrums = true;
      } else {
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
      const snareFilter = new Tone.Filter(4e3, "highpass").connect(this.snareVolume);
      this.drums = {
        kick: new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 8,
          oscillator: { type: "sine" },
          envelope: { attack: 1e-3, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: "exponential" }
        }),
        snare: new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 5e-3, decay: 0.2, sustain: 0.05, release: 0.1 }
        }).connect(snareFilter),
        hihat: new Tone.NoiseSynth({
          noise: { type: "pink" },
          envelope: { attack: 1e-3, decay: 0.03, sustain: 0, release: 0.05 }
        })
      };
    }
    this.drums.kick.connect(this.kickVolume);
    this.drums.snare.connect(this.snareVolume);
    this.drums.hihat.connect(this.hihatVolume);
    this.chordSynth = new Tone.PolySynth({ voice: Tone.MonoSynth, maxPolyphony: 3 }).set(_AudioServiceClass.synthPresets["Sawtooth"]).connect(this.synthVolume);
    this.harmonySynth = new Tone.PolySynth({ voice: Tone.MonoSynth, maxPolyphony: 3 }).set(_AudioServiceClass.synthPresets["Sawtooth"]).connect(this.harmonyVolume);
    this.bassSynth = new Tone.MonoSynth({ oscillator: { type: "fmsine" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 } }).connect(this.bassVolume);
    Tone.Transport.bpm.value = this._bpm;
    this.isInitialized = true;
  }
  /**
   * Emergency Reset: Stops everything, destroys all audio nodes, and re-initializes.
   * Implements aggressive cleanup to fix stuck buffers or cpu overload.
   */
  async reset() {
    this._isResetting = true;
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    if (Tone.context.state === "running") {
      try {
        await Tone.context.suspend();
      } catch (e) {
      }
    }
    this.safeDispose(this.drumSequence);
    this.safeDispose(this.chordSequence);
    this.safeDispose(this.harmonySequence);
    this.safeDispose(this.bassSequence);
    this.drumSequence = null;
    this.chordSequence = null;
    this.harmonySequence = null;
    this.bassSequence = null;
    this.safeDispose(this.chordSynth);
    this.safeDispose(this.harmonySynth);
    this.safeDispose(this.bassSynth);
    if (this.drums) {
      this.safeDispose(this.drums.kick);
      this.safeDispose(this.drums.snare);
      this.safeDispose(this.drums.hihat);
      this.drums = null;
    }
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
    await new Promise((resolve) => setTimeout(resolve, 150));
    await this.init();
    if (Tone.context.state !== "running") {
      await Tone.context.resume();
    }
    this._isResetting = false;
  }
  /**
   * Plays a simple 4-beat count in using a synthesized click.
   * Returns a promise that resolves when counting is done.
   */
  async playCountIn() {
    if (Tone.context.state !== "running") {
      await Tone.context.resume();
    }
    return new Promise((resolve) => {
      const clickSynth = new Tone.MembraneSynth({
        pitchDecay: 8e-3,
        octaves: 2,
        oscillator: { type: "sine" },
        envelope: { attack: 1e-3, decay: 0.1, sustain: 0, release: 0.1 }
      }).toDestination();
      const now2 = Tone.now();
      const beatDuration = 60 / this._bpm;
      for (let i = 0; i < 4; i++) {
        const time = now2 + i * beatDuration;
        const note = i === 0 ? "G5" : "C5";
        clickSynth.triggerAttackRelease(note, "32n", time, 1);
      }
      setTimeout(() => {
        clickSynth.dispose();
        resolve();
      }, 4 * beatDuration * 1e3);
    });
  }
  async start(progression, patternData, onNextChord, loopCount, onEnded) {
    if (this._isResetting) return;
    if (!this.isInitialized || !this.chordSynth || !this.drums) return;
    if (Tone.context.state !== "running") {
      await Tone.context.resume();
    }
    this.stop();
    Tone.Transport.seconds = 0;
    const finalProgression = this.calculateVoicedProgression(progression);
    const totalBars = finalProgression.length;
    const seqLoop = loopCount ? false : true;
    if (loopCount && onEnded) {
      const barsToPlay = totalBars * loopCount;
      const totalTime = Tone.Time("1m").toSeconds() * barsToPlay;
      Tone.Transport.scheduleOnce(() => {
        this.stop();
        setTimeout(onEnded, 0);
      }, `+${barsToPlay}m`);
    }
    this.chordSequence = new Tone.Sequence((time, chordInfo) => {
      const displayIndex = chordInfo.index % totalBars;
      if (chordInfo.notes.length > 0) {
        if (this._arpeggiatorEnabled) {
          const arpRateSeconds = Tone.Time(this._arpeggiatorRate).toSeconds();
          const noteDuration = arpRateSeconds * this._arpeggiatorGate;
          const barDurationSeconds = Tone.Time("1m").toSeconds();
          const numStepsPerBar = Math.floor(barDurationSeconds / arpRateSeconds);
          const arpeggiatedNotes = this.generateArpeggioSequence(chordInfo.notes, this._arpeggiatorDirection, numStepsPerBar);
          arpeggiatedNotes.forEach((note, stepIndex) => {
            const noteTime = time + stepIndex * arpRateSeconds;
            this.chordSynth?.triggerAttackRelease(note, noteDuration, noteTime);
          });
        } else {
          this.chordSynth?.triggerAttackRelease(chordInfo.notes, "1m", time);
        }
      }
      Tone.Draw.schedule(() => onNextChord(displayIndex), time);
    }, finalProgression.map((notes, index) => ({ notes, index })), "1m");
    this.chordSequence.loop = seqLoop;
    if (loopCount) {
      const loopedEvents = [];
      for (let l = 0; l < loopCount; l++) {
        finalProgression.forEach((notes, index) => {
          loopedEvents.push({ notes, index });
        });
      }
      this.chordSequence.events = loopedEvents;
    }
    this.chordSequence.start(0);
    this.bassSequence = new Tone.Sequence((time, chord) => {
      if (!this.bassSynth) return;
      const rootMatch = chord.match(/^[A-G][#b]?/);
      if (rootMatch) {
        const root2 = rootMatch[0];
        this.bassSynth.triggerAttackRelease(`${root2}2`, "1m", time);
      }
    }, progression, "1m");
    this.bassSequence.loop = seqLoop;
    if (loopCount) {
      let loopedProgression = [];
      for (let i = 0; i < loopCount; i++) loopedProgression = [...loopedProgression, ...progression];
      this.bassSequence.events = loopedProgression;
    }
    this.bassSequence.start(0);
    this.harmonySequence = new Tone.Sequence((time, chord) => {
      if (!this.harmonySynth || !this._harmonyInterval) return;
      if (this._harmonyInterval === "3rd" && chord.includes("sus")) {
        return;
      }
      const rootMatch = chord.match(/^[A-G][#b]?/);
      if (!rootMatch) return;
      const root2 = rootMatch[0];
      const hasMaj7 = chord.includes("maj");
      const isMinor = chord.includes("m") && !hasMaj7;
      const isDominant = chord.includes("7") && !hasMaj7;
      const isDiminished = chord.includes("dim");
      let semitones;
      switch (this._harmonyInterval) {
        case "2nd":
          semitones = 2;
          break;
        case "3rd":
          semitones = isMinor || isDiminished ? 3 : 4;
          break;
        case "5th":
          semitones = isDiminished ? 6 : 7;
          break;
        case "6th":
          semitones = isMinor || isDiminished ? 8 : 9;
          break;
        case "7th":
          semitones = isMinor || isDominant || isDiminished ? 10 : 11;
          break;
        default:
          return;
      }
      const harmonyNote = Tone.Frequency(root2 + (4 + this._synthOctave)).transpose(semitones).toNote();
      this.harmonySynth.triggerAttackRelease(harmonyNote, "1m", time);
    }, progression, "1m");
    this.harmonySequence.loop = seqLoop;
    if (loopCount) {
      let loopedProgression = [];
      for (let i = 0; i < loopCount; i++) loopedProgression = [...loopedProgression, ...progression];
      this.harmonySequence.events = loopedProgression;
    }
    this.harmonySequence.start(0);
    this.drumSequence = new Tone.Sequence((time, note) => {
      if (!this.drums || !note) return;
      if (this.useSampledDrums) {
        if (note.kick) this.drums.kick.triggerAttackRelease("C1", "8n", time);
        if (note.snare) this.drums.snare.triggerAttackRelease("C1", "8n", time);
        if (note.hihat) this.drums.hihat.triggerAttackRelease("C1", "8n", time, 0.8);
      } else {
        if (note.kick) this.drums.kick.triggerAttackRelease("C1", "8n", time, 1);
        if (note.snare) this.drums.snare.triggerAttackRelease("16n", time, 0.9);
        if (note.hihat) this.drums.hihat.triggerAttackRelease("16n", time, 0.6);
      }
    }, patternData, "8n");
    this.drumSequence.start(0);
    Tone.Transport.start();
  }
  stop() {
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    this.chordSynth?.releaseAll();
    this.harmonySynth?.releaseAll();
    this.bassSynth?.triggerRelease();
    this.safeDispose(this.drumSequence);
    this.safeDispose(this.chordSequence);
    this.safeDispose(this.harmonySequence);
    this.safeDispose(this.bassSequence);
    this.drumSequence = null;
    this.chordSequence = null;
    this.harmonySequence = null;
    this.bassSequence = null;
  }
  setBpm(bpm) {
    this._bpm = bpm;
    if (this.isInitialized) {
      Tone.Transport.bpm.value = bpm;
    }
  }
  setKickVolume(vol) {
    this.kickVolume?.volume.set({ value: vol });
  }
  setSnareVolume(vol) {
    this.snareVolume?.volume.set({ value: vol });
  }
  setHihatVolume(vol) {
    this.hihatVolume?.volume.set({ value: vol });
  }
  setSynthVolume(vol) {
    this.synthVolume?.volume.set({ value: vol });
  }
  setBassVolume(vol) {
    this.bassVolume?.volume.set({ value: vol });
  }
  setKickPan(pan) {
    this.kickPanner?.pan.set({ value: pan });
  }
  setSnarePan(pan) {
    this.snarePanner?.pan.set({ value: pan });
  }
  setHihatPan(pan) {
    this.hihatPanner?.pan.set({ value: pan });
  }
  setSynthPan(pan) {
    this.synthPanner?.pan.set({ value: pan });
  }
  setBassPan(pan) {
    this.bassPanner?.pan.set({ value: pan });
  }
  applySynthConfig(config) {
    if (!this.chordSynth || !this.harmonySynth || !this.synthFilter) return;
    const { oscillator, envelope, filter } = config;
    this.chordSynth.set({ oscillator, envelope });
    this.harmonySynth.set({ oscillator, envelope });
    this.synthFilter.frequency.value = filter.cutoff;
    this.synthFilter.Q.value = filter.resonance;
  }
  setUseInversions(enabled) {
    this._useInversions = enabled;
  }
  setSynthOctave(octave) {
    this._synthOctave = octave;
  }
  setVoicingVariation(enabled) {
    this._voicingVariation = enabled;
  }
  setSpreadVoicing(enabled) {
    this._spreadVoicing = enabled;
  }
  setHarmonyInterval(interval) {
    this._harmonyInterval = interval;
    if (this.harmonyVolume) {
      this.harmonyVolume.mute = interval === null;
    }
  }
  setHarmonyVolume(vol) {
    this.harmonyVolume?.volume.set({ value: vol });
  }
  setHarmonyPan(pan) {
    this.harmonyPanner?.pan.set({ value: pan });
  }
  setArpeggiatorEnabled(enabled) {
    this._arpeggiatorEnabled = enabled;
  }
  setArpeggiatorRate(rate) {
    this._arpeggiatorRate = rate;
  }
  setArpeggiatorDirection(direction) {
    this._arpeggiatorDirection = direction;
  }
  setArpeggiatorGate(gate) {
    this._arpeggiatorGate = gate;
  }
  calculateVoicedProgression(progression) {
    const getNotesForChord = (chord) => _AudioServiceClass.getChordNotes(chord, this._synthOctave, this._spreadVoicing);
    if (!this._useInversions) {
      return progression.map(getNotesForChord);
    }
    const finalProgression = [];
    let lastChordNotes = null;
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
      const candidates = [];
      [-1, 0, 1].forEach((octaveOffset) => {
        const shiftedNotes = currentNotes.map((n) => Tone.Frequency(n).transpose(octaveOffset * 12).toNote());
        const inversions = [shiftedNotes];
        for (let i = 0; i < shiftedNotes.length - 1; i++) {
          const lastVoicing = inversions[inversions.length - 1];
          const nextVoicing = [...lastVoicing.slice(1), Tone.Frequency(lastVoicing[0]).transpose(12).toNote()];
          inversions.push(nextVoicing);
        }
        inversions.forEach((voicing) => {
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
      let bestVoicing;
      if (this._voicingVariation && candidates.length > 1) {
        const topCandidates = candidates.slice(0, 2).map((c) => c.voicing);
        bestVoicing = topCandidates[Math.floor(Math.random() * topCandidates.length)];
      } else {
        bestVoicing = candidates[0].voicing;
      }
      finalProgression.push(bestVoicing);
      lastChordNotes = bestVoicing;
    }
    return finalProgression;
  }
  generateArpeggioSequence(notes, direction, steps) {
    if (notes.length === 0) return [];
    let pattern = [];
    switch (direction) {
      case "up":
        pattern = [...notes];
        break;
      case "down":
        pattern = [...notes].reverse();
        break;
      case "upDown":
        pattern = [...notes, ...notes.slice(1, -1).reverse()];
        break;
      case "random":
        const indices = Array.from({ length: steps }, () => Math.floor(Math.random() * notes.length));
        return indices.map((i) => notes[i]);
    }
    if (pattern.length === 0) return [];
    const result = [];
    for (let i = 0; i < steps; i++) {
      result.push(pattern[i % pattern.length]);
    }
    return result;
  }
};
var audioService = new AudioServiceClass();

// services/jamService.ts
var AUTOSAVE_KEY = "jamBuddy_autosave_v1";
function isValidJamState(obj) {
  const isValid = obj && Array.isArray(obj.progression) && typeof obj.bpm === "number" && typeof obj.musicKey === "string" && typeof obj.scale === "string" && typeof obj.drumPattern === "string" && (typeof obj.drumVolume === "number" || typeof obj.kickVolume === "number" && typeof obj.snareVolume === "number" && typeof obj.hihatVolume === "number") && // Allow old or new format
  typeof obj.synthVolume === "number" && (typeof obj.bassVolume === "number" || obj.bassVolume === void 0) && (typeof obj.kickPan === "number" || obj.kickPan === void 0) && (typeof obj.snarePan === "number" || obj.snarePan === void 0) && (typeof obj.hihatPan === "number" || obj.hihatPan === void 0) && (typeof obj.synthPan === "number" || obj.synthPan === void 0) && (typeof obj.bassPan === "number" || obj.bassPan === void 0) && (typeof obj.selectedPresetIndex === "number" || obj.selectedPresetIndex === void 0) && (typeof obj.useInversions === "boolean" || obj.useInversions === void 0) && (typeof obj.synthOctave === "number" || obj.synthOctave === void 0) && (typeof obj.voicingVariation === "boolean" || obj.voicingVariation === void 0) && (typeof obj.spreadVoicing === "boolean" || obj.spreadVoicing === void 0) && (typeof obj.harmonyEnabled === "boolean" || typeof obj.harmonyInterval === "string" || obj.harmonyInterval === null || obj.harmonyInterval === void 0) && (typeof obj.harmonyVolume === "number" || obj.harmonyVolume === void 0) && (typeof obj.harmonyPan === "number" || obj.harmonyPan === void 0) && (typeof obj.arpeggiatorEnabled === "boolean" || obj.arpeggiatorEnabled === void 0) && (typeof obj.arpeggiatorRate === "string" || obj.arpeggiatorRate === void 0) && (typeof obj.arpeggiatorDirection === "string" || obj.arpeggiatorDirection === void 0) && (typeof obj.arpeggiatorGate === "number" || obj.arpeggiatorGate === void 0) && (Array.isArray(obj.customDrumPatterns) || obj.customDrumPatterns === void 0);
  return isValid;
}
function normalizeJamState(parsed) {
  const defaultPreset = AudioServiceClass.synthPresets["Sawtooth"];
  const finalState = {
    selectedPresetIndex: -1,
    useInversions: true,
    synthOctave: 0,
    voicingVariation: true,
    spreadVoicing: true,
    harmonyInterval: null,
    harmonyVolume: -18,
    harmonyPan: 0,
    arpeggiatorEnabled: false,
    arpeggiatorRate: "16n",
    arpeggiatorDirection: "up",
    arpeggiatorGate: 0.8,
    kickVolume: -6,
    snareVolume: -6,
    hihatVolume: -12,
    bassVolume: -6,
    kickPan: 0,
    snarePan: 0,
    hihatPan: 0,
    synthPan: 0,
    bassPan: 0,
    customDrumPatterns: [],
    customSynthPresets: [],
    synthPresetName: "Sawtooth",
    synthConfig: {
      oscillator: defaultPreset.oscillator,
      envelope: defaultPreset.envelope,
      filter: {
        cutoff: 8e3,
        resonance: 1
      }
    },
    ...parsed
  };
  if (typeof parsed.drumVolume === "number" && typeof parsed.kickVolume === "undefined") {
    finalState.kickVolume = parsed.drumVolume;
    finalState.snareVolume = parsed.drumVolume;
    finalState.hihatVolume = parsed.drumVolume;
  }
  if (typeof parsed.harmonyEnabled === "boolean" && parsed.harmonyEnabled) {
    finalState.harmonyInterval = "7th";
  }
  if (parsed.synthPreset && !parsed.synthConfig) {
    const presetName = parsed.synthPreset;
    const presetConfig = AudioServiceClass.synthPresets[presetName] || defaultPreset;
    finalState.synthPresetName = presetName;
    finalState.synthConfig = {
      oscillator: presetConfig.oscillator,
      envelope: presetConfig.envelope,
      filter: {
        cutoff: parsed.synthFilterCutoff ?? 8e3,
        resonance: parsed.synthFilterResonance ?? 1
      }
    };
  }
  delete finalState.drumVolume;
  delete finalState.harmonyEnabled;
  delete finalState.synthPreset;
  delete finalState.synthFilterCutoff;
  delete finalState.synthFilterResonance;
  return finalState;
}
function saveJam(state) {
  try {
    const jsonString = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jam-buddy-session-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Fehler beim Speichern der Jam-Session:", error);
    throw new Error("Die Jam-Session konnte nicht gespeichert werden. Siehe Konsole f\xFCr Details.");
  }
}
function loadJam(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("Es wurde keine Datei ausgew\xE4hlt."));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== "string") {
          return reject(new Error("Der Dateiinhalt konnte nicht gelesen werden."));
        }
        const parsed = JSON.parse(result);
        if (isValidJamState(parsed)) {
          resolve(normalizeJamState(parsed));
        } else {
          reject(new Error("Ung\xFCltiges oder besch\xE4digtes Jam-Datei-Format."));
        }
      } catch (error) {
        reject(new Error("Fehler beim Analysieren der JSON-Datei."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Fehler beim Lesen der Datei."));
    };
    reader.readAsText(file);
  });
}
function saveAutosave(state) {
  try {
    const jsonString = JSON.stringify(state);
    localStorage.setItem(AUTOSAVE_KEY, jsonString);
  } catch (error) {
    console.error("Auto-save failed:", error);
  }
}
function loadAutosave() {
  try {
    const jsonString = localStorage.getItem(AUTOSAVE_KEY);
    if (!jsonString) return null;
    const parsed = JSON.parse(jsonString);
    if (isValidJamState(parsed)) {
      return normalizeJamState(parsed);
    }
    return null;
  } catch (error) {
    console.error("Auto-load failed:", error);
    return null;
  }
}

// services/musicTheoryService.ts
var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
var MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
var MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
var MAJOR_DEGREES = ["I", "ii", "iii", "IV", "V", "vi", "vii"];
var MINOR_DEGREES = ["i", "ii", "III", "iv", "v", "VI", "VII"];
var ALL_QUALITIES = {
  // Major qualities
  "I": "",
  "ii": "m",
  "iii": "m",
  "IV": "",
  "V": "",
  "vi": "m",
  "vii": "dim",
  // Minor qualities (will overwrite major where there are clashes, which is fine)
  "i": "m",
  "III": "",
  "iv": "m",
  "v": "m",
  "VI": "",
  "VII": ""
};
var ROMAN_TO_DEGREE = {
  "i": 1,
  "ii": 2,
  "iii": 3,
  "iv": 4,
  "v": 5,
  "vi": 6,
  "vii": 7,
  "I": 1,
  "II": 2,
  "III": 3,
  "IV": 4,
  "V": 5,
  "VI": 6,
  "VII": 7
};
function transposeProgression(key, scale, romanProgression) {
  const keyIndex = NOTES.indexOf(key);
  const intervals = scale === "Major" ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
  return romanProgression.map((roman) => {
    const match = roman.match(/^(b?#?)(VII|VI|IV|III|II|V|I|vii|vi|iv|iii|ii|v|i)(.*)$/);
    if (!match) return "N.C.";
    const [, accidental, numeral, extension] = match;
    const degree = ROMAN_TO_DEGREE[numeral];
    if (!degree) return "N.C.";
    let rootNoteIndex = (keyIndex + intervals[degree - 1]) % 12;
    if (accidental === "b") {
      rootNoteIndex = (rootNoteIndex + 11) % 12;
    } else if (accidental === "#") {
      rootNoteIndex = (rootNoteIndex + 1) % 12;
    }
    const rootNote = NOTES[rootNoteIndex];
    const baseQuality = scale === "Minor" && numeral === "V" ? "" : ALL_QUALITIES[numeral] ?? "";
    if (extension.startsWith(baseQuality) && baseQuality !== "") {
      return `${rootNote}${extension}`;
    }
    return `${rootNote}${baseQuality}${extension}`;
  });
}
function getRelativeMinor(majorKey) {
  const keyIndex = NOTES.indexOf(majorKey);
  if (keyIndex === -1) return majorKey;
  const relativeMinorIndex = (keyIndex - 3 + 12) % 12;
  return NOTES[relativeMinorIndex];
}
function getRelativeMajor(minorKey) {
  const keyIndex = NOTES.indexOf(minorKey);
  if (keyIndex === -1) return minorKey;
  const relativeMajorIndex = (keyIndex + 3) % 12;
  return NOTES[relativeMajorIndex];
}
var romanNumeralCache = /* @__PURE__ */ new Map();
function getRomanNumeral(chordName, key, scale) {
  const cacheKey = `${chordName}-${key}-${scale}`;
  if (romanNumeralCache.has(cacheKey)) {
    return romanNumeralCache.get(cacheKey);
  }
  if (!chordName || chordName.toLowerCase() === "n.c.") {
    return "N.C.";
  }
  const romanNumerals = scale === "Major" ? MAJOR_DEGREES : MINOR_DEGREES;
  const diatonicChords = transposeProgression(key, scale, romanNumerals);
  const diatonicMap = {};
  for (let i = 0; i < diatonicChords.length; i++) {
    diatonicMap[diatonicChords[i]] = romanNumerals[i];
  }
  if (diatonicMap[chordName]) {
    romanNumeralCache.set(cacheKey, diatonicMap[chordName]);
    return diatonicMap[chordName];
  }
  const rootMatch = chordName.match(/^[A-G][#b]?/);
  if (rootMatch) {
    const root2 = rootMatch[0];
    const isMinor = chordName.includes("m") && !chordName.includes("maj");
    const isDim = chordName.includes("dim");
    const simpleMajor = root2;
    const simpleMinor = `${root2}m`;
    const simpleDim = `${root2}dim`;
    if (diatonicMap[simpleDim] && isDim) {
      const result = `${diatonicMap[simpleDim]}${chordName.substring(simpleDim.length)}`;
      romanNumeralCache.set(cacheKey, result);
      return result;
    }
    if (diatonicMap[simpleMinor] && isMinor) {
      const result = `${diatonicMap[simpleMinor]}${chordName.substring(simpleMinor.length)}`;
      romanNumeralCache.set(cacheKey, result);
      return result;
    }
    if (diatonicMap[simpleMajor] && !isMinor && !isDim) {
      const result = `${diatonicMap[simpleMajor]}${chordName.substring(simpleMajor.length)}`;
      romanNumeralCache.set(cacheKey, result);
      return result;
    }
  }
  if (scale === "Minor") {
    const majorVChord = transposeProgression(key, "Major", ["V"])[0];
    if (chordName.startsWith(majorVChord) && !majorVChord.endsWith("m")) {
      const result = `V${chordName.substring(majorVChord.length)}`;
      romanNumeralCache.set(cacheKey, result);
      return result;
    }
  }
  romanNumeralCache.set(cacheKey, chordName);
  return chordName;
}

// services/midiService.ts
import * as Tone2 from "tone";
var HEADER_CHUNK_TYPE = [77, 84, 104, 100];
var HEADER_CHUNK_LENGTH = [0, 0, 0, 6];
var HEADER_FORMAT_TYPE = [0, 1];
var TRACK_CHUNK_TYPE = [77, 84, 114, 107];
var TICKS_PER_QUARTER_NOTE = 480;
var NOTE_OFF = 128;
var NOTE_ON = 144;
var PROGRAM_CHANGE = 192;
var GM_DRUM_MAP = {
  kick: 36,
  // Acoustic Bass Drum
  snare: 38,
  // Acoustic Snare
  hihat: 42
  // Closed Hi-Hat
};
function getMidiNotesFromChord(chord) {
  const noteNames = AudioServiceClass.getChordNotes(chord);
  if (!noteNames || noteNames.length === 0) return [];
  return noteNames.map((note) => Tone2.Frequency(note).toMidi());
}
function writeVLQ(value) {
  const result = [];
  const sevenBitBytes = [];
  if (value === 0) {
    return [0];
  }
  while (value > 0) {
    sevenBitBytes.push(value & 127);
    value >>= 7;
  }
  sevenBitBytes.reverse();
  for (let i = 0; i < sevenBitBytes.length; i++) {
    const byte = sevenBitBytes[i];
    if (i < sevenBitBytes.length - 1) {
      result.push(byte | 128);
    } else {
      result.push(byte);
    }
  }
  return result;
}
function createTrackChunk(trackEvents) {
  const trackLength = trackEvents.length;
  const lengthBytes = [
    trackLength >> 24 & 255,
    trackLength >> 16 & 255,
    trackLength >> 8 & 255,
    trackLength & 255
  ];
  const endOfTrackEvent = [0, 255, 47, 0];
  const trackData = [...TRACK_CHUNK_TYPE, ...lengthBytes, ...trackEvents, ...endOfTrackEvent];
  return new Uint8Array(trackData);
}
function exportToMidi(data) {
  const { progression, bpm, drumPattern } = data;
  const chordTrackEvents = [];
  let chordCurrentTime = 0;
  chordTrackEvents.push(...writeVLQ(0), PROGRAM_CHANGE | 0, 0);
  progression.forEach((chord, barIndex) => {
    const midiNotes = getMidiNotesFromChord(chord);
    const barStartTime = barIndex * TICKS_PER_QUARTER_NOTE * 4;
    const noteOnDelta = barStartTime - chordCurrentTime;
    midiNotes.forEach((note, index) => {
      const deltaTime = index === 0 ? noteOnDelta : 0;
      chordTrackEvents.push(...writeVLQ(deltaTime), NOTE_ON | 0, note, 80);
    });
    chordCurrentTime = barStartTime;
    const durationTicks = TICKS_PER_QUARTER_NOTE * 4;
    const noteOffDelta = durationTicks;
    midiNotes.forEach((note, index) => {
      const deltaTime = index === 0 ? noteOffDelta : 0;
      chordTrackEvents.push(...writeVLQ(deltaTime), NOTE_OFF | 0, note, 0);
    });
    chordCurrentTime += durationTicks;
  });
  const drumTrackEvents = [];
  let drumCurrentTime = 0;
  const eighthNoteTicks = TICKS_PER_QUARTER_NOTE / 2;
  const noteDurationTicks = 120;
  drumTrackEvents.push(...writeVLQ(0), PROGRAM_CHANGE | 9, 0);
  const totalEighthNotes = progression.length * 8;
  for (let i = 0; i < totalEighthNotes; i++) {
    const stepTime = i * eighthNoteTicks;
    const step = drumPattern[i % drumPattern.length];
    const drumNotesToPlay = [];
    if (step?.kick) drumNotesToPlay.push({ note: GM_DRUM_MAP.kick, velocity: 100 });
    if (step?.snare) drumNotesToPlay.push({ note: GM_DRUM_MAP.snare, velocity: 110 });
    if (step?.hihat) drumNotesToPlay.push({ note: GM_DRUM_MAP.hihat, velocity: 70 });
    if (drumNotesToPlay.length > 0) {
      const deltaTime = stepTime - drumCurrentTime;
      drumNotesToPlay.forEach((drum, index) => {
        drumTrackEvents.push(...writeVLQ(index === 0 ? deltaTime : 0), NOTE_ON | 9, drum.note, drum.velocity);
      });
      drumCurrentTime = stepTime;
      drumNotesToPlay.forEach((drum, index) => {
        drumTrackEvents.push(...writeVLQ(index === 0 ? noteDurationTicks : 0), NOTE_OFF | 9, drum.note, 0);
      });
      drumCurrentTime += noteDurationTicks;
    }
  }
  const numTracks = [0, 2];
  const timeDivision = [TICKS_PER_QUARTER_NOTE >> 8 & 255, TICKS_PER_QUARTER_NOTE & 255];
  const headerBytes = [...HEADER_CHUNK_TYPE, ...HEADER_CHUNK_LENGTH, ...HEADER_FORMAT_TYPE, ...numTracks, ...timeDivision];
  const headerChunk = new Uint8Array(headerBytes);
  const chordChunk = createTrackChunk(chordTrackEvents);
  const drumChunk = createTrackChunk(drumTrackEvents);
  const midiFile = new Blob([headerChunk, chordChunk, drumChunk], { type: "audio/midi" });
  const url = URL.createObjectURL(midiFile);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jam-buddy-progression.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";

// constants.ts
var MUSIC_KEYS = ["A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
var SCALES = ["Major", "Minor"];
var DRUM_PATTERNS = ["Pop Rock", "Four On The Floor", "Funk", "Reggae", "Techno", "Hip-Hop", "Latin"];
var SYNTH_PRESETS = ["Sawtooth", "Warm Pad", "Electric Piano", "Sine Lead", "FM Pluck", "Square Lead", "Wobble Bass", "Classic Organ", "String Ensemble", "Brass Section", "Clean Guitar"];
var ARPEGGIATOR_RATES = ["32n", "16n", "8n", "4n", "2n", "1n"];
var ARPEGGIATOR_DIRECTIONS = ["up", "down", "upDown", "random"];
var HARMONY_INTERVALS = ["2nd", "3rd", "5th", "6th", "7th"];
var PRESET_PROGRESSIONS = [
  { name: "Pop-Hymne (I-V-vi-IV)", roman: ["I", "V", "vi", "IV", "I", "V", "vi", "IV"] },
  { name: "Gef\xFChlvolle Ballade (vi-V-I-IV)", roman: ["vi", "V", "I", "IV", "vi", "V", "I", "IV"] },
  { name: "Hit-Ballade (vi-IV-I-V)", roman: ["vi", "IV", "I", "V", "vi", "IV", "I", "V"] },
  { name: "50er Doo-Wop (I-vi-IV-V)", roman: ["I", "vi", "IV", "V", "I", "vi", "IV", "V"] },
  { name: "Classic Rock (I-IV-V)", roman: ["I", "IV", "V", "V", "I", "IV", "V", "V"] },
  { name: "Jazz-Standard (ii-V-I)", roman: ["iim7", "V7", "Imaj7", "Imaj7", "iim7", "V7", "Imaj7", "Imaj7"] },
  { name: "Einfacher Blues (I-IV-I-V)", roman: ["I7", "IV7", "I7", "V7", "I7", "IV7", "I7", "V7"] },
  { name: "Moll-Kadenz (i-iv-V-i)", roman: ["im", "ivm", "V", "im", "im", "ivm", "V", "im"] },
  { name: "Andalusische Kadenz (i-VII-VI-V)", roman: ["im", "VII", "VI", "V", "im", "VII", "VI", "V"] },
  { name: "Rock-Power (I-bVII-IV-I)", roman: ["I", "bVII", "IV", "I", "I", "bVII", "IV", "I"] },
  { name: "Folk-Standard (I-ii-IV-V)", roman: ["I", "ii", "IV", "V", "I", "ii", "IV", "V"] },
  { name: "Uplifting Chorus (IV-I-V-vi)", roman: ["IV", "I", "V", "vi", "IV", "I", "V", "vi"] }
];

// services/geminiService.ts
function isMusicKey(key) {
  return MUSIC_KEYS.includes(key);
}
function isScale(scale) {
  return SCALES.includes(scale);
}
async function generateProgression(prompt2) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Based on the user's prompt, create a chord progression. Prompt: "${prompt2}"`,
    config: {
      systemInstruction: `You are a music theory expert. Your task is to generate a standard 8-bar chord progression based on a user's prompt describing a mood, genre, or style.
      - The progression must contain exactly 8 chords.
      - You must determine the most appropriate musical key and scale (Major or Minor) for the prompt.
      - Return the result as a JSON object.
      - Use standard chord notation (e.g., 'C', 'Gm', 'Fmaj7', 'E7').
      - The key must be one of: ${MUSIC_KEYS.join(", ")}.
      - The scale must be either 'Major' or 'Minor'.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          key: {
            type: Type.STRING,
            description: "The musical key of the progression.",
            enum: MUSIC_KEYS
          },
          scale: {
            type: Type.STRING,
            description: "The scale of the progression (Major or Minor).",
            enum: SCALES
          },
          progression: {
            type: Type.ARRAY,
            description: "An array of exactly 8 chord names as strings.",
            items: {
              type: Type.STRING
            }
          }
        },
        required: ["key", "scale", "progression"]
      }
    }
  });
  try {
    if (!response.text) {
      throw new Error("Die KI hat keine Antwort zur\xFCckgegeben.");
    }
    const text = response.text.trim();
    const parsed = JSON.parse(text);
    if (parsed.error) {
      throw new Error(parsed.error);
    }
    if (!isMusicKey(parsed.key) || !isScale(parsed.scale) || !Array.isArray(parsed.progression) || parsed.progression.length !== 8 || !parsed.progression.every((c) => typeof c === "string")) {
      throw new Error("Die von der KI generierten Daten waren unvollst\xE4ndig oder fehlerhaft.");
    }
    return {
      key: parsed.key,
      scale: parsed.scale,
      progression: parsed.progression
    };
  } catch (error) {
    console.error("Fehler beim Analysieren oder Validieren der KI-Antwort:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Die Antwort der KI hatte ein unerwartetes Format. Bitte versuche es erneut.");
    }
    throw new Error(error.message || "Ein unbekannter Fehler bei der KI-Anfrage ist aufgetreten.");
  }
}

// components/ControlPanel.tsx
import { useRef as useRef2 } from "react";

// components/Tooltip.tsx
import { useState, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var Tooltip = ({ content, children, position = "top", className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsVisible(true), 600);
  };
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `relative inline-block ${className || ""}`,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      children: [
        children,
        /* @__PURE__ */ jsxs(
          "div",
          {
            role: "tooltip",
            className: `tooltip-popup absolute w-64 p-3 text-sm font-normal text-white bg-gray-800 border border-gray-700 rounded-lg shadow-lg pointer-events-none z-50 ${isVisible ? "visible" : ""}`,
            "data-popper-placement": position,
            children: [
              content,
              /* @__PURE__ */ jsx("div", { className: "tooltip-arrow", "data-popper-arrow": true })
            ]
          }
        )
      ]
    }
  );
};
var Tooltip_default = Tooltip;

// components/Icons.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var IconPlay = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsx2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx2("polygon", { points: "5 3 19 12 5 21 5 3" }) });
var IconPause = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("rect", { x: "6", y: "4", width: "4", height: "16" }),
  /* @__PURE__ */ jsx2("rect", { x: "14", y: "4", width: "4", height: "16" })
] });
var IconStop = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsx2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx2("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2", ry: "2" }) });
var IconRandom = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("path", { d: "M21 16V21H16" }),
  /* @__PURE__ */ jsx2("path", { d: "M3 21L9 15" }),
  /* @__PURE__ */ jsx2("path", { d: "M21 3V8H16" }),
  /* @__PURE__ */ jsx2("path", { d: "M15 15L21 21" }),
  /* @__PURE__ */ jsx2("path", { d: "M21 8L9 20" }),
  /* @__PURE__ */ jsx2("path", { d: "M3 3L9 9" }),
  /* @__PURE__ */ jsx2("path", { d: "M15 9L21 3" })
] });
var IconMagic = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }),
  /* @__PURE__ */ jsx2("path", { d: "M15.5 3.5L17 7l3.5 1.5-3.5 1.5L15.5 13.5 14 10l-3.5-1.5 3.5-1.5 1.5-3.5z" })
] });
var IconSave = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }),
  /* @__PURE__ */ jsx2("polyline", { points: "17 21 17 13 7 13 7 21" }),
  /* @__PURE__ */ jsx2("polyline", { points: "7 3 7 8 15 8" })
] });
var IconLoad = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ jsx2("polyline", { points: "17 8 12 3 7 8" }),
  /* @__PURE__ */ jsx2("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
] });
var IconDownload = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ jsx2("polyline", { points: "7 10 12 15 17 10" }),
  /* @__PURE__ */ jsx2("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
] });
var IconEdit = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
  /* @__PURE__ */ jsx2("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })
] });
var IconTrash = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("polyline", { points: "3 6 5 6 21 6" }),
  /* @__PURE__ */ jsx2("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
  /* @__PURE__ */ jsx2("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
  /* @__PURE__ */ jsx2("line", { x1: "14", y1: "11", x2: "14", y2: "17" })
] });
var IconPlus = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
  /* @__PURE__ */ jsx2("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
] });
var IconX = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ jsx2("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
var IconRefresh = ({ className = "w-6 h-6", strokeWidth = 2 }) => /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx2("path", { d: "M23 4v6h-6" }),
  /* @__PURE__ */ jsx2("path", { d: "M1 20v-6h6" }),
  /* @__PURE__ */ jsx2("path", { d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" })
] });

// components/ControlPanel.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var OSCILLATOR_TYPES = ["fatsawtooth", "fatsquare", "fmsine", "sine", "pulse", "fatsine", "sawtooth", "square"];
var ControlPanel = ({
  musicKey,
  scale,
  onKeyGroupChange,
  drumPattern,
  onDrumPatternChange,
  bpm,
  onBpmChange,
  kickVolume,
  onKickVolumeChange,
  snareVolume,
  onSnareVolumeChange,
  hihatVolume,
  onHihatVolumeChange,
  synthVolume,
  onSynthVolumeChange,
  bassVolume,
  onBassVolumeChange,
  kickPan,
  onKickPanChange,
  snarePan,
  onSnarePanChange,
  hihatPan,
  onHihatPanChange,
  synthPan,
  onSynthPanChange,
  bassPan,
  onBassPanChange,
  selectedPresetIndex,
  onPresetChange,
  synthPresetName,
  onSynthPresetNameChange,
  synthConfig,
  onSynthConfigChange,
  customSynthPresets,
  onSaveCustomSynthPreset,
  useInversions,
  onUseInversionsChange,
  synthOctave,
  onSynthOctaveChange,
  voicingVariation,
  onVoicingVariationChange,
  spreadVoicing,
  onSpreadVoicingChange,
  harmonyInterval,
  onHarmonyIntervalChange,
  harmonyVolume,
  onHarmonyVolumeChange,
  harmonyPan,
  onHarmonyPanChange,
  arpeggiatorEnabled,
  onArpeggiatorEnabledChange,
  arpeggiatorRate,
  onArpeggiatorRateChange,
  arpeggiatorDirection,
  onArpeggiatorDirectionChange,
  arpeggiatorGate,
  onArpeggiatorGateChange,
  onRandomize,
  isPlaying,
  onPlayToggle,
  onReset,
  onSave,
  onLoad,
  onExportMidi,
  onGenerateWithAi,
  isLoading,
  isOnline,
  customDrumPatterns,
  onOpenDrumEditor,
  onDeleteCustomPattern,
  discoveredFeatures,
  onFeatureDiscovered,
  trainingMode,
  onTrainingModeChange
}) => {
  const loadInputRef = useRef2(null);
  const selectClasses = "bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-full disabled:opacity-50";
  const buttonClasses = "px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  const iconButtonClasses = "px-4 py-2 rounded-md font-semibold text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  const radioLabelClasses = (isChecked) => `block w-full text-center py-2 px-1 text-sm font-semibold rounded-md cursor-pointer transition-colors ${isChecked ? "bg-purple-600 text-white shadow-md" : "bg-gray-600 text-gray-300 hover:bg-gray-500"} ${isPlaying || isLoading ? "opacity-50 cursor-not-allowed" : ""}`;
  const octaveLabels = {
    "-1": "Bass",
    "0": "Normal",
    "1": "Hoch",
    "2": "Sehr Hoch"
  };
  const formatPan = (pan) => {
    if (Math.abs(pan) < 0.01) return "C";
    const side = pan < 0 ? "L" : "R";
    const amount = Math.abs(pan * 100).toFixed(0);
    return `${side} ${amount}`;
  };
  const handlePanChange = (handler, value) => {
    if (!discoveredFeatures.panning) {
      onFeatureDiscovered("panning");
    }
    handler(value);
  };
  const handleArpeggiatorToggle = (enabled) => {
    if (!discoveredFeatures.arpeggiator) {
      onFeatureDiscovered("arpeggiator");
    }
    onArpeggiatorEnabledChange(enabled);
  };
  const isCustomPattern = customDrumPatterns.some((p) => p.name === drumPattern);
  const selectedKeyGroup = scale === "Major" ? musicKey : getRelativeMajor(musicKey);
  const handleSynthPresetChange = (name) => {
    const builtIn = AudioServiceClass.synthPresets[name];
    if (builtIn) {
      onSynthConfigChange({
        oscillator: builtIn.oscillator,
        envelope: builtIn.envelope,
        filter: { ...synthConfig.filter }
        // Keep current filter settings
      });
      onSynthPresetNameChange(name);
      return;
    }
    const custom = customSynthPresets.find((p) => p.name === name);
    if (custom) {
      onSynthConfigChange(custom.config);
      onSynthPresetNameChange(name);
    }
  };
  const handleSynthParamChange = (path, value) => {
    onSynthPresetNameChange("Custom");
    const newConfig = JSON.parse(JSON.stringify(synthConfig));
    let current = newConfig;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onSynthConfigChange(newConfig);
  };
  return /* @__PURE__ */ jsxs3("div", { className: "mt-8 space-y-6", children: [
    /* @__PURE__ */ jsx3(Tooltip_default, { content: "W\xE4hle eine vordefinierte Akkordfolge, um schnell loszulegen. Dies ist ideal, um g\xE4ngige Songstrukturen zu erkunden.", children: /* @__PURE__ */ jsxs3("div", { children: [
      /* @__PURE__ */ jsx3("label", { htmlFor: "preset-select", className: "block text-sm font-medium text-gray-400 mb-1", children: "Preset-Progressionen" }),
      /* @__PURE__ */ jsxs3(
        "select",
        {
          id: "preset-select",
          value: selectedPresetIndex,
          onChange: (e) => onPresetChange(Number(e.target.value)),
          className: selectClasses,
          disabled: isPlaying || isLoading,
          "aria-label": "W\xE4hle eine voreingestellte Akkordprogression",
          children: [
            /* @__PURE__ */ jsx3("option", { value: -1, children: "-- Eigene Progression --" }),
            PRESET_PROGRESSIONS.map((p, index) => /* @__PURE__ */ jsx3("option", { value: index, children: p.name }, p.name))
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx3(Tooltip_default, { content: "Beschreibe eine Stimmung oder einen Musikstil, und die KI generiert eine passende 8-Takt-Akkordfolge f\xFCr dich. Erfordert eine Internetverbindung.", children: /* @__PURE__ */ jsx3("div", { className: "pt-2", children: /* @__PURE__ */ jsxs3(
      "button",
      {
        onClick: onGenerateWithAi,
        disabled: isPlaying || isLoading || !isOnline,
        className: `${buttonClasses} w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center`,
        title: !isOnline ? "KI-Funktionen sind offline nicht verf\xFCgbar" : "Mit KI eine Progression erstellen",
        children: [
          /* @__PURE__ */ jsx3(IconMagic, { className: "h-5 w-5 mr-2" }),
          /* @__PURE__ */ jsx3("span", { className: "ml-2", children: "Mit KI erstellen" })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsx3(Tooltip_default, { content: "Legt das tonale Zentrum f\xFCr die Progression fest. Alle Akkorde werden relativ zu dieser Tonart und Tonleiter (Dur/Moll) berechnet.", children: /* @__PURE__ */ jsxs3("div", { children: [
      /* @__PURE__ */ jsx3("label", { htmlFor: "key-group-select", className: "block text-sm font-medium text-gray-400 mb-1", children: "Tonart" }),
      /* @__PURE__ */ jsx3(
        "select",
        {
          id: "key-group-select",
          value: selectedKeyGroup,
          onChange: (e) => onKeyGroupChange(e.target.value),
          className: selectClasses,
          disabled: isPlaying || isLoading,
          children: MUSIC_KEYS.map((k) => {
            const relativeMinor = getRelativeMinor(k);
            return /* @__PURE__ */ jsx3("option", { value: k, children: `${k} / ${relativeMinor}m` }, k);
          })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx3(Tooltip_default, { content: "Stellt die Geschwindigkeit des Tracks in Schl\xE4gen pro Minute (BPM) ein.", children: /* @__PURE__ */ jsxs3("div", { children: [
      /* @__PURE__ */ jsxs3("label", { htmlFor: "bpm-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
        "Tempo: ",
        bpm,
        " BPM"
      ] }),
      /* @__PURE__ */ jsx3("input", { id: "bpm-slider", type: "range", min: "40", max: "240", value: bpm, onChange: (e) => onBpmChange(Number(e.target.value)), className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500" })
    ] }) }),
    /* @__PURE__ */ jsx3(Tooltip_default, { content: "Aktiviert den Loop-Trainer: 2 Durchg\xE4nge spielen, dann Stopp, vollst\xE4ndiger Reset (f\xFCr klaren Sound) und automatischer Neustart mit Einz\xE4hler. Endlos.", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between bg-gray-700/30 p-3 rounded-lg border border-gray-600", children: [
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx3("span", { className: "block text-sm font-bold text-purple-300", children: "Loop-Trainer (Auto-Reset)" }),
        /* @__PURE__ */ jsx3("span", { className: "text-xs text-gray-400", children: "Spielt 2 Loops, reset & wiederholt" })
      ] }),
      /* @__PURE__ */ jsx3("button", { role: "switch", "aria-checked": trainingMode, onClick: () => onTrainingModeChange(!trainingMode), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${trainingMode ? "bg-purple-500" : "bg-gray-600"}`, disabled: isPlaying || isLoading, children: /* @__PURE__ */ jsx3("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${trainingMode ? "translate-x-6" : "translate-x-1"}` }) })
    ] }) }),
    /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-[1fr_2fr_auto] items-center gap-2 pt-4 border-t border-gray-700", children: [
      /* @__PURE__ */ jsx3(Tooltip_default, { content: "W\xE4hlt eine zuf\xE4llige Tonart und eine zuf\xE4llige Preset-Progression aus. Perfekt f\xFCr neue Inspiration!", children: /* @__PURE__ */ jsxs3("button", { onClick: onRandomize, disabled: isPlaying || isLoading, className: `${buttonClasses} w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center`, title: "Zuf\xE4llige Tonart und Progression (R)", children: [
        /* @__PURE__ */ jsx3(IconRandom, { className: "h-5 w-5 mr-2" }),
        /* @__PURE__ */ jsx3("span", { className: "ml-2 hidden md:inline", children: "Zufall" })
      ] }) }),
      /* @__PURE__ */ jsx3(Tooltip_default, { content: "Startet oder stoppt die Wiedergabe. Du kannst auch die Leertaste verwenden.", children: /* @__PURE__ */ jsxs3("button", { onClick: onPlayToggle, disabled: isLoading, className: `${buttonClasses} w-full flex items-center justify-center ${isPlaying ? "bg-pink-600 hover:bg-pink-700" : "bg-green-600 hover:bg-green-700"}`, children: [
        isPlaying ? /* @__PURE__ */ jsx3(IconPause, { className: "h-6 w-6" }) : /* @__PURE__ */ jsx3(IconPlay, { className: "h-6 w-6" }),
        /* @__PURE__ */ jsx3("span", { className: "ml-2", children: isPlaying ? "Pause" : "Start" })
      ] }) }),
      /* @__PURE__ */ jsx3(Tooltip_default, { content: "Notfall-Reset: Stoppt alles, l\xF6scht den Audio-Speicher und startet die Audio-Engine neu. Nutze dies bei Verzerrungen oder H\xE4ngern.", position: "left", children: /* @__PURE__ */ jsx3("button", { onClick: onReset, disabled: isLoading, className: `${buttonClasses} bg-red-800 hover:bg-red-700 flex items-center justify-center px-3`, title: "Audio-Engine zur\xFCcksetzen", children: /* @__PURE__ */ jsx3(IconStop, { className: "h-5 w-5" }) }) })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-gray-700", children: [
      /* @__PURE__ */ jsx3(Tooltip_default, { content: "Speichert deine aktuelle Session (Progression, Soundeinstellungen etc.) als JSON-Datei auf deinem Ger\xE4t.", children: /* @__PURE__ */ jsxs3("button", { onClick: onSave, className: iconButtonClasses, disabled: isPlaying || isLoading, title: "Jam speichern", children: [
        /* @__PURE__ */ jsx3(IconSave, { className: "h-5 w-5 mr-2" }),
        /* @__PURE__ */ jsx3("span", { className: "ml-2", children: "Speichern" })
      ] }) }),
      /* @__PURE__ */ jsx3(Tooltip_default, { content: "L\xE4dt eine zuvor gespeicherte Jam-Session aus einer JSON-Datei.", children: /* @__PURE__ */ jsxs3("button", { onClick: () => loadInputRef.current?.click(), className: iconButtonClasses, disabled: isPlaying || isLoading, title: "Jam laden", children: [
        /* @__PURE__ */ jsx3(IconLoad, { className: "h-3.5 w-3.5 mr-2" }),
        /* @__PURE__ */ jsx3("span", { className: "ml-2", children: "Laden" })
      ] }) }),
      /* @__PURE__ */ jsx3("input", { type: "file", ref: loadInputRef, onChange: onLoad, accept: ".json", className: "hidden" }),
      /* @__PURE__ */ jsx3(Tooltip_default, { content: "Exportiert die aktuelle Progression als MIDI-Datei, die du in deiner Digital Audio Workstation (DAW) weiterverwenden kannst.", children: /* @__PURE__ */ jsxs3("button", { onClick: onExportMidi, className: iconButtonClasses, disabled: isPlaying || isLoading, title: "MIDI exportieren", children: [
        /* @__PURE__ */ jsx3(IconDownload, { className: "h-3.5 w-3.5 mr-2" }),
        /* @__PURE__ */ jsx3("span", { className: "ml-2", children: "MIDI" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "pt-4 border-t border-gray-700", children: [
      /* @__PURE__ */ jsx3("h3", { className: "text-center text-lg font-semibold text-gray-400 mb-4", children: "Begleitungseinstellungen" }),
      /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs3("div", { className: "bg-gray-700/50 p-4 rounded-lg space-y-4", children: [
          /* @__PURE__ */ jsx3("h4", { className: "font-bold text-center text-purple-300", children: "Schlagzeug" }),
          /* @__PURE__ */ jsx3(Tooltip_default, { content: "W\xE4hle einen Schlagzeug-Rhythmus. Klicke auf den Stift, um eigene Rhythmen zu erstellen oder zu bearbeiten.", children: /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx3("label", { htmlFor: "drum-select", className: "block text-sm font-medium text-gray-400 mb-1", children: "Rhythmus" }),
            /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs3("select", { id: "drum-select", value: drumPattern, onChange: (e) => onDrumPatternChange(e.target.value), className: selectClasses, disabled: isLoading, children: [
                /* @__PURE__ */ jsx3("optgroup", { label: "Presets", children: DRUM_PATTERNS.map((p) => /* @__PURE__ */ jsx3("option", { value: p, children: p }, p)) }),
                customDrumPatterns.length > 0 && /* @__PURE__ */ jsx3("optgroup", { label: "Eigene Patterns", children: customDrumPatterns.map((p) => /* @__PURE__ */ jsx3("option", { value: p.name, children: p.name }, p.name)) })
              ] }),
              /* @__PURE__ */ jsx3("button", { onClick: () => onOpenDrumEditor(isCustomPattern ? drumPattern : void 0), className: `${iconButtonClasses} flex-shrink-0`, title: isCustomPattern ? "Eigenes Pattern bearbeiten" : "Neues Pattern erstellen", children: isCustomPattern ? /* @__PURE__ */ jsx3(IconEdit, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx3(IconPlus, { className: "h-5 w-5" }) }),
              isCustomPattern && /* @__PURE__ */ jsx3(Tooltip_default, { content: "Dieses Pattern l\xF6schen", position: "top", children: /* @__PURE__ */ jsx3("button", { onClick: () => onDeleteCustomPattern(drumPattern), className: `${iconButtonClasses} flex-shrink-0 !bg-red-800/50 hover:!bg-red-700/50`, title: "Pattern l\xF6schen", children: /* @__PURE__ */ jsx3(IconTrash, { className: "h-5 w-5" }) }) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs3("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Regelt die Lautst\xE4rke der Bassdrum.", children: /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsxs3("label", { htmlFor: "kick-volume-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                "Kick Vol: ",
                kickVolume,
                " dB"
              ] }),
              /* @__PURE__ */ jsx3("input", { id: "kick-volume-slider", type: "range", min: "-48", max: "6", step: "1", value: kickVolume, onChange: (e) => onKickVolumeChange(Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
            ] }) }),
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Positioniert die Bassdrum im Stereobild. 'L' ist links, 'C' ist Mitte, 'R' ist rechts.", children: /* @__PURE__ */ jsxs3("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs3("label", { htmlFor: "kick-pan-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                "Kick Pan: ",
                formatPan(kickPan)
              ] }),
              !discoveredFeatures.panning && /* @__PURE__ */ jsx3("span", { className: "absolute left-[-14px] top-1 w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse-glow", title: "Neue Funktion: Panorama" }),
              /* @__PURE__ */ jsx3("input", { id: "kick-pan-slider", type: "range", min: "-100", max: "100", step: "1", value: kickPan * 100, onChange: (e) => handlePanChange(onKickPanChange, Number(e.target.value) / 100), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Regelt die Lautst\xE4rke der Snare-Drum.", children: /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsxs3("label", { htmlFor: "snare-volume-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                "Snare Vol: ",
                snareVolume,
                " dB"
              ] }),
              /* @__PURE__ */ jsx3("input", { id: "snare-volume-slider", type: "range", min: "-48", max: "6", step: "1", value: snareVolume, onChange: (e) => onSnareVolumeChange(Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
            ] }) }),
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Positioniert die Snare-Drum im Stereobild.", children: /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsxs3("label", { htmlFor: "snare-pan-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                "Snare Pan: ",
                formatPan(snarePan)
              ] }),
              /* @__PURE__ */ jsx3("input", { id: "snare-pan-slider", type: "range", min: "-100", max: "100", step: "1", value: snarePan * 100, onChange: (e) => handlePanChange(onSnarePanChange, Number(e.target.value) / 100), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Regelt die Lautst\xE4rke der Hi-Hat.", children: /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsxs3("label", { htmlFor: "hihat-volume-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                "Hi-Hat Vol: ",
                hihatVolume,
                " dB"
              ] }),
              /* @__PURE__ */ jsx3("input", { id: "hihat-volume-slider", type: "range", min: "-48", max: "6", step: "1", value: hihatVolume, onChange: (e) => onHihatVolumeChange(Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
            ] }) }),
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Positioniert die Hi-Hat im Stereobild.", children: /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsxs3("label", { htmlFor: "hihat-pan-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                "Hi-Hat Pan: ",
                formatPan(hihatPan)
              ] }),
              /* @__PURE__ */ jsx3("input", { id: "hihat-pan-slider", type: "range", min: "-100", max: "100", step: "1", value: hihatPan * 100, onChange: (e) => handlePanChange(onHihatPanChange, Number(e.target.value) / 100), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: "bg-gray-700/50 p-4 rounded-lg space-y-4", children: [
          /* @__PURE__ */ jsx3("h4", { className: "font-bold text-center text-purple-300", children: "Synth" }),
          /* @__PURE__ */ jsx3(Tooltip_default, { content: "W\xE4hle einen voreingestellten Klang f\xFCr die Akkorde. Unter 'Synthesizer-Design' kannst du den Sound detailliert anpassen.", children: /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx3("label", { htmlFor: "synth-preset-select", className: "block text-sm font-medium text-gray-400 mb-1", children: "Klang" }),
            /* @__PURE__ */ jsxs3("select", { id: "synth-preset-select", value: synthPresetName, onChange: (e) => handleSynthPresetChange(e.target.value), className: selectClasses, disabled: isPlaying || isLoading, children: [
              synthPresetName === "Custom" && /* @__PURE__ */ jsx3("option", { value: "Custom", children: "-- Eigene Einstellung --" }),
              /* @__PURE__ */ jsx3("optgroup", { label: "Presets", children: SYNTH_PRESETS.map((p) => /* @__PURE__ */ jsx3("option", { value: p, children: p }, p)) }),
              customSynthPresets.length > 0 && /* @__PURE__ */ jsx3("optgroup", { label: "Eigene Presets", children: customSynthPresets.map((p) => /* @__PURE__ */ jsx3("option", { value: p.name, children: p.name }, p.name)) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs3("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Regelt die Gesamtlautst\xE4rke des Synthesizers.", children: /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsxs3("label", { htmlFor: "synth-volume-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                "Lautst\xE4rke: ",
                synthVolume,
                " dB"
              ] }),
              /* @__PURE__ */ jsx3("input", { id: "synth-volume-slider", type: "range", min: "-48", max: "0", step: "1", value: synthVolume, onChange: (e) => onSynthVolumeChange(Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
            ] }) }),
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Positioniert den Synthesizer im Stereobild.", children: /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsxs3("label", { htmlFor: "synth-pan-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                "Panorama: ",
                formatPan(synthPan)
              ] }),
              /* @__PURE__ */ jsx3("input", { id: "synth-pan-slider", type: "range", min: "-100", max: "100", step: "1", value: synthPan * 100, onChange: (e) => handlePanChange(onSynthPanChange, Number(e.target.value) / 100), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx3(Tooltip_default, { content: "Klappe diesen Bereich aus, um den Synthesizer-Klang von Grund auf zu gestalten. \xC4nderungen erstellen ein 'Custom'-Preset, das du speichern kannst.", children: /* @__PURE__ */ jsxs3("details", { className: "pt-2 border-t border-gray-600/50", children: [
            /* @__PURE__ */ jsx3("summary", { className: "cursor-pointer text-purple-300 font-semibold", children: "Synthesizer-Design" }),
            /* @__PURE__ */ jsxs3("div", { className: "mt-4 space-y-4", children: [
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsx3("label", { htmlFor: "osc-type-select", className: "block text-sm font-medium text-gray-400 mb-1", children: "Oszillator-Typ" }),
                /* @__PURE__ */ jsx3("select", { id: "osc-type-select", value: synthConfig.oscillator.type, onChange: (e) => handleSynthParamChange(["oscillator", "type"], e.target.value), className: selectClasses, children: OSCILLATOR_TYPES.map((t) => /* @__PURE__ */ jsx3("option", { value: t, children: t }, t)) })
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsxs3("label", { htmlFor: "env-attack-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                  "Attack: ",
                  synthConfig.envelope.attack.toFixed(2),
                  "s"
                ] }),
                /* @__PURE__ */ jsx3("input", { id: "env-attack-slider", type: "range", min: "0.01", max: "2", step: "0.01", value: synthConfig.envelope.attack, onChange: (e) => handleSynthParamChange(["envelope", "attack"], Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsxs3("label", { htmlFor: "env-decay-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                  "Decay: ",
                  synthConfig.envelope.decay.toFixed(2),
                  "s"
                ] }),
                /* @__PURE__ */ jsx3("input", { id: "env-decay-slider", type: "range", min: "0.01", max: "2", step: "0.01", value: synthConfig.envelope.decay, onChange: (e) => handleSynthParamChange(["envelope", "decay"], Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsxs3("label", { htmlFor: "env-sustain-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                  "Sustain: ",
                  synthConfig.envelope.sustain.toFixed(2)
                ] }),
                /* @__PURE__ */ jsx3("input", { id: "env-sustain-slider", type: "range", min: "0", max: "1", step: "0.01", value: synthConfig.envelope.sustain, onChange: (e) => handleSynthParamChange(["envelope", "sustain"], Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsxs3("label", { htmlFor: "env-release-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                  "Release: ",
                  synthConfig.envelope.release.toFixed(2),
                  "s"
                ] }),
                /* @__PURE__ */ jsx3("input", { id: "env-release-slider", type: "range", min: "0.01", max: "4", step: "0.01", value: synthConfig.envelope.release, onChange: (e) => handleSynthParamChange(["envelope", "release"], Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsxs3("label", { htmlFor: "filter-cutoff-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                  "Helligkeit: ",
                  Math.round(synthConfig.filter.cutoff / 1e3),
                  " kHz"
                ] }),
                /* @__PURE__ */ jsx3("input", { id: "filter-cutoff-slider", type: "range", min: "200", max: "15000", step: "100", value: synthConfig.filter.cutoff, onChange: (e) => handleSynthParamChange(["filter", "cutoff"], Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsxs3("label", { htmlFor: "filter-resonance-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                  "Resonanz: ",
                  synthConfig.filter.resonance.toFixed(1)
                ] }),
                /* @__PURE__ */ jsx3("input", { id: "filter-resonance-slider", type: "range", min: "0.5", max: "20", step: "0.1", value: synthConfig.filter.resonance, onChange: (e) => handleSynthParamChange(["filter", "resonance"], Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
              ] }),
              /* @__PURE__ */ jsx3("div", { className: "pt-2", children: /* @__PURE__ */ jsx3("button", { onClick: onSaveCustomSynthPreset, className: `${iconButtonClasses} w-full`, children: "Aktuellen Sound speichern..." }) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs3("div", { className: "pt-2 border-t border-gray-600/50 space-y-4", children: [
            /* @__PURE__ */ jsx3("h4", { className: "font-bold text-center text-purple-300", children: "Voicing" }),
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Verschiebt die Akkorde um ganze Oktaven nach oben oder unten.", children: /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsxs3("label", { htmlFor: "synth-octave-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                "Oktave: ",
                octaveLabels[synthOctave] || "Normal"
              ] }),
              /* @__PURE__ */ jsx3("input", { id: "synth-octave-slider", type: "range", min: "-1", max: "2", step: "1", value: synthOctave, onChange: (e) => onSynthOctaveChange(Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500", disabled: isPlaying || isLoading })
            ] }) }),
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Spielt die Akkorde in verschiedenen Umkehrungen, um weichere \xDCberg\xE4nge und weniger Spr\xFCnge in der Melodief\xFChrung zu erzeugen.", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx3("label", { htmlFor: "inversions-toggle", className: "text-sm font-medium text-gray-400", children: "Smarte Umkehrungen" }),
              /* @__PURE__ */ jsx3("button", { role: "switch", "aria-checked": useInversions, id: "inversions-toggle", onClick: () => onUseInversionsChange(!useInversions), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useInversions ? "bg-purple-600" : "bg-gray-600"}`, disabled: isPlaying || isLoading, children: /* @__PURE__ */ jsx3("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useInversions ? "translate-x-6" : "translate-x-1"}` }) })
            ] }) }),
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Bringt leichte Abwechslung in die Akkordumkehrungen, um die Begleitung lebendiger klingen zu lassen. Ben\xF6tigt 'Smarte Umkehrungen'.", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx3("label", { htmlFor: "voicing-variation-toggle", className: "text-sm font-medium text-gray-400", children: "Voicing-Variation" }),
              /* @__PURE__ */ jsx3("button", { role: "switch", "aria-checked": voicingVariation, id: "voicing-variation-toggle", onClick: () => onVoicingVariationChange(!voicingVariation), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${voicingVariation ? "bg-purple-600" : "bg-gray-600"}`, disabled: isPlaying || isLoading || !useInversions, "aria-describedby": "voicing-variation-description", children: /* @__PURE__ */ jsx3("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${voicingVariation ? "translate-x-6" : "translate-x-1"}` }) })
            ] }) }),
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Spielt die Akkorde in einer weiteren Lage (offener), was oft voller und breiter klingt.", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx3("label", { htmlFor: "spread-voicing-toggle", className: "text-sm font-medium text-gray-400", children: "Spread Voicing" }),
              /* @__PURE__ */ jsx3("button", { role: "switch", "aria-checked": spreadVoicing, id: "spread-voicing-toggle", onClick: () => onSpreadVoicingChange(!spreadVoicing), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${spreadVoicing ? "bg-purple-600" : "bg-gray-600"}`, disabled: isPlaying || isLoading, children: /* @__PURE__ */ jsx3("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${spreadVoicing ? "translate-x-6" : "translate-x-1"}` }) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "pt-4 border-t border-gray-600/50 space-y-4", children: [
            /* @__PURE__ */ jsx3(Tooltip_default, { content: "Spielt die Noten eines Akkords nacheinander ab, anstatt gleichzeitig. Erzeugt eine rhythmische, melodische Textur.", children: /* @__PURE__ */ jsxs3("div", { className: "relative flex items-center justify-between", children: [
              !discoveredFeatures.arpeggiator && /* @__PURE__ */ jsx3("span", { className: "absolute left-[-14px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse-glow", title: "Neue Funktion: Arpeggiator" }),
              /* @__PURE__ */ jsx3("label", { htmlFor: "arp-toggle", className: "text-sm font-bold text-purple-300", children: "Arpeggiator" }),
              /* @__PURE__ */ jsx3("button", { role: "switch", "aria-checked": arpeggiatorEnabled, id: "arp-toggle", onClick: () => handleArpeggiatorToggle(!arpeggiatorEnabled), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${arpeggiatorEnabled ? "bg-purple-600" : "bg-gray-600"}`, disabled: isPlaying || isLoading, children: /* @__PURE__ */ jsx3("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${arpeggiatorEnabled ? "translate-x-6" : "translate-x-1"}` }) })
            ] }) }),
            /* @__PURE__ */ jsxs3("div", { className: `${arpeggiatorEnabled ? "opacity-100" : "opacity-50 pointer-events-none"} space-y-4 transition-opacity`, children: [
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsx3("p", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Rate" }),
                /* @__PURE__ */ jsx3("div", { role: "radiogroup", className: "grid grid-cols-3 gap-2", children: ARPEGGIATOR_RATES.map((r) => /* @__PURE__ */ jsxs3("div", { children: [
                  /* @__PURE__ */ jsx3("input", { type: "radio", id: `arp-rate-${r}`, name: "arp-rate", value: r, checked: arpeggiatorRate === r, onChange: () => onArpeggiatorRateChange(r), className: "sr-only", disabled: !arpeggiatorEnabled || isPlaying || isLoading }),
                  /* @__PURE__ */ jsx3("label", { htmlFor: `arp-rate-${r}`, className: radioLabelClasses(arpeggiatorRate === r), children: r })
                ] }, r)) })
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsx3("p", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Richtung" }),
                /* @__PURE__ */ jsx3("div", { role: "radiogroup", className: "grid grid-cols-2 gap-2", children: ARPEGGIATOR_DIRECTIONS.map((d) => /* @__PURE__ */ jsxs3("div", { children: [
                  /* @__PURE__ */ jsx3("input", { type: "radio", id: `arp-dir-${d}`, name: "arp-dir", value: d, checked: arpeggiatorDirection === d, onChange: () => onArpeggiatorDirectionChange(d), className: "sr-only", disabled: !arpeggiatorEnabled || isPlaying || isLoading }),
                  /* @__PURE__ */ jsx3("label", { htmlFor: `arp-dir-${d}`, className: radioLabelClasses(arpeggiatorDirection === d), children: d.charAt(0).toUpperCase() + d.slice(1) })
                ] }, d)) })
              ] }),
              /* @__PURE__ */ jsxs3("div", { children: [
                /* @__PURE__ */ jsxs3("label", { htmlFor: "arp-gate-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
                  "Gate: ",
                  arpeggiatorGate.toFixed(2)
                ] }),
                /* @__PURE__ */ jsx3("input", { id: "arp-gate-slider", type: "range", min: "0.1", max: "1.0", step: "0.05", value: arpeggiatorGate, onChange: (e) => onArpeggiatorGateChange(Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500", disabled: !arpeggiatorEnabled })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx3(Tooltip_default, { content: "Steuert die Lautst\xE4rke und das Panning der Basslinie, die immer den Grundton des aktuellen Akkords spielt.", children: /* @__PURE__ */ jsxs3("div", { className: "bg-gray-700/50 p-4 rounded-lg space-y-4", children: [
          /* @__PURE__ */ jsx3("h4", { className: "font-bold text-center text-purple-300", children: "Bass" }),
          /* @__PURE__ */ jsxs3("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs3("label", { htmlFor: "bass-volume-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
              "Lautst\xE4rke: ",
              bassVolume,
              " dB"
            ] }),
            /* @__PURE__ */ jsx3("input", { id: "bass-volume-slider", type: "range", min: "-48", max: "6", step: "1", value: bassVolume, onChange: (e) => onBassVolumeChange(Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" }),
            /* @__PURE__ */ jsxs3("label", { htmlFor: "bass-pan-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
              "Panorama: ",
              formatPan(bassPan)
            ] }),
            /* @__PURE__ */ jsx3("input", { id: "bass-pan-slider", type: "range", min: "-100", max: "100", step: "1", value: bassPan * 100, onChange: (e) => handlePanChange(onBassPanChange, Number(e.target.value) / 100), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx3(Tooltip_default, { content: "F\xFCgt eine zweite, harmonisch passende Stimme hinzu, die dem Grundton des Akkords in einem festen Intervall folgt.", children: /* @__PURE__ */ jsxs3("div", { className: "bg-gray-700/50 p-4 rounded-lg space-y-4", children: [
          /* @__PURE__ */ jsx3("h4", { className: "font-bold text-center text-purple-300", children: "Diatonische Harmonie" }),
          /* @__PURE__ */ jsx3("div", { role: "radiogroup", className: "grid grid-cols-3 gap-2", children: ["Aus", ...HARMONY_INTERVALS].map((item) => {
            const isChecked = harmonyInterval === null && item === "Aus" || harmonyInterval === item;
            return /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsx3("input", { type: "radio", id: `harmony-${item}`, name: "harmony-interval", value: item, checked: isChecked, onChange: () => onHarmonyIntervalChange(item === "Aus" ? null : item), className: "sr-only", disabled: isPlaying || isLoading }),
              /* @__PURE__ */ jsx3("label", { htmlFor: `harmony-${item}`, className: radioLabelClasses(isChecked), children: item })
            ] }, item);
          }) }),
          /* @__PURE__ */ jsxs3("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs3("label", { htmlFor: "harmony-volume-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
              "Lautst\xE4rke: ",
              harmonyVolume,
              " dB"
            ] }),
            /* @__PURE__ */ jsx3("input", { id: "harmony-volume-slider", type: "range", min: "-48", max: "0", step: "1", value: harmonyVolume, onChange: (e) => onHarmonyVolumeChange(Number(e.target.value)), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500", disabled: harmonyInterval === null }),
            /* @__PURE__ */ jsxs3("label", { htmlFor: "harmony-pan-slider", className: "block text-sm font-medium text-gray-400 mb-1", children: [
              "Panorama: ",
              formatPan(harmonyPan)
            ] }),
            /* @__PURE__ */ jsx3("input", { id: "harmony-pan-slider", type: "range", min: "-100", max: "100", step: "1", value: harmonyPan * 100, onChange: (e) => handlePanChange(onHarmonyPanChange, Number(e.target.value) / 100), className: "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500", disabled: harmonyInterval === null })
          ] })
        ] }) })
      ] })
    ] })
  ] });
};
var ControlPanel_default = ControlPanel;

// components/ChordDisplay.tsx
import React3, { useState as useState2, useRef as useRef3, useEffect } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var CHORD_SUFFIXES = ["", "m", "maj7", "7", "m7", "m7b5", "dim7", "9", "maj9", "m9", "13", "7b9"];
var ChordDisplay = ({ progression, currentChordIndex, onChordChange, isPlaying }) => {
  const [editingIndex, setEditingIndex] = useState2(null);
  const chordRefs = useRef3([]);
  useEffect(() => {
    chordRefs.current = chordRefs.current.slice(0, progression.length);
  }, [progression]);
  const generateSuggestions = (chord) => {
    const rootMatch = chord.match(/^[A-G]#?/);
    if (!rootMatch) return [];
    const root2 = rootMatch[0];
    const commonSuffixes = ["m7", "maj7", "7", "9", "13"];
    const suggestions = commonSuffixes.map((suffix) => `${root2}${suffix}`).filter((suggestion) => suggestion.toLowerCase() !== chord.toLowerCase());
    return suggestions.slice(0, 4);
  };
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setEditingIndex(null);
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % progression.length;
      chordRefs.current[nextIndex]?.focus();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + progression.length) % progression.length;
      chordRefs.current[prevIndex]?.focus();
      return;
    }
    const isEditing = editingIndex === index;
    if (isEditing) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const currentChord = progression[index];
        const rootMatch = currentChord.match(/^[A-G][#b]?/);
        if (!rootMatch) return;
        const root2 = rootMatch[0];
        const currentSuffix = currentChord.substring(root2.length);
        const currentIndex = CHORD_SUFFIXES.indexOf(currentSuffix);
        const direction = e.key === "ArrowUp" ? 1 : -1;
        let nextIndex = currentIndex === -1 ? direction === 1 ? 1 : CHORD_SUFFIXES.length - 1 : (currentIndex + direction + CHORD_SUFFIXES.length) % CHORD_SUFFIXES.length;
        const newChord = `${root2}${CHORD_SUFFIXES[nextIndex]}`;
        onChordChange(index, newChord);
      } else if (e.key === "Escape" || e.key === "Enter") {
        setEditingIndex(null);
        e.target.blur();
      }
    } else {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setEditingIndex(index);
      }
    }
  };
  return /* @__PURE__ */ jsx4(
    Tooltip_default,
    {
      content: "Klicke auf einen Akkord, um ihn zu bearbeiten. Benutze die Pfeiltasten (\u2190/\u2192), um zwischen den Akkorden zu navigieren, und \u2191/\u2193, um Varianten (z.B. Dur, Moll, 7) durchzuschalten.",
      position: "bottom",
      className: "w-full",
      children: /* @__PURE__ */ jsx4("div", { className: "grid grid-cols-4 lg:grid-cols-8 gap-2 text-center", children: progression.map((chord, index) => {
        const isActive = index === currentChordIndex;
        const isEditing = editingIndex === index;
        const suggestions = generateSuggestions(chord);
        const chordTones = isActive ? AudioServiceClass.getChordNotes(chord, 0).map((note) => note.replace(/[0-9]/g, "")) : [];
        const rootNote = chord.match(/^[A-G][#b]?/)?.[0];
        const rootMatch = chord.match(/^[A-G][#b]?/);
        const root2 = rootMatch ? rootMatch[0] : chord;
        const extension = rootMatch ? chord.substring(root2.length) : "";
        return /* @__PURE__ */ jsxs4(
          "div",
          {
            id: `chord-container-${index}`,
            ref: (el) => {
              if (el) chordRefs.current[index] = el;
            },
            className: "relative group",
            onFocus: () => !isPlaying && setEditingIndex(index),
            onBlur: handleBlur,
            onKeyDown: (e) => handleKeyDown(e, index),
            tabIndex: isPlaying ? -1 : 0,
            children: [
              /* @__PURE__ */ jsxs4(
                "div",
                {
                  className: `
                  p-1 rounded-lg border-2 flex flex-col items-center justify-center min-h-24 md:min-h-32
                  transition-all duration-200 ease-in-out outline-none
                  group-focus:ring-2 group-focus:ring-blue-400
                  ${isActive ? "bg-purple-600 border-purple-400 scale-110 shadow-lg shadow-purple-500/30" : "bg-gray-700/50 border-gray-600"}
                `,
                  children: [
                    isEditing && !isPlaying ? /* @__PURE__ */ jsx4(
                      "input",
                      {
                        type: "text",
                        value: chord,
                        onChange: (e) => onChordChange(index, e.target.value),
                        autoFocus: true,
                        "aria-label": `Akkord ${index + 1}, wird bearbeitet`,
                        className: "w-full h-full bg-transparent border-none outline-none text-center text-2xl md:text-3xl font-bold flex-grow text-white",
                        onKeyDown: (e) => {
                          const input = e.target;
                          const isAtStart = input.selectionStart === 0 && input.selectionEnd === 0;
                          const isAtEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
                          if (e.key === "ArrowLeft" && isAtStart || e.key === "ArrowRight" && isAtEnd) {
                            handleKeyDown(e, index);
                          } else if (!["ArrowLeft", "ArrowRight"].includes(e.key)) {
                            handleKeyDown(e, index);
                          }
                        }
                      }
                    ) : /* @__PURE__ */ jsxs4(
                      "div",
                      {
                        className: `w-full h-full flex flex-col items-center justify-center cursor-pointer ${isActive ? "text-white" : "text-gray-300"}`,
                        onClick: () => !isPlaying && setEditingIndex(index),
                        "aria-label": `Akkord ${index + 1}: ${chord}`,
                        children: [
                          /* @__PURE__ */ jsx4("span", { className: "text-2xl md:text-3xl font-bold leading-tight", children: root2 }),
                          extension && /* @__PURE__ */ jsx4("span", { className: "text-lg md:text-xl font-normal text-gray-400 -mt-1", children: extension })
                        ]
                      }
                    ),
                    isActive && chordTones.length > 1 && !isEditing && /* @__PURE__ */ jsx4("div", { className: "flex items-center justify-center gap-1 md:gap-2 p-1 animate-fade-in", children: chordTones.filter((t) => t !== rootNote).map((tone, i) => /* @__PURE__ */ jsx4(
                      "span",
                      {
                        className: "text-xs md:text-sm font-semibold text-gray-300",
                        children: tone
                      },
                      `${tone}-${i}`
                    )) })
                  ]
                }
              ),
              isEditing && !isPlaying && suggestions.length > 0 && /* @__PURE__ */ jsx4("div", { className: "absolute top-full left-0 right-0 mt-2 z-10 bg-gray-800 border border-gray-600 rounded-md shadow-lg p-2 grid grid-cols-2 gap-2", children: suggestions.map((suggestion) => /* @__PURE__ */ jsx4(
                "button",
                {
                  onClick: () => {
                    onChordChange(index, suggestion);
                    setEditingIndex(null);
                  },
                  onMouseDown: (e) => e.preventDefault(),
                  className: "bg-gray-700 hover:bg-purple-600 text-white font-semibold py-2 px-1 rounded-md text-sm transition-colors duration-150",
                  children: suggestion
                },
                suggestion
              )) })
            ]
          },
          index
        );
      }) })
    }
  );
};
var ChordDisplay_default = React3.memo(ChordDisplay);

// components/DiatonicDegreeDisplay.tsx
import React4, { useMemo } from "react";
import { jsx as jsx5 } from "react/jsx-runtime";
var DiatonicDegreeDisplay = ({
  progression,
  musicKey,
  scale,
  currentChordIndex
}) => {
  const degrees = useMemo(() => {
    return progression.map((chord) => getRomanNumeral(chord, musicKey, scale));
  }, [progression, musicKey, scale]);
  const isRomanNumeral = (s) => /[ivIV]/.test(s);
  return /* @__PURE__ */ jsx5(
    Tooltip_default,
    {
      content: "Zeigt die Funktion jedes Akkords innerhalb der Tonart an (Stufentheorie). Lila Stufen sind diatonisch (leitereigen), graue Stufen mit gestricheltem Rand sind leiterfremd (geborgt).",
      position: "top",
      className: "w-full",
      children: /* @__PURE__ */ jsx5("div", { className: "grid grid-cols-4 lg:grid-cols-8 gap-2 text-center", "aria-label": "Diatonische Stufen", children: degrees.map((degree, index) => {
        const isActive = index === currentChordIndex;
        const isDiatonic = isRomanNumeral(degree);
        return /* @__PURE__ */ jsx5(
          "div",
          {
            className: `
                py-2 px-1 rounded-md text-sm font-bold
                transition-all duration-200 ease-in-out
                ${isActive ? "bg-purple-500 text-white scale-110 shadow-md" : isDiatonic ? "bg-gray-700/60 text-purple-300" : "bg-gray-800/50 text-gray-500 border border-dashed border-gray-600"}
                `,
            title: isDiatonic ? `${progression[index]} ist diatonisch` : `${progression[index]} ist nicht-diatonisch`,
            children: degree
          },
          index
        );
      }) })
    }
  );
};
var DiatonicDegreeDisplay_default = React4.memo(DiatonicDegreeDisplay);

// components/CircleOfFifths.tsx
import React5, { useMemo as useMemo2 } from "react";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var majorKeys = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
var minorKeys = ["Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "Bbm", "Fm", "Cm", "Gm", "Dm"];
var KEY_POSITIONS = {
  "C": 0,
  "B#": 0,
  "G": 1,
  "D": 2,
  "A": 3,
  "E": 4,
  "B": 5,
  "Cb": 5,
  "F#": 6,
  "Gb": 6,
  "Db": 7,
  "C#": 7,
  "Ab": 8,
  "G#": 8,
  "Eb": 9,
  "D#": 9,
  "Bb": 10,
  "A#": 10,
  "F": 11,
  "E#": 11
};
var NOTES_CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var NOTE_TO_INDEX2 = {
  "C": 0,
  "B#": 0,
  "C#": 1,
  "Db": 1,
  "D": 2,
  "D#": 3,
  "Eb": 3,
  "E": 4,
  "Fb": 4,
  "F": 5,
  "E#": 5,
  "F#": 6,
  "Gb": 6,
  "G": 7,
  "G#": 8,
  "Ab": 8,
  "A": 9,
  "A#": 10,
  "Bb": 10,
  "B": 11,
  "Cb": 11
};
function getChordTones(chord) {
  try {
    if (chord.toLowerCase() === "n.c." || chord.trim() === "") return [];
    const rootMatch = chord.match(/^[A-G][#b]?/);
    if (!rootMatch) return [];
    const root2 = rootMatch[0];
    const quality = chord.substring(root2.length);
    const rootIndex = NOTE_TO_INDEX2[root2];
    if (rootIndex === void 0) return [];
    const degrees = /* @__PURE__ */ new Map();
    degrees.set(1, 0);
    if (quality.includes("dim")) {
      degrees.set(3, 3);
    } else if (quality.includes("m") && !quality.includes("maj")) {
      degrees.set(3, 3);
    } else {
      degrees.set(3, 4);
    }
    if (quality.includes("dim") || quality.includes("b5")) {
      degrees.set(5, 6);
    } else if (quality.includes("aug") || quality.includes("+") || quality.includes("#5")) {
      degrees.set(5, 8);
    } else {
      degrees.set(5, 7);
    }
    if (quality.includes("sus4")) {
      degrees.delete(3);
      degrees.set(4, 5);
    } else if (quality.includes("sus2")) {
      degrees.delete(3);
      degrees.set(2, 2);
    }
    if (quality.includes("maj7") || quality.includes("M7")) {
      degrees.set(7, 11);
    } else if (quality.includes("dim7")) {
      degrees.set(7, 9);
    } else if (quality.includes("7")) {
      degrees.set(7, 10);
    }
    const has9 = quality.includes("9");
    const has11 = quality.includes("11");
    const has13 = quality.includes("13");
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
    if (quality.includes("6") && !has13) {
      degrees.set(6, 9);
    }
    const alterations = quality.match(/([#b]\d+)/g) || [];
    for (const alt of alterations) {
      switch (alt) {
        case "b5":
          degrees.set(5, 6);
          break;
        case "#5":
          degrees.set(5, 8);
          break;
        case "b9":
          degrees.set(9, 13);
          break;
        case "#9":
          degrees.set(9, 15);
          break;
        case "#11":
          degrees.set(11, 18);
          break;
        case "b13":
          degrees.set(13, 20);
          break;
      }
    }
    const tones = [];
    const seenNotes = /* @__PURE__ */ new Set();
    const degreeOrder = [1, 3, 5, 7, 2, 4, 6, 9, 11, 13];
    for (const degree of degreeOrder) {
      if (degrees.has(degree)) {
        const interval = degrees.get(degree);
        let type = "other";
        if (degree === 1) type = "root";
        else if (degree === 3) type = "third";
        else if (degree === 5) type = "fifth";
        else if (degree === 7) type = "seventh";
        const noteName = NOTES_CHROMATIC[(rootIndex + interval % 12) % 12];
        if (!seenNotes.has(noteName)) {
          tones.push({ name: noteName, type });
          seenNotes.add(noteName);
        }
      }
    }
    return tones;
  } catch (e) {
    console.warn(`Could not parse chord for tones: ${chord}`, e);
    return [];
  }
}
var CircleOfFifths = ({ progression, musicKey, scale, currentChordIndex }) => {
  const size = 600;
  const center = size / 2;
  const majorRadius = size * 0.42;
  const minorRadius = size * 0.3;
  const accidentalsRadius = size * 0.15;
  const accidentals = ["0", "1#", "2#", "3#", "4#", "5#", "6#", "5b", "4b", "3b", "2b", "1b"];
  const scaleNotes = useMemo2(() => {
    const rootIndex = NOTE_TO_INDEX2[musicKey];
    if (rootIndex === void 0) return [];
    const intervals = scale === "Major" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
    return intervals.map((interval) => {
      const noteIndex = (rootIndex + interval) % 12;
      return NOTES_CHROMATIC[noteIndex];
    });
  }, [musicKey, scale]);
  const scaleNoteRadius = majorRadius * 1.08;
  const scaleNotePoints = useMemo2(() => {
    return scaleNotes.map((noteName) => {
      const position = KEY_POSITIONS[noteName];
      if (position === void 0) return null;
      const angle = position / 12 * 2 * Math.PI - Math.PI / 2;
      const x = center + scaleNoteRadius * Math.cos(angle);
      const y = center + scaleNoteRadius * Math.sin(angle);
      const isTonic = noteName === musicKey;
      return { x, y, noteName, isTonic };
    }).filter((p) => p !== null);
  }, [scaleNotes, musicKey, center, scaleNoteRadius]);
  const chordPoints = useMemo2(() => {
    return progression.map((chord) => {
      if (!chord || chord.toLowerCase() === "n.c.") return null;
      const rootMatch = chord.match(/^[A-G][#b]?/);
      if (!rootMatch) return null;
      const root2 = rootMatch[0];
      const isMinor = chord.includes("m") && !chord.includes("maj");
      let positionRoot = root2;
      if (isMinor) {
        const rootIndex = NOTE_TO_INDEX2[root2];
        if (rootIndex !== void 0) {
          const relativeMajorIndex = (rootIndex + 3) % 12;
          positionRoot = NOTES_CHROMATIC[relativeMajorIndex];
        }
      }
      const position = KEY_POSITIONS[positionRoot];
      if (position === void 0) {
        return null;
      }
      const radius = isMinor ? minorRadius : majorRadius;
      const angle = position / 12 * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return { x, y, root: chord };
    }).filter((p) => p !== null);
  }, [progression, center, majorRadius, minorRadius]);
  const pathData = useMemo2(() => {
    return chordPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  }, [chordPoints]);
  const tonicPair = useMemo2(() => {
    if (scale === "Major") {
      return { major: musicKey, minor: `${getRelativeMinor(musicKey)}m` };
    } else {
      return { major: getRelativeMajor(musicKey), minor: `${musicKey}m` };
    }
  }, [musicKey, scale]);
  const activeChordPoint = currentChordIndex !== null ? chordPoints[currentChordIndex] : null;
  const activeChordTonesPoints = useMemo2(() => {
    if (currentChordIndex === null) return [];
    const activeChord = progression[currentChordIndex];
    if (!activeChord) return [];
    const tones = getChordTones(activeChord);
    const noteRadius = majorRadius * 1.15;
    return tones.map((tone) => {
      const position = KEY_POSITIONS[tone.name];
      if (position === void 0) return null;
      const angle = position / 12 * 2 * Math.PI - Math.PI / 2;
      const x = center + noteRadius * Math.cos(angle);
      const y = center + noteRadius * Math.sin(angle);
      return { x, y, tone };
    }).filter((p) => p !== null);
  }, [currentChordIndex, progression, center, majorRadius]);
  const renderKeys = (keys, radius, defaultClassName) => {
    const isMajorRing = !keys[0].includes("m");
    return keys.map((key, i) => {
      const angle = i / 12 * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const isTonic = key === tonicPair.major || key === tonicPair.minor;
      const isChord = progression.some((pChord) => {
        if (pChord === key) return true;
        if (pChord.startsWith(key)) {
          if (isMajorRing) {
            const nextChar = pChord[key.length];
            if (nextChar === "m" && !pChord.startsWith("maj", key.length)) {
              return false;
            }
          }
          return true;
        }
        return false;
      });
      let finalClassName = defaultClassName;
      if (isTonic) {
        finalClassName += " fill-yellow-300 scale-125 font-extrabold";
      } else if (isChord && !isTonic) {
        finalClassName += " fill-pink-400 font-bold";
      } else {
        finalClassName += " fill-gray-400";
      }
      return /* @__PURE__ */ jsx6("g", { transform: `translate(${x}, ${y})`, children: /* @__PURE__ */ jsx6(
        "text",
        {
          dy: "0.35em",
          textAnchor: "middle",
          className: `transition-all duration-300 ${finalClassName}`,
          children: key
        }
      ) }, key);
    });
  };
  return /* @__PURE__ */ jsxs5("div", { role: "region", "aria-labelledby": "cof-title", children: [
    /* @__PURE__ */ jsx6("h2", { id: "cof-title", className: "text-xl font-bold text-center pt-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600", children: "Progressions-Visualisierer" }),
    /* @__PURE__ */ jsx6("div", { className: "p-4", children: /* @__PURE__ */ jsxs5("svg", { viewBox: `0 0 ${size} ${size}`, className: "w-full h-auto", "aria-label": "Quintenzirkel-Diagramm, das die aktuelle Progression anzeigt", children: [
      /* @__PURE__ */ jsx6("circle", { cx: center, cy: center, r: majorRadius * 1.05, fill: "none", stroke: "#4a5568", strokeWidth: "1" }),
      /* @__PURE__ */ jsx6("circle", { cx: center, cy: center, r: minorRadius * 1.15, fill: "none", stroke: "#4a5568", strokeWidth: "1" }),
      /* @__PURE__ */ jsx6("g", { children: scaleNotePoints.map(({ x, y, noteName, isTonic }) => /* @__PURE__ */ jsxs5("g", { className: "transition-opacity duration-300", children: [
        /* @__PURE__ */ jsx6(
          "circle",
          {
            cx: x,
            cy: y,
            r: isTonic ? 18 : 14,
            fill: isTonic ? "rgba(250, 204, 21, 0.4)" : "rgba(107, 114, 128, 0.3)",
            stroke: isTonic ? "#FBBF24" : "#6B7280",
            strokeWidth: "1.5"
          }
        ),
        /* @__PURE__ */ jsx6(
          "text",
          {
            x,
            y,
            dy: "0.35em",
            textAnchor: "middle",
            className: `font-semibold pointer-events-none ${isTonic ? "fill-yellow-200 text-lg" : "fill-gray-300 text-base"}`,
            children: noteName
          }
        )
      ] }, `scale-note-${noteName}`)) }),
      /* @__PURE__ */ jsx6(
        "path",
        {
          d: pathData,
          fill: "none",
          stroke: "rgba(192, 132, 252, 0.5)",
          strokeWidth: "5",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          style: { transition: "d 0.3s ease" }
        }
      ),
      chordPoints.map((p, i) => /* @__PURE__ */ jsx6(
        "circle",
        {
          cx: p.x,
          cy: p.y,
          r: "6",
          fill: "rgba(192, 132, 252, 0.7)",
          stroke: "rgba(0,0,0,0.5)",
          strokeWidth: "1"
        },
        `${p.root}-${i}`
      )),
      activeChordPoint && /* @__PURE__ */ jsx6(
        "circle",
        {
          cx: activeChordPoint.x,
          cy: activeChordPoint.y,
          r: "12",
          fill: "rgba(255, 255, 255, 0.9)",
          stroke: "#c084fc",
          strokeWidth: "3",
          className: "pointer-events-none",
          children: /* @__PURE__ */ jsx6("animate", { attributeName: "r", values: "10;14;10", dur: "1s", repeatCount: "indefinite" })
        }
      ),
      renderKeys(majorKeys, majorRadius, "font-bold text-4xl"),
      renderKeys(minorKeys, minorRadius, "font-bold text-2xl"),
      renderKeys(accidentals, accidentalsRadius, "fill-gray-500 text-lg"),
      activeChordTonesPoints.map(({ x, y, tone }, index) => {
        const isRoot = tone.type === "root";
        const isThird = tone.type === "third";
        let color, colorRgba, radius, textClass, animationValues;
        if (isRoot) {
          color = "#4ade80";
          colorRgba = "rgba(74, 222, 128, 0.7)";
          radius = 16;
          textClass = "fill-white font-extrabold text-xl";
          animationValues = "15;17;15";
        } else if (isThird) {
          color = "#f87171";
          colorRgba = "rgba(248, 113, 113, 0.7)";
          radius = 14;
          textClass = "fill-white font-bold text-lg";
          animationValues = "13;15;13";
        } else {
          color = "#1ddaff";
          colorRgba = "rgba(29, 218, 255, 0.7)";
          radius = 12;
          textClass = "fill-white font-bold text-base";
          animationValues = "11;13;11";
        }
        return /* @__PURE__ */ jsxs5("g", { className: "pointer-events-none", children: [
          /* @__PURE__ */ jsx6(
            "circle",
            {
              cx: x,
              cy: y,
              r: radius,
              fill: colorRgba,
              stroke: color,
              strokeWidth: "2",
              children: /* @__PURE__ */ jsx6(
                "animate",
                {
                  attributeName: "r",
                  values: animationValues,
                  dur: "1.2s",
                  repeatCount: "indefinite",
                  begin: `${index * 0.1}s`
                }
              )
            }
          ),
          /* @__PURE__ */ jsx6(
            "text",
            {
              x,
              y,
              dy: "0.35em",
              textAnchor: "middle",
              className: textClass,
              children: tone.name
            }
          )
        ] }, `${tone.name}-${index}`);
      })
    ] }) }),
    /* @__PURE__ */ jsxs5("div", { className: "px-6 pb-4 text-base text-gray-400", children: [
      /* @__PURE__ */ jsx6("h3", { className: "font-bold text-lg text-gray-300 mb-2 text-center", children: "Legende" }),
      /* @__PURE__ */ jsxs5("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx6("div", { className: "w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-300 ring-2 ring-yellow-400/50" }),
          /* @__PURE__ */ jsx6("span", { children: "Grundton / Tonart" })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx6("div", { className: "w-4 h-4 rounded-full bg-pink-500" }),
          /* @__PURE__ */ jsx6("span", { children: "Akkord der Progression" })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx6("div", { className: "w-4 h-4 rounded-full bg-white border-2 border-purple-400" }),
          /* @__PURE__ */ jsx6("span", { children: "Aktueller Akkord" })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx6("div", { className: "w-4 h-4 rounded-full bg-gray-700 border border-gray-500" }),
          /* @__PURE__ */ jsx6("span", { children: "Ton der Tonleiter" })
        ] }),
        /* @__PURE__ */ jsx6("div", { className: "col-span-2 mt-2 pt-2 border-t border-gray-700/50" }),
        /* @__PURE__ */ jsxs5("div", { className: "flex items-start space-x-2 col-span-2", children: [
          /* @__PURE__ */ jsx6("div", { className: "w-4 h-4 rounded-full bg-green-400 flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxs5("div", { children: [
            /* @__PURE__ */ jsx6("span", { className: "font-semibold", children: "Grundton (des Akkords)" }),
            /* @__PURE__ */ jsx6("p", { className: "text-xs text-gray-500 leading-tight", children: "Der wichtigste Ton." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "flex items-start space-x-2 col-span-2", children: [
          /* @__PURE__ */ jsx6("div", { className: "w-4 h-4 rounded-full bg-red-400 flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxs5("div", { children: [
            /* @__PURE__ */ jsx6("span", { className: "font-semibold", children: "Die Terz" }),
            /* @__PURE__ */ jsx6("p", { className: "text-xs text-gray-500 leading-tight", children: "Bestimmt Dur/Moll." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "flex items-start space-x-2 col-span-2", children: [
          /* @__PURE__ */ jsx6("div", { className: "w-4 h-4 rounded-full bg-cyan-400 flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxs5("div", { children: [
            /* @__PURE__ */ jsx6("span", { className: "font-semibold", children: "Andere Akkordt\xF6ne" }),
            /* @__PURE__ */ jsx6("p", { className: "text-xs text-gray-500 leading-tight", children: "F\xE4rben den Sound." })
          ] })
        ] })
      ] })
    ] })
  ] });
};
var CircleOfFifths_default = React5.memo(CircleOfFifths);

// components/Tutorial.tsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
var Tutorial = ({ onClose }) => {
  const Key = ({ children }) => /* @__PURE__ */ jsx7("kbd", { className: "px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md", children });
  return /* @__PURE__ */ jsx7(
    "div",
    {
      className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "tutorial-title",
      children: /* @__PURE__ */ jsxs6("div", { className: "bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col", children: [
        /* @__PURE__ */ jsxs6("header", { className: "flex items-center justify-between p-4 border-b border-gray-700", children: [
          /* @__PURE__ */ jsx7("h2", { id: "tutorial-title", className: "text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600", children: "Willkommen beim Jam Buddy!" }),
          /* @__PURE__ */ jsx7(
            "button",
            {
              onClick: onClose,
              className: "text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700",
              "aria-label": "Schlie\xDFen",
              children: /* @__PURE__ */ jsx7("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24", stroke: "currentColor", children: /* @__PURE__ */ jsx7("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs6("main", { className: "p-6 overflow-y-auto text-gray-300 space-y-4", children: [
          /* @__PURE__ */ jsx7("p", { children: "Hier ist eine kurze Anleitung, wie du das Beste aus deinem Jam Buddy herausholst:" }),
          /* @__PURE__ */ jsxs6("div", { children: [
            /* @__PURE__ */ jsx7("h3", { className: "text-lg font-semibold text-purple-300 mt-2 mb-1", children: "1. Akkorde erstellen" }),
            /* @__PURE__ */ jsxs6("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "Presets:" }),
                ' W\xE4hle eine klassische Akkordfolge aus der Liste "Preset-Progressionen", um sofort loszulegen.'
              ] }),
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "Zufall:" }),
                ' Klicke auf "Zufall", um eine zuf\xE4llige Tonart und Preset-Kombination zu erhalten \u2013 perfekt f\xFCr neue Ideen!'
              ] }),
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "KI-Generator:" }),
                " Beschreibe eine Stimmung oder einen Stil und lass die KI eine passende Progression f\xFCr dich erstellen."
              ] }),
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "Manuell:" }),
                " Klicke direkt auf einen Akkord, um ihn selbst zu bearbeiten."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs6("div", { children: [
            /* @__PURE__ */ jsx7("h3", { className: "text-lg font-semibold text-purple-300 mt-2 mb-1", children: "2. Deinen Jam anpassen" }),
            /* @__PURE__ */ jsxs6("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "Tonart & Tonleiter:" }),
                " Lege die Grundlage f\xFCr deine Improvisation."
              ] }),
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "Tempo (BPM):" }),
                " Passe die Geschwindigkeit mit dem Schieberegler an."
              ] }),
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "Schlagzeug-Rhythmus & Synth-Sound:" }),
                " \xC4ndere den Rhythmus und den Klang der Begleitung nach deinem Geschmack."
              ] }),
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "Lautst\xE4rke:" }),
                " Mische Schlagzeug und Synth-Akkorde mit den Lautst\xE4rkereglern perfekt ab."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs6("div", { children: [
            /* @__PURE__ */ jsx7("h3", { className: "text-lg font-semibold text-purple-300 mt-2 mb-1", children: "3. Tastatursteuerung" }),
            /* @__PURE__ */ jsxs6("div", { className: "space-y-2 pl-2", children: [
              /* @__PURE__ */ jsx7("p", { className: "font-semibold", children: "Globale Steuerung:" }),
              /* @__PURE__ */ jsxs6("ul", { className: "list-disc list-inside space-y-1 pl-4 text-sm", children: [
                /* @__PURE__ */ jsxs6("li", { children: [
                  /* @__PURE__ */ jsx7(Key, { children: "Leertaste" }),
                  ": Start / Pause"
                ] }),
                /* @__PURE__ */ jsxs6("li", { children: [
                  /* @__PURE__ */ jsx7(Key, { children: "R" }),
                  ": Zuf\xE4llige Progression & Tonart"
                ] }),
                /* @__PURE__ */ jsxs6("li", { children: [
                  /* @__PURE__ */ jsx7(Key, { children: "H" }),
                  " oder ",
                  /* @__PURE__ */ jsx7(Key, { children: "?" }),
                  ": Diese Hilfe anzeigen"
                ] })
              ] }),
              /* @__PURE__ */ jsx7("p", { className: "font-semibold pt-2", children: "Akkordbearbeitung:" }),
              /* @__PURE__ */ jsxs6("ul", { className: "list-disc list-inside space-y-1 pl-4 text-sm", children: [
                /* @__PURE__ */ jsxs6("li", { children: [
                  /* @__PURE__ */ jsx7(Key, { children: "\u2190" }),
                  " / ",
                  /* @__PURE__ */ jsx7(Key, { children: "\u2192" }),
                  ": Zwischen Akkorden navigieren"
                ] }),
                /* @__PURE__ */ jsxs6("li", { children: [
                  /* @__PURE__ */ jsx7(Key, { children: "\u2191" }),
                  " / ",
                  /* @__PURE__ */ jsx7(Key, { children: "\u2193" }),
                  ": Durch Akkordvarianten wechseln (z.B. C \u2192 Cm \u2192 C7)"
                ] }),
                /* @__PURE__ */ jsxs6("li", { children: [
                  /* @__PURE__ */ jsx7(Key, { children: "Esc" }),
                  ": Akkordvorschl\xE4ge schlie\xDFen"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs6("div", { children: [
            /* @__PURE__ */ jsx7("h3", { className: "text-lg font-semibold text-purple-300 mt-4 mb-1", children: "4. Analysieren & Exportieren" }),
            /* @__PURE__ */ jsxs6("ul", { className: "list-disc list-inside space-y-2 pl-2", children: [
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "Progressions-Visualisierer:" }),
                " Sieh dir deine Akkorde auf dem Quintenzirkel an.",
                /* @__PURE__ */ jsxs6("ul", { className: "list-['-_'] list-inside space-y-1 pl-6 mt-2 text-sm text-gray-400", children: [
                  /* @__PURE__ */ jsxs6("li", { children: [
                    /* @__PURE__ */ jsx7("strong", { className: "text-yellow-300", children: "Gelb (pulsierend):" }),
                    " Markiert den Grundton \u2013 das tonale Zentrum deiner Tonart."
                  ] }),
                  /* @__PURE__ */ jsxs6("li", { children: [
                    /* @__PURE__ */ jsx7("strong", { className: "text-pink-400", children: "Pink:" }),
                    " Hebt alle Akkorde hervor, die Teil deiner aktuellen Progression sind."
                  ] }),
                  /* @__PURE__ */ jsxs6("li", { children: [
                    /* @__PURE__ */ jsx7("strong", { className: "text-white", children: "Wei\xDF (Spotlight):" }),
                    " Zeigt den Akkord, der gerade spielt."
                  ] }),
                  /* @__PURE__ */ jsxs6("li", { children: [
                    /* @__PURE__ */ jsx7("strong", { className: "text-cyan-400", children: "Cyan (kleine Kreise):" }),
                    " Zerlegt den aktiven Akkord in seine Noten."
                  ] }),
                  /* @__PURE__ */ jsxs6("li", { children: [
                    /* @__PURE__ */ jsx7("strong", { className: "text-red-400", children: "Rot (kleiner Kreis):" }),
                    " Hebt die Terz hervor \u2013 den wichtigsten Ton, der den Charakter des Akkords (Dur/Moll) bestimmt!"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "Speichern & Laden:" }),
                " Speichere deine Jam-Session als Datei und lade sie sp\xE4ter wieder."
              ] }),
              /* @__PURE__ */ jsxs6("li", { children: [
                /* @__PURE__ */ jsx7("strong", { children: "Exportieren:" }),
                " Lade deinen Track als MIDI-Datei herunter, um ihn in deiner DAW zu verwenden."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs6("div", { children: [
            /* @__PURE__ */ jsx7("h3", { className: "text-lg font-semibold text-yellow-300 mt-4 mb-1", children: "Hinweis f\xFCr Mobilger\xE4te" }),
            /* @__PURE__ */ jsx7("p", { className: "pl-2", children: "Stelle sicher, dass der Stumm-Schalter deines iPhones nicht aktiviert ist, da Web-Audio sonst stummgeschaltet wird." })
          ] })
        ] }),
        /* @__PURE__ */ jsx7("footer", { className: "p-4 border-t border-gray-700 flex justify-end", children: /* @__PURE__ */ jsx7(
          "button",
          {
            onClick: onClose,
            className: "px-6 py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors",
            children: "Verstanden!"
          }
        ) })
      ] })
    }
  );
};
var Tutorial_default = Tutorial;

// components/Loader.tsx
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
var Loader = ({ text = "Loading..." }) => {
  return /* @__PURE__ */ jsx8("div", { className: "absolute inset-0 bg-gray-800/80 flex items-center justify-center z-10 rounded-lg", children: /* @__PURE__ */ jsxs7("div", { className: "flex items-center space-x-2", children: [
    /* @__PURE__ */ jsx8("div", { className: "w-4 h-4 rounded-full animate-pulse bg-purple-400" }),
    /* @__PURE__ */ jsx8("div", { className: "w-4 h-4 rounded-full animate-pulse bg-purple-400", style: { animationDelay: "0.2s" } }),
    /* @__PURE__ */ jsx8("div", { className: "w-4 h-4 rounded-full animate-pulse bg-purple-400", style: { animationDelay: "0.4s" } }),
    /* @__PURE__ */ jsx8("span", { className: "text-lg font-semibold ml-2", children: text })
  ] }) });
};
var Loader_default = Loader;

// components/AiGenerator.tsx
import { useState as useState3 } from "react";
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
var AiGenerator = ({ onClose, onGenerate }) => {
  const [prompt2, setPrompt] = useState3("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt2.trim()) {
      onGenerate(prompt2.trim());
    }
  };
  const examplePrompts = [
    "Trauriger Blues in A-Moll",
    "Fr\xF6hlicher Funk-Groove zum Tanzen",
    "Epische Rock-Ballade",
    "Vertr\xE4umter Lo-Fi-Beat",
    "Spannungsgeladener Soundtrack"
  ];
  const handleExampleClick = (example) => {
    setPrompt(example);
  };
  return /* @__PURE__ */ jsx9(
    "div",
    {
      className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "ai-generator-title",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs8(
        "div",
        {
          className: "bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-lg w-full",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs8("header", { className: "flex items-center justify-between p-4 border-b border-gray-700", children: [
              /* @__PURE__ */ jsx9("h2", { id: "ai-generator-title", className: "text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500", children: "Akkorde mit KI erstellen" }),
              /* @__PURE__ */ jsx9(
                "button",
                {
                  onClick: onClose,
                  className: "text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700",
                  "aria-label": "Schlie\xDFen",
                  children: /* @__PURE__ */ jsx9(IconX, { className: "h-5 w-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs8("form", { onSubmit: handleSubmit, children: [
              /* @__PURE__ */ jsxs8("main", { className: "p-6 text-gray-300 space-y-4", children: [
                /* @__PURE__ */ jsxs8("div", { children: [
                  /* @__PURE__ */ jsx9("label", { htmlFor: "ai-prompt", className: "block text-sm font-medium text-gray-400 mb-2", children: "Beschreibe die Stimmung, den Stil oder das Genre, das du m\xF6chtest:" }),
                  /* @__PURE__ */ jsx9(
                    "textarea",
                    {
                      id: "ai-prompt",
                      value: prompt2,
                      onChange: (e) => setPrompt(e.target.value),
                      placeholder: "z.B. eine entspannte Jazz-Progression...",
                      rows: 3,
                      className: "w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500",
                      autoFocus: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs8("div", { children: [
                  /* @__PURE__ */ jsx9("p", { className: "text-sm text-gray-400 mb-2", children: "Oder probiere ein Beispiel:" }),
                  /* @__PURE__ */ jsx9("div", { className: "flex flex-wrap gap-2", children: examplePrompts.map((p) => /* @__PURE__ */ jsx9("button", { type: "button", onClick: () => handleExampleClick(p), className: "text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors", children: p }, p)) })
                ] })
              ] }),
              /* @__PURE__ */ jsx9("footer", { className: "p-4 border-t border-gray-700 flex justify-end", children: /* @__PURE__ */ jsx9(
                "button",
                {
                  type: "submit",
                  disabled: !prompt2.trim(),
                  className: "px-6 py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed",
                  children: "Generieren"
                }
              ) })
            ] })
          ]
        }
      )
    }
  );
};
var AiGenerator_default = AiGenerator;

// components/DrumPatternEditor.tsx
import React7, { useState as useState4, useEffect as useEffect2 } from "react";
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
var DRUM_INSTRUMENTS = ["kick", "snare", "hihat"];
var DrumPatternEditor = ({ onClose, onSave, onDelete, existingPattern, allPatterns }) => {
  const [pattern, setPattern] = useState4(
    () => existingPattern?.pattern || Array(8).fill(null).map(() => ({}))
  );
  const [name, setName] = useState4(existingPattern?.name || "");
  const [nameError, setNameError] = useState4("");
  useEffect2(() => {
    if (existingPattern) {
      setName(existingPattern.name);
      setPattern(JSON.parse(JSON.stringify(existingPattern.pattern)));
    }
  }, [existingPattern]);
  const toggleStep = (stepIndex, instrument) => {
    const newPattern = [...pattern];
    const currentStep = { ...newPattern[stepIndex] || {} };
    currentStep[instrument] = !currentStep[instrument];
    if (!currentStep.kick && !currentStep.snare && !currentStep.hihat) {
      newPattern[stepIndex] = null;
    } else {
      newPattern[stepIndex] = currentStep;
    }
    setPattern(newPattern);
  };
  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Der Name darf nicht leer sein.");
      return;
    }
    const isNameTaken = allPatterns.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase() && p.name !== existingPattern?.name);
    if (isNameTaken) {
      setNameError("Dieser Name wird bereits verwendet.");
      return;
    }
    onSave(trimmedName, pattern, existingPattern?.name);
  };
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (nameError) {
      setNameError("");
    }
  };
  const handleDelete = () => {
    if (existingPattern) {
      onDelete(existingPattern.name);
    }
  };
  return /* @__PURE__ */ jsx10(
    "div",
    {
      className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "drum-editor-title",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs9(
        "div",
        {
          className: "bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs9("header", { className: "flex items-center justify-between p-4 border-b border-gray-700", children: [
              /* @__PURE__ */ jsx10("h2", { id: "drum-editor-title", className: "text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500", children: existingPattern ? "Drum-Pattern bearbeiten" : "Neues Drum-Pattern erstellen" }),
              /* @__PURE__ */ jsx10(
                "button",
                {
                  onClick: onClose,
                  className: "text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700",
                  "aria-label": "Schlie\xDFen",
                  children: /* @__PURE__ */ jsx10(IconX, { className: "h-5 w-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs9("main", { className: "p-6 text-gray-300 space-y-4", children: [
              /* @__PURE__ */ jsxs9("div", { children: [
                /* @__PURE__ */ jsx10("label", { htmlFor: "pattern-name", className: "block text-sm font-medium text-gray-400 mb-1", children: "Pattern-Name" }),
                /* @__PURE__ */ jsx10(
                  "input",
                  {
                    type: "text",
                    id: "pattern-name",
                    value: name,
                    onChange: handleNameChange,
                    placeholder: "z.B. Mein cooler Beat",
                    className: `w-full bg-gray-900 border ${nameError ? "border-red-500" : "border-gray-600"} rounded-md p-2 text-white focus:outline-none focus:ring-2 ${nameError ? "focus:ring-red-500" : "focus:ring-purple-500"}`
                  }
                ),
                nameError && /* @__PURE__ */ jsx10("p", { className: "text-red-400 text-xs mt-1", children: nameError })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-8 gap-1 md:gap-2", children: [
                DRUM_INSTRUMENTS.map((instrument) => /* @__PURE__ */ jsx10(React7.Fragment, { children: Array.from({ length: 8 }).map((_, stepIndex) => {
                  const isActive = pattern[stepIndex]?.[instrument] ?? false;
                  return /* @__PURE__ */ jsx10(
                    "button",
                    {
                      onClick: () => toggleStep(stepIndex, instrument),
                      "aria-label": `${instrument} step ${stepIndex + 1}`,
                      "aria-pressed": isActive,
                      className: `w-full h-12 md:h-16 rounded-md transition-all duration-150 transform
                                            ${isActive ? "bg-purple-500 shadow-lg scale-105" : "bg-gray-700 hover:bg-gray-600"}
                                            ${stepIndex % 4 === 0 ? "border-l-2 border-gray-500" : ""}
                                        `,
                      children: /* @__PURE__ */ jsx10("span", { className: "sr-only", children: instrument })
                    },
                    `${instrument}-${stepIndex}`
                  );
                }) }, instrument)),
                DRUM_INSTRUMENTS.map((instrument) => /* @__PURE__ */ jsx10("p", { className: "col-span-8 -mt-2 text-left text-xs text-gray-400 capitalize pl-1", children: instrument }, `label-${instrument}`))
              ] })
            ] }),
            /* @__PURE__ */ jsxs9("footer", { className: "p-4 border-t border-gray-700 flex justify-between items-center", children: [
              /* @__PURE__ */ jsx10("div", { children: existingPattern && /* @__PURE__ */ jsxs9(
                "button",
                {
                  onClick: handleDelete,
                  className: "px-4 py-2 rounded-lg font-semibold text-white bg-red-600/80 hover:bg-red-600 transition-colors text-sm flex items-center",
                  children: [
                    /* @__PURE__ */ jsx10(IconTrash, { className: "h-4 w-4 mr-2" }),
                    "L\xF6schen"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxs9(
                "button",
                {
                  onClick: handleSave,
                  className: "px-6 py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center",
                  children: [
                    /* @__PURE__ */ jsx10(IconSave, { className: "h-5 w-5 mr-2" }),
                    "Speichern"
                  ]
                }
              )
            ] })
          ]
        }
      )
    }
  );
};
var DrumPatternEditor_default = DrumPatternEditor;

// services/drumPatternService.ts
var STORAGE_KEY = "guitarJamBuddy_customDrumPatterns";
function saveCustomPatterns(patterns) {
  try {
    const jsonString = JSON.stringify(patterns);
    localStorage.setItem(STORAGE_KEY, jsonString);
  } catch (error) {
    console.error("Fehler beim Speichern der benutzerdefinierten Drum-Patterns:", error);
  }
}
function loadCustomPatterns() {
  try {
    const jsonString = localStorage.getItem(STORAGE_KEY);
    if (!jsonString) {
      return [];
    }
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error("Fehler beim Laden der benutzerdefinierten Drum-Patterns:", error);
    return [];
  }
}

// services/synthPresetService.ts
var STORAGE_KEY2 = "jamBuddy_customSynthPresets";
function saveCustomSynthPresets(presets) {
  try {
    const jsonString = JSON.stringify(presets);
    localStorage.setItem(STORAGE_KEY2, jsonString);
  } catch (error) {
    console.error("Error saving custom synth presets:", error);
  }
}
function loadCustomSynthPresets() {
  try {
    const jsonString = localStorage.getItem(STORAGE_KEY2);
    if (!jsonString) {
      return [];
    }
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error("Error loading custom synth presets:", error);
    return [];
  }
}

// hooks/useWakeLock.ts
import { useEffect as useEffect3, useRef as useRef4 } from "react";
var useWakeLock = (enabled) => {
  const wakeLockRef = useRef4(null);
  useEffect3(() => {
    const requestLock = async () => {
      if (!("wakeLock" in navigator)) {
        console.warn("Wake Lock API not supported in this browser.");
        return;
      }
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        console.log("Wake Lock acquired");
      } catch (err) {
        console.error(`Wake Lock error: ${err.name}, ${err.message}`);
      }
    };
    const releaseLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log("Wake Lock released");
        } catch (err) {
          console.error(`Wake Lock release error: ${err.name}, ${err.message}`);
        }
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && enabled) {
        requestLock();
      }
    };
    if (enabled) {
      requestLock();
      document.addEventListener("visibilitychange", handleVisibilityChange);
    } else {
      releaseLock();
    }
    return () => {
      releaseLock();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);
};

// App.tsx
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
var defaultSynthConfig = {
  oscillator: AudioServiceClass.synthPresets["Sawtooth"].oscillator,
  envelope: AudioServiceClass.synthPresets["Sawtooth"].envelope,
  filter: {
    cutoff: 8e3,
    resonance: 1
  }
};
var App = () => {
  const [musicKey, setMusicKey] = useState5("C");
  const [scale, setScale] = useState5("Major");
  const [drumPattern, setDrumPattern] = useState5("Pop Rock");
  const [bpm, setBpm] = useState5(80);
  const [progression, setProgression] = useState5([]);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState5(0);
  const [currentChordIndex, setCurrentChordIndex] = useState5(null);
  const [error, setError] = useState5(null);
  const [retryAction, setRetryAction] = useState5(null);
  const [isPlaying, setIsPlaying] = useState5(false);
  const [isLoading, setIsLoading] = useState5(false);
  const [loadingText, setLoadingText] = useState5("");
  const [trainingMode, setTrainingMode] = useState5(false);
  const [playbackPhase, setPlaybackPhase] = useState5("idle");
  const [countInBeat, setCountInBeat] = useState5(null);
  const [kickVolume, setKickVolume] = useState5(-10);
  const [snareVolume, setSnareVolume] = useState5(-10);
  const [hihatVolume, setHihatVolume] = useState5(-15);
  const [synthVolume, setSynthVolume] = useState5(-15);
  const [bassVolume, setBassVolume] = useState5(-10);
  const [kickPan, setKickPan] = useState5(0);
  const [snarePan, setSnarePan] = useState5(0);
  const [hihatPan, setHihatPan] = useState5(0);
  const [synthPan, setSynthPan] = useState5(0);
  const [bassPan, setBassPan] = useState5(0);
  const [synthPresetName, setSynthPresetName] = useState5("Sawtooth");
  const [synthConfig, setSynthConfig] = useState5(defaultSynthConfig);
  const [customSynthPresets, setCustomSynthPresets] = useState5([]);
  const [showTutorial, setShowTutorial] = useState5(false);
  const [showAiGenerator, setShowAiGenerator] = useState5(false);
  const [isOnline, setIsOnline] = useState5(() => navigator.onLine);
  const [audioState, setAudioState] = useState5("uninitialized");
  useWakeLock(audioState === "ready");
  const [isRestored, setIsRestored] = useState5(false);
  const [useInversions, setUseInversions] = useState5(true);
  const [synthOctave, setSynthOctave] = useState5(0);
  const [voicingVariation, setVoicingVariation] = useState5(true);
  const [spreadVoicing, setSpreadVoicing] = useState5(true);
  const [harmonyInterval, setHarmonyInterval] = useState5(null);
  const [harmonyVolume, setHarmonyVolume] = useState5(-20);
  const [harmonyPan, setHarmonyPan] = useState5(0);
  const [arpeggiatorEnabled, setArpeggiatorEnabled] = useState5(false);
  const [arpeggiatorRate, setArpeggiatorRate] = useState5("16n");
  const [arpeggiatorDirection, setArpeggiatorDirection] = useState5("up");
  const [arpeggiatorGate, setArpeggiatorGate] = useState5(0.8);
  const [customDrumPatterns, setCustomDrumPatterns] = useState5([]);
  const [showDrumEditor, setShowDrumEditor] = useState5(false);
  const [editingDrumPattern, setEditingDrumPattern] = useState5(null);
  const [discoveredFeatures, setDiscoveredFeatures] = useState5({});
  useEffect4(() => {
    setCustomDrumPatterns(loadCustomPatterns());
    setCustomSynthPresets(loadCustomSynthPresets());
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    try {
      const storedFeatures = localStorage.getItem("discoveredFeatures");
      if (storedFeatures) {
        setDiscoveredFeatures(JSON.parse(storedFeatures));
      }
    } catch (e) {
      console.error("Failed to load discovered features:", e);
    }
    const savedState = loadAutosave();
    if (savedState) {
      setBpm(savedState.bpm);
      setMusicKey(savedState.musicKey);
      setScale(savedState.scale);
      setProgression(savedState.progression);
      setDrumPattern(savedState.drumPattern);
      setKickVolume(savedState.kickVolume);
      setSnareVolume(savedState.snareVolume);
      setHihatVolume(savedState.hihatVolume);
      setSynthVolume(savedState.synthVolume);
      setBassVolume(savedState.bassVolume);
      setKickPan(savedState.kickPan);
      setSnarePan(savedState.snarePan);
      setHihatPan(savedState.hihatPan);
      setSynthPan(savedState.synthPan);
      setBassPan(savedState.bassPan);
      setSelectedPresetIndex(savedState.selectedPresetIndex);
      setSynthPresetName(savedState.synthPresetName);
      setSynthConfig(savedState.synthConfig);
      setUseInversions(savedState.useInversions);
      setSynthOctave(savedState.synthOctave);
      setVoicingVariation(savedState.voicingVariation);
      setSpreadVoicing(savedState.spreadVoicing);
      setHarmonyInterval(savedState.harmonyInterval);
      setHarmonyVolume(savedState.harmonyVolume);
      setHarmonyPan(savedState.harmonyPan);
      setArpeggiatorEnabled(savedState.arpeggiatorEnabled);
      setArpeggiatorRate(savedState.arpeggiatorRate);
      setArpeggiatorDirection(savedState.arpeggiatorDirection);
      setArpeggiatorGate(savedState.arpeggiatorGate);
    } else {
      const preset = PRESET_PROGRESSIONS[0];
      if (preset) {
        const newProgression = transposeProgression("C", "Major", preset.roman);
        setProgression(newProgression);
      }
    }
    setIsRestored(true);
  }, []);
  const handleFeatureDiscovered = useCallback((featureName) => {
    setDiscoveredFeatures((prev) => {
      if (prev[featureName]) return prev;
      const newFeatures = { ...prev, [featureName]: true };
      try {
        localStorage.setItem("discoveredFeatures", JSON.stringify(newFeatures));
      } catch (e) {
        console.error("Failed to save discovered features:", e);
      }
      return newFeatures;
    });
  }, []);
  useEffect4(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("hasSeenTutorial", "true");
  };
  const clearError = () => {
    setError(null);
    setRetryAction(null);
  };
  useEffect4(() => {
    if (!isRestored) return;
    if (selectedPresetIndex > -1) {
      const preset = PRESET_PROGRESSIONS[selectedPresetIndex];
      if (preset) {
        const newProgression = transposeProgression(musicKey, scale, preset.roman);
        setProgression(newProgression);
      }
    }
  }, [selectedPresetIndex, musicKey, scale, isRestored]);
  const getCurrentJamState = useCallback(() => ({
    progression,
    bpm,
    musicKey,
    scale,
    drumPattern,
    kickVolume,
    snareVolume,
    hihatVolume,
    kickPan,
    snarePan,
    hihatPan,
    synthVolume,
    bassVolume,
    synthPan,
    bassPan,
    selectedPresetIndex,
    synthPresetName,
    synthConfig,
    customSynthPresets,
    useInversions,
    synthOctave,
    voicingVariation,
    spreadVoicing,
    harmonyInterval,
    harmonyVolume,
    harmonyPan,
    arpeggiatorEnabled,
    arpeggiatorRate,
    arpeggiatorDirection,
    arpeggiatorGate,
    customDrumPatterns
  }), [
    progression,
    bpm,
    musicKey,
    scale,
    drumPattern,
    kickVolume,
    snareVolume,
    hihatVolume,
    kickPan,
    snarePan,
    hihatPan,
    synthVolume,
    bassVolume,
    synthPan,
    bassPan,
    selectedPresetIndex,
    synthPresetName,
    synthConfig,
    customSynthPresets,
    useInversions,
    synthOctave,
    voicingVariation,
    spreadVoicing,
    harmonyInterval,
    harmonyVolume,
    harmonyPan,
    arpeggiatorEnabled,
    arpeggiatorRate,
    arpeggiatorDirection,
    arpeggiatorGate,
    customDrumPatterns
  ]);
  useEffect4(() => {
    if (!isRestored) return;
    const timeoutId = setTimeout(() => {
      saveAutosave(getCurrentJamState());
    }, 1e3);
    return () => clearTimeout(timeoutId);
  }, [getCurrentJamState, isRestored]);
  const handleRandomize = useCallback(() => {
    if (isPlaying) {
      handlePlayToggle();
    }
    const randomKeyIndex = Math.floor(Math.random() * MUSIC_KEYS.length);
    const randomPresetIndex = Math.floor(Math.random() * PRESET_PROGRESSIONS.length);
    const selectedPreset = PRESET_PROGRESSIONS[randomPresetIndex];
    const hasMinorTonic = selectedPreset.roman.some(
      (numeral) => numeral.startsWith("i") && !["ii", "iii", "iv", "vi", "vii"].some((n) => numeral.startsWith(n))
    );
    const newScale = hasMinorTonic ? "Minor" : "Major";
    setMusicKey(MUSIC_KEYS[randomKeyIndex]);
    setScale(newScale);
    setSelectedPresetIndex(randomPresetIndex);
  }, [isPlaying]);
  const resolveDrumPattern = useCallback((patternName) => {
    if (DRUM_PATTERNS.includes(patternName)) {
      return AudioServiceClass.drumPatterns[patternName];
    }
    const customPattern = customDrumPatterns.find((p) => p.name === patternName);
    return customPattern ? customPattern.pattern : AudioServiceClass.drumPatterns["Pop Rock"];
  }, [customDrumPatterns]);
  const handleInitializeAudio = async () => {
    if (audioState === "ready" || audioState === "initializing") return;
    setAudioState("initializing");
    setLoadingText("Audio wird initialisiert...");
    try {
      await audioService.init();
      setAudioState("ready");
    } catch (err) {
      setError(`Audio-Engine konnte nicht gestartet werden. Bitte lade die Seite neu. Fehler: ${err.message}`);
      setAudioState("error");
    }
  };
  useEffect4(() => {
    if (audioState !== "ready") return;
    audioService.setBpm(bpm);
    audioService.setKickVolume(kickVolume);
    audioService.setSnareVolume(snareVolume);
    audioService.setHihatVolume(hihatVolume);
    audioService.setSynthVolume(synthVolume);
    audioService.setBassVolume(bassVolume);
    audioService.setKickPan(kickPan);
    audioService.setSnarePan(snarePan);
    audioService.setHihatPan(hihatPan);
    audioService.setSynthPan(synthPan);
    audioService.setBassPan(bassPan);
    audioService.applySynthConfig(synthConfig);
    audioService.setUseInversions(useInversions);
    audioService.setSynthOctave(synthOctave);
    audioService.setVoicingVariation(voicingVariation);
    audioService.setSpreadVoicing(spreadVoicing);
    audioService.setHarmonyInterval(harmonyInterval);
    audioService.setHarmonyVolume(harmonyVolume);
    audioService.setHarmonyPan(harmonyPan);
    audioService.setArpeggiatorEnabled(arpeggiatorEnabled);
    audioService.setArpeggiatorRate(arpeggiatorRate);
    audioService.setArpeggiatorDirection(arpeggiatorDirection);
    audioService.setArpeggiatorGate(arpeggiatorGate);
  }, [
    audioState,
    bpm,
    kickVolume,
    snareVolume,
    hihatVolume,
    synthVolume,
    bassVolume,
    kickPan,
    snarePan,
    hihatPan,
    synthPan,
    bassPan,
    synthConfig,
    useInversions,
    synthOctave,
    voicingVariation,
    spreadVoicing,
    harmonyInterval,
    harmonyVolume,
    harmonyPan,
    arpeggiatorEnabled,
    arpeggiatorRate,
    arpeggiatorDirection,
    arpeggiatorGate
  ]);
  const toggleStandardPlayback = useCallback(async () => {
    if (!isPlaying) {
      if (progression.length > 0) {
        const patternData = resolveDrumPattern(drumPattern);
        audioService.start(progression, patternData, setCurrentChordIndex);
        setIsPlaying(true);
      }
    } else {
      audioService.stop();
      setCurrentChordIndex(null);
      setIsPlaying(false);
    }
  }, [isPlaying, progression, drumPattern, resolveDrumPattern]);
  const handlePlayToggle = useCallback(async () => {
    if (audioState !== "ready") return;
    if (progression.length === 0) return;
    if (isPlaying) {
      audioService.stop();
      setIsPlaying(false);
      setPlaybackPhase("idle");
      setCountInBeat(null);
      setCurrentChordIndex(null);
      return;
    }
    if (trainingMode) {
      setIsPlaying(true);
      runTrainingStep();
    } else {
      toggleStandardPlayback();
    }
  }, [audioState, isPlaying, progression, trainingMode, toggleStandardPlayback]);
  const runTrainingStep = async () => {
    setPlaybackPhase("counting-in");
    setCurrentChordIndex(null);
    let beat = 1;
    setCountInBeat(beat);
    const interval = setInterval(() => {
      beat++;
      if (beat <= 4) setCountInBeat(beat);
    }, 6e4 / bpm);
    await audioService.playCountIn();
    clearInterval(interval);
    setCountInBeat(null);
    setPlaybackPhase("playing");
    const patternData = resolveDrumPattern(drumPattern);
    audioService.start(
      progression,
      patternData,
      setCurrentChordIndex,
      2,
      // Loop count
      () => {
        handleTrainingReset();
      }
    );
  };
  const handleTrainingReset = async () => {
    setPlaybackPhase("resetting");
    setCurrentChordIndex(null);
    try {
      await audioService.reset();
      if (audioState === "ready") {
        audioService.setBpm(bpm);
        audioService.setKickVolume(kickVolume);
        audioService.setSnareVolume(snareVolume);
        audioService.setHihatVolume(hihatVolume);
        audioService.setSynthVolume(synthVolume);
        audioService.setBassVolume(bassVolume);
        audioService.applySynthConfig(synthConfig);
        audioService.setUseInversions(useInversions);
        audioService.setSynthOctave(synthOctave);
        audioService.setVoicingVariation(voicingVariation);
        audioService.setSpreadVoicing(spreadVoicing);
        audioService.setHarmonyInterval(harmonyInterval);
        audioService.setHarmonyVolume(harmonyVolume);
        audioService.setHarmonyPan(harmonyPan);
        audioService.setArpeggiatorEnabled(arpeggiatorEnabled);
        audioService.setArpeggiatorRate(arpeggiatorRate);
        audioService.setArpeggiatorDirection(arpeggiatorDirection);
        audioService.setArpeggiatorGate(arpeggiatorGate);
        audioService.setKickPan(kickPan);
        audioService.setSnarePan(snarePan);
        audioService.setHihatPan(hihatPan);
        audioService.setSynthPan(synthPan);
        audioService.setBassPan(bassPan);
      }
    } catch (e) {
      console.error("Reset failed:", e);
    }
    setTimeout(() => {
      if (isPlayingRef.current) {
        runTrainingStep();
      } else {
        setPlaybackPhase("idle");
      }
    }, 500);
  };
  const isPlayingRef = useRef5(isPlaying);
  useEffect4(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  const handleReset = useCallback(async () => {
    setIsPlaying(false);
    setPlaybackPhase("idle");
    setCurrentChordIndex(null);
    setLoadingText("Audio-Engine wird komplett neu geladen...");
    setIsLoading(true);
    try {
      await audioService.reset();
      setAudioState("ready");
      audioService.setBpm(bpm);
      audioService.setKickVolume(kickVolume);
      audioService.setSnareVolume(snareVolume);
      audioService.setHihatVolume(hihatVolume);
      audioService.setSynthVolume(synthVolume);
      audioService.setBassVolume(bassVolume);
      audioService.applySynthConfig(synthConfig);
      audioService.setUseInversions(useInversions);
      audioService.setSynthOctave(synthOctave);
      audioService.setVoicingVariation(voicingVariation);
      audioService.setSpreadVoicing(spreadVoicing);
      audioService.setHarmonyInterval(harmonyInterval);
      audioService.setHarmonyVolume(harmonyVolume);
      audioService.setHarmonyPan(harmonyPan);
      audioService.setArpeggiatorEnabled(arpeggiatorEnabled);
      audioService.setArpeggiatorRate(arpeggiatorRate);
      audioService.setArpeggiatorDirection(arpeggiatorDirection);
      audioService.setArpeggiatorGate(arpeggiatorGate);
      audioService.setKickPan(kickPan);
      audioService.setSnarePan(snarePan);
      audioService.setHihatPan(hihatPan);
      audioService.setSynthPan(synthPan);
      audioService.setBassPan(bassPan);
      clearError();
    } catch (err) {
      setError(`Fehler beim Zur\xFCcksetzen der Audio-Engine: ${err.message}`);
      setAudioState("error");
    } finally {
      setIsLoading(false);
    }
  }, [
    bpm,
    kickVolume,
    snareVolume,
    hihatVolume,
    synthVolume,
    bassVolume,
    synthConfig,
    useInversions,
    synthOctave,
    voicingVariation,
    spreadVoicing,
    harmonyInterval,
    harmonyVolume,
    harmonyPan,
    arpeggiatorEnabled,
    arpeggiatorRate,
    arpeggiatorDirection,
    arpeggiatorGate,
    kickPan,
    snarePan,
    hihatPan,
    synthPan,
    bassPan
  ]);
  useEffect4(() => {
    if (isPlaying && trainingMode && playbackPhase === "playing") {
    } else if (isPlaying && !trainingMode) {
    }
  }, [isPlaying, trainingMode, playbackPhase]);
  const handleGenerateWithAi = useCallback(async (prompt2) => {
    if (isPlaying) {
      handlePlayToggle();
    }
    setIsLoading(true);
    setLoadingText("KI generiert Progression...");
    clearError();
    try {
      const result = await generateProgression(prompt2);
      setMusicKey(result.key);
      setScale(result.scale);
      setProgression(result.progression);
      setSelectedPresetIndex(-1);
    } catch (err) {
      setError(`KI-Fehler: ${err.message}`);
      setRetryAction(() => () => handleGenerateWithAi(prompt2));
    } finally {
      setIsLoading(false);
      setShowAiGenerator(false);
    }
  }, [isPlaying, handlePlayToggle]);
  const handleRetry = async () => {
    if (retryAction) {
      await retryAction();
    }
  };
  useEffect4(() => {
    const handleKeyDown = (e) => {
      if (audioState !== "ready") return;
      const target = e.target;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) {
        if (e.code === "Space" && target.tagName !== "INPUT") {
        } else {
          return;
        }
      }
      if (e.code === "Space") {
        e.preventDefault();
        handlePlayToggle();
      } else if (e.key.toLowerCase() === "r" && !isPlaying) {
        e.preventDefault();
        handleRandomize();
      } else if (e.key.toLowerCase() === "h" || e.key === "?") {
        e.preventDefault();
        setShowTutorial((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayToggle, handleRandomize, isPlaying, audioState]);
  const handleChordChange = (index, newChord) => {
    const newProgression = [...progression];
    newProgression[index] = newChord;
    setProgression(newProgression);
    setSelectedPresetIndex(-1);
  };
  const handleKeyGroupChange = (majorKey) => {
    let currentScale = scale;
    if (selectedPresetIndex > -1) {
      const preset = PRESET_PROGRESSIONS[selectedPresetIndex];
      if (preset) {
        const hasMinorTonic = preset.roman.some((numeral) => numeral.startsWith("i"));
        currentScale = hasMinorTonic ? "Minor" : "Major";
      }
    } else {
      if (progression.length > 0) {
        const firstChord = progression[0];
        if (firstChord.includes("m") && !firstChord.includes("maj")) {
          currentScale = "Minor";
        } else {
          currentScale = "Major";
        }
      }
    }
    if (currentScale === "Minor") {
      const minorKey = getRelativeMinor(majorKey);
      setMusicKey(minorKey);
      setScale("Minor");
    } else {
      setMusicKey(majorKey);
      setScale("Major");
    }
  };
  const handleSave = () => {
    try {
      saveJam(getCurrentJamState());
      clearError();
    } catch (err) {
      setError(`Jam konnte nicht gespeichert werden: ${err.message}`);
    }
  };
  const handleLoad = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const loadedState = await loadJam(file);
      setProgression(loadedState.progression);
      setBpm(loadedState.bpm);
      setMusicKey(loadedState.musicKey);
      setScale(loadedState.scale);
      setDrumPattern(loadedState.drumPattern);
      setKickVolume(loadedState.kickVolume);
      setSnareVolume(loadedState.snareVolume);
      setHihatVolume(loadedState.hihatVolume);
      setSynthVolume(loadedState.synthVolume);
      setBassVolume(loadedState.bassVolume);
      setKickPan(loadedState.kickPan);
      setSnarePan(loadedState.snarePan);
      setHihatPan(loadedState.hihatPan);
      setSynthPan(loadedState.synthPan);
      setBassPan(loadedState.bassPan);
      setSelectedPresetIndex(loadedState.selectedPresetIndex);
      setSynthPresetName(loadedState.synthPresetName);
      setSynthConfig(loadedState.synthConfig);
      setCustomSynthPresets(loadedState.customSynthPresets);
      saveCustomSynthPresets(loadedState.customSynthPresets);
      setUseInversions(loadedState.useInversions);
      setSynthOctave(loadedState.synthOctave);
      setVoicingVariation(loadedState.voicingVariation);
      setSpreadVoicing(loadedState.spreadVoicing);
      setHarmonyInterval(loadedState.harmonyInterval);
      setHarmonyVolume(loadedState.harmonyVolume);
      setHarmonyPan(loadedState.harmonyPan);
      setArpeggiatorEnabled(loadedState.arpeggiatorEnabled);
      setArpeggiatorRate(loadedState.arpeggiatorRate);
      setArpeggiatorDirection(loadedState.arpeggiatorDirection);
      setArpeggiatorGate(loadedState.arpeggiatorGate);
      setCustomDrumPatterns(loadedState.customDrumPatterns);
      saveCustomPatterns(loadedState.customDrumPatterns);
      clearError();
    } catch (err) {
      setError(`Jam konnte nicht geladen werden: ${err.message}`);
    } finally {
      event.target.value = "";
    }
  };
  const handleExportMidi = () => {
    if (progression.length === 0) {
      setError("Eine leere Progression kann nicht exportiert werden.");
      return;
    }
    const patternData = resolveDrumPattern(drumPattern);
    exportToMidi({ progression, bpm, drumPattern: patternData });
    clearError();
  };
  const handleSaveCustomPattern = (name, pattern, originalName) => {
    let patterns = [...customDrumPatterns];
    const existingIndex = patterns.findIndex((p) => p.name === (originalName || name));
    if (existingIndex > -1) {
      patterns[existingIndex] = { name, pattern };
    } else {
      patterns.push({ name, pattern });
    }
    setCustomDrumPatterns(patterns);
    saveCustomPatterns(patterns);
    setDrumPattern(name);
    setShowDrumEditor(false);
    setEditingDrumPattern(null);
  };
  const handleDeleteCustomPattern = (name) => {
    if (!window.confirm(`M\xF6chtest du das Pattern "${name}" wirklich l\xF6schen? Diese Aktion kann nicht r\xFCckg\xE4ngig gemacht werden.`)) {
      return;
    }
    if (drumPattern === name) {
      setDrumPattern("Pop Rock");
    }
    const updatedPatterns = customDrumPatterns.filter((p) => p.name !== name);
    setCustomDrumPatterns(updatedPatterns);
    saveCustomPatterns(updatedPatterns);
    if (editingDrumPattern?.name === name) {
      setShowDrumEditor(false);
      setEditingDrumPattern(null);
    }
  };
  const handleOpenDrumEditor = (patternName) => {
    if (patternName) {
      const patternToEdit = customDrumPatterns.find((p) => p.name === patternName);
      if (patternToEdit) {
        setEditingDrumPattern(patternToEdit);
      }
    } else {
      setEditingDrumPattern(null);
    }
    setShowDrumEditor(true);
  };
  const handleSaveCustomSynthPreset = () => {
    const name = prompt("Gib einen Namen f\xFCr dein Preset ein:");
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();
    if (customSynthPresets.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase()) || AudioServiceClass.synthPresets[trimmedName]) {
      alert("Dieser Preset-Name ist bereits vergeben.");
      return;
    }
    const newPreset = { name: trimmedName, config: synthConfig };
    const updatedPresets = [...customSynthPresets, newPreset];
    setCustomSynthPresets(updatedPresets);
    saveCustomSynthPresets(updatedPresets);
    setSynthPresetName(trimmedName);
  };
  if (audioState !== "ready") {
    return /* @__PURE__ */ jsxs10("div", { className: "fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center text-center p-4", children: [
      /* @__PURE__ */ jsx11("header", { className: "absolute top-0 p-4 text-center w-full", children: /* @__PURE__ */ jsx11("h1", { className: "text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600", children: "Jam Buddy" }) }),
      /* @__PURE__ */ jsx11("p", { className: "text-gray-400 mb-8 max-w-md text-lg", children: "Klicke, um die Audio-Engine zu starten und deine Jam-Session zu beginnen." }),
      audioState === "uninitialized" && /* @__PURE__ */ jsxs10("div", { className: "flex flex-col items-center gap-6", children: [
        /* @__PURE__ */ jsx11(
          "button",
          {
            onClick: handleInitializeAudio,
            className: "px-8 py-4 rounded-lg font-bold text-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg",
            children: "Session starten"
          }
        ),
        /* @__PURE__ */ jsxs10("div", { className: "bg-gray-800/60 p-4 rounded-lg border border-gray-700 max-w-xs", children: [
          /* @__PURE__ */ jsx11("p", { className: "text-sm text-gray-400 mb-2", children: "Sound klingt verzerrt oder h\xE4ngt von der letzten Session?" }),
          /* @__PURE__ */ jsxs10(
            "button",
            {
              onClick: handleReset,
              disabled: isLoading,
              className: "text-sm font-semibold text-red-400 hover:text-red-300 underline decoration-dotted underline-offset-4 flex items-center justify-center mx-auto",
              children: [
                /* @__PURE__ */ jsx11(IconRefresh, { className: "h-4 w-4 mr-1" }),
                "Audio-Engine komplett neu laden"
              ]
            }
          )
        ] })
      ] }),
      audioState === "initializing" && /* @__PURE__ */ jsxs10("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx11("div", { className: "w-4 h-4 rounded-full animate-pulse bg-purple-400" }),
        /* @__PURE__ */ jsx11("div", { className: "w-4 h-4 rounded-full animate-pulse bg-purple-400", style: { animationDelay: "0.2s" } }),
        /* @__PURE__ */ jsx11("div", { className: "w-4 h-4 rounded-full animate-pulse bg-purple-400", style: { animationDelay: "0.4s" } }),
        /* @__PURE__ */ jsx11("span", { className: "text-lg font-semibold ml-2", children: loadingText })
      ] }),
      audioState === "error" && /* @__PURE__ */ jsxs10("div", { className: "bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative max-w-xl flex flex-col gap-2", role: "alert", children: [
        /* @__PURE__ */ jsxs10("div", { children: [
          /* @__PURE__ */ jsx11("strong", { className: "font-bold", children: "Fehler: " }),
          /* @__PURE__ */ jsx11("span", { className: "block sm:inline", children: error })
        ] }),
        /* @__PURE__ */ jsx11(
          "button",
          {
            onClick: handleReset,
            className: "bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded mt-2 self-center",
            children: "Audio zur\xFCcksetzen & Neustart"
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs10("div", { className: "bg-gray-900 text-white min-h-screen font-sans relative", children: [
    isPlaying && trainingMode && (playbackPhase === "counting-in" || playbackPhase === "resetting") && /* @__PURE__ */ jsx11("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none animate-fade-in", children: /* @__PURE__ */ jsxs10("div", { className: "text-center", children: [
      playbackPhase === "counting-in" && countInBeat && /* @__PURE__ */ jsx11("div", { className: "text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.8)] animate-pulse", children: countInBeat }),
      playbackPhase === "resetting" && /* @__PURE__ */ jsxs10("div", { className: "text-3xl font-bold text-purple-300 flex flex-col items-center gap-4", children: [
        /* @__PURE__ */ jsx11("div", { className: "w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" }),
        "Audio-Bereinigung..."
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs10("header", { className: "p-4 text-center border-b border-gray-800", children: [
      /* @__PURE__ */ jsx11("h1", { className: "text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600", children: "Jam Buddy" }),
      /* @__PURE__ */ jsx11("div", { className: "mt-2 flex justify-center", children: /* @__PURE__ */ jsxs10(
        "button",
        {
          onClick: handleReset,
          disabled: isLoading,
          className: "bg-gray-800 hover:bg-red-900/30 border border-gray-700 hover:border-red-500/50 text-gray-400 hover:text-red-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 transition-all group",
          title: "Klicken, um die Audio-Engine neu zu starten, falls der Sound kratzt oder h\xE4ngt",
          children: [
            /* @__PURE__ */ jsxs10("span", { className: "relative flex h-2 w-2", children: [
              /* @__PURE__ */ jsx11("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 hidden group-hover:inline-flex" }),
              /* @__PURE__ */ jsx11("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-gray-500 group-hover:bg-red-500" })
            ] }),
            "Sound h\xE4ngt oder kratzt? ",
            /* @__PURE__ */ jsx11("span", { className: "underline decoration-dotted", children: "Notfall-Reset" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs10("main", { className: "container mx-auto p-4 md:p-6 lg:p-8", children: [
      error && /* @__PURE__ */ jsxs10("div", { className: "bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-4 flex justify-between items-center", role: "alert", children: [
        /* @__PURE__ */ jsxs10("div", { children: [
          /* @__PURE__ */ jsx11("strong", { className: "font-bold", children: "Fehler: " }),
          /* @__PURE__ */ jsx11("span", { className: "block sm:inline", children: error })
        ] }),
        /* @__PURE__ */ jsxs10("div", { className: "flex items-center", children: [
          retryAction && /* @__PURE__ */ jsx11(
            "button",
            {
              onClick: handleRetry,
              className: "bg-red-400/30 hover:bg-red-400/50 text-white font-bold py-1 px-3 rounded-md mr-2",
              disabled: isLoading,
              children: "Erneut versuchen"
            }
          ),
          /* @__PURE__ */ jsx11("button", { onClick: clearError, className: "p-1 rounded-full hover:bg-red-400/30", "aria-label": "Schlie\xDFen", children: /* @__PURE__ */ jsx11(IconX, { className: "fill-current h-6 w-6 text-red-400" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs10("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsx11("div", { className: "lg:col-span-1 bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 relative", children: /* @__PURE__ */ jsx11(
          ControlPanel_default,
          {
            musicKey,
            scale,
            onKeyGroupChange: handleKeyGroupChange,
            drumPattern,
            onDrumPatternChange: setDrumPattern,
            bpm,
            onBpmChange: setBpm,
            kickVolume,
            onKickVolumeChange: setKickVolume,
            snareVolume,
            onSnareVolumeChange: setSnareVolume,
            hihatVolume,
            onHihatVolumeChange: setHihatVolume,
            synthVolume,
            onSynthVolumeChange: setSynthVolume,
            bassVolume,
            onBassVolumeChange: setBassVolume,
            kickPan,
            onKickPanChange: setKickPan,
            snarePan,
            onSnarePanChange: setSnarePan,
            hihatPan,
            onHihatPanChange: setHihatPan,
            synthPan,
            onSynthPanChange: setSynthPan,
            bassPan,
            onBassPanChange: setBassPan,
            selectedPresetIndex,
            onPresetChange: setSelectedPresetIndex,
            synthPresetName,
            onSynthPresetNameChange: setSynthPresetName,
            synthConfig,
            onSynthConfigChange: setSynthConfig,
            customSynthPresets,
            onSaveCustomSynthPreset: handleSaveCustomSynthPreset,
            onRandomize: handleRandomize,
            isPlaying,
            onPlayToggle: handlePlayToggle,
            onReset: handleReset,
            onSave: handleSave,
            onLoad: handleLoad,
            onExportMidi: handleExportMidi,
            onGenerateWithAi: () => setShowAiGenerator(true),
            useInversions,
            onUseInversionsChange: setUseInversions,
            synthOctave,
            onSynthOctaveChange: setSynthOctave,
            voicingVariation,
            onVoicingVariationChange: setVoicingVariation,
            spreadVoicing,
            onSpreadVoicingChange: setSpreadVoicing,
            harmonyInterval,
            onHarmonyIntervalChange: setHarmonyInterval,
            harmonyVolume,
            onHarmonyVolumeChange: setHarmonyVolume,
            harmonyPan,
            onHarmonyPanChange: setHarmonyPan,
            arpeggiatorEnabled,
            onArpeggiatorEnabledChange: setArpeggiatorEnabled,
            arpeggiatorRate,
            onArpeggiatorRateChange: setArpeggiatorRate,
            arpeggiatorDirection,
            onArpeggiatorDirectionChange: setArpeggiatorDirection,
            arpeggiatorGate,
            onArpeggiatorGateChange: setArpeggiatorGate,
            isLoading: isLoading || audioState !== "ready",
            isOnline,
            customDrumPatterns,
            onOpenDrumEditor: handleOpenDrumEditor,
            onDeleteCustomPattern: handleDeleteCustomPattern,
            discoveredFeatures,
            onFeatureDiscovered: handleFeatureDiscovered,
            trainingMode,
            onTrainingModeChange: setTrainingMode
          }
        ) }),
        /* @__PURE__ */ jsxs10("div", { className: "lg:col-span-2 space-y-8", children: [
          /* @__PURE__ */ jsxs10("div", { className: "bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 relative", children: [
            isLoading && /* @__PURE__ */ jsx11(Loader_default, { text: loadingText }),
            /* @__PURE__ */ jsx11(
              ChordDisplay_default,
              {
                progression,
                currentChordIndex,
                onChordChange: handleChordChange,
                isPlaying
              }
            ),
            /* @__PURE__ */ jsx11("div", { className: "mt-4", children: /* @__PURE__ */ jsx11(
              DiatonicDegreeDisplay_default,
              {
                progression,
                musicKey,
                scale,
                currentChordIndex
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx11("div", { className: "bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700", children: /* @__PURE__ */ jsx11(
            CircleOfFifths_default,
            {
              progression,
              musicKey,
              scale,
              currentChordIndex
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsx11("footer", { className: "text-center text-gray-500 mt-8", children: /* @__PURE__ */ jsxs10("p", { children: [
        "Dr\xFCcke ",
        /* @__PURE__ */ jsx11("kbd", { className: "px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md", children: "H" }),
        " oder ",
        /* @__PURE__ */ jsx11("kbd", { className: "px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md", children: "?" }),
        " f\xFCr Hilfe."
      ] }) })
    ] }),
    showTutorial && /* @__PURE__ */ jsx11(Tutorial_default, { onClose: handleCloseTutorial }),
    showAiGenerator && /* @__PURE__ */ jsx11(AiGenerator_default, { onClose: () => setShowAiGenerator(false), onGenerate: handleGenerateWithAi }),
    showDrumEditor && /* @__PURE__ */ jsx11(
      DrumPatternEditor_default,
      {
        onClose: () => setShowDrumEditor(false),
        onSave: handleSaveCustomPattern,
        onDelete: handleDeleteCustomPattern,
        existingPattern: editingDrumPattern,
        allPatterns: customDrumPatterns
      }
    )
  ] });
};
var App_default = App;

// index.tsx
import { jsx as jsx12 } from "react/jsx-runtime";
var rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
var root = ReactDOM.createRoot(rootElement);
root.render(
  /* @__PURE__ */ jsx12(React9.StrictMode, { children: /* @__PURE__ */ jsx12(App_default, {}) })
);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      console.log("ServiceWorker registration successful with scope: ", registration.scope);
    }, (err) => {
      console.log("ServiceWorker registration failed: ", err);
    });
  });
}
