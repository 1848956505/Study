import assert from 'node:assert/strict';
import {
  getEditorShortcutLabel,
  resolveEditorShortcutAction
} from '../lib/editor/shortcut-actions.js';

assert.equal(getEditorShortcutLabel('bold'), 'Ctrl+B');
assert.equal(getEditorShortcutLabel('heading-6'), 'Ctrl+6');
assert.equal(getEditorShortcutLabel('ordered'), 'Ctrl+Shift+7');
assert.equal(getEditorShortcutLabel('missing'), '');

assert.equal(
  resolveEditorShortcutAction({ key: 'b', ctrlKey: true }),
  'bold',
  'Ctrl+B should trigger bold'
);
assert.equal(
  resolveEditorShortcutAction({ key: '4', ctrlKey: true }),
  'heading-4',
  'Ctrl+4 should trigger H4'
);
assert.equal(
  resolveEditorShortcutAction({ key: '6', metaKey: true }),
  'heading-6',
  'Cmd+6 should trigger H6 on mac-style modifier handling'
);
assert.equal(
  resolveEditorShortcutAction({ key: '7', ctrlKey: true, shiftKey: true }),
  'ordered',
  'Ctrl+Shift+7 should trigger ordered list'
);
assert.equal(
  resolveEditorShortcutAction({ key: '8', ctrlKey: true, shiftKey: true }),
  'bullet',
  'Ctrl+Shift+8 should trigger bullet list'
);
assert.equal(
  resolveEditorShortcutAction({ key: 'b', ctrlKey: true, altKey: true }),
  null,
  'Alt-modified shortcuts should be ignored'
);
assert.equal(
  resolveEditorShortcutAction({ key: 'v', ctrlKey: true }),
  null,
  'native clipboard shortcuts should not be overridden here'
);

console.log('ok - editor shortcut actions resolve expected defaults');
