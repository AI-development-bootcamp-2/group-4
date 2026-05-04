import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/FilterPanel';
import SortSelect from '../components/SortSelect';
import PostList from '../components/PostList';
import Spinner from '../components/Spinner';
import api from '../services/api';
import './SearchPage.css';

const TABS = ['posts', 'comments', 'users'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const [tab, setTab] = useState('posts');
  const [sort, setSort] = useState('relevance');
  const [filters, setFilters] = useState({ author: '', category: '', from: '', to: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    // Pass all filter params directly to API for flexibility
    api.get('/search', { params: { q, type: tab, sort, ...filters } })
      .then(({ data }) => setResults(data.results || []))
      .finally(() => setLoading(false));
  }, [q, tab, sort, filters]);

  return (
    <>
      <Navbar />
      <main className="search-page">
        <div className="search-page__header">
          <h1
            className="search-page__title"
            dangerouslySetInnerHTML={{ __html: `Results for: <em>${q}</em>` }}
          />
          <SortSelect value={sort} onChange={setSort} />
        </div>

        <FilterPanel filters={filters} onChange={setFilters} />

        <div className="search-page__tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`search-page__tab${tab === t ? ' search-page__tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          tab === 'posts' ? (
            <PostList posts={results} emptyMessage="No posts found." />
          ) : (
            <ul className="search-page__list">
              {results.map((r) => (
                <li key={r._id} className="search-page__result">{r.content || r.username}</li>
              ))}
            </ul>
          )
        )}
      </main>
    </>
  );
}
