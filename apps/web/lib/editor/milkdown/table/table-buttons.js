export function renderTableButton(renderType) {
  switch (renderType) {
    case 'add_row':
    case 'add_col':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10"></path><path d="M3 8h10"></path></svg>';
    case 'add_row_before':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.8v4.6"></path><path d="M5.7 5.1h4.6"></path><path d="M3 10.8h10"></path><path d="M3 13h10"></path></svg>';
    case 'add_row_after':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 8.6v4.6"></path><path d="M5.7 10.9h4.6"></path><path d="M3 3h10"></path><path d="M3 5.2h10"></path></svg>';
    case 'add_col_before':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.8 8h4.6"></path><path d="M5.1 5.7v4.6"></path><path d="M10.8 3v10"></path><path d="M13 3v10"></path></svg>';
    case 'add_col_after':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8.6 8h4.6"></path><path d="M10.9 5.7v4.6"></path><path d="M3 3v10"></path><path d="M5.2 3v10"></path></svg>';
    case 'delete_row':
    case 'delete_col':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.2 5.5h5.6"></path><path d="M6 5.5V4.6h4v.9"></path><path d="M6.3 6.5l.3 4.5h2.8l.3-4.5"></path></svg>';
    case 'align_col_left':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4h10"></path><path d="M3 8h7"></path><path d="M3 12h9"></path></svg>';
    case 'align_col_center':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4h10"></path><path d="M4.5 8h7"></path><path d="M3.5 12h9"></path></svg>';
    case 'align_col_right':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4h10"></path><path d="M6 8h7"></path><path d="M4 12h9"></path></svg>';
    case 'col_drag_handle':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4.5h11"></path><path d="M2.5 8h11"></path><path d="M2.5 11.5h11"></path></svg>';
    case 'row_drag_handle':
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.5v11"></path><path d="M8 2.5v11"></path><path d="M11.5 2.5v11"></path></svg>';
    default:
      return '';
  }
}

function createTableHandleActionButton({ action, icon, label, onActivate }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.tablePinnedAction = action;
  if (action === 'table-delete-row' || action === 'table-delete-col') {
    button.dataset.tablePinnedDanger = 'true';
  }
  button.innerHTML = renderTableButton(icon);
  button.setAttribute('title', label);
  button.setAttribute('aria-label', label);
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (button.disabled || button.getAttribute('aria-disabled') === 'true') {
      return;
    }
    void onActivate?.();
  });
  return button;
}

function ensureTablePinnedButtons(group, descriptors, onActivate) {
  if (!(group instanceof HTMLElement)) {
    return;
  }

  descriptors
    .slice()
    .reverse()
    .forEach((descriptor) => {
      const selector = `[data-table-pinned-action="${descriptor.action}"]`;
      if (group.querySelector(selector)) {
        return;
      }

      const button = createTableHandleActionButton({
        ...descriptor,
        onActivate: () => onActivate?.(descriptor)
      });
      group.prepend(button);
    });
}

export function syncTableHandleLabels(root, host = null) {
  if (!(root instanceof HTMLElement)) {
    return;
  }

  const setButtonLabel = (button, label) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    button.setAttribute('title', label);
    button.setAttribute('aria-label', label);
  };

  const hideBuiltinDeleteButton = (button) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    button.dataset.tableBuiltinDelete = 'true';
    button.tabIndex = -1;
    button.setAttribute('aria-hidden', 'true');
    button.style.display = 'none';
  };

  root.querySelectorAll('.milkdown-table-block').forEach((tableBlockRoot) => {
    const colHandle = tableBlockRoot.querySelector('[data-role="col-drag-handle"]');
    if (colHandle instanceof HTMLElement) {
      colHandle.setAttribute('title', '选中整列');
      colHandle.setAttribute('aria-label', '选中整列');
      const buttonGroup = colHandle.querySelector('.button-group');
      ensureTablePinnedButtons(
        buttonGroup,
        [
          { action: 'table-add-col-before', icon: 'add_col_before', label: '左侧插列', kind: 'col' },
          { action: 'table-add-col-after', icon: 'add_col_after', label: '右侧插列', kind: 'col' },
          { action: 'table-delete-col', icon: 'delete_col', label: '删除列', kind: 'col' }
        ],
        ({ action, kind }) => host?.tableHandleController?.runPinnedAction(kind, action)
      );
      const builtinButtons = Array.from(colHandle.querySelectorAll('.button-group button:not([data-table-pinned-action])'));
      setButtonLabel(builtinButtons[0], '左对齐');
      setButtonLabel(builtinButtons[1], '居中对齐');
      setButtonLabel(builtinButtons[2], '右对齐');
      setButtonLabel(builtinButtons[3], '删除列');
      hideBuiltinDeleteButton(builtinButtons[3]);
    }

    const rowHandle = tableBlockRoot.querySelector('[data-role="row-drag-handle"]');
    if (rowHandle instanceof HTMLElement) {
      rowHandle.setAttribute('title', '选中整行');
      rowHandle.setAttribute('aria-label', '选中整行');
      const buttonGroup = rowHandle.querySelector('.button-group');
      ensureTablePinnedButtons(
        buttonGroup,
        [
          { action: 'table-add-row-before', icon: 'add_row_before', label: '上方插行', kind: 'row' },
          { action: 'table-add-row-after', icon: 'add_row_after', label: '下方插行', kind: 'row' },
          { action: 'table-delete-row', icon: 'delete_row', label: '删除行', kind: 'row' }
        ],
        ({ action, kind }) => host?.tableHandleController?.runPinnedAction(kind, action)
      );
      const deleteButton = rowHandle.querySelector('.button-group button:not([data-table-pinned-action])');
      setButtonLabel(deleteButton, '删除行');
      hideBuiltinDeleteButton(deleteButton);
    }

    const xLineHandle = tableBlockRoot.querySelector('[data-role="x-line-drag-handle"]');
    if (xLineHandle instanceof HTMLElement) {
      xLineHandle.dataset.show = 'false';
    }

    const yLineHandle = tableBlockRoot.querySelector('[data-role="y-line-drag-handle"]');
    if (yLineHandle instanceof HTMLElement) {
      yLineHandle.dataset.show = 'false';
    }
  });
}

export function waitForNextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

export function setPinnedActionDisabled(button, disabled) {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.disabled = disabled;
  button.setAttribute('aria-disabled', disabled ? 'true' : 'false');
}

