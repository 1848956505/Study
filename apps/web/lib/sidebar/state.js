export function createClearedNoteSideData({ editing = null, keepEditing = false } = {}) {
  return {
    linkedNotes: [],
    attachments: [],
    knowledgePoints: [],
    allKnowledgePoints: [],
    knowledgePointTagGroups: [],
    knowledgePointEditing: keepEditing ? editing : null
  };
}

export function createLocalNoteSideData({ noteId, notes = [], attachments = [] } = {}) {
  if (!noteId) {
    return createClearedNoteSideData();
  }

  const note = notes.find((item) => item.id === noteId);

  return {
    linkedNotes: (note?.internalLinks ?? [])
      .map((linkedId) => notes.find((item) => item.id === linkedId))
      .filter(Boolean),
    attachments: attachments.filter((attachment) => attachment.noteId === noteId),
    knowledgePoints: [],
    allKnowledgePoints: [],
    knowledgePointTagGroups: []
  };
}
