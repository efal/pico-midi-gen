import React, { useMemo } from 'react';
import { MusicKey, Scale } from '../types';
import { getRomanNumeral } from '../services/musicTheoryService';

interface DiatonicDegreeDisplayProps {
  progression: string[];
  musicKey: MusicKey;
  scale: Scale;
  currentChordIndex: number | null;
}

const DiatonicDegreeDisplay: React.FC<DiatonicDegreeDisplayProps> = ({
  progression,
  musicKey,
  scale,
  currentChordIndex,
}) => {
  const degrees = useMemo(() => {
    return progression.map(chord => getRomanNumeral(chord, musicKey, scale));
  }, [progression, musicKey, scale]);

  const isRomanNumeral = (s: string) => /[ivIV]/.test(s);

  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 text-center" aria-label="Diatonische Stufen">
      {degrees.map((degree, index) => {
        const isActive = index === currentChordIndex;
        const isDiatonic = isRomanNumeral(degree);
        
        return (
          <div
            key={index}
            className={`
              py-2 px-1 rounded-md text-sm font-bold
              transition-all duration-200 ease-in-out
              ${isActive
                ? 'bg-purple-500 text-white scale-110 shadow-md'
                : isDiatonic
                ? 'bg-gray-700/60 text-purple-300'
                : 'bg-gray-800/50 text-gray-500 border border-dashed border-gray-600'
              }
            `}
            title={isDiatonic ? `${progression[index]} ist diatonisch` : `${progression[index]} ist nicht-diatonisch`}
          >
            {degree}
          </div>
        );
      })}
    </div>
  );
};

export default DiatonicDegreeDisplay;