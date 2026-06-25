import assert from 'node:assert/strict';
import { getEffectiveViewState } from '../lib/shell/view-state.js';

assert.deepEqual(
  getEffectiveViewState({
    mode: 'default',
    showLeftSidebar: true,
    showRightSidebar: false,
    showSourceEditor: true
  }),
  {
    mode: 'default',
    showLeftSidebar: true,
    showRightSidebar: false,
    showSourceEditor: true
  }
);

assert.deepEqual(
  getEffectiveViewState({
    mode: 'focus',
    showLeftSidebar: true,
    showRightSidebar: true,
    showSourceEditor: false
  }),
  {
    mode: 'focus',
    showLeftSidebar: false,
    showRightSidebar: false,
    showSourceEditor: false
  },
  'focus mode should force both sidebars off without changing source editor state'
);

console.log('ok - shell view state derives effective workspace visibility');
