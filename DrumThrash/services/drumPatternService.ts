import { CustomDrumPattern } from '../types';

const STORAGE_KEY = 'guitarJamBuddy_customDrumPatterns';

export function saveCustomPatterns(patterns: CustomDrumPattern[]): void {
    try {
        const jsonString = JSON.stringify(patterns);
        localStorage.setItem(STORAGE_KEY, jsonString);
    } catch (error) {
        console.error("Fehler beim Speichern der benutzerdefinierten Drum-Patterns:", error);
    }
}

export function loadCustomPatterns(): CustomDrumPattern[] {
    try {
        const jsonString = localStorage.getItem(STORAGE_KEY);
        if (!jsonString) {
            return [];
        }
        const parsed = JSON.parse(jsonString);
        // Basic validation
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [];
    } catch (error) {
        console.error("Fehler beim Laden der benutzerdefinierten Drum-Patterns:", error);
        return [];
    }
}
