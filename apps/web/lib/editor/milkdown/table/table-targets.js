export function resolvePinnedMenuKindFromTarget(target, tableBlock) {
  if (!(target instanceof Element) || !(tableBlock instanceof HTMLElement)) {
    return null;
  }

  const handle = target.closest('.milkdown-table-block [data-role="row-drag-handle"], .milkdown-table-block [data-role="col-drag-handle"]');
  if (!(handle instanceof HTMLElement) || handle.closest('.milkdown-table-block') !== tableBlock) {
    return null;
  }

  return handle.dataset.role === 'row-drag-handle' ? 'row' : 'col';
}
