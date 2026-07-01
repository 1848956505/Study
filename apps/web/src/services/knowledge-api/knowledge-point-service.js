import { getData } from '../api-response.js';

export function createKnowledgePointApi({ requestJson }) {
  async function createKnowledgePoint(input) {
    return getData(await requestJson('/api/knowledge/knowledge-points', {
      method: 'POST',
      body: JSON.stringify(input)
    }));
  }

  async function addSourceToKnowledgePoint(pointId, input) {
    return getData(await requestJson(
      `/api/knowledge/knowledge-points/${encodeURIComponent(pointId)}/sources`,
      {
        method: 'POST',
        body: JSON.stringify(input)
      }
    ));
  }

  async function deleteKnowledgePointSource(sourceId) {
    return getData(await requestJson(
      `/api/knowledge/knowledge-point-sources/${encodeURIComponent(sourceId)}`,
      { method: 'DELETE' }
    ));
  }

  async function deleteKnowledgePoint(pointId) {
    return getData(await requestJson(
      `/api/knowledge/knowledge-points/${encodeURIComponent(pointId)}`,
      { method: 'DELETE' }
    ));
  }

  async function updateKnowledgePoint(pointId, updates) {
    return getData(await requestJson(`/api/knowledge/knowledge-points/${encodeURIComponent(pointId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }));
  }

  return {
    createKnowledgePoint,
    addSourceToKnowledgePoint,
    deleteKnowledgePointSource,
    deleteKnowledgePoint,
    updateKnowledgePoint
  };
}
