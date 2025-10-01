import { ProcessingSettings } from '../types';
import { ViewMode } from '../components/ui/ResultsHeader';

const STORAGE_KEYS = {
  SELECTED_PRESET: 'imgcrush_selected_preset',
  PROCESSING_SETTINGS: 'imgcrush_processing_settings',
  VIEW_MODE: 'imgcrush_view_mode',
  DARK_MODE: 'imgcrush_dark_mode',
} as const;

// Default settings
export const DEFAULT_PROCESSING_SETTINGS: ProcessingSettings = {
  quality: 0.80,
  maxWidth: 99999,
  maxHeight: 99999,
  format: 'jpeg',
  resizeMode: 'percentage',
  percentage: 100,
  exactWidth: 800,
  exactHeight: 600,
  stripExif: true, // Strip EXIF by default for privacy
};

/**
 * Save selected preset to localStorage
 */
export function saveSelectedPreset(presetId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PRESET, presetId);
  } catch (error) {
    console.warn('Failed to save selected preset:', error);
  }
}

/**
 * Load selected preset from localStorage
 */
export function loadSelectedPreset(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_PRESET);
  } catch (error) {
    console.warn('Failed to load selected preset:', error);
    return null;
  }
}

/**
 * Save processing settings to localStorage
 */
export function saveProcessingSettings(settings: ProcessingSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROCESSING_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save processing settings:', error);
  }
}

/**
 * Load processing settings from localStorage
 */
export function loadProcessingSettings(): ProcessingSettings | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROCESSING_SETTINGS);
    if (saved) {
      return JSON.parse(saved) as ProcessingSettings;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load processing settings:', error);
    return null;
  }
}

/**
 * Save view mode to localStorage
 */
export function saveViewMode(viewMode: ViewMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  } catch (error) {
    console.warn('Failed to save view mode:', error);
  }
}

/**
 * Load view mode from localStorage
 */
export function loadViewMode(): ViewMode | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    if (saved === 'grid' || saved === 'list') {
      return saved;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load view mode:', error);
    return null;
  }
}

/**
 * Save dark mode preference to localStorage
 */
export function saveDarkMode(isDark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, isDark ? 'true' : 'false');
  } catch (error) {
    console.warn('Failed to save dark mode:', error);
  }
}

/**
 * Load dark mode preference from localStorage
 */
export function loadDarkMode(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return saved === 'true';
  } catch (error) {
    console.warn('Failed to load dark mode:', error);
    return false;
  }
}

/**
 * Clear all stored settings
 */
export function clearAllSettings(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear settings:', error);
  }
}
