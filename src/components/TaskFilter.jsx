const FILTERS = ['all', 'active', 'completed'];

export default function TaskFilter({ current, onChange }) {
  return (
    <div className="task-filter">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          className={current === filter ? 'active' : ''}
          onClick={() => onChange(filter)}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  );
}
