
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MusicKey, Scale, DrumPattern, JamState, SynthPreset, ArpeggiatorRate, ArpeggiatorDirection, HarmonyInterval, CustomDrumPattern, DrumStep, SynthConfig, CustomSynthPreset } from './types';
import { audioService, AudioService } from './services/audioService';
import { saveJam, loadJam, saveAutosave, loadAutosave } from './services/jamService';
import { transposeProgression, getRelativeMinor } from './services/musicTheoryService';
import { exportToMidi } from './services/midiService';

import ControlPanel from './components/ControlPanel';
import ChordDisplay from './components/ChordDisplay';
import DiatonicDegreeDisplay from './components/DiatonicDegreeDisplay';
import CircleOfFifths from './components/CircleOfFifths';
import Tutorial from './components/Tutorial';
import Loader from './components/Loader';

import DrumPatternEditor from './components/DrumPatternEditor';
import { PRESET_PROGRESSIONS, MUSIC_KEYS, DRUM_PATTERNS } from './constants';
import { IconRefresh, IconX, IconHelp } from './components/Icons';
import { saveCustomPatterns, loadCustomPatterns } from './services/drumPatternService';
import { saveCustomSynthPresets, loadCustomSynthPresets } from './services/synthPresetService';
import { useWakeLock } from './hooks/useWakeLock';

const defaultSynthConfig: SynthConfig = {
  oscillator: AudioService.synthPresets['Sawtooth'].oscillator,
  envelope: AudioService.synthPresets['Sawtooth'].envelope,
  filter: {
    cutoff: 8000,
    resonance: 1,
  },
};

// Possible states for the Trainer Mode
type PlaybackPhase = 'idle' | 'counting-in' | 'playing' | 'resetting';

