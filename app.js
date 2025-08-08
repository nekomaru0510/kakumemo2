/**
 * 格Memo2 Proto7 - 統合版アプリケーション
 * 全コンポーネントを統合したシングルファイル版
 */

// ==================== DataManager ====================
class DataManager {
    constructor() {
        this.storageKey = 'kakumemo2_data';
        this.data = {
            games: [],
            files: [],
            settings: {
                theme: 'dark',
                autoSave: true,
                autoSaveInterval: 3000
            }
        };
    }

    async init() {
        await this.loadData();
        console.log('DataManager initialized');
    }

    async loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.data = { ...this.data, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('データ読み込みエラー:', error);
        }
    }

    async saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('データ保存エラー:', error);
            throw error;
        }
    }

    // ゲーム作成
    async createGame(name) {
        const game = {
            id: this.generateId(),
            name: name,
            characters: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.data.games.push(game);
        await this.saveData();
        return game;
    }

    // キャラクター作成
    async createCharacter(gameId, name) {
        const game = this.data.games.find(g => g.id === gameId);
        if (!game) throw new Error('ゲームが見つかりません');

        const character = {
            id: this.generateId(),
            name: name,
            gameId: gameId,
            categories: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        game.characters.push(character);
        game.updatedAt = new Date().toISOString();
        await this.saveData();
        return character;
    }

    // カテゴリ作成
    async createCategory(gameId, characterId, name) {
        const game = this.data.games.find(g => g.id === gameId);
        if (!game) throw new Error('ゲームが見つかりません');

        const character = game.characters.find(c => c.id === characterId);
        if (!character) throw new Error('キャラクターが見つかりません');

        const category = {
            id: this.generateId(),
            name: name,
            gameId: gameId,
            characterId: characterId,
            files: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        character.categories.push(category);
        character.updatedAt = new Date().toISOString();
        game.updatedAt = new Date().toISOString();
        await this.saveData();
        return category;
    }

    // ファイル作成
    async createFile(gameId, characterId, categoryId, name, content = '') {
        const game = this.data.games.find(g => g.id === gameId);
        if (!game) throw new Error('ゲームが見つかりません');

        const character = game.characters.find(c => c.id === characterId);
        if (!character) throw new Error('キャラクターが見つかりません');

        const category = character.categories.find(c => c.id === categoryId);
        if (!category) throw new Error('カテゴリが見つかりません');

        const file = {
            id: this.generateId(),
            name: name,
            content: content,
            gameId: gameId,
            characterId: characterId,
            categoryId: categoryId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        category.files.push(file);
        this.data.files.push(file);
        
        category.updatedAt = new Date().toISOString();
        character.updatedAt = new Date().toISOString();
        game.updatedAt = new Date().toISOString();
        
        await this.saveData();
        return file;
    }

    // ファイル更新
    async updateFile(fileId, content) {
        const file = this.data.files.find(f => f.id === fileId);
        if (!file) throw new Error('ファイルが見つかりません');

        file.content = content;
        file.updatedAt = new Date().toISOString();
        await this.saveData();
        return file;
    }

    // 検索
    async search(query) {
        if (!query.trim()) return [];

        const results = [];
        const lowerQuery = query.toLowerCase();

        this.data.files.forEach(file => {
            if (file.name.toLowerCase().includes(lowerQuery) ||
                file.content.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'file',
                    file: file,
                    game: this.data.games.find(g => g.id === file.gameId),
                    character: this.data.games.find(g => g.id === file.gameId)?.characters.find(c => c.id === file.characterId),
                    category: this.data.games.find(g => g.id === file.gameId)?.characters.find(c => c.id === file.characterId)?.categories.find(cat => cat.id === file.categoryId)
                });
            }
        });

        return results;
    }

    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    // 初期サンプルデータ作成
    async createSampleData() {
        if (this.data.games.length > 0) return; // 既にデータがある場合は作成しない

        console.log('初期サンプルデータを作成中...');

        // Street Fighter 6のサンプルデータ
        const sf6Game = await this.createGame('Street Fighter 6');
        
        // リュウのデータ
        const ryu = await this.createCharacter(sf6Game.id, 'リュウ');
        const ryuBasics = await this.createCategory(sf6Game.id, ryu.id, '基本技');
        const ryuSpecial = await this.createCategory(sf6Game.id, ryu.id, '必殺技');
        const ryuCombo = await this.createCategory(sf6Game.id, ryu.id, 'コンボ');

        await this.createFile(sf6Game.id, ryu.id, ryuBasics.id, '通常技まとめ', 
            '# リュウ 通常技まとめ\n\n## 立ち攻撃\n- 立ち弱P: 発生4F\n- 立ち中P: 発生6F\n- 立ち強P: 発生8F');

        await this.createFile(sf6Game.id, ryu.id, ryuSpecial.id, '波動拳', 
            '# 波動拳\n\n**コマンド**: ↓↘→ + P\n\n## 性能\n- LP版: 発生13F\n- MP版: 発生15F\n- HP版: 発生17F');

        await this.createFile(sf6Game.id, ryu.id, ryuCombo.id, 'BnBコンボ', 
            '# リュウ BnBコンボ\n\n## 基本コンボ\n1. 屈中P → 屈中K → 波動拳\n2. J強P → 立ち強P → 昇竜拳');

        console.log('Street Fighter 6のサンプルデータ作成完了');
    }
}

// ==================== TabManager ====================
class TabManager {
    constructor() {
        this.tabs = new Map();
        this.activeTabId = null;
        this.tabCounter = 0;
    }

    createTab(file) {
        // 既に同じファイルのタブが存在するかチェック
        const existingTab = this.findTabByFileId(file.id);
        if (existingTab) {
            this.activateTab(existingTab.id);
            this.renderTabs();
            return existingTab;
        }

        // 新しいタブを作成
        const tabId = `tab_${this.tabCounter++}`;
        const tab = {
            id: tabId,
            file: file,
            isDirty: false,
            isActive: false
        };
        
        this.tabs.set(tabId, tab);
        this.activateTab(tabId);
        this.renderTabs();
        return tab;
    }

    findTabByFileId(fileId) {
        for (const tab of this.tabs.values()) {
            if (tab.file.id === fileId) {
                return tab;
            }
        }
        return null;
    }

    activateTab(tabId) {
        // 全タブを非アクティブに
        this.tabs.forEach(tab => {
            tab.isActive = false;
        });

        // ダッシュボードタブを非アクティブに
        const dashboardTab = document.getElementById('dashboard-tab');
        if (dashboardTab) {
            dashboardTab.classList.remove('active');
        }

        // 指定タブをアクティブに
        const tab = this.tabs.get(tabId);
        if (tab) {
            tab.isActive = true;
            this.activeTabId = tabId;
        }
        
        this.renderTabs();
        return tab;
    }

    closeTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) return;

        this.tabs.delete(tabId);
        
        // アクティブタブが閉じられた場合、別のタブをアクティブに
        if (this.activeTabId === tabId) {
            const remainingTabs = Array.from(this.tabs.keys());
            if (remainingTabs.length > 0) {
                this.activateTab(remainingTabs[0]);
            } else {
                this.activeTabId = null;
            }
        }
        
        this.renderTabs();
    }

    renderTabs() {
        const tabList = document.getElementById('tab-list');
        if (!tabList) return;

        // ダッシュボードタブを保持
        const dashboardTab = document.getElementById('dashboard-tab');
        tabList.innerHTML = '';
        if (dashboardTab) {
            // ダッシュボードタブのクリックイベントリスナーを設定
            dashboardTab.addEventListener('click', () => {
                window.app.showDashboard();
            });
            tabList.appendChild(dashboardTab);
        }

        // ファイルタブを追加
        this.tabs.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.className = `tab${tab.isActive ? ' active' : ''}`;
            tabElement.dataset.tab = tab.id;
            tabElement.innerHTML = `
                <span class="tab-icon">📄</span>
                <span class="tab-title">${tab.file.name}</span>
                <button class="tab-close" onclick="app.closeTab('${tab.id}')">✕</button>
            `;
            
            tabElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    this.activateTab(tab.id);
                    // タブクリック時は新しいタブを作成せず、適切なエディタにファイルを直接読み込み
                    window.app.currentFile = tab.file;
                    
                    if (tab.file.name.endsWith('.table.md')) {
                        // 表ファイルの場合は表エディタで開く
                        window.app.tableEditor.openFile(tab.file);
                    } else {
                        // 通常ファイルの場合は通常エディタで開く
                        window.app.editor.openFile(tab.file);
                    }
                }
            });
            
            tabList.appendChild(tabElement);
        });
    }
}

