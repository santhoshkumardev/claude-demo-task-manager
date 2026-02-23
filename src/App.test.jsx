import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

describe('Task Manager — End to End', () => {
  it('renders the app with sample tasks on first load', () => {
    render(<App />);
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    expect(screen.getByText('Review Q1 budget proposal')).toBeInTheDocument();
    expect(screen.getByText('Prepare CIO presentation slides')).toBeInTheDocument();
  });

  it('shows task count summary', () => {
    render(<App />);
    // 5 active, 3 completed, 8 total from sample data
    expect(screen.getByText(/5 active/)).toBeInTheDocument();
    expect(screen.getByText(/3 completed/)).toBeInTheDocument();
    expect(screen.getByText(/8 total/)).toBeInTheDocument();
  });

  it('adds a new task', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'New test task');
    await user.click(screen.getByText('Add Task'));

    expect(screen.getByText('New test task')).toBeInTheDocument();
    expect(screen.getByText(/9 total/)).toBeInTheDocument();
  });

  it('does not add an empty task', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Add Task'));
    // Count should remain 8
    expect(screen.getByText(/8 total/)).toBeInTheDocument();
  });

  it('adds a new task with a due date', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    const dateInput = document.querySelector('.date-input');

    await user.type(input, 'Task with deadline');
    await user.type(dateInput, '2026-12-25');
    await user.click(screen.getByText('Add Task'));

    expect(screen.getByText('Task with deadline')).toBeInTheDocument();
    expect(screen.getByText('Dec 25')).toBeInTheDocument();
  });

  it('completes a task by clicking its checkbox', async () => {
    const user = userEvent.setup();
    render(<App />);

    // "Prepare CIO presentation slides" is active (unchecked)
    const taskItem = screen.getByText('Prepare CIO presentation slides').closest('.task-item');
    const checkbox = within(taskItem).getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    // Active count should drop by 1: 5 -> 4
    expect(screen.getByText(/4 active/)).toBeInTheDocument();
  });

  it('deletes a task', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('Onboard new DevOps engineer')).toBeInTheDocument();
    const taskItem = screen.getByText('Onboard new DevOps engineer').closest('.task-item');
    const deleteBtn = within(taskItem).getByLabelText('Delete task');

    await user.click(deleteBtn);
    expect(screen.queryByText('Onboard new DevOps engineer')).not.toBeInTheDocument();
    expect(screen.getByText(/7 total/)).toBeInTheDocument();
  });

  it('filters tasks by active status', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Active' }));

    // Active tasks should be visible
    expect(screen.getByText('Prepare CIO presentation slides')).toBeInTheDocument();
    expect(screen.getByText('Draft API deprecation timeline')).toBeInTheDocument();
    // Completed tasks should be hidden
    expect(screen.queryByText('Review Q1 budget proposal')).not.toBeInTheDocument();
    expect(screen.queryByText('Schedule vendor security audit')).not.toBeInTheDocument();
  });

  it('filters tasks by completed status', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Completed' }));

    // Completed tasks visible
    expect(screen.getByText('Review Q1 budget proposal')).toBeInTheDocument();
    expect(screen.getByText('Deploy monitoring dashboards to prod')).toBeInTheDocument();
    // Active tasks hidden
    expect(screen.queryByText('Prepare CIO presentation slides')).not.toBeInTheDocument();
  });

  it('shows all tasks when "All" filter is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Active' }));
    await user.click(screen.getByRole('button', { name: 'All' }));

    expect(screen.getByText(/8 total/)).toBeInTheDocument();
    expect(screen.getByText('Review Q1 budget proposal')).toBeInTheDocument();
    expect(screen.getByText('Prepare CIO presentation slides')).toBeInTheDocument();
  });

  it('displays due dates on tasks', () => {
    render(<App />);
    // "Prepare CIO presentation slides" has dueDate 2026-02-25
    expect(screen.getByText('Feb 25')).toBeInTheDocument();
    // "Migrate legacy auth service" has dueDate 2026-03-10
    expect(screen.getByText('Mar 10')).toBeInTheDocument();
  });

  it('marks overdue tasks with visual indicator', () => {
    render(<App />);
    // "Update disaster recovery runbook" has dueDate 2026-02-15, which is past
    const taskItem = screen.getByText('Update disaster recovery runbook').closest('.task-item');
    expect(taskItem).toHaveClass('overdue');
  });

  it('does not mark completed tasks as overdue', () => {
    render(<App />);
    // "Review Q1 budget proposal" is completed with past due date 2026-02-20
    const taskItem = screen.getByText('Review Q1 budget proposal').closest('.task-item');
    expect(taskItem).not.toHaveClass('overdue');
  });

  it('persists tasks to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Persisted task');
    await user.click(screen.getByText('Add Task'));

    const stored = JSON.parse(localStorage.getItem('tasks'));
    const found = stored.find((t) => t.text === 'Persisted task');
    expect(found).toBeTruthy();
    expect(found.completed).toBe(false);
  });

  it('full workflow: add, complete, filter, delete', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Add a task
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'End-to-end workflow task');
    await user.click(screen.getByText('Add Task'));
    expect(screen.getByText(/9 total/)).toBeInTheDocument();

    // Complete it
    const taskItem = screen.getByText('End-to-end workflow task').closest('.task-item');
    await user.click(within(taskItem).getByRole('checkbox'));
    expect(screen.getByText(/5 active/)).toBeInTheDocument();

    // Filter to completed — should see it
    await user.click(screen.getByRole('button', { name: 'Completed' }));
    expect(screen.getByText('End-to-end workflow task')).toBeInTheDocument();

    // Delete it
    const deleteBtn = within(
      screen.getByText('End-to-end workflow task').closest('.task-item')
    ).getByLabelText('Delete task');
    await user.click(deleteBtn);
    expect(screen.queryByText('End-to-end workflow task')).not.toBeInTheDocument();

    // Switch to All — should be 8 total again
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText(/8 total/)).toBeInTheDocument();
  });
});
