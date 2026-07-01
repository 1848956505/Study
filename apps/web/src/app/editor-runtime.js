export function createEditorRuntime() {
  return {
    autosaveTimer: null,
    currentEditorHost: null,
    currentEditorNoteId: null,
    pendingEditorNoteId: null,
    editorMountToken: 0
  };
}