// ==================== Explorer ====================
class Explorer {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.isVisible = true;
    }

    render() {
        const container = document.getElementById('explorer-tree');
        if (!container) return;

        const games = this.dataManager.data.games;
        
        if (games.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>🎮 ゲームがありません</p>
                    <button class="btn btn-small" onclick="app.showCreateGameDialog()">
                        最初のゲームを作成
                    </button>
                </div>
            `;
            return;
        }

        let html = '';
        games.forEach(game => {
            html += this.renderGameNode(game);
        });
        
        container.innerHTML = html;
    }

    renderGameNode(game, level = 0) {
        const gameId = `game_${game.id}`;
        const isExpanded = this.getNodeState(gameId);
        const indent = '  '.repeat(level);
        
        let html = `
            <div class="tree-node game-node" style="padding-left: ${level * 16}px;">
                <div class="node-header" onclick="app.toggleNode('${gameId}')">
                    <span class="node-toggle ${isExpanded ? 'expanded' : ''}">${isExpanded ? '▼' : '▶'}</span>
                    <span class="node-icon">🎮</span>
                    <span class="node-label">${game.name}</span>
                    <div class="node-actions">
                        <button class="btn-icon" onclick="app.showCreateCharacterDialog('${game.id}')" title="キャラクター追加">👤➕</button>
                        <button class="btn-icon" onclick="app.deleteGame('${game.id}')" title="削除">🗑️</button>
                    </div>
                </div>
        `;

        if (isExpanded && game.characters.length > 0) {
            game.characters.forEach(character => {
                html += this.renderCharacterNode(game, character, level + 1);
            });
        }

        html += '</div>';
        return html;
    }

    renderCharacterNode(game, character, level = 1) {
        const charId = `char_${character.id}`;
        const isExpanded = this.getNodeState(charId);
        
        let html = `
            <div class="tree-node character-node" style="padding-left: ${level * 16}px;">
                <div class="node-header" onclick="app.toggleNode('${charId}')">
                    <span class="node-toggle ${isExpanded ? 'expanded' : ''}">${isExpanded ? '▼' : '▶'}</span>
                    <span class="node-icon">👤</span>
                    <span class="node-label">${character.name}</span>
                    <div class="node-actions">
                        <button class="btn-icon" onclick="app.showCreateCategoryDialog('${game.id}', '${character.id}')" title="カテゴリ追加">📁➕</button>
                        <button class="btn-icon" onclick="app.deleteCharacter('${game.id}', '${character.id}')" title="削除">🗑️</button>
                    </div>
                </div>
        `;

        if (isExpanded && character.categories.length > 0) {
            character.categories.forEach(category => {
                html += this.renderCategoryNode(game, character, category, level + 1);
            });
        }

        html += '</div>';
        return html;
    }

    renderCategoryNode(game, character, category, level = 2) {
        const catId = `cat_${category.id}`;
        const isExpanded = this.getNodeState(catId);
        
        let html = `
            <div class="tree-node category-node" style="padding-left: ${level * 16}px;">
                <div class="node-header" onclick="app.toggleNode('${catId}')">
                    <span class="node-toggle ${isExpanded ? 'expanded' : ''}">${isExpanded ? '▼' : '▶'}</span>
                    <span class="node-icon">📁</span>
                    <span class="node-label">${category.name}</span>
                    <div class="node-actions">
                        <button class="btn-icon" onclick="app.showCreateFileDialog('${game.id}', '${character.id}', '${category.id}')" title="ファイル追加">📄➕</button>
                        <button class="btn-icon" onclick="app.deleteCategory('${game.id}', '${character.id}', '${category.id}')" title="削除">🗑️</button>
                    </div>
                </div>
        `;

        if (isExpanded && category.files.length > 0) {
            category.files.forEach(file => {
                html += this.renderFileNode(file, level + 1);
            });
        }

        html += '</div>';
        return html;
    }

    renderFileNode(file, level = 3) {
        return `
            <div class="tree-node file-node" style="padding-left: ${level * 16}px;">
                <div class="node-header" onclick="app.openFile({id: '${file.id}', name: '${file.name}', content: \`${file.content.replace(/`/g, '\\`')}\`})">
                    <span class="node-icon">📄</span>
                    <span class="node-label">${file.name}</span>
                    <div class="node-actions">
                        <button class="btn-icon" onclick="app.deleteFile('${file.id}')" title="削除">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }

    getNodeState(nodeId) {
        const stored = localStorage.getItem(`explorer_node_${nodeId}`);
        return stored === 'true';
    }

    setNodeState(nodeId, expanded) {
        localStorage.setItem(`explorer_node_${nodeId}`, expanded.toString());
    }

    toggle() {
        this.isVisible = !this.isVisible;
        console.log(`🔍 Explorer toggle: isVisible = ${this.isVisible}`);
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.display = this.isVisible ? 'block' : 'none';
            console.log(`📁 Sidebar display set to: ${sidebar.style.display}`);
        } else {
            console.error('❌ Sidebar element not found');
        }
    }
}

