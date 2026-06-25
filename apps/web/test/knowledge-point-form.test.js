import assert from 'node:assert/strict';
import { getKnowledgePointFormUpdates } from '../lib/knowledge-points/form.js';

function runTest(name, callback) {
  try {
    callback();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

class FakeFormData {
  constructor(form) {
    this.form = form;
  }

  get(key) {
    return this.form.fields[key] ?? null;
  }

  getAll(key) {
    return this.form.multiFields[key] ?? [];
  }
}

runTest('getKnowledgePointFormUpdates trims fields and merges tag ids', () => {
  const form = {
    fields: {
      title: '  Concept  ',
      comment: '  note  '
    },
    multiFields: {
      tagIds: ['tag-a', '', 'tag-b']
    },
    querySelectorAll() {
      return [
        { value: 'tag-b' },
        { value: 'tag-c' },
        { value: '' }
      ];
    }
  };

  assert.deepEqual(getKnowledgePointFormUpdates(form, FakeFormData), {
    title: 'Concept',
    comment: 'note',
    tagIds: ['tag-a', 'tag-b', 'tag-c']
  });
});

runTest('getKnowledgePointFormUpdates falls back to empty strings', () => {
  const form = {
    fields: {},
    multiFields: {},
    querySelectorAll() {
      return [];
    }
  };

  assert.deepEqual(getKnowledgePointFormUpdates(form, FakeFormData), {
    title: '',
    comment: '',
    tagIds: []
  });
});
