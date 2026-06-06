import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readRuntimePorts, resolveApiPort, writeRuntimePort } from '../dev-runtime-ports.js';

function runTest(name, callback) {
  try {
    callback();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

runTest('resolveApiPort prefers explicit env api port', () => {
  const port = resolveApiPort({
    envApiPort: '3003',
    runtimePorts: { api: 3001 },
    webPort: 3001
  });

  assert.equal(port, 3003);
});

runTest('resolveApiPort falls back to runtime registry when env is missing', () => {
  const port = resolveApiPort({
    envApiPort: '',
    runtimePorts: { api: 3003 },
    webPort: 3001
  });

  assert.equal(port, 3003);
});

runTest('resolveApiPort avoids routing to the same port as the web server', () => {
  const port = resolveApiPort({
    envApiPort: '',
    runtimePorts: { api: 3001 },
    webPort: 3001,
    fallbackPort: 3001
  });

  assert.equal(port, 3002);
});

runTest('writeRuntimePort persists a shared runtime port file', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'study-runtime-ports-'));
  const filePath = path.join(tempRoot, 'dev-ports.json');

  writeRuntimePort(filePath, 'api', 3003);
  writeRuntimePort(filePath, 'web', 3001);

  assert.deepEqual(readRuntimePorts(filePath), { api: 3003, web: 3001 });
});
