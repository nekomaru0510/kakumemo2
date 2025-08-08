/**
 * タブマネージャー
 * エディタタブの管理システム
 */

export class TabManager {
    constructor() {
        this.tabs = new Map();
        this.activeTab = null;
        this.tabContainer = null;
        this.contentContainer = null;
    }

    /**
     * 初期化
     */
    init() {
        this.tabContainer = document.getElementById('tab-list');
        this.contentContainer = document.getElementById('content-area');
        
        // 既存のタブイベント設定
        this.setupTabEvents();
        
        console.log('TabManager initialized');
    }

    /**
     * タブイベント設定
     */
    setupTabEvents() {
        // タブクリックイベント
        if (this.tabContainer) {
            this.tabContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.tab');
                if (tab && tab.dataset.tab) {
                    this.switchTab(tab.dataset.tab);
                }
                
                // タブ閉じるボタン
                if (e.target.classList.contains('tab-close')) {
                    e.stopPropagation();
                    const tabId = e.target.closest('.tab').dataset.tab;
                    this.closeTab(tabId);
                }
            });
        }
    }

    /**
     * タブ作成
     */
    createTab(id, title, icon = '📄', content = '', closable = true) {
        // 既存タブチェック
        if (this.tabs.has(id)) {
            this.switchTab(id);
            return;
        }

        // タブデータ保存
        this.tabs.set(id, {
            id,
            title,
            icon,
            content,
            closable,
            createdAt: new Date()
        });

        // タブUI作成
        this.createTabUI(id, title, icon, closable);
        
        // コンテンツエリア作成
        this.createContentArea(id, content);
        
        // アクティブタブに設定
        this.switchTab(id);
    }

    /**
     * タブUI作成
     */
    createTabUI(id, title, icon, closable) {
        if (!this.tabContainer) return;

        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.dataset.tab = id;
        
        let closeButton = '';
        if (closable) {
            closeButton = '<span class="tab-close">&times;</span>';
        }
        
        tabElement.innerHTML = `
            <span class="tab-icon">${icon}</span>
            <span class="tab-title">${title}</span>
            ${closeButton}
        `;

        this.tabContainer.appendChild(tabElement);
    }

    /**
     * コンテンツエリア作成
     */
    createContentArea(id, content) {
        if (!this.contentContainer) return;

        const contentElement = document.createElement('div');
        contentElement.className = 'tab-content';
        contentElement.id = `${id}-content`;
        contentElement.style.display = 'none';
        
        if (typeof content === 'string') {
            contentElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentElement.appendChild(content);
        }

        this.contentContainer.appendChild(contentElement);
    }

    /**
     * タブ切り替え
     */
    switchTab(tabId) {
        // 前のアクティブタブを非アクティブに
        if (this.activeTab) {
            const prevTab = document.querySelector(`[data-tab="${this.activeTab}"]`);
            const prevContent = document.getElementById(`${this.activeTab}-content`);
            
            if (prevTab) prevTab.classList.remove('active');
            if (prevContent) prevContent.style.display = 'none';
        }

        // 新しいタブをアクティブに
        const newTab = document.querySelector(`[data-tab="${tabId}"]`);
        const newContent = document.getElementById(`${tabId}-content`);
        
        if (newTab) {
            newTab.classList.add('active');
            this.activeTab = tabId;
        }
        
        if (newContent) {
            newContent.style.display = 'block';
        }

        // タブ切り替えイベント発火
        this.dispatchTabChangeEvent(tabId);
    }

    /**
     * タブ閉じる
     */
    closeTab(tabId) {
        const tabData = this.tabs.get(tabId);
        if (!tabData || !tabData.closable) {
            return false;
        }

        // UI要素削除
        const tabElement = document.querySelector(`[data-tab="${tabId}"]`);
        const contentElement = document.getElementById(`${tabId}-content`);
        
        if (tabElement) tabElement.remove();
        if (contentElement) contentElement.remove();

        // データ削除
        this.tabs.delete(tabId);

        // アクティブタブだった場合は別のタブに切り替え
        if (this.activeTab === tabId) {
            const remainingTabs = Array.from(this.tabs.keys());
            if (remainingTabs.length > 0) {
                this.switchTab(remainingTabs[remainingTabs.length - 1]);
            } else {
                // ダッシュボードに戻る
                this.switchTab('dashboard');
            }
        }

        return true;
    }

    /**
     * 全てのタブを閉じる
     */
    closeAllTabs() {
        const closableTabs = Array.from(this.tabs.entries())
            .filter(([id, data]) => data.closable)
            .map(([id]) => id);
            
        closableTabs.forEach(tabId => {
            this.closeTab(tabId);
        });
    }

    /**
     * タブ更新
     */
    updateTab(tabId, updates) {
        const tabData = this.tabs.get(tabId);
        if (!tabData) return false;

        // データ更新
        Object.assign(tabData, updates);

        // UI更新
        const tabElement = document.querySelector(`[data-tab="${tabId}"]`);
        if (tabElement) {
            if (updates.title) {
                const titleElement = tabElement.querySelector('.tab-title');
                if (titleElement) {
                    titleElement.textContent = updates.title;
                }
            }
            
            if (updates.icon) {
                const iconElement = tabElement.querySelector('.tab-icon');
                if (iconElement) {
                    iconElement.textContent = updates.icon;
                }
            }
        }

        // コンテンツ更新
        if (updates.content) {
            const contentElement = document.getElementById(`${tabId}-content`);
            if (contentElement) {
                if (typeof updates.content === 'string') {
                    contentElement.innerHTML = updates.content;
                } else if (updates.content instanceof HTMLElement) {
                    contentElement.innerHTML = '';
                    contentElement.appendChild(updates.content);
                }
            }
        }

        return true;
    }

    /**
     * タブ存在チェック
     */
    hasTab(tabId) {
        return this.tabs.has(tabId);
    }

    /**
     * タブ取得
     */
    getTab(tabId) {
        return this.tabs.get(tabId);
    }

    /**
     * 全タブ取得
     */
    getAllTabs() {
        return Array.from(this.tabs.values());
    }

    /**
     * アクティブタブ取得
     */
    getActiveTab() {
        return this.activeTab;
    }

    /**
     * タブ数取得
     */
    getTabCount() {
        return this.tabs.size;
    }

    /**
     * タブ切り替えイベント発火
     */
    dispatchTabChangeEvent(tabId) {
        const event = new CustomEvent('tabchange', {
            detail: { tabId, tabData: this.tabs.get(tabId) }
        });
        document.dispatchEvent(event);
    }

    /**
     * タブのダーティ状態設定
     */
    setTabDirty(tabId, dirty = true) {
        const tabElement = document.querySelector(`[data-tab="${tabId}"]`);
        if (!tabElement) return;

        const titleElement = tabElement.querySelector('.tab-title');
        if (titleElement) {
            if (dirty) {
                if (!titleElement.textContent.startsWith('● ')) {
                    titleElement.textContent = '● ' + titleElement.textContent;
                }
            } else {
                titleElement.textContent = titleElement.textContent.replace(/^● /, '');
            }
        }
    }

    /**
     * 次のタブに切り替え
     */
    switchToNextTab() {
        const tabIds = Array.from(this.tabs.keys());
        const currentIndex = tabIds.indexOf(this.activeTab);
        
        if (currentIndex < tabIds.length - 1) {
            this.switchTab(tabIds[currentIndex + 1]);
        } else if (tabIds.length > 0) {
            this.switchTab(tabIds[0]);
        }
    }

    /**
     * 前のタブに切り替え
     */
    switchToPreviousTab() {
        const tabIds = Array.from(this.tabs.keys());
        const currentIndex = tabIds.indexOf(this.activeTab);
        
        if (currentIndex > 0) {
            this.switchTab(tabIds[currentIndex - 1]);
        } else if (tabIds.length > 0) {
            this.switchTab(tabIds[tabIds.length - 1]);
        }
    }

    /**
     * タブの並び順変更
     */
    reorderTab(tabId, newIndex) {
        // 実装予定: ドラッグ&ドロップでの並び替え
        console.log(`タブ並び替え: ${tabId} to index ${newIndex}`);
    }

    /**
     * タブを複製
     */
    duplicateTab(tabId) {
        const originalTab = this.tabs.get(tabId);
        if (!originalTab) return null;

        const newTabId = `${tabId}_copy_${Date.now()}`;
        const newTitle = `${originalTab.title} (コピー)`;
        
        this.createTab(newTabId, newTitle, originalTab.icon, originalTab.content, true);
        return newTabId;
    }
}
