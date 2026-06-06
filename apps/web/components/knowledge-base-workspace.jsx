'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { applyMarkdownFormat } from '../lib/markdown.js';
import { getNoteById, knowledgeBaseSeed } from '../lib/mock-knowledge-base.js';
import { NoteEditorPane } from './note-editor-pane.jsx';

const defaultNoteId = knowledgeBaseSeed.notes[0].id;

function buildFolderChildren(folderId) {
  return knowledgeBaseSeed.folders.filter((folder) => folder.parentId === folderId);
}

function buildFolderNotes(folderId) {
  return knowledgeBaseSeed.notes.filter((note) => note.folderId === folderId);
}

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="library-chevron" data-open={String(open)}>
      <path d="M5 3.5 10 8l-5 4.5" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="library-symbol">
      <path d="M3 4.5h10" />
      <path d="M3 8h10" />
      <path d="M3 11.5h7" />
    </svg>
  );
}

function FolderIcon({ open }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="library-tree-icon">
      {open ? (
        <>
          <path d="M1.5 5.5h5l1.2 1.3H14v5.7a1 1 0 0 1-1 1H3a1.5 1.5 0 0 1-1.5-1.5z" />
          <path d="M1.5 5V4a1 1 0 0 1 1-1h3l1.1 1.2H13A1 1 0 0 1 14 5v1.3" />
        </>
      ) : (
        <>
          <path d="M2 4h3.4l1.1 1.2H13A1 1 0 0 1 14 6v5.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
          <path d="M2 6h12" />
        </>
      )}
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="library-tree-icon">
      <path d="M4 2.5h5l3 3v7.8a.7.7 0 0 1-.7.7H4.7a.7.7 0 0 1-.7-.7z" />
      <path d="M9 2.5v3h3" />
    </svg>
  );
}

