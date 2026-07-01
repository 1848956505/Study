export function createEditorMenuStateController(deps, getController) {
  const { state } = deps;

  function closeEditorMenuBar() {
    if (!state.editorMenuOpen) {
      return;
    }

    state.editorMenuOpen = null;
    getController().renderEditorMenuBar();
  }

  return {
    closeEditorMenuBar
  };
}
