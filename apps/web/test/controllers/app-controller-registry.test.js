import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registrySource = fs.readFileSync(
  path.resolve(__dirname, '../../src/controllers/app-controller-registry.js'),
  'utf8'
);
const clientSource = fs.readFileSync(
  path.resolve(__dirname, '../../src/client.js'),
  'utf8'
);

[
  'createNavigationController',
  'createEditorController',
  'createKnowledgePointController',
  'createSidebarController',
  'createSearchController',
  'createTagController',
  'createTabController',
  'createWorkspaceController',
  'createShellController',
  'createEditorScrollController'
].forEach((factoryName) => {
  assert.match(
    registrySource,
    new RegExp(`import \\{ ${factoryName} \\}`),
    `${factoryName} should be imported by the app controller registry`
  );
  assert.match(
    registrySource,
    new RegExp(`${factoryName}\\(\\{`),
    `${factoryName} should be created by the app controller registry`
  );
  assert.doesNotMatch(
    clientSource,
    new RegExp(`import \\{ ${factoryName} \\}`),
    `client.js should not import ${factoryName} directly`
  );
});

assert.match(
  clientSource,
  /import \{ createAppControllers \} from '\.\/controllers\/app-controller-registry\.js';/,
  'client.js should import the app controller registry'
);
assert.match(
  clientSource,
  /Object\.assign\(controllers,\s*createAppControllers\(\{/,
  'client createControllers should delegate to the app controller registry'
);

[
  'scrollController',
  'searchController',
  'tagController',
  'knowledgePointController',
  'sidebarController',
  'workspaceController',
  'navigationController',
  'tabController',
  'editorController',
  'shellController'
].forEach((controllerName) => {
  assert.match(
    registrySource,
    new RegExp(`\\b${controllerName}\\b`),
    `${controllerName} should be returned from the registry`
  );
});

console.log('app-controller-registry tests passed');
