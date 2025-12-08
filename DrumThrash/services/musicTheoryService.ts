import { MusicKey, Scale } from '../types';

const NOTES: MusicKey[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10]; // Natural Minor

const MAJOR_DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'];
const MINOR_DEGREES = ['i', 'ii', 'III', 'iv', 'v', 'VI', 'VII'];

const ALL_QUALITIES = {
  // Major qualities
  'I': '', 'ii': 'm', 'iii': 'm', 'IV': '', 'V': '', 'vi': 'm', 'vii': 'dim',
  // Minor qualities (will overwrite major where there are clashes, which is fine)
  'i': 'm', 'III': '', 'iv': 'm', 'v': 'm', 'VI': '', 'VII': '',
};


const ROMAN_TO_DEGREE: { [key: string]: number } = {
  'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7,
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7
};

/**
 * Transposes a progression of Roman numerals to actual chords based on a key and scale.
 * @param key The root key (e.g., 'G').
 * @param scale The scale type ('Major' or 'Minor').
 * @param romanProgression An array of Roman numeral strings (e.g., ['I', 'V', 'vi', 'IV']).
 * @returns An array of chord name strings (e.g., ['G', 'D', 'Em', 'C']).
 */
export function transposeProgression(key: MusicKey, scale: Scale, romanProgression: string[]): string[] {
  const keyIndex = NOTES.indexOf(key);
  const intervals = scale === 'Major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
  
  return romanProgression.map(roman => {
    // Reordered the regex to match longest alternatives first (e.g., 'vi' before 'v' or 'i').
    const match = roman.match(/^(b?#?)(VII|VI|IV|III|II|V|I|vii|vi|iv|iii|ii|v|i)(.*)$/);
    if (!match) return 'N.C.';

    const [, accidental, numeral, extension] = match;
    
    const degree = ROMAN_TO_DEGREE[numeral];
    if (!degree) return 'N.C.';
    
    let rootNoteIndex = (keyIndex + intervals[degree - 1]) % 12;

    // Apply accidentals like 'b' for borrowed chords
    if (accidental === 'b') {
      rootNoteIndex = (rootNoteIndex + 11) % 12;
    } else if (accidental === '#') {
      rootNoteIndex = (rootNoteIndex + 1) % 12;
    }

    const rootNote = NOTES[rootNoteIndex];
    
    // Determine quality (major/minor/etc.)
    const baseQuality = (scale === 'Minor' && numeral === 'V')
      ? ''
      : ALL_QUALITIES[numeral as keyof typeof ALL_QUALITIES] ?? '';

    // If the extension already includes the quality (e.g., 'm7'), it should take precedence
    // over the base quality (e.g., 'm' for a 'ii' chord).
    if (extension.startsWith(baseQuality) && baseQuality !== '') {
        return `${rootNote}${extension}`;
    }

    return `${rootNote}${baseQuality}${extension}`;
  });
}

/**
 * Finds the relative minor key for a given major key.
 * @param majorKey The major key (e.g., 'C').
 * @returns The relative minor key (e.g., 'A').
 */
export function getRelativeMinor(majorKey: MusicKey): MusicKey {
  const keyIndex = NOTES.indexOf(majorKey);
  if (keyIndex === -1) return majorKey; // Should not happen with MusicKey type
  const relativeMinorIndex = (keyIndex - 3 + 12) % 12;
  return NOTES[relativeMinorIndex];
}

/**
 * Finds the relative major key for a given minor key.
 * @param minorKey The minor key (e.g., 'A').
 * @returns The relative major key (e.g., 'C').
 */
export function getRelativeMajor(minorKey: MusicKey): MusicKey {
  const keyIndex = NOTES.indexOf(minorKey);
  if (keyIndex === -1) return minorKey;
  const relativeMajorIndex = (keyIndex + 3) % 12;
  return NOTES[relativeMajorIndex];
}


// Memoization cache
const romanNumeralCache = new Map<string, string>();

/**
 * Determines the Roman numeral for a given chord within a specific key and scale.
 * @param chordName The chord to analyze (e.g., 'Em').
 * @param key The musical key (e.g., 'C').
 * @param scale The scale type ('Major' or 'Minor').
 * @returns The Roman numeral as a string (e.g., 'iii') or the original chord name if non-diatonic.
 */
export function getRomanNumeral(chordName: string, key: MusicKey, scale: Scale): string {
    const cacheKey = `${chordName}-${key}-${scale}`;
    if (romanNumeralCache.has(cacheKey)) {
        return romanNumeralCache.get(cacheKey)!;
    }

    if (!chordName || chordName.toLowerCase() === 'n.c.') {
        return 'N.C.';
    }

    const romanNumerals = scale === 'Major' ? MAJOR_DEGREES : MINOR_DEGREES;
    const diatonicChords = transposeProgression(key, scale, romanNumerals);

    const diatonicMap: { [key: string]: string } = {};
    for (let i = 0; i < diatonicChords.length; i++) {
        diatonicMap[diatonicChords[i]] = romanNumerals[i];
    }
    
    // Attempt a direct match first
    if (diatonicMap[chordName]) {
        romanNumeralCache.set(cacheKey, diatonicMap[chordName]);
        return diatonicMap[chordName];
    }

    // If no direct match, try matching root and basic quality (e.g., 'Cmaj7' should match diatonic 'C')
    const rootMatch = chordName.match(/^[A-G][#b]?/);
    if (rootMatch) {
        const root = rootMatch[0];
        const isMinor = chordName.includes('m') && !chordName.includes('maj');
        const isDim = chordName.includes('dim');

        const simpleMajor = root;
        const simpleMinor = `${root}m`;
        const simpleDim = `${root}dim`;

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
    
    // Special handling for the V chord in minor, which is often major
    if (scale === 'Minor') {
        const majorVChord = transposeProgression(key, 'Major', ['V'])[0];
        if (chordName.startsWith(majorVChord) && !majorVChord.endsWith('m')) {
            const result = `V${chordName.substring(majorVChord.length)}`;
             romanNumeralCache.set(cacheKey, result);
             return result;
        }
    }


    romanNumeralCache.set(cacheKey, chordName);
    return chordName; // Not found, return original name
}