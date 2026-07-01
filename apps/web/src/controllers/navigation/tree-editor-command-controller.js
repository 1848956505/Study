import { validateTreeEditorName as validateNavigationTreeEditorName } from '../../../lib/navigation/tree-editor.js';

export function createNavigationTreeEditorCommandController(deps, getController) {
  const {
    state,
    elements,
    flashStatus
  } = deps;

function startTreeEditor({ mode, parentId = null, targetId = null, value = '' }) {
  state.treeEditor = {
    mode,
    parentId,
    targetId,
    value
  };
  getController().clearDeleteIntent({ rerender: false });
  getController().closeContextMenu();
  getController().renderFolders();
}

function cancelTreeEditor() {
  if (!state.treeEditor) {
    return;
  }
  state.treeEditor = null;
  getController().renderFolders();
}

async function submitTreeEditor() {
  if (!state.treeEditor) {
    return;
  }

  const trimmedValue = state.treeEditor.value.trim();
  if (!trimmedValue) {
    flashStatus('请输入名称');
    focusInlineEditor();
    return;
  }

  const editor = state.treeEditor;

  try {
    validateTreeEditorName(editor, trimmedValue);
    state.treeEditor = null;

    switch (editor.mode) {
      case 'create-folder':
        await getController().createFolder(editor.parentId, trimmedValue);
        flashStatus(`目录已创建：${trimmedValue}`);
        return;
      case 'rename-folder':
        await getController().renameFolder(editor.targetId, trimmedValue);
        flashStatus(`目录已重命名：${trimmedValue}`);
        return;
      case 'create-note':
        await getController().createNote(editor.parentId, trimmedValue);
        flashStatus(`文件已创建：${trimmedValue}`);
        return;
      case 'rename-note':
        await getController().renameNote(editor.targetId, trimmedValue);
        flashStatus(`文件已重命名：${trimmedValue}`);
        return;
      default:
        return;
    }
  } catch (error) {
    flashStatus(error.message || '操作失败');
    state.treeEditor = editor;
    getController().renderFolders();
  }
}

async function commitDelete(kind, targetId) {
  getController().clearDeleteIntent({ rerender: false });

  try {
    if (kind === 'folder') {
      await getController().deleteFolder(targetId);
      flashStatus('目录已删除');
    } else if (kind === 'note') {
      await getController().deleteNote(targetId);
      flashStatus('文件已删除');
    }
  } catch (error) {
    flashStatus(error.message || '删除失败');
  }
}

function validateTreeEditorName(editor, candidateName) {
  validateNavigationTreeEditorName({
    editor,
    candidateName,
    foldersById: state.foldersById,
    folderTree: state.folderTree,
    notes: state.allNotes
  });
}

function focusInlineEditor() {
  if (!state.treeEditor) {
    return;
  }

  window.requestAnimationFrame(() => {
    const input = elements.folderTree?.querySelector('[data-inline-editor-input]');
    if (!input) {
      return;
    }
    input.focus();
    input.select();
  });
}

  return {
    startTreeEditor,
    cancelTreeEditor,
    submitTreeEditor,
    commitDelete,
    validateTreeEditorName,
    focusInlineEditor
  };
}
