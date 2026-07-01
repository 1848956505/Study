import {
  buildKnowledgePointInputFromSelection,
  buildKnowledgePointSourceInputFromSelection
} from '../../../lib/knowledge-points/selection.js';
import {
  addLocalKnowledgePointSource,
  createLocalKnowledgePointAggregate
} from '../../../lib/knowledge-points/state.js';

export function createKnowledgePointSelectionController(deps, knowledgePointState, markerController) {
  const {
    state,
    editorRuntime,
    knowledgeApi,
    getCurrentNote,
    renderSidebar,
    flashStatus
  } = deps;

  async function createKnowledgePointFromCurrentSelection(note) {
    if (!editorRuntime.currentEditorHost) {
      flashStatus('编辑器尚未就绪');
      return;
    }

    const selection = await editorRuntime.currentEditorHost.getSelectionSnapshot();
    if (!selection) {
      flashStatus('请先选中正文片段');
      return;
    }

    const input = buildKnowledgePointInputFromSelection({
      note: {
        ...note,
        spaceId: note.spaceId ?? state.currentSpaceId
      },
      selection
    });

    try {
      let created;
      if (state.dataMode === 'local' || state.dataMode === 'cache') {
        created = createLocalKnowledgePointAggregate(input);
      } else {
        created = await knowledgeApi.createKnowledgePoint(input);
      }

      knowledgePointState.insertKnowledgePointInState(created);
      markerController.syncKnowledgePointMarkers();
      state.asideTab = 'concepts';
      state.expandedKnowledgePointIds = {
        ...state.expandedKnowledgePointIds,
        [created.id]: true
      };
      renderSidebar(getCurrentNote());
      flashStatus('已从选区创建知识点');
    } catch (error) {
      flashStatus(error.message || '创建知识点失败');
    }
  }

  async function attachSelectionToExistingKnowledgePoint(pointId) {
    const note = getCurrentNote();
    if (!note || !editorRuntime.currentEditorHost) {
      flashStatus('请先打开笔记并选中正文片段');
      return;
    }

    const selection = await editorRuntime.currentEditorHost.getSelectionSnapshot();
    if (!selection) {
      flashStatus('请先选中要加入知识点的正文片段');
      return;
    }

    const sourceInput = buildKnowledgePointSourceInputFromSelection({
      note: {
        ...note,
        spaceId: note.spaceId ?? state.currentSpaceId
      },
      selection
    });

    try {
      let updated;
      if (state.dataMode === 'local' || state.dataMode === 'cache') {
        const point = state.allKnowledgePoints.find((item) => item.id === pointId);
        updated = addLocalKnowledgePointSource(point, sourceInput, note.id);
        if (!updated) {
          flashStatus('未找到要加入的知识点');
          return;
        }
      } else {
        updated = await knowledgeApi.addSourceToKnowledgePoint(pointId, sourceInput);
      }

      knowledgePointState.syncKnowledgePointMembership(updated);
      state.asideTab = 'concepts';
      state.knowledgePointAttachComposer = { query: '', isOpen: false };
      state.expandedKnowledgePointIds = {
        ...state.expandedKnowledgePointIds,
        [updated.id]: true
      };
      markerController.syncKnowledgePointMarkers();
      renderSidebar(getCurrentNote());
      flashStatus('已加入已有知识点');
    } catch (error) {
      flashStatus(error.message || '加入已有知识点失败');
    }
  }

  return {
    createKnowledgePointFromCurrentSelection,
    attachSelectionToExistingKnowledgePoint
  };
}
