export function createEditorShortcutCommandController(deps) {
  const {
    state,
    editorRuntime,
    getCurrentNote
  } = deps;

  function shouldHandleEditorShortcut(event) {
    if (!editorRuntime.currentEditorHost || !getCurrentNote() || state.view.showSourceEditor) {
      return false;
    }

    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!target?.closest) {
      return false;
    }

    if (target.closest('#editor-utility-panel') || target.closest('[data-source-editor-input]')) {
      return false;
    }

    return Boolean(target.closest('#editor-content'));
  }

  async function handleResolvedEditorShortcut(action) {
    if (!editorRuntime.currentEditorHost) {
      return;
    }

    await editorRuntime.currentEditorHost.run(action);
    await editorRuntime.currentEditorHost.focus();
  }

  return {
    shouldHandleEditorShortcut,
    handleResolvedEditorShortcut
  };
}
