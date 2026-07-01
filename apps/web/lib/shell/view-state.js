export function getEffectiveViewState(view) {
  return {
    mode: view.mode,
    showLeftSidebar: view.mode === 'focus' ? false : view.showLeftSidebar,
    showRightSidebar: view.mode === 'focus' ? false : view.showRightSidebar,
    showSourceEditor: view.showSourceEditor
  };
}