const App: React.FC = () => {
  // State declarations
  const [musicKey, setMusicKey] = useState<MusicKey>('C');
  const [scale, setScale] = useState<Scale>('Major');
  const [drumPattern, setDrumPattern] = useState<DrumPattern | string>('Pop Rock');
  const [bpm, setBpm] = useState<number>(80);
  const [progression, setProgression] = useState<string[]>([]);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [currentChordIndex, setCurrentChordIndex] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<(() => Promise<void>) | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');

  const [trainingMode, setTrainingMode] = useState<boolean>(false);
  const [loopCount, setLoopCount] = useState<number>(2);
  const [playbackPhase, setPlaybackPhase] = useState<PlaybackPhase>('idle');
  const [countInBeat, setCountInBeat] = useState<number | null>(null); // Visual counter

  // Volumes
  const [kickVolume, setKickVolume] = useState<number>(-12);
  const [snareVolume, setSnareVolume] = useState<number>(-12);
  const [hihatVolume, setHihatVolume] = useState<number>(-12);
  const [synthVolume, setSynthVolume] = useState<number>(-12);
  const [bassVolume, setBassVolume] = useState<number>(-12);
  const [kickPan, setKickPan] = useState<number>(0);
  const [snarePan, setSnarePan] = useState<number>(0);
  const [hihatPan, setHihatPan] = useState<number>(0);
  const [synthPan, setSynthPan] = useState<number>(0);
  const [bassPan, setBassPan] = useState<number>(0);

  // Synth Config
  const [synthPresetName, setSynthPresetName] = useState<string>('Sawtooth');
  const [synthConfig, setSynthConfig] = useState<SynthConfig>(defaultSynthConfig);
  const [customSynthPresets, setCustomSynthPresets] = useState<CustomSynthPreset[]>([]);

  // UI & System State
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [audioState, setAudioState] = useState<'uninitialized' | 'initializing' | 'ready' | 'error'>('uninitialized');

  // Prevent screen sleep when audio is ready
  useWakeLock(audioState === 'ready');

  // Flag to prevent autosave from overwriting local storage with defaults during initialization
  const [isRestored, setIsRestored] = useState<boolean>(false);

  // Advanced Features
  const [useInversions, setUseInversions] = useState<boolean>(true);
  const [synthOctave, setSynthOctave] = useState<number>(0);
  const [voicingVariation, setVoicingVariation] = useState<boolean>(true);
  const [spreadVoicing, setSpreadVoicing] = useState<boolean>(true);

  const [harmonyInterval, setHarmonyInterval] = useState<HarmonyInterval | null>(null);
  const [harmonyVolume, setHarmonyVolume] = useState<number>(-20);
  const [harmonyPan, setHarmonyPan] = useState<number>(0);

  const [arpeggiatorEnabled, setArpeggiatorEnabled] = useState<boolean>(false);
  const [arpeggiatorRate, setArpeggiatorRate] = useState<ArpeggiatorRate>('16n');
  const [arpeggiatorDirection, setArpeggiatorDirection] = useState<ArpeggiatorDirection>('up');
  const [arpeggiatorGate, setArpeggiatorGate] = useState<number>(0.8);

  const [customDrumPatterns, setCustomDrumPatterns] = useState<CustomDrumPattern[]>([]);
  const [showDrumEditor, setShowDrumEditor] = useState(false);
  const [editingDrumPattern, setEditingDrumPattern] = useState<CustomDrumPattern | null>(null);

  const [discoveredFeatures, setDiscoveredFeatures] = useState<Record<string, boolean>>({});

  // --- Initialization & Persistence ---

  useEffect(() => {
    // 1. Load Custom Assets
    setCustomDrumPatterns(loadCustomPatterns());
    setCustomSynthPresets(loadCustomSynthPresets());

    // 2. Load Tutorial Status
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    // 3. Load Features
    try {
      const storedFeatures = localStorage.getItem('discoveredFeatures');
      if (storedFeatures) {
        setDiscoveredFeatures(JSON.parse(storedFeatures));
      }
    } catch (e) {
      console.error("Failed to load discovered features:", e);
    }

    // 4. Load Autosave (The "Resume" functionality)
    const savedState = loadAutosave();
    if (savedState) {
      // Apply saved state
      setBpm(savedState.bpm);
      setMusicKey(savedState.musicKey);
      setScale(savedState.scale);
      setProgression(savedState.progression);
      setDrumPattern(savedState.drumPattern);
      setKickVolume(savedState.kickVolume);
      setSnareVolume(savedState.snareVolume);
      setHihatVolume(savedState.hihatVolume);
      setSynthVolume(savedState.synthVolume);
      setBassVolume(savedState.bassVolume);
      setKickPan(savedState.kickPan);
      setSnarePan(savedState.snarePan);
      setHihatPan(savedState.hihatPan);
      setSynthPan(savedState.synthPan);
      setBassPan(savedState.bassPan);
      setSelectedPresetIndex(savedState.selectedPresetIndex);
      setSynthPresetName(savedState.synthPresetName);
      setSynthConfig(savedState.synthConfig);
      setUseInversions(savedState.useInversions);
      setSynthOctave(savedState.synthOctave);
      setVoicingVariation(savedState.voicingVariation);
      setSpreadVoicing(savedState.spreadVoicing);
      setHarmonyInterval(savedState.harmonyInterval);
      setHarmonyVolume(savedState.harmonyVolume);
      setHarmonyPan(savedState.harmonyPan);
      setArpeggiatorEnabled(savedState.arpeggiatorEnabled);
      setArpeggiatorRate(savedState.arpeggiatorRate);
      setArpeggiatorDirection(savedState.arpeggiatorDirection);
      setArpeggiatorDirection(savedState.arpeggiatorDirection);
      setArpeggiatorGate(savedState.arpeggiatorGate);
      setLoopCount(savedState.loopCount || 2);

      // Merge saved custom assets if necessary (though we loaded fresh from their own storage)
      // The dedicated storage (customDrumPatternService) is the source of truth for *definitions*,
      // but the jam state holds the *references* (names).
    } else {
      // Initialize with default progression if no save
      const preset = PRESET_PROGRESSIONS[0];
      if (preset) {
        const newProgression = transposeProgression('C', 'Major', preset.roman);
        setProgression(newProgression);
      }
    }

    // Mark as restored so the auto-save effect can start working
    setIsRestored(true);

  }, []);

  const handleFeatureDiscovered = useCallback((featureName: string) => {
    setDiscoveredFeatures(prev => {
      if (prev[featureName]) return prev; // Already discovered, no change needed
      const newFeatures = { ...prev, [featureName]: true };
      try {
        localStorage.setItem('discoveredFeatures', JSON.stringify(newFeatures));
      } catch (e) {
        console.error("Failed to save discovered features:", e);
      }
      return newFeatures;
    });
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const clearError = () => {
    setError(null);
    setRetryAction(null);
  };

  // Default Progression Logic (Only if no Autosave, implicitly handled by isRestored check logic in generic effect)
  // However, we moved default init to the mounting useEffect to avoid race conditions.

  // Effect to update progression when Preset/Key/Scale changes (User interaction)
  // We need to be careful not to overwrite loaded progression on mount.
  // The loading logic sets selectedPresetIndex. 
  // If we load a custom progression (index -1), this effect won't destroy it.
  useEffect(() => {
    // Only run if we are fully restored and interaction happens
    if (!isRestored) return;

    if (selectedPresetIndex > -1) {
      const preset = PRESET_PROGRESSIONS[selectedPresetIndex];
      if (preset) {
        const newProgression = transposeProgression(musicKey, scale, preset.roman);
        setProgression(newProgression);
      }
    }
  }, [selectedPresetIndex, musicKey, scale, isRestored]);

  // Construct the current state object
  const getCurrentJamState = useCallback((): JamState => ({
    progression, bpm, musicKey, scale, drumPattern,
    kickVolume, snareVolume, hihatVolume, kickPan, snarePan, hihatPan,
    synthVolume, bassVolume, synthPan, bassPan,
    selectedPresetIndex,
    synthPresetName, synthConfig, customSynthPresets,
    useInversions, synthOctave, voicingVariation, spreadVoicing,
    harmonyInterval, harmonyVolume, harmonyPan,
    arpeggiatorEnabled, arpeggiatorRate, arpeggiatorDirection, arpeggiatorGate,
    customDrumPatterns, loopCount
  }), [
    progression, bpm, musicKey, scale, drumPattern,
    kickVolume, snareVolume, hihatVolume, kickPan, snarePan, hihatPan,
    synthVolume, bassVolume, synthPan, bassPan,
    selectedPresetIndex, synthPresetName, synthConfig, customSynthPresets,
    useInversions, synthOctave, voicingVariation, spreadVoicing,
    harmonyInterval, harmonyVolume, harmonyPan,
    arpeggiatorEnabled, arpeggiatorRate, arpeggiatorDirection, arpeggiatorGate, customDrumPatterns, loopCount
  ]);

  // --- Auto-Save Effect ---
  useEffect(() => {
    if (!isRestored) return;

    const timeoutId = setTimeout(() => {
      saveAutosave(getCurrentJamState());
    }, 500); // Debounce save by 0.5 second

    return () => clearTimeout(timeoutId);
  }, [getCurrentJamState, isRestored]);

  const handleStop = useCallback(() => {
    audioService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setPlaybackPhase('idle');
    setCountInBeat(null);
    setCurrentChordIndex(null);
  }, []);

  const handleRandomize = useCallback(() => {
    if (isPlaying) {
      handleStop(); // Stop properly
    }
    const randomKeyIndex = Math.floor(Math.random() * MUSIC_KEYS.length);
    const randomPresetIndex = Math.floor(Math.random() * PRESET_PROGRESSIONS.length);

    const selectedPreset = PRESET_PROGRESSIONS[randomPresetIndex];
    const hasMinorTonic = selectedPreset.roman.some(numeral =>
      numeral.startsWith('i') && !['ii', 'iii', 'iv', 'vi', 'vii'].some(n => numeral.startsWith(n))
    );
    const newScale: Scale = hasMinorTonic ? 'Minor' : 'Major';

    setMusicKey(MUSIC_KEYS[randomKeyIndex]);
    setScale(newScale);
    setSelectedPresetIndex(randomPresetIndex);
  }, [isPlaying]);

  const resolveDrumPattern = useCallback((patternName: string): (DrumStep | null)[] => {
    if (DRUM_PATTERNS.includes(patternName as DrumPattern)) {
      return AudioService.drumPatterns[patternName as DrumPattern];
    }
    const customPattern = customDrumPatterns.find(p => p.name === patternName);
    return customPattern ? customPattern.pattern : AudioService.drumPatterns['Pop Rock'];
  }, [customDrumPatterns]);

  const handleInitializeAudio = async () => {
    if (audioState === 'ready' || audioState === 'initializing') return;

    setAudioState('initializing');
    setLoadingText('Audio wird initialisiert...');
    try {
      await audioService.init();
      setAudioState('ready');
    } catch (err: any) {
      setError(`Audio-Engine konnte nicht gestartet werden. Bitte lade die Seite neu. Fehler: ${err.message}`);
      setAudioState('error');
    }
  };

  // Apply audio settings whenever audioState is ready and values change
  useEffect(() => {
    if (audioState !== 'ready') return;
    // BPM is handled separately for instant feedback
    audioService.setKickVolume(kickVolume);
    audioService.setSnareVolume(snareVolume);
    audioService.setHihatVolume(hihatVolume);
    audioService.setSynthVolume(synthVolume);
    audioService.setBassVolume(bassVolume);
    audioService.setKickPan(kickPan);
    audioService.setSnarePan(snarePan);
    audioService.setHihatPan(hihatPan);
    audioService.setSynthPan(synthPan);
    audioService.setBassPan(bassPan);
    audioService.applySynthConfig(synthConfig);
    audioService.setUseInversions(useInversions);
    audioService.setSynthOctave(synthOctave);
    audioService.setVoicingVariation(voicingVariation);
    audioService.setSpreadVoicing(spreadVoicing);
    audioService.setHarmonyInterval(harmonyInterval);
    audioService.setHarmonyVolume(harmonyVolume);
    audioService.setHarmonyPan(harmonyPan);
    audioService.setArpeggiatorEnabled(arpeggiatorEnabled);
    audioService.setArpeggiatorRate(arpeggiatorRate);
    audioService.setArpeggiatorDirection(arpeggiatorDirection);
    audioService.setArpeggiatorGate(arpeggiatorGate);
  }, [
    audioState, kickVolume, snareVolume, hihatVolume, synthVolume, bassVolume,
    kickPan, snarePan, hihatPan, synthPan, bassPan,
    synthConfig, useInversions,
    synthOctave, voicingVariation, spreadVoicing, harmonyInterval, harmonyVolume, harmonyPan,
    arpeggiatorEnabled, arpeggiatorRate, arpeggiatorDirection, arpeggiatorGate
  ]);

  // Dedicated effect for instant BPM changes
  useEffect(() => {
    if (audioState === 'ready') {
      audioService.setBpm(bpm);
    }
  }, [audioState, bpm]);






  // Main Play/Pause Handler
  const handlePlayToggle = useCallback(async () => {
    if (audioState !== 'ready') return;
    if (progression.length === 0) return;

    if (isPlaying) {
      if (isPaused) {
        // RESUME
        audioService.resume();
        setIsPaused(false);
      } else {
        // PAUSE
        audioService.pause();
        setIsPaused(true);
      }
    } else {
      // START (Stopped -> Playing)
      setIsPaused(false);

      if (trainingMode) {
        setIsPlaying(true);
        runTrainingStep();
      } else {
        // Start Standard Playback
        const patternData = resolveDrumPattern(drumPattern);
        audioService.start(progression, patternData, setCurrentChordIndex);
        setIsPlaying(true);
      }
    }

  }, [audioState, isPlaying, isPaused, progression, trainingMode, drumPattern, resolveDrumPattern]);

  // Global Click Handler for Tap-to-Play
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Ignore if audio not ready
      if (audioState !== 'ready') return;

      const target = e.target as HTMLElement;

      // 1. Ignore interactive elements
      if (target.closest('button, input, select, a, label, [role="button"]')) {
        return;
      }

      // 2. Ignore specific UI areas (Control Panel, Drum Editor, etc.)
      if (target.closest('.control-panel-area') || target.closest('.drum-editor-overlay')) {
        return;
      }

      // 3. Toggle Playback
      handlePlayToggle();
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [audioState, handlePlayToggle]);

  // Sync loop count to audio service
  useEffect(() => {
    audioService.setLoopCount(loopCount);
  }, [loopCount]);


  // --- Loop Trainer Logic ---

  // Ref to track loop count for async callbacks
  const loopCountRef = useRef(loopCount);
  useEffect(() => {
    loopCountRef.current = loopCount;
  }, [loopCount]);

  // This function advances the training cycle state machine.
  // It is NOT a React hook, but an async function called recursively (via callbacks)
  const runTrainingStep = async () => {
    // Step 1: Count In Phase
    setPlaybackPhase('counting-in');
    setCurrentChordIndex(null);

    // Start visual beat counter (just for UI)
    let beat = 1;
    setCountInBeat(beat);
    const interval = setInterval(() => {
      beat++;
      if (beat <= 4) setCountInBeat(beat);
    }, 60000 / bpm);

    // Start Audio Count In (Async Promise)
    await audioService.playCountIn();

    // Cleanup UI Interval
    clearInterval(interval);
    setCountInBeat(null);

    // Step 2: Playing Phase
    setPlaybackPhase('playing');
    const patternData = resolveDrumPattern(drumPattern);

    // Start loops using the latest loop count from ref
    audioService.start(
      progression,
      patternData,
      setCurrentChordIndex,
      loopCountRef.current, // Use ref to get latest value
      () => {
        // On Ended Callback
        handleTrainingReset();
      }
    );
  };

  const handleTrainingReset = async () => {
    // Guard: If we are not playing anymore (user pressed stop), don't reset/restart
    setPlaybackPhase('resetting');
    setCurrentChordIndex(null);

    try {
      await audioService.reset();

      // Re-apply settings after hard reset using current state variables (closure captures them, 
      // but since we re-run this function, we need to be sure we are using latest. 
      // React closures in async functions can be stale. 
      // However, since audioService is a singleton and we push values to it via useEffect whenever they change,
      // the audioService state might be lost on reset, but the React Effect will re-push them?
      // NO: The Effect only runs on *change*. We need to explicitly re-push here because the AudioService wiped itself.

      if (audioState === 'ready') {
        audioService.setBpm(bpm);
        audioService.setKickVolume(kickVolume);
        audioService.setSnareVolume(snareVolume);
        audioService.setHihatVolume(hihatVolume);
        audioService.setSynthVolume(synthVolume);
        audioService.setBassVolume(bassVolume);
        audioService.applySynthConfig(synthConfig);
        audioService.setUseInversions(useInversions);
        audioService.setSynthOctave(synthOctave);
        audioService.setVoicingVariation(voicingVariation);
        audioService.setSpreadVoicing(spreadVoicing);
        audioService.setHarmonyInterval(harmonyInterval);
        audioService.setHarmonyVolume(harmonyVolume);
        audioService.setHarmonyPan(harmonyPan);
        audioService.setArpeggiatorEnabled(arpeggiatorEnabled);
        audioService.setArpeggiatorRate(arpeggiatorRate);
        audioService.setArpeggiatorDirection(arpeggiatorDirection);
        audioService.setArpeggiatorGate(arpeggiatorGate);
        audioService.setKickPan(kickPan);
        audioService.setSnarePan(snarePan);
        audioService.setHihatPan(hihatPan);
        audioService.setSynthPan(synthPan);
        audioService.setBassPan(bassPan);
      }
    } catch (e) {
      console.error("Reset failed:", e);
    }

    // Step 3: Restart Cycle (Recursive call after short delay)
    // Use setTimeout to clear the stack and allow UI updates
    setTimeout(() => {
      if (isPlayingRef.current) {
        runTrainingStep();
      } else {
        setPlaybackPhase('idle');
      }
    }, 500);
  };

  // Ref to track playing state for async callbacks
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);



  // Standard manual reset button handler


  // Sync playing status if audio service stops unexpectedly (though internal state is usually robust enough)
  useEffect(() => {
    if (isPlaying && trainingMode && playbackPhase === 'playing') {
      // Handled by the 'onEnded' callback in audioService.start
    } else if (isPlaying && !trainingMode) {
      // Logic for standard mode
    }
  }, [isPlaying, trainingMode, playbackPhase]);




  const handleRetry = async () => {
    if (retryAction) {
      await retryAction();
    }
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (audioState !== 'ready') return;

      const target = e.target as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        if (e.code === 'Space' && target.tagName !== 'INPUT') {
          // Allow it to proceed
        } else {
          return;
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayToggle();
      } else if (e.key.toLowerCase() === 'r' && !isPlaying) {
        e.preventDefault();
        handleRandomize();
      } else if (e.key.toLowerCase() === 'h' || e.key === '?') {
        e.preventDefault();
        setShowTutorial(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayToggle, handleRandomize, isPlaying, audioState]);


  const handleChordChange = (index: number, newChord: string) => {
    const newProgression = [...progression];
    newProgression[index] = newChord;
    setProgression(newProgression);
    setSelectedPresetIndex(-1);
  };

  const handleKeyGroupChange = (majorKey: MusicKey) => {
    let currentScale = scale;
    // If a preset is selected, determine scale from it.
    if (selectedPresetIndex > -1) {
      const preset = PRESET_PROGRESSIONS[selectedPresetIndex];
      if (preset) {
        const hasMinorTonic = preset.roman.some(numeral => numeral.startsWith('i'));
        currentScale = hasMinorTonic ? 'Minor' : 'Major';
      }
    } else {
      // Heuristic for custom progressions: check the first chord
      if (progression.length > 0) {
        const firstChord = progression[0];
        if (firstChord.includes('m') && !firstChord.includes('maj')) {
          currentScale = 'Minor';
        } else {
          currentScale = 'Major';
        }
      }
    }

    if (currentScale === 'Minor') {
      const minorKey = getRelativeMinor(majorKey);
      setMusicKey(minorKey);
      setScale('Minor');
    } else {
      setMusicKey(majorKey);
      setScale('Major');
    }
  };


  const handleSave = () => {
    try {
      saveJam(getCurrentJamState());
      clearError();
    } catch (err: any) {
      setError(`Jam konnte nicht gespeichert werden: ${err.message}`);
    }
  };

  const handleLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const loadedState = await loadJam(file);
      setProgression(loadedState.progression);
      setBpm(loadedState.bpm);
      setMusicKey(loadedState.musicKey);
      setScale(loadedState.scale);
      setDrumPattern(loadedState.drumPattern);
      setKickVolume(loadedState.kickVolume);
      setSnareVolume(loadedState.snareVolume);
      setHihatVolume(loadedState.hihatVolume);
      setSynthVolume(loadedState.synthVolume);
      setBassVolume(loadedState.bassVolume);
      setKickPan(loadedState.kickPan);
      setSnarePan(loadedState.snarePan);
      setHihatPan(loadedState.hihatPan);
      setSynthPan(loadedState.synthPan);
      setBassPan(loadedState.bassPan);
      setSelectedPresetIndex(loadedState.selectedPresetIndex);
      setSynthPresetName(loadedState.synthPresetName);
      setSynthConfig(loadedState.synthConfig);
      setCustomSynthPresets(loadedState.customSynthPresets);
      saveCustomSynthPresets(loadedState.customSynthPresets);
      setUseInversions(loadedState.useInversions);
      setSynthOctave(loadedState.synthOctave);
      setVoicingVariation(loadedState.voicingVariation);
      setSpreadVoicing(loadedState.spreadVoicing);
      setHarmonyInterval(loadedState.harmonyInterval);
      setHarmonyVolume(loadedState.harmonyVolume);
      setHarmonyPan(loadedState.harmonyPan);
      setArpeggiatorEnabled(loadedState.arpeggiatorEnabled);
      setArpeggiatorRate(loadedState.arpeggiatorRate);
      setArpeggiatorDirection(loadedState.arpeggiatorDirection);
      setArpeggiatorGate(loadedState.arpeggiatorGate);
      setCustomDrumPatterns(loadedState.customDrumPatterns);
      saveCustomPatterns(loadedState.customDrumPatterns);
      clearError();
    } catch (err: any) {
      setError(`Jam konnte nicht geladen werden: ${err.message}`);
    } finally {
      event.target.value = '';
    }
  };

  const handleExportMidi = () => {
    if (progression.length === 0) {
      setError("Eine leere Progression kann nicht exportiert werden.");
      return;
    }
    const patternData = resolveDrumPattern(drumPattern);
    exportToMidi({ progression, bpm, drumPattern: patternData });
    clearError();
  };

  const handleSaveCustomPattern = (name: string, pattern: (DrumStep | null)[], originalName?: string) => {
    let patterns = [...customDrumPatterns];
    const existingIndex = patterns.findIndex(p => p.name === (originalName || name));

    if (existingIndex > -1) {
      patterns[existingIndex] = { name, pattern };
    } else {
      patterns.push({ name, pattern });
    }
    setCustomDrumPatterns(patterns);
    saveCustomPatterns(patterns);
    setDrumPattern(name); // Select the newly saved/updated pattern
    setShowDrumEditor(false);
    setEditingDrumPattern(null);
  };

  const handleDeleteCustomPattern = (name: string) => {
    if (!window.confirm(`Möchtest du das Pattern "${name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    // If the currently playing pattern is deleted, fall back to a default
    if (drumPattern === name) {
      setDrumPattern('Pop Rock');
    }

    const updatedPatterns = customDrumPatterns.filter(p => p.name !== name);
    setCustomDrumPatterns(updatedPatterns);
    saveCustomPatterns(updatedPatterns);

    // If the editor was open for the deleted pattern, close it
    if (editingDrumPattern?.name === name) {
      setShowDrumEditor(false);
      setEditingDrumPattern(null);
    }
  };

  const handleOpenDrumEditor = (patternName?: string) => {
    if (patternName) {
      const patternToEdit = customDrumPatterns.find(p => p.name === patternName);
      if (patternToEdit) {
        setEditingDrumPattern(patternToEdit);
      }
    } else {
      setEditingDrumPattern(null);
    }
    setShowDrumEditor(true);
  };

  const handleSaveCustomSynthPreset = () => {
    const name = prompt("Gib einen Namen für dein Preset ein:");
    if (!name || !name.trim()) return;

    const trimmedName = name.trim();
    if (customSynthPresets.some(p => p.name.toLowerCase() === trimmedName.toLowerCase()) || AudioService.synthPresets[trimmedName as SynthPreset]) {
      alert("Dieser Preset-Name ist bereits vergeben.");
      return;
    }

    const newPreset: CustomSynthPreset = { name: trimmedName, config: synthConfig };
    const updatedPresets = [...customSynthPresets, newPreset];
    setCustomSynthPresets(updatedPresets);
    saveCustomSynthPresets(updatedPresets);
    setSynthPresetName(trimmedName);
  };

  if (audioState !== 'ready') {
    return (
      <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col items-center justify-center text-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black">
        <header className="absolute top-0 p-4 text-center w-full">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Jam Buddy
          </h1>
        </header>
        <p className="text-gray-400 mb-8 max-w-md text-lg">
          Klicke, um die Audio-Engine zu starten und deine Jam-Session zu beginnen.
        </p>
        {audioState === 'uninitialized' && (
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={handleInitializeAudio}
              className="px-10 py-5 rounded-xl font-bold text-2xl text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25 ring-1 ring-white/10"
            >
              Session starten
            </button>

            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 max-w-xs text-center">
              <p className="text-sm text-gray-400 mb-2 font-semibold text-red-400">
                Wichtiger Hinweis:
              </p>
              <p className="text-sm text-gray-400 mb-2">
                Die App ist Rechen- und Speicherintensiv, schließe möglichst alle anderen Apps.
              </p>
              <p className="text-sm text-gray-400">
                Bei schlechter Audioqualität App schließen und neu starten. Aktuelle Einstellungen bleiben erhalten.
              </p>
            </div>
          </div>
        )}
        {audioState === 'initializing' && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full animate-pulse bg-purple-400"></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-purple-400" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-purple-400" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-lg font-semibold ml-2">{loadingText}</span>
          </div>
        )}
        {audioState === 'error' && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative max-w-xl flex flex-col gap-2" role="alert">
            <div>
              <strong className="font-bold">Fehler: </strong>
              <span className="block sm:inline">{error}</span>
            </div>

          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-gray-100 min-h-screen font-sans relative selection:bg-primary-500/30">
      {/* TRAINING MODE OVERLAY */}
      {isPlaying && trainingMode && (playbackPhase === 'counting-in' || playbackPhase === 'resetting') && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none animate-fade-in">
          <div className="text-center">
            {playbackPhase === 'counting-in' && countInBeat && (
              <div className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.8)] animate-pulse">
                {countInBeat}
              </div>
            )}
            {playbackPhase === 'resetting' && (
              <div className="text-3xl font-bold text-purple-300 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                Audio-Bereinigung...
              </div>
            )}
          </div>
        </div>
      )}

      <header className="p-6 text-center border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-md z-30 flex items-center justify-center relative">
        <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-500 to-accent-400 drop-shadow-sm">
          Jam Buddy
        </h1>
        <button
          onClick={() => setShowTutorial(true)}
          className="absolute right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          aria-label="Hilfe"
        >
          <IconHelp className="w-6 h-6" />
        </button>

      </header>

      <main className="w-full max-w-none p-4 md:p-6 lg:p-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-4 flex justify-between items-center" role="alert">
            <div>
              <strong className="font-bold">Fehler: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <div className="flex items-center">
              {retryAction && (
                <button
                  onClick={handleRetry}
                  className="bg-red-400/30 hover:bg-red-400/50 text-white font-bold py-1 px-3 rounded-md mr-2"
                  disabled={isLoading}
                >
                  Erneut versuchen
                </button>
              )}
              <button onClick={clearError} className="p-1 rounded-full hover:bg-red-400/30" aria-label="Schließen">
                <IconX className="fill-current h-6 w-6 text-red-400" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 glass-panel p-6 relative">
            <ControlPanel
              musicKey={musicKey}
              scale={scale}
              onKeyGroupChange={handleKeyGroupChange}
              drumPattern={drumPattern}
              onDrumPatternChange={setDrumPattern}
              bpm={bpm}
              onBpmChange={setBpm}
              kickVolume={kickVolume}
              onKickVolumeChange={setKickVolume}
              snareVolume={snareVolume}
              onSnareVolumeChange={setSnareVolume}
              hihatVolume={hihatVolume}
              onHihatVolumeChange={setHihatVolume}
              synthVolume={synthVolume}
              onSynthVolumeChange={setSynthVolume}
              bassVolume={bassVolume}
              onBassVolumeChange={setBassVolume}
              kickPan={kickPan}
              onKickPanChange={setKickPan}
              snarePan={snarePan}
              onSnarePanChange={setSnarePan}
              hihatPan={hihatPan}
              onHihatPanChange={setHihatPan}
              synthPan={synthPan}
              onSynthPanChange={setSynthPan}
              bassPan={bassPan}
              onBassPanChange={setBassPan}
              selectedPresetIndex={selectedPresetIndex}
              onPresetChange={setSelectedPresetIndex}
              synthPresetName={synthPresetName}
              onSynthPresetNameChange={setSynthPresetName}
              synthConfig={synthConfig}
              onSynthConfigChange={setSynthConfig}
              customSynthPresets={customSynthPresets}
              onSaveCustomSynthPreset={handleSaveCustomSynthPreset}
              useInversions={useInversions}
              onUseInversionsChange={setUseInversions}
              synthOctave={synthOctave}
              onSynthOctaveChange={setSynthOctave}
              voicingVariation={voicingVariation}
              onVoicingVariationChange={setVoicingVariation}
              spreadVoicing={spreadVoicing}
              onSpreadVoicingChange={setSpreadVoicing}
              harmonyInterval={harmonyInterval}
              onHarmonyIntervalChange={setHarmonyInterval}
              harmonyVolume={harmonyVolume}
              onHarmonyVolumeChange={setHarmonyVolume}
              harmonyPan={harmonyPan}
              onHarmonyPanChange={setHarmonyPan}
              arpeggiatorEnabled={arpeggiatorEnabled}
              onArpeggiatorEnabledChange={setArpeggiatorEnabled}
              arpeggiatorRate={arpeggiatorRate}
              onArpeggiatorRateChange={setArpeggiatorRate}
              arpeggiatorDirection={arpeggiatorDirection}
              onArpeggiatorDirectionChange={setArpeggiatorDirection}
              arpeggiatorGate={arpeggiatorGate}
              onArpeggiatorGateChange={setArpeggiatorGate}
              onRandomize={handleRandomize}
              isPlaying={isPlaying}
              isPaused={isPaused}
              onPlayToggle={handlePlayToggle}
              onStop={handleStop}
              onSave={handleSave}
              onLoad={handleLoad}
              onExportMidi={handleExportMidi}
              isLoading={isLoading}
              isOnline={isOnline}
              customDrumPatterns={customDrumPatterns}
              onOpenDrumEditor={handleOpenDrumEditor}
              onDeleteCustomPattern={handleDeleteCustomPattern}
              discoveredFeatures={discoveredFeatures}
              onFeatureDiscovered={handleFeatureDiscovered}
              trainingMode={trainingMode}
              onTrainingModeChange={setTrainingMode}
              loopCount={loopCount}
              onLoopCountChange={setLoopCount}
            />

          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-6 relative">
              {isLoading && <Loader text={loadingText} />}
              <ChordDisplay
                progression={progression}
                currentChordIndex={currentChordIndex}
                onChordChange={handleChordChange}
                isPlaying={isPlaying}
              />
              <div className="mt-4">
                <DiatonicDegreeDisplay
                  progression={progression}
                  musicKey={musicKey}
                  scale={scale}
                  currentChordIndex={currentChordIndex}
                />
              </div>
            </div>

            <div className="glass-panel">
              <CircleOfFifths
                progression={progression}
                musicKey={musicKey}
                scale={scale}
                currentChordIndex={currentChordIndex}
              />
            </div>
          </div>
        </div>

        <footer className="text-center text-gray-500 mt-8">
          <p>Drücke <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">H</kbd> oder <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">?</kbd> für Hilfe.</p>
        </footer>
      </main>

      {showTutorial && <Tutorial onClose={handleCloseTutorial} />}

      {showDrumEditor && (
        <DrumPatternEditor
          onClose={() => setShowDrumEditor(false)}
          onSave={handleSaveCustomPattern}
          onDelete={handleDeleteCustomPattern}
          existingPattern={editingDrumPattern}
          allPatterns={customDrumPatterns}
        />
      )}
    </div>
  );
};

export default App;
