/**
 * 拡張キーボードコンポーネント
 * 格闘ゲーム用語専用のバーチャルキーボード
 */

export class ExtendedKeyboard {
    constructor() {
        this.container = null;
        this.buttonsContainer = null;
        this.isVisible = false;
        this.currentCategory = 'all';
        this.currentGame = 'default';
        this.currentCharacter = null;
        
        // キーボード定義
        this.keyboardDefinitions = new Map();
        this.loadDefaultDefinitions();
    }

    /**
     * 初期化
     */
    async init() {
        this.container = document.getElementById('extended-keyboard');
        this.buttonsContainer = document.getElementById('keyboard-buttons');
        
        if (!this.container || !this.buttonsContainer) {
            console.error('ExtendedKeyboard containers not found');
            return;
        }

        this.setupEvents();
        await this.loadKeyboardDefinitions();
        this.render();
        
        console.log('ExtendedKeyboard initialized');
    }

    /**
     * デフォルト定義読み込み
     */
    loadDefaultDefinitions() {
        const defaultDefinitions = {
            '記号・操作': [
                { text: '→', color: 'gray' },
                { text: '←', color: 'gray' },
                { text: '↓', color: 'gray' },
                { text: '↑', color: 'gray' },
                { text: '↘', color: 'gray' },
                { text: '↙', color: 'gray' },
                { text: '↗', color: 'gray' },
                { text: '↖', color: 'gray' },
                { text: '⭕', color: 'gray' },
                { text: '+', color: 'gray' },
                { text: '〜', color: 'gray' },
                { text: '>', color: 'gray' }
            ],
            'ボタン表記': [
                { text: 'LP', color: 'orange' },
                { text: 'MP', color: 'orange' },
                { text: 'HP', color: 'orange' },
                { text: 'LK', color: 'orange' },
                { text: 'MK', color: 'orange' },
                { text: 'HK', color: 'orange' },
                { text: 'P', color: 'orange' },
                { text: 'K', color: 'orange' },
                { text: '弱P', color: 'orange' },
                { text: '中P', color: 'orange' },
                { text: '強P', color: 'orange' },
                { text: '弱K', color: 'orange' },
                { text: '中K', color: 'orange' },
                { text: '強K', color: 'orange' }
            ],
            '基本動作': [
                { text: 'ガード', color: 'yellow' },
                { text: 'ジャンプ', color: 'yellow' },
                { text: 'しゃがみ', color: 'yellow' },
                { text: '前進', color: 'yellow' },
                { text: '後退', color: 'yellow' },
                { text: 'ダッシュ', color: 'yellow' },
                { text: 'バックダッシュ', color: 'yellow' },
                { text: '投げ', color: 'yellow' },
                { text: '投げ抜け', color: 'yellow' }
            ],
            '通常技': [
                { text: '立ち弱P', color: 'blue' },
                { text: '立ち中P', color: 'blue' },
                { text: '立ち強P', color: 'blue' },
                { text: '屈弱P', color: 'blue' },
                { text: '屈中P', color: 'blue' },
                { text: '屈強P', color: 'blue' },
                { text: '立ち弱K', color: 'blue' },
                { text: '立ち中K', color: 'blue' },
                { text: '立ち強K', color: 'blue' },
                { text: '屈弱K', color: 'blue' },
                { text: '屈中K', color: 'blue' },
                { text: '屈強K', color: 'blue' }
            ],
            'ジャンプ攻撃': [
                { text: 'J弱P', color: 'green' },
                { text: 'J中P', color: 'green' },
                { text: 'J強P', color: 'green' },
                { text: 'J弱K', color: 'green' },
                { text: 'J中K', color: 'green' },
                { text: 'J強K', color: 'green' },
                { text: '垂直J', color: 'green' },
                { text: '前J', color: 'green' },
                { text: '後J', color: 'green' }
            ],
            'システム': [
                { text: 'ドライブインパクト', color: 'purple' },
                { text: 'パリィ', color: 'purple' },
                { text: 'ドライブラッシュ', color: 'purple' },
                { text: 'ドライブリバーサル', color: 'purple' },
                { text: 'パーフェクトパリィ', color: 'purple' },
                { text: 'ドライブゲージ', color: 'purple' },
                { text: 'バーンアウト', color: 'purple' }
            ],
            '必殺技': [
                { text: '波動拳', color: 'red' },
                { text: '昇竜拳', color: 'red' },
                { text: '竜巻旋風脚', color: 'red' },
                { text: 'ソニックブーム', color: 'red' },
                { text: 'サマーソルトキック', color: 'red' },
                { text: '百裂脚', color: 'red' },
                { text: '気功拳', color: 'red' }
            ],
            '超必殺技': [
                { text: '真空波動拳', color: 'gold' },
                { text: '神龍拳', color: 'gold' },
                { text: '真・昇竜拳', color: 'gold' },
                { text: 'ソニックハリケーン', color: 'gold' },
                { text: '鳳翼扇', color: 'gold' },
                { text: '覇山蹴', color: 'gold' }
            ],
            'コンボパーツ': [
                { text: 'キャンセル', color: 'teal' },
                { text: 'リンク', color: 'teal' },
                { text: 'チェーン', color: 'teal' },
                { text: '目押し', color: 'teal' },
                { text: 'カウンターヒット', color: 'teal' },
                { text: 'クラッシュカウンター', color: 'teal' },
                { text: '追撃', color: 'teal' },
                { text: '壁バウンド', color: 'teal' },
                { text: '受け身', color: 'teal' }
            ]
        };

        this.keyboardDefinitions.set('default', defaultDefinitions);
    }

