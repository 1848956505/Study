function withoutPoint(points, pointId) {
  return (points ?? []).filter((point) => point.id !== pointId);
}

function getCollections(collections = {}) {
  return {
    knowledgePoints: collections.knowledgePoints ?? [],
    allKnowledgePoints: collections.allKnowledgePoints ?? []
  };
}

export function insertKnowledgePointCollections(collections, point) {
  const current = getCollections(collections);
  return {
    knowledgePoints: [point, ...withoutPoint(current.knowledgePoints, point.id)],
    allKnowledgePoints: [point, ...withoutPoint(current.allKnowledgePoints, point.id)]
  };
}

export function replaceKnowledgePointCollections(collections, point) {
  const current = getCollections(collections);
  return {
    knowledgePoints: current.knowledgePoints.map((item) => (item.id === point.id ? point : item)),
    allKnowledgePoints: current.allKnowledgePoints.map((item) => (item.id === point.id ? point : item))
  };
}

export function removeKnowledgePointCollections(collections, pointId) {
  const current = getCollections(collections);
  return {
    knowledgePoints: withoutPoint(current.knowledgePoints, pointId),
    allKnowledgePoints: withoutPoint(current.allKnowledgePoints, pointId)
  };
}

export function syncKnowledgePointMembershipCollections(collections, point, currentNoteId) {
  const current = getCollections(collections);
  const nextAllKnowledgePoints = [point, ...withoutPoint(current.allKnowledgePoints, point.id)];
  const belongsToCurrentNote = Boolean(currentNoteId && (point.noteIds ?? []).includes(currentNoteId));

  return {
    knowledgePoints: belongsToCurrentNote
      ? [point, ...withoutPoint(current.knowledgePoints, point.id)]
      : withoutPoint(current.knowledgePoints, point.id),
    allKnowledgePoints: nextAllKnowledgePoints
  };
}

export function buildCurrentNoteKnowledgePointSources(points, currentNoteId) {
  if (!currentNoteId) {
    return [];
  }

  return (points ?? []).flatMap((point) => (point.sources ?? [])
    .filter((source) => source.noteId === currentNoteId)
    .map((source) => ({
      ...source,
      knowledgePointId: point.id
    })));
}

export function addLocalKnowledgePointSource(point, sourceInput, noteId, timestamp = new Date().toISOString()) {
  if (!point) {
    return null;
  }

  const sources = point.sources ?? [];
  return {
    ...point,
    sources: [
      ...sources,
      {
        ...sourceInput,
        knowledgePointId: point.id,
        sortOrder: sources.length + 1,
        isAnchorValid: true,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ],
    noteIds: [...new Set([...(point.noteIds ?? []), noteId])],
    updatedAt: timestamp
  };
}

export function removeLocalKnowledgePointSource({
  point,
  sourceId,
  currentNoteId,
  timestamp = new Date().toISOString()
} = {}) {
  if (!point) {
    return { updatedPoint: null, reason: 'missing-point' };
  }

  const sources = point.sources ?? [];
  const source = sources.find((item) => item.id === sourceId);
  const nextSources = sources.filter((item) => item.id !== sourceId);
  if (!source || nextSources.length === sources.length) {
    return { updatedPoint: null, reason: 'missing-source' };
  }
  if (nextSources.length === 0) {
    return { updatedPoint: null, reason: 'last-source' };
  }

  const hasCurrentNoteSources = nextSources.some((item) => item.noteId === currentNoteId);
  return {
    updatedPoint: {
      ...point,
      sources: nextSources,
      noteIds: hasCurrentNoteSources || source.noteId !== currentNoteId
        ? point.noteIds
        : (point.noteIds ?? []).filter((noteId) => noteId !== currentNoteId),
      updatedAt: timestamp
    },
    reason: null
  };
}

export function createLocalKnowledgePointAggregate(input, timestamp = new Date().toISOString()) {
  return {
    id: input.id,
    spaceId: input.spaceId,
    title: input.title,
    comment: input.comment ?? '',
    status: 'active',
    deletedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    sources: (input.sources ?? []).map((source) => ({
      ...source,
      knowledgePointId: input.id,
      sortOrder: source.sortOrder ?? 1,
      isAnchorValid: true,
      createdAt: timestamp,
      updatedAt: timestamp
    })),
    tagIds: input.tagIds ?? [],
    noteIds: [input.noteId]
  };
}
