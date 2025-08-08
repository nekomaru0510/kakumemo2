/**
 * 格Memo2 Proto7 - メインアプリケーション
 * 格闘ゲーム攻略メモアプリのメインコントローラー
 */

import { Explorer } from './components/explorer/Explorer.js';
import { ExtendedKeyboard } from './components/extended-keyboard/ExtendedKeyboard.js';
import { Editor } from './components/editor/Editor.js';
import { DataManager } from './core/DataManager.js';
import { TabManager } from './core/TabManager.js';

class KakuMemoApp {
    constructor() {
        this.dataManager = new DataManager();
        this.tabManager = new TabManager();
        this.explorer = null;
        this.extendedKeyboard = null;
        this.editor = null;
        this.currentFile = null;
        
        this.init();
    }

    /**
     * アプリケーション初期化
     */
    async init() {
        console.log('格Memo2 Proto7 初期化中...');
        
        try {
            // データマネージャー初期化
            await this.dataManager.init();
            
            // コンポーネント初期化
            await this.initComponents();
            
            // イベントリスナー設定
            this.setupEventListeners();
            
            // 初期サンプルデータ作成
            await this.createInitialData();
            
            // ダッシュボード表示
            this.showDashboard();
            
            console.log('格Memo2 Proto7 初期化完了');
        } catch (error) {
            console.error('アプリケーション初期化エラー:', error);
        }
    }

    /**
     * コンポーネント初期化
     */
    async initComponents() {
        // エクスプローラ初期化
        this.explorer = new Explorer(this.dataManager);
        await this.explorer.init();
        
        // 拡張キーボード初期化
        this.extendedKeyboard = new ExtendedKeyboard();
        await this.extendedKeyboard.init();
        
        // エディタ初期化
        this.editor = new Editor();
        await this.editor.init();
        
        // タブマネージャー初期化
        this.tabManager.init();
    }

    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        // グローバルイベントリスナー
        this.setupGlobalEventListeners();
        
        // キーボードショートカット
        this.setupKeyboardShortcuts();
        
