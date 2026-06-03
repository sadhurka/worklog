import { FilterState } from '../types';

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>From</label>
        <input
          type="date"
          value={filters.from}
          max={filters.to || today}
          onChange={e => onChange({ ...filters, from: e.target.value })}
        />
      </div>
      <div className="filter-group">
        <label>To</label>
        <input
          type="date"
          value={filters.to}
          min={filters.from}
          max={today}
          onChange={e => onChange({ ...filters, to: e.target.value })}
        />
      </div>
      <div className="filter-group">
        <label>Sort</label>
        <select
          value={filters.sort}
          onChange={e => onChange({ ...filters, sort: e.target.value as 'asc' | 'desc' })}
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>
      {(filters.from || filters.to) && (
        <button
          className="btn-ghost"
          onClick={() => onChange({ ...filters, from: '', to: '' })}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
