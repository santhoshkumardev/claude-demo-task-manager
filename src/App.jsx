import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import TaskForm from './components/TaskForm';
import TaskFilter from './components/TaskFilter';
import TaskList from './components/TaskList';
import './App.css';

const SAMPLE_TASKS = [
  { id: '1', text: 'Review Q1 budget proposal', completed: true, dueDate: '2026-02-20' },
  { id: '2', text: 'Prepare CIO presentation slides', completed: false, dueDate: '2026-02-25' },
  { id: '3', text: 'Migrate legacy auth service to OAuth 2.0', completed: false, dueDate: '2026-03-10' },
  { id: '4', text: 'Schedule vendor security audit', completed: true, dueDate: '2026-02-18' },
  { id: '5', text: 'Update disaster recovery runbook', completed: false, dueDate: '2026-02-15' },
  { id: '6', text: 'Deploy monitoring dashboards to prod', completed: true, dueDate: null },
  { id: '7', text: 'Draft API deprecation timeline', completed: false, dueDate: '2026-03-01' },
  { id: '8', text: 'Onboard new DevOps engineer', completed: false, dueDate: null },
];

export default function App() {
  const [tasks, setTasks] = useLocalStorage('tasks', SAMPLE_TASKS);
  const [filter, setFilter] = useState('all');

  const addTask = (text, dueDate) => {
    setTasks([...tasks, { id: crypto.randomUUID(), text, completed: false, dueDate }]);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Manager</h1>
        <p className="task-summary">
          {activeCount} active · {completedCount} completed · {tasks.length} total
        </p>
      </header>
      <main>
        <TaskForm onAdd={addTask} />
        <TaskFilter current={filter} onChange={setFilter} />
        <TaskList tasks={filtered} onToggle={toggleTask} onDelete={deleteTask} />
      </main>
    </div>
  );
}
