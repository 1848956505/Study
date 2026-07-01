import { parseBody, toQueryObject } from '../../../http/request.js';
import { sendJson } from '../../../http/response.js';

export async function handleNoteRoute({ request, response, url, knowledge }) {
  if (request.method === 'GET' && url.pathname === '/api/knowledge/notes') {
    sendJson(response, 200, {
      data: knowledge.listNotes(toQueryObject(url))
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/knowledge/notes') {
    const body = await parseBody(request);
    sendJson(response, 201, {
      data: knowledge.createNote(body)
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/knowledge/notes/import-markdown') {
    const body = await parseBody(request);
    sendJson(response, 201, {
      data: knowledge.importMarkdown(body)
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/knowledge/notes/import-markdown-batch') {
    const body = await parseBody(request);
    sendJson(response, 201, {
      data: knowledge.importMarkdownBatch(body)
    });
    return true;
  }

  if (request.method === 'DELETE' && url.pathname === '/api/knowledge/notes/recycle-bin') {
    sendJson(response, 200, {
      data: knowledge.emptyRecycleBin(toQueryObject(url))
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/knowledge/notes/batch/delete') {
    const body = await parseBody(request);
    sendJson(response, 200, {
      data: knowledge.deleteNotes(body)
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/knowledge/notes/batch/tags') {
    const body = await parseBody(request);
    sendJson(response, 200, {
      data: knowledge.assignTagToNotes(body)
    });
    return true;
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/api/knowledge/notes/') && url.pathname.includes('/tags/')) {
    const tagPathMatch = url.pathname.match(/^\/api\/knowledge\/notes\/([^/]+)\/tags\/(.+)$/);
    if (!tagPathMatch) {
      return false;
    }
    sendJson(response, 200, {
      data: knowledge.removeTagFromNote({
        id: decodeURIComponent(tagPathMatch[1]),
        tagId: decodeURIComponent(tagPathMatch[2])
      })
    });
    return true;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/knowledge/notes/')) {
    const noteId = url.pathname.split('/')[4];
    if (noteId && url.pathname.endsWith('/links')) {
      sendJson(response, 200, {
        data: knowledge.getLinkedNotes({ id: decodeURIComponent(noteId) })
      });
      return true;
    }
    if (noteId && !url.pathname.endsWith('/tags') && !url.pathname.includes('/tags/') && !url.pathname.endsWith('/links')) {
      sendJson(response, 200, {
        data: knowledge.getNote({ id: decodeURIComponent(noteId) }, toQueryObject(url))
      });
      return true;
    }
  }

  if (request.method === 'PATCH' && url.pathname.startsWith('/api/knowledge/notes/')) {
    const noteId = url.pathname.split('/')[4];
    if (noteId && !url.pathname.endsWith('/tags') && !url.pathname.includes('/tags/')) {
      const body = await parseBody(request);
      sendJson(response, 200, {
        data: knowledge.updateNote({ id: decodeURIComponent(noteId) }, body)
      });
      return true;
    }
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/api/knowledge/notes/')) {
    const noteId = url.pathname.split('/')[4];
    if (noteId === 'recycle-bin') {
      sendJson(response, 404, {
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: 'Route not found'
        }
      });
      return true;
    }
    if (noteId && url.pathname.endsWith('/permanent')) {
      sendJson(response, 200, {
        data: knowledge.permanentlyDeleteNote({ id: decodeURIComponent(noteId) })
      });
      return true;
    }
    if (noteId && !url.pathname.endsWith('/tags') && !url.pathname.includes('/tags/')) {
      sendJson(response, 200, {
        data: knowledge.deleteNote({ id: decodeURIComponent(noteId) })
      });
      return true;
    }
  }

  if (request.method === 'POST' && url.pathname.startsWith('/api/knowledge/notes/') && url.pathname.endsWith('/favorite')) {
    const noteId = url.pathname.split('/')[4];
    if (noteId) {
      const body = await parseBody(request);
      sendJson(response, 200, {
        data: knowledge.setFavorite({ id: decodeURIComponent(noteId) }, body)
      });
      return true;
    }
  }

  if (request.method === 'POST' && url.pathname.startsWith('/api/knowledge/notes/') && url.pathname.endsWith('/restore')) {
    const noteId = url.pathname.split('/')[4];
    if (noteId) {
      sendJson(response, 200, {
        data: knowledge.restoreNote({ id: decodeURIComponent(noteId) })
      });
      return true;
    }
  }

  if (request.method === 'POST' && url.pathname.startsWith('/api/knowledge/notes/') && url.pathname.endsWith('/tags')) {
    const segments = url.pathname.split('/');
    const noteId = segments[4];
    const body = await parseBody(request);
    sendJson(response, 200, {
      data: knowledge.assignTagToNote({ id: decodeURIComponent(noteId) }, body)
    });
    return true;
  }

  if (request.method === 'PUT' && url.pathname.startsWith('/api/knowledge/notes/') && url.pathname.endsWith('/tags')) {
    const segments = url.pathname.split('/');
    const noteId = segments[4];
    const body = await parseBody(request);
    sendJson(response, 200, {
      data: knowledge.setNoteTags({
        id: decodeURIComponent(noteId)
      }, body)
    });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/knowledge/search/notes') {
    sendJson(response, 200, {
      data: knowledge.searchNotes(toQueryObject(url))
    });
    return true;
  }

  return false;
}

