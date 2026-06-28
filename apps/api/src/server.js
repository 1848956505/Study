import { URL } from 'node:url';
import http from 'node:http';
import { sendJson } from './http/response.js';
import { handleStorageRoute } from './http/storage-routes.js';
import { handleKnowledgeRoute } from './modules/knowledge/http/knowledge-routes.js';

export function createServer({ appContext }) {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const { knowledge, storage } = appContext.http;

      if (request.method === 'GET' && url.pathname === '/') {
        sendJson(response, 200, {
          data: {
            name: 'Study Accelerator API',
            health: '/api/health'
          }
        });
        return;
      }

      if (request.method === 'GET' && url.pathname === '/api/health') {
        sendJson(response, 200, {
          data: {
            status: 'ok'
          }
        });
        return;
      }

      if (await handleStorageRoute({ request, response, url, storage })) {
        return;
      }

      if (await handleKnowledgeRoute({ request, response, url, appContext, knowledge })) {
        return;
      }

      sendJson(response, 404, {
        error: 'Route not found'
      });
    } catch (error) {
      sendJson(response, 400, {
        error: error.message
      });
    }
  });
}
