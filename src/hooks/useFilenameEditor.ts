import { useState, useCallback } from 'react';

interface UseFilenameEditorResult {
  isEditing: boolean;
  editedName: string;
  startEditing: (currentName: string) => void;
  updateName: (name: string) => void;
  saveName: () => void;
  cancelEditing: () => void;
}

/**
 * Custom hook to manage filename editing state and actions
 * Encapsulates edit mode, validation, and save/cancel logic
 */
export function useFilenameEditor(
  onSave: (filename: string) => void
): UseFilenameEditorResult {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  const startEditing = useCallback((currentName: string) => {
    setEditedName(currentName);
    setIsEditing(true);
  }, []);

  const updateName = useCallback((name: string) => {
    setEditedName(name);
  }, []);

  const saveName = useCallback(() => {
    const trimmedName = editedName.trim();
    if (trimmedName) {
      onSave(trimmedName);
    }
    setIsEditing(false);
    setEditedName('');
  }, [editedName, onSave]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditedName('');
  }, []);

  return {
    isEditing,
    editedName,
    startEditing,
    updateName,
    saveName,
    cancelEditing,
  };
}
