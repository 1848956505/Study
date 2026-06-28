const ELEMENT_IDS = {
  globalSearchShell: 'global-search-shell',
  moduleRail: 'module-rail',
  workspace: 'kb-workspace',
  sidebar: 'kb-sidebar',
  folderTree: 'folder-tree',
  secondaryNavToggle: 'secondary-nav-toggle',
  contextMenu: 'library-context-menu',
  sectionMenu: 'library-section-menu',
  noteTabs: 'note-tabs',
  editorMenuBar: 'editor-menu-bar',
  noteTabMenu: 'note-tab-menu',
  editorContextMenu: 'editor-context-menu',
  markdownImportInput: 'markdown-import-input',
  editorContent: 'editor-content',
  aside: 'kb-aside',
  asideTabs: 'aside-tabs',
  asideContent: 'aside-content',
  statusIndicators: 'status-indicators',
  statusMeta: 'status-meta'
};

export function queryWorkspaceElements(documentRef = document) {
  return Object.fromEntries(
    Object.entries(ELEMENT_IDS).map(([key, id]) => [key, documentRef.getElementById(id)])
  );
}

export function assignWorkspaceElements(target, documentRef = document) {
  Object.assign(target, queryWorkspaceElements(documentRef));
  return target;
}