function LibraryTreeNode({ folder, level, selectedNoteId, onSelectNote, openFolders, onToggleFolder }) {
  const childFolders = buildFolderChildren(folder.id);
  const childNotes = buildFolderNotes(folder.id);
  const isOpen = openFolders[folder.id] ?? true;

  return (
    <div className="library-node-group">
      <button
        type="button"
        className="library-node library-folder-node"
        data-level={level}
        data-open={String(isOpen)}
        onClick={() => onToggleFolder(folder.id)}
      >
        <span className="library-node-leading">
          <ChevronIcon open={isOpen} />
          <FolderIcon open={isOpen} />
        </span>
        <span className="library-node-label">{folder.name}</span>
      </button>

      {isOpen ? (
        <div className="library-node-children">
          {childFolders.map((childFolder) => (
            <LibraryTreeNode
              key={childFolder.id}
              folder={childFolder}
              level={level + 1}
              selectedNoteId={selectedNoteId}
              onSelectNote={onSelectNote}
              openFolders={openFolders}
              onToggleFolder={onToggleFolder}
            />
          ))}

          {childNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              className="library-node library-note-node"
              data-level={level + 1}
              data-selected={String(note.id === selectedNoteId)}
              onClick={() => onSelectNote(note.id)}
            >
              <span className="library-node-leading">
                <span className="library-node-spacer" />
                <NoteIcon />
              </span>
              <span className="library-node-label">{note.title}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function KnowledgeBaseWorkspace() {
  const [selectedNoteId, setSelectedNoteId] = useState(defaultNoteId);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [navSections, setNavSections] = useState({
    materials: true,
    tags: false,
    concepts: false,
    favorites: false,
    recent: false,
    recycle: false
  });
  const [openFolders, setOpenFolders] = useState(() =>
    Object.fromEntries(knowledgeBaseSeed.folders.map((folder) => [folder.id, true]))
  );
  const [draftMarkdown, setDraftMarkdown] = useState(getNoteById(defaultNoteId)?.rawMarkdown ?? '');
  const textareaRef = useRef(null);

  const selectedNote = useMemo(() => getNoteById(selectedNoteId) ?? knowledgeBaseSeed.notes[0], [selectedNoteId]);
  const linkedNotes = useMemo(
    () => (selectedNote.internalLinks ?? []).map((linkedId) => getNoteById(linkedId)).filter(Boolean),
    [selectedNote]
  );

  useEffect(() => {
    setDraftMarkdown(selectedNote.rawMarkdown);
  }, [selectedNoteId, selectedNote.rawMarkdown]);

  function handleSelectNote(noteId) {
    setSelectedNoteId(noteId);
    setSourceOpen(false);
    const note = getNoteById(noteId);
    setDraftMarkdown(note?.rawMarkdown ?? '');
  }

  function handleToggleSource() {
    setSourceOpen((current) => !current);
  }

  function handleToggleSection(sectionKey) {
    setNavSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey]
    }));
  }

  function handleToggleFolder(folderId) {
    setOpenFolders((current) => ({
      ...current,
      [folderId]: !(current[folderId] ?? true)
    }));
  }

  function handleMarkdownChange(nextValue) {
    setDraftMarkdown(nextValue);
  }

  function handleApplyFormat(format) {
    if (!sourceOpen) {
      setSourceOpen(true);
    }

    const textarea = textareaRef.current;
    const selectionStart = textarea?.selectionStart ?? draftMarkdown.length;
    const selectionEnd = textarea?.selectionEnd ?? draftMarkdown.length;
    const result = applyMarkdownFormat(draftMarkdown, selectionStart, selectionEnd, format);

    setDraftMarkdown(result.nextValue);

    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = result.nextSelectionStart;
        textarea.selectionEnd = result.nextSelectionEnd;
      }
    });
  }

  function handleCommitSource() {
    setSourceOpen(false);
  }

  const currentFolder = knowledgeBaseSeed.folders.find((folder) => folder.id === selectedNote.folderId);
  const tags = selectedNote.tagIds
    .map((tagId) => knowledgeBaseSeed.tags.find((tag) => tag.id === tagId))
    .filter(Boolean);
  const attachments = knowledgeBaseSeed.attachments.filter((attachment) => attachment.noteId === selectedNote.id);
  const topFolders = knowledgeBaseSeed.folders.filter((folder) => !folder.parentId);
  const tagItems = knowledgeBaseSeed.tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    count: knowledgeBaseSeed.notes.filter((note) => note.tagIds.includes(tag.id)).length
  }));
  const favoriteNotes = knowledgeBaseSeed.notes.filter((note) => note.favorite);
  const recentNotes = [...knowledgeBaseSeed.notes]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="kb-workspace">
      <aside className="kb-sidebar">
        <section className="section-card">
          <div className="library-header">
            <span className="library-header-leading">
              <LibraryIcon />
            </span>
            <span className="library-header-label">{'\u77e5\u8bc6\u5e93\u5bfc\u822a'}</span>
          </div>

          <div className="library-tree">
            <div className="library-node-group library-section-group">
              <button
                type="button"
                className="library-node library-section-node"
                data-level={0}
                data-open={String(navSections.materials)}
                onClick={() => handleToggleSection('materials')}
              >
                <span className="library-node-leading">
                  <ChevronIcon open={navSections.materials} />
                </span>
                <span className="library-node-label library-section-label">{'\u8d44\u6599'}</span>
                <span className="library-section-meta">{topFolders.length}</span>
              </button>
              {navSections.materials ? (
                <div className="library-node-children">
                  {topFolders.map((folder) => (
                    <LibraryTreeNode
                      key={folder.id}
                      folder={folder}
                      level={1}
                      selectedNoteId={selectedNoteId}
                      onSelectNote={handleSelectNote}
                      openFolders={openFolders}
                      onToggleFolder={handleToggleFolder}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="library-node-group library-section-group">
              <button
                type="button"
                className="library-node library-section-node"
                data-level={0}
                data-open={String(navSections.tags)}
                onClick={() => handleToggleSection('tags')}
              >
                <span className="library-node-leading">
                  <ChevronIcon open={navSections.tags} />
                </span>
                <span className="library-node-label library-section-label">{'\u6807\u7b7e'}</span>
                <span className="library-section-meta">{tagItems.length}</span>
              </button>
              {navSections.tags ? (
                <div className="library-node-children">
                  {tagItems.map((tag) => (
                    <div key={tag.id} className="library-node library-static-node" data-level={1}>
                      <span className="library-node-label">{tag.name}</span>
                      <span className="library-section-meta">{tag.count}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="library-node-group library-section-group">
              <button
                type="button"
                className="library-node library-section-node"
                data-level={0}
                data-open={String(navSections.concepts)}
                onClick={() => handleToggleSection('concepts')}
              >
                <span className="library-node-leading">
                  <ChevronIcon open={navSections.concepts} />
                </span>
                <span className="library-node-label library-section-label">{'\u77e5\u8bc6\u70b9'}</span>
                <span className="library-section-meta">0</span>
              </button>
              {navSections.concepts ? (
                <div className="library-node-children">
                  <div className="library-node library-static-node library-empty-node" data-level={1}>
                    <span className="library-node-label">0</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="library-node-group library-section-group">
              <button
                type="button"
                className="library-node library-section-node"
                data-level={0}
                data-open={String(navSections.favorites)}
                onClick={() => handleToggleSection('favorites')}
              >
                <span className="library-node-leading">
                  <ChevronIcon open={navSections.favorites} />
                </span>
                <span className="library-node-label library-section-label">{'\u6536\u85cf'}</span>
                <span className="library-section-meta">{favoriteNotes.length}</span>
              </button>
              {navSections.favorites ? (
                <div className="library-node-children">
                  {favoriteNotes.length ? (
                    favoriteNotes.map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        className="library-node library-note-node"
                        data-level={1}
                        data-selected={String(note.id === selectedNoteId)}
                        onClick={() => handleSelectNote(note.id)}
                      >
                        <span className="library-node-leading">
                          <span className="library-node-spacer" />
                          <NoteIcon />
                        </span>
                        <span className="library-node-label">{note.title}</span>
                      </button>
                    ))
                  ) : (
                    <div className="library-node library-static-node library-empty-node" data-level={1}>
                      <span className="library-node-label">0</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="library-node-group library-section-group">
              <button
                type="button"
                className="library-node library-section-node"
                data-level={0}
                data-open={String(navSections.recent)}
                onClick={() => handleToggleSection('recent')}
              >
                <span className="library-node-leading">
                  <ChevronIcon open={navSections.recent} />
                </span>
                <span className="library-node-label library-section-label">{'\u6700\u8fd1'}</span>
                <span className="library-section-meta">{recentNotes.length}</span>
              </button>
              {navSections.recent ? (
                <div className="library-node-children">
                  {recentNotes.length ? (
                    recentNotes.map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        className="library-node library-note-node"
                        data-level={1}
                        data-selected={String(note.id === selectedNoteId)}
                        onClick={() => handleSelectNote(note.id)}
                      >
                        <span className="library-node-leading">
                          <span className="library-node-spacer" />
                          <NoteIcon />
                        </span>
                        <span className="library-node-label">{note.title}</span>
                      </button>
                    ))
                  ) : (
                    <div className="library-node library-static-node library-empty-node" data-level={1}>
                      <span className="library-node-label">0</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="library-node-group library-section-group">
              <button
                type="button"
                className="library-node library-section-node"
                data-level={0}
                data-open={String(navSections.recycle)}
                onClick={() => handleToggleSection('recycle')}
              >
                <span className="library-node-leading">
                  <ChevronIcon open={navSections.recycle} />
                </span>
                <span className="library-node-label library-section-label">{'\u56de\u6536\u7ad9'}</span>
                <span className="library-section-meta">0</span>
              </button>
              {navSections.recycle ? (
                <div className="library-node-children">
                  <div className="library-node library-static-node library-empty-node" data-level={1}>
                    <span className="library-node-label">0</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </aside>

      <section className="kb-editor">
        <NoteEditorPane
          note={{ ...selectedNote, rawMarkdown: draftMarkdown }}
          sourceOpen={sourceOpen}
          draftMarkdown={draftMarkdown}
          onToggleSource={handleToggleSource}
          onMarkdownChange={handleMarkdownChange}
          onApplyFormat={handleApplyFormat}
          onCommitSource={handleCommitSource}
          textareaRef={textareaRef}
        />
      </section>

      <aside className="kb-aside">
        <section className="section-card">
          <div className="info-grid">
            <div className="info-row">
              <span>{'\u6807\u9898'}</span>
              <strong>{selectedNote.title}</strong>
            </div>
            <div className="info-row">
              <span>{'\u76ee\u5f55'}</span>
              <strong>{currentFolder?.name ?? 'Root'}</strong>
            </div>
            <div className="info-row">
              <span>{'\u66f4\u65b0\u65f6\u95f4'}</span>
              <strong>{new Date(selectedNote.updatedAt).toLocaleString('zh-CN')}</strong>
            </div>
            <div className="info-row">
              <span>{'\u6536\u85cf'}</span>
              <strong>{selectedNote.favorite ? 'Yes' : 'No'}</strong>
            </div>
          </div>
        </section>

        <section className="section-card">
          <div className="pill-row" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {tags.map((tag) => (
              <span key={tag.id} className="pill" data-accent="true">
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: tag.color
                  }}
                />
                {tag.name}
              </span>
            ))}
          </div>
        </section>

        <section className="section-card">
          <div className="linked-list" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {linkedNotes.map((note) => (
              <div key={note.id} className="linked-row">
                <div className="linked-meta">
                  <strong>{note.title}</strong>
                  <span>{note.summary}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card">
          <div className="resource-list" style={{ flex: 1, minHeight: 0 }}>
            {attachments.map((attachment) => (
              <div key={attachment.id} className="resource-row">
                <div className="resource-meta">
                  <strong>{attachment.fileName}</strong>
                  <span>{attachment.mimeType}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
