import { getKnowledgePointFormUpdates } from '../../../lib/knowledge-points/form.js';
import { removeLocalKnowledgePointSource } from '../../../lib/knowledge-points/state.js';

export function createKnowledgePointMutationController(deps, knowledgePointState, markerController) {
  const {
    state,
    knowledgeApi,
    getCurrentNote,
    renderSidebar,
    flashStatus
  } = deps;

  async function removeKnowledgePointSourceFromCurrentNote(sourceId) {
    try {
      let updated;
      if (state.dataMode === 'local' || state.dataMode === 'cache') {
        const point = state.allKnowledgePoints.find((item) => (
          (item.sources ?? []).some((source) => source.id === sourceId)
        ));
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

      knowledgePointState.syncKnowledgePointMembership(updated);
      markerController.syncKnowledgePointMarkers();
      renderSidebar(getCurrentNote());
      flashStatus('已从当前笔记移除该原文片段');
    } catch (error) {
      flashStatus(error.message || '移除原文片段失败');
    }
  }

  async function deleteKnowledgePointFromLibrary(pointId) {
    try {
      if (state.dataMode === 'local' || state.dataMode === 'cache') {
        knowledgePointState.removeKnowledgePointFromState(pointId);
      } else {
        await knowledgeApi.deleteKnowledgePoint(pointId);
        knowledgePointState.removeKnowledgePointFromState(pointId);
      }

      markerController.syncKnowledgePointMarkers();
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
        knowledgePointState.replaceKnowledgePointInState({
          ...point,
          ...updates,
          updatedAt: new Date().toISOString()
        });
      } else {
        knowledgePointState.replaceKnowledgePointInState(
          await knowledgeApi.updateKnowledgePoint(pointId, updates)
        );
      }

      state.knowledgePointEditing = null;
      markerController.syncKnowledgePointMarkers();
      renderSidebar(getCurrentNote());
      flashStatus('知识点已更新');
    } catch (error) {
      flashStatus(error.message || '更新知识点失败');
    }
  }

  return {
    removeKnowledgePointSourceFromCurrentNote,
    deleteKnowledgePointFromLibrary,
    updateCurrentKnowledgePoint
  };
}
