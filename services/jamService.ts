
import { JamState, SynthPreset } from "../types";
import { AudioService } from './audioService';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

const AUTOSAVE_KEY = 'jamBuddy_autosave_v1';

// Basic validation to ensure the loaded object has the expected properties.
function isValidJamState(obj: any): obj is JamState {
  const isValid = (
    obj &&
    Array.isArray(obj.progression) &&
    typeof obj.bpm === 'number' &&
    typeof obj.musicKey === 'string' &&
    typeof obj.scale === 'string' &&
    typeof obj.drumPattern === 'string' &&
    (typeof obj.drumVolume === 'number' || (typeof obj.kickVolume === 'number' && typeof obj.snareVolume === 'number' && typeof obj.hihatVolume === 'number')) && // Allow old or new format
    typeof obj.synthVolume === 'number' &&
    (typeof obj.bassVolume === 'number' || obj.bassVolume === undefined) &&
    (typeof obj.kickPan === 'number' || obj.kickPan === undefined) &&
    (typeof obj.snarePan === 'number' || obj.snarePan === undefined) &&
    (typeof obj.hihatPan === 'number' || obj.hihatPan === undefined) &&
    (typeof obj.synthPan === 'number' || obj.synthPan === undefined) &&
    (typeof obj.bassPan === 'number' || obj.bassPan === undefined) &&
    (typeof obj.selectedPresetIndex === 'number' || obj.selectedPresetIndex === undefined) &&
    (typeof obj.useInversions === 'boolean' || obj.useInversions === undefined) &&
    (typeof obj.synthOctave === 'number' || obj.synthOctave === undefined) &&
    (typeof obj.voicingVariation === 'boolean' || obj.voicingVariation === undefined) &&
    (typeof obj.spreadVoicing === 'boolean' || obj.spreadVoicing === undefined) &&
    (typeof obj.harmonyEnabled === 'boolean' || typeof obj.harmonyInterval === 'string' || obj.harmonyInterval === null || obj.harmonyInterval === undefined) &&
    (typeof obj.harmonyVolume === 'number' || obj.harmonyVolume === undefined) &&
    (typeof obj.harmonyPan === 'number' || obj.harmonyPan === undefined) &&
    (typeof obj.arpeggiatorEnabled === 'boolean' || obj.arpeggiatorEnabled === undefined) &&
    (typeof obj.arpeggiatorRate === 'string' || obj.arpeggiatorRate === undefined) &&
    (typeof obj.arpeggiatorDirection === 'string' || obj.arpeggiatorDirection === undefined) &&
    (typeof obj.arpeggiatorGate === 'number' || obj.arpeggiatorGate === undefined) &&
    (Array.isArray(obj.customDrumPatterns) || obj.customDrumPatterns === undefined) &&
    (typeof obj.loopCount === 'number' || obj.loopCount === undefined)
  );
  return isValid;
}

// Helper to normalize old state formats into the current JamState structure
function normalizeJamState(parsed: any): JamState {
  const defaultPreset = AudioService.synthPresets['Sawtooth'];

  const finalState: JamState = {
    selectedPresetIndex: -1,
    useInversions: true,
    synthOctave: 0,
    voicingVariation: true,
    spreadVoicing: true,
    harmonyInterval: null,
    harmonyVolume: -18,
    harmonyPan: 0,
    arpeggiatorEnabled: false,
    arpeggiatorRate: '16n',
    arpeggiatorDirection: 'up',
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
    synthPresetName: 'Sawtooth',
    synthConfig: {
      oscillator: defaultPreset.oscillator,
      envelope: defaultPreset.envelope,
      filter: {
        cutoff: 8000,
        resonance: 1
      }
    },
    loopCount: 2, // Default to 2 loops
    ...parsed,
  };

  // --- MIGRATION LOGIC from old format ---
  if (typeof (parsed as any).drumVolume === 'number' && typeof parsed.kickVolume === 'undefined') {
    finalState.kickVolume = (parsed as any).drumVolume;
    finalState.snareVolume = (parsed as any).drumVolume;
    finalState.hihatVolume = (parsed as any).drumVolume;
  }
  if (typeof (parsed as any).harmonyEnabled === 'boolean' && (parsed as any).harmonyEnabled) {
    finalState.harmonyInterval = '7th';
  }

  // Migrate old synth settings to new synthConfig structure
  if ((parsed as any).synthPreset && !parsed.synthConfig) {
    const presetName = (parsed as any).synthPreset as SynthPreset;
    const presetConfig = AudioService.synthPresets[presetName] || defaultPreset;
    finalState.synthPresetName = presetName;
    finalState.synthConfig = {
      oscillator: presetConfig.oscillator,
      envelope: presetConfig.envelope,
      filter: {
        cutoff: (parsed as any).synthFilterCutoff ?? 8000,
        resonance: (parsed as any).synthFilterResonance ?? 1,
      }
    };
  }

  // Cleanup legacy keys
  delete (finalState as any).drumVolume;
  delete (finalState as any).harmonyEnabled;
  delete (finalState as any).synthPreset;
  delete (finalState as any).synthFilterCutoff;
  delete (finalState as any).synthFilterResonance;

  return finalState;
}


export async function saveJam(state: JamState): Promise<void> {
  try {
    const jsonString = JSON.stringify(state, null, 2);
    const fileName = `jam-buddy-session-${new Date().toISOString().slice(0, 10)}.json`;

    if (Capacitor.isNativePlatform()) {
      // Native implementation
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: jsonString,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        await Share.share({
          title: 'Jam Buddy Session',
          text: 'Here is my Jam Buddy session!',
          url: result.uri,
          dialogTitle: 'Save Jam Session',
        });
      } catch (nativeError) {
        console.error("Native save failed:", nativeError);
        throw new Error("Speichern auf dem Gerät fehlgeschlagen.");
      }
    } else {
      // Web implementation
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Jam-Session:", error);
    throw new Error("Die Jam-Session konnte nicht gespeichert werden. Siehe Konsole für Details.");
  }
}

export function loadJam(file: File): Promise<JamState> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("Es wurde keine Datei ausgewählt."));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          return reject(new Error("Der Dateiinhalt konnte nicht gelesen werden."));
        }
        const parsed = JSON.parse(result);

        if (isValidJamState(parsed)) {
          resolve(normalizeJamState(parsed));
        } else {
          reject(new Error("Ungültiges oder beschädigtes Jam-Datei-Format."));
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

/**
 * Saves the current state to local storage for auto-resume.
 */
export function saveAutosave(state: JamState): void {
  try {
    const jsonString = JSON.stringify(state);
    localStorage.setItem(AUTOSAVE_KEY, jsonString);
  } catch (error) {
    console.error("Auto-save failed:", error);
  }
}

/**
 * Loads the auto-saved state from local storage.
 */
export function loadAutosave(): JamState | null {
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
