import { extractMarkdownHeadings, renderMarkdownPreview } from '../lib/markdown.js';

export function NotePreview({ markdown }) {
  const headings = extractMarkdownHeadings(markdown);
  const previewHtml = renderMarkdownPreview(markdown);

  return (
    <>
      <div className="toc-list" aria-label="目录">
        {headings.length
          ? headings.map((heading) => (
              <a key={heading.id} className="toc-item" data-level={heading.level} href={`#${heading.id}`}>
                {heading.title}
              </a>
            ))
          : null}
      </div>
      <article className="preview-rendered" dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </>
  );
}
