import { useSearchParams } from 'react-router-dom';
import './Pagination.css';

export default function Pagination({ totalPages }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = parseInt(searchParams.get('page') || '1', 10);

  function goTo(page) {
    setSearchParams((prev) => {
      prev.set('page', String(page));
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button disabled={current === 1} onClick={() => goTo(current - 1)}>← Prev</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          className={p === current ? 'pagination__btn--active' : ''}
          onClick={() => goTo(p)}
        >
          {p}
        </button>
      ))}
      <button disabled={current === totalPages} onClick={() => goTo(current + 1)}>Next →</button>
    </div>
  );
}
