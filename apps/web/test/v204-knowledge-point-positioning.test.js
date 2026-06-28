import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { renderKnowledgePointPanel } from '../lib/knowledge-points/panel.js';

const html = renderKnowledgePointPanel({
  note: { id: 'note-v204', title: 'V2.0.4 Note' },
  points: [
    {
      id: 'kp-v204',
      title: '定位测试',
      comment: '',
      tagIds: [],
      sources: [
        {
          id: 'src-v204',
          knowledgePointId: 'kp-v204',
          noteId: 'note-v204',
          sourceText: '点击原文片段应回到正文选区',
          anchor: { type: 'prosemirror-text-range', from: 8, to: 21 },
          startOffset: 8,
          endOffset: 21
        }
      ]
    }
  ],
  expandedIds: { 'kp-v204': true }
});

assert.match(html, /data-knowledge-point-source-jump="src-v204"/);
assert.match(html, /data-knowledge-point-id="kp-v204"/);
assert.match(html, /点击原文片段应回到正文选区/);

const knowledgePointControllerJs = readFileSync(new URL('../src/controllers/knowledge-point-controller.js', import.meta.url), 'utf8');
const knowledgePointMarkerControllerJs = readFileSync(new URL('../src/controllers/knowledge-point/marker-controller.js', import.meta.url), 'utf8');
const asideClickEventsJs = readFileSync(new URL('../lib/events/aside-events/click.js', import.meta.url), 'utf8');
const editorContentEventsJs = readFileSync(new URL('../lib/events/editor-content-events.js', import.meta.url), 'utf8');
assert.match(knowledgePointControllerJs, /createKnowledgePointMarkerController/);
assert.match(knowledgePointMarkerControllerJs, /syncKnowledgePointMarkers/);
assert.match(knowledgePointMarkerControllerJs, /setKnowledgePointSources/);
assert.match(knowledgePointMarkerControllerJs, /selectKnowledgePointSource/);
assert.match(asideClickEventsJs, /data-knowledge-point-source-jump/);
assert.match(editorContentEventsJs, /knowledge-point-marker-click/);
assert.match(knowledgePointMarkerControllerJs, /scrollKnowledgePointCardIntoView/);

const milkdownEntry = readFileSync(new URL('../lib/editor/milkdown-entry.js', import.meta.url), 'utf8');
const knowledgePointHighlightPluginJs = readFileSync(new URL('../lib/editor/milkdown/plugins/knowledge-point-highlight-plugin.js', import.meta.url), 'utf8');
assert.match(`${milkdownEntry}\n${knowledgePointHighlightPluginJs}`, /knowledgePointHighlightPluginKey/);
assert.match(milkdownEntry, /setKnowledgePointSources/);
assert.match(milkdownEntry, /selectKnowledgePointSource/);
assert.match(knowledgePointHighlightPluginJs, /data-knowledge-point-source-id/);

console.log('ok - V2.0.4 knowledge point source positioning hooks are wired');
