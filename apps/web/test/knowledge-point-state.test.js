import assert from 'node:assert/strict';
import {
  addLocalKnowledgePointSource,
  buildCurrentNoteKnowledgePointSources,
  createLocalKnowledgePointAggregate,
  insertKnowledgePointCollections,
  removeLocalKnowledgePointSource,
  removeKnowledgePointCollections,
  replaceKnowledgePointCollections,
  syncKnowledgePointMembershipCollections
} from '../lib/knowledge-points/state.js';

function runTest(name, callback) {
  try {
    callback();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

runTest('insertKnowledgePointCollections prepends and de-duplicates current and full lists', () => {
  const point = { id: 'point-1', title: 'Updated' };
  const result = insertKnowledgePointCollections({
    knowledgePoints: [{ id: 'point-1', title: 'Old' }, { id: 'point-2' }],
    allKnowledgePoints: [{ id: 'point-3' }, { id: 'point-1', title: 'Old' }]
  }, point);

  assert.deepEqual(result.knowledgePoints, [point, { id: 'point-2' }]);
  assert.deepEqual(result.allKnowledgePoints, [point, { id: 'point-3' }]);
});

runTest('replaceKnowledgePointCollections replaces matching points in both lists', () => {
  const point = { id: 'point-2', title: 'Updated' };
  const result = replaceKnowledgePointCollections({
    knowledgePoints: [{ id: 'point-1' }, { id: 'point-2', title: 'Old' }],
    allKnowledgePoints: [{ id: 'point-2', title: 'Old' }, { id: 'point-3' }]
  }, point);

  assert.deepEqual(result.knowledgePoints, [{ id: 'point-1' }, point]);
  assert.deepEqual(result.allKnowledgePoints, [point, { id: 'point-3' }]);
});

runTest('removeKnowledgePointCollections removes a point from both lists', () => {
  const result = removeKnowledgePointCollections({
    knowledgePoints: [{ id: 'point-1' }, { id: 'point-2' }],
    allKnowledgePoints: [{ id: 'point-2' }, { id: 'point-3' }]
  }, 'point-2');

  assert.deepEqual(result.knowledgePoints, [{ id: 'point-1' }]);
  assert.deepEqual(result.allKnowledgePoints, [{ id: 'point-3' }]);
});

runTest('syncKnowledgePointMembershipCollections includes point only when it belongs to current note', () => {
  const collections = {
    knowledgePoints: [{ id: 'point-old' }, { id: 'point-1', title: 'Old' }],
    allKnowledgePoints: [{ id: 'point-1', title: 'Old' }]
  };

  const included = syncKnowledgePointMembershipCollections(collections, {
    id: 'point-1',
    noteIds: ['note-1']
  }, 'note-1');
  const excluded = syncKnowledgePointMembershipCollections(included, {
    id: 'point-1',
    noteIds: ['note-2']
  }, 'note-1');

  assert.deepEqual(included.knowledgePoints, [{ id: 'point-1', noteIds: ['note-1'] }, { id: 'point-old' }]);
  assert.deepEqual(included.allKnowledgePoints, [{ id: 'point-1', noteIds: ['note-1'] }]);
  assert.deepEqual(excluded.knowledgePoints, [{ id: 'point-old' }]);
  assert.deepEqual(excluded.allKnowledgePoints, [{ id: 'point-1', noteIds: ['note-2'] }]);
});

runTest('buildCurrentNoteKnowledgePointSources returns sources for the current note with point ids', () => {
  const sources = buildCurrentNoteKnowledgePointSources([
    {
      id: 'point-1',
      sources: [
        { id: 'source-1', noteId: 'note-1', sourceText: 'A' },
        { id: 'source-2', noteId: 'note-2', sourceText: 'B' }
      ]
    },
    {
      id: 'point-2',
      sources: [{ id: 'source-3', noteId: 'note-1', sourceText: 'C' }]
    }
  ], 'note-1');

  assert.deepEqual(sources, [
    { id: 'source-1', noteId: 'note-1', sourceText: 'A', knowledgePointId: 'point-1' },
    { id: 'source-3', noteId: 'note-1', sourceText: 'C', knowledgePointId: 'point-2' }
  ]);
});

runTest('addLocalKnowledgePointSource appends source metadata and note membership', () => {
  const result = addLocalKnowledgePointSource({
    id: 'point-1',
    sources: [{ id: 'source-1', noteId: 'note-1' }],
    noteIds: ['note-1']
  }, {
    id: 'source-2',
    noteId: 'note-2',
    sourceText: 'B'
  }, 'note-2', '2026-06-25T00:00:00.000Z');

  assert.deepEqual(result, {
    id: 'point-1',
    sources: [
      { id: 'source-1', noteId: 'note-1' },
      {
        id: 'source-2',
        noteId: 'note-2',
        sourceText: 'B',
        knowledgePointId: 'point-1',
        sortOrder: 2,
        isAnchorValid: true,
        createdAt: '2026-06-25T00:00:00.000Z',
        updatedAt: '2026-06-25T00:00:00.000Z'
      }
    ],
    noteIds: ['note-1', 'note-2'],
    updatedAt: '2026-06-25T00:00:00.000Z'
  });
});

runTest('removeLocalKnowledgePointSource removes source and current note membership when needed', () => {
  const result = removeLocalKnowledgePointSource({
    point: {
      id: 'point-1',
      sources: [
        { id: 'source-1', noteId: 'note-1' },
        { id: 'source-2', noteId: 'note-2' }
      ],
      noteIds: ['note-1', 'note-2']
    },
    sourceId: 'source-1',
    currentNoteId: 'note-1',
    timestamp: '2026-06-25T00:00:00.000Z'
  });

  assert.equal(result.reason, null);
  assert.deepEqual(result.updatedPoint, {
    id: 'point-1',
    sources: [{ id: 'source-2', noteId: 'note-2' }],
    noteIds: ['note-2'],
    updatedAt: '2026-06-25T00:00:00.000Z'
  });
});

runTest('removeLocalKnowledgePointSource keeps current note membership when another source remains', () => {
  const result = removeLocalKnowledgePointSource({
    point: {
      id: 'point-1',
      sources: [
        { id: 'source-1', noteId: 'note-1' },
        { id: 'source-2', noteId: 'note-1' },
        { id: 'source-3', noteId: 'note-2' }
      ],
      noteIds: ['note-1', 'note-2']
    },
    sourceId: 'source-1',
    currentNoteId: 'note-1',
    timestamp: '2026-06-25T00:00:00.000Z'
  });

  assert.equal(result.reason, null);
  assert.deepEqual(result.updatedPoint.noteIds, ['note-1', 'note-2']);
  assert.deepEqual(result.updatedPoint.sources, [
    { id: 'source-2', noteId: 'note-1' },
    { id: 'source-3', noteId: 'note-2' }
  ]);
});

runTest('removeLocalKnowledgePointSource blocks removing the final source', () => {
  const result = removeLocalKnowledgePointSource({
    point: {
      id: 'point-1',
      sources: [{ id: 'source-1', noteId: 'note-1' }],
      noteIds: ['note-1']
    },
    sourceId: 'source-1',
    currentNoteId: 'note-1'
  });

  assert.equal(result.reason, 'last-source');
  assert.equal(result.updatedPoint, null);
});

runTest('createLocalKnowledgePointAggregate builds an active point with normalized source metadata', () => {
  const aggregate = createLocalKnowledgePointAggregate({
    id: 'point-1',
    spaceId: 'space-1',
    title: 'Concept',
    noteId: 'note-1',
    sources: [
      { id: 'source-1', noteId: 'note-1', sourceText: 'A' },
      { id: 'source-2', noteId: 'note-1', sourceText: 'B', sortOrder: 3 }
    ]
  }, '2026-06-25T00:00:00.000Z');

  assert.deepEqual(aggregate, {
    id: 'point-1',
    spaceId: 'space-1',
    title: 'Concept',
    comment: '',
    status: 'active',
    deletedAt: null,
    createdAt: '2026-06-25T00:00:00.000Z',
    updatedAt: '2026-06-25T00:00:00.000Z',
    sources: [
      {
        id: 'source-1',
        noteId: 'note-1',
        sourceText: 'A',
        knowledgePointId: 'point-1',
        sortOrder: 1,
        isAnchorValid: true,
        createdAt: '2026-06-25T00:00:00.000Z',
        updatedAt: '2026-06-25T00:00:00.000Z'
      },
      {
        id: 'source-2',
        noteId: 'note-1',
        sourceText: 'B',
        knowledgePointId: 'point-1',
        sortOrder: 3,
        isAnchorValid: true,
        createdAt: '2026-06-25T00:00:00.000Z',
        updatedAt: '2026-06-25T00:00:00.000Z'
      }
    ],
    tagIds: [],
    noteIds: ['note-1']
  });
});
