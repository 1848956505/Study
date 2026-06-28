export function createKnowledgePointMarkerController(deps, knowledgePointState) {
  const {
    state,
    elements,
    editorRuntime,
    getCurrentNote,
    renderSidebar,
    flashStatus
  } = deps;

  function syncKnowledgePointMarkers() {
    void editorRuntime.currentEditorHost?.setKnowledgePointSources(
      knowledgePointState.getCurrentKnowledgePointSources()
    );
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

  return {
    syncKnowledgePointMarkers,
    scrollKnowledgePointCardIntoView,
    focusKnowledgePointFromMarker,
    selectKnowledgePointSource
  };
}
