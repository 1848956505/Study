import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientJs = fs.readFileSync(path.resolve(__dirname, '../src/client.js'), 'utf8');
const menuRenderersJs = fs.readFileSync(path.resolve(__dirname, '../lib/editor/menu-renderers.js'), 'utf8');
const editorContextModelJs = fs.readFileSync(path.resolve(__dirname, '../lib/editor/context-menu-model.js'), 'utf8');
const milkdownEntry = fs.readFileSync(path.resolve(__dirname, '../lib/editor/milkdown-entry.js'), 'utf8');
const componentsCss = fs.readFileSync(path.resolve(__dirname, '../styles/components.css'), 'utf8');

assert.match(
  menuRenderersJs,
  /const PARAGRAPH_MENU_ITEMS = \[[\s\S]*\{ key: 'table', label: '表格' \}[\s\S]*\];/,
  'format menu should expose a table insertion entry'
);

assert.match(
  editorContextModelJs,
  /EDITOR_CONTEXT_INSERT_ITEMS = \[[\s\S]*'table'[\s\S]*\];/,
  'context menu insert submenu should expose table insertion'
);

assert.match(
  editorContextModelJs,
  /table: \{ label: '表格'(?:, icon: 'table')? \}/,
  'table insertion should have a localized menu label'
);

assert.match(
  clientJs,
  /editorTableDialog|renderTableInsertDialog|data-editor-table-dialog-action/,
  'editor UI should provide an in-app table insert dialog instead of relying on browser prompts'
);

assert.match(
  milkdownEntry,
  /import\s*\{[^}]*tableBlock[^}]*tableBlockConfig[^}]*\}\s*from '@milkdown\/components\/table-block';|import\s*\{[^}]*tableBlockConfig[^}]*tableBlock[^}]*\}\s*from '@milkdown\/components\/table-block';/,
  'editor host should import the official Milkdown table block component'
);

assert.match(
  milkdownEntry,
  /\.use\(tableBlock\)/,
  'editor host should register the Milkdown table block component'
);

assert.match(
  milkdownEntry,
  /addRowAfterCommand|addRowBeforeCommand|addColAfterCommand|addColBeforeCommand|deleteSelectedCellsCommand|setAlignCommand|selectRowCommand|selectColCommand/,
  'editor host should import table operation commands for row, column, delete, and alignment actions'
);

assert.match(
  milkdownEntry,
  /table:\s*\([^)]*\)\s*=>\s*\(\{\s*key:\s*insertTableCommand\.key,[\s\S]*?payload:\s*\{[\s\S]*?row:[\s\S]*?col:[\s\S]*?\}\s*\}\)/,
  'table insertion command should accept custom row and column counts'
);

