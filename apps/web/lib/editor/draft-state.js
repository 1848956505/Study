export function resolveDraftSaveState({ note, markdown, deriveTitle }) {
  if (!note) {
    return {
      changed: false,
      nextMarkdown: '',
      nextTitle: ''
    };
  }

  const nextMarkdown = markdown ?? '';
  const nextTitle = deriveTitle(nextMarkdown, note.title);

  return {
    changed: note.rawMarkdown !== nextMarkdown || note.title !== nextTitle,
    nextMarkdown,
    nextTitle
  };
}

export function createLocalDraftNote({ note, markdown, title, timestamp = new Date().toISOString() }) {
  return {
    ...note,
    title,
    rawMarkdown: markdown,
    updatedAt: timestamp
  };
}
