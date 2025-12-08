import React from 'react';

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">
      {children}
    </kbd>
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 id="tutorial-title" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Willkommen beim Jam Buddy!
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

        <main className="p-6 overflow-y-auto text-gray-300 space-y-4">
          <p>Hier ist eine kurze Anleitung, wie du das Beste aus deinem Jam Buddy herausholst:</p>

          <div>
            <h3 className="text-lg font-semibold text-purple-300 mt-2 mb-1">1. Akkorde erstellen</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Presets:</strong> Wähle eine klassische Akkordfolge aus der Liste "Preset-Progressionen", um sofort loszulegen.</li>
              <li><strong>Zufall:</strong> Klicke auf "Zufall", um eine zufällige Tonart und Preset-Kombination zu erhalten – perfekt für neue Ideen!</li>
              <li><strong>Manuell:</strong> Klicke direkt auf einen Akkord, um ihn selbst zu bearbeiten.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-purple-300 mt-2 mb-1">2. Deinen Jam anpassen</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Tonart & Tonleiter:</strong> Lege die Grundlage für deine Improvisation.</li>
              <li><strong>Tempo (BPM):</strong> Passe die Geschwindigkeit mit dem Schieberegler an.</li>
              <li><strong>Schlagzeug-Rhythmus & Synth-Sound:</strong> Ändere den Rhythmus und den Klang der Begleitung nach deinem Geschmack.</li>
              <li><strong>Lautstärke:</strong> Mische Schlagzeug und Synth-Akkorde mit den Lautstärkereglern perfekt ab.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-purple-300 mt-2 mb-1">3. Tastatursteuerung</h3>
            <div className="space-y-2 pl-2">
              <p className="font-semibold">Globale Steuerung:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                <li><Key>Leertaste</Key>: Start / Pause</li>
                <li><Key>R</Key>: Zufällige Progression & Tonart</li>
                <li><Key>H</Key> oder <Key>?</Key>: Diese Hilfe anzeigen</li>
              </ul>
              <p className="font-semibold pt-2">Akkordbearbeitung:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                <li><Key>←</Key> / <Key>→</Key>: Zwischen Akkorden navigieren</li>
                <li><Key>↑</Key> / <Key>↓</Key>: Durch Akkordvarianten wechseln (z.B. C → Cm → C7)</li>
                <li><Key>Esc</Key>: Akkordvorschläge schließen</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-purple-300 mt-4 mb-1">4. Analysieren & Exportieren</h3>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong>Progressions-Visualisierer:</strong> Sieh dir deine Akkorde auf dem Quintenzirkel an.
                <ul className="list-['-_'] list-inside space-y-1 pl-6 mt-2 text-sm text-gray-400">
                  <li><strong className="text-yellow-300">Gelb (pulsierend):</strong> Markiert den Grundton – das tonale Zentrum deiner Tonart.</li>
                  <li><strong className="text-pink-400">Pink:</strong> Hebt alle Akkorde hervor, die Teil deiner aktuellen Progression sind.</li>
                  <li><strong className="text-white">Weiß (Spotlight):</strong> Zeigt den Akkord, der gerade spielt.</li>
                  <li><strong className="text-cyan-400">Cyan (kleine Kreise):</strong> Zerlegt den aktiven Akkord in seine Noten.</li>
                  <li><strong className="text-red-400">Rot (kleiner Kreis):</strong> Hebt die Terz hervor – den wichtigsten Ton, der den Charakter des Akkords (Dur/Moll) bestimmt!</li>
                </ul>
              </li>
              <li>
                <strong>Speichern & Laden:</strong> Speichere deine Jam-Session als Datei und lade sie später wieder.
              </li>
              <li><strong>Exportieren:</strong> Lade deinen Track als MIDI-Datei herunter, um ihn in deiner DAW zu verwenden.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-300 mt-4 mb-1">Hinweis für Mobilgeräte</h3>
            <p className="pl-2">Stelle sicher, dass der Stumm-Schalter deines iPhones nicht aktiviert ist, da Web-Audio sonst stummgeschaltet wird.</p>
          </div>
        </main>

        <footer className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Verstanden!
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Tutorial;