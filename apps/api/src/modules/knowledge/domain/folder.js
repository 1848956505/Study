export class Folder {
  constructor({ id, spaceId, name, parentId = null, pathCache = '/' }) {
    if (!id?.trim()) {
      throw new Error('Folder id is required');
    }
    if (!spaceId?.trim()) {
      throw new Error('Folder spaceId is required');
    }
    if (!name?.trim()) {
      throw new Error('Folder name is required');
    }

    this.id = id;
    this.spaceId = spaceId;
    this.name = name.trim();
    this.parentId = parentId;
    this.pathCache = pathCache;
  }
}
