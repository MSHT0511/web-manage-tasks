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

      expect(screen.getByText('タスク管理ツール')).toBeInTheDocument();
    });

    test('入力フィールドとボタンが表示される', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      const input = screen.getByPlaceholderText('新しいタスク');
      const button = screen.getByText('追加');

      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });
  });

  describe('タスク一覧の取得と表示', () => {
    test('初期レンダリング時にタスク一覧を取得する', async () => {
      const mockTasks = [
        { id: 1, title: 'タスク1', completed: false },
        { id: 2, title: 'タスク2', completed: true }
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

    test('タスクが空の場合、リストは空である', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks');
      });

      // タスクが表示されないことを確認
      const listItems = screen.queryAllByRole('listitem');
      expect(listItems).toHaveLength(0);
    });
  });

  describe('タスクの追加', () => {
    test('新しいタスクを追加できる', async () => {
      const initialTasks = [
        { id: 1, title: '既存タスク', completed: false }
      ];
      const newTask = { id: 2, title: '新しいタスク', completed: false };

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
      const input = screen.getByPlaceholderText('新しいタスク');
      fireEvent.change(input, { target: { value: '新しいタスク' } });

      // 追加ボタンをクリック
      const addButton = screen.getByText('追加');
      fireEvent.click(addButton);

      // POSTリクエストが呼ばれたことを確認
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '新しいタスク' })
        });
      });

      // 新しいタスクが表示されることを確認
      expect(await screen.findByText('新しいタスク')).toBeInTheDocument();

      // 入力フィールドがクリアされることを確認
      expect(input.value).toBe('');
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
      const addButton = screen.getByText('追加');
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
      const input = screen.getByPlaceholderText('新しいタスク');
      fireEvent.change(input, { target: { value: '   ' } });

      // 追加ボタンをクリック
      const addButton = screen.getByText('追加');
      fireEvent.click(addButton);

      // POSTリクエストが呼ばれないことを確認
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1); // GETのみ
      });
    });
  });

  describe('タスクの削除', () => {
    test('タスクを削除できる', async () => {
      const initialTasks = [
        { id: 1, title: 'タスク1', completed: false },
        { id: 2, title: 'タスク2', completed: false }
      ];

      // GETリクエストをモック
      fetch.mockResolvedValueOnce({
        json: async () => initialTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('タスク1')).toBeInTheDocument();
      });

      // DELETEリクエストをモック
      fetch.mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

      // 最初の削除ボタンをクリック
      const deleteButtons = screen.getAllByText('削除');
      fireEvent.click(deleteButtons[0]);

      // DELETEリクエストが呼ばれたことを確認
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
          method: 'DELETE'
        });
      });

      // タスク1が削除されたことを確認
      await waitFor(() => {
        expect(screen.queryByText('タスク1')).not.toBeInTheDocument();
      });

      // タスク2はまだ存在することを確認
      expect(screen.getByText('タスク2')).toBeInTheDocument();
    });

    test('複数のタスクを順番に削除できる', async () => {
      const initialTasks = [
        { id: 1, title: 'タスク1', completed: false },
        { id: 2, title: 'タスク2', completed: false },
        { id: 3, title: 'タスク3', completed: false }
      ];

      fetch.mockResolvedValueOnce({
        json: async () => initialTasks
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('タスク1')).toBeInTheDocument();
      });

      // タスク2を削除
      fetch.mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

      const deleteButtons = screen.getAllByText('削除');
      fireEvent.click(deleteButtons[1]); // タスク2の削除ボタン

      await waitFor(() => {
        expect(screen.queryByText('タスク2')).not.toBeInTheDocument();
      });

      // タスク1とタスク3はまだ存在
      expect(screen.getByText('タスク1')).toBeInTheDocument();
      expect(screen.getByText('タスク3')).toBeInTheDocument();
    });
  });

  describe('入力フィールドの状態管理', () => {
    test('入力フィールドの値が正しく更新される', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      const input = screen.getByPlaceholderText('新しいタスク');

      fireEvent.change(input, { target: { value: 'テスト入力' } });

      expect(input.value).toBe('テスト入力');
    });

    test('タスク追加後に入力フィールドがクリアされる', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => []
      });

      render(<App />);

      const input = screen.getByPlaceholderText('新しいタスク');

      // 値を入力
      fireEvent.change(input, { target: { value: '新タスク' } });

      // POSTリクエストをモック
      fetch.mockResolvedValueOnce({
        json: async () => ({ id: 1, title: '新タスク', completed: false })
      });

      // 追加ボタンをクリック
      const addButton = screen.getByText('追加');
      fireEvent.click(addButton);

      // 入力フィールドがクリアされることを確認
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });
});
