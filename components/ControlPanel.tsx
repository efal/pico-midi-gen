
import React, { useRef } from 'react';
import { MusicKey, Scale, DrumPattern, SynthPreset, ArpeggiatorDirection, ArpeggiatorRate, HarmonyInterval, CustomDrumPattern, CustomSynthPreset, SynthConfig } from '../types';
import { MUSIC_KEYS, DRUM_PATTERNS, PRESET_PROGRESSIONS, SYNTH_PRESETS, ARPEGGIATOR_RATES, ARPEGGIATOR_DIRECTIONS, HARMONY_INTERVALS } from '../constants';
import { getRelativeMinor, getRelativeMajor } from '../services/musicTheoryService';
import { AudioService } from '../services/audioService';
import Tooltip from './Tooltip';
import { IconPlay, IconPause, IconStop, IconRandom, IconMagic, IconSave, IconLoad, IconDownload, IconEdit, IconTrash, IconPlus } from './Icons';

const OSCILLATOR_TYPES = ['fatsawtooth', 'fatsquare', 'fmsine', 'sine', 'pulse', 'fatsine', 'sawtooth', 'square'];

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
  bassPan: number;
  onBassPanChange: (pan: number) => void;
  selectedPresetIndex: number;
  onPresetChange: (index: number) => void;

  synthPresetName: string;
  onSynthPresetNameChange: (name: string) => void;
  synthConfig: SynthConfig;
  onSynthConfigChange: (config: SynthConfig) => void;
  customSynthPresets: CustomSynthPreset[];
  onSaveCustomSynthPreset: () => void;

  useInversions: boolean;
  onUseInversionsChange: (enabled: boolean) => void;
  synthOctave: number;
  onSynthOctaveChange: (octave: number) => void;
  voicingVariation: boolean;
  onVoicingVariationChange: (enabled: boolean) => void;
  spreadVoicing: boolean;
  onSpreadVoicingChange: (enabled: boolean) => void;
  harmonyInterval: HarmonyInterval | null;
  onHarmonyIntervalChange: (interval: HarmonyInterval | null) => void;
  harmonyVolume: number;
  onHarmonyVolumeChange: (level: number) => void;
  harmonyPan: number;
  onHarmonyPanChange: (pan: number) => void;
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
  isPaused?: boolean;
  onPlayToggle: () => void;
  onStop?: () => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportMidi: () => void;
  isLoading: boolean;
  isOnline: boolean;
  customDrumPatterns: CustomDrumPattern[];
  onOpenDrumEditor: (name?: string) => void;
  onDeleteCustomPattern: (name: string) => void;
  discoveredFeatures: Record<string, boolean>;
  onFeatureDiscovered: (featureName: string) => void;

  trainingMode: boolean;
  onTrainingModeChange: (enabled: boolean) => void;
  loopCount: number;
  onLoopCountChange: (count: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  musicKey, scale, onKeyGroupChange,
  drumPattern, onDrumPatternChange, bpm, onBpmChange,
  kickVolume, onKickVolumeChange, snareVolume, onSnareVolumeChange, hihatVolume, onHihatVolumeChange,
  synthVolume, onSynthVolumeChange,
  bassVolume, onBassVolumeChange,
  kickPan, onKickPanChange, snarePan, onSnarePanChange, hihatPan, onHihatPanChange,
  synthPan, onSynthPanChange, bassPan, onBassPanChange,
  selectedPresetIndex, onPresetChange,
  synthPresetName, onSynthPresetNameChange,
  synthConfig, onSynthConfigChange,
  customSynthPresets, onSaveCustomSynthPreset,
  useInversions, onUseInversionsChange,
  synthOctave, onSynthOctaveChange,
  voicingVariation, onVoicingVariationChange,
  spreadVoicing, onSpreadVoicingChange,
  harmonyInterval, onHarmonyIntervalChange,
  harmonyVolume, onHarmonyVolumeChange, harmonyPan, onHarmonyPanChange,
  arpeggiatorEnabled, onArpeggiatorEnabledChange,
  arpeggiatorRate, onArpeggiatorRateChange,
  arpeggiatorDirection, onArpeggiatorDirectionChange,
  arpeggiatorGate, onArpeggiatorGateChange,
  onRandomize, isPlaying, isPaused, onPlayToggle, onStop,
  onSave, onLoad, onExportMidi, isLoading, isOnline,
  customDrumPatterns, onOpenDrumEditor, onDeleteCustomPattern,
  discoveredFeatures, onFeatureDiscovered,
  trainingMode, onTrainingModeChange,
  loopCount, onLoopCountChange
}) => {
  const loadInputRef = useRef<HTMLInputElement>(null);

  const selectClasses = "input-neon w-full disabled:opacity-50 text-base font-medium";
  const buttonClasses = "btn-neon-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:border-gray-700 disabled:bg-gray-800/50";
  const iconButtonClasses = "btn-neon-secondary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

  const radioLabelClasses = (isChecked: boolean) =>
    `block w-full text-center py-2 px-1 text-sm font-bold rounded-lg cursor-pointer transition-all duration-300 ${isChecked
      ? 'bg-primary-600/80 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-primary-400/30'
      : 'bg-gray-800/40 text-gray-400 hover:bg-gray-700/60 border border-transparent hover:border-gray-600'
    } ${isPlaying || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`;


  const octaveLabels: { [key: number]: string } = {
    '-1': 'Bass',
    '0': 'Normal',
    '1': 'Hoch',
    '2': 'Sehr Hoch'
  };

  const formatPan = (pan: number): string => {
    if (Math.abs(pan) < 0.01) return 'C';
    const side = pan < 0 ? 'L' : 'R';
    const amount = Math.abs(pan * 100).toFixed(0);
    return `${side} ${amount}`;
  };

  const handlePanChange = (handler: (pan: number) => void, value: number) => {
    if (!discoveredFeatures.panning) {
      onFeatureDiscovered('panning');
    }
    handler(value);
  };

  const handleArpeggiatorToggle = (enabled: boolean) => {
    if (!discoveredFeatures.arpeggiator) {
      onFeatureDiscovered('arpeggiator');
    }
    onArpeggiatorEnabledChange(enabled);
  };

  const isCustomPattern = customDrumPatterns.some(p => p.name === drumPattern);

  const selectedKeyGroup = scale === 'Major' ? musicKey : getRelativeMajor(musicKey);

  const handleSynthPresetChange = (name: string) => {
    const builtIn = AudioService.synthPresets[name as SynthPreset];
    if (builtIn) {
      onSynthConfigChange({
        oscillator: builtIn.oscillator,
        envelope: builtIn.envelope,
        filter: { ...synthConfig.filter } // Keep current filter settings
      });
      onSynthPresetNameChange(name);
      return;
    }
    const custom = customSynthPresets.find(p => p.name === name);
    if (custom) {
      onSynthConfigChange(custom.config);
      onSynthPresetNameChange(name);
    }
  };

  const handleSynthParamChange = (path: string[], value: any) => {
    onSynthPresetNameChange('Custom');
    const newConfig = JSON.parse(JSON.stringify(synthConfig)); // Deep copy
    let current = newConfig;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onSynthConfigChange(newConfig);
  };

  return (
    <div className="mt-8 space-y-6 control-panel-area">
      {/* --- CORE PROGRESSION SETTINGS --- */}
      <Tooltip content="Wähle eine vordefinierte Akkordfolge, um schnell loszulegen. Dies ist ideal, um gängige Songstrukturen zu erkunden.">
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
      </Tooltip>


      <Tooltip content="Legt das tonale Zentrum für die Progression fest. Alle Akkorde werden relativ zu dieser Tonart und Tonleiter (Dur/Moll) berechnet.">
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
      </Tooltip>

      <Tooltip content="Stellt die Geschwindigkeit des Tracks in Schlägen pro Minute (BPM) ein." className="w-full">
        <div>
          <label htmlFor="bpm-slider" className="block text-sm font-medium text-gray-400 mb-1">Tempo: {bpm} BPM</label>
          <input id="bpm-slider" type="range" min="40" max="240" value={bpm} onChange={(e) => onBpmChange(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
        </div>
      </Tooltip>

      {/* TRAINING MODE TOGGLE */}
      <Tooltip content="Aktiviert den Loop-Trainer: Spielt die gewählte Anzahl an Durchgängen, dann Stopp, Reset und Neustart.">
        <div className="flex flex-col gap-2 glass-card p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-purple-300">Loop-Trainer</span>
              <span className="text-xs text-gray-400">Auto-Reset nach {loopCount} Loops</span>
            </div>
            <button role="switch" aria-checked={trainingMode} onClick={() => onTrainingModeChange(!trainingMode)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${trainingMode ? 'bg-purple-500' : 'bg-gray-600'}`} disabled={isPlaying || isLoading}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${trainingMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {trainingMode && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600/50">
              <span className="text-xs text-gray-400">Anzahl Loops:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => onLoopCountChange(count)}
                    className={`w-6 h-6 text-xs rounded-full flex items-center justify-center transition-colors ${loopCount === count
                      ? 'bg-purple-500 text-white font-bold'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                      }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Tooltip>

      {/* --- MAIN ACTIONS --- */}
      <div className="grid grid-cols-[1fr_2fr] items-center gap-2 pt-4 border-t border-gray-700">
        <Tooltip content="Wählt eine zufällige Tonart und eine zufällige Preset-Progression aus. Perfekt für neue Inspiration!">
          <button onClick={onRandomize} disabled={isPlaying || isLoading} className={`${buttonClasses} w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center`} title="Zufällige Tonart und Progression (R)">
            <IconRandom className="h-5 w-5 mr-2" />
            <span className="ml-2 hidden md:inline">Zufall</span>
          </button>
        </Tooltip>
        <div className="flex gap-2 w-full">
          <Tooltip content={isPlaying ? (isPaused ? "Wiedergabe fortsetzen" : "Wiedergabe pausieren") : "Startet die Wiedergabe. Du kannst auch die Leertaste verwenden."} className="flex-grow">
            <button onClick={onPlayToggle} disabled={isLoading} className={`${buttonClasses} w-full flex items-center justify-center ${isPlaying ? 'bg-pink-600 hover:bg-pink-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {isPlaying && !isPaused ? <IconPause className="h-6 w-6" /> : <IconPlay className="h-6 w-6" />}
              <span className="ml-2">{isPlaying ? (isPaused ? 'Weiter' : 'Pause') : 'Start'}</span>
            </button>
          </Tooltip>
          {isPlaying && (
            <Tooltip content="Stoppt die Wiedergabe und setzt den Cursor zurück.">
              <button onClick={onStop} className={`${buttonClasses} px-4 bg-red-600 hover:bg-red-700`} title="Stop">
                <IconStop className="h-6 w-6" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* --- FILE & EXPORTS --- */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-gray-700">
        <Tooltip content="Speichert deine aktuelle Session (Progression, Soundeinstellungen etc.) als JSON-Datei auf deinem Gerät.">
          <button onClick={onSave} className={iconButtonClasses} disabled={isPlaying || isLoading} title="Jam speichern">
            <IconSave className="h-5 w-5 mr-2" />
            <span className="ml-2">Speichern</span>
          </button>
        </Tooltip>
        <Tooltip content="Lädt eine zuvor gespeicherte Jam-Session aus einer JSON-Datei.">
          <button onClick={() => loadInputRef.current?.click()} className={iconButtonClasses} disabled={isPlaying || isLoading} title="Jam laden">
            <IconLoad className="h-3.5 w-3.5 mr-2" />
            <span className="ml-2">Laden</span>
          </button>
        </Tooltip>
        <input type="file" ref={loadInputRef} onChange={onLoad} accept=".json" className="hidden" />
        <Tooltip content="Exportiert die aktuelle Progression als MIDI-Datei, die du in deiner Digital Audio Workstation (DAW) weiterverwenden kannst.">
          <button onClick={onExportMidi} className={iconButtonClasses} disabled={isPlaying || isLoading} title="MIDI exportieren">
            <IconDownload className="h-3.5 w-3.5 mr-2" />
            <span className="ml-2">MIDI</span>
          </button>
        </Tooltip>
      </div>

      {/* --- ACCOMPANIMENT SETTINGS --- */}
      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-center text-lg font-semibold text-gray-400 mb-4">Begleitungseinstellungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* --- DRUM SETTINGS --- */}
          <div className="glass-card p-4 space-y-4">
            <h4 className="font-bold text-center text-purple-300">Schlagzeug</h4>
            <Tooltip content="Wähle einen Schlagzeug-Rhythmus. Klicke auf den Stift, um eigene Rhythmen zu erstellen oder zu bearbeiten.">
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
                    {isCustomPattern ? <IconEdit className="h-5 w-5" /> : <IconPlus className="h-5 w-5" />}
                  </button>
                  {isCustomPattern && (
                    <Tooltip content="Dieses Pattern löschen" position="top">
                      <button onClick={() => onDeleteCustomPattern(drumPattern as string)} className={`${iconButtonClasses} flex-shrink-0 !bg-red-800/50 hover:!bg-red-700/50`} title="Pattern löschen">
                        <IconTrash className="h-5 w-5" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </Tooltip>
            <div className="space-y-2">
              <Tooltip content="Regelt die Lautstärke der Bassdrum.">
                <div>
                  <label htmlFor="kick-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Kick Vol: {kickVolume} dB</label>
                  <input id="kick-volume-slider" type="range" min="-48" max="6" step="1" value={kickVolume} onChange={(e) => onKickVolumeChange(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
              </Tooltip>
              <Tooltip content="Positioniert die Bassdrum im Stereobild. 'L' ist links, 'C' ist Mitte, 'R' ist rechts.">
                <div className="relative">
                  <label htmlFor="kick-pan-slider" className="block text-sm font-medium text-gray-400 mb-1">
                    Kick Pan: {formatPan(kickPan)}
                  </label>
                  {!discoveredFeatures.panning && (
                    <span className="absolute left-[-14px] top-1 w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse-glow" title="Neue Funktion: Panorama"></span>
                  )}
                  <input id="kick-pan-slider" type="range" min="-100" max="100" step="1" value={kickPan * 100} onChange={(e) => handlePanChange(onKickPanChange, Number(e.target.value) / 100)} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
              </Tooltip>
            </div>
            <div className="space-y-2">
              <Tooltip content="Regelt die Lautstärke der Snare-Drum.">
                <div>
                  <label htmlFor="snare-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Snare Vol: {snareVolume} dB</label>
                  <input id="snare-volume-slider" type="range" min="-48" max="6" step="1" value={snareVolume} onChange={(e) => onSnareVolumeChange(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
              </Tooltip>
              <Tooltip content="Positioniert die Snare-Drum im Stereobild.">
                <div>
                  <label htmlFor="snare-pan-slider" className="block text-sm font-medium text-gray-400 mb-1">Snare Pan: {formatPan(snarePan)}</label>
                  <input id="snare-pan-slider" type="range" min="-100" max="100" step="1" value={snarePan * 100} onChange={(e) => handlePanChange(onSnarePanChange, Number(e.target.value) / 100)} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
              </Tooltip>
            </div>
            <div className="space-y-2">
              <Tooltip content="Regelt die Lautstärke der Hi-Hat.">
                <div>
                  <label htmlFor="hihat-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Hi-Hat Vol: {hihatVolume} dB</label>
                  <input id="hihat-volume-slider" type="range" min="-48" max="6" step="1" value={hihatVolume} onChange={(e) => onHihatVolumeChange(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
              </Tooltip>
              <Tooltip content="Positioniert die Hi-Hat im Stereobild.">
                <div>
                  <label htmlFor="hihat-pan-slider" className="block text-sm font-medium text-gray-400 mb-1">Hi-Hat Pan: {formatPan(hihatPan)}</label>
                  <input id="hihat-pan-slider" type="range" min="-100" max="100" step="1" value={hihatPan * 100} onChange={(e) => handlePanChange(onHihatPanChange, Number(e.target.value) / 100)} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
              </Tooltip>
            </div>
          </div>
          {/* --- SYNTH SETTINGS --- */}
          <div className="glass-card p-4 space-y-4">
            <h4 className="font-bold text-center text-purple-300">Synth</h4>
            <Tooltip content="Wähle einen voreingestellten Klang für die Akkorde. Unter 'Synthesizer-Design' kannst du den Sound detailliert anpassen.">
              <div>
                <label htmlFor="synth-preset-select" className="block text-sm font-medium text-gray-400 mb-1">Klang</label>
                <select id="synth-preset-select" value={synthPresetName} onChange={(e) => handleSynthPresetChange(e.target.value)} className={selectClasses} disabled={isPlaying || isLoading}>
                  {synthPresetName === 'Custom' && <option value="Custom">-- Eigene Einstellung --</option>}
                  <optgroup label="Presets">
                    {SYNTH_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                  </optgroup>
                  {customSynthPresets.length > 0 && (
                    <optgroup label="Eigene Presets">
                      {customSynthPresets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </optgroup>
                  )}
                </select>
              </div>
            </Tooltip>
            <div className="space-y-2">
              <Tooltip content="Regelt die Gesamtlautstärke des Synthesizers.">
                <div>
                  <label htmlFor="synth-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Lautstärke: {synthVolume} dB</label>
                  <input id="synth-volume-slider" type="range" min="-48" max="0" step="1" value={synthVolume} onChange={(e) => onSynthVolumeChange(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
              </Tooltip>
              <Tooltip content="Positioniert den Synthesizer im Stereobild.">
                <div>
                  <label htmlFor="synth-pan-slider" className="block text-sm font-medium text-gray-400 mb-1">Panorama: {formatPan(synthPan)}</label>
                  <input id="synth-pan-slider" type="range" min="-100" max="100" step="1" value={synthPan * 100} onChange={(e) => handlePanChange(onSynthPanChange, Number(e.target.value) / 100)} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
              </Tooltip>
            </div>

            <Tooltip content="Klappe diesen Bereich aus, um den Synthesizer-Klang von Grund auf zu gestalten. Änderungen erstellen ein 'Custom'-Preset, das du speichern kannst.">
              <details className="pt-2 border-t border-gray-600/50">
                <summary className="cursor-pointer text-purple-300 font-semibold">Synthesizer-Design</summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="osc-type-select" className="block text-sm font-medium text-gray-400 mb-1">Oszillator-Typ</label>
                    <select id="osc-type-select" value={synthConfig.oscillator.type} onChange={(e) => handleSynthParamChange(['oscillator', 'type'], e.target.value)} className={selectClasses}>
                      {OSCILLATOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="env-attack-slider" className="block text-sm font-medium text-gray-400 mb-1">Attack: {synthConfig.envelope.attack.toFixed(2)}s</label>
                    <input id="env-attack-slider" type="range" min="0.01" max="2" step="0.01" value={synthConfig.envelope.attack} onChange={(e) => handleSynthParamChange(['envelope', 'attack'], Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div>
                    <label htmlFor="env-decay-slider" className="block text-sm font-medium text-gray-400 mb-1">Decay: {synthConfig.envelope.decay.toFixed(2)}s</label>
                    <input id="env-decay-slider" type="range" min="0.01" max="2" step="0.01" value={synthConfig.envelope.decay} onChange={(e) => handleSynthParamChange(['envelope', 'decay'], Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div>
                    <label htmlFor="env-sustain-slider" className="block text-sm font-medium text-gray-400 mb-1">Sustain: {synthConfig.envelope.sustain.toFixed(2)}</label>
                    <input id="env-sustain-slider" type="range" min="0" max="1" step="0.01" value={synthConfig.envelope.sustain} onChange={(e) => handleSynthParamChange(['envelope', 'sustain'], Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div>
                    <label htmlFor="env-release-slider" className="block text-sm font-medium text-gray-400 mb-1">Release: {synthConfig.envelope.release.toFixed(2)}s</label>
                    <input id="env-release-slider" type="range" min="0.01" max="4" step="0.01" value={synthConfig.envelope.release} onChange={(e) => handleSynthParamChange(['envelope', 'release'], Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div>
                    <label htmlFor="filter-cutoff-slider" className="block text-sm font-medium text-gray-400 mb-1">Helligkeit: {Math.round(synthConfig.filter.cutoff / 1000)} kHz</label>
                    <input id="filter-cutoff-slider" type="range" min="200" max="15000" step="100" value={synthConfig.filter.cutoff} onChange={(e) => handleSynthParamChange(['filter', 'cutoff'], Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div>
                    <label htmlFor="filter-resonance-slider" className="block text-sm font-medium text-gray-400 mb-1">Resonanz: {synthConfig.filter.resonance.toFixed(1)}</label>
                    <input id="filter-resonance-slider" type="range" min="0.5" max="20" step="0.1" value={synthConfig.filter.resonance} onChange={(e) => handleSynthParamChange(['filter', 'resonance'], Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div className="pt-2">
                    <button onClick={onSaveCustomSynthPreset} className={`${iconButtonClasses} w-full`}>
                      Aktuellen Sound speichern...
                    </button>
                  </div>
                </div>
              </details>
            </Tooltip>

            <div className="pt-2 border-t border-gray-600/50 space-y-4">
              <h4 className="font-bold text-center text-purple-300">Voicing</h4>
              <Tooltip content="Verschiebt die Akkorde um ganze Oktaven nach oben oder unten.">
                <div>
                  <label htmlFor="synth-octave-slider" className="block text-sm font-medium text-gray-400 mb-1">Oktave: {octaveLabels[synthOctave] || 'Normal'}</label>
                  <input id="synth-octave-slider" type="range" min="-1" max="2" step="1" value={synthOctave} onChange={(e) => onSynthOctaveChange(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" disabled={isPlaying || isLoading} />
                </div>
              </Tooltip>
              <Tooltip content="Spielt die Akkorde in verschiedenen Umkehrungen, um weichere Übergänge und weniger Sprünge in der Melodieführung zu erzeugen.">
                <div className="flex items-center justify-between">
                  <label htmlFor="inversions-toggle" className="text-sm font-medium text-gray-400">Smarte Umkehrungen</label>
                  <button role="switch" aria-checked={useInversions} id="inversions-toggle" onClick={() => onUseInversionsChange(!useInversions)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useInversions ? 'bg-purple-600' : 'bg-gray-600'}`} disabled={isPlaying || isLoading}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useInversions ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </Tooltip>
              <Tooltip content="Bringt leichte Abwechslung in die Akkordumkehrungen, um die Begleitung lebendiger klingen zu lassen. Benötigt 'Smarte Umkehrungen'.">
                <div className="flex items-center justify-between">
                  <label htmlFor="voicing-variation-toggle" className="text-sm font-medium text-gray-400">Voicing-Variation</label>
                  <button role="switch" aria-checked={voicingVariation} id="voicing-variation-toggle" onClick={() => onVoicingVariationChange(!voicingVariation)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${voicingVariation ? 'bg-purple-600' : 'bg-gray-600'}`} disabled={isPlaying || isLoading || !useInversions} aria-describedby="voicing-variation-description">
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${voicingVariation ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </Tooltip>
              <Tooltip content="Spielt die Akkorde in einer weiteren Lage (offener), was oft voller und breiter klingt.">
                <div className="flex items-center justify-between">
                  <label htmlFor="spread-voicing-toggle" className="text-sm font-medium text-gray-400">Spread Voicing</label>
                  <button role="switch" aria-checked={spreadVoicing} id="spread-voicing-toggle" onClick={() => onSpreadVoicingChange(!spreadVoicing)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${spreadVoicing ? 'bg-purple-600' : 'bg-gray-600'}`} disabled={isPlaying || isLoading}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${spreadVoicing ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </Tooltip>
            </div>

            {/* Arpeggiator Section */}
            <div className="pt-4 border-t border-gray-600/50 space-y-4">
              <Tooltip content="Spielt die Noten eines Akkords nacheinander ab, anstatt gleichzeitig. Erzeugt eine rhythmische, melodische Textur.">
                <div className="relative flex items-center justify-between">
                  {!discoveredFeatures.arpeggiator && (
                    <span className="absolute left-[-14px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse-glow" title="Neue Funktion: Arpeggiator"></span>
                  )}
                  <label htmlFor="arp-toggle" className="text-sm font-bold text-purple-300">Arpeggiator</label>
                  <button role="switch" aria-checked={arpeggiatorEnabled} id="arp-toggle" onClick={() => handleArpeggiatorToggle(!arpeggiatorEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${arpeggiatorEnabled ? 'bg-purple-600' : 'bg-gray-600'}`} disabled={isPlaying || isLoading}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${arpeggiatorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </Tooltip>
              <div className={`${arpeggiatorEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'} space-y-4 transition-opacity`}>
                <div>
                  <p className="block text-sm font-medium text-gray-400 mb-1">Rate</p>
                  <div role="radiogroup" className="grid grid-cols-3 gap-2">
                    {ARPEGGIATOR_RATES.map(r => (
                      <div key={r}>
                        <input type="radio" id={`arp-rate-${r}`} name="arp-rate" value={r} checked={arpeggiatorRate === r} onChange={() => onArpeggiatorRateChange(r)} className="sr-only" disabled={!arpeggiatorEnabled || isPlaying || isLoading} />
                        <label htmlFor={`arp-rate-${r}`} className={radioLabelClasses(arpeggiatorRate === r)}>{r}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-400 mb-1">Richtung</p>
                  <div role="radiogroup" className="grid grid-cols-2 gap-2">
                    {ARPEGGIATOR_DIRECTIONS.map(d => (
                      <div key={d}>
                        <input type="radio" id={`arp-dir-${d}`} name="arp-dir" value={d} checked={arpeggiatorDirection === d} onChange={() => onArpeggiatorDirectionChange(d)} className="sr-only" disabled={!arpeggiatorEnabled || isPlaying || isLoading} />
                        <label htmlFor={`arp-dir-${d}`} className={radioLabelClasses(arpeggiatorDirection === d)}>{d.charAt(0).toUpperCase() + d.slice(1)}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="arp-gate-slider" className="block text-sm font-medium text-gray-400 mb-1">Gate: {arpeggiatorGate.toFixed(2)}</label>
                  <input id="arp-gate-slider" type="range" min="0.1" max="1.0" step="0.05" value={arpeggiatorGate} onChange={(e) => onArpeggiatorGateChange(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" disabled={!arpeggiatorEnabled} />
                </div>
              </div>
            </div>
          </div>
          {/* --- BASS SETTINGS --- */}
          <Tooltip content="Steuert die Lautstärke und das Panning der Basslinie, die immer den Grundton des aktuellen Akkords spielt.">
            <div className="glass-card p-4 space-y-4">
              <h4 className="font-bold text-center text-purple-300">Bass</h4>
              <div className="space-y-2">
                <label htmlFor="bass-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Lautstärke: {bassVolume} dB</label>
                <input id="bass-volume-slider" type="range" min="-48" max="6" step="1" value={bassVolume} onChange={(e) => onBassVolumeChange(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                <label htmlFor="bass-pan-slider" className="block text-sm font-medium text-gray-400 mb-1">Panorama: {formatPan(bassPan)}</label>
                <input id="bass-pan-slider" type="range" min="-100" max="100" step="1" value={bassPan * 100} onChange={(e) => handlePanChange(onBassPanChange, Number(e.target.value) / 100)} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
              </div>
            </div>
          </Tooltip>
          {/* --- HARMONY SETTINGS --- */}
          <Tooltip content="Fügt eine zweite, harmonisch passende Stimme hinzu, die dem Grundton des Akkords in einem festen Intervall folgt.">
            <div className="glass-card p-4 space-y-4">
              <h4 className="font-bold text-center text-purple-300">Diatonische Harmonie</h4>
              <div role="radiogroup" className="grid grid-cols-3 gap-2">
                {['Aus', ...HARMONY_INTERVALS].map(item => {
                  const isChecked = (harmonyInterval === null && item === 'Aus') || harmonyInterval === item;
                  return (
                    <div key={item}>
                      <input type="radio" id={`harmony-${item}`} name="harmony-interval" value={item} checked={isChecked} onChange={() => onHarmonyIntervalChange(item === 'Aus' ? null : item as HarmonyInterval)} className="sr-only" disabled={isPlaying || isLoading} />
                      <label htmlFor={`harmony-${item}`} className={radioLabelClasses(isChecked)}>{item}</label>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2">
                <label htmlFor="harmony-volume-slider" className="block text-sm font-medium text-gray-400 mb-1">Lautstärke: {harmonyVolume} dB</label>
                <input id="harmony-volume-slider" type="range" min="-48" max="0" step="1" value={harmonyVolume} onChange={(e) => onHarmonyVolumeChange(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" disabled={harmonyInterval === null} />
                <label htmlFor="harmony-pan-slider" className="block text-sm font-medium text-gray-400 mb-1">Panorama: {formatPan(harmonyPan)}</label>
                <input id="harmony-pan-slider" type="range" min="-100" max="100" step="1" value={harmonyPan * 100} onChange={(e) => handlePanChange(onHarmonyPanChange, Number(e.target.value) / 100)} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" disabled={harmonyInterval === null} />
              </div>
            </div>
          </Tooltip>
        </div >
      </div >
    </div >
  );
};

export default ControlPanel;
