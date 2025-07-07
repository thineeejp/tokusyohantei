/**
 * ===================================================
 * main.js - メイン処理モジュール
 * ===================================================
 */

/**
 * メイン判定処理
 * UIから呼び出される判定実行関数
 * @param {object} 建物情報 - ユーザー入力から生成された建物情報オブジェクト
 */
function executeJudgment(建物情報) {
    try {
        // 処理開始を示すUI更新
        showLoadingState();
        
        // 判定実行
        const 判定結果_令21 = 判定実行_令21(建物情報);
        const 特小判定結果 = 特小判定実行(判定結果_令21, 建物情報);
        
        // 結果表示
        displayResult(判定結果_令21, 特小判定結果, 建物情報);
        
        // ログ出力（デバッグ用）
        console.log('判定結果_令21:', 判定結果_令21);
        console.log('特小判定結果:', 特小判定結果);
        console.log('建物情報:', 建物情報);
        
    } catch (error) {
        console.error('判定処理エラー:', error);
        showError('判定処理中にエラーが発生しました。入力内容を確認してください。');
    } finally {
        // 処理終了を示すUI更新
        hideLoadingState();
    }
}

/**
 * ローディング状態を表示
 */
function showLoadingState() {
    const submitBtn = document.getElementById('submit-btn');
    const form = document.getElementById('building-form');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="material-icons">hourglass_empty</span>
            判定中...
        `;
    }
    
    if (form) {
        form.classList.add('loading');
    }
}

/**
 * ローディング状態を非表示
 */
function hideLoadingState() {
    const submitBtn = document.getElementById('submit-btn');
    const form = document.getElementById('building-form');
    
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <span class="material-icons">analytics</span>
            判定する
        `;
    }
    
    if (form) {
        form.classList.remove('loading');
    }
}

/**
 * アプリケーション初期化
 */
function initializeApp() {
    console.log('アプリケーション初期化開始');
    
    // グローバル関数の設定
    window.executeJudgment = executeJudgment;
    
    // エラーハンドラーの設定
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // パフォーマンス監視
    if (performance.mark) {
        performance.mark('app-init-start');
    }
    
    console.log('アプリケーション初期化完了');
}

/**
 * グローバルエラーハンドラー
 */
function handleGlobalError(event) {
    console.error('グローバルエラー:', event.error);
    showError('予期しないエラーが発生しました。ページを再読み込みしてください。');
}

/**
 * Promise拒否ハンドラー
 */
function handleUnhandledRejection(event) {
    console.error('未処理のPromise拒否:', event.reason);
    showError('処理中にエラーが発生しました。');
}

/**
 * アプリケーション設定
 */
const appConfig = {
    // デバッグモード
    debug: true,
    
    // バージョン情報
    version: '1.0.0',
    
    // 設定値
    settings: {
        // 判定結果の自動スクロール
        autoScroll: true,
        
        // アニメーション有効化
        enableAnimations: true,
        
        // パフォーマンス監視
        enablePerformanceMonitoring: true
    }
};

/**
 * デバッグ情報の出力
 */
function outputDebugInfo() {
    if (appConfig.debug) {
        console.log(`=== 自動火災報知設備判定アプリ v${appConfig.version} ===`);
        console.log('設定:', appConfig.settings);
        console.log('ブラウザ情報:', {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform
        });
    }
}

/**
 * パフォーマンス測定
 */
function measurePerformance() {
    if (appConfig.settings.enablePerformanceMonitoring && performance.mark) {
        performance.mark('app-init-end');
        performance.measure('app-init-time', 'app-init-start', 'app-init-end');
        
        const measures = performance.getEntriesByName('app-init-time');
        if (measures.length > 0) {
            console.log(`アプリケーション初期化時間: ${measures[0].duration.toFixed(2)}ms`);
        }
    }
}

/**
 * ヘルプテキストの定義
 */
const helpTexts = {
    'windowless-floor': '無窓階とは、壁及び天井の室内に面する部分の面積に対する開口部の面積の合計の割合が二十分の一未満である階をいいます。',
    'specific-use': '特定用途とは、(2)項イ、(2)項ロ、(2)項ハ、(3)項、(16)項イに該当する用途をいいます。',
    'small-scale-complex': '小規模特定用途複合防火対象物とは、延べ面積が300㎡以上500㎡未満の(16)項イに該当する防火対象物をいいます。',
    'flammable-multiplier': '指定可燃物の倍数とは、消防法別表第一の指定可燃物の種類ごとに定められた数量の倍数をいいます。',
    'specific-single-stair': '特定一階段等防火対象物とは、地階または3階以上の階に客席・病室等があり、かつ階段等の避難施設が一つしかない防火対象物をいいます。'
};

/**
 * ヘルプテキストを取得
 */
