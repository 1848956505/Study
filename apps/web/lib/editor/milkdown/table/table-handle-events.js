export function handleTableRootClick(controller, event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) {
    return;
  }

  if (target.closest('.milkdown-table-block .button-group button')) {
    return;
  }

  if (target.closest('.milkdown-table-block [data-role="row-drag-handle"], .milkdown-table-block [data-role="col-drag-handle"]')) {
    return;
  }

  const cell = target.closest('.milkdown-table-block table.children td, .milkdown-table-block table.children th');
  if (cell instanceof HTMLElement) {
    controller.pinCell(cell);
    return;
  }

  if (!target.closest('.milkdown-table-block')) {
    controller.clearPinnedTable();
  }
}

export function handleTableDocumentPointerDown(controller, event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) {
    return;
  }

  if (target.closest('.milkdown-table-block .button-group button')) {
    return;
  }

  const rowHandle = target.closest('.milkdown-table-block [data-role="row-drag-handle"]');
  if (rowHandle instanceof HTMLElement && rowHandle.closest('.milkdown-table-block')?.dataset.pinned === 'true') {
    event.preventDefault();
    event.stopPropagation();
    void controller.togglePinnedMenu('row');
    return;
  }

  const colHandle = target.closest('.milkdown-table-block [data-role="col-drag-handle"]');
  if (colHandle instanceof HTMLElement && colHandle.closest('.milkdown-table-block')?.dataset.pinned === 'true') {
    event.preventDefault();
    event.stopPropagation();
    void controller.togglePinnedMenu('col');
    return;
  }

  if (!controller.root.contains(target)) {
    controller.clearPinnedTable();
    return;
  }

  if (!target.closest('.milkdown-table-block')) {
    controller.clearPinnedTable();
  }
}

export function handleTableRootPointerOver(controller, event) {
  const kind = controller.getPinnedMenuKindFromTarget(event.target);
  if (kind === controller.hoverMenuKind) {
    return;
  }

  controller.hoverMenuKind = kind;
  controller.applyPinnedMenuState();
}

export function handleTableRootPointerOut(controller, event) {
  const currentKind = controller.getPinnedMenuKindFromTarget(event.target);
  if (!currentKind) {
    return;
  }

  const nextKind = controller.getPinnedMenuKindFromTarget(event.relatedTarget);
  if (nextKind === currentKind) {
    return;
  }

  controller.hoverMenuKind = nextKind;
  controller.applyPinnedMenuState();
}
