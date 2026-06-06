export class Tag {
  constructor({ id, spaceId, name, color = 'slate' }) {
    if (!id?.trim()) {
      throw new Error('Tag id is required');
    }
    if (!spaceId?.trim()) {
      throw new Error('Tag spaceId is required');
    }
    if (!name?.trim()) {
      throw new Error('Tag name is required');
    }

    this.id = id;
    this.spaceId = spaceId;
    this.name = name.trim();
    this.color = color;
  }
}
