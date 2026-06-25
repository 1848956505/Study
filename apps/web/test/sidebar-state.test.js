import assert from 'node:assert/strict';
import {
  createClearedNoteSideData,
  createLocalNoteSideData
} from '../lib/sidebar/state.js';

function runTest(name, callback) {
  try {
    callback();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

runTest('createClearedNoteSideData clears note side collections and editing state', () => {
  assert.deepEqual(createClearedNoteSideData(), {
    linkedNotes: [],
    attachments: [],
    knowledgePoints: [],
    allKnowledgePoints: [],
    knowledgePointTagGroups: [],
    knowledgePointEditing: null
  });
});

runTest('createClearedNoteSideData can preserve current editing state', () => {
  const editing = { id: 'point-1', title: 'Existing' };

  assert.deepEqual(createClearedNoteSideData({ editing, keepEditing: true }), {
    linkedNotes: [],
    attachments: [],
    knowledgePoints: [],
    allKnowledgePoints: [],
    knowledgePointTagGroups: [],
    knowledgePointEditing: editing
  });
});

runTest('createLocalNoteSideData resolves linked notes and current attachments', () => {
  const noteA = { id: 'note-a', internalLinks: ['note-b', 'missing'] };
  const noteB = { id: 'note-b', internalLinks: [] };

  assert.deepEqual(createLocalNoteSideData({
    noteId: 'note-a',
    notes: [noteA, noteB],
    attachments: [
      { id: 'attachment-a', noteId: 'note-a' },
      { id: 'attachment-b', noteId: 'note-b' }
    ]
  }), {
    linkedNotes: [noteB],
    attachments: [{ id: 'attachment-a', noteId: 'note-a' }],
    knowledgePoints: [],
    allKnowledgePoints: [],
    knowledgePointTagGroups: []
  });
});

runTest('createLocalNoteSideData clears side data when no note is selected', () => {
  assert.deepEqual(createLocalNoteSideData({
    noteId: null,
    notes: [{ id: 'note-a' }],
    attachments: [{ id: 'attachment-a', noteId: 'note-a' }]
  }), createClearedNoteSideData());
});
