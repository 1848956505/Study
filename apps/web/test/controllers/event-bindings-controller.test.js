import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const source = fs.readFileSync(
  path.resolve(__dirname, '../../src/controllers/event-bindings-controller.js'),
  'utf8'
);
const clientSource = fs.readFileSync(
  path.resolve(__dirname, '../../src/client.js'),
  'utf8'
);

[
  'bindSearchEvents',
  'bindWindowEvents',
  'bindDocumentClickEvents',
  'bindDocumentKeyboardEvents',
  'bindDocumentInputEvents',
  'bindDocumentActionEvents',
  'bindMenuEvents',
  'bindFolderTreeEvents',
  'bindNoteTabEvents',
  'bindEditorContentEvents',
  'bindAsideEvents'
].forEach((binderName) => {
  assert.ok(
    source.includes(`${binderName}({ state, elements, deps })`),
    `${binderName} should be called with shared state/elements/deps`
  );
});

[
  'toggleSearchTagFilter',
  'selectNote',
  'closeContextMenu',
  'handleResolvedEditorShortcut',
  'handleTabMenuAction',
  'focusKnowledgePointFromMarker',
  'saveCurrentEditorScrollPosition'
].forEach((depName) => {
  assert.match(source, new RegExp(`${depName}:`), `${depName} should be provided to event binders`);
});

assert.match(
  clientSource,
  /function bindEvents\(\) \{\s*bindAppEvents\(/,
  'client bindEvents should delegate to event-bindings-controller'
);
assert.doesNotMatch(
  clientSource,
  /bindSearchEvents\(\{ state, elements, deps \}\)/,
  'client.js should no longer call individual event binders directly'
);

console.log('event-bindings-controller tests passed');
