import { useState, useRef } from 'react';
import DOMPurify from 'dompurify';

export default function RichContentEditor({
  label = 'Content',
  name = 'content',
  value = '',
  onChange,
  placeholder = 'Write long-form technical article or case study content...',
  minHeight = '360px'
}) {
  const [content, setContent] = useState(value || '');
  const [previewMode, setPreviewMode] = useState(false);
  const textareaRef = useRef(null);

  const handleContentChange = (val) => {
    setContent(val);
    if (onChange) onChange(val);
  };

  const wrapSelection = (prefix, suffix, defaultText = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end) || defaultText;

    const replacement = `${prefix}${selected}${suffix}`;
    const nextVal = currentText.substring(0, start) + replacement + currentText.substring(end);

    handleContentChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const insertBlock = (snippet) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const nextVal = currentText.substring(0, start) + '\n' + snippet + '\n' + currentText.substring(end);
    handleContentChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length + 2, start + snippet.length + 2);
    }, 0);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter hyperlink URL (e.g. https://example.com):');
    if (!url) return;

    // Security: Block javascript: URLs
    const sanitizedUrl = url.trim();
    if (sanitizedUrl.toLowerCase().startsWith('javascript:') || sanitizedUrl.toLowerCase().startsWith('data:')) {
      alert('Security Alert: Insecure link protocol is not permitted.');
      return;
    }

    const textarea = textareaRef.current;
    const selectedText = textarea ? textarea.value.substring(textarea.selectionStart, textarea.selectionEnd) : '';
    const linkText = selectedText || prompt('Enter link text:', 'Learn more') || 'Learn more';

    const anchorTag = `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    insertBlock(anchorTag);
  };

  const handleInsertTable = () => {
    const tableTemplate = `<table>
  <thead>
    <tr>
      <th>Comparison Criteria</th>
      <th>Approach A</th>
      <th>Approach B</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Execution Speed</td>
      <td>Fast</td>
      <td>Moderate</td>
    </tr>
    <tr>
      <td>Maintenance Cost</td>
      <td>Low</td>
      <td>Medium</td>
    </tr>
  </tbody>
</table>`;
    insertBlock(tableTemplate);
  };

  const handleInsertImage = () => {
    const imgUrl = prompt('Enter Image URL:');
    if (!imgUrl) return;
    const caption = prompt('Enter Image Caption (optional):', '') || '';

    const figureSnippet = `<figure style="margin: 2rem 0; text-align: center;">
  <img src="${imgUrl}" alt="${caption}" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" />
  ${caption ? `<figcaption style="font-size: 0.85rem; color: #64748b; margin-top: 0.5rem; font-style: italic;">${caption}</figcaption>` : ''}
</figure>`;
    insertBlock(figureSnippet);
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="modern-form-group full-width" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ fontWeight: 600, color: 'var(--text-color, #1e293b)', fontSize: '0.92rem' }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          <span>📝 {words} words • {chars} chars</span>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            style={{
              background: previewMode ? '#2563eb' : '#f1f5f9',
              color: previewMode ? '#fff' : '#1e293b',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.25rem 0.75rem',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <i className={previewMode ? 'fa-solid fa-code' : 'fa-solid fa-eye'}></i>
            {previewMode ? 'Edit HTML' : 'Live Preview'}
          </button>
        </div>
      </div>

      <input type="hidden" name={name} value={content} />

      {/* 🛠️ Editor Toolbar */}
      {!previewMode && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          background: '#f8fafc',
          padding: '6px 8px',
          border: '1px solid #cbd5e1',
          borderBottom: 'none',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px'
        }}>
          <button type="button" title="Heading 2" className="editor-btn" onClick={() => wrapSelection('<h2>', '</h2>', 'Section Heading')}><strong>H2</strong></button>
          <button type="button" title="Heading 3" className="editor-btn" onClick={() => wrapSelection('<h3>', '</h3>', 'Subheading')}><strong>H3</strong></button>
          <span className="editor-divider" />
          <button type="button" title="Bold" className="editor-btn" onClick={() => wrapSelection('<strong>', '</strong>', 'bold text')}><i className="fa-solid fa-bold"></i></button>
          <button type="button" title="Italic" className="editor-btn" onClick={() => wrapSelection('<em>', '</em>', 'italic text')}><i className="fa-solid fa-italic"></i></button>
          <button type="button" title="Strikethrough" className="editor-btn" onClick={() => wrapSelection('<del>', '</del>', 'struck text')}><i className="fa-solid fa-strikethrough"></i></button>
          <span className="editor-divider" />
          <button type="button" title="Bullet List" className="editor-btn" onClick={() => insertBlock('<ul>\n  <li>Point 1</li>\n  <li>Point 2</li>\n  <li>Point 3</li>\n</ul>')}><i className="fa-solid fa-list-ul"></i></button>
          <button type="button" title="Numbered List" className="editor-btn" onClick={() => insertBlock('<ol>\n  <li>Step 1</li>\n  <li>Step 2</li>\n  <li>Step 3</li>\n</ol>')}><i className="fa-solid fa-list-ol"></i></button>
          <button type="button" title="Blockquote" className="editor-btn" onClick={() => wrapSelection('<blockquote>\n  ', '\n</blockquote>', 'Key architectural insight or quote.')}><i className="fa-solid fa-quote-left"></i></button>
          <button type="button" title="Code Block" className="editor-btn" onClick={() => wrapSelection('<pre><code>\n', '\n</code></pre>', '// Code snippet here')}><i className="fa-solid fa-code"></i></button>
          <span className="editor-divider" />
          <button type="button" title="Insert Table" className="editor-btn" onClick={handleInsertTable}><i className="fa-solid fa-table"></i> Table</button>
          <button type="button" title="Insert Link" className="editor-btn" onClick={handleInsertLink}><i className="fa-solid fa-link"></i> Link</button>
          <button type="button" title="Insert Image" className="editor-btn" onClick={handleInsertImage}><i className="fa-solid fa-image"></i> Image</button>
          <button type="button" title="Horizontal Divider" className="editor-btn" onClick={() => insertBlock('<hr />')}><i className="fa-solid fa-minus"></i></button>
        </div>
      )}

      {/* 📄 Content Area or Live Preview */}
      {previewMode ? (
        <div 
          style={{
            minHeight,
            maxHeight: '500px',
            overflowY: 'auto',
            padding: '1.5rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            fontSize: '1rem',
            lineHeight: 1.7,
            color: '#334155'
          }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content || '<p style="color: #94a3b8; font-style: italic;">No content to preview yet.</p>') }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            minHeight,
            maxHeight: '520px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '0.92rem',
            lineHeight: 1.6,
            padding: '1rem',
            border: '1px solid #cbd5e1',
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
            outline: 'none',
            background: '#ffffff',
            color: '#0f172a',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      )}

      <style>{`
        .editor-btn {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.8rem;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .editor-btn:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #2563eb;
        }
        .editor-divider {
          width: 1px;
          height: 20px;
          background: #cbd5e1;
          margin: 0 4px;
          align-self: center;
        }
      `}</style>
    </div>
  );
}
