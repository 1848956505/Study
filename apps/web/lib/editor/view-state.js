export function resolveEditorRenderState({
  note,
  effectiveView,
  currentEditorNoteId,
  hasCurrentEditorHost
}) {
  if (!note) {
    return {
      kind: 'empty',
      sourceOpen: false,
      viewMode: effectiveView.mode,
      shouldTeardownHost: true,
      shouldCloseTableDialog: true
    };
  }

  if (note.deleted) {
    return {
      kind: 'recycle',
      sourceOpen: false,
      viewMode: 'recycle',
      shouldTeardownHost: true,
      shouldCloseTableDialog: true
    };
  }

  const shouldUseRichEditor = effectiveView.mode !== 'read' && !effectiveView.showSourceEditor;
  if (shouldUseRichEditor && hasCurrentEditorHost && currentEditorNoteId === note.id) {
    return {
      kind: 'reuse-rich-editor',
      sourceOpen: false,
      viewMode: effectiveView.mode,
      shouldTeardownHost: false,
      shouldCloseTableDialog: false
    };
  }

  if (!shouldUseRichEditor) {
    return {
      kind: effectiveView.showSourceEditor ? 'source-preview' : 'preview',
      sourceOpen: effectiveView.showSourceEditor,
      viewMode: effectiveView.mode,
      shouldTeardownHost: true,
      shouldCloseTableDialog: true
    };
  }

  return {
    kind: 'mount-rich-editor',
    sourceOpen: false,
    viewMode: effectiveView.mode,
    shouldTeardownHost: false,
    shouldCloseTableDialog: false
  };
}
