import React, { useEffect, useState } from 'react';

// Minimal Markdown renderer: very small subset (headings, paragraphs, lists)
function simpleMarkdownToHtml(md) {
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '<br/>');
  // wrap orphan <li> with <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  return html;
}

/**
 * PUBLIC_INTERFACE
 * DocumentViewer
 * Accessible scrollable viewer to display markdown or text content.
 */
export default function DocumentViewer({ title, src, ariaLabel }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    let active = true;
    fetch(src)
      .then((r) => r.text())
      .then((t) => {
        if (active) setContent(t);
      })
      .catch(() => setContent('# Error loading document'));
    return () => {
      active = false;
    };
  }, [src]);

  const html = simpleMarkdownToHtml(content);

  return (
    <section
      aria-label={ariaLabel || title}
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
        maxHeight: 320,
        overflow: 'auto',
      }}
    >
      <h2 style={{ marginTop: 0, color: '#111827' }}>{title}</h2>
      <div
        className="doc-content"
        style={{ color: '#111827', lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
