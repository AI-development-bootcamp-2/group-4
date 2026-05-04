import './FilterPanel.css';

export default function FilterPanel({ filters, onChange }) {
  function handleChange(e) {
    onChange({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div className="filter-panel">
      <input
        className="filter-panel__input"
        name="author"
        placeholder="Author"
        value={filters.author || ''}
        onChange={handleChange}
      />
      <input
        className="filter-panel__input"
        name="category"
        placeholder="Category"
        value={filters.category || ''}
        onChange={handleChange}
      />
      <input
        className="filter-panel__input"
        type="date"
        name="from"
        value={filters.from || ''}
        onChange={handleChange}
      />
      <input
        className="filter-panel__input"
        type="date"
        name="to"
        value={filters.to || ''}
        onChange={handleChange}
      />
    </div>
  );
}
