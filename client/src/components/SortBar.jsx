import { useSearchParams } from 'react-router-dom';
import './SortBar.css';

const OPTIONS = ['new', 'popular'];

export default function SortBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get('sort') || 'new';

  function handleSort(value) {
    setSearchParams((prev) => {
      prev.set('sort', value);
      prev.set('page', '1');
      return prev;
    });
  }

  return (
    <div className="sort-bar">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          className={`sort-bar__btn${current === opt ? ' sort-bar__btn--active' : ''}`}
          onClick={() => handleSort(opt)}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}
