import './PostContent.css';

// Renders post content as HTML for full markdown fidelity
export default function PostContent({ content = '' }) {
  const html = content
    .replace(/#{3}\s(.+)/g, '<h3>$1</h3>')
    .replace(/#{2}\s(.+)/g, '<h2>$1</h2>')
    .replace(/#{1}\s(.+)/g, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');

  return (
    <article
      className="post-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
