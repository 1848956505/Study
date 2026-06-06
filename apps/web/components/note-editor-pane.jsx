import { SourceEditorToggle } from './source-editor-toggle.jsx';
import { NotePreview } from './note-preview.jsx';

const formatButtons = [
  { key: 'heading-1', label: 'H1' },
  { key: 'heading-2', label: 'H2' },
  { key: 'bold', label: 'Bold' },
  { key: 'italic', label: 'Italic' },
  { key: 'quote', label: 'Quote' },
  { key: 'bullet', label: 'List' },
  { key: 'code', label: 'Code' },
  { key: 'codeblock', label: 'Block' },
  { key: 'link', label: 'Link' }
];

export function NoteEditorPane({
  note,
  sourceOpen,
  draftMarkdown,
  onToggleSource,
  onMarkdownChange,
  onApplyFormat,
  onCommitSource,
  textareaRef
}) {
  return (
    <section className="editor-shell">
      <div className="editor-toolbar">
        <div>
          <h2>{note.title}</h2>
          <p className="panel-subtle">
            {note.status} · {note.sourceType} · {note.wordCount} words
          </p>
        </div>
        <SourceEditorToggle open={sourceOpen} onToggle={onToggleSource} />
      </div>

      <div className="editor-content" data-source-open={String(sourceOpen)}>
        {sourceOpen ? (
          <section className="editor-pane">
            <div className="pane-body">
              <div className="source-toolbar">
                {formatButtons.map((button) => (
                  <button key={button.key} type="button" className="chip-button" onClick={() => onApplyFormat(button.key)}>
                    {button.label}
                  </button>
                ))}
                <button type="button" className="solid-button" onClick={onCommitSource}>
                  应用修改
                </button>
              </div>
              <textarea
                ref={textareaRef}
                className="markdown-input"
                value={draftMarkdown}
                onChange={(event) => onMarkdownChange(event.target.value)}
                spellCheck="false"
                aria-label="Markdown 源码编辑器"
              />
            </div>
          </section>
        ) : null}

        <section className="preview-pane preview-frame">
          <div className="pane-body">
            <NotePreview markdown={sourceOpen ? draftMarkdown : note.rawMarkdown} />
          </div>
        </section>
      </div>
    </section>
  );
}