        // タブ関連イベント
        this.setupTabEvents();
    }

    /**
     * グローバルイベントリスナー設定
     */
    setupGlobalEventListeners() {
        // エクスプローラ切り替えボタン
        const explorerToggleBtn = document.getElementById('explorer-toggle-btn');
        if (explorerToggleBtn) {
            explorerToggleBtn.addEventListener('click', () => {
                this.toggleExplorer();
            });
        }

        // 拡張キーボード切り替えボタン
        const toggleKeyboardBtn = document.getElementById('toggle-keyboard-btn');
        if (toggleKeyboardBtn) {
            toggleKeyboardBtn.addEventListener('click', () => {
                this.toggleExtendedKeyboard();
            });
        }

        // ゲーム追加ボタン
        const addGameBtn = document.getElementById('add-game-btn');
        if (addGameBtn) {
            addGameBtn.addEventListener('click', () => {
                this.showCreateGameDialog();
            });
        }

        // リフレッシュボタン
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshExplorer();
            });
        }

        // 検索フィールド
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }

        // テーマ切り替え
        const themeToggle = document.querySelector('[onclick="app.toggleTheme()"]');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    /**
     * キーボードショートカット設定
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+E: エクスプローラ切り替え
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyE') {
                e.preventDefault();
                this.toggleExplorer();
            }
            
            // Ctrl+K: 拡張キーボード切り替え
            if (e.ctrlKey && e.code === 'KeyK') {
                e.preventDefault();
                this.toggleExtendedKeyboard();
            }
            
            // Ctrl+S: ファイル保存
            if (e.ctrlKey && e.code === 'KeyS') {
                e.preventDefault();
                this.saveCurrentFile();
            }
            
            // Ctrl+N: 新規ファイル
            if (e.ctrlKey && e.code === 'KeyN') {
                e.preventDefault();
                this.showCreateFileDialog();
            }
            
            // Ctrl+F: 検索フォーカス
            if (e.ctrlKey && e.code === 'KeyF') {
                e.preventDefault();
                const searchField = document.getElementById('global-search');
                if (searchField) {
                    searchField.focus();
                }
            }
        });
    }

    /**
     * タブイベント設定
     */
    setupTabEvents() {
        // タブクリックイベント
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tab')) {
                const tab = e.target.closest('.tab');
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
            }
        });
    }

    /**
     * 初期サンプルデータ作成
     */
    async createInitialData() {
        const existingData = await this.dataManager.getAllData();
        
        if (!existingData.games || existingData.games.length === 0) {
            console.log('初期サンプルデータを作成中...');
            
            // Street Fighter 6 サンプルデータ
            const gameId = await this.dataManager.createGame('Street Fighter 6');
            
            // キャラクター追加
            const ryuId = await this.dataManager.createCharacter(gameId, 'リュウ');
            const chunliId = await this.dataManager.createCharacter(gameId, '春麗');
            
            // カテゴリ追加
            const comboCategory = await this.dataManager.createCategory(ryuId, 'コンボ');
            const strategyCategory = await this.dataManager.createCategory(chunliId, '戦略');
            
            // サンプルファイル追加
            await this.dataManager.createFile(comboCategory, 'リュウ基本コンボ', 
                '# リュウ基本コンボ\n\n## 中段始動\n\n立ち中P > 立ち中P > 波動拳\n- ダメージ: 180\n- スタン: 300\n\n## 重い始動\n\n立ち強P > 中足 > EX波動拳\n- ダメージ: 240\n- スタン: 400');
            
            await this.dataManager.createFile(strategyCategory, '春麗対空戦略',
                '# 春麗対空戦略\n\n## 基本対空\n\n- 立ち強P: 真上からの飛び込みに\n- 屈強P: 斜めからの飛び込みに\n- 百裂脚: 遠距離での対空\n\n## アンチエア\n\n相手のジャンプを読んだら先出し百裂脚が有効。');
            
            console.log('初期サンプルデータ作成完了');
        }
        
        // エクスプローラ更新
        if (this.explorer) {
            await this.explorer.refresh();
        }
        
        // ダッシュボード統計更新
        this.updateDashboardStats();
    }

    /**
     * ダッシュボード表示
     */
    showDashboard() {
        this.switchTab('dashboard');
        this.updateDashboardStats();
    }

    /**
     * タブ切り替え
     */
    switchTab(tabId) {
        // アクティブタブ更新
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // タブコンテンツ表示切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const activeContent = document.getElementById(`${tabId}-content`);
        if (activeContent) {
            activeContent.style.display = 'block';
        }
    }

    /**
     * ダッシュボード統計更新
     */
    async updateDashboardStats() {
        try {
            const stats = await this.dataManager.getStatistics();
            
            const totalFilesEl = document.getElementById('total-files');
            const totalGamesEl = document.getElementById('total-games');
            const totalCharsEl = document.getElementById('total-chars');
            
            if (totalFilesEl) totalFilesEl.textContent = stats.totalFiles || 0;
            if (totalGamesEl) totalGamesEl.textContent = stats.totalGames || 0;
            if (totalCharsEl) totalCharsEl.textContent = stats.totalCharacters || 0;
        } catch (error) {
            console.error('統計情報更新エラー:', error);
        }
    }

    /**
     * エクスプローラ表示切り替え
     */
    toggleExplorer() {
        if (this.explorer) {
            this.explorer.toggle();
        }
    }

    /**
     * 拡張キーボード表示切り替え
     */
    toggleExtendedKeyboard() {
        if (this.extendedKeyboard) {
            this.extendedKeyboard.toggle();
        }
    }

    /**
     * エクスプローラ更新
     */
    async refreshExplorer() {
        if (this.explorer) {
            await this.explorer.refresh();
        }
        this.updateDashboardStats();
    }

    /**
     * 検索実行
     */
    async performSearch(query) {
        if (!query.trim()) {
            this.hideSearchResults();
            return;
        }

        try {
            const results = await this.dataManager.searchFiles(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('検索エラー:', error);
        }
    }

    /**
     * 検索結果表示
     */
    displaySearchResults(results) {
        const searchResultsEl = document.getElementById('search-results');
        if (!searchResultsEl) return;

        if (results.length === 0) {
            searchResultsEl.innerHTML = '<div class="search-result-item">検索結果がありません</div>';
        } else {
            searchResultsEl.innerHTML = results.map(result => 
                `<div class="search-result-item" onclick="app.openFile('${result.id}')">
                    <strong>${result.title}</strong>
                    <div class="text-muted">${result.path}</div>
                </div>`
            ).join('');
        }
        
        searchResultsEl.classList.add('visible');
    }

    /**
     * 検索結果非表示
     */
    hideSearchResults() {
        const searchResultsEl = document.getElementById('search-results');
        if (searchResultsEl) {
            searchResultsEl.classList.remove('visible');
        }
    }

    /**
     * ゲーム作成ダイアログ表示
     */
    showCreateGameDialog() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        
        content.innerHTML = `
            <h3>新しいゲームを作成</h3>
            <div class="form-group">
                <label for="game-name">ゲーム名:</label>
                <input type="text" id="game-name" placeholder="例: Street Fighter 6">
            </div>
            <div class="dialog-footer">
                <button class="btn" onclick="app.hideModal()">キャンセル</button>
                <button class="btn btn-primary" onclick="app.createGame()">作成</button>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // フォーカス設定
        setTimeout(() => {
            const nameInput = document.getElementById('game-name');
            if (nameInput) nameInput.focus();
        }, 100);
    }

    /**
     * ファイル作成ダイアログ表示
     */
    showCreateFileDialog() {
        // 実装予定
        console.log('ファイル作成ダイアログ（実装予定）');
    }

    /**
     * ゲーム作成
     */
    async createGame() {
        const nameInput = document.getElementById('game-name');
        const name = nameInput?.value.trim();
        
        if (!name) {
            alert('ゲーム名を入力してください');
            return;
        }
        
        try {
            await this.dataManager.createGame(name);
            this.hideModal();
            await this.refreshExplorer();
            console.log(`ゲーム "${name}" を作成しました`);
        } catch (error) {
            console.error('ゲーム作成エラー:', error);
            alert('ゲーム作成に失敗しました');
        }
    }

    /**
     * モーダル非表示
     */
    hideModal() {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * ファイルを開く
     */
    async openFile(fileId) {
        try {
            const file = await this.dataManager.getFile(fileId);
            if (!file) {
                console.error('ファイルが見つかりません:', fileId);
                return;
            }
            
            this.currentFile = file;
            
            // エディタタブ作成・切り替え
            this.createEditorTab(file);
            
            // エディタにコンテンツ設定
            if (this.editor) {
                this.editor.setContent(file.content || '');
            }
            
            // 検索結果非表示
            this.hideSearchResults();
            
        } catch (error) {
            console.error('ファイルオープンエラー:', error);
        }
    }

    /**
     * エディタタブ作成
     */
    createEditorTab(file) {
        const tabList = document.getElementById('tab-list');
        const existingTab = document.querySelector(`[data-tab="file-${file.id}"]`);
        
        if (existingTab) {
            // 既存タブをアクティブに
            this.switchTab(`file-${file.id}`);
            return;
        }
        
        // 新しいタブ作成
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.tab = `file-${file.id}`;
        tab.innerHTML = `
            <span class="tab-icon">📄</span>
            <span class="tab-title">${file.title}</span>
            <span class="tab-close" onclick="app.closeTab('file-${file.id}')">&times;</span>
        `;
        
        tabList.appendChild(tab);
        
        // タブコンテンツエリアに対応するコンテンツ作成
        const contentArea = document.getElementById('content-area');
        const editorContent = document.getElementById('editor-content').cloneNode(true);
        editorContent.id = `file-${file.id}-content`;
        editorContent.classList.add('tab-content');
        editorContent.style.display = 'none';
        
        contentArea.appendChild(editorContent);
        
        // タブ切り替え
        this.switchTab(`file-${file.id}`);
    }

    /**
     * タブを閉じる
     */
    closeTab(tabId) {
        const tab = document.querySelector(`[data-tab="${tabId}"]`);
        const content = document.getElementById(`${tabId}-content`);
        
        if (tab) {
            tab.remove();
        }
        
        if (content) {
            content.remove();
        }
        
        // ダッシュボードタブをアクティブに
        this.showDashboard();
    }

    /**
     * 現在のファイル保存
     */
    async saveCurrentFile() {
        if (!this.currentFile || !this.editor) {
            return;
        }
        
        try {
            const content = this.editor.getContent();
            await this.dataManager.updateFile(this.currentFile.id, {
                content: content,
                lastModified: new Date().toISOString()
            });
            
            console.log('ファイルを保存しました');
            
            // ステータス更新
            const statusEl = document.getElementById('last-saved');
            if (statusEl) {
                statusEl.textContent = '保存済み';
            }
            
        } catch (error) {
            console.error('ファイル保存エラー:', error);
        }
    }

    /**
     * テーマ切り替え
     */
    toggleTheme() {
        // 実装予定
        console.log('テーマ切り替え（実装予定）');
    }

    /**
     * データインポート
     */
    async importData() {
        // 実装予定
        console.log('データインポート（実装予定）');
    }

    /**
     * データエクスポート
     */
    async exportData() {
        // 実装予定
        console.log('データエクスポート（実装予定）');
    }

    /**
     * 最初のゲーム作成
     */
    async createFirstGame() {
        this.showCreateGameDialog();
    }

    /**
     * サンプルデータインポート
     */
    async importSampleData() {
        await this.createInitialData();
    }

    /**
     * チュートリアル表示
     */
    showTutorial() {
        // 実装予定
        console.log('チュートリアル（実装予定）');
    }

    /**
     * キーボードショートカット表示
     */
    showKeyboardShortcuts() {
        // 実装予定
        console.log('キーボードショートカット一覧（実装予定）');
    }

    /**
     * ファイルオプション表示
     */
    showFileOptions() {
        // 実装予定
        console.log('ファイルオプション（実装予定）');
    }

    /**
     * 太字切り替え
     */
    toggleBold() {
        if (this.editor) {
            this.editor.toggleBold();
        }
    }

    /**
     * 斜体切り替え
     */
    toggleItalic() {
        if (this.editor) {
            this.editor.toggleItalic();
        }
    }

    /**
     * 下線切り替え
     */
    toggleUnderline() {
        if (this.editor) {
            this.editor.toggleUnderline();
        }
    }

    /**
     * 見出し切り替え
     */
    toggleHeading(level) {
        if (this.editor) {
            this.editor.toggleHeading(level);
        }
    }

    /**
     * リンク作成
     */
    createLink() {
        if (this.editor) {
            this.editor.createLink();
        }
    }

    /**
     * 表挿入
     */
    insertTable() {
        if (this.editor) {
            this.editor.insertTable();
        }
    }

    /**
     * グローバル検索実行
     */
    async performGlobalSearch() {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            await this.performSearch(searchInput.value);
        }
    }
}

// グローバルアプリインスタンス作成
window.app = new KakuMemoApp();

// デバッグ用：アプリが正常に読み込まれたことを確認
console.log('🎮 格Memo2 Proto7 - アプリケーション読み込み完了');
console.log('app オブジェクト:', window.app);

export default KakuMemoApp;
