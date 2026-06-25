import assert from 'node:assert/strict';
import {
  createLocalDraftNote,
  resolveDraftSaveState
} from '../lib/editor/draft-state.js';

function runTest(name, callback) {
  try {
    callback();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

const deriveTitle = (markdown, fallback) => markdown.startsWith('# ')
  ? markdown.slice(2).trim()
  : fallback;

runTest('resolveDraftSaveState reports unchanged markdown and title', () => {
  assert.deepEqual(resolveDraftSaveState({
    note: { title: 'Title', rawMarkdown: '# Title' },
    markdown: '# Title',
    deriveTitle
  }), {
    changed: false,
    nextMarkdown: '# Title',
    nextTitle: 'Title'
  });
});

runTest('resolveDraftSaveState reports changed derived title', () => {
  assert.deepEqual(resolveDraftSaveState({
    note: { title: 'Old', rawMarkdown: '# Old' },
    markdown: '# New',
    deriveTitle
  }), {
    changed: true,
    nextMarkdown: '# New',
    nextTitle: 'New'
  });
});

runTest('createLocalDraftNote preserves note fields and stamps draft content', () => {
  assert.deepEqual(createLocalDraftNote({
    note: { id: 'note-1', favorite: true },
    title: 'New',
    markdown: '# New',
    timestamp: '2026-06-25T00:00:00.000Z'
  }), {
    id: 'note-1',
    favorite: true,
    title: 'New',
    rawMarkdown: '# New',
    updatedAt: '2026-06-25T00:00:00.000Z'
  });
});
