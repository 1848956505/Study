export function renderStatusIndicators({ statusMessage, visibleNoteCount, folderCount }) {
  return `
      <span class="status-inline">${escapeHtml(statusMessage)}</span>
      <span class="status-inline">笔记 ${visibleNoteCount}</span>
      <span class="status-inline">目录 ${folderCount}</span>
    `;
}

export function renderStatusMeta({ dataMode, currentSpaceId }) {
  const modeLabel = dataMode === 'api'
    ? (currentSpaceId || '已连接后端')
    : '前端本地模式';

  return `
      <span class="status-inline">UTF-8</span>
      <span class="status-inline">${escapeHtml(modeLabel)}</span>
    `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
