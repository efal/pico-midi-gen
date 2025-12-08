import React, { useState, useRef, useEffect } from 'react';
import { AudioService } from '../services/audioService';

interface ChordDisplayProps {
  progression: string[];
  currentChordIndex: number | null;
  onChordChange: (index: number, newChord: string) => void;
  isPlaying: boolean;
}

// A curated list of common chord suffixes for cycling with arrow keys.
const CHORD_SUFFIXES = ['', 'm', 'maj7', '7', 'm7', 'm7b5', 'dim7', '9', 'maj9', 'm9', '13', '7b9'];

const ChordDisplay: React.FC<ChordDisplayProps> = ({ progression, currentChordIndex, onChordChange, isPlaying }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const chordRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Ensure refs array is in sync with the progression length
    chordRefs.current = chordRefs.current.slice(0, progression.length);
  }, [progression]);


  // Enhanced suggestion logic
  const generateSuggestions = (chord: string): string[] => {
    const rootMatch = chord.match(/^[A-G]#?/);
    if (!rootMatch) return [];
    const root = rootMatch[0];
    
    const commonSuffixes = ['m7', 'maj7', '7', '9', '13'];
    
    const suggestions = commonSuffixes
      .map(suffix => `${root}${suffix}`)
      .filter(suggestion => suggestion.toLowerCase() !== chord.toLowerCase());

    return suggestions.slice(0, 4);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // We need to check if the new focused element is a child of the current div.
    // If it is, we don't want to close the suggestions.
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setEditingIndex(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, index: number) => {
    // Navigation is always active
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % progression.length;
      chordRefs.current[nextIndex]?.focus();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + progression.length) % progression.length;
      chordRefs.current[prevIndex]?.focus();
      return;
    }
    
    const isEditing = editingIndex === index;

    if (isEditing) {
      // Actions for when in edit mode
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentChord = progression[index];
        const rootMatch = currentChord.match(/^[A-G][#b]?/);
        if (!rootMatch) return;
        const root = rootMatch[0];
        const currentSuffix = currentChord.substring(root.length);
        
        const currentIndex = CHORD_SUFFIXES.indexOf(currentSuffix);
        const direction = e.key === 'ArrowUp' ? 1 : -1;
        
        let nextIndex = (currentIndex === -1) 
          ? (direction === 1 ? 1 : CHORD_SUFFIXES.length - 1)
          : (currentIndex + direction + CHORD_SUFFIXES.length) % CHORD_SUFFIXES.length;
        
        const newChord = `${root}${CHORD_SUFFIXES[nextIndex]}`;
        onChordChange(index, newChord);
      } else if (e.key === 'Escape' || e.key === 'Enter') {
        setEditingIndex(null);
        (e.target as HTMLElement).blur();
      }
    } else {
      // Actions for when in display mode
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setEditingIndex(index);
      }
    }
  };

  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 text-center">
      {progression.map((chord, index) => {
        const isActive = index === currentChordIndex;
        const isEditing = editingIndex === index;
        const suggestions = generateSuggestions(chord);

        const chordTones = isActive
          ? AudioService.getChordNotes(chord, 0).map(note => note.replace(/[0-9]/g, ''))
          : [];

        const rootNote = chord.match(/^[A-G][#b]?/)?.[0];

        const rootMatch = chord.match(/^[A-G][#b]?/);
        const root = rootMatch ? rootMatch[0] : chord;
        const extension = rootMatch ? chord.substring(root.length) : '';

        return (
          <div
            key={index}
            id={`chord-container-${index}`}
            ref={el => { if (el) chordRefs.current[index] = el; }}
            className="relative group"
            onFocus={() => !isPlaying && setEditingIndex(index)}
            onBlur={handleBlur}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={isPlaying ? -1 : 0}
          >
            <div
              className={`
                p-1 rounded-lg border-2 flex flex-col items-center justify-center min-h-24 md:min-h-32
                transition-all duration-200 ease-in-out outline-none
                group-focus:ring-2 group-focus:ring-blue-400
                ${isActive
                  ? 'bg-purple-600 border-purple-400 scale-110 shadow-lg shadow-purple-500/30'
                  : 'bg-gray-700/50 border-gray-600'
                }
              `}
            >
              {isEditing && !isPlaying ? (
                <input
                  type="text"
                  value={chord}
                  onChange={(e) => onChordChange(index, e.target.value)}
                  autoFocus
                  aria-label={`Akkord ${index + 1}, wird bearbeitet`}
                  className="w-full h-full bg-transparent border-none outline-none text-center text-2xl md:text-3xl font-bold flex-grow text-white"
                  onKeyDown={(e) => {
                    const input = e.target as HTMLInputElement;
                    const isAtStart = input.selectionStart === 0 && input.selectionEnd === 0;
                    const isAtEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length;

                    // Allow navigation from edges of input
                    if ((e.key === 'ArrowLeft' && isAtStart) || (e.key === 'ArrowRight' && isAtEnd)) {
                        handleKeyDown(e, index);
                    // Pass other non-navigation, non-text-input keys up
                    } else if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        handleKeyDown(e, index);
                    }
                    // Otherwise, do nothing and let the input handle the key press (e.g. cursor movement)
                  }}
                />
              ) : (
                <div 
                  className={`w-full h-full flex flex-col items-center justify-center cursor-pointer ${isActive ? 'text-white' : 'text-gray-300'}`}
                  onClick={() => !isPlaying && setEditingIndex(index)}
                  aria-label={`Akkord ${index + 1}: ${chord}`}
                >
                  <span className="text-2xl md:text-3xl font-bold leading-tight">{root}</span>
                  {extension && (
                    <span className="text-lg md:text-xl font-normal text-gray-400 -mt-1">{extension}</span>
                  )}
                </div>
              )}

               {/* Visual feedback for chord tones */}
               {isActive && chordTones.length > 1 && !isEditing && (
                <div className="flex items-center justify-center gap-1 md:gap-2 p-1 animate-fade-in">
                  {chordTones.filter(t => t !== rootNote).map((tone, i) => (
                    <span
                      key={`${tone}-${i}`}
                      className="text-xs md:text-sm font-semibold text-gray-300"
                    >
                      {tone}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {isEditing && !isPlaying && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-gray-800 border border-gray-600 rounded-md shadow-lg p-2 grid grid-cols-2 gap-2">
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      onChordChange(index, suggestion);
                      setEditingIndex(null); 
                    }}
                    onMouseDown={(e) => e.preventDefault()} // Prevents blur from firing before click
                    className="bg-gray-700 hover:bg-purple-600 text-white font-semibold py-2 px-1 rounded-md text-sm transition-colors duration-150"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChordDisplay;