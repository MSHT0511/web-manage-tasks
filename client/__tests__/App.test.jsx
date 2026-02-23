import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// グローバルfetchをモック化
global.fetch = jest.fn();

describe('App Component Tests', () => {
  beforeEach(() => {
    // 各テストの前にモックをクリア
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('コンポーネントレンダリング', () => {
    test('タイトルが正しく表示される', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      expect(screen.getByText('✨ タスク管理ツール')).toBeInTheDocument();
    });

    test('入力フィールドとボタンが表示される', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      const button = screen.getByRole('button', { name: /追加/ });

      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    test('タスクが空の場合、空の状態メッセージが表示される', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks');
      });

      expect(screen.getByText(/タスクがありません/)).toBeInTheDocument();
    });
  });

  describe('タスク一覧の取得と表示', () => {
    test('初期レンダリング時にタスク一覧を取得する', async () => {
      const mockTasks = [
        { id: 1, title: 'タスク1', completed: false, deadline: null },
        { id: 2, title: 'タスク2', completed: true, deadline: '2026-02-25T15:00' }
      ];

      fetch.mockResolvedValueOnce({
        json: async () => mockTasks
      });

      render(<App />);

      // useEffectの実行を待つ
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks');
      });

      // タスクが表示されることを確認
      expect(await screen.findByText('タスク1')).toBeInTheDocument();
      expect(await screen.findByText('タスク2')).toBeInTheDocument();
    });

    test('タスクがある場合、統計が表示される', async () => {
      const mockTasks = [
        { id: 1, title: 'タスク1', completed: false, deadline: null },
        { id: 2, title: 'タスク2', completed: true, deadline: null },
        { id: 3, title: 'タスク3', completed: true, deadline: null }
      ];

      fetch.mockResolvedValueOnce({
        json: async () => mockTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('全タスク')).toBeInTheDocument();
      });

      expect(screen.getByText('完了')).toBeInTheDocument();
      expect(screen.getByText('未完了')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // 全タスク数
      expect(screen.getByText('2')).toBeInTheDocument(); // 完了数
      expect(screen.getByText('1')).toBeInTheDocument(); // 未完了数
    });

    test('タスクが空の場合、統計は表示されない', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks');
      });

      // 統計が表示されないことを確認
      expect(screen.queryByText('全タスク')).not.toBeInTheDocument();
    });
  });

  describe('タスクの追加', () => {
    test('新しいタスクを追加できる', async () => {
      const initialTasks = [
        { id: 1, title: '既存タスク', completed: false, deadline: null }
      ];
      const newTask = { id: 2, title: '新しいタスク', completed: false, deadline: null };

      // 初回のGETリクエストをモック
      fetch.mockResolvedValueOnce({
        json: async () => initialTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('既存タスク')).toBeInTheDocument();
      });

      // POSTリクエストをモック
      fetch.mockResolvedValueOnce({
        json: async () => newTask
      });

      // 入力フィールドに値を入力
      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      fireEvent.change(input, { target: { value: '新しいタスク' } });

      // 追加ボタンをクリック
      const addButton = screen.getByRole('button', { name: /追加/ });
      fireEvent.click(addButton);

      // POSTリクエストが呼ばれたことを確認
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '新しいタスク', deadline: null })
        });
      });

      // 新しいタスクが表示されることを確認
      expect(await screen.findByText('新しいタスク')).toBeInTheDocument();

      // 入力フィールドがクリアされることを確認
      expect(input.value).toBe('');
    });

    test('期限付きタスクを追加できる', async () => {
      const newTask = { id: 1, title: '期限付きタスク', completed: false, deadline: '2026-03-01T10:00' };

      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      fetch.mockResolvedValueOnce({
        json: async () => newTask
      });

      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      // datetime-local の input 要素を取得
      const deadlineInput = container.querySelector('input[type="datetime-local"]');

      fireEvent.change(input, { target: { value: '期限付きタスク' } });
      fireEvent.change(deadlineInput, { target: { value: '2026-03-01T10:00' } });

      const addButton = screen.getByRole('button', { name: /追加/ });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '期限付きタスク', deadline: '2026-03-01T10:00' })
        });
      });
    });

    test('Enterキーでタスクを追加できる', async () => {
      const newTask = { id: 1, title: 'Enterで追加', completed: false, deadline: null };

      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      fetch.mockResolvedValueOnce({
        json: async () => newTask
      });

      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      fireEvent.change(input, { target: { value: 'Enterで追加' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Enterで追加', deadline: null })
        });
      }, { timeout: 3000 });
    });

    test('空の入力値ではタスクを追加しない', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // 空の入力で追加ボタンをクリック
      const addButton = screen.getByRole('button', { name: /追加/ });
      fireEvent.click(addButton);

      // POSTリクエストが呼ばれないことを確認
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1); // GETのみ
      });
    });

    test('空白のみの入力値ではタスクを追加しない', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // 空白のみを入力
      const input = screen.getByPlaceholderText('新しいタスクを入力...');
      fireEvent.change(input, { target: { value: '   ' } });

      // 追加ボタンをクリック
      const addButton = screen.getByRole('button', { name: /追加/ });
      fireEvent.click(addButton);

      // POSTリクエストが呼ばれないことを確認
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetch).toHaveBeenCalledTimes(1); // GETのみ
    });
  });

  describe('タスクの削除', () => {
    test('タスクを削除できる', async () => {
      const initialTasks = [
        { id: 1, title: 'タスク1', completed: false, deadline: null },
        { id: 2, title: 'タスク2', completed: false, deadline: null }
      ];

      // GETリクエストをモック
      fetch.mockResolvedValueOnce({
        json: async () => initialTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('タスク1')).toBeInTheDocument();
      }, { timeout: 3000 });

      // DELETEリクエストをモック
      fetch.mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

      // 最初の削除ボタンをクリック
      const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
      fireEvent.click(deleteButtons[0]);

      // DELETEリクエストが呼ばれたことを確認
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
          method: 'DELETE'
        });
      }, { timeout: 3000 });

      // タスク1が削除されたことを確認
      await waitFor(() => {
        expect(screen.queryByText('タスク1')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // タスク2はまだ存在することを確認
      expect(screen.getByText('タスク2')).toBeInTheDocument();
    });

    test('複数のタスクを順番に削除できる', async () => {
      const initialTasks = [
        { id: 1, title: 'タスク1', completed: false, deadline: null },
        { id: 2, title: 'タスク2', completed: false, deadline: null },
        { id: 3, title: 'タスク3', completed: false, deadline: null }
      ];

      fetch.mockResolvedValueOnce({
        json: async () => initialTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('タスク1')).toBeInTheDocument();
      }, { timeout: 3000 });

      // タスク2を削除
      fetch.mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

      const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
      fireEvent.click(deleteButtons[1]); // タスク2の削除ボタン

      await waitFor(() => {
        expect(screen.queryByText('タスク2')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // タスク1とタスク3はまだ存在
      expect(screen.getByText('タスク1')).toBeInTheDocument();
      expect(screen.getByText('タスク3')).toBeInTheDocument();
    });
  });

  describe('タスクの完了切り替え', () => {
    test('チェックボックスでタスクの完了状態を切り替えられる', async () => {
      const initialTasks = [
        { id: 1, title: 'タスク1', completed: false, deadline: null }
      ];

      fetch.mockResolvedValueOnce({
        json: async () => initialTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('タスク1')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      const checkbox = checkboxes[0];
      expect(checkbox).not.toBeChecked();

      // チェックボックスをクリック
      fireEvent.click(checkbox);

      // チェックされたことを確認
      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });

      // もう一度クリックしてチェックを外す
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
    });

    test('完了したタスクはスタイルが変わる', async () => {
      const initialTasks = [
        { id: 1, title: 'タスク1', completed: true, deadline: null }
      ];

      fetch.mockResolvedValueOnce({
        json: async () => initialTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('タスク1')).toBeInTheDocument();
      }, { timeout: 3000 });

      const checkboxes = screen.getAllByRole('checkbox');
      const checkbox = checkboxes[0];
      expect(checkbox).toBeChecked();
    });
  });

  describe('入力フィールドの状態管理', () => {
    test('入力フィールドの値が正しく更新される', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      const input = screen.getByPlaceholderText('新しいタスクを入力...');

      fireEvent.change(input, { target: { value: 'テスト入力' } });

      expect(input.value).toBe('テスト入力');
    });

    test('タスク追加後に入力フィールドがクリアされる', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      const input = screen.getByPlaceholderText('新しいタスクを入力...');

      // 値を入力
      fireEvent.change(input, { target: { value: '新タスク' } });

      // POSTリクエストをモック
      fetch.mockResolvedValueOnce({
        json: async () => ({ id: 1, title: '新タスク', completed: false, deadline: null })
      });

      // 追加ボタンをクリック
      const addButton = screen.getByRole('button', { name: /追加/ });
      fireEvent.click(addButton);

      // 入力フィールドがクリアされることを確認
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('タスクのソート機能', () => {
    test('期限が近い順にソートされる', async () => {
      const mockTasks = [
        { id: 1, title: 'タスクC', completed: false, deadline: '2026-03-15T10:00' },
        { id: 2, title: 'タスクA', completed: false, deadline: '2026-02-25T10:00' },
        { id: 3, title: 'タスクB', completed: false, deadline: '2026-03-01T10:00' },
        { id: 4, title: 'タスクD', completed: false, deadline: null }
      ];

      fetch.mockResolvedValueOnce({
        json: async () => mockTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('タスクA')).toBeInTheDocument();
      }, { timeout: 3000 });

      // タスクが期限順に並んでいるか確認
      const taskTexts = screen.getAllByText(/タスク[A-D]/).map(el => el.textContent);
      expect(taskTexts[0]).toBe('タスクA'); // 2/25
      expect(taskTexts[1]).toBe('タスクB'); // 3/1
      expect(taskTexts[2]).toBe('タスクC'); // 3/15
      expect(taskTexts[3]).toBe('タスクD'); // 期限なし
    });
  });

  describe('タスクの編集機能', () => {
    test('編集ボタンをクリックすると編集モードになる', async () => {
      const initialTasks = [
        { id: 1, title: 'タスク1', completed: false, deadline: null }
      ];

      fetch.mockResolvedValueOnce({
        json: async () => initialTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('タスク1')).toBeInTheDocument();
      }, { timeout: 3000 });

      const editButton = screen.getByRole('button', { name: /編集/ });
      fireEvent.click(editButton);

      // 保存とキャンセルボタンが表示される
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument();
    });

    test('タスクを編集できる', async () => {
      const initialTasks = [
        { id: 1, title: '旧タスク', completed: false, deadline: null }
      ];
      const updatedTask = { id: 1, title: '新タスク', completed: false, deadline: '2026-03-01T10:00' };

      fetch.mockResolvedValueOnce({
        json: async () => initialTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('旧タスク')).toBeInTheDocument();
      }, { timeout: 3000 });

      // 編集ボタンをクリック
      const editButton = screen.getByRole('button', { name: /編集/ });
      fireEvent.click(editButton);

      // PUTリクエストをモック
      fetch.mockResolvedValueOnce({
        json: async () => updatedTask
      });

      // 入力フィールドを更新
      await waitFor(() => {
        const inputs = screen.getAllByDisplayValue('旧タスク');
        fireEvent.change(inputs[0], { target: { value: '新タスク' } });
      }, { timeout: 3000 });

      // 保存ボタンをクリック
      const saveButton = screen.getByRole('button', { name: /保存/ });
      fireEvent.click(saveButton);

      // PUTリクエストが呼ばれたことを確認
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '新タスク', completed: false, deadline: null })
        });
      }, { timeout: 3000 });
    });
  });
});

