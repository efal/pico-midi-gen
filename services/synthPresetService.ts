import { CustomSynthPreset } from '../types';

const STORAGE_KEY = 'jamBuddy_customSynthPresets';

export function saveCustomSynthPresets(presets: CustomSynthPreset[]): void {
    try {
        const jsonString = JSON.stringify(presets);
        localStorage.setItem(STORAGE_KEY, jsonString);
    } catch (error) {
        console.error("Error saving custom synth presets:", error);
    }
}

export function loadCustomSynthPresets(): CustomSynthPreset[] {
    try {
        const jsonString = localStorage.getItem(STORAGE_KEY);
        if (!jsonString) {
            return [];
        }
        const parsed = JSON.parse(jsonString);
        // Basic validation
        if (Array.isArray(parsed)) {
            // Further validation could be added here to check the structure of each preset
            return parsed;
        }
        return [];
    } catch (error) {
        console.error("Error loading custom synth presets:", error);
        return [];
    }
}
