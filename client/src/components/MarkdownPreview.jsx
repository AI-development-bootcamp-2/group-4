import DOMPurify from 'dompurify';
import './MarkdownPreview.css';

function toHtml(md = '') {
  return md
    .replace(/#{3}\s(.+)/g, '<h3>$1</h3>')
    .replace(/#{2}\s(.+)/g, '<h2>$1</h2>')
    .replace(/#{1}\s(.+)/g, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

export default function MarkdownPreview({ content }) {
  return (
    <div className="md-preview">
      <p className="md-preview__label">Preview</p>
      <div
        className="md-preview__body"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(toHtml(content)) }}
      />
    </div>
  );
}
