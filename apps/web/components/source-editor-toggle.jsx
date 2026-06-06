export function SourceEditorToggle({ open, onToggle }) {
  return (
    <button type="button" className="ghost-button" onClick={onToggle}>
      {open ? '隐藏源码编辑器' : '显示源码编辑器'}
    </button>
  );
}
