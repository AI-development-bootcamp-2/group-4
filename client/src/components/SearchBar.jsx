import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const MAX_HISTORY = 5;

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    // Save recent searches for quick access
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const updated = [query, ...history.filter((q) => q !== query)].slice(0, MAX_HISTORY);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
    navigate(`/search?q=${query}`);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        className="search-bar__input"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">🔍</button>
    </form>
  );
}
