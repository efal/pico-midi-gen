import React, { useState } from 'react';

interface AiGeneratorProps {
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

const AiGenerator: React.FC<AiGeneratorProps> = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  const examplePrompts = [
    "Trauriger Blues in A-Moll",
    "Fröhlicher Funk-Groove zum Tanzen",
    "Epische Rock-Ballade",
    "Verträumter Lo-Fi-Beat",
    "Spannungsgeladener Soundtrack"
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-generator-title"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 id="ai-generator-title" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Akkorde mit KI erstellen
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

        <form onSubmit={handleSubmit}>
          <main className="p-6 text-gray-300 space-y-4">
            <div>
              <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-400 mb-2">
                Beschreibe die Stimmung, den Stil oder das Genre, das du möchtest:
              </label>
              <textarea
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="z.B. eine entspannte Jazz-Progression..."
                rows={3}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>
             <div>
                <p className="text-sm text-gray-400 mb-2">Oder probiere ein Beispiel:</p>
                <div className="flex flex-wrap gap-2">
                    {examplePrompts.map(p => (
                        <button key={p} type="button" onClick={() => handleExampleClick(p)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors">
                            {p}
                        </button>
                    ))}
                </div>
            </div>
          </main>

          <footer className="p-4 border-t border-gray-700 flex justify-end">
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="px-6 py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Generieren
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AiGenerator;
