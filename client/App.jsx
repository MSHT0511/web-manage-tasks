import React, { useEffect, useState } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  // タスク一覧取得
  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(setTasks);
  }, []);

  // タスク追加
  const addTask = async () => {
    if (!input.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input })
    });
    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setInput('');
  };

  // タスク削除
  const deleteTask = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>タスク管理ツール</h1>
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="新しいタスク"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addTask} style={{ marginLeft: 8 }}>追加</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li key={task.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ flex: 1 }}>{task.title}</span>
            <button onClick={() => deleteTask(task.id)} style={{ marginLeft: 8 }}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
