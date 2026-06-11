export const EDITOR_SHORTCUT_LABELS = {
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Y',
  copy: 'Ctrl+C',
  paste: 'Ctrl+V',
  'select-all': 'Ctrl+A',
  bold: 'Ctrl+B',
  'heading-1': 'Ctrl+1',
  'heading-2': 'Ctrl+2',
  'heading-3': 'Ctrl+3',
  'heading-4': 'Ctrl+4',
  'heading-5': 'Ctrl+5',
  'heading-6': 'Ctrl+6',
  ordered: 'Ctrl+Shift+7',
  bullet: 'Ctrl+Shift+8',
  indent: 'Tab'
};

export function getEditorShortcutLabel(action) {
  return EDITOR_SHORTCUT_LABELS[action] ?? '';
}

export function resolveEditorShortcutAction({
  key = '',
  ctrlKey = false,
  metaKey = false,
  shiftKey = false,
  altKey = false
} = {}) {
  const normalizedKey = String(key).toLowerCase();
  const hasModifier = ctrlKey || metaKey;

  if (!hasModifier || altKey) {
    return null;
  }

  if (!shiftKey) {
    switch (normalizedKey) {
      case 'b':
        return 'bold';
      case '1':
        return 'heading-1';
      case '2':
        return 'heading-2';
      case '3':
        return 'heading-3';
      case '4':
        return 'heading-4';
      case '5':
        return 'heading-5';
      case '6':
        return 'heading-6';
      default:
        return null;
    }
  }

  switch (normalizedKey) {
    case '7':
      return 'ordered';
    case '8':
      return 'bullet';
    default:
      return null;
  }
}
