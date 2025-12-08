import { JamState } from "../types";

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
    (typeof obj.selectedPresetIndex === 'number' || obj.selectedPresetIndex === undefined) &&
    (typeof obj.synthPreset === 'string' || obj.synthPreset === undefined) &&
    (typeof obj.useInversions === 'boolean' || obj.useInversions === undefined) &&
    (typeof obj.synthOctave === 'number' || obj.synthOctave === undefined) &&
    (typeof obj.synthFilterCutoff === 'number' || obj.synthFilterCutoff === undefined) &&
    (typeof obj.synthFilterResonance === 'number' || obj.synthFilterResonance === undefined) &&
    (typeof obj.voicingVariation === 'boolean' || obj.voicingVariation === undefined) &&
    (typeof obj.spreadVoicing === 'boolean' || obj.spreadVoicing === undefined) &&
    (typeof obj.harmonyEnabled === 'boolean' || typeof obj.harmonyInterval === 'string' || obj.harmonyInterval === null || obj.harmonyInterval === undefined) &&
    (typeof obj.harmonyVolume === 'number' || obj.harmonyVolume === undefined) &&
    (typeof obj.arpeggiatorEnabled === 'boolean' || obj.arpeggiatorEnabled === undefined) &&
    (typeof obj.arpeggiatorRate === 'string' || obj.arpeggiatorRate === undefined) &&
    (typeof obj.arpeggiatorDirection === 'string' || obj.arpeggiatorDirection === undefined) &&
    (typeof obj.arpeggiatorGate === 'number' || obj.arpeggiatorGate === undefined) &&
    (Array.isArray(obj.customDrumPatterns) || obj.customDrumPatterns === undefined)
  );
  return isValid;
}


export function saveJam(state: JamState): void {
  try {
    const jsonString = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `jam-buddy-session-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          // Provide defaults for older save files for backward compatibility.
          const finalState: JamState = {
            selectedPresetIndex: -1,
            synthPreset: 'Sawtooth',
            useInversions: true,
            synthOctave: 0,
            synthFilterCutoff: 8000,
            synthFilterResonance: 1,
            voicingVariation: true,
            spreadVoicing: true,
            harmonyInterval: null,
            harmonyVolume: -18,
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
            customDrumPatterns: [],
            ...parsed,
          };
          
          if (typeof (parsed as any).drumVolume === 'number' && typeof parsed.kickVolume === 'undefined') {
              finalState.kickVolume = (parsed as any).drumVolume;
              finalState.snareVolume = (parsed as any).drumVolume;
              finalState.hihatVolume = (parsed as any).drumVolume;
          }
          if (typeof (parsed as any).harmonyEnabled === 'boolean' && (parsed as any).harmonyEnabled) {
              finalState.harmonyInterval = '7th'; 
          }


          delete (finalState as any).drumVolume;
          delete (finalState as any).harmonyEnabled; 

          resolve(finalState);
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