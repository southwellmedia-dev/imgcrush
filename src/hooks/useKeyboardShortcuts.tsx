import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onPaste?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
  onToggleComparison?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + V - Paste from clipboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && handlers.onPaste) {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handlers.onPaste();
        }
      }

      // Ctrl/Cmd + S - Save/Download
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && handlers.onSave) {
        e.preventDefault();
        handlers.onSave();
      }

      // Escape - Close modals or cancel actions
      if (e.key === 'Escape' && handlers.onEscape) {
        handlers.onEscape();
      }

      // Space - Toggle comparison (when viewing an image)
      if (e.key === ' ' && handlers.onToggleComparison) {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'BUTTON') {
          e.preventDefault();
          handlers.onToggleComparison();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
