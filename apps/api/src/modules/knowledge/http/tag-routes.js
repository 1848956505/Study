import { parseBody, toQueryObject } from '../../../http/request.js';
import { sendJson } from '../../../http/response.js';

export async function handleTagRoute({ request, response, url, appContext, knowledge }) {
  if (request.method === 'POST' && url.pathname === '/api/knowledge/tags') {
    const body = await parseBody(request);
    sendJson(response, 201, {
      data: knowledge.createTag(body)
    });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/knowledge/tags') {
    sendJson(response, 200, {
      data: knowledge.listTags(toQueryObject(url))
    });
    return true;
  }

  if (request.method === 'PATCH' && url.pathname.startsWith('/api/knowledge/tags/')) {
    const tagId = url.pathname.split('/')[4];
    const body = await parseBody(request);
    sendJson(response, 200, {
      data: knowledge.updateTag({ id: decodeURIComponent(tagId) }, body)
    });
    return true;
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/api/knowledge/tags/')) {
    const tagId = url.pathname.split('/')[4];
    sendJson(response, 200, {
      data: knowledge.deleteTag({ id: decodeURIComponent(tagId) })
    });
    return true;
  }

  return false;
}

