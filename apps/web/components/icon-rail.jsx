const items = [
  { key: 'knowledge', label: '知识库', active: true },
  { key: 'paper', label: '试卷', active: false },
  { key: 'ai', label: 'AI 工作台', active: false },
  { key: 'task', label: '任务', active: false },
  { key: 'review', label: '复盘', active: false },
  { key: 'settings', label: '设置', active: false }
];

function RailIcon({ icon }) {
  switch (icon) {
    case 'knowledge':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 5.5h6a3 3 0 0 1 3 3v10h-6a3 3 0 0 0-3 3z" />
          <path d="M19.5 5.5h-6a3 3 0 0 0-3 3v10h6a3 3 0 0 1 3 3z" />
        </svg>
      );
    case 'paper':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4.5h7l4 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" />
          <path d="M14 4.5v4h4" />
          <path d="M8.5 12h7" />
          <path d="M8.5 15.5h7" />
        </svg>
      );
    case 'ai':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.5l1.8 4.2L18 9.5l-4.2 1.8L12 15.5l-1.8-4.2L6 9.5l4.2-1.8z" />
          <path d="M18.5 14.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" />
          <path d="M6 15.5l1 2.2 2.2 1-2.2 1-1 2.3-1-2.3-2.2-1 2.2-1z" />
        </svg>
      );
    case 'task':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6.5h10" />
          <path d="M9 12h10" />
          <path d="M9 17.5h10" />
          <path d="M5.5 6.5h.01" />
          <path d="M5.5 12h.01" />
          <path d="M5.5 17.5h.01" />
        </svg>
      );
    case 'review':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5.5v13" />
          <path d="M5.5 12h13" />
          <path d="M7.5 7.5l9 9" />
          <path d="M16.5 7.5l-9 9" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
          <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.3 7.3 0 0 0-1.7-1l-.4-2.6H9.6l-.4 2.6a7.3 7.3 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7.3 7.3 0 0 0 1.7 1l.4 2.6h4.8l.4-2.6a7.3 7.3 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.07-.33.1-.67.1-1z" />
        </svg>
      );
    default:
      return null;
  }
}

export function IconRail() {
  return (
    <aside className="icon-rail" aria-label="Module navigation">
      <div className="rail-brand">SA</div>
      <nav className="rail-actions">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className="rail-item"
            data-active={String(item.active)}
            aria-label={item.label}
            title={item.label}
          >
            <span className="rail-item-icon" aria-hidden="true">
              <RailIcon icon={item.key} />
            </span>
            <span className="rail-item-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
