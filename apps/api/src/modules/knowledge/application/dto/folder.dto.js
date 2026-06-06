function trimIfString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function createSlug(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function createFolderId({ id, name }) {
  if (trimIfString(id)) {
    return trimIfString(id);
  }

  const seed = createSlug(name || 'folder');
  return `folder-${seed || 'item'}-${Date.now()}`;
}

export function buildCreateFolderDto(input) {
  const name = trimIfString(input.name);

  return {
    id: createFolderId({
      id: input.id,
      name
    }),
    spaceId: input.spaceId,
    parentId: input.parentId ?? null,
    name,
    pathCache: input.pathCache ?? '/'
  };
}

export function buildUpdateFolderDto(input) {
  const dto = {};

  if (input.name !== undefined) {
    dto.name = trimIfString(input.name);
  }
  if (input.parentId !== undefined) {
    dto.parentId = input.parentId;
  }
  if (input.pathCache !== undefined) {
    dto.pathCache = input.pathCache;
  }

  return dto;
}
