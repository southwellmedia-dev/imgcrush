import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onPaste?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
  onToggleComparison?: () => void;
}

export function useKeyboardShortcuts({ onPaste, onSave, onEscape, onToggleComparison }: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + V - Paste from clipboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && onPaste) {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          onPaste();
        }
      }

      // Ctrl/Cmd + S - Save/Download
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && onSave) {
        e.preventDefault();
        onSave();
      }

      // Escape - Close modals or cancel actions
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }

      // Space - Toggle comparison (when viewing an image)
      if (e.key === ' ' && onToggleComparison) {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'BUTTON') {
          e.preventDefault();
          onToggleComparison();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPaste, onSave, onEscape, onToggleComparison]);
}
