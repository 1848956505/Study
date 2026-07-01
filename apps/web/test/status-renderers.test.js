import assert from 'node:assert/strict';
import {
  renderStatusIndicators,
  renderStatusMeta
} from '../lib/status/renderers.js';

assert.equal(
  renderStatusIndicators({
    statusMessage: 'Saved <ok>',
    visibleNoteCount: 3,
    folderCount: 2
  }).replace(/\s+/g, ' ').trim(),
  '<span class="status-inline">Saved &lt;ok&gt;</span> <span class="status-inline">笔记 3</span> <span class="status-inline">目录 2</span>'
);

assert.equal(
  renderStatusMeta({
    dataMode: 'api',
    currentSpaceId: 'space <A>'
  }).replace(/\s+/g, ' ').trim(),
  '<span class="status-inline">UTF-8</span> <span class="status-inline">space &lt;A&gt;</span>'
);

assert.match(
  renderStatusMeta({
    dataMode: 'api',
    currentSpaceId: ''
  }),
  /已连接后端/
);

assert.match(
  renderStatusMeta({
    dataMode: 'local',
    currentSpaceId: 'ignored'
  }),
  /前端本地模式/
);

console.log('ok - status renderers escape and label workspace state');
