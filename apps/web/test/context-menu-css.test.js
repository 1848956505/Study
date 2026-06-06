import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const componentsCss = fs.readFileSync(path.resolve(__dirname, '../styles/components.css'), 'utf8');

const hiddenContextMenuRule = /\.library-context-menu\[hidden\]\s*\{[^}]*display\s*:\s*none\b[^}]*\}/m;

assert.match(
  componentsCss,
  hiddenContextMenuRule,
  'hidden context menu elements must not render as empty white bars'
);

console.log('ok - hidden context menus are fully removed from layout');
