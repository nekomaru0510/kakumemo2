/**
 * エクスプローラコンポーネント
 * VSCode風のファイルツリー表示
 */

export class Explorer {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.container = null;
        this.isVisible = true;
        this.expandedNodes = new Set();
        this.selectedNode = null;
    }

    /**
     * 初期化
     */
    async init() {
        this.container = document.getElementById('explorer-tree');
        if (!this.container) {
            console.error('Explorer container not found');
            return;
        }

        await this.render();
        this.setupEvents();
        
        console.log('Explorer initialized');
    }

    /**
     * エクスプローラ表示切り替え
     */
    toggle() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * エクスプローラ表示
     */
    show() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('hidden');
            this.isVisible = true;
        }
    }

    /**
     * エクスプローラ非表示
     */
    hide() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.add('hidden');
            this.isVisible = false;
        }
    }

    /**
     * 表示状態取得
     */
    getVisibility() {
        return this.isVisible;
    }

    /**
     * エクスプローラ再描画
     */
    async refresh() {
        await this.render();
    }

    /**
     * エクスプローラ描画
     */
    async render() {
        if (!this.container) return;

        try {
            const hierarchy = await this.dataManager.getHierarchy();
            this.container.innerHTML = '';
            
            if (hierarchy.length === 0) {
                this.container.innerHTML = `
                    <div class="empty-state">
                        <p>ゲームがありません</p>
                        <button class="btn" onclick="app.showCreateGameDialog()">
                            🎮 新しいゲームを作成
                        </button>
                    </div>
                `;
                return;
            }

            hierarchy.forEach(node => {
                this.renderNode(node, 0);
            });

        } catch (error) {
            console.error('Explorer render error:', error);
            this.container.innerHTML = '<div class="error">データの読み込みに失敗しました</div>';
        }
    }

    /**
     * ノード描画
     */
    renderNode(node, level) {
        const nodeElement = this.createNodeElement(node, level);
        this.container.appendChild(nodeElement);

        // 子ノードが展開されている場合は描画
        if (this.expandedNodes.has(node.id) && node.children && node.children.length > 0) {
            node.children.forEach(child => {
                this.renderNode(child, level + 1);
            });
        }
    }

    /**
     * ノード要素作成
     */
    createNodeElement(node, level) {
        const element = document.createElement('div');
        element.className = 'tree-node';
        element.dataset.nodeId = node.id;
        element.dataset.nodeType = node.type;
        element.style.setProperty('--indent-level', level);

        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = this.expandedNodes.has(node.id);
        const icon = this.getNodeIcon(node.type);
        const expandArrow = hasChildren ? (isExpanded ? '▼' : '▶') : '';

        element.innerHTML = `
            <div class="node-content">
                ${hasChildren ? `<span class="expand-arrow ${isExpanded ? 'expanded' : ''}">${expandArrow}</span>` : ''}
                <span class="node-icon">${icon}</span>
                <span class="node-name">${node.name}</span>
                <div class="node-actions">
                    ${this.getNodeActions(node.type, node.id)}
                </div>
            </div>
        `;

        return element;
    }

    /**
     * ノードアイコン取得
     */
    getNodeIcon(type) {
        const icons = {
            game: '🎮',
            character: '👤',
            category: '📁',
            file: '📄'
        };
        return icons[type] || '📄';
    }

    /**
     * ノードアクション取得
     */
    getNodeActions(type, nodeId) {
        const actions = {
            game: `
                <button class="btn-icon" onclick="app.explorer.addCharacter('${nodeId}')" title="キャラクター追加">👤➕</button>
                <button class="btn-icon" onclick="app.explorer.deleteNode('${nodeId}')" title="削除">🗑️</button>
            `,
            character: `
                <button class="btn-icon" onclick="app.explorer.addCategory('${nodeId}')" title="カテゴリ追加">📁➕</button>
                <button class="btn-icon" onclick="app.explorer.deleteNode('${nodeId}')" title="削除">🗑️</button>
            `,
            category: `
                <button class="btn-icon" onclick="app.explorer.addFile('${nodeId}')" title="ファイル追加">📄➕</button>
                <button class="btn-icon" onclick="app.explorer.deleteNode('${nodeId}')" title="削除">🗑️</button>
            `,
            file: `
                <button class="btn-icon" onclick="app.explorer.deleteNode('${nodeId}')" title="削除">🗑️</button>
            `
        };
        return actions[type] || '';
    }

    /**
     * イベント設定
     */
    setupEvents() {
        if (!this.container) return;

        this.container.addEventListener('click', (e) => {
            const nodeContent = e.target.closest('.node-content');
            if (!nodeContent) return;

            const treeNode = nodeContent.closest('.tree-node');
            if (!treeNode) return;

            const nodeId = treeNode.dataset.nodeId;
            const nodeType = treeNode.dataset.nodeType;

            // 展開矢印クリック
            if (e.target.classList.contains('expand-arrow')) {
                e.stopPropagation();
                this.toggleNode(nodeId);
                return;
            }

            // アクションボタンクリック（イベントバブリング停止）
            if (e.target.closest('.node-actions')) {
                e.stopPropagation();
                return;
            }

            // ノード選択
            this.selectNode(nodeId, nodeType);

            // ファイルの場合は開く
            if (nodeType === 'file') {
                window.app.openFile(nodeId);
            }
        });
    }

    /**
     * ノード展開/折りたたみ
     */
    async toggleNode(nodeId) {
        if (this.expandedNodes.has(nodeId)) {
            this.expandedNodes.delete(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }
        
        await this.render();
    }

    /**
     * ノード選択
     */
    selectNode(nodeId, nodeType) {
        // 前の選択を解除
        const prevSelected = this.container.querySelector('.node-content.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // 新しい選択
        const nodeElement = this.container.querySelector(`[data-node-id="${nodeId}"] .node-content`);
        if (nodeElement) {
            nodeElement.classList.add('selected');
            this.selectedNode = { id: nodeId, type: nodeType };
        }
    }

    /**
     * キャラクター追加
     */
    async addCharacter(gameId) {
        const name = prompt('キャラクター名を入力してください:');
        if (!name || !name.trim()) return;

        try {
            await this.dataManager.createCharacter(gameId, name.trim());
            await this.refresh();
            console.log(`キャラクター "${name}" を追加しました`);
        } catch (error) {
            console.error('キャラクター追加エラー:', error);
            alert('キャラクターの追加に失敗しました');
        }
    }

    /**
     * カテゴリ追加
     */
    async addCategory(characterId) {
        const name = prompt('カテゴリ名を入力してください:');
        if (!name || !name.trim()) return;

        try {
            await this.dataManager.createCategory(characterId, name.trim());
            await this.refresh();
            console.log(`カテゴリ "${name}" を追加しました`);
        } catch (error) {
            console.error('カテゴリ追加エラー:', error);
            alert('カテゴリの追加に失敗しました');
        }
    }

    /**
     * ファイル追加
     */
    async addFile(categoryId) {
        const title = prompt('ファイル名を入力してください:');
        if (!title || !title.trim()) return;

        try {
            const fileId = await this.dataManager.createFile(categoryId, title.trim());
            await this.refresh();
            
            // 作成したファイルを開く
            window.app.openFile(fileId);
            
            console.log(`ファイル "${title}" を追加しました`);
        } catch (error) {
            console.error('ファイル追加エラー:', error);
            alert('ファイルの追加に失敗しました');
        }
    }

    /**
     * ノード削除
     */
    async deleteNode(nodeId) {
        if (!confirm('削除してもよろしいですか？')) return;

        try {
            const nodeElement = this.container.querySelector(`[data-node-id="${nodeId}"]`);
            const nodeType = nodeElement?.dataset.nodeType;

            switch (nodeType) {
                case 'game':
                    await this.dataManager.deleteGame(nodeId);
                    break;
                case 'character':
                    // キャラクター削除は実装予定
                    console.log('キャラクター削除（実装予定）');
                    return;
                case 'category':
                    // カテゴリ削除は実装予定
                    console.log('カテゴリ削除（実装予定）');
                    return;
                case 'file':
                    await this.dataManager.deleteFile(nodeId);
                    break;
                default:
                    console.error('Unknown node type:', nodeType);
                    return;
            }

            await this.refresh();
            console.log('削除しました');
        } catch (error) {
            console.error('削除エラー:', error);
            alert('削除に失敗しました');
        }
    }

    /**
     * コンテキストメニュー表示
     */
    showContextMenu(nodeId, nodeType, x, y) {
        // 実装予定: 右クリックメニュー
        console.log('コンテキストメニュー（実装予定）', { nodeId, nodeType, x, y });
    }

    /**
     * ファイルドラッグ&ドロップ
     */
    setupDragAndDrop() {
        // 実装予定: ファイル並び替え
        console.log('ドラッグ&ドロップ（実装予定）');
    }

    /**
     * エクスプローラ検索
     */
    async searchInExplorer(query) {
        // 実装予定: エクスプローラ内検索
        console.log('エクスプローラ検索（実装予定）', query);
    }

    /**
     * エクスプローラ設定
     */
    getSettings() {
        return {
            isVisible: this.isVisible,
            expandedNodes: Array.from(this.expandedNodes),
            selectedNode: this.selectedNode
        };
    }

    /**
     * エクスプローラ設定復元
     */
    restoreSettings(settings) {
        if (settings.isVisible !== undefined) {
            this.isVisible = settings.isVisible;
        }
        
        if (settings.expandedNodes) {
            this.expandedNodes = new Set(settings.expandedNodes);
        }
        
        if (settings.selectedNode) {
            this.selectedNode = settings.selectedNode;
        }
    }
}
