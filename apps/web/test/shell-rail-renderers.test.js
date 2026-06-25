import assert from 'node:assert/strict';
import {
  getRailLabel,
  renderModuleRail,
  renderRailIcon
} from '../lib/shell/rail-renderers.js';

assert.equal(getRailLabel('knowledge'), '知识库');
assert.equal(getRailLabel('paper'), '题库');
assert.equal(getRailLabel('unknown <module>'), 'unknown <module>');

const html = renderModuleRail([
  { key: 'knowledge', active: true },
  { key: 'unknown <module>', active: false }
]);

assert.match(html, /class="rail-item"/);
assert.match(html, /data-active="true"/);
assert.match(html, /aria-label="知识库"/);
assert.match(html, /rail-item-label">知识库</);
assert.match(html, /data-active="false"/);
assert.match(html, /aria-label="unknown &lt;module&gt;"/);
assert.match(html, /rail-item-label">unknown &lt;module&gt;</);
assert.match(html, /rail-item-icon/);
assert.match(html, /<svg viewBox="0 0 24 24">/);

assert.match(renderRailIcon('settings'), /<svg viewBox="0 0 24 24">/);
assert.equal(renderRailIcon('missing'), '');

console.log('ok - shell rail renderers produce stable module rail markup');