function getHelpText(key) {
    return helpTexts[key] || 'ヘルプ情報が見つかりません。';
}

/**
 * ユーザー操作のログ記録（分析用）
 */
function logUserAction(action, details = {}) {
    if (appConfig.debug) {
        console.log(`ユーザー操作: ${action}`, details);
    }
    
    // 実際のアプリケーションでは、ここで分析サービスにデータを送信
    // 例: analytics.track(action, details);
}

/**
 * 入力値の自動保存（ローカルストレージ）
 */
function saveInputToLocalStorage(建物情報) {
    try {
        const data = JSON.stringify(建物情報);
        localStorage.setItem('building-info-draft', data);
        console.log('入力内容をローカルストレージに保存しました');
    } catch (error) {
        console.warn('ローカルストレージへの保存に失敗しました:', error);
    }
}

/**
 * 入力値の自動復元（ローカルストレージ）
 */
function loadInputFromLocalStorage() {
    try {
        const data = localStorage.getItem('building-info-draft');
        if (data) {
            const 建物情報 = JSON.parse(data);
            console.log('ローカルストレージから入力内容を復元しました');
            return 建物情報;
        }
    } catch (error) {
        console.warn('ローカルストレージからの復元に失敗しました:', error);
    }
    return null;
}

/**
 * 入力値の自動保存をクリア
 */
function clearInputFromLocalStorage() {
    try {
        localStorage.removeItem('building-info-draft');
        console.log('ローカルストレージの入力内容をクリアしました');
    } catch (error) {
        console.warn('ローカルストレージのクリアに失敗しました:', error);
    }
}

/**
 * 印刷用スタイルの適用
 */
function preparePrintStyles() {
    const printStyles = `
        @media print {
            .app-header, .app-footer, .form-actions, .btn {
                display: none !important;
            }
            .input-section {
                page-break-after: always;
            }
            .result-section {
                page-break-inside: avoid;
            }
            .result-card {
                border: 1px solid #000;
                margin-bottom: 20px;
                padding: 15px;
            }
            body {
                font-size: 12pt;
                line-height: 1.5;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = printStyles;
    document.head.appendChild(style);
}

/**
 * 結果のPDF出力準備
 */
function preparePDFOutput(判定結果_令21, 特小判定結果, 建物情報) {
    const outputData = {
        timestamp: new Date().toISOString(),
        version: appConfig.version,
        建物情報: 建物情報,
        判定結果_令21: 判定結果_令21,
        特小判定結果: 特小判定結果,
        説明: generateResultDescription(判定結果_令21, 特小判定結果, 建物情報)
    };
    
    return outputData;
}

/**
 * アクセシビリティ改善
 */
function improveAccessibility() {
    // フォーカス管理
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // ARIAラベルの動的設定
    const form = document.getElementById('building-form');
    if (form) {
        form.setAttribute('aria-label', '建物情報入力フォーム');
    }
    
    const resultSection = document.getElementById('result-section');
    if (resultSection) {
        resultSection.setAttribute('aria-label', '判定結果');
        resultSection.setAttribute('aria-live', 'polite');
    }
}

/**
 * モバイル対応の改善
 */
function improveMobileSupport() {
    // タッチイベントの処理
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0].clientY;
    });
    
    document.addEventListener('touchmove', (event) => {
        const touchY = event.touches[0].clientY;
        const touchDiff = touchStartY - touchY;
        
        // スクロール方向の判定などの処理
        if (Math.abs(touchDiff) > 10) {
            // スクロール処理
        }
    });
    
    // ビューポートの調整
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
}

/**
 * DOMContentLoaded時の処理
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    outputDebugInfo();
    measurePerformance();
    preparePrintStyles();
    improveAccessibility();
    improveMobileSupport();
    
    // 自動保存機能（開発中は無効化）
    // const savedData = loadInputFromLocalStorage();
    // if (savedData) {
    //     // 復元処理
    // }
});

/**
 * ページ離脱時の処理
 */
window.addEventListener('beforeunload', (event) => {
    // 未保存の変更がある場合の警告
    const form = document.getElementById('building-form');
    if (form && form.checkValidity && !form.checkValidity()) {
        event.preventDefault();
        event.returnValue = '入力内容が保存されていません。ページを離れてもよろしいですか？';
    }
});

/**
 * レスポンシブデザイン対応
 */
function handleResize() {
    const width = window.innerWidth;
    
    // モバイル表示の調整
    if (width < 768) {
        document.body.classList.add('mobile-view');
        document.body.classList.remove('desktop-view');
    } else {
        document.body.classList.add('desktop-view');
        document.body.classList.remove('mobile-view');
    }
}

window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize);

// エクスポート（モジュール化する場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executeJudgment,
        appConfig,
        getHelpText,
        logUserAction
    };
}