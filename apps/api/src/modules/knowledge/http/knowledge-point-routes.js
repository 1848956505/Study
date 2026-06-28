import { parseBody, toQueryObject } from '../../../http/request.js';
import { sendJson } from '../../../http/response.js';

export async function handleKnowledgePointRoute({ request, response, url, appContext, knowledge }) {
  if (request.method === 'GET' && url.pathname === '/api/knowledge/knowledge-points') {
    sendJson(response, 200, {
      data: knowledge.listKnowledgePoints(toQueryObject(url))
    });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/knowledge/knowledge-point-tag-groups') {
    sendJson(response, 200, {
      data: knowledge.listKnowledgePointTagGroups(toQueryObject(url))
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/knowledge/knowledge-points') {
    const body = await parseBody(request);
    sendJson(response, 201, {
      data: knowledge.createKnowledgePoint(body)
    });
    return true;
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/api/knowledge/knowledge-point-sources/')) {
    const sourceId = url.pathname.split('/')[4];
    sendJson(response, 200, {
      data: knowledge.deleteKnowledgePointSource({ sourceId: decodeURIComponent(sourceId) })
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname.startsWith('/api/knowledge/knowledge-points/') && url.pathname.endsWith('/sources')) {
    const knowledgePointId = url.pathname.split('/')[4];
    const body = await parseBody(request);
    sendJson(response, 201, {
      data: knowledge.addSourceToKnowledgePoint({ id: decodeURIComponent(knowledgePointId) }, body)
    });
    return true;
  }

  if (request.method === 'PATCH' && url.pathname.startsWith('/api/knowledge/knowledge-points/')) {
    const knowledgePointId = url.pathname.split('/')[4];
    const body = await parseBody(request);
    sendJson(response, 200, {
      data: knowledge.updateKnowledgePoint({ id: decodeURIComponent(knowledgePointId) }, body)
    });
    return true;
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/api/knowledge/knowledge-points/')) {
    const knowledgePointId = url.pathname.split('/')[4];
    sendJson(response, 200, {
      data: knowledge.deleteKnowledgePoint({ id: decodeURIComponent(knowledgePointId) })
    });
    return true;
  }

  return false;
}

