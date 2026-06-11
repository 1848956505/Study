import assert from 'node:assert/strict';
import {
  buildExportFileName,
  createDuplicateTitle,
  createUntitledName
} from '../lib/editor/file-menu.js';

function runTest(name, callback) {
  try {
    callback();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

runTest('createUntitledName returns the base label when unused', () => {
  assert.equal(createUntitledName([], 'Untitled Note'), 'Untitled Note');
});

runTest('createUntitledName increments until a free title exists', () => {
  assert.equal(
    createUntitledName(['Untitled Note', 'Untitled Note 2'], 'Untitled Note'),
    'Untitled Note 3'
  );
});

runTest('createDuplicateTitle appends copy suffix and avoids collisions', () => {
  assert.equal(createDuplicateTitle([], 'Research Notes'), 'Research Notes Copy');
  assert.equal(
    createDuplicateTitle(['Research Notes Copy', 'Research Notes Copy 2'], 'Research Notes'),
    'Research Notes Copy 3'
  );
});

runTest('buildExportFileName sanitizes unsafe path characters', () => {
  assert.equal(buildExportFileName('Queue / Redis: Notes', 'md'), 'Queue - Redis Notes.md');
  assert.equal(buildExportFileName('', 'pdf'), 'Untitled Note.pdf');
});
