import {
  buildTagInput,
  findTagByName,
  normalizeTagName,
  removeTagFromCollections,
  upsertTag
} from '../../lib/tags/state.js';

export function createTagController(deps) {
  const {
    state,
    knowledgeApi,
    getCurrentNote,
    replaceNoteInState,
    persistBackendCache,
    renderAll,
    renderSidebar,
    flashStatus
  } = deps;

function replaceTagInState(updatedTag) {
  state.tags = upsertTag(state.tags, updatedTag);
  persistBackendCache();
}

function removeTagFromState(tagId) {
  const nextCollections = removeTagFromCollections(
    {
      tags: state.tags,
      allNotes: state.allNotes,
      selectedTagIds: state.search.selectedTagIds
    },
    tagId
  );

  state.tags = nextCollections.tags;
  state.allNotes = nextCollections.allNotes;
  state.search.selectedTagIds = nextCollections.selectedTagIds;
  persistBackendCache();
}

async function addTagToCurrentNote(tagId) {
  const currentNote = getCurrentNote();
  if (!currentNote || currentNote.deleted || !tagId) {
    return;
  }

  const nextTagIds = [...new Set([...(currentNote.tagIds ?? []), tagId])];

  try {
    if (state.dataMode === 'local') {
      replaceNoteInState({
        ...currentNote,
        tagIds: nextTagIds,
        updatedAt: new Date().toISOString()
      });
    } else {
      replaceNoteInState(await knowledgeApi.setNoteTags(currentNote.id, nextTagIds));
    }

    flashStatus('标签已添加到当前笔记');
  } catch (error) {
    flashStatus(error.message || '添加标签失败');
  }
}

async function removeTagFromCurrentNote(tagId) {
  const currentNote = getCurrentNote();
  if (!currentNote || currentNote.deleted || !tagId) {
    return;
  }

  try {
    let updatedNote;

    if (state.dataMode === 'local') {
      updatedNote = {
        ...currentNote,
        tagIds: (currentNote.tagIds ?? []).filter((currentTagId) => currentTagId !== tagId),
        updatedAt: new Date().toISOString()
      };
    } else {
      updatedNote = await knowledgeApi.removeTagFromNote(currentNote.id, tagId);
    }

    replaceNoteInState(updatedNote);
    await cleanupOrphanTag(tagId);
    flashStatus('标签已从当前笔记移除');
  } catch (error) {
    flashStatus(error.message || '移除标签失败');
  }
}

async function createTagAndAssignToCurrentNote(name) {
  const normalizedName = normalizeTagName(name);
  const currentNote = getCurrentNote();
  if (!currentNote || currentNote.deleted || !normalizedName) {
    return;
  }

  const existingTag = findTagByName(state.tags, normalizedName);
  if (existingTag) {
    state.noteTagComposer.draft = '';
    state.noteTagComposer.isExpanded = true;
    await addTagToCurrentNote(existingTag.id);
    renderSidebar(getCurrentNote());
    return;
  }

  try {
    const tagInput = buildTagInput({
      name: normalizedName,
      tags: state.tags,
      spaceId: state.currentSpaceId
    });

    let createdTag;
    if (state.dataMode === 'local') {
      createdTag = {
        ...tagInput,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      createdTag = await knowledgeApi.createTag(tagInput);
    }

    replaceTagInState(createdTag);
    state.noteTagComposer.draft = '';
    state.noteTagComposer.isExpanded = true;
    await addTagToCurrentNote(createdTag.id);
    renderSidebar(getCurrentNote());
    flashStatus('新标签已创建并绑定到当前笔记');
  } catch (error) {
    flashStatus(error.message || '创建标签失败');
  }
}

async function cleanupOrphanTag(tagId) {
  if (!tagId || state.allNotes.some((note) => (note.tagIds ?? []).includes(tagId))) {
    return;
  }

  try {
    if (state.dataMode === 'local') {
      removeTagFromState(tagId);
    } else {
      await knowledgeApi.deleteTag(tagId);
      removeTagFromState(tagId);
    }

    renderAll();
  } catch (error) {
    flashStatus(error.message || '清理孤立标签失败');
  }
}

  return {
    replaceTagInState,
    removeTagFromState,
    addTagToCurrentNote,
    removeTagFromCurrentNote,
    createTagAndAssignToCurrentNote,
    cleanupOrphanTag
  };
}