// ==================== TableEditor ====================
class TableEditor {
    constructor() {
        this.currentFile = null;
        this.tableData = [];
        this.autoSaveTimer = null;
    }

    openFile(file) {
        this.currentFile = file;
        this.parseTableContent(file.content);
        this.showTableEditor();
        this.renderTable();
        this.startAutoSave();
    }

    parseTableContent(content) {
        // Markdownテーブルをパース
        const lines = content.split('\n').filter(line => line.trim().startsWith('|'));
        this.tableData = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('---')) continue; // 区切り行をスキップ
            
            const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
            this.tableData.push(cells);
        }
        
        // 最低限のサイズを確保
        if (this.tableData.length === 0) {
            this.tableData = [
                ['列1', '列2', '列3'],
                ['', '', ''],
                ['', '', '']
            ];
        }
    }

    showTableEditor() {
        // ダッシュボードを隠す
        const dashboard = document.getElementById('dashboard-content');
        if (dashboard) {
            dashboard.style.display = 'none';
        }

        // 通常エディタを隠す
        const editor = document.getElementById('editor-content');
        if (editor) {
            editor.style.display = 'none';
        }

        // 表エディタを表示
        let tableEditor = document.getElementById('table-editor-content');
        if (!tableEditor) {
            tableEditor = this.createTableEditorElement();
        }
        tableEditor.style.display = 'block';
    }

    createTableEditorElement() {
        const contentArea = document.getElementById('content-area');
        const tableEditorHtml = `
            <div class="tab-content table-editor-content" id="table-editor-content">
                <div class="table-editor-toolbar">
                    <button class="btn-icon" onclick="app.saveCurrentFile()" title="保存 (Ctrl+S)">💾</button>
                    <div class="table-controls">
                        <button class="btn btn-sm" onclick="app.tableEditor.addRow()">➕ 行追加</button>
                        <button class="btn btn-sm" onclick="app.tableEditor.addColumn()">➕ 列追加</button>
                        <button class="btn btn-sm" onclick="app.tableEditor.removeRow()">➖ 行削除</button>
                        <button class="btn btn-sm" onclick="app.tableEditor.removeColumn()">➖ 列削除</button>
                    </div>
                </div>
                <div class="table-editor-container" id="table-editor-container">
                    <!-- 表がここに動的に生成される -->
                </div>
            </div>
        `;
        
        contentArea.insertAdjacentHTML('beforeend', tableEditorHtml);
        return document.getElementById('table-editor-content');
    }

    renderTable() {
        const container = document.getElementById('table-editor-container');
        if (!container || !this.tableData) return;

        let html = '<table class="table-editor-table"><tbody>';
        for (let i = 0; i < this.tableData.length; i++) {
            html += '<tr>';
            for (let j = 0; j < this.tableData[i].length; j++) {
                html += `<td>
                    <textarea 
                        data-row="${i}" 
                        data-col="${j}" 
                        placeholder="${i === 0 ? '列ヘッダー' : '内容を入力...'}" 
                        onchange="app.tableEditor.updateCell(${i}, ${j}, this.value)"
                        oninput="app.tableEditor.updateCell(${i}, ${j}, this.value)"
                    >${this.tableData[i][j] || ''}</textarea>
                </td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        
        container.innerHTML = html;
    }

    updateCell(row, col, value) {
        if (this.tableData[row]) {
            this.tableData[row][col] = value;
            this.scheduleAutoSave();
        }
    }

    addRow() {
        const cols = this.tableData[0] ? this.tableData[0].length : 3;
        const newRow = new Array(cols).fill('');
        this.tableData.push(newRow);
        this.renderTable();
        this.scheduleAutoSave();
    }

    addColumn() {
        this.tableData.forEach(row => row.push(''));
        this.renderTable();
        this.scheduleAutoSave();
    }

    removeRow() {
        if (this.tableData.length > 1) {
            this.tableData.pop();
            this.renderTable();
            this.scheduleAutoSave();
        }
    }

    removeColumn() {
        if (this.tableData[0] && this.tableData[0].length > 1) {
            this.tableData.forEach(row => row.pop());
            this.renderTable();
            this.scheduleAutoSave();
        }
    }

    getContent() {
        // 表データをMarkdown形式に変換
        if (!this.tableData || this.tableData.length === 0) return '';
        
        let content = '';
        
        // ヘッダー行
        content += '| ' + this.tableData[0].join(' | ') + ' |\n';
        // 区切り行
        content += '| ' + this.tableData[0].map(() => '---').join(' | ') + ' |\n';
        // データ行
        for (let i = 1; i < this.tableData.length; i++) {
            content += '| ' + this.tableData[i].join(' | ') + ' |\n';
        }
        
        return content;
    }

    async save() {
        if (!this.currentFile) return;

        const content = this.getContent();
        this.currentFile.content = content;

        try {
            await window.app.dataManager.updateFile(this.currentFile.id, this.currentFile.name, content);
            console.log(`💾 表ファイル「${this.currentFile.name}」を保存しました`);
        } catch (error) {
            console.error('保存エラー:', error);
            alert('ファイルの保存に失敗しました');
        }
    }

    startAutoSave() {
        this.stopAutoSave();
        this.autoSaveTimer = setInterval(() => {
            this.save();
        }, 3000); // 3秒間隔で自動保存
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    scheduleAutoSave() {
        // 即座に自動保存をスケジュール
        this.stopAutoSave();
        this.startAutoSave();
    }
}

// ==================== Editor ====================
class Editor {
    constructor() {
        this.currentFile = null;
        this.autoSaveTimer = null;
    }

    openFile(file) {
        this.currentFile = file;
        this.showEditor();
        this.loadContent(file.content);
        this.startAutoSave();
    }

    showEditor() {
        // ダッシュボードを隠す
        const dashboard = document.getElementById('dashboard-content');
        if (dashboard) {
            dashboard.style.display = 'none';
        }

        // 表エディタを隠す
        const tableEditor = document.getElementById('table-editor-content');
        if (tableEditor) {
            tableEditor.style.display = 'none';
        }

        // エディタを表示
        let editor = document.getElementById('editor-content');
        if (!editor) {
            editor = this.createEditorElement();
        }
        editor.style.display = 'block';
    }

    createEditorElement() {
        const contentArea = document.getElementById('content-area');
        const editorHtml = `
            <div class="tab-content editor-content" id="editor-content">
                <div class="editor-toolbar">
                    <button class="btn-icon" onclick="app.saveCurrentFile()" title="保存 (Ctrl+S)">💾</button>
                    <button class="btn-icon" onclick="app.toggleBold()" title="太字 (Ctrl+B)"><strong>B</strong></button>
                    <button class="btn-icon" onclick="app.toggleItalic()" title="斜体 (Ctrl+I)"><em>I</em></button>
                    <button class="btn-icon" onclick="app.toggleUnderline()" title="下線 (Ctrl+U)"><u>U</u></button>
                    <button class="btn-icon" onclick="app.toggleHeading(1)" title="見出し1 (Ctrl+1)">H1</button>
                    <button class="btn-icon" onclick="app.toggleHeading(2)" title="見出し2 (Ctrl+2)">H2</button>
                    <button class="btn-icon" onclick="app.toggleHeading(3)" title="見出し3 (Ctrl+3)">H3</button>
                    <button class="btn-icon" onclick="app.createLink()" title="リンク (Ctrl+L)">🔗</button>
                    <button class="btn-icon" onclick="app.insertTable()" title="表 (Ctrl+T)">📋</button>
                </div>
                <div class="editor-main">
                    <div class="editor-area" id="editor-area" contenteditable="true"></div>
                </div>
            </div>
        `;
        contentArea.insertAdjacentHTML('beforeend', editorHtml);
        return document.getElementById('editor-content');
    }

    loadContent(content) {
        const editorArea = document.getElementById('editor-area');
        if (editorArea) {
            // Markdownコンテンツを簡単なHTMLに変換
            editorArea.innerHTML = this.markdownToHTML(content);
        }
    }

    markdownToHTML(markdown) {
        return markdown
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    getCurrentContent() {
        const editorArea = document.getElementById('editor-area');
        if (!editorArea) return '';
        
        // HTMLをMarkdownに変換
        return this.htmlToMarkdown(editorArea.innerHTML);
    }

    htmlToMarkdown(html) {
        return html
            .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
            .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
            .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<br>/g, '\n');
    }

    async save() {
        if (!this.currentFile) return;
        
        const content = this.getCurrentContent();
        await window.app.dataManager.updateFile(this.currentFile.id, content);
        this.currentFile.content = content;
        
        console.log('ファイルを保存しました');
    }

    startAutoSave() {
        this.stopAutoSave();
        this.autoSaveTimer = setInterval(() => {
            this.save();
        }, 3000);
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
}

// ==================== ExtendedKeyboard ====================
class ExtendedKeyboard {
    constructor() {
        this.isVisible = false;
        this.currentCategory = 'symbols';
        this.keyboardDefinitions = this.getDefaultDefinitions();
    }

    getDefaultDefinitions() {
        return {
            symbols: [
                { text: '→', color: 'gray' },
                { text: '↓', color: 'gray' },
                { text: '←', color: 'gray' },
                { text: '↑', color: 'gray' },
                { text: '↘', color: 'gray' },
                { text: '↙', color: 'gray' },
                { text: '↖', color: 'gray' },
                { text: '↗', color: 'gray' }
            ],
            buttons: [
                { text: 'LP', color: 'orange' },
                { text: 'MP', color: 'orange' },
                { text: 'HP', color: 'orange' },
                { text: 'LK', color: 'orange' },
                { text: 'MK', color: 'orange' },
                { text: 'HK', color: 'orange' }
            ],
            special: [
                { text: '波動拳', color: 'red' },
                { text: '昇竜拳', color: 'red' },
                { text: '竜巻旋風脚', color: 'red' },
                { text: 'パリィ', color: 'purple' },
                { text: 'ドライブインパクト', color: 'purple' }
            ]
        };
    }

    toggle() {
        this.isVisible = !this.isVisible;
        console.log(`🔍 ExtendedKeyboard toggle: isVisible = ${this.isVisible}`);
        this.render();
    }

    render() {
        let container = document.getElementById('extended-keyboard');
        const mainArea = document.querySelector('.main-area');
        
        if (!this.isVisible) {
            if (container) {
                container.classList.remove('visible');
                // メインエリアのクラスを削除
                if (mainArea) {
                    mainArea.classList.remove('keyboard-open');
                }
                // アニメーション完了後に削除
                setTimeout(() => {
                    if (!this.isVisible && container.parentNode) {
                        container.remove();
                    }
                }, 300);
            }
            return;
        }

        if (!container) {
            container = document.createElement('div');
            container.id = 'extended-keyboard';
            container.className = 'extended-keyboard';
            document.body.appendChild(container);
        }

        container.innerHTML = `
            <div class="keyboard-header">
                <h3>⌨️ 拡張キーボード</h3>
                <button class="btn-icon" onclick="app.toggleExtendedKeyboard()">✕</button>
            </div>
            <div class="keyboard-categories">
                <button class="category-btn ${this.currentCategory === 'symbols' ? 'active' : ''}" 
                        onclick="app.setKeyboardCategory('symbols')">記号</button>
                <button class="category-btn ${this.currentCategory === 'buttons' ? 'active' : ''}" 
                        onclick="app.setKeyboardCategory('buttons')">ボタン</button>
                <button class="category-btn ${this.currentCategory === 'special' ? 'active' : ''}" 
                        onclick="app.setKeyboardCategory('special')">技</button>
            </div>
            <div class="keyboard-buttons">
                ${this.renderButtons()}
            </div>
        `;

        // メインエリアにクラスを追加してキーボード用スペースを確保
        if (mainArea) {
            mainArea.classList.add('keyboard-open');
        }

        // アニメーション用にvisibleクラスを追加
        setTimeout(() => {
            if (container && this.isVisible) {
                container.classList.add('visible');
            }
        }, 10);
    }

    renderButtons() {
        const buttons = this.keyboardDefinitions[this.currentCategory] || [];
        return buttons.map(button => 
            `<button class="keyboard-btn ${button.color}" onclick="app.insertText('${button.text}')">${button.text}</button>`
        ).join('');
    }

    setCategory(category) {
        this.currentCategory = category;
        this.render();
    }

    insertText(text) {
        const editorArea = document.getElementById('editor-area');
        if (editorArea && editorArea === document.activeElement) {
            document.execCommand('insertText', false, text);
        }
    }
}

// ==================== KakuMemoApp (Main Application) ====================
class KakuMemoApp {
    constructor() {
        this.dataManager = new DataManager();
        this.tabManager = new TabManager();
        this.explorer = null;
        this.extendedKeyboard = null;
        this.editor = null;
        this.tableEditor = null;
        this.currentFile = null;
        
        this.init();
    }

    async init() {
        console.log('🎮 格Memo2 Proto7 初期化中...');
        
        try {
            // データマネージャー初期化
            await this.dataManager.init();
            
            // コンポーネント初期化
            this.explorer = new Explorer(this.dataManager);
            this.extendedKeyboard = new ExtendedKeyboard();
            this.editor = new Editor();
            this.tableEditor = new TableEditor();
            
            // イベントリスナー設定
            this.setupEventListeners();
            
            // 初期サンプルデータ作成
            await this.dataManager.createSampleData();
            
            // ダッシュボード表示
            this.showDashboard();
            
            console.log('✅ 格Memo2 Proto7 初期化完了');
        } catch (error) {
            console.error('❌ アプリケーション初期化エラー:', error);
        }
    }

    setupEventListeners() {
        // エクスプローラ切り替えボタン
        const explorerToggleBtn = document.getElementById('explorer-toggle-btn');
        if (explorerToggleBtn) {
            explorerToggleBtn.addEventListener('click', () => {
                console.log('🖱️ Explorer toggle button clicked');
                this.toggleExplorer();
            });
        } else {
            console.error('❌ Explorer toggle button not found');
        }

        // 拡張キーボード切り替えボタン
        const toggleKeyboardBtn = document.getElementById('toggle-keyboard-btn');
        if (toggleKeyboardBtn) {
            toggleKeyboardBtn.addEventListener('click', () => {
                console.log('🖱️ Extended keyboard toggle button clicked');
                this.toggleExtendedKeyboard();
            });
        } else {
            console.error('❌ Extended keyboard toggle button not found');
        }

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentFile();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.showCreateFileDialog();
                        break;
                    case 'k':
                        e.preventDefault();
                        this.toggleExtendedKeyboard();
                        break;
                    case 't':
                        e.preventDefault();
                        this.insertTable();
                        break;
                    case 'E':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.toggleExplorer();
                        }
                        break;
                }
            }
        });
    }

    // ========== ダッシュボード関連 ==========
    showDashboard() {
        // 全ファイルタブを非アクティブに
        this.tabManager.tabs.forEach(tab => {
            tab.isActive = false;
        });
        this.tabManager.activeTabId = null;

        // ダッシュボードタブをアクティブに
        const dashboardTab = document.getElementById('dashboard-tab');
        if (dashboardTab) {
            dashboardTab.classList.add('active');
        }

        // 全ファイルタブの見た目を非アクティブに
        document.querySelectorAll('.tab[data-tab^="tab_"]').forEach(tab => {
            tab.classList.remove('active');
        });

        // エディタを隠す
        const editor = document.getElementById('editor-content');
        if (editor) {
            editor.style.display = 'none';
        }

        // ダッシュボードを表示
        const dashboard = document.getElementById('dashboard-content');
        if (dashboard) {
            dashboard.style.display = 'block';
        }

        // エクスプローラを更新
        this.refreshExplorer();
        
        // 統計を更新
        this.updateStats();
    }

    updateStats() {
        // 統計情報を更新
        const totalFiles = this.dataManager.data.files.length;
        const totalGames = this.dataManager.data.games.length;
        const totalChars = this.dataManager.data.files.reduce((sum, file) => sum + file.content.length, 0);

        document.getElementById('total-files').textContent = totalFiles;
        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('total-chars').textContent = totalChars.toLocaleString();
    }

    // ========== ファイル関連 ==========
    openFile(file) {
        this.currentFile = file;
        
        // ファイルの種類を判定
        if (file.name.endsWith('.table.md')) {
            // 表専用エディタで開く
            this.openTableEditor(file);
        } else {
            // 通常エディタで開く
            this.editor.openFile(file);
        }
        
        // タブを作成
        this.tabManager.createTab(file);
    }

    openTableEditor(file) {
        this.tableEditor.openFile(file);
    }

    async saveCurrentFile() {
        // 現在アクティブなエディタを判定して保存
        const tableEditorContent = document.getElementById('table-editor-content');
        const editorContent = document.getElementById('editor-content');
        
        if (tableEditorContent && tableEditorContent.style.display !== 'none') {
            // 表エディタがアクティブ
            if (this.tableEditor) {
                await this.tableEditor.save();
                console.log('💾 表ファイルを保存しました');
            }
        } else if (editorContent && editorContent.style.display !== 'none') {
            // 通常エディタがアクティブ
            if (this.editor) {
                await this.editor.save();
                console.log('💾 ファイルを保存しました');
            }
        }
    }

    closeTab(tabId) {
        this.tabManager.closeTab(tabId);
        
        // アクティブタブがない場合はダッシュボードを表示
        if (!this.tabManager.activeTabId) {
            this.showDashboard();
        }
    }

    // ========== ダイアログ関連 ==========
    async loadTableTemplates() {
        // テンプレートファイルの情報を定義（ファイルアクセス制限のため、内容を直接定義）
        const templates = [
            { 
                name: 'カスタム', 
                filename: '', 
                description: '行数・列数を指定して作成',
                content: ''
            },
            { 
                name: 'ベーシック', 
                filename: 'basic.md', 
                description: '3列の基本テーブル',
                content: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n|     |     |     |\n|     |     |     |'
            },
            { 
                name: 'コンボ', 
                filename: 'combo.md', 
                description: 'コンボレシピ用テーブル',
                content: '| レシピ | ダメージ | 位置 | ストック | Dゲージ | SAゲージ | 状況 | 備考 |\n| ------ | -------- | ---- | -------- | ------- | -------- | ---- | ---- |\n|        |          |      |          |         |          |      |      |'
            },
            { 
                name: 'フレームデータ', 
                filename: 'frame-data.md', 
                description: '技のフレームデータ用',
                content: '| 技名 | ダメージ | 発生 | 持続 | 復帰 | ガード | キャンセル |\n| ---- | -------- | ---- | ---- | ---- | ------ | --------- |\n|      |          |      |      |      |        |           |\n|      |          |      |      |      |        |           |'
            },
            { 
                name: '起き攻め', 
                filename: 'okizeme.md', 
                description: '起き攻めセットプレイ用',
                content: '| 起き攻め状況 | セットプレイ | 成功時 | ガード時 | 失敗時 | 難易度 |\n| ------------ | ------------ | ------ | -------- | ------ | ------ |\n|              |              |        |          |        |        |\n|              |              |        |          |        |        |'
            }
        ];

        console.log('📋 テンプレートを読み込みました:', templates.length, '個');
        return templates;
    }
    showCreateGameDialog() {
        const name = prompt('ゲーム名を入力してください:');
        if (name && name.trim()) {
            this.dataManager.createGame(name.trim()).then(() => {
                this.refreshExplorer();
                console.log(`🎮 新しいゲーム「${name}」を作成しました`);
            });
        }
    }

    showCreateCharacterDialog(gameId) {
        const name = prompt('キャラクター名を入力してください:');
        if (name && name.trim()) {
            this.dataManager.createCharacter(gameId, name.trim()).then(() => {
                this.refreshExplorer();
                console.log(`👤 新しいキャラクター「${name}」を作成しました`);
            });
        }
    }

    showCreateCategoryDialog(gameId, characterId) {
        const name = prompt('カテゴリ名を入力してください:');
        if (name && name.trim()) {
            this.dataManager.createCategory(gameId, characterId, name.trim()).then(() => {
                this.refreshExplorer();
                console.log(`📁 新しいカテゴリ「${name}」を作成しました`);
            });
        }
    }

    showCreateFileDialog(gameId = null, characterId = null, categoryId = null) {
        // ファイル作成ダイアログを表示
        const dialog = document.createElement('div');
        dialog.id = 'create-file-dialog';
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📄 新しいファイル作成</h3>
                    <button class="btn-icon" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="file-name">ファイル名:</label>
                        <input type="text" id="file-name" placeholder="ファイル名を入力">
                    </div>
                    <div class="form-group">
                        <label for="file-type">ファイルタイプ:</label>
                        <select id="file-type" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: white; min-height: 32px;">
                            <option value="normal">通常ファイル (.md)</option>
                            <option value="table">表ファイル (.table.md)</option>
                        </select>
                    </div>
                    <div class="form-group" id="table-template-section" style="display: none; visibility: visible; opacity: 1; transition: opacity 0.3s;">
                        <label for="table-template">テンプレート:</label>
                        <select id="table-template" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: white; min-height: 32px; display: block; visibility: visible; opacity: 1;">
                            <option value="">テンプレートを読み込み中...</option>
                        </select>
                        <div id="template-description" style="margin-top: 8px; font-size: 0.9em; color: #666; min-height: 20px; padding: 4px 8px; background: #f5f5f5; border-radius: 4px; display: none; visibility: visible; opacity: 1;"></div>
                    </div>
                    <div class="form-group" id="table-dimensions" style="display: none;">
                        <div style="display: flex; gap: 16px;">
                            <div>
                                <label for="initial-rows">初期行数:</label>
                                <input type="number" id="initial-rows" min="2" max="20" value="3">
                            </div>
                            <div>
                                <label for="initial-cols">初期列数:</label>
                                <input type="number" id="initial-cols" min="2" max="10" value="3">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">キャンセル</button>
                    <button class="btn btn-primary" onclick="app.createFileFromDialog('${gameId}', '${characterId}', '${categoryId}')">作成</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // ファイルタイプ切り替え時の処理
        const fileTypeSelect = dialog.querySelector('#file-type');
        const tableTemplateSection = dialog.querySelector('#table-template-section');
        const tableDimensions = dialog.querySelector('#table-dimensions');
        
        // ファイルタイプ選択時のイベント設定
        fileTypeSelect.addEventListener('change', async () => {
            console.log(`ファイルタイプ変更: ${fileTypeSelect.value}`);
            if (fileTypeSelect.value === 'table') {
                // 表ファイル選択時は完全に可視化
                tableTemplateSection.style.display = 'block';
                tableTemplateSection.style.visibility = 'visible';
                tableTemplateSection.style.opacity = '1';
                
                // テンプレート読み込み
                await this.loadAndSetupTemplates();
            } else {
                tableTemplateSection.style.opacity = '0';
                setTimeout(() => {
                    tableTemplateSection.style.display = 'none';
                    tableDimensions.style.display = 'none';
                }, 300);
            }
        });

        // ダイアログが開いた時点でテンプレートを事前読み込み
        setTimeout(async () => {
            console.log('事前テンプレート読み込み開始');
            console.log('ダイアログHTML:', dialog.innerHTML.substring(0, 200) + '...');
            console.log('ファイルタイプセレクト存在:', !!fileTypeSelect);
            console.log('テンプレートセクション存在:', !!tableTemplateSection);
            
            await this.loadAndSetupTemplates();
            
            // 表ファイルが既に選択されているかチェック
            console.log('ファイルタイプ選択値:', fileTypeSelect?.value);
            
            if (fileTypeSelect && fileTypeSelect.value === 'table') {
                console.log('表ファイルが選択済み - テンプレートセクションを表示');
                tableTemplateSection.style.display = 'block';
                tableTemplateSection.style.visibility = 'visible';
                tableTemplateSection.style.opacity = '1';
            }
        }, 200);

        // フォーカスをファイル名入力に設定
        setTimeout(() => {
            document.getElementById('file-name').focus();
        }, 100);
    }

    async loadAndSetupTemplates() {
        console.log('🔄 loadAndSetupTemplates開始');
        
        const templateSelect = document.getElementById('table-template');
        const templateDescription = document.getElementById('template-description');
        const tableDimensions = document.getElementById('table-dimensions');

        if (!templateSelect) {
            console.error('❌ テンプレートセレクトボックスが見つかりません');
            // 少し待ってから再試行
            setTimeout(() => {
                this.loadAndSetupTemplates();
            }, 200);
            return;
        }

        try {
            console.log('📋 テンプレートを読み込み中...');
            const templates = await this.loadTableTemplates();
            
            // セレクトボックスをクリア
            templateSelect.innerHTML = '';
            
            // テンプレートオプションを追加
            templates.forEach((template, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = template.name;
                templateSelect.appendChild(option);
            });

            console.log(`📋 ${templates.length}個のテンプレートを読み込み完了`);

            // セレクトボックスを強制的に可視化
            templateSelect.style.display = 'block';
            templateSelect.style.visibility = 'visible';
            templateSelect.style.opacity = '1';
            
            // 親要素のテンプレートセクションも確実に可視化
            const templateSection = templateSelect.closest('#table-template-section');
            if (templateSection) {
                templateSection.style.display = 'block';
                templateSection.style.visibility = 'visible';
                templateSection.style.opacity = '1';
            }

            // テンプレート選択時の処理（イベントリスナーを再設定）
            templateSelect.onchange = () => {
                const selectedIndex = templateSelect.value;
                console.log(`テンプレート選択: インデックス ${selectedIndex}`);
                if (selectedIndex !== '') {
                    const selectedTemplate = templates[selectedIndex];
                    if (templateDescription) {
                        templateDescription.textContent = selectedTemplate.description;
                        templateDescription.style.display = 'block';
                        templateDescription.style.visibility = 'visible';
                        templateDescription.style.opacity = '1';
                    }
                    
                    // カスタムテンプレートの場合は寸法入力を表示
                    if (selectedTemplate.name === 'カスタム') {
                        if (tableDimensions) {
                            tableDimensions.style.display = 'block';
                            tableDimensions.style.visibility = 'visible';
                            tableDimensions.style.opacity = '1';
                        }
                    } else {
                        if (tableDimensions) {
                            tableDimensions.style.display = 'none';
                        }
                    }
                } else {
                    if (templateDescription) {
                        templateDescription.textContent = '';
                        templateDescription.style.display = 'none';
                    }
                }
            };

            // デフォルトでベーシックテンプレートを選択
            templateSelect.value = '1'; // ベーシックテンプレートのインデックス
            
            // changeイベントを手動で発火
            if (templateSelect.onchange) {
                templateSelect.onchange();
            }

            console.log('✅ テンプレートセットアップ完了');

        } catch (error) {
            console.error('❌ テンプレートの読み込みに失敗:', error);
            templateSelect.innerHTML = '<option value="">テンプレートの読み込みに失敗しました</option>';
        }
    }

    async createFileFromDialog(gameId, characterId, categoryId) {
        const fileName = document.getElementById('file-name').value.trim();
        const fileType = document.getElementById('file-type').value;
        
        if (!fileName) {
            alert('ファイル名を入力してください');
            return;
        }

        if (gameId && characterId && categoryId) {
            let content = '';
            let finalFileName = fileName;
            
            if (fileType === 'table') {
                // 表ファイルの場合は拡張子を.table.mdに
                if (!fileName.endsWith('.table.md')) {
                    finalFileName = fileName + '.table.md';
                }
                
                // テンプレートを使用してコンテンツを作成
                content = await this.createTableContentFromTemplate();
            } else {
                // 通常ファイルの場合は.mdに
                if (!fileName.endsWith('.md')) {
                    finalFileName = fileName + '.md';
                }
            }

            this.dataManager.createFile(gameId, characterId, categoryId, finalFileName, content).then((file) => {
                this.refreshExplorer();
                this.openFile(file);
                console.log(`📄 新しいファイル「${finalFileName}」を作成しました`);
                
                // ダイアログを閉じる
                document.getElementById('create-file-dialog').remove();
            });
        } else {
            console.log('⚠️ ファイル作成にはゲーム、キャラクター、カテゴリの選択が必要です');
        }
    }

    async createTableContentFromTemplate() {
        const templateSelect = document.getElementById('table-template');
        const selectedIndex = templateSelect.value;
        
        if (selectedIndex === '') {
            // テンプレートが選択されていない場合はデフォルトを使用
            return this.createInitialTableContent(3, 3);
        }

        try {
            const templates = await this.loadTableTemplates();
            const selectedTemplate = templates[selectedIndex];

            if (selectedTemplate.name === 'カスタム') {
                // カスタムテンプレートの場合は行数・列数から生成
                const rows = parseInt(document.getElementById('initial-rows').value) || 3;
                const cols = parseInt(document.getElementById('initial-cols').value) || 3;
                return this.createInitialTableContent(rows, cols);
            } else {
                // 定義済みテンプレートを使用
                return selectedTemplate.content || this.createInitialTableContent(3, 3);
            }
        } catch (error) {
            console.error('テンプレートコンテンツの生成に失敗:', error);
            return this.createInitialTableContent(3, 3);
        }
    }

    createInitialTableContent(rows, cols) {
        // 表ファイル用の初期コンテンツを作成
        let content = '';
        
        // ヘッダー行
        content += '| ' + Array(cols).fill('').map((_, i) => `列${i + 1}`).join(' | ') + ' |\n';
        // 区切り行
        content += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
        // データ行
        for (let i = 1; i < rows; i++) {
            content += '| ' + Array(cols).fill('').join(' | ') + ' |\n';
        }
        
        return content;
    }

    // ========== UI制御 ==========
    toggleExplorer() {
        if (this.explorer) {
            this.explorer.toggle();
            console.log('📁 エクスプローラの表示を切り替えました');
        }
    }

    toggleExtendedKeyboard() {
        if (this.extendedKeyboard) {
            this.extendedKeyboard.toggle();
            console.log('⌨️ 拡張キーボードの表示を切り替えました');
        }
    }

    setKeyboardCategory(category) {
        if (this.extendedKeyboard) {
            this.extendedKeyboard.setCategory(category);
        }
    }

    insertText(text) {
        if (this.extendedKeyboard) {
            this.extendedKeyboard.insertText(text);
        }
    }

    refreshExplorer() {
        if (this.explorer) {
            this.explorer.render();
        }
    }

    toggleNode(nodeId) {
        const currentState = this.explorer.getNodeState(nodeId);
        this.explorer.setNodeState(nodeId, !currentState);
        this.refreshExplorer();
    }

    // ========== 検索機能 ==========
    async performSearch(query) {
        if (!query.trim()) return;
        
        const results = await this.dataManager.search(query);
        console.log(`🔍 検索結果: ${results.length}件`);
        
        // 検索結果の表示処理をここに追加
    }

    // ========== エディタ機能 ==========
    toggleBold() {
        document.execCommand('bold');
    }

    toggleItalic() {
        document.execCommand('italic');
    }

    toggleUnderline() {
        document.execCommand('underline');
    }

    toggleHeading(level) {
        document.execCommand('formatBlock', false, `h${level}`);
    }

    createLink() {
        const url = prompt('リンクURLを入力してください:');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    }

    insertTable() {
        this.showTableCreationDialog();
    }

    showTableCreationDialog() {
        // 既存のダイアログがあれば削除
        const existingDialog = document.getElementById('table-creation-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }

        const dialog = document.createElement('div');
        dialog.id = 'table-creation-dialog';
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📋 表の作成</h3>
                    <button class="btn-icon" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="table-rows">行数:</label>
                        <input type="number" id="table-rows" min="1" max="20" value="3">
                    </div>
                    <div class="form-group">
                        <label for="table-cols">列数:</label>
                        <input type="number" id="table-cols" min="1" max="10" value="3">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">キャンセル</button>
                    <button class="btn btn-primary" onclick="app.createTableFromDialog()">作成</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // フォーカスを行数入力に設定
        setTimeout(() => {
            const rowsInput = document.getElementById('table-rows');
            rowsInput.focus();
            
            // Enterキーで作成できるようにする
            dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    app.createTableFromDialog();
                }
            });
        }, 100);
    }

    createTableFromDialog() {
        const rows = parseInt(document.getElementById('table-rows').value);
        const cols = parseInt(document.getElementById('table-cols').value);
        
        if (rows && cols && rows > 0 && cols > 0) {
            let table = '<table class="editor-table"><tbody>';
            for (let i = 0; i < rows; i++) {
                table += '<tr>';
                for (let j = 0; j < cols; j++) {
                    table += '<td></td>'; // 空のセル
                }
                table += '</tr>';
            }
            table += '</tbody></table>';
            
            document.execCommand('insertHTML', false, table);
            
            // ダイアログを閉じる
            document.getElementById('table-creation-dialog').remove();
            
            console.log(`📋 ${rows}×${cols}の表を作成しました`);
        }
    }

    // ========== データ管理 ==========
    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    this.dataManager.data = { ...this.dataManager.data, ...data };
                    await this.dataManager.saveData();
                    this.refreshExplorer();
                    this.showDashboard();
                    console.log('📥 データをインポートしました');
                } catch (error) {
                    console.error('インポートエラー:', error);
                    alert('データのインポートに失敗しました');
                }
            }
        };
        input.click();
    }

    async exportData() {
        try {
            const data = JSON.stringify(this.dataManager.data, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'kakumemo2_backup.json';
            a.click();
            
            URL.revokeObjectURL(url);
            console.log('📤 データをエクスポートしました');
        } catch (error) {
            console.error('エクスポートエラー:', error);
            alert('データのエクスポートに失敗しました');
        }
    }
}

// グローバルアプリインスタンス作成

// Google APIクライアントID（Google Cloud Consoleで取得してください）
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file profile email openid';

let isSignedIn = false;

function updateUIForAuth() {
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    if (isSignedIn) {
        loginContainer.style.display = 'none';
        appContainer.style.display = '';
    } else {
        loginContainer.style.display = '';
        appContainer.style.display = 'none';
    }
}

function handleAuthChange(signedIn) {
    isSignedIn = signedIn;
    updateUIForAuth();
    if (signedIn && !window.app) {
        window.app = new KakuMemoApp();
        console.log('🚀 アプリケーション開始');
    }
}

function initGoogleAuth() {
    gapi.load('client:auth2', async () => {
        await gapi.client.init({
            clientId: GOOGLE_CLIENT_ID,
            discoveryDocs: GOOGLE_DISCOVERY_DOCS,
            scope: GOOGLE_SCOPES
        });
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(handleAuthChange);
        // Handle the initial sign-in state.
        handleAuthChange(gapi.auth2.getAuthInstance().isSignedIn.get());
        // ボタンイベント
        const loginBtn = document.getElementById('google-login-btn');
        if (loginBtn) {
            loginBtn.onclick = () => gapi.auth2.getAuthInstance().signIn();
        }
    });
}

// Google APIスクリプトを動的に読み込む
function loadGapiScript() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = initGoogleAuth;
    document.body.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
    loadGapiScript();
    updateUIForAuth();
});
