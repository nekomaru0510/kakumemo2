export class DataManager {
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

    /**
     * 実際のフォルダ・ファイル構成を再帰的に取得
     * @param {string} dirPath - ルートディレクトリパス
     * @returns {Promise<Array>} - 階層構造の配列
     */
    async getFolderHierarchy(dirPath) {
        const fs = window.require ? window.require('fs') : require('fs');
        const path = window.require ? window.require('path') : require('path');

        const walk = (currentPath) => {
            const stats = fs.statSync(currentPath);
            if (stats.isDirectory()) {
                const children = fs.readdirSync(currentPath).map(name => walk(path.join(currentPath, name)));
                return {
                    id: currentPath,
                    name: path.basename(currentPath),
                    type: 'folder',
                    children
                };
            } else {
                return {
                    id: currentPath,
                    name: path.basename(currentPath),
                    type: 'file',
                    children: []
                };
            }
        };
        return [walk(dirPath)];
    }

    /**
     * 初期化
     */
    async init() {
        await this.loadData();
        console.log('DataManager initialized');
    }

    /**
     * データ読み込み
     */
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

    /**
     * データ保存
     */
    async saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('データ保存エラー:', error);
            throw error;
        }
    }

    /**
     * 全データ取得
     */
    async getAllData() {
        return this.data;
    }

    /**
     * 統計情報取得
     */
    async getStatistics() {
        return {
            totalGames: this.data.games.length,
            totalCharacters: this.data.games.reduce((sum, game) => 
                sum + (game.characters ? game.characters.length : 0), 0),
            totalFiles: this.data.files.length,
            totalCharacterCount: this.data.files.reduce((sum, file) => 
                sum + (file.content ? file.content.length : 0), 0)
        };
    }

    /**
     * ゲーム作成
     */
    async createGame(name) {
        const id = this.generateId();
        const game = {
            id,
            name,
            characters: [],
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        this.data.games.push(game);
        await this.saveData();
        
        return id;
    }

    /**
     * ゲーム取得
     */
    async getGame(gameId) {
        return this.data.games.find(game => game.id === gameId);
    }

    /**
     * ゲーム一覧取得
     */
    async getGames() {
        return this.data.games;
    }

    /**
     * ゲーム更新
     */
    async updateGame(gameId, updates) {
        const game = await this.getGame(gameId);
        if (!game) {
            throw new Error('ゲームが見つかりません');
        }
        
        Object.assign(game, updates, {
            lastModified: new Date().toISOString()
        });
        
        await this.saveData();
        return game;
    }

    /**
     * ゲーム削除
     */
    async deleteGame(gameId) {
        const gameIndex = this.data.games.findIndex(game => game.id === gameId);
        if (gameIndex === -1) {
            throw new Error('ゲームが見つかりません');
        }
        
        // 関連ファイルも削除
        const game = this.data.games[gameIndex];
        if (game.characters) {
            for (const character of game.characters) {
                if (character.categories) {
                    for (const category of character.categories) {
                        const fileIds = category.files || [];
                        for (const fileId of fileIds) {
                            await this.deleteFile(fileId);
                        }
                    }
                }
            }
        }
        
        this.data.games.splice(gameIndex, 1);
        await this.saveData();
    }

    /**
     * キャラクター作成
     */
    async createCharacter(gameId, name) {
        const game = await this.getGame(gameId);
        if (!game) {
            throw new Error('ゲームが見つかりません');
        }
        
        const id = this.generateId();
        const character = {
            id,
            name,
            gameId,
            categories: [],
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        if (!game.characters) {
            game.characters = [];
        }
        
        game.characters.push(character);
        game.lastModified = new Date().toISOString();
        
        await this.saveData();
        return id;
    }

    /**
     * キャラクター取得
     */
    async getCharacter(gameId, characterId) {
        const game = await this.getGame(gameId);
        if (!game || !game.characters) {
            return null;
        }
        
        return game.characters.find(char => char.id === characterId);
    }

    /**
     * カテゴリ作成
     */
    async createCategory(characterId, name) {
        // キャラクターを含むゲームを検索
        let targetGame = null;
        let targetCharacter = null;
        
        for (const game of this.data.games) {
            if (game.characters) {
                const character = game.characters.find(char => char.id === characterId);
                if (character) {
                    targetGame = game;
                    targetCharacter = character;
                    break;
                }
            }
        }
        
        if (!targetCharacter) {
            throw new Error('キャラクターが見つかりません');
        }
        
        const id = this.generateId();
        const category = {
            id,
            name,
            characterId,
            files: [],
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        if (!targetCharacter.categories) {
            targetCharacter.categories = [];
        }
        
        targetCharacter.categories.push(category);
        targetCharacter.lastModified = new Date().toISOString();
        targetGame.lastModified = new Date().toISOString();
        
        await this.saveData();
        return id;
    }

    /**
     * ファイル作成
     */
    async createFile(categoryId, title, content = '') {
        const id = this.generateId();
        const file = {
            id,
            title,
            content,
            categoryId,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        // カテゴリにファイルIDを追加
        let categoryFound = false;
        for (const game of this.data.games) {
            if (game.characters) {
                for (const character of game.characters) {
                    if (character.categories) {
                        const category = character.categories.find(cat => cat.id === categoryId);
                        if (category) {
                            if (!category.files) {
                                category.files = [];
                            }
                            category.files.push(id);
                            category.lastModified = new Date().toISOString();
                            character.lastModified = new Date().toISOString();
                            game.lastModified = new Date().toISOString();
                            categoryFound = true;
                            break;
                        }
                    }
                }
                if (categoryFound) break;
            }
        }
        
        if (!categoryFound) {
            throw new Error('カテゴリが見つかりません');
        }
        
        this.data.files.push(file);
        await this.saveData();
        
        return id;
    }

    /**
     * ファイル取得
     */
    async getFile(fileId) {
        return this.data.files.find(file => file.id === fileId);
    }

    /**
     * ファイル更新
     */
    async updateFile(fileId, updates) {
        const file = await this.getFile(fileId);
        if (!file) {
            throw new Error('ファイルが見つかりません');
        }
        
        Object.assign(file, updates, {
            lastModified: new Date().toISOString()
        });
        
        await this.saveData();
        return file;
    }

    /**
     * ファイル削除
     */
    async deleteFile(fileId) {
        const fileIndex = this.data.files.findIndex(file => file.id === fileId);
        if (fileIndex === -1) {
            throw new Error('ファイルが見つかりません');
        }
        
        const file = this.data.files[fileIndex];
        
        // カテゴリからファイルIDを削除
        for (const game of this.data.games) {
            if (game.characters) {
                for (const character of game.characters) {
                    if (character.categories) {
                        for (const category of character.categories) {
                            if (category.files) {
                                const fileIdIndex = category.files.indexOf(fileId);
                                if (fileIdIndex > -1) {
                                    category.files.splice(fileIdIndex, 1);
                                    category.lastModified = new Date().toISOString();
                                    character.lastModified = new Date().toISOString();
                                    game.lastModified = new Date().toISOString();
                                }
                            }
                        }
                    }
                }
            }
        }
        
        this.data.files.splice(fileIndex, 1);
        await this.saveData();
    }

    /**
     * ファイル検索
     */
    async searchFiles(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (const file of this.data.files) {
            // タイトル検索
            if (file.title && file.title.toLowerCase().includes(lowerQuery)) {
                results.push({
                    id: file.id,
                    title: file.title,
                    path: await this.getFilePath(file.id),
                    type: 'title'
                });
                continue;
            }
            
            // コンテンツ検索
            if (file.content && file.content.toLowerCase().includes(lowerQuery)) {
                results.push({
                    id: file.id,
                    title: file.title,
                    path: await this.getFilePath(file.id),
                    type: 'content'
                });
            }
        }
        
        return results;
    }

    /**
     * ファイルパス取得
     */
    async getFilePath(fileId) {
        const file = await this.getFile(fileId);
        if (!file) return '';
        
        // カテゴリ、キャラクター、ゲームを遡って検索
        for (const game of this.data.games) {
            if (game.characters) {
                for (const character of game.characters) {
                    if (character.categories) {
                        for (const category of character.categories) {
                            if (category.files && category.files.includes(fileId)) {
                                return `${game.name} > ${character.name} > ${category.name}`;
                            }
                        }
                    }
                }
            }
        }
        
        return '';
    }

    /**
     * 階層構造取得（エクスプローラ用）
     */
    /**
     * 実際のワークスペース直下のフォルダ構成を返す
     */
    async getHierarchy() {
        // Windows用にパスを指定
        const rootPath = 'c:/Users/ryamamoto/Desktop/proto7';
        return await this.getFolderHierarchy(rootPath);
    }

    /**
     * 設定取得
     */
    async getSettings() {
        return this.data.settings;
    }

    /**
     * 設定更新
     */
    async updateSettings(updates) {
        Object.assign(this.data.settings, updates);
        await this.saveData();
    }

    /**
     * データリセット
     */
    async resetData() {
        this.data = {
            games: [],
            files: [],
            settings: {
                theme: 'dark',
                autoSave: true,
                autoSaveInterval: 3000
            }
        };
        await this.saveData();
    }

    /**
     * データエクスポート
     */
    async exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * データインポート
     */
    async importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            
            // データ構造検証
            if (!importedData.games || !Array.isArray(importedData.games)) {
                throw new Error('無効なデータ形式です');
            }
            
            this.data = { ...this.data, ...importedData };
            await this.saveData();
            
        } catch (error) {
            console.error('データインポートエラー:', error);
            throw error;
        }
    }

    /**
     * ユニークID生成
     */
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
}
