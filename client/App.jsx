import React, { useEffect, useState } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  // タスク一覧取得
  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(setTasks);
  }, []);

  // 相対時間表示を取得
  const getRelativeTime = (deadlineStr) => {
    if (!deadlineStr) return null;
    const now = new Date();
    const deadlineDate = new Date(deadlineStr);
    const diffMs = deadlineDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) {
      const absDays = Math.abs(diffDays);
      const absHours = Math.abs(diffHours);
      if (absDays > 0) return `${absDays}日遅れ`;
      if (absHours > 0) return `${absHours}時間遅れ`;
      return `${Math.abs(diffMinutes)}分遅れ`;
    }

    if (diffDays > 0) {
      if (diffHours > 0) return `あと${diffDays}日${diffHours}時間`;
      return `あと${diffDays}日`;
    }
    if (diffHours > 0) {
      if (diffMinutes > 0) return `あと${diffHours}時間${diffMinutes}分`;
      return `あと${diffHours}時間`;
    }
    return `あと${diffMinutes}分`;
  };

  // 期限切れ判定
  const isOverdue = (deadlineStr) => {
    if (!deadlineStr) return false;
    return new Date(deadlineStr) < new Date();
  };

  // 日時フォーマット
  const formatDeadline = (deadlineStr) => {
    if (!deadlineStr) return null;
    const date = new Date(deadlineStr);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // タスクをソート（期限が近い順、期限なしは最後）
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  // タスク追加
  const addTask = async () => {
    if (!input.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input, deadline: deadline || null })
    });
    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setInput('');
    setDeadline('');
  };

  // タスク更新
  const updateTask = async (id) => {
    if (!editTitle.trim()) return;
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        completed: tasks.find(t => t.id === id).completed,
        deadline: editDeadline || null
      })
    });
    const updatedTask = await res.json();
    setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    setEditingTaskId(null);
    setEditTitle('');
    setEditDeadline('');
  };

  // 編集開始
  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDeadline(task.deadline || '');
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDeadline('');
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
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '30px',
    },
    inputRow: {
      display: 'flex',
      gap: '10px',
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
    deadlineInput: {
      padding: '15px 20px',
      fontSize: '16px',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      color: '#666',
      minWidth: '220px',
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
    taskContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    deadlineInfo: {
      fontSize: '13px',
      color: '#666',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    deadlineOverdue: {
      color: '#ff4757',
      fontWeight: '600',
    },
    warningIcon: {
      fontSize: '16px',
    },
    editContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    editInput: {
      padding: '8px 12px',
      fontSize: '15px',
      border: '2px solid #667eea',
      borderRadius: '8px',
      outline: 'none',
    },
    editButtons: {
      display: 'flex',
      gap: '8px',
    },
    saveButton: {
      padding: '6px 12px',
      fontSize: '14px',
      fontWeight: '500',
      color: 'white',
      background: '#667eea',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    cancelButton: {
      padding: '6px 12px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#666',
      background: '#f0f0f0',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    editButton: {
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#667eea',
      background: 'transparent',
      border: '2px solid #667eea',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
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
          <div style={styles.inputRow}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '14px', color: '#666', fontWeight: '500', minWidth: '80px' }}>
              📅 期限（任意）:
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              style={styles.deadlineInput}
            />
          </div>
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
            sortedTasks.map(task => (
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

                {editingTaskId === task.id ? (
                  <div style={styles.editContainer}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      style={styles.editInput}
                      placeholder="タスク名"
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: '#666', fontWeight: '500', minWidth: '70px' }}>
                        📅 期限:
                      </label>
                      <input
                        type="datetime-local"
                        value={editDeadline}
                        onChange={e => setEditDeadline(e.target.value)}
                        style={styles.editInput}
                      />
                    </div>
                    <div style={styles.editButtons}>
                      <button onClick={() => updateTask(task.id)} style={styles.saveButton}>
                        保存
                      </button>
                      <button onClick={cancelEdit} style={styles.cancelButton}>
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.taskContent}>
                    <span style={styles.taskText}>{task.title}</span>
                    {task.deadline && (
                      <div style={{
                        ...styles.deadlineInfo,
                        ...(isOverdue(task.deadline) ? styles.deadlineOverdue : {})
                      }}>
                        {isOverdue(task.deadline) && <span style={styles.warningIcon}>⚠️</span>}
                        📅 {formatDeadline(task.deadline)} ({getRelativeTime(task.deadline)})
                      </div>
                    )}
                  </div>
                )}

                {editingTaskId !== task.id && (
                  <>
                    <button
                      onClick={() => startEdit(task)}
                      style={styles.editButton}
                    >
                      編集 ✏️
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="delete-button"
                      style={styles.deleteButton}
                    >
                      削除 🗑️
                    </button>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
