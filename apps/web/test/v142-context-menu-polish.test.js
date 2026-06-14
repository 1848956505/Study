import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientJs = fs.readFileSync(path.resolve(__dirname, '../src/client.js'), 'utf8');
const componentsCss = fs.readFileSync(path.resolve(__dirname, '../styles/components.css'), 'utf8');

assert.match(
  clientJs,
  /function renderEditorContextIconSvg\(icon\)/,
  'V1.4.2 should replace ad-hoc glyph strings with a dedicated SVG icon renderer'
);
assert.match(
  clientJs,
  /stroke-linecap="round"[\s\S]*stroke-linejoin="round"/,
  'context menu icons should use a rounded, visually consistent SVG style'
);
assert.doesNotMatch(
  clientJs,
  /📋|🗑|✂|⧉|❞|◯✓|⇤|⇥/,
  'context menu should no longer rely on emoji or mismatched text glyph icons'
);
assert.match(
  clientJs,
  /function syncEditorContextSubmenuLayout\(\)/,
  'submenu positioning should be synchronized through a dedicated layout pass'
);
assert.match(
  clientJs,
  /function syncEditorContextMenuPosition\(\)/,
  'context menu panel should reposition itself through a dedicated viewport-clamping pass'
);
assert.match(
  clientJs,
  /Math\.min\(Math\.max\(8,\s*state\.editorContextMenu\.x\)/,
  'context menu position should clamp horizontal placement inside the viewport'
);
assert.match(
  clientJs,
  /Math\.min\(Math\.max\(8,\s*state\.editorContextMenu\.y\)/,
  'context menu position should clamp vertical placement inside the viewport'
);
assert.match(
  clientJs,
  /submenuGroup\.dataset\.submenuSide\s*=/,
  'submenu layout should record left\/right placement decisions'
);
assert.match(
  clientJs,
  /submenuGroup\.dataset\.submenuAlign\s*=/,
  'submenu layout should record vertical alignment decisions when bottom space is limited'
);
assert.match(
  clientJs,
  /--submenu-offset-y/,
  'submenu layout should drive vertical offset through a CSS variable'
);

assert.match(
  componentsCss,
  /\.editor-context-submenu-group\[data-submenu-side='left'\]/,
  'submenu CSS should support flipping to the left when right-side space is insufficient'
);
assert.match(
  componentsCss,
  /\.editor-context-submenu\s*\{[\s\S]*max-height:/,
  'submenu CSS should cap height and allow scrolling instead of clipping'
);
assert.doesNotMatch(
  componentsCss,
  /left:\s*calc\(100%\s*\+\s*6px\);/,
  'submenu CSS should no longer hardcode a single rightward offset with a hover gap'
);

console.log('ok - V1.4.2 context menu polish hooks are present');
