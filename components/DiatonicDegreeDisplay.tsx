
import React, { useMemo } from 'react';
import { MusicKey, Scale } from '../types';
import { getRomanNumeral } from '../services/musicTheoryService';
import Tooltip from './Tooltip';

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
    <Tooltip
      content="Zeigt die Funktion jedes Akkords innerhalb der Tonart an (Stufentheorie). Lila Stufen sind diatonisch (leitereigen), graue Stufen mit gestricheltem Rand sind leiterfremd (geborgt)."
      position="top"
      className="w-full"
    >
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
                  ? 'bg-primary-500/80 text-white scale-110 shadow-[0_0_15px_rgba(168,85,247,0.6)] backdrop-blur-sm'
                  : isDiatonic
                    ? 'bg-white/10 text-primary-300'
                    : 'bg-white/5 text-gray-400 border border-dashed border-white/10'
                }
                `}
              title={isDiatonic ? `${progression[index]} ist diatonisch` : `${progression[index]} ist nicht-diatonisch`}
            >
              {degree}
            </div>
          );
        })}
      </div>
    </Tooltip>
  );
};

export default React.memo(DiatonicDegreeDisplay);
