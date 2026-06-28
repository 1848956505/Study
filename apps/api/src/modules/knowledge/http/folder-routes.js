import { parseBody, toQueryObject } from '../../../http/request.js';
import { sendJson } from '../../../http/response.js';

export async function handleFolderRoute({ request, response, url, appContext, knowledge }) {
  if (request.method === 'POST' && url.pathname === '/api/knowledge/folders') {
    const body = await parseBody(request);
    sendJson(response, 201, {
      data: knowledge.createFolder(body)
    });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/knowledge/folders') {
    sendJson(response, 200, {
      data: knowledge.listFolders(toQueryObject(url))
    });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/knowledge/folders/tree') {
    sendJson(response, 200, {
      data: knowledge.listFolderTree(toQueryObject(url))
    });
    return true;
  }

  if (request.method === 'PATCH' && url.pathname.startsWith('/api/knowledge/folders/')) {
    const folderId = url.pathname.split('/')[4];
    const body = await parseBody(request);
    sendJson(response, 200, {
      data: knowledge.updateFolder({ id: decodeURIComponent(folderId) }, body)
    });
    return true;
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/api/knowledge/folders/')) {
    const folderId = url.pathname.split('/')[4];
    sendJson(response, 200, {
      data: knowledge.deleteFolder({ id: decodeURIComponent(folderId) })
    });
    return true;
  }

  return false;
}

