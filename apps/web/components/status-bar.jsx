const statusItems = [
  { label: '本地预览' },
  { label: 'JSON' }
];

const metaItems = ['UTF-8', '本地优先'];

export function StatusBar() {
  return (
    <footer className="status-bar">
      <div className="status-group">
        {statusItems.map((item) => (
          <span key={item.label} className="status-inline">
            {item.label}
          </span>
        ))}
      </div>

      <div className="status-group status-group-end">
        {metaItems.map((item) => (
          <span key={item} className="status-inline">
            {item}
          </span>
        ))}
      </div>
    </footer>
  );
}