assert.match(
  milkdownEntry,
  /function syncTableHandleLabels\(|setAttribute\('title', '删除列'\)|setAttribute\('title', '删除行'\)/,
  'table handles should expose clear labels for add and delete actions'
);

assert.match(
  milkdownEntry,
  /class TableHandleController|pinCell\(|clearPinnedTable\(|attachTableHandleController\(|syncPinnedHandleFromSelection\(|findCellFromCurrentSelection\(|openMenuKind|applyPinnedMenuState\(/,
  'editor host should keep row and column handles pinned after a cell is selected'
);

assert.match(
  milkdownEntry,
  /schedulePinnedMenuRecovery\(|clearPinnedMenuRecovery\(|menuRecoveryTimer|menuRecoveryKind/,
  'table handle controller should keep reopening the pinned handle menu until Milkdown finishes replacing transient handle DOM'
);

assert.match(
  milkdownEntry,
  /tryRebindPinnedCell\(\)[\s\S]*findCellFromCurrentSelection\(\)[\s\S]*pinCell\(reboundCell\)|if \(!\(tableBlock instanceof HTMLElement\) \|\| !\(table instanceof HTMLTableElement\) \|\| !tableBlock\.isConnected \|\| !table\.isConnected\)[\s\S]*tryRebindPinnedCell\(\)/,
  'pinned table handles should rebind to the freshly rendered table DOM after Milkdown replaces the selected table block'
);

assert.match(
  milkdownEntry,
  /table-add-row-before|table-add-row-after|table-add-col-before|table-add-col-after/,
  'table handle menus should expose add-row and add-column actions directly'
);

assert.match(
  milkdownEntry,
  /table-delete-row|table-delete-col|deleteSelectedCellsCommand/,
  'table handle menus should expose explicit delete-row and delete-column actions'
);

assert.match(
  milkdownEntry,
  /handleRootPointerOver|handleRootPointerOut|hoverMenuKind|data-pinned-menu-visible/,
  'table handle controller should preserve the active menu while the pointer moves between the handle and its popup'
);

assert.match(
  milkdownEntry,
  /handleDocumentPointerDown[\s\S]*button-group button[\s\S]*return|data-table-pinned-action[\s\S]*return/,
  'table handle controller should not toggle or swallow events when a pinned menu button itself is being clicked'
);

assert.match(
  milkdownEntry,
  /ensureTableHasHeaderRowAtPos|table_header_row|table_header[\s\S]*table_row/,
  'table row and column deletes should repair the table header row when the first row is downgraded into plain cells'
);

assert.match(
  milkdownEntry,
  /updatePinnedActionAvailability|setPinnedActionDisabled|table-add-row-before|table-delete-row/,
  'row handle actions should be able to enter a disabled state for the header row and the final remaining data row'
);

assert.doesNotMatch(
  milkdownEntry,
  /col_drag_handle[\s\S]*?<circle[\s\S]*?row_drag_handle[\s\S]*?<circle/s,
  'drag handles should not rely on invisible circle-only icons'
);

assert.match(
  componentsCss,
  /\.milkdown-host \.ProseMirror table/,
  'editor styles should render visible table borders in the Milkdown editing surface'
);

assert.match(
  componentsCss,
  /\.milkdown-table-block|\.table-wrapper|\.line-handle|\.cell-handle/,
  'editor styles should include table-block interaction affordances'
);

assert.match(
  componentsCss,
  /\[data-role='x-line-drag-handle'\][\s\S]*display:\s*none/,
  'legacy floating row-add handle should be removed once row actions move into the side handle menu'
);

assert.match(
  componentsCss,
  /\[data-role='y-line-drag-handle'\][\s\S]*display:\s*none/,
  'legacy floating column-add handle should be removed once column actions move into the top handle menu'
);

assert.match(
  componentsCss,
  /\.milkdown-table-block svg/,
  'table block controls should style their svg icons so the handles remain visible'
);

assert.match(
  componentsCss,
  /\[data-pinned='true'\][\s\S]*row-drag-handle|col-drag-handle/,
  'pinned tables should keep row and column handles visible even after leaving the cell area'
);

assert.match(
  componentsCss,
  /\[data-role='row-drag-handle'\]\s+\.button-group[\s\S]*left:\s*calc\(100%\s*\+\s*8px\)|left:\s*100%/,
  'row handle menu should expand to the visible right side instead of getting clipped on the left'
);

assert.match(
  componentsCss,
  /\[data-role='col-drag-handle'\]\s+\.button-group[\s\S]*top:\s*calc\(100%\s*\+\s*8px\)|top:\s*100%/,
  'column handle menu should drop below the top handle so inserted actions remain visible'
);

assert.match(
  componentsCss,
  /data-pinned-menu-visible='row'[\s\S]*data-pinned-menu-visible='col'[\s\S]*pointer-events:\s*auto\s*!important/s,
  'pinned menu visibility should override transient Milkdown hide states for both row and column popups'
);

assert.match(
  componentsCss,
  /button\[disabled\][\s\S]*cursor:\s*not-allowed[\s\S]*opacity:\s*0\./s,
  'disabled table handle actions should look inactive and non-clickable'
);

console.log('ok - table block insertion and editing hooks are present');
