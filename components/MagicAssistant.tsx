import React, { useState } from 'react';
import { MidiComponent } from '../types';
import { parseNaturalLanguageConfig } from '../services/geminiService';

interface Props {
  currentComponents: MidiComponent[];
  onAddComponents: (components: MidiComponent[]) => void;
  onClose: () => void;
}

export const MagicAssistant: React.FC<Props> = ({ currentComponents, onAddComponents, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError('');
    
    try {
      const newComponents = await parseNaturalLanguageConfig(prompt, currentComponents);
      onAddComponents(newComponents);
      onClose();
    } catch (e) {
      setError('Failed to generate configuration. Please check the API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl transform transition-all scale-100">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Magic Assistant
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <p className="text-gray-400 mb-4 text-sm">
            Describe your hardware setup. For example: <br/>
            <span className="italic text-gray-500">"I have 4 faders on pins 26-29 for channel volume, and a mute button on pin 2."</span>
        </p>

        <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-gray-200 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 focus:outline-none mb-4 min-h-[120px]"
            placeholder="Type your setup description here..."
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-600 to-indigo-600 text-white font-medium hover:from-accent-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Thinking...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Generate Config
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};