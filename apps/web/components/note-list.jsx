export function NoteList({ notes, selectedNoteId, onSelectNote }) {
  return (
    <div className="resource-list" style={{ flex: 1, minHeight: 0 }} role="list" aria-label="笔记列表">
      {notes.map((note) => (
        <div
          key={note.id}
          className="note-row"
          data-selected={String(note.id === selectedNoteId)}
          role="listitem"
        >
          <button type="button" onClick={() => onSelectNote(note.id)}>
            <div className="note-meta">
              <strong>{note.title}</strong>
              <span>{note.summary}</span>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}
