export const ASIDE_TABS = [
  { key: 'info', label: '信息' },
  { key: 'outline', label: '大纲' },
  { key: 'concepts', label: '知识点' },
  { key: 'ai', label: 'AI' }
];

export function resolveAsideContentKey({ note, activeTab }) {
  if (!note) {
    return 'empty';
  }

  if (ASIDE_TABS.some((tab) => tab.key === activeTab)) {
    return activeTab;
  }

  return 'info';
}
