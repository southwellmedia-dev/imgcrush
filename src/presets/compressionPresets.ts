import { ProcessingSettings } from '../types';

export interface CompressionPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: Partial<ProcessingSettings>;
  recommended?: string[];
  badge?: string;
}

export const COMPRESSION_PRESETS: CompressionPreset[] = [
  {
    id: 'compression-only',
    name: 'Compress Only',
    description: 'Reduce file size without resizing (80% quality)',
    icon: '🎯',
    badge: 'No Resize',
    settings: {
      quality: 0.80,
      format: 'jpeg',
      resizeMode: 'percentage',
      percentage: 100,
    },
    recommended: ['Preserve dimensions', 'Quality reduction only']
  },
  {
    id: 'web-optimized',
    name: 'Web Optimized',
    description: 'Resize to 1920px max + 85% quality for fast loading',
    icon: '🌐',
    badge: 'Most Popular',
    settings: {
      quality: 0.85,
      format: 'webp',
      resizeMode: 'max-dimensions',
      maxWidth: 1920,
      maxHeight: 1920,
    },
    recommended: ['Websites', 'Blogs', 'Landing pages']
  },
  {
    id: 'high-quality',
    name: 'High Quality',
    description: 'Minimal compression (95% quality), no resizing',
    icon: '💎',
    settings: {
      quality: 0.95,
      format: 'jpeg',
      resizeMode: 'max-dimensions',
      maxWidth: 99999,
      maxHeight: 99999,
    },
    recommended: ['Portfolio', 'Print', 'Professional photos']
  },
  {
    id: 'email-friendly',
    name: 'Email Friendly',
    description: 'Resize to 1280px + 75% quality for email attachments',
    icon: '📧',
    settings: {
      quality: 0.75,
      format: 'jpeg',
      resizeMode: 'max-dimensions',
      maxWidth: 1280,
      maxHeight: 1280,
    },
    recommended: ['Email attachments', 'Newsletters', 'Documents']
  },
  {
    id: 'social-instagram',
    name: 'Instagram',
    description: 'Exact 1080×1080px square for Instagram posts',
    icon: '📱',
    badge: 'Social',
    settings: {
      quality: 0.90,
      format: 'jpeg',
      resizeMode: 'exact',
      exactWidth: 1080,
      exactHeight: 1080,
    },
    recommended: ['Instagram posts', 'Social media']
  },
  {
    id: 'social-twitter',
    name: 'Twitter/X',
    description: 'Resize to 1200×675px for Twitter/X posts',
    icon: '🐦',
    badge: 'Social',
    settings: {
      quality: 0.85,
      format: 'jpeg',
      resizeMode: 'max-dimensions',
      maxWidth: 1200,
      maxHeight: 675,
    },
    recommended: ['Twitter posts', 'X platform']
  },
  {
    id: 'maximum-compression',
    name: 'Maximum Compression',
    description: 'Aggressive: 1024px max + 60% quality',
    icon: '🗜️',
    settings: {
      quality: 0.60,
      format: 'webp',
      resizeMode: 'max-dimensions',
      maxWidth: 1024,
      maxHeight: 1024,
    },
    recommended: ['Thumbnails', 'Icons', 'Low bandwidth']
  },
  {
    id: 'lossless',
    name: 'Lossless PNG',
    description: 'No quality loss or resizing (PNG format)',
    icon: '🔒',
    settings: {
      quality: 1.0,
      format: 'png',
      resizeMode: 'max-dimensions',
      maxWidth: 99999,
      maxHeight: 99999,
    },
    recommended: ['Graphics', 'Screenshots', 'Logos']
  },
  {
    id: 'custom',
    name: 'Custom Settings',
    description: 'Full control over all parameters',
    icon: '⚙️',
    settings: {
      quality: 0.80,
      format: 'jpeg',
      resizeMode: 'percentage',
      percentage: 100,
      maxWidth: 1920,
      maxHeight: 1080,
      exactWidth: 800,
      exactHeight: 600,
    },
    recommended: ['Advanced users', 'Specific requirements']
  }
];

export function getPresetById(id: string): CompressionPreset | undefined {
  return COMPRESSION_PRESETS.find(preset => preset.id === id);
}

export function applyPreset(presetId: string, currentSettings: ProcessingSettings): ProcessingSettings {
  const preset = getPresetById(presetId);
  if (!preset) return currentSettings;

  return {
    ...currentSettings,
    ...preset.settings,
  };
}