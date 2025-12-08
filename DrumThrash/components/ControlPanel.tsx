import React, { useRef } from 'react';
import { MusicKey, Scale, DrumPattern, SynthPreset, ArpeggiatorDirection, ArpeggiatorRate, HarmonyInterval, CustomDrumPattern } from '../types';
import { MUSIC_KEYS, DRUM_PATTERNS, PRESET_PROGRESSIONS, SYNTH_PRESETS, ARPEGGIATOR_RATES, ARPEGGIATOR_DIRECTIONS, HARMONY_INTERVALS } from '../constants';
import { getRelativeMinor, getRelativeMajor } from '../services/musicTheoryService';

interface ControlPanelProps {
  musicKey: MusicKey;
  scale: Scale;
  onKeyGroupChange: (majorKey: MusicKey) => void;
  drumPattern: DrumPattern | string;
  onDrumPatternChange: (pattern: string) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  kickVolume: number;
  onKickVolumeChange: (level: number) => void;
  snareVolume: number;
  onSnareVolumeChange: (level: number) => void;
  hihatVolume: number;
  onHihatVolumeChange: (level: number) => void;
  synthVolume: number;
  onSynthVolumeChange: (level: number) => void;
  bassVolume: number;
  onBassVolumeChange: (level: number) => void;
  kickPan: number;
  onKickPanChange: (pan: number) => void;
  snarePan: number;
  onSnarePanChange: (pan: number) => void;
  hihatPan: number;
  onHihatPanChange: (pan: number) => void;
  synthPan: number;
  onSynthPanChange: (pan: number) => void;
  selectedPresetIndex: number;
  onPresetChange: (index: number) => void;
  synthPreset: SynthPreset;
  onSynthPresetChange: (preset: SynthPreset) => void;
  useInversions: boolean;
  onUseInversionsChange: (enabled: boolean) => void;
  synthOctave: number;
  onSynthOctaveChange: (octave: number) => void;
  synthFilterCutoff: number;
  onSynthFilterCutoffChange: (freq: number) => void;
  synthFilterResonance: number;
  onSynthFilterResonanceChange: (q: number) => void;
  voicingVariation: boolean;
  onVoicingVariationChange: (enabled: boolean) => void;
  spreadVoicing: boolean;
  onSpreadVoicingChange: (enabled: boolean) => void;
  harmonyInterval: HarmonyInterval | null;
  onHarmonyIntervalChange: (interval: HarmonyInterval | null) => void;
  harmonyVolume: number;
  onHarmonyVolumeChange: (level: number) => void;
  arpeggiatorEnabled: boolean;
  onArpeggiatorEnabledChange: (enabled: boolean) => void;
  arpeggiatorRate: ArpeggiatorRate;
  onArpeggiatorRateChange: (rate: ArpeggiatorRate) => void;
  arpeggiatorDirection: ArpeggiatorDirection;
  onArpeggiatorDirectionChange: (direction: ArpeggiatorDirection) => void;
  arpeggiatorGate: number;
  onArpeggiatorGateChange: (gate: number) => void;
  onRandomize: () => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportMidi: () => void;
  onGenerateWithAi: () => void;
  isLoading: boolean;
  isOnline: boolean;
  customDrumPatterns: CustomDrumPattern[];
  onOpenDrumEditor: (name?: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  musicKey, scale, onKeyGroupChange,
  drumPattern, onDrumPatternChange, bpm, onBpmChange,
  kickVolume, onKickVolumeChange, snareVolume, onSnareVolumeChange, hihatVolume, onHihatVolumeChange,
  synthVolume, onSynthVolumeChange,
  bassVolume, onBassVolumeChange,
  kickPan, onKickPanChange, snarePan, onSnarePanChange, hihatPan, onHihatPanChange, synthPan, onSynthPanChange,
  selectedPresetIndex, onPresetChange,
  synthPreset, onSynthPresetChange,
  useInversions, onUseInversionsChange,
  synthOctave, onSynthOctaveChange,
  synthFilterCutoff, onSynthFilterCutoffChange,
  synthFilterResonance, onSynthFilterResonanceChange,
  voicingVariation, onVoicingVariationChange,
  spreadVoicing, onSpreadVoicingChange,
  harmonyInterval, onHarmonyIntervalChange,
  harmonyVolume, onHarmonyVolumeChange,
  arpeggiatorEnabled, onArpeggiatorEnabledChange,
  arpeggiatorRate, onArpeggiatorRateChange,
  arpeggiatorDirection, onArpeggiatorDirectionChange,
  arpeggiatorGate, onArpeggiatorGateChange,
  onRandomize, isPlaying, onPlayToggle,
  onSave, onLoad, onExportMidi, onGenerateWithAi, isLoading, isOnline,
  customDrumPatterns, onOpenDrumEditor,
}) => {
  const loadInputRef = useRef<HTMLInputElement>(null);

  const selectClasses = "bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-full disabled:opacity-50";
  const buttonClasses = "px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  const iconButtonClasses = "px-4 py-2 rounded-md font-semibold text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

  const octaveLabels: { [key: number]: string } = {
    '-1': 'Bass',
    '0': 'Normal',
    '1': 'Hoch',
    '2': 'Sehr Hoch'
  };
  
  const formatPan = (pan: number): string => {
    if (pan === 0) return 'Center';
    if (pan < 0) return `${Math.abs(pan).toFixed(1)} L`;
    return `${pan.toFixed(1)} R`;
  };

  const isCustomPattern = customDrumPatterns.some(p => p.name === drumPattern);
  
  const selectedKeyGroup = scale === 'Major' ? musicKey : getRelativeMajor(musicKey);

  return (
    <div className="mt-8 space-y-6">
      {/* --- CORE PROGRESSION SETTINGS --- */}
      <div>
        <label htmlFor="preset-select" className="block text-sm font-medium text-gray-400 mb-1">Preset-Progressionen</label>
        <select 
          id="preset-select" 
          value={selectedPresetIndex} 
          onChange={(e) => onPresetChange(Number(e.target.value))} 
          className={selectClasses}
          disabled={isPlaying || isLoading}
          aria-label="Wähle eine voreingestellte Akkordprogression"
        >
          <option value={-1}>-- Eigene Progression --</option>
          {PRESET_PROGRESSIONS.map((p, index) => <option key={p.name} value={index}>{p.name}</option>)}
        </select>
      </div>
       <div className="pt-2">
          <button 
            onClick={onGenerateWithAi} 
            disabled={isPlaying || isLoading || !isOnline} 
            className={`${buttonClasses} w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center`} 
            title={!isOnline ? "KI-Funktionen sind offline nicht verfügbar" : "Mit KI eine Progression erstellen"}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" />
            </svg>
            <span className="ml-2">Mit KI erstellen</span>
          </button>
        </div>
      
      <div>
        <label htmlFor="key-group-select" className="block text-sm font-medium text-gray-400 mb-1">Tonart</label>
        <select 
          id="key-group-select" 
          value={selectedKeyGroup} 
          onChange={(e) => onKeyGroupChange(e.target.value as MusicKey)} 
          className={selectClasses} 
          disabled={isPlaying || isLoading}
        >
          {MUSIC_KEYS.map(k => {
            const relativeMinor = getRelativeMinor(k);
            return (
              <option key={k} value={k}>{`${k} / ${relativeMinor}m`}</option>
            );
          })}
        </select>
      </div>
      
      <div>
        <label htmlFor="bpm-slider" className="block text-sm font-medium text-gray-400 mb-1">Tempo: {bpm} BPM</label>
        <input id="bpm-slider" type="range" min="40" max="240" value={bpm} onChange={(e) => onBpmChange(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
      </div>

      {/* --- MAIN ACTIONS --- */}
      <div className="grid grid-cols-2 items-center gap-4 pt-4 border-t border-gray-700">
        <button onClick={onRandomize} disabled={isPlaying || isLoading} className={`${buttonClasses} w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center`} title="Zufällige Tonart und Progression (R)">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.536a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
           <span className="ml-2 hidden md:inline">Zufall</span>
        </button>
        <button onClick={onPlayToggle} disabled={isLoading} className={`${buttonClasses} w-full flex items-center justify-center ${isPlaying ? 'bg-pink-600 hover:bg-pink-700' : 'bg-green-600 hover:bg-green-700'}`}>
          {isPlaying ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> )}
          <span className="ml-2">{isPlaying ? 'Pause' : 'Start'}</span>
        </button>
      </div>

      {/* --- FILE & EXPORTS --- */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-gray-700">
        <button onClick={onSave} className={iconButtonClasses} disabled={isPlaying || isLoading} title="Jam speichern">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm5 2a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1V5a1 1 0 00-1-1H9zM6 12a1 1 0 00-1 1v1a1 1 0 001 1h8a1 1 0 001-1v-1a1 1 0 00-1-1H6z" clipRule="evenodd" /></svg>
            <span className="ml-2">Speichern</span>
        </button>
        <button onClick={() => loadInputRef.current?.click()} className={iconButtonClasses} disabled={isPlaying || isLoading} title="Jam laden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span className="ml-2">Laden</span>
        </button>
        <input type="file" ref={loadInputRef} onChange={onLoad} accept=".json" className="hidden" />
        <button onClick={onExportMidi} className={iconButtonClasses} disabled={isPlaying || isLoading} title="MIDI exportieren">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" /></svg>
            <span className="ml-2">MIDI</span>
        </button>
      </div>

      {/* --- ACCOMPANIMENT SETTINGS --- */}
      <div className="pt-4 border-t border-gray-700">
          <h3 className="text-center text-lg font-semibold text-gray-400 mb-4">Begleitungseinstellungen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* --- DRUM SETTINGS --- */}
              <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
                  <h4 className="font-bold text-center text-purple-300">Schlagzeug</h4>
                  <div>
                      <label htmlFor="drum-select" className="block text-sm font-medium text-gray-400 mb-1">Rhythmus</label>
                      <div className="flex items-center gap-2">
                        <select id="drum-select" value={drumPattern} onChange={(e) => onDrumPatternChange(e.target.value)} className={selectClasses} disabled={isLoading}>
                            <optgroup label="Presets">
                                {DRUM_PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
                            </optgroup>
                            {customDrumPatterns.length > 0 && (
                                <optgroup label="Eigene Patterns">
                                    {customDrumPatterns.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                </optgroup>
                            )}
                        </select>
                        <button onClick={() => onOpenDrumEditor(isCustomPattern ? drumPattern : undefined)} className={`${iconButtonClasses} flex-shrink-0`} title={isCustomPattern ? "Eigenes Pattern bearbeiten" : "Neues Pattern erstellen"}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                        </button>
                      </div>
                  </div>
                  <div>
                      <label htmlFor="kick-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Kick Vol: {kickVolume} dB</label>
                      <input id="kick-volume-slider" type="range" min="-48" max="6" step="1" value={kickVolume} onChange={(e) => onKickVolumeChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                   <div>
                      <label htmlFor="kick-pan-slider" className="block text-sm font-medium text-gray-400 mb-1">Kick Pan: {formatPan(kickPan)}</label>
                      <input id="kick-pan-slider" type="range" min="-1" max="1" step="0.1" value={kickPan} onChange={(e) => onKickPanChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  </div>
                   <div>
                      <label htmlFor="snare-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Snare Vol: {snareVolume} dB</label>
                      <input id="snare-volume-slider" type="range" min="-48" max="6" step="1" value={snareVolume} onChange={(e) => onSnareVolumeChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                   <div>
                      <label htmlFor="snare-pan-slider" className="block text-sm font-medium text-gray-400 mb-1">Snare Pan: {formatPan(snarePan)}</label>
                      <input id="snare-pan-slider" type="range" min="-1" max="1" step="0.1" value={snarePan} onChange={(e) => onSnarePanChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  </div>
                   <div>
                      <label htmlFor="hihat-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Hi-hat Vol: {hihatVolume} dB</label>
                      <input id="hihat-volume-slider" type="range" min="-48" max="6" step="1" value={hihatVolume} onChange={(e) => onHihatVolumeChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div>
                      <label htmlFor="hihat-pan-slider" className="block text-sm font-medium text-gray-400 mb-1">Hi-hat Pan: {formatPan(hihatPan)}</label>
                      <input id="hihat-pan-slider" type="range" min="-1" max="1" step="0.1" value={hihatPan} onChange={(e) => onHihatPanChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  </div>
              </div>
              {/* --- SYNTH SETTINGS --- */}
              <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
                  <h4 className="font-bold text-center text-purple-300">Synth</h4>
                  <div>
                      <label htmlFor="synth-preset-select" className="block text-sm font-medium text-gray-400 mb-1">Klang</label>
                      <select id="synth-preset-select" value={synthPreset} onChange={(e) => onSynthPresetChange(e.target.value as SynthPreset)} className={selectClasses} disabled={isPlaying || isLoading}>
                          {SYNTH_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                  </div>
                   <div>
                      <label htmlFor="synth-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Lautstärke: {synthVolume} dB</label>
                      <input id="synth-volume-slider" type="range" min="-48" max="0" step="1" value={synthVolume} onChange={(e) => onSynthVolumeChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                   <div>
                      <label htmlFor="synth-pan-slider" className="block text-sm font-medium text-gray-400 mb-1">Synth Pan: {formatPan(synthPan)}</label>
                      <input id="synth-pan-slider" type="range" min="-1" max="1" step="0.1" value={synthPan} onChange={(e) => onSynthPanChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  </div>
                   <div>
                      <label htmlFor="filter-cutoff-slider" className="block text-sm font-medium text-gray-400 mb-1">Helligkeit: {Math.round(synthFilterCutoff / 1000)} kHz</label>
                      <input id="filter-cutoff-slider" type="range" min="200" max="15000" step="100" value={synthFilterCutoff} onChange={(e) => onSynthFilterCutoffChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div>
                      <label htmlFor="filter-resonance-slider" className="block text-sm font-medium text-gray-400 mb-1">Resonanz: {synthFilterResonance.toFixed(1)}</label>
                      <input id="filter-resonance-slider" type="range" min="0.5" max="20" step="0.1" value={synthFilterResonance} onChange={(e) => onSynthFilterResonanceChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div>
                      <label htmlFor="synth-octave-slider" className="block text-sm font-medium text-gray-400 mb-1">Oktave: {octaveLabels[synthOctave] || 'Normal'}</label>
                      <input id="synth-octave-slider" type="range" min="-1" max="2" step="1" value={synthOctave} onChange={(e) => onSynthOctaveChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" disabled={isPlaying || isLoading} />
                  </div>
                  <div className="flex items-center justify-between">
                      <label htmlFor="inversions-toggle" className="text-sm font-medium text-gray-400">Smarte Umkehrungen</label>
                      <button role="switch" aria-checked={useInversions} id="inversions-toggle" onClick={() => onUseInversionsChange(!useInversions)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useInversions ? 'bg-purple-600' : 'bg-gray-600'}`} disabled={isPlaying || isLoading}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useInversions ? 'translate-x-6' : 'translate-x-1'}`}/>
                      </button>
                  </div>
                  <div className="flex items-center justify-between">
                      <label htmlFor="voicing-variation-toggle" className="text-sm font-medium text-gray-400">Voicing-Variation</label>
                      <button role="switch" aria-checked={voicingVariation} id="voicing-variation-toggle" onClick={() => onVoicingVariationChange(!voicingVariation)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${voicingVariation ? 'bg-purple-600' : 'bg-gray-600'}`} disabled={isPlaying || isLoading || !useInversions} aria-describedby="voicing-variation-description">
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${voicingVariation ? 'translate-x-6' : 'translate-x-1'}`}/>
                      </button>
                  </div>
                  <div className="flex items-center justify-between">
                      <label htmlFor="spread-voicing-toggle" className="text-sm font-medium text-gray-400">Spread Voicing</label>
                      <button role="switch" aria-checked={spreadVoicing} id="spread-voicing-toggle" onClick={() => onSpreadVoicingChange(!spreadVoicing)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${spreadVoicing ? 'bg-purple-600' : 'bg-gray-600'}`} disabled={isPlaying || isLoading}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${spreadVoicing ? 'translate-x-6' : 'translate-x-1'}`}/>
                      </button>
                  </div>

                  {/* Arpeggiator Section */}
                  <div className="pt-4 border-t border-gray-600/50 space-y-4">
                      <div className="flex items-center justify-between">
                          <label htmlFor="arp-toggle" className="text-sm font-bold text-purple-300">Arpeggiator</label>
                          <button role="switch" aria-checked={arpeggiatorEnabled} id="arp-toggle" onClick={() => onArpeggiatorEnabledChange(!arpeggiatorEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${arpeggiatorEnabled ? 'bg-purple-600' : 'bg-gray-600'}`} disabled={isPlaying || isLoading}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${arpeggiatorEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                          </button>
                      </div>
                      <div>
                        <label htmlFor="arp-rate-select" className="block text-sm font-medium text-gray-400 mb-1">Rate</label>
                        <select id="arp-rate-select" value={arpeggiatorRate} onChange={(e) => onArpeggiatorRateChange(e.target.value as ArpeggiatorRate)} className={selectClasses} disabled={!arpeggiatorEnabled || isPlaying || isLoading}>
                            {ARPEGGIATOR_RATES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="arp-direction-select" className="block text-sm font-medium text-gray-400 mb-1">Richtung</label>
                        <select id="arp-direction-select" value={arpeggiatorDirection} onChange={(e) => onArpeggiatorDirectionChange(e.target.value as ArpeggiatorDirection)} className={selectClasses} disabled={!arpeggiatorEnabled || isPlaying || isLoading}>
                            {ARPEGGIATOR_DIRECTIONS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                          <label htmlFor="arp-gate-slider" className="block text-sm font-medium text-gray-400 mb-1">Gate: {arpeggiatorGate.toFixed(2)}</label>
                          <input id="arp-gate-slider" type="range" min="0.1" max="1.0" step="0.05" value={arpeggiatorGate} onChange={(e) => onArpeggiatorGateChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" disabled={!arpeggiatorEnabled}/>
                      </div>
                  </div>
              </div>
              {/* --- BASS SETTINGS --- */}
              <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
                  <h4 className="font-bold text-center text-purple-300">Bass</h4>
                  <div>
                      <label htmlFor="bass-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Lautstärke: {bassVolume} dB</label>
                      <input id="bass-volume-slider" type="range" min="-48" max="6" step="1" value={bassVolume} onChange={(e) => onBassVolumeChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
              </div>
               {/* --- HARMONY SETTINGS --- */}
              <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
                  <h4 className="font-bold text-center text-purple-300">Diatonische Harmonie</h4>
                   <div role="radiogroup" className="grid grid-cols-3 gap-2">
                        {['Aus', ...HARMONY_INTERVALS].map(item => {
                            const isChecked = (harmonyInterval === null && item === 'Aus') || harmonyInterval === item;
                            return (
                                <div key={item}>
                                    <input
                                        type="radio"
                                        id={`harmony-${item}`}
                                        name="harmony-interval"
                                        value={item}
                                        checked={isChecked}
                                        onChange={() => onHarmonyIntervalChange(item === 'Aus' ? null : item as HarmonyInterval)}
                                        className="sr-only"
                                        disabled={isPlaying || isLoading}
                                    />
                                    <label
                                        htmlFor={`harmony-${item}`}
                                        className={`block w-full text-center py-2 px-1 text-sm font-semibold rounded-md cursor-pointer transition-colors ${
                                            isChecked
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                        } ${isPlaying || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {item}
                                    </label>
                                </div>
                            );
                        })}
                   </div>
                  <div>
                      <label htmlFor="harmony-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Lautstärke: {harmonyVolume} dB</label>
                      <input id="harmony-volume-slider" type="range" min="-48" max="0" step="1" value={harmonyVolume} onChange={(e) => onHarmonyVolumeChange(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500" disabled={harmonyInterval === null} />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ControlPanel;