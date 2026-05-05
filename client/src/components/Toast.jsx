import { useEffect } from 'react';
import DOMPurify from 'dompurify';
import './Toast.css';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast--${type}`}>
      <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message) }} />
      <button className="toast__close" onClick={onClose}>×</button>
    </div>
  );
}
