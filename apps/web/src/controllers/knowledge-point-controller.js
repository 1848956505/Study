import { getKnowledgePointFormUpdates } from '../../lib/knowledge-points/form.js';
import {
  buildKnowledgePointInputFromSelection,
  buildKnowledgePointSourceInputFromSelection
} from '../../lib/knowledge-points/selection.js';
import {
  addLocalKnowledgePointSource,
  buildCurrentNoteKnowledgePointSources,
  createLocalKnowledgePointAggregate,
  insertKnowledgePointCollections,
  removeLocalKnowledgePointSource,
  removeKnowledgePointCollections,
  replaceKnowledgePointCollections,
  syncKnowledgePointMembershipCollections
} from '../../lib/knowledge-points/state.js';

export function createKnowledgePointController(deps) {
  const {
    state,
    elements,
    editorRuntime,
    knowledgeApi,
    getCurrentNote,
    renderSidebar,
    flashStatus
  } = deps;

function replaceKnowledgePointInState(point) {
  const nextCollections = replaceKnowledgePointCollections(state, point);
  state.knowledgePoints = nextCollections.knowledgePoints;
  state.allKnowledgePoints = nextCollections.allKnowledgePoints;
}

function insertKnowledgePointInState(point) {
  const nextCollections = insertKnowledgePointCollections(state, point);
  state.knowledgePoints = nextCollections.knowledgePoints;
  state.allKnowledgePoints = nextCollections.allKnowledgePoints;
}

function removeKnowledgePointFromState(pointId) {
  const nextCollections = removeKnowledgePointCollections(state, pointId);
  state.knowledgePoints = nextCollections.knowledgePoints;
  state.allKnowledgePoints = nextCollections.allKnowledgePoints;
}

function syncKnowledgePointMembership(point) {
  const nextCollections = syncKnowledgePointMembershipCollections(
    state,
    point,
    getCurrentNote()?.id ?? null
  );
  state.knowledgePoints = nextCollections.knowledgePoints;
  state.allKnowledgePoints = nextCollections.allKnowledgePoints;
}

function getCurrentKnowledgePointSources() {
  return buildCurrentNoteKnowledgePointSources(state.knowledgePoints, getCurrentNote()?.id ?? null);
}

function syncKnowledgePointMarkers() {
  void editorRuntime.currentEditorHost?.setKnowledgePointSources(getCurrentKnowledgePointSources());
}

function scrollKnowledgePointCardIntoView(pointId) {
  requestAnimationFrame(() => {
    const cards = Array.from(elements.asideContent?.querySelectorAll('[data-knowledge-point-id]') ?? []);
    const card = cards.find((item) => item.dataset.knowledgePointId === pointId);
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function focusKnowledgePointFromMarker({ sourceId, knowledgePointId }) {
  const point = knowledgePointId
    ? state.knowledgePoints.find((item) => item.id === knowledgePointId)
    : state.knowledgePoints.find((item) => (item.sources ?? []).some((source) => source.id === sourceId));
  if (!point) {
    return;
  }

  state.asideTab = 'concepts';
  state.expandedKnowledgePointIds = {
    ...state.expandedKnowledgePointIds,
    [point.id]: true
  };
  renderSidebar(getCurrentNote());
  scrollKnowledgePointCardIntoView(point.id);
}

async function selectKnowledgePointSource(sourceId) {
  if (!editorRuntime.currentEditorHost) {
    flashStatus('编辑器尚未就绪');
    return;
  }

  const sourcePoint = state.knowledgePoints.find((point) => (
    (point.sources ?? []).some((source) => source.id === sourceId)
  ));
  if (sourcePoint) {
    state.expandedKnowledgePointIds = {
      ...state.expandedKnowledgePointIds,
      [sourcePoint.id]: true
    };
    renderSidebar(getCurrentNote());
  }

  const selected = await editorRuntime.currentEditorHost.selectKnowledgePointSource(sourceId);
  flashStatus(selected ? '已定位到正文片段' : '未能在正文中定位该片段');
}

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

    insertKnowledgePointInState(created);
    syncKnowledgePointMarkers();
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

    syncKnowledgePointMembership(updated);
    state.asideTab = 'concepts';
    state.knowledgePointAttachComposer = { query: '', isOpen: false };
    state.expandedKnowledgePointIds = {
      ...state.expandedKnowledgePointIds,
      [updated.id]: true
    };
    syncKnowledgePointMarkers();
    renderSidebar(getCurrentNote());
    flashStatus('已加入已有知识点');
  } catch (error) {
    flashStatus(error.message || '加入已有知识点失败');
  }
}

async function removeKnowledgePointSourceFromCurrentNote(sourceId) {
  try {
    let updated;
    if (state.dataMode === 'local' || state.dataMode === 'cache') {
      const point = state.allKnowledgePoints.find((item) => (item.sources ?? []).some((source) => source.id === sourceId));
      if (!point) {
        return;
      }
      const result = removeLocalKnowledgePointSource({
        point,
        sourceId,
        currentNoteId: getCurrentNote()?.id
      });
      if (result.reason === 'last-source') {
        flashStatus('知识点至少需要保留一个原文片段');
        return;
      }
      if (!result.updatedPoint) {
        return;
      }
      updated = result.updatedPoint;
    } else {
      updated = await knowledgeApi.deleteKnowledgePointSource(sourceId);
    }

    syncKnowledgePointMembership(updated);
    syncKnowledgePointMarkers();
    renderSidebar(getCurrentNote());
    flashStatus('已从当前笔记移除该原文片段');
  } catch (error) {
    flashStatus(error.message || '移除原文片段失败');
  }
}

async function deleteKnowledgePointFromLibrary(pointId) {
  try {
    if (state.dataMode === 'local' || state.dataMode === 'cache') {
      removeKnowledgePointFromState(pointId);
    } else {
      await knowledgeApi.deleteKnowledgePoint(pointId);
      removeKnowledgePointFromState(pointId);
    }

    syncKnowledgePointMarkers();
    renderSidebar(getCurrentNote());
    flashStatus('知识点已删除');
  } catch (error) {
    flashStatus(error.message || '删除知识点失败');
  }
}

async function updateCurrentKnowledgePoint(pointId, form) {
  const point = state.knowledgePoints.find((item) => item.id === pointId);
  if (!point) {
    return;
  }

  const updates = getKnowledgePointFormUpdates(form);
  if (!updates.title) {
    flashStatus('知识点标题不能为空');
    return;
  }

  try {
    if (state.dataMode === 'local' || state.dataMode === 'cache') {
      replaceKnowledgePointInState({
        ...point,
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } else {
      replaceKnowledgePointInState(await knowledgeApi.updateKnowledgePoint(pointId, updates));
    }

    state.knowledgePointEditing = null;
    syncKnowledgePointMarkers();
    renderSidebar(getCurrentNote());
    flashStatus('知识点已更新');
  } catch (error) {
    flashStatus(error.message || '更新知识点失败');
  }
}

  return {
    replaceKnowledgePointInState,
    insertKnowledgePointInState,
    removeKnowledgePointFromState,
    syncKnowledgePointMembership,
    getCurrentKnowledgePointSources,
    syncKnowledgePointMarkers,
    scrollKnowledgePointCardIntoView,
    focusKnowledgePointFromMarker,
    selectKnowledgePointSource,
    createKnowledgePointFromCurrentSelection,
    attachSelectionToExistingKnowledgePoint,
    removeKnowledgePointSourceFromCurrentNote,
    deleteKnowledgePointFromLibrary,
    updateCurrentKnowledgePoint
  };
}