    /**
     * キーボード定義読み込み
     */
    async loadKeyboardDefinitions() {
        // 実装予定: 外部ファイルからの定義読み込み
        console.log('キーボード定義読み込み（外部ファイル対応は実装予定）');
    }

    /**
     * イベント設定
     */
    setupEvents() {
        if (!this.container) return;

        // 閉じるボタン
        const closeBtn = document.getElementById('close-keyboard-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // 設定ボタン
        const settingsBtn = document.getElementById('keyboard-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // キーボードボタンクリック
        if (this.buttonsContainer) {
            this.buttonsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('keyboard-btn')) {
                    this.insertText(e.target.textContent);
                }
            });
        }

        // ESCキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * 表示切り替え
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 表示
     */
    show() {
        if (!this.container) return;

        this.container.classList.add('visible');
        this.container.style.display = 'block';
        this.isVisible = true;
        
        // フォーカス設定
        setTimeout(() => {
            this.container.focus();
        }, 100);
    }

    /**
     * 非表示
     */
    hide() {
        if (!this.container) return;

        this.container.classList.remove('visible');
        this.container.style.display = 'none';
        this.isVisible = false;
    }

    /**
     * レンダリング
     */
    render() {
        if (!this.buttonsContainer) return;

        this.buttonsContainer.innerHTML = '';
        
        const definitions = this.keyboardDefinitions.get(this.currentGame) || 
                          this.keyboardDefinitions.get('default');
        
        if (!definitions) return;

        // カテゴリ選択ボタン作成
        this.renderCategoryButtons(definitions);
        
        // キーボードボタン作成
        this.renderKeyboardButtons(definitions);
    }

