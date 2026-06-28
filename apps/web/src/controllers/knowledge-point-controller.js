import { createKnowledgePointMarkerController } from './knowledge-point/marker-controller.js';
import { createKnowledgePointMutationController } from './knowledge-point/mutation-controller.js';
import { createKnowledgePointSelectionController } from './knowledge-point/selection-controller.js';
import { createKnowledgePointStateController } from './knowledge-point/state-controller.js';

export function createKnowledgePointController(deps) {
  const knowledgePointState = createKnowledgePointStateController(deps);
  const markerController = createKnowledgePointMarkerController(deps, knowledgePointState);
  const selectionController = createKnowledgePointSelectionController(
    deps,
    knowledgePointState,
    markerController
  );
  const mutationController = createKnowledgePointMutationController(
    deps,
    knowledgePointState,
    markerController
  );

  return {
    ...knowledgePointState,
    ...markerController,
    ...selectionController,
    ...mutationController
  };
}
