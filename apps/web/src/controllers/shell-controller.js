import {
  renderStatusIndicators,
  renderStatusMeta
} from '../../lib/status/renderers.js';
import { renderModuleRail } from '../../lib/shell/rail-renderers.js';
import { getEffectiveViewState as selectEffectiveViewState } from '../../lib/shell/view-state.js';

export function createShellController(deps) {
  const {
    state,
    elements,
    railItems,
    getCurrentNote,
    getVisibleNotes,
    renderEditor,
    renderEditorContextMenu,
    renderEditorMenuBar,
    renderFolders,
    renderSearchShell,
    renderSidebar,
    renderTabs,
    reportRuntimeError
  } = deps;

function renderRail() {
  if (!elements.moduleRail) {
    return;
  }

  elements.moduleRail.innerHTML = renderModuleRail(railItems);
}

function renderAll() {
  const currentNote = getCurrentNote();
  safeRenderStep('search', renderSearchShell);
  safeRenderStep('workspace-view', renderWorkspaceViewState);
  safeRenderStep('navigation', renderFolders);
  safeRenderStep('tabs', renderTabs);
  safeRenderStep('editor-menu', renderEditorMenuBar);
  safeRenderStep('editor', () => renderEditor(currentNote));
  safeRenderStep('sidebar', () => renderSidebar(currentNote));
  safeRenderStep('editor-context-menu', renderEditorContextMenu);
  safeRenderStep('status', renderStatus);
}

function safeRenderStep(name, renderStep) {
  try {
    renderStep();
  } catch (error) {
    reportRuntimeError(name, error);
  }
}

function getEffectiveViewState() {
  return selectEffectiveViewState(state.view);
}

function renderWorkspaceViewState() {
  if (!elements.workspace) {
    return;
  }

  const effectiveView = getEffectiveViewState();
  elements.workspace.dataset.leftHidden = String(!effectiveView.showLeftSidebar);
  elements.workspace.dataset.rightHidden = String(!effectiveView.showRightSidebar);
  elements.workspace.dataset.viewMode = effectiveView.mode;

  if (elements.sidebar) {
    elements.sidebar.hidden = !effectiveView.showLeftSidebar;
  }

  if (elements.aside) {
    elements.aside.hidden = !effectiveView.showRightSidebar;
  }
}

function renderStatus() {
  const visibleNotes = getVisibleNotes();

  if (elements.statusIndicators) {
    elements.statusIndicators.innerHTML = renderStatusIndicators({
      statusMessage: state.statusMessage,
      visibleNoteCount: visibleNotes.length,
      folderCount: Object.keys(state.foldersById).length
    });
  }

  if (elements.statusMeta) {
    elements.statusMeta.innerHTML = renderStatusMeta({
      dataMode: state.dataMode,
      currentSpaceId: state.currentSpaceId
    });
  }
}

  return {
    renderRail,
    renderAll,
    safeRenderStep,
    getEffectiveViewState,
    renderWorkspaceViewState,
    renderStatus
  };
}