    /**
     * カテゴリボタンレンダリング
     */
    renderCategoryButtons(definitions) {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'keyboard-categories';
        categoryContainer.style.marginBottom = '16px';
        categoryContainer.style.display = 'flex';
        categoryContainer.style.flexWrap = 'wrap';
        categoryContainer.style.gap = '8px';

        // 全て表示ボタン
        const allBtn = document.createElement('button');
        allBtn.className = 'btn';
        allBtn.textContent = '全て';
        allBtn.onclick = () => {
            this.currentCategory = 'all';
            this.render();
        };
        if (this.currentCategory === 'all') {
            allBtn.classList.add('btn-primary');
        }
        categoryContainer.appendChild(allBtn);

        // カテゴリボタン
        Object.keys(definitions).forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = category;
            btn.onclick = () => {
                this.currentCategory = category;
                this.render();
            };
            if (this.currentCategory === category) {
                btn.classList.add('btn-primary');
            }
            categoryContainer.appendChild(btn);
        });

        this.buttonsContainer.appendChild(categoryContainer);
    }

    /**
     * キーボードボタンレンダリング
     */
    renderKeyboardButtons(definitions) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'keyboard-button-grid';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexWrap = 'wrap';
        buttonContainer.style.gap = '8px';

        if (this.currentCategory === 'all') {
            // 全カテゴリ表示
            Object.entries(definitions).forEach(([category, buttons]) => {
                this.renderCategorySection(buttonContainer, category, buttons);
            });
        } else {
            // 特定カテゴリのみ表示
            const buttons = definitions[this.currentCategory] || [];
            buttons.forEach(button => {
                this.createKeyboardButton(buttonContainer, button);
            });
        }

        this.buttonsContainer.appendChild(buttonContainer);
    }

    /**
     * カテゴリセクションレンダリング
     */
    renderCategorySection(container, category, buttons) {
        // カテゴリラベル
        const label = document.createElement('div');
        label.className = 'category-label';
        label.textContent = category;
        label.style.width = '100%';
        label.style.fontSize = '12px';
        label.style.color = 'var(--text-muted)';
        label.style.marginTop = '8px';
        label.style.marginBottom = '4px';
        container.appendChild(label);

        // ボタン
        buttons.forEach(button => {
            this.createKeyboardButton(container, button);
        });
    }

    /**
     * キーボードボタン作成
     */
    createKeyboardButton(container, button) {
        const btn = document.createElement('button');
        btn.className = `keyboard-btn ${button.color}`;
        btn.textContent = button.text;
        btn.title = button.text;
        
        container.appendChild(btn);
    }

    /**
     * テキスト挿入
     */
    insertText(text) {
        // アクティブエディタに挿入
        const activeEditor = this.getActiveEditor();
        if (activeEditor) {
            activeEditor.insertText(text);
        } else {
            // フォーカスされている入力フィールドに挿入
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.contentEditable === 'true')) {
                if (activeElement.contentEditable === 'true') {
                    document.execCommand('insertText', false, text);
                } else {
                    const start = activeElement.selectionStart;
                    const end = activeElement.selectionEnd;
                    const value = activeElement.value;
                    
                    activeElement.value = value.substring(0, start) + text + value.substring(end);
                    activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
                }
            }
        }
    }

    /**
     * アクティブエディタ取得
     */
    getActiveEditor() {
        // window.appからエディタ取得
        if (window.app && window.app.editor) {
            return window.app.editor;
        }
        return null;
    }

    /**
     * ゲーム切り替え
     */
    switchGame(gameId) {
        this.currentGame = gameId;
        this.currentCharacter = null;
        this.render();
    }

    /**
     * キャラクター切り替え
     */
    switchCharacter(characterId) {
        this.currentCharacter = characterId;
        this.render();
    }

    /**
     * カスタム定義追加
     */
    addCustomDefinition(category, text, color) {
        const gameDefinitions = this.keyboardDefinitions.get(this.currentGame) || 
                               this.keyboardDefinitions.get('default');
        
        if (!gameDefinitions[category]) {
            gameDefinitions[category] = [];
        }
        
        gameDefinitions[category].push({ text, color });
        this.render();
    }

    /**
     * 定義削除
     */
    removeDefinition(category, text) {
        const gameDefinitions = this.keyboardDefinitions.get(this.currentGame) || 
                               this.keyboardDefinitions.get('default');
        
        if (gameDefinitions[category]) {
            const index = gameDefinitions[category].findIndex(btn => btn.text === text);
            if (index > -1) {
                gameDefinitions[category].splice(index, 1);
                this.render();
            }
        }
    }

    /**
     * 設定画面表示
     */
    showSettings() {
        // 実装予定: 設定ダイアログ
        console.log('キーボード設定（実装予定）');
    }

    /**
     * 定義エクスポート
     */
    exportDefinitions() {
        const definitions = Object.fromEntries(this.keyboardDefinitions);
        return JSON.stringify(definitions, null, 2);
    }

    /**
     * 定義インポート
     */
    importDefinitions(jsonData) {
        try {
            const definitions = JSON.parse(jsonData);
            Object.entries(definitions).forEach(([gameId, gameDef]) => {
                this.keyboardDefinitions.set(gameId, gameDef);
            });
            this.render();
        } catch (error) {
            console.error('定義インポートエラー:', error);
        }
    }

    /**
     * ゲーム固有定義作成
     */
    createGameDefinition(gameId, gameName) {
        const defaultDef = this.keyboardDefinitions.get('default');
        const gameDef = JSON.parse(JSON.stringify(defaultDef)); // ディープコピー
        
        this.keyboardDefinitions.set(gameId, gameDef);
        return gameDef;
    }

    /**
     * キャラクター固有定義作成
     */
    createCharacterDefinition(characterId, characterName, gameId) {
        const gameDef = this.keyboardDefinitions.get(gameId) || 
                       this.keyboardDefinitions.get('default');
        
        // キャラクター固有カテゴリ追加
        const characterCategory = `${characterName}専用`;
        if (!gameDef[characterCategory]) {
            gameDef[characterCategory] = [];
        }
        
        return gameDef[characterCategory];
    }

    /**
     * 検索機能
     */
    searchButtons(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        this.keyboardDefinitions.forEach((definitions, gameId) => {
            Object.entries(definitions).forEach(([category, buttons]) => {
                buttons.forEach(button => {
                    if (button.text.toLowerCase().includes(lowerQuery)) {
                        results.push({
                            game: gameId,
                            category,
                            button
                        });
                    }
                });
            });
        });
        
        return results;
    }

    /**
     * 使用頻度統計
     */
    getUsageStats() {
        // 実装予定: ボタン使用頻度の統計
        console.log('使用頻度統計（実装予定）');
    }
}
