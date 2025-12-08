import * as Tone from 'tone';
import { DrumStep } from '../types';
import { AudioService } from './audioService';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface MidiExportData {
  progression: string[];
  bpm: number;
  drumPattern: (DrumStep | null)[];
}

// --- Constants for MIDI file structure ---
const HEADER_CHUNK_TYPE = [0x4d, 0x54, 0x68, 0x64]; // "MThd"
const HEADER_CHUNK_LENGTH = [0x00, 0x00, 0x00, 0x06]; // 6 bytes
const HEADER_FORMAT_TYPE = [0x00, 0x01]; // Format 1 (multi-track)
const TRACK_CHUNK_TYPE = [0x4d, 0x54, 0x72, 0x6b]; // "MTrk"
const TICKS_PER_QUARTER_NOTE = 480;

// --- MIDI Event Codes ---
const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;
const PROGRAM_CHANGE = 0xC0;

// General MIDI Drum Map (subset)
const GM_DRUM_MAP = {
  kick: 36, // Acoustic Bass Drum
  snare: 38, // Acoustic Snare
  hihat: 42, // Closed Hi-Hat
};


function getMidiNotesFromChord(chord: string): number[] {
  // Use the static method from AudioService to get note names for a given chord.
  const noteNames = AudioService.getChordNotes(chord);
  if (!noteNames || noteNames.length === 0) return [];
  return noteNames.map(note => Tone.Frequency(note).toMidi());
}


/**
 * Writes a variable-length quantity (VLQ) to a byte array.
 * This is a corrected, standard implementation.
 */
function writeVLQ(value: number): number[] {
  const result: number[] = [];
  const sevenBitBytes: number[] = [];

  if (value === 0) {
    return [0];
  }

  while (value > 0) {
    sevenBitBytes.push(value & 0x7F);
    value >>= 7;
  }

  sevenBitBytes.reverse();

  for (let i = 0; i < sevenBitBytes.length; i++) {
    const byte = sevenBitBytes[i];
    if (i < sevenBitBytes.length - 1) { // Not the last byte
      result.push(byte | 0x80);
    } else {
      result.push(byte);
    }
  }
  return result;
}


/**
 * Creates a MIDI track chunk from an array of event bytes.
 */
function createTrackChunk(trackEvents: number[]): Uint8Array {
  const trackLength = trackEvents.length;
  const lengthBytes = [
    (trackLength >> 24) & 0xFF,
    (trackLength >> 16) & 0xFF,
    (trackLength >> 8) & 0xFF,
    trackLength & 0xFF
  ];

  const endOfTrackEvent = [0x00, 0xFF, 0x2F, 0x00]; // Delta-time 0, Meta-event, End of Track

  const trackData = [...TRACK_CHUNK_TYPE, ...lengthBytes, ...trackEvents, ...endOfTrackEvent];
  return new Uint8Array(trackData);
}

