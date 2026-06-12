import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientJs = fs.readFileSync(path.resolve(__dirname, '../src/client.js'), 'utf8');

assert.match(
  clientJs,
  /data-file-menu-action="favorite-note"/,
  'file menu should expose a favorite note action'
);
assert.match(
  clientJs,
  /data-file-menu-action="delete-note"/,
  'file menu should expose a delete note action'
);
assert.match(
  clientJs,
  /data-file-menu-action="restore-note"/,
  'file menu should expose a restore note action for deleted notes'
);
assert.match(
  clientJs,
  /action: 'favorite-note'/,
  'note context menu should expose a favorite note action'
);
assert.match(
  clientJs,
  /action: 'restore-note'/,
  'note context menu should expose a restore note action'
);
assert.match(
  clientJs,
  /action: 'permanently-delete-note'/,
  'recycle note context menu should expose a permanent delete action'
);
assert.match(
  clientJs,
  /action: 'empty-recycle-bin'/,
  'recycle section context menu should expose an empty recycle bin action'
);
assert.match(
  clientJs,
  /data-recycle-note-id=/,
  'recycle bin should render deleted notes as dedicated targets'
);
assert.match(
  clientJs,
  /data-recycle-section="true"/,
  'recycle section should render a dedicated target for section-level context menu actions'
);
assert.match(
  clientJs,
  /deleted: Boolean\(note\.deleted\)/,
  'note normalization should preserve deleted state'
);
assert.match(
  clientJs,
  /fetchJson\(`\/api\/knowledge\/notes\?spaceId=\$\{encodeURIComponent\(spaceId\)\}&includeDeleted=true`\)/,
  'workspace refresh should request deleted notes so recycle bin can render backend state'
);

console.log('ok - v1.3.6 note action hooks are present');
