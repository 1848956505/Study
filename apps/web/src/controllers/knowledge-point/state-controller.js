import {
  buildCurrentNoteKnowledgePointSources,
  insertKnowledgePointCollections,
  removeKnowledgePointCollections,
  replaceKnowledgePointCollections,
  syncKnowledgePointMembershipCollections
} from '../../../lib/knowledge-points/state.js';

export function createKnowledgePointStateController(deps) {
  const {
    state,
    getCurrentNote
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

  return {
    replaceKnowledgePointInState,
    insertKnowledgePointInState,
    removeKnowledgePointFromState,
    syncKnowledgePointMembership,
    getCurrentKnowledgePointSources
  };
}
