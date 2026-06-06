function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

export function TopBar() {
  return (
    <header className="top-bar">
      <label className="top-bar-search" aria-label="全局搜索">
        <span className="top-bar-search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6" />
            <path d="M16 16l4 4" />
          </svg>
        </span>
        <input placeholder="搜索笔记、标签、附件、AI 结果" />
      </label>

      <button type="button" className="top-bar-user" aria-label="用户入口">
        <UserIcon />
      </button>
    </header>
  );
}
