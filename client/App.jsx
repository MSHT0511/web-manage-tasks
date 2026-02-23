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
      body: JSON.stringify({ title: input, completed: false })
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

  // タスク完了切り替え
  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // スタイル定義
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '40px 20px',
    },
    card: {
      maxWidth: '600px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
    },
    header: {
      textAlign: 'center',
      color: '#333',
      fontSize: '2.5em',
      marginBottom: '10px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      textAlign: 'center',
      color: '#666',
      fontSize: '0.9em',
      marginBottom: '30px',
    },
    inputContainer: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
    },
    input: {
      flex: 1,
      padding: '15px 20px',
      fontSize: '16px',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    addButton: {
      padding: '15px 30px',
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    },
    taskList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    taskItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      padding: '18px 20px',
      marginBottom: '12px',
      background: 'white',
      borderRadius: '12px',
      border: '2px solid #f0f0f0',
      transition: 'all 0.3s ease',
      animation: 'slideIn 0.3s ease',
    },
    taskItemCompleted: {
      opacity: 0.6,
      textDecoration: 'line-through',
    },
    checkbox: {
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      accentColor: '#667eea',
    },
    taskText: {
      flex: 1,
      fontSize: '16px',
      color: '#333',
    },
    deleteButton: {
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#ff4757',
      background: 'transparent',
      border: '2px solid #ff4757',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#999',
      fontSize: '16px',
    },
    statsContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '20px',
      marginTop: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      color: 'white',
    },
    statItem: {
      textAlign: 'center',
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '5px',
    },
    statLabel: {
      fontSize: '12px',
      opacity: 0.9,
    },
  };

  // CSS keyframes をstyleタグとして注入
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      input:focus {
        border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
      }
      button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
      }
      button:active {
        transform: translateY(0);
      }
      .task-item:hover {
        border-color: #667eea !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      }
      .delete-button:hover {
        background: #ff4757 !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>✨ タスク管理ツール</h1>
        <p style={styles.subtitle}>日々のタスクをスマートに管理</p>

        <div style={styles.inputContainer}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addTask()}
            placeholder="新しいタスクを入力..."
            style={styles.input}
          />
          <button onClick={addTask} style={styles.addButton}>
            追加 ➕
          </button>
        </div>

        {tasks.length > 0 && (
          <div style={styles.statsContainer}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{totalCount}</div>
              <div style={styles.statLabel}>全タスク</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{completedCount}</div>
              <div style={styles.statLabel}>完了</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{totalCount - completedCount}</div>
              <div style={styles.statLabel}>未完了</div>
            </div>
          </div>
        )}

        <ul style={styles.taskList}>
          {tasks.length === 0 ? (
            <div style={styles.emptyState}>
              📝 タスクがありません<br />
              新しいタスクを追加してみましょう！
            </div>
          ) : (
            tasks.map(task => (
              <li
                key={task.id}
                className="task-item"
                style={{
                  ...styles.taskItem,
                  ...(task.completed ? styles.taskItemCompleted : {})
                }}
              >
                <input
                  type="checkbox"
                  checked={task.completed || false}
                  onChange={() => toggleTask(task.id)}
                  style={styles.checkbox}
                />
                <span style={styles.taskText}>{task.title}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="delete-button"
                  style={styles.deleteButton}
                >
                  削除 🗑️
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
