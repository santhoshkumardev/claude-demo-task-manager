function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dateStr, completed) {
  if (!dateStr || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  return due < today;
}

export default function TaskItem({ task, onToggle, onDelete }) {
  const overdue = isOverdue(task.dueDate, task.completed);
  const formatted = formatDate(task.dueDate);

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}>
      <label className="task-label">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <span className="task-text">{task.text}</span>
      </label>
      <div className="task-meta">
        {formatted && (
          <span className={`due-date ${overdue ? 'overdue' : ''}`}>
            {overdue ? 'Overdue · ' : ''}{formatted}
          </span>
        )}
        <button className="delete-btn" onClick={() => onDelete(task.id)} aria-label="Delete task">
          ×
        </button>
      </div>
    </li>
  );
}
