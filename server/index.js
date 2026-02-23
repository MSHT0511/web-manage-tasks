const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;
const TASKS_FILE = './tasks.json';

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

// タスク一覧取得
app.get('/api/tasks', (req, res) => {
  fs.readFile(TASKS_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'タスクデータ読み込みエラー' });
    }
    res.json(JSON.parse(data));
  });
});

// タスク追加
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'タイトル必須' });
  fs.readFile(TASKS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: '読み込みエラー' });
    const tasks = JSON.parse(data);
    const newTask = {
      id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
      title,
      completed: false
    };
    tasks.push(newTask);
    fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), err => {
      if (err) return res.status(500).json({ error: '保存エラー' });
      res.json(newTask);
    });
  });
});

// タスク削除
app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  fs.readFile(TASKS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: '読み込みエラー' });
    let tasks = JSON.parse(data);
    const newTasks = tasks.filter(task => task.id !== id);
    if (tasks.length === newTasks.length) return res.status(404).json({ error: 'タスクが見つかりません' });
    fs.writeFile(TASKS_FILE, JSON.stringify(newTasks, null, 2), err => {
      if (err) return res.status(500).json({ error: '保存エラー' });
      res.json({ success: true });
    });
  });
});

// テスト環境でない場合のみサーバーを起動
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
