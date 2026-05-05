import './SortSelect.css';

const OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

export default function SortSelect({ value, onChange }) {
  return (
    <select className="sort-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
