// search-events.js
// 搜索 / 二级导航折叠 / Markdown 导入事件绑定。
// 由 client.js 的 bindEvents() 在初始化时一次性注册。
// 选择器、事件名、闭包引用与原实现保持一致。

export function bindSearchEvents({ state, elements, deps }) {
  const {
    toggleSearchTagFilter,
    focusSearchInput,
    renderSearchShell,
    clearSearchFilters,
    getSearchResultNotes,
    selectNote,
    closeContextMenu,
    renderFolders,
    reconcileSelection,
    renderAll,
    importMarkdownFiles,
    flashStatus
  } = deps;

  elements.globalSearchShell?.addEventListener('click', (event) => {
    event.stopPropagation();
    const chipRemoveButton = event.target.closest('[data-search-chip-remove]');
    if (chipRemoveButton?.dataset.searchChipRemove) {
        toggleSearchTagFilter(chipRemoveButton.dataset.searchChipRemove);
        focusSearchInput();
        return;
    }

    const tagButton = event.target.closest('[data-search-tag-id]');
    if (tagButton?.dataset.searchTagId) {
        toggleSearchTagFilter(tagButton.dataset.searchTagId);
        focusSearchInput();
        return;
    }

    const noteButton = event.target.closest('[data-search-note-id]');
    if (noteButton?.dataset.searchNoteId) {
        state.search.isOpen = false;
        void selectNote(noteButton.dataset.searchNoteId, { syncFolder: true });
        return;
    }

    const clearButton = event.target.closest('[data-search-clear]');
    if (clearButton) {
        clearSearchFilters();
        return;
    }

    if (!state.search.isOpen) {
      state.search.isOpen = true;
      renderSearchShell();
    }

    focusSearchInput();
  });

  elements.globalSearchShell?.addEventListener('input', (event) => {
    const input = event.target.closest('[data-search-input]');
    if (!input) {
      return;
    }

    state.search.keyword = input.value.trim().toLowerCase();
    state.search.isOpen = true;
    reconcileSelection();
    renderAll();
  });

  elements.globalSearchShell?.addEventListener('keydown', (event) => {
    const input = event.target.closest('[data-search-input]');
    if (!input) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      state.search.isOpen = false;
      renderSearchShell();
      return;
    }

    if (event.key !== 'Enter') {
      return;
    }

    const results = getSearchResultNotes();
    if (!results.length) {
      return;
    }

    event.preventDefault();
    state.search.isOpen = false;
    void selectNote(results[0].id, { syncFolder: true });
  });

  elements.secondaryNavToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    state.sectionMenuOpen = !state.sectionMenuOpen;
    closeContextMenu();
    renderFolders();
  });

  elements.markdownImportInput?.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!files.length) {
      return;
    }

    try {
      await importMarkdownFiles(files);
    } catch (error) {
      flashStatus(error?.message || 'Markdown 导入失败');
    }
  });
}
