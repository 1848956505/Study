import { asArray } from '../api-response.js';

export function createNoteSideApi({ requestJson }) {
  async function loadNoteSideData({ noteId, spaceId }) {
    const encodedNoteId = encodeURIComponent(noteId ?? '');
    const encodedSpaceId = encodeURIComponent(spaceId ?? '');
    const [
      linkedPayload,
      attachmentsPayload,
      knowledgePointsPayload,
      allKnowledgePointsPayload,
      tagGroupsPayload
    ] = await Promise.all([
      requestJson(`/api/knowledge/notes/${encodedNoteId}/links`),
      requestJson(`/api/storage/attachments?noteId=${encodedNoteId}`),
      requestJson(`/api/knowledge/knowledge-points?spaceId=${encodedSpaceId}&noteId=${encodedNoteId}`),
      requestJson(`/api/knowledge/knowledge-points?spaceId=${encodedSpaceId}`),
      requestJson(`/api/knowledge/knowledge-point-tag-groups?spaceId=${encodedSpaceId}`)
    ]);

    return {
      linkedNotes: asArray(linkedPayload.data),
      attachments: asArray(attachmentsPayload.data),
      knowledgePoints: asArray(knowledgePointsPayload.data),
      allKnowledgePoints: asArray(allKnowledgePointsPayload.data),
      knowledgePointTagGroups: asArray(tagGroupsPayload.data)
    };
  }

  return { loadNoteSideData };
}
