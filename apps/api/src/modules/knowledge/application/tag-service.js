import { Tag } from '../domain/tag.js';
import { buildCreateTagDto, buildUpdateTagDto } from './dto/tag.dto.js';
import { createInMemoryTagRepository } from '../infrastructure/tag-repository.js';

export function createTagService({ repository = createInMemoryTagRepository() } = {}) {
  function requireTag(tagId) {
    const tag = repository.findById(tagId);

    if (!tag) {
      throw new Error('Tag not found');
    }

    return tag;
  }

  return {
    createTag(input) {
      const dto = buildCreateTagDto(input);
      const tag = new Tag(dto);
      repository.save(tag);
      return tag;
    },
    updateTag(tagId, updates) {
      const currentTag = requireTag(tagId);
      const dto = buildUpdateTagDto(updates);
      const updatedTag = new Tag({
        ...currentTag,
        ...dto,
        id: currentTag.id,
        spaceId: currentTag.spaceId
      });

      repository.save(updatedTag);
      return updatedTag;
    },
    deleteTag(tagId) {
      const tag = requireTag(tagId);
      repository.delete(tagId);
      return tag;
    },
    listTags(options = {}) {
      return repository.list(options);
    }
  };
}
