import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientJs = fs.readFileSync(path.resolve(__dirname, '../src/client.js'), 'utf8');
const milkdownEntry = fs.readFileSync(path.resolve(__dirname, '../lib/editor/milkdown-entry.js'), 'utf8');
const componentsCss = fs.readFileSync(path.resolve(__dirname, '../styles/components.css'), 'utf8');

assert.match(
  clientJs,
  /const formatButtons = \[[\s\S]*\{ key: 'image', label: '图片' \}[\s\S]*\];/,
  'format menu should expose an image insertion entry'
);

assert.match(
  clientJs,
  /const editorContextInsertItems = \[[\s\S]*'image'[\s\S]*\];/,
  'context menu insert submenu should expose image insertion'
);

assert.match(
  clientJs,
  /image: \{ label: '图片' \}/,
  'image insertion should have a localized menu label'
);

assert.match(
  milkdownEntry,
  /import \{[^}]*imageBlockComponent[^}]*imageBlockConfig[^}]*\} from '@milkdown\/kit\/component\/image-block';/,
  'editor host should import the official image-block component'
);

assert.match(
  milkdownEntry,
  /\.use\(imageBlockComponent\)/,
  'editor host should register the image-block component in the Milkdown pipeline'
);

assert.match(
  milkdownEntry,
  /\.use\(insertImageBlockCommand\)/,
  'editor host should register the image insertion command plugin'
);

assert.match(
  milkdownEntry,
  /\.use\(insertLinkCommand\)/,
  'editor host should register the link insertion command plugin'
);

assert.match(
  milkdownEntry,
  /\.use\(insertInternalLinkCommand\)/,
  'editor host should register the internal-link insertion command plugin'
);

assert.match(
  milkdownEntry,
  /\.use\(turnIntoTaskListCommand\)/,
  'editor host should register the task-list insertion command plugin'
);

assert.match(
  milkdownEntry,
  /ctx\.set\(imageBlockConfig\.key, \{[\s\S]*onUpload: async \(file\) =>/,
  'image-block configuration should provide an upload handler'
);

assert.match(
  milkdownEntry,
  /\/api\/storage\/attachments/,
  'image uploads should go through the attachment storage endpoint'
);

assert.match(
  milkdownEntry,
  /image: \(\) => \(\{ key: insertImageBlockCommand\.key \}\)/,
  'image command should insert an image-block node instead of raw markdown'
);

assert.match(
  clientJs,
  /createMilkdownHost\(\{\s*root,\s*markdown,\s*noteId,\s*onChange: handleEditorMarkdownChange\s*\}\)/,
  'editor host should receive the active note id so uploads can target the current note'
);

assert.match(
  milkdownEntry,
  /refreshImageBlockLayouts\(\)|scheduleImageLayoutRefresh\(\)|ResizeObserver/,
  'editor host should re-run image sizing after layout changes'
);

assert.match(
  componentsCss,
  /\.milkdown-image-block/,
  'editor styles should include image-block layout rules'
);

assert.match(
  componentsCss,
  /\.image-resize-handle/,
  'editor styles should keep the resize handle visible and usable'
);

console.log('ok - image block upload and resize hooks are present');