export function exportToMidi(data: MidiExportData): void {
  const { progression, bpm, drumPattern } = data;

  // --- Create Chord Track ---
  const chordTrackEvents: number[] = [];
  let chordCurrentTime = 0;
  // Set instrument to Acoustic Grand Piano (program 0) on channel 0
  chordTrackEvents.push(...writeVLQ(0), PROGRAM_CHANGE | 0, 0);

  progression.forEach((chord, barIndex) => {
    const midiNotes = getMidiNotesFromChord(chord);
    const barStartTime = barIndex * TICKS_PER_QUARTER_NOTE * 4;

    // Note On events for the chord
    const noteOnDelta = barStartTime - chordCurrentTime;
    midiNotes.forEach((note, index) => {
      const deltaTime = (index === 0) ? noteOnDelta : 0;
      chordTrackEvents.push(...writeVLQ(deltaTime), NOTE_ON | 0, note, 80); // Channel 0, velocity 80
    });
    chordCurrentTime = barStartTime;

    // Note Off events after one measure
    const durationTicks = TICKS_PER_QUARTER_NOTE * 4;
    const noteOffDelta = durationTicks;
    midiNotes.forEach((note, index) => {
      const deltaTime = (index === 0) ? noteOffDelta : 0;
      chordTrackEvents.push(...writeVLQ(deltaTime), NOTE_OFF | 0, note, 0); // Channel 0, velocity 0
    });
    chordCurrentTime += durationTicks;
  });

  // --- Create Drum Track (using a cleaner time-tracking logic) ---
  const drumTrackEvents: number[] = [];
  let drumCurrentTime = 0;
  const eighthNoteTicks = TICKS_PER_QUARTER_NOTE / 2;
  const noteDurationTicks = 120; // Short duration for drum hits

  // Set to use drum kit on channel 9
  drumTrackEvents.push(...writeVLQ(0), PROGRAM_CHANGE | 9, 0);

  const totalEighthNotes = progression.length * 8;
  for (let i = 0; i < totalEighthNotes; i++) {
    const stepTime = i * eighthNoteTicks;
    const step = drumPattern[i % drumPattern.length]; // Loop pattern

    const drumNotesToPlay: { note: number; velocity: number }[] = [];
    if (step?.kick) drumNotesToPlay.push({ note: GM_DRUM_MAP.kick, velocity: 100 });
    if (step?.snare) drumNotesToPlay.push({ note: GM_DRUM_MAP.snare, velocity: 110 });
    if (step?.hihat) drumNotesToPlay.push({ note: GM_DRUM_MAP.hihat, velocity: 70 });

    if (drumNotesToPlay.length > 0) {
      // Note On events
      const deltaTime = stepTime - drumCurrentTime;
      drumNotesToPlay.forEach((drum, index) => {
        drumTrackEvents.push(...writeVLQ(index === 0 ? deltaTime : 0), NOTE_ON | 9, drum.note, drum.velocity);
      });
      drumCurrentTime = stepTime;

      // Note Off events
      drumNotesToPlay.forEach((drum, index) => {
        drumTrackEvents.push(...writeVLQ(index === 0 ? noteDurationTicks : 0), NOTE_OFF | 9, drum.note, 0);
      });
      drumCurrentTime += noteDurationTicks;
    }
  }

  // --- Assemble the MIDI File ---
  const numTracks = [0x00, 0x02]; // Two tracks
  const timeDivision = [(TICKS_PER_QUARTER_NOTE >> 8) & 0xFF, TICKS_PER_QUARTER_NOTE & 0xFF];
  const headerBytes = [...HEADER_CHUNK_TYPE, ...HEADER_CHUNK_LENGTH, ...HEADER_FORMAT_TYPE, ...numTracks, ...timeDivision];

  const headerChunk = new Uint8Array(headerBytes);
  const chordChunk = createTrackChunk(chordTrackEvents);
  const drumChunk = createTrackChunk(drumTrackEvents);

  // Combine chunks into a single Uint8Array
  const totalLength = headerChunk.length + chordChunk.length + drumChunk.length;
  const combinedData = new Uint8Array(totalLength);
  combinedData.set(headerChunk, 0);
  combinedData.set(chordChunk, headerChunk.length);
  combinedData.set(drumChunk, headerChunk.length + chordChunk.length);

  if (Capacitor.isNativePlatform()) {
    // Native implementation
    const base64Data = uint8ArrayToBase64(combinedData);
    const fileName = `jam-buddy-progression.mid`;

    Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    }).then((result) => {
      return Share.share({
        title: 'Jam Buddy MIDI',
        text: 'Here is my Jam Buddy MIDI file!',
        url: result.uri,
        dialogTitle: 'Export MIDI',
      });
    }).catch((err) => {
      console.error("Native MIDI export failed:", err);
      alert("MIDI-Export fehlgeschlagen: " + err.message);
    });

  } else {
    // Web implementation
    const midiFile = new Blob([combinedData], { type: 'audio/midi' });
    const url = URL.createObjectURL(midiFile);

    const a = document.createElement('a');
    a.href = url;
    a.download = `jam-buddy-progression.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}