import React, { useState, useEffect } from 'react';
import { DrumStep, CustomDrumPattern } from '../types';

interface DrumPatternEditorProps {
    onClose: () => void;
    onSave: (name: string, pattern: (DrumStep | null)[], originalName?: string) => void;
    existingPattern: CustomDrumPattern | null;
    allPatterns: CustomDrumPattern[];
}

const DRUM_INSTRUMENTS = ['kick', 'snare', 'hihat'] as const;

const DrumPatternEditor: React.FC<DrumPatternEditorProps> = ({ onClose, onSave, existingPattern, allPatterns }) => {
    const [pattern, setPattern] = useState<(DrumStep | null)[]>(
        () => existingPattern?.pattern || Array(8).fill(null).map(() => ({}))
    );
    const [name, setName] = useState(existingPattern?.name || '');
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        if (existingPattern) {
            setName(existingPattern.name);
            // Deep copy the pattern to avoid mutating the original state
            setPattern(JSON.parse(JSON.stringify(existingPattern.pattern)));
        }
    }, [existingPattern]);
    
    const toggleStep = (stepIndex: number, instrument: keyof DrumStep) => {
        const newPattern = [...pattern];
        const currentStep = { ...(newPattern[stepIndex] || {}) };
        currentStep[instrument] = !currentStep[instrument];
        
        // If all instruments are false, set the step to null for cleaner data
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
            setNameError('Der Name darf nicht leer sein.');
            return;
        }
        
        // Check if name already exists, unless it's the pattern we are currently editing
        const isNameTaken = allPatterns.some(p => p.name.toLowerCase() === trimmedName.toLowerCase() && p.name !== existingPattern?.name);
        if (isNameTaken) {
            setNameError('Dieser Name wird bereits verwendet.');
            return;
        }

        onSave(trimmedName, pattern, existingPattern?.name);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (nameError) {
            setNameError('');
        }
    }

    return (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drum-editor-title"
          onClick={onClose}
        >
          <div 
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <header className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 id="drum-editor-title" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                {existingPattern ? 'Drum-Pattern bearbeiten' : 'Neues Drum-Pattern erstellen'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700"
                aria-label="Schließen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
    
            <main className="p-6 text-gray-300 space-y-4">
                <div>
                    <label htmlFor="pattern-name" className="block text-sm font-medium text-gray-400 mb-1">Pattern-Name</label>
                    <input 
                        type="text"
                        id="pattern-name"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="z.B. Mein cooler Beat"
                        className={`w-full bg-gray-900 border ${nameError ? 'border-red-500' : 'border-gray-600'} rounded-md p-2 text-white focus:outline-none focus:ring-2 ${nameError ? 'focus:ring-red-500' : 'focus:ring-purple-500'}`}
                    />
                    {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
                </div>

                <div className="grid grid-cols-8 gap-1 md:gap-2">
                    {DRUM_INSTRUMENTS.map(instrument => (
                        <React.Fragment key={instrument}>
                            {Array.from({ length: 8 }).map((_, stepIndex) => {
                                const isActive = pattern[stepIndex]?.[instrument] ?? false;
                                return (
                                    <button
                                        key={`${instrument}-${stepIndex}`}
                                        onClick={() => toggleStep(stepIndex, instrument)}
                                        aria-label={`${instrument} step ${stepIndex + 1}`}
                                        aria-pressed={isActive}
                                        className={`w-full h-12 md:h-16 rounded-md transition-all duration-150 transform
                                            ${isActive ? 'bg-purple-500 shadow-lg scale-105' : 'bg-gray-700 hover:bg-gray-600'}
                                            ${stepIndex % 4 === 0 ? 'border-l-2 border-gray-500' : ''}
                                        `}
                                    >
                                       <span className="sr-only">{instrument}</span>
                                    </button>
                                );
                            })}
                        </React.Fragment>
                    ))}
                    {/* Labels */}
                    {DRUM_INSTRUMENTS.map(instrument => (
                       <p key={`label-${instrument}`} className="col-span-8 -mt-2 text-left text-xs text-gray-400 capitalize pl-1">{instrument}</p>
                    ))}
                </div>
            </main>
    
            <footer className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Speichern
              </button>
            </footer>
          </div>
        </div>
      );
};

export default DrumPatternEditor;
