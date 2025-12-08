
import React, { useMemo } from 'react';
import { MusicKey, Scale } from '../types';
import { getRelativeMinor, getRelativeMajor } from '../services/musicTheoryService';

interface CircleOfFifthsProps {
  progression: string[];
  musicKey: MusicKey;
  scale: Scale;
  currentChordIndex: number | null;
}

const majorKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const minorKeys = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

const KEY_POSITIONS: { [key: string]: number } = {
  'C': 0, 'B#': 0,
  'G': 1,
  'D': 2,
  'A': 3,
  'E': 4,
  'B': 5, 'Cb': 5,
  'F#': 6, 'Gb': 6,
  'Db': 7, 'C#': 7,
  'Ab': 8, 'G#': 8,
  'Eb': 9, 'D#': 9,
  'Bb': 10, 'A#': 10,
  'F': 11, 'E#': 11
};

// --- Music Theory Constants ---
const NOTES_CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
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
  'Bb': 10, 'A#': 10,
  'B': 11, 'Cb': 11,
};

interface ChordTone {
  name: string;
  type: 'root' | 'third' | 'fifth' | 'seventh' | 'other';
}

/**
 * Parses a chord string and returns its constituent notes with their function (root, third, etc.).
 * Handles common qualities like major, minor, dim, sus4, and 7ths.
 */
function getChordTones(chord: string): ChordTone[] {
  try {
    if (chord.toLowerCase() === 'n.c.' || chord.trim() === '') return [];

    const rootMatch = chord.match(/^[A-G][#b]?/);
    if (!rootMatch) return [];
    const root = rootMatch[0];
    const quality = chord.substring(root.length);
    const rootIndex = NOTE_TO_INDEX[root as keyof typeof NOTE_TO_INDEX];
    if (rootIndex === undefined) return [];

    const degrees = new Map<number, number>();
    degrees.set(1, 0); // Root

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

    // 6th chords
    if (quality.includes('6') && !has13) {
      degrees.set(6, 9);
    }

    // Alterations
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

    const tones: ChordTone[] = [];
    const seenNotes = new Set<string>();

    // Use a specific order for assigning types for clarity in UI
    const degreeOrder = [1, 3, 5, 7, 2, 4, 6, 9, 11, 13];

    for (const degree of degreeOrder) {
      if (degrees.has(degree)) {
        const interval = degrees.get(degree)!;
        let type: ChordTone['type'] = 'other';
        if (degree === 1) type = 'root';
        else if (degree === 3) type = 'third';
        else if (degree === 5) type = 'fifth';
        else if (degree === 7) type = 'seventh';

        const noteName = NOTES_CHROMATIC[(rootIndex + (interval % 12)) % 12];

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


const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ progression, musicKey, scale, currentChordIndex }) => {
  const size = 600;
  const center = size / 2;
  const majorRadius = size * 0.42;
  const minorRadius = size * 0.30;
  const accidentalsRadius = size * 0.15;
  const accidentals = ['0', '1#', '2#', '3#', '4#', '5#', '6#', '5b', '4b', '3b', '2b', '1b'];

  const scaleNotes = useMemo(() => {
    const rootIndex = NOTE_TO_INDEX[musicKey as keyof typeof NOTE_TO_INDEX];
    if (rootIndex === undefined) return [];

    const intervals = scale === 'Major'
      ? [0, 2, 4, 5, 7, 9, 11]
      : [0, 2, 3, 5, 7, 8, 10];

    return intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return NOTES_CHROMATIC[noteIndex];
    });
  }, [musicKey, scale]);

  const scaleNoteRadius = majorRadius * 1.08;
  const scaleNotePoints = useMemo(() => {
    return scaleNotes.map(noteName => {
      const position = KEY_POSITIONS[noteName as keyof typeof KEY_POSITIONS];
      if (position === undefined) return null;

      const angle = (position / 12) * 2 * Math.PI - Math.PI / 2;
      const x = center + scaleNoteRadius * Math.cos(angle);
      const y = center + scaleNoteRadius * Math.sin(angle);

      const isTonic = noteName === musicKey;

      return { x, y, noteName, isTonic };
    }).filter((p): p is { x: number, y: number, noteName: string, isTonic: boolean } => p !== null);
  }, [scaleNotes, musicKey, center, scaleNoteRadius]);

  const chordPoints = useMemo(() => {
    return progression
      .map(chord => {
        if (!chord || chord.toLowerCase() === 'n.c.') return null;

        const rootMatch = chord.match(/^[A-G][#b]?/);
        if (!rootMatch) return null;
        const root = rootMatch[0];

        const isMinor = chord.includes('m') && !chord.includes('maj');

        let positionRoot = root;
        // If the chord is minor, find its relative major to determine its position on the circle.
        // e.g., Am should be at the same angle as C major.
        if (isMinor) {
          const rootIndex = NOTE_TO_INDEX[root];
          if (rootIndex !== undefined) {
            const relativeMajorIndex = (rootIndex + 3) % 12;
            positionRoot = NOTES_CHROMATIC[relativeMajorIndex];
          }
        }

        const position = KEY_POSITIONS[positionRoot as keyof typeof KEY_POSITIONS];
        if (position === undefined) {
          return null;
        }

        const radius = isMinor ? minorRadius : majorRadius;

        const angle = (position / 12) * 2 * Math.PI - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);

        return { x, y, root: chord };
      })
      .filter((p): p is { x: number, y: number, root: string } => p !== null);
  }, [progression, center, majorRadius, minorRadius]);

  const pathData = useMemo(() => {
    return chordPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');
  }, [chordPoints]);

  const tonicPair = useMemo(() => {
    if (scale === 'Major') {
      return { major: musicKey, minor: `${getRelativeMinor(musicKey)}m` };
    } else { // Minor
      return { major: getRelativeMajor(musicKey), minor: `${musicKey}m` };
    }
  }, [musicKey, scale]);

  const activeChordPoint = currentChordIndex !== null ? chordPoints[currentChordIndex] : null;

  const activeChordTonesPoints = useMemo(() => {
    if (currentChordIndex === null) return [];

    const activeChord = progression[currentChordIndex];
    if (!activeChord) return [];

    const tones = getChordTones(activeChord);
    const noteRadius = majorRadius * 1.15;

    return tones
      .map(tone => {
        const position = KEY_POSITIONS[tone.name as keyof typeof KEY_POSITIONS];
        if (position === undefined) return null;

        const angle = (position / 12) * 2 * Math.PI - Math.PI / 2;
        const x = center + noteRadius * Math.cos(angle);
        const y = center + noteRadius * Math.sin(angle);

        return { x, y, tone };
      }).filter((p): p is { x: number, y: number, tone: ChordTone } => p !== null);
  }, [currentChordIndex, progression, center, majorRadius]);

  const renderKeys = (keys: string[], radius: number, defaultClassName: string) => {
    const isMajorRing = !keys[0].includes('m');

    return keys.map((key, i) => {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      const isTonic = key === tonicPair.major || key === tonicPair.minor;

      const isChord = progression.some(pChord => {
        if (pChord === key) return true;
        if (pChord.startsWith(key)) {
          if (isMajorRing) {
            const nextChar = pChord[key.length];
            if (nextChar === 'm' && !pChord.startsWith('maj', key.length)) {
              return false;
            }
          }
          return true;
        }
        return false;
      });

      let finalClassName = defaultClassName;
      if (isTonic) {
        finalClassName += ' fill-yellow-300 scale-125 font-extrabold';
      } else if (isChord && !isTonic) {
        finalClassName += ' fill-pink-400 font-bold';
      } else {
        finalClassName += ' fill-gray-400'
      }

      return (
        <g key={key} transform={`translate(${x}, ${y})`}>
          <text
            dy="0.35em"
            textAnchor="middle"
            className={`transition-all duration-300 ${finalClassName}`}
          >
            {key}
          </text>
        </g>
      );
    });
  };

  return (
    <div role="region" aria-labelledby="cof-title">
      <h2 id="cof-title" className="text-xl font-bold text-center pt-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Progressions-Visualisierer
      </h2>
      <div className="p-4">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" aria-label="Quintenzirkel-Diagramm, das die aktuelle Progression anzeigt">
          {/* Background rings */}
          <circle cx={center} cy={center} r={majorRadius * 1.05} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx={center} cy={center} r={minorRadius * 1.15} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* Render the scale notes on an outer ring */}
          <g>
            {scaleNotePoints.map(({ x, y, noteName, isTonic }) => (
              <g key={`scale-note-${noteName}`} className="transition-opacity duration-300">
                <circle
                  cx={x}
                  cy={y}
                  r={isTonic ? 18 : 14}
                  fill={isTonic ? 'rgba(250, 204, 21, 0.4)' : 'rgba(255, 255, 255, 0.05)'}
                  stroke={isTonic ? '#FBBF24' : 'rgba(255, 255, 255, 0.3)'}
                  strokeWidth="1.5"
                />
                <text
                  x={x}
                  y={y}
                  dy="0.35em"
                  textAnchor="middle"
                  className={`font-semibold pointer-events-none ${isTonic ? 'fill-yellow-200 text-lg' : 'fill-gray-300 text-base'}`}
                >
                  {noteName}
                </text>
              </g>
            ))}
          </g>

          {/* Progression Path */}
          <path
            d={pathData}
            fill="none"
            stroke="rgba(192, 132, 252, 0.5)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'd 0.3s ease' }}
          />

          {/* Chord Dots on Path */}
          {chordPoints.map((p, i) => (
            <circle
              key={`${p.root}-${i}`}
              cx={p.x}
              cy={p.y}
              r="6"
              fill="rgba(192, 132, 252, 0.7)"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="1"
            />
          ))}

          {/* Current Chord Highlight */}
          {activeChordPoint && (
            <circle
              cx={activeChordPoint.x}
              cy={activeChordPoint.y}
              r="12"
              fill="rgba(255, 255, 255, 0.9)"
              stroke="#c084fc"
              strokeWidth="3"
              className="pointer-events-none"
            >
              <animate attributeName="r" values="10;14;10" dur="1s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Key/Chord Name Text */}
          {renderKeys(majorKeys, majorRadius, 'font-bold text-4xl')}
          {renderKeys(minorKeys, minorRadius, 'font-bold text-2xl')}
          {renderKeys(accidentals, accidentalsRadius, 'fill-gray-500 text-lg')}

          {/* Individual Note Visualizer */}
          {activeChordTonesPoints.map(({ x, y, tone }, index) => {
            const isRoot = tone.type === 'root';
            const isThird = tone.type === 'third';

            let color: string, colorRgba: string, radius: number, textClass: string, animationValues: string;

            if (isRoot) {
              color = '#4ade80'; // tailwind green-400
              colorRgba = 'rgba(74, 222, 128, 0.7)';
              radius = 16;
              textClass = 'fill-white font-extrabold text-xl';
              animationValues = '15;17;15';
            } else if (isThird) {
              color = '#f87171'; // tailwind red-400
              colorRgba = 'rgba(248, 113, 113, 0.7)';
              radius = 14;
              textClass = 'fill-white font-bold text-lg';
              animationValues = '13;15;13';
            } else {
              color = '#1ddaff'; // a cyan color
              colorRgba = 'rgba(29, 218, 255, 0.7)';
              radius = 12;
              textClass = 'fill-white font-bold text-base';
              animationValues = '11;13;11';
            }

            return (
              <g key={`${tone.name}-${index}`} className="pointer-events-none">
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={colorRgba}
                  stroke={color}
                  strokeWidth="2"
                >
                  <animate
                    attributeName="r"
                    values={animationValues}
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin={`${index * 0.1}s`}
                  />
                </circle>
                <text
                  x={x}
                  y={y}
                  dy="0.35em"
                  textAnchor="middle"
                  className={textClass}
                >
                  {tone.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="px-6 pb-4 text-base text-gray-400">
        <h3 className="font-bold text-lg text-gray-300 mb-2 text-center">Legende</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-300 ring-2 ring-yellow-400/50"></div>
            <span>Grundton / Tonart</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-pink-500"></div>
            <span>Akkord der Progression</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-white border-2 border-purple-400"></div>
            <span>Aktueller Akkord</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gray-700 border border-gray-500"></div>
            <span>Ton der Tonleiter</span>
          </div>

          <div className="col-span-2 mt-2 pt-2 border-t border-white/10" />

          <div className="flex items-start space-x-2 col-span-2">
            <div className="w-4 h-4 rounded-full bg-green-400 flex-shrink-0 mt-0.5"></div>
            <div>
              <span className="font-semibold">Grundton (des Akkords)</span>
              <p className="text-xs text-gray-500 leading-tight">Der wichtigste Ton.</p>
            </div>
          </div>
          <div className="flex items-start space-x-2 col-span-2">
            <div className="w-4 h-4 rounded-full bg-red-400 flex-shrink-0 mt-0.5"></div>
            <div>
              <span className="font-semibold">Die Terz</span>
              <p className="text-xs text-gray-500 leading-tight">Bestimmt Dur/Moll.</p>
            </div>
          </div>
          <div className="flex items-start space-x-2 col-span-2">
            <div className="w-4 h-4 rounded-full bg-cyan-400 flex-shrink-0 mt-0.5"></div>
            <div>
              <span className="font-semibold">Andere Akkordtöne</span>
              <p className="text-xs text-gray-500 leading-tight">Färben den Sound.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CircleOfFifths);
