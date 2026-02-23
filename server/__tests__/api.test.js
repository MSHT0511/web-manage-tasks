const request = require('supertest');

//  fs モジュールの手動モックを作成
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    readFile: jest.fn(),
    writeFile: jest.fn()
  };
});

const fs = require('fs');

// テスト用のモックデータ
const mockTasks = [
  { id: 1, title: 'テストタスク1', completed: false, deadline: null },
  { id: 2, title: 'テストタスク2', completed: true, deadline: '2026-02-25T15:00' }
];

// appをインポート（モック設定後）
const app = require('../index');

describe('Server API Tests', () => {
  beforeEach(() => {
    // 各テストの前にモックをクリア
    jest.clearAllMocks();

    // デフォルトのモック動作を設定
    fs.readFile.mockImplementation((path, encoding, callback) => {
      callback(null, JSON.stringify(mockTasks));
    });

    fs.writeFile.mockImplementation((path, data, callback) => {
      callback(null);
    });
  });

  describe('GET /api/tasks', () => {
    test('タスク一覧を正常に取得できる', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(fs.readFile).toHaveBeenCalledWith(
        './tasks.json',
        'utf8',
        expect.any(Function)
      );
    });

    test('ファイル読み込みエラー時に500を返す', async () => {
      fs.readFile.mockImplementation((path, encoding, callback) => {
        callback(new Error('File read error'));
      });

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'タスクデータ読み込みエラー' });
    });
  });

  describe('POST /api/tasks', () => {
    test('新しいタスクを正常に追加できる', async () => {
      const newTaskTitle = '新しいタスク';
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: newTaskTitle });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 3,
        title: newTaskTitle,
        completed: false,
        deadline: null
      });
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('期限付きタスクを正常に追加できる', async () => {
      const newTask = {
        title: '期限付きタスク',
        deadline: '2026-03-01T10:00'
      };
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 3,
        title: newTask.title,
        completed: false,
        deadline: newTask.deadline
      });
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('期限が空文字列の場合はnullに変換される', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'タスク', deadline: '   ' });

      expect(response.status).toBe(200);
      expect(response.body.deadline).toBe(null);
    });

    test('無効な期限形式の場合は400エラーを返す', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'タスク', deadline: 'invalid-date' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: '無効な期限形式' });
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('タイトルが空の場合は400エラーを返す', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'タイトル必須' });
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('タイトルがない場合は400エラーを返す', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'タイトル必須' });
    });

    test('タスクリストが空の場合、IDは1から始まる', async () => {
      fs.readFile.mockImplementation((path, encoding, callback) => {
        callback(null, JSON.stringify([]));
      });

      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '最初のタスク' });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
    });

    test('ファイル読み込みエラー時に500を返す', async () => {
      fs.readFile.mockImplementation((path, encoding, callback) => {
        callback(new Error('Read error'));
      });

      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '新タスク' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '読み込みエラー' });
    });

    test('ファイル書き込みエラー時に500を返す', async () => {
      fs.writeFile.mockImplementation((path, data, callback) => {
        callback(new Error('Write error'));
      });

      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '新タスク' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '保存エラー' });
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('タスクを正常に更新できる', async () => {
      const updatedTask = {
        title: '更新されたタスク',
        completed: true,
        deadline: '2026-03-15T14:00'
      };
      const response = await request(app)
        .put('/api/tasks/1')
        .send(updatedTask);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        ...updatedTask
      });
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('期限をnullに更新できる', async () => {
      const updatedTask = {
        title: '期限なしタスク',
        completed: false,
        deadline: null
      };
      const response = await request(app)
        .put('/api/tasks/2')
        .send(updatedTask);

      expect(response.status).toBe(200);
      expect(response.body.deadline).toBe(null);
    });

    test('存在しないIDの場合は404エラーを返す', async () => {
      const response = await request(app)
        .put('/api/tasks/999')
        .send({ title: 'タスク', completed: false });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'タスクが見つかりません' });
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('タイトルが空の場合は400エラーを返す', async () => {
      const response = await request(app)
        .put('/api/tasks/1')
        .send({ title: '', completed: false });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'タイトル必須' });
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('無効な期限形式の場合は400エラーを返す', async () => {
      const response = await request(app)
        .put('/api/tasks/1')
        .send({ title: 'タスク', deadline: 'not-a-date' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: '無効な期限形式' });
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('ファイル読み込みエラー時に500を返す', async () => {
      fs.readFile.mockImplementation((path, encoding, callback) => {
        callback(new Error('Read error'));
      });

      const response = await request(app)
        .put('/api/tasks/1')
        .send({ title: 'タスク' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '読み込みエラー' });
    });

    test('ファイル書き込みエラー時に500を返す', async () => {
      fs.writeFile.mockImplementation((path, data, callback) => {
        callback(new Error('Write error'));
      });

      const response = await request(app)
        .put('/api/tasks/1')
        .send({ title: 'タスク' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '保存エラー' });
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('指定したIDのタスクを正常に削除できる', async () => {
      const response = await request(app).delete('/api/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(fs.writeFile).toHaveBeenCalled();

      // 書き込まれたデータを確認
      const writtenData = JSON.parse(fs.writeFile.mock.calls[0][1]);
      expect(writtenData).toHaveLength(1);
      expect(writtenData[0].id).toBe(2);
    });

    test('存在しないIDの場合は404エラーを返す', async () => {
      const response = await request(app).delete('/api/tasks/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'タスクが見つかりません' });
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('ファイル読み込みエラー時に500を返す', async () => {
      fs.readFile.mockImplementation((path, encoding, callback) => {
        callback(new Error('Read error'));
      });

      const response = await request(app).delete('/api/tasks/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '読み込みエラー' });
    });

    test('ファイル書き込みエラー時に500を返す', async () => {
      fs.writeFile.mockImplementation((path, data, callback) => {
        callback(new Error('Write error'));
      });

      const response = await request(app).delete('/api/tasks/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '保存エラー' });
    });
  });
});
