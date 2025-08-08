/**
 * エディタコンポーネント
 * WYSIWYGエディタとMarkdown保存機能
 */

export class Editor {
    constructor() {
        this.container = null;
        this.isInitialized = false;
        this.autoSaveInterval = null;
        this.autoSaveDelay = 3000; // 3秒
        this.lastSaveTime = null;
        this.isDirty = false;
    }

    /**
     * 初期化
     */
    async init() {
        this.container = document.getElementById('wysiwyg-editor');
        if (!this.container) {
            console.error('Editor container not found');
            return;
        }

        this.setupEditor();
        this.setupEvents();
        this.setupAutoSave();
        
        this.isInitialized = true;
        console.log('Editor initialized');
    }

    /**
     * エディタ設定
     */
    setupEditor() {
        if (!this.container) return;

        // エディタの基本設定
        this.container.setAttribute('contenteditable', 'true');
        this.container.setAttribute('spellcheck', 'false');
        
        // プレースホルダー設定
        if (!this.container.textContent.trim()) {
            this.container.innerHTML = '<p>ここに文章を入力してください...</p>';
        }
    }

    /**
     * イベント設定
     */
    setupEvents() {
        if (!this.container) return;

        // 入力イベント
        this.container.addEventListener('input', () => {
            this.onContentChange();
        });

        // フォーカスイベント
        this.container.addEventListener('focus', () => {
            this.onFocus();
        });

        // ブラーイベント
        this.container.addEventListener('blur', () => {
            this.onBlur();
        });

        // キーボードショートカット
        this.container.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        // ペーストイベント
        this.container.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });
    }

    /**
     * 自動保存設定
     */
    setupAutoSave() {
        // 既存の自動保存をクリア
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // 新しい自動保存設定
        this.autoSaveInterval = setInterval(() => {
            if (this.isDirty) {
                this.autoSave();
            }
        }, this.autoSaveDelay);
    }

    /**
     * コンテンツ変更時の処理
     */
    onContentChange() {
        this.isDirty = true;
        this.updateWordCount();
        this.updateFileStatus();
    }

    /**
     * フォーカス時の処理
     */
    onFocus() {
        // プレースホルダー削除
        if (this.container.innerHTML === '<p>ここに文章を入力してください...</p>') {
            this.container.innerHTML = '';
        }
    }

    /**
     * ブラー時の処理
     */
    onBlur() {
        // 空の場合はプレースホルダー表示
        if (!this.container.textContent.trim()) {
            this.container.innerHTML = '<p>ここに文章を入力してください...</p>';
        }
    }

    /**
     * キーボードショートカット処理
     */
    handleKeyDown(e) {
        // Ctrl+B: 太字
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            this.toggleBold();
        }

        // Ctrl+I: 斜体
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            this.toggleItalic();
        }

        // Ctrl+U: 下線
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            this.toggleUnderline();
        }

        // Ctrl+1-6: 見出し
        if (e.ctrlKey && /^[1-6]$/.test(e.key)) {
            e.preventDefault();
            this.toggleHeading(parseInt(e.key));
        }

        // Ctrl+K: リンク
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            this.createLink();
        }

        // Ctrl+Enter: 改行
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.insertLineBreak();
        }

        // Tab: インデント
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                this.outdent();
            } else {
                this.indent();
            }
        }
    }

    /**
     * ペースト処理
     */
    handlePaste(e) {
        e.preventDefault();
        
        const text = e.clipboardData.getData('text/plain');
        const html = e.clipboardData.getData('text/html');
        
        if (html) {
            // HTMLの場合はサニタイズして挿入
            this.insertSanitizedHTML(html);
        } else if (text) {
            // プレーンテキストの場合
            this.insertText(text);
        }
    }

    /**
     * コンテンツ設定
     */
    setContent(content) {
        if (!this.container) return;

        if (typeof content === 'string') {
            // Markdownからリッチテキストに変換
            this.container.innerHTML = this.markdownToHTML(content);
        } else {
            this.container.innerHTML = content;
        }

        this.isDirty = false;
        this.updateWordCount();
        this.updateFileStatus();
    }

    /**
     * コンテンツ取得
     */
    getContent() {
        if (!this.container) return '';

        // リッチテキストからMarkdownに変換
        return this.htmlToMarkdown(this.container.innerHTML);
    }

    /**
     * プレーンテキスト取得
     */
    getTextContent() {
        if (!this.container) return '';
        return this.container.textContent || '';
    }

    /**
     * 太字切り替え
     */
    toggleBold() {
        document.execCommand('bold', false, null);
        this.onContentChange();
    }

    /**
     * 斜体切り替え
     */
    toggleItalic() {
        document.execCommand('italic', false, null);
        this.onContentChange();
    }

    /**
     * 下線切り替え
     */
    toggleUnderline() {
        document.execCommand('underline', false, null);
        this.onContentChange();
    }

    /**
     * 見出し切り替え
     */
    toggleHeading(level) {
        const tagName = `H${level}`;
        document.execCommand('formatBlock', false, tagName);
        this.onContentChange();
    }

    /**
     * リンク作成
     */
    createLink() {
        const url = prompt('リンクURLを入力してください:');
        if (url) {
            document.execCommand('createLink', false, url);
            this.onContentChange();
        }
    }

    /**
     * 表挿入
     */
    insertTable() {
        const rows = parseInt(prompt('行数を入力してください:', '3')) || 3;
        const cols = parseInt(prompt('列数を入力してください:', '3')) || 3;
        
        let tableHTML = '<table border="1">';
        
        // ヘッダー行
        tableHTML += '<thead><tr>';
        for (let i = 0; i < cols; i++) {
            tableHTML += `<th>ヘッダー${i + 1}</th>`;
        }
        tableHTML += '</tr></thead>';
        
        // データ行
        tableHTML += '<tbody>';
        for (let i = 0; i < rows - 1; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHTML += '<td>セル</td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';
        
        document.execCommand('insertHTML', false, tableHTML);
        this.onContentChange();
    }

    /**
     * テキスト挿入
     */
    insertText(text) {
        document.execCommand('insertText', false, text);
        this.onContentChange();
    }

    /**
     * HTML挿入
     */
    insertHTML(html) {
        document.execCommand('insertHTML', false, html);
        this.onContentChange();
    }

    /**
     * サニタイズされたHTML挿入
     */
    insertSanitizedHTML(html) {
        // 基本的なHTMLサニタイズ
        const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'];
        const sanitized = this.sanitizeHTML(html, allowedTags);
        this.insertHTML(sanitized);
    }

    /**
     * インデント
     */
    indent() {
        document.execCommand('indent', false, null);
        this.onContentChange();
    }

    /**
     * アウトデント
     */
    outdent() {
        document.execCommand('outdent', false, null);
        this.onContentChange();
    }

    /**
     * 改行挿入
     */
    insertLineBreak() {
        document.execCommand('insertHTML', false, '<br>');
        this.onContentChange();
    }

    /**
     * 文字数更新
     */
    updateWordCount() {
        const wordCountEl = document.getElementById('word-count');
        if (wordCountEl && this.container) {
            const text = this.container.textContent || '';
            wordCountEl.textContent = `${text.length} 文字`;
        }
    }

    /**
     * ファイルステータス更新
     */
    updateFileStatus() {
        const statusEl = document.getElementById('file-status');
        const lastSavedEl = document.getElementById('last-saved');
        
        if (statusEl) {
            statusEl.textContent = this.isDirty ? '未保存' : '';
        }
        
        if (lastSavedEl) {
            if (this.isDirty) {
                lastSavedEl.textContent = '未保存';
            } else if (this.lastSaveTime) {
                lastSavedEl.textContent = `最終保存: ${this.formatTime(this.lastSaveTime)}`;
            }
        }
    }

    /**
     * 自動保存
     */
    async autoSave() {
        if (!this.isDirty || !window.app) return;

        try {
            await window.app.saveCurrentFile();
            this.isDirty = false;
            this.lastSaveTime = new Date();
            this.updateFileStatus();
        } catch (error) {
            console.error('自動保存エラー:', error);
        }
    }

    /**
     * Markdownをリッチテキストに変換
     */
    markdownToHTML(markdown) {
        if (!markdown) return '';
        
        let html = markdown;
        
        // 見出し
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // 太字
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 斜体
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // リンク
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // 改行
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }

    /**
     * リッチテキストをMarkdownに変換
     */
    htmlToMarkdown(html) {
        if (!html) return '';
        
        let markdown = html;
        
        // 見出し
        markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
        markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
        markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');
        
        // 太字
        markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
        markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');
        
        // 斜体
        markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
        markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');
        
        // リンク
        markdown = markdown.replace(/<a href="([^"]*)">(.*?)<\/a>/g, '[$2]($1)');
        
        // 改行
        markdown = markdown.replace(/<br>/g, '\n');
        markdown = markdown.replace(/<\/p><p>/g, '\n\n');
        
        // HTMLタグ除去
        markdown = markdown.replace(/<[^>]*>/g, '');
        
        return markdown;
    }

    /**
     * HTMLサニタイズ
     */
    sanitizeHTML(html, allowedTags) {
        const div = document.createElement('div');
        div.innerHTML = html;
        
        const walker = document.createTreeWalker(
            div,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );
        
        const elementsToRemove = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (!allowedTags.includes(node.tagName.toLowerCase())) {
                elementsToRemove.push(node);
            }
        }
        
        elementsToRemove.forEach(element => {
            element.parentNode.removeChild(element);
        });
        
        return div.innerHTML;
    }

    /**
     * 時刻フォーマット
     */
    formatTime(date) {
        return date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * エディタクリア
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '<p>ここに文章を入力してください...</p>';
            this.isDirty = false;
            this.updateWordCount();
            this.updateFileStatus();
        }
    }

    /**
     * フォーカス設定
     */
    focus() {
        if (this.container) {
            this.container.focus();
        }
    }

    /**
     * エディタ破棄
     */
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        
        this.isInitialized = false;
    }
}
