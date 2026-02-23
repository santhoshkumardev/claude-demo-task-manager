import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import TaskForm from './components/TaskForm';
import TaskFilter from './components/TaskFilter';
import TaskList from './components/TaskList';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [filter, setFilter] = useState('all');

  const addTask = (text) => {
    setTasks([...tasks, { id: crypto.randomUUID(), text, completed: false }]);
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
