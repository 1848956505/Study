import { handleFolderRoute } from './folder-routes.js';
import { handleKnowledgePointRoute } from './knowledge-point-routes.js';
import { handleNoteRoute } from './note-routes.js';
import { handleSpaceRoute } from './space-routes.js';
import { handleTagRoute } from './tag-routes.js';

const knowledgeRouteHandlers = [
  handleKnowledgePointRoute,
  handleNoteRoute,
  handleFolderRoute,
  handleTagRoute,
  handleSpaceRoute
];

export async function handleKnowledgeRoute(context) {
  for (const handler of knowledgeRouteHandlers) {
    if (await handler(context)) {
      return true;
    }
  }

  return false;
}
