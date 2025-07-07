/**
 * ===================================================
 * ui.js - UI制御モジュール
 * ===================================================
 */

// グローバル変数
let currentBuildingInfo = null;
let complexUseCounter = 0;
let floorInfoCounter = 0;

/**
 * 画面初期化とイベントリスナー設定
 */
function init() {
    // フォーム要素の取得
    const form = document.getElementById('building-form');
    const primaryUseSelect = document.getElementById('primary-use');
    const resetBtn = document.getElementById('reset-btn');
    const submitBtn = document.getElementById('submit-btn');
    const helpModal = document.getElementById('help-modal');
    const closeHelpBtn = document.getElementById('close-help');
    
    // イベントリスナーの設定
    primaryUseSelect.addEventListener('change', updateForm);
    resetBtn.addEventListener('click', resetForm);
    form.addEventListener('submit', handleFormSubmit);
    closeHelpBtn.addEventListener('click', hideHelpModal);
    
    // ヘルプアイコンのイベントリスナー
    document.addEventListener('click', handleHelpClick);
    
    // 階数変更時のイベントリスナー
    const groundFloorsInput = document.getElementById('ground-floors');
    const basementFloorsInput = document.getElementById('basement-floors');
    groundFloorsInput.addEventListener('change', updateFloorInfo);
    basementFloorsInput.addEventListener('change', updateFloorInfo);
    
    // 初期化
    updateForm();
    console.log('UI初期化完了');
}

/**
 * 主用途の変更に応じて動的フォームを更新
 */
function updateForm() {
    const primaryUse = document.getElementById('primary-use').value;
    const dynamicForm = document.getElementById('dynamic-form');
    
    // 動的フォームをクリア
    dynamicForm.innerHTML = '';
    complexUseCounter = 0;
    floorInfoCounter = 0;
    
    // 複合用途の場合の処理
    if (primaryUse === '(16)項イ' || primaryUse === '(16)項ロ' || primaryUse === '(16の2)項') {
        createComplexUseSection();
    }
    
    // (16)項イの場合の小規模特複フラグ
    if (primaryUse === '(16)項イ') {
        createSmallScaleComplexSection();
    }
    
    // (6)ハの場合の宿泊フラグ
    if (primaryUse === '(6)項ハ') {
        createAccommodationSection();
    }
    
    // (16の三)項の場合の特定用途合計面積
    if (primaryUse === '(16の三)項') {
        createSpecificUseTotalAreaSection();
    }
    
    // 階情報セクション
    updateFloorInfo();
}

/**
 * 複合用途セクションを作成
 */
function createComplexUseSection() {
    const dynamicForm = document.getElementById('dynamic-form');
    const section = document.createElement('div');
    section.className = 'complex-use-section';
    section.innerHTML = `
        <h3 class="complex-use-title">構成用途</h3>
        <div id="complex-use-list" class="complex-use-list"></div>
        <button type="button" id="add-complex-use" class="add-use-btn">
            <span class="material-icons">add</span>
            構成用途を追加
        </button>
    `;
    
    dynamicForm.appendChild(section);
    
    // 初期用途を1つ追加
    addComplexUse();
    
    // 追加ボタンのイベントリスナー
    document.getElementById('add-complex-use').addEventListener('click', addComplexUse);
}

/**
 * 複合用途項目を追加
 */
function addComplexUse() {
    const list = document.getElementById('complex-use-list');
    const id = ++complexUseCounter;
    
    const item = document.createElement('div');
    item.className = 'use-item';
    item.id = `complex-use-${id}`;
    item.innerHTML = `
        <div class="use-item-header">
            <span class="use-item-title">構成用途 ${id}</span>
            ${id > 1 ? `<button type="button" class="remove-use-btn" onclick="removeComplexUse(${id})">
                <span class="material-icons">delete</span>
            </button>` : ''}
        </div>
        <div class="form-group">
            <label for="complex-use-type-${id}" class="form-label">用途</label>
            <select id="complex-use-type-${id}" name="complex-use-type-${id}" class="form-select" required>
                <option value="">選択してください</option>
                <option value="(1)項イ">(1)項イ 劇場、映画館、演芸場又は観覧場</option>
                <option value="(1)項ロ">(1)項ロ 公会堂又は集会場</option>
                <option value="(2)項イ">(2)項イ キャバレー、カフェー、ナイトクラブその他これらに類するもの</option>
                <option value="(2)項ロ">(2)項ロ 遊技場又はダンスホール</option>
                <option value="(2)項ハ">(2)項ハ 風俗営業等の規制及び業務の適正化等に関する法律に規定する性風俗関連特殊営業を営む店舗その他これに類するもの</option>
                <option value="(3)項イ">(3)項イ 待合、料理店その他これらに類するもの</option>
                <option value="(3)項ロ">(3)項ロ 飲食店</option>
                <option value="(4)項">(4)項 百貨店、マーケットその他の物品販売業を営む店舗又は展示場</option>
                <option value="(5)項イ">(5)項イ 旅館、ホテル、宿泊所その他これらに類するもの</option>
                <option value="(5)項ロ">(5)項ロ 寄宿舎、下宿又は共同住宅</option>
                <option value="(6)項イ">(6)項イ 病院、診療所又は助産所</option>
                <option value="(6)項ロ">(6)項ロ 老人福祉施設、有料老人ホーム、介護老人保健施設、救護施設、更生施設、児童福祉施設等</option>
                <option value="(6)項ハ">(6)項ハ 幼稚園、盲学校、聾学校又は養護学校</option>
                <option value="(7)項">(7)項 小学校、中学校、高等学校、中等教育学校、高等専門学校、大学、専修学校、各種学校その他これらに類するもの</option>
                <option value="(8)項">(8)項 図書館、博物館、美術館その他これらに類するもの</option>
                <option value="(9)項イ">(9)項イ 公衆浴場のうち、蒸気浴場、熱気浴場その他これらに類するもの</option>
                <option value="(9)項ロ">(9)項ロ イに掲げる公衆浴場以外の公衆浴場</option>
                <option value="(10)項">(10)項 車両の停車場又は船舶若しくは航空機の発着場</option>
                <option value="(11)項">(11)項 神社、寺院、教会その他これらに類するもの</option>
                <option value="(12)項イ">(12)項イ 工場又は作業場</option>
                <option value="(12)項ロ">(12)項ロ 映画スタジオ又はテレビスタジオ</option>
                <option value="(13)項イ">(13)項イ 自動車車庫又は駐車場</option>
                <option value="(13)項ロ">(13)項ロ 飛行機又は回転翼航空機の格納庫</option>
                <option value="(14)項">(14)項 倉庫</option>
                <option value="(15)項">(15)項 前各項に該当しない事業場</option>
                <option value="(16)項イ">(16)項イ 複合用途防火対象物（特定用途を含む）</option>
                <option value="(16)項ロ">(16)項ロ 複合用途防火対象物（その他）</option>
                <option value="(16の2)項">(16の2)項 地下街</option>
                <option value="(16の3)項">(16の3)項 地下道に面する建築物</option>
                <option value="(17)項">(17)項 重要文化財</option>
                <option value="駐車場">駐車場</option>
                <option value="道路">道路</option>
                <option value="通信機器室">通信機器室</option>
            </select>
        </div>
        <div class="form-group">
            <label for="complex-use-area-${id}" class="form-label">面積（㎡）</label>
            <input type="number" id="complex-use-area-${id}" name="complex-use-area-${id}" class="form-input" min="0" step="0.01" required>
        </div>
        <div id="complex-use-accommodation-${id}" class="form-group hidden">
            <label class="form-label">宿泊を伴うか</label>
            <div class="radio-group">
                <label class="radio-label">
                    <input type="radio" name="complex-use-accommodation-${id}" value="true" class="radio-input">
                    <span class="radio-custom"></span>
                    はい
                </label>
                <label class="radio-label">
                    <input type="radio" name="complex-use-accommodation-${id}" value="false" class="radio-input">
                    <span class="radio-custom"></span>
                    いいえ
                </label>
            </div>
        </div>
    `;
    
    list.appendChild(item);
    
    // (6)ハ選択時の宿泊フラグ表示制御
    const useTypeSelect = document.getElementById(`complex-use-type-${id}`);
    useTypeSelect.addEventListener('change', function() {
        const accommodationDiv = document.getElementById(`complex-use-accommodation-${id}`);
        if (this.value === '(6)項ハ') {
            accommodationDiv.classList.remove('hidden');
        } else {
            accommodationDiv.classList.add('hidden');
        }
    });
}

/**
 * 複合用途項目を削除
 */
function removeComplexUse(id) {
    const item = document.getElementById(`complex-use-${id}`);
    if (item) {
        item.remove();
    }
}

/**
 * 小規模特複フラグセクションを作成
 */
function createSmallScaleComplexSection() {
    const dynamicForm = document.getElementById('dynamic-form');
    const section = document.createElement('div');
    section.className = 'form-group';
    section.innerHTML = `
        <label class="form-label">小規模特定用途複合防火対象物に該当するか</label>
        <div class="radio-group">
            <label class="radio-label">
                <input type="radio" name="small-scale-complex" value="true" class="radio-input">
                <span class="radio-custom"></span>
                はい
            </label>
            <label class="radio-label">
                <input type="radio" name="small-scale-complex" value="false" class="radio-input" checked>
                <span class="radio-custom"></span>
                いいえ
            </label>
        </div>
    `;
    
    dynamicForm.appendChild(section);
}

/**
 * 宿泊フラグセクションを作成
 */
function createAccommodationSection() {
    const dynamicForm = document.getElementById('dynamic-form');
    const section = document.createElement('div');
    section.className = 'form-group';
    section.innerHTML = `
        <label class="form-label">宿泊を伴うか</label>
        <div class="radio-group">
            <label class="radio-label">
                <input type="radio" name="accommodation" value="true" class="radio-input">
                <span class="radio-custom"></span>
                はい
            </label>
            <label class="radio-label">
                <input type="radio" name="accommodation" value="false" class="radio-input" checked>
                <span class="radio-custom"></span>
                いいえ
            </label>
        </div>
    `;
    
    dynamicForm.appendChild(section);
}

/**
 * 特定用途合計面積セクションを作成
 */
function createSpecificUseTotalAreaSection() {
    const dynamicForm = document.getElementById('dynamic-form');
    const section = document.createElement('div');
    section.className = 'form-group';
    section.innerHTML = `
        <label for="specific-use-total-area" class="form-label">特定用途合計面積（㎡）</label>
        <input type="number" id="specific-use-total-area" name="specific-use-total-area" class="form-input" min="0" step="0.01" value="0">
    `;
    
    dynamicForm.appendChild(section);
}

/**
 * 階情報セクションを更新
 */
function updateFloorInfo() {
    const groundFloors = parseInt(document.getElementById('ground-floors').value) || 0;
    const basementFloors = parseInt(document.getElementById('basement-floors').value) || 0;
    
    if (groundFloors <= 0) return;
    
    // 既存の階情報セクションを削除
    const existingSection = document.querySelector('.floor-info-section');
    if (existingSection) {
        existingSection.remove();
    }
    
    const dynamicForm = document.getElementById('dynamic-form');
    const section = document.createElement('div');
    section.className = 'floor-info-section';
    section.innerHTML = `
        <div class="floor-info-header">
            <h3 class="floor-info-title">階別情報（任意）</h3>
            <div class="floor-info-toggle-container">
                <button type="button" id="floor-info-toggle" class="toggle-button" onclick="toggleFloorInfoSection()">
                    <span class="material-icons">expand_more</span>
                    詳細な部分判定を行う
                </button>
                <button type="button" class="help-icon" onclick="showFloorInfoHelp()">
                    <span class="material-icons">help_outline</span>
                </button>
            </div>
        </div>
        <div id="floor-info-content" class="floor-info-content hidden">
            <div id="floor-info-list" class="floor-info-list"></div>
        </div>
    `;
    
    dynamicForm.appendChild(section);
    
    const list = document.getElementById('floor-info-list');
    
    // 地下階の生成
    for (let i = basementFloors; i >= 1; i--) {
        createFloorItem(list, `B${i}F`, -i, true);
    }
    
    // 地上階の生成
    for (let i = 1; i <= groundFloors; i++) {
        createFloorItem(list, `${i}F`, i, false);
    }
}

/**
 * 階情報項目を作成
 */
function createFloorItem(container, floorName, floorNumber, isBasement) {
    const id = ++floorInfoCounter;
    const item = document.createElement('div');
    item.className = 'floor-item';
    item.dataset.floorName = floorName;
    item.dataset.floorNumber = floorNumber;
    item.dataset.isBasement = isBasement;
    item.innerHTML = `
        <div class="floor-item-title">${floorName}</div>
        <div class="form-group">
            <label for="floor-area-${id}" class="form-label">床面積（㎡）</label>
            <input type="number" id="floor-area-${id}" name="floor-area-${id}" class="form-input" min="0" step="0.01" value="0">
        </div>
        <div class="form-group">
            <label for="floor-use-${id}" class="form-label">用途</label>
            <select id="floor-use-${id}" name="floor-use-${id}" class="form-select">
                <option value="">選択してください</option>
                <option value="(1)項イ">(1)項イ 劇場、映画館、演芸場又は観覧場</option>
                <option value="(1)項ロ">(1)項ロ 公会堂又は集会場</option>
                <option value="(2)項イ">(2)項イ キャバレー、カフェー、ナイトクラブその他これらに類するもの</option>
                <option value="(2)項ロ">(2)項ロ 遊技場又はダンスホール</option>
                <option value="(2)項ハ">(2)項ハ 風俗営業等の規制及び業務の適正化等に関する法律に規定する性風俗関連特殊営業を営む店舗その他これに類するもの</option>
                <option value="(3)項イ">(3)項イ 待合、料理店その他これらに類するもの</option>
                <option value="(3)項ロ">(3)項ロ 飲食店</option>
                <option value="(4)項">(4)項 百貨店、マーケットその他の物品販売業を営む店舗又は展示場</option>
                <option value="(5)項イ">(5)項イ 旅館、ホテル、宿泊所その他これらに類するもの</option>
                <option value="(5)項ロ">(5)項ロ 寄宿舎、下宿又は共同住宅</option>
                <option value="(6)項イ">(6)項イ 病院、診療所又は助産所</option>
                <option value="(6)項ロ">(6)項ロ 老人福祉施設、有料老人ホーム、介護老人保健施設、救護施設、更生施設、児童福祉施設等</option>
                <option value="(6)項ハ">(6)項ハ 幼稚園、盲学校、聾学校又は養護学校</option>
                <option value="(7)項">(7)項 小学校、中学校、高等学校、中等教育学校、高等専門学校、大学、専修学校、各種学校その他これらに類するもの</option>
                <option value="(8)項">(8)項 図書館、博物館、美術館その他これらに類するもの</option>
                <option value="(9)項イ">(9)項イ 公衆浴場のうち、蒸気浴場、熱気浴場その他これらに類するもの</option>
                <option value="(9)項ロ">(9)項ロ イに掲げる公衆浴場以外の公衆浴場</option>
                <option value="(10)項">(10)項 車両の停車場又は船舶若しくは航空機の発着場</option>
                <option value="(11)項">(11)項 神社、寺院、教会その他これらに類するもの</option>
                <option value="(12)項イ">(12)項イ 工場又は作業場</option>
                <option value="(12)項ロ">(12)項ロ 映画スタジオ又はテレビスタジオ</option>
                <option value="(13)項イ">(13)項イ 自動車車庫又は駐車場</option>
                <option value="(13)項ロ">(13)項ロ 飛行機又は回転翼航空機の格納庫</option>
                <option value="(14)項">(14)項 倉庫</option>
                <option value="(15)項">(15)項 前各項に該当しない事業場</option>
                <option value="(16)項イ">(16)項イ 複合用途防火対象物（特定用途を含む）</option>
                <option value="(16)項ロ">(16)項ロ 複合用途防火対象物（その他）</option>
                <option value="(16の2)項">(16の2)項 地下街</option>
                <option value="(16の3)項">(16の3)項 地下道に面する建築物</option>
                <option value="(17)項">(17)項 重要文化財</option>
                <option value="駐車場">駐車場</option>
                <option value="道路">道路</option>
                <option value="通信機器室">通信機器室</option>
            </select>
        </div>
        <div class="checkbox-group">
            <label class="checkbox-label">
                <input type="checkbox" id="floor-windowless-${id}" name="floor-windowless-${id}" class="checkbox-input">
                <span class="checkbox-custom"></span>
                無窓階
            </label>
            <label class="checkbox-label">
                <input type="checkbox" id="floor-rooftop-${id}" name="floor-rooftop-${id}" class="checkbox-input">
                <span class="checkbox-custom"></span>
                屋上
            </label>
            <label class="checkbox-label">
                <input type="checkbox" id="floor-simultaneous-exit-${id}" name="floor-simultaneous-exit-${id}" class="checkbox-input" checked>
                <span class="checkbox-custom"></span>
                同時退出可能
            </label>
        </div>
        <div class="form-group">
            <label for="floor-specific-area-${id}" class="form-label">特定用途部分の面積（㎡）</label>
            <input type="number" id="floor-specific-area-${id}" name="floor-specific-area-${id}" class="form-input" min="0" step="0.01" value="0">
        </div>
        <div class="form-group">
            <label for="floor-specific-use-${id}" class="form-label">特定用途</label>
            <select id="floor-specific-use-${id}" name="floor-specific-use-${id}" class="form-select">
                <option value="">選択してください</option>
                <option value="(2)項イ">(2)項イ キャバレー、カフェー、ナイトクラブその他これらに類するもの</option>
                <option value="(2)項ロ">(2)項ロ 遊技場又はダンスホール</option>
                <option value="(2)項ハ">(2)項ハ 風俗営業等の規制及び業務の適正化等に関する法律に規定する性風俗関連特殊営業を営む店舗その他これに類するもの</option>
                <option value="(3)項イ">(3)項イ 待合、料理店その他これらに類するもの</option>
                <option value="(3)項ロ">(3)項ロ 飲食店</option>
                <option value="(16)項イ">(16)項イ 複合用途防火対象物（特定用途を含む）</option>
            </select>
        </div>
    `;
    
    // 階情報を内部的に保存
    item.dataset.floorName = floorName;
    item.dataset.floorNumber = floorNumber;
    item.dataset.isBasement = isBasement;
    
    container.appendChild(item);
}

/**
 * フォームデータを収集して建物情報オブジェクトを生成
 */
function collectData() {
    const 建物情報 = {
        主用途: document.getElementById('primary-use').value,
        延べ面積: parseFloat(document.getElementById('total-area').value) || 0,
        地上階数: parseInt(document.getElementById('ground-floors').value) || 0,
        地下階数: parseInt(document.getElementById('basement-floors').value) || 0,
        指定可燃物倍数: parseFloat(document.getElementById('flammable-multiplier').value) || 0,
        特定一階段フラグ: document.querySelector('input[name="specific-single-stair"]:checked')?.value === 'true',
        is小規模特複フラグ: document.querySelector('input[name="small-scale-complex"]:checked')?.value === 'true',
        複合用途リスト: [],
        階情報リスト: []
    };
    
    // 宿泊フラグの取得（(6)ハの場合）
    if (建物情報.主用途 === '(6)項ハ') {
        const accommodationRadio = document.querySelector('input[name="accommodation"]:checked');
        if (accommodationRadio) {
            建物情報.宿泊フラグ = accommodationRadio.value === 'true';
            // 複合用途リストに単一用途として追加
            建物情報.複合用途リスト.push({
                用途: '(6)項ハ',
                面積: 建物情報.延べ面積,
                入居宿泊フラグ: 建物情報.宿泊フラグ
            });
        }
    }
    
    // 特定用途合計面積の取得（(16の三)項の場合）
    if (建物情報.主用途 === '(16の三)項') {
        const specificAreaInput = document.getElementById('specific-use-total-area');
        if (specificAreaInput) {
            建物情報.特定用途合計面積 = parseFloat(specificAreaInput.value) || 0;
        }
    }
    
    // 複合用途の収集
    const complexUseItems = document.querySelectorAll('.use-item');
    complexUseItems.forEach(item => {
        const id = item.id.split('-')[2];
        const useType = document.getElementById(`complex-use-type-${id}`)?.value;
        const area = parseFloat(document.getElementById(`complex-use-area-${id}`)?.value) || 0;
        
        if (useType && area > 0) {
            const useItem = {
                用途: useType,
                面積: area,
                入居宿泊フラグ: null
            };
            
            // (6)ハの場合の宿泊フラグ
            if (useType === '(6)項ハ') {
                const accommodationRadio = document.querySelector(`input[name="complex-use-accommodation-${id}"]:checked`);
                if (accommodationRadio) {
                    useItem.入居宿泊フラグ = accommodationRadio.value === 'true';
                }
            }
            
            建物情報.複合用途リスト.push(useItem);
        }
    });
    
    // 階情報の収集（階情報セクションが展開されている場合のみ）
    const floorInfoContent = document.getElementById('floor-info-content');
    const isFloorInfoExpanded = floorInfoContent && !floorInfoContent.classList.contains('hidden');
    
    if (isFloorInfoExpanded) {
        const floorItems = document.querySelectorAll('.floor-item');
        floorItems.forEach(item => {
            const id = item.querySelector('input[type="number"]').id.split('-')[2];
            const floorName = item.dataset.floorName;
            const floorNumber = parseInt(item.dataset.floorNumber);
            const isBasement = item.dataset.isBasement === 'true';
            
            // 階情報が有効な場合のみ追加（階名とフロア番号が正しく設定されている場合）
            if (floorName && !isNaN(floorNumber)) {
                const floorInfo = {
                    階名: floorName,
                    階数: floorNumber,
                    is地階: isBasement,
                    床面積: parseFloat(document.getElementById(`floor-area-${id}`)?.value) || 0,
                    is無窓階: document.getElementById(`floor-windowless-${id}`)?.checked || false,
                    用途: document.getElementById(`floor-use-${id}`)?.value || '',
                    is屋上: document.getElementById(`floor-rooftop-${id}`)?.checked || false,
                    is同時退出可能: document.getElementById(`floor-simultaneous-exit-${id}`)?.checked || false,
                    特定用途部分の面積: parseFloat(document.getElementById(`floor-specific-area-${id}`)?.value) || 0,
                    特定用途: document.getElementById(`floor-specific-use-${id}`)?.value || ''
                };
                
                建物情報.階情報リスト.push(floorInfo);
            }
        });
    }
    
    return 建物情報;
}

/**
 * 判定結果を表示
 */
function displayResult(判定結果_令21, 特小判定結果, 建物情報) {
    const resultSection = document.getElementById('result-section');
    const resultContent = document.getElementById('result-content');
    
    resultContent.innerHTML = '';
    
    // 令第21条の判定結果カード
    const rei21Card = createResultCard(
        '自動火災報知設備の設置義務',
        判定結果_令21.根拠リスト.length > 0 ? '設置義務あり' : '設置義務なし',
        判定結果_令21.根拠リスト.length > 0 ? 'warning' : 'success'
    );
    
    if (判定結果_令21.根拠リスト.length > 0) {
        // generateResultDescription関数を使用して詳細な説明文を生成
        const fullDescription = generateResultDescription(判定結果_令21, 特小判定結果, 建物情報);
        
        // 令第21条の部分のみを抽出（特小判定結果より前の部分）
        const rei21Description = fullDescription.split('特定小規模施設用自動火災報知設備')[0].trim();
        
        rei21Card.querySelector('.result-details').textContent = rei21Description;
        
        // 階別判定が未実行の場合の注意表示（別要素として追加）
        if (判定結果_令21.階別判定未実行) {
            const noticeElement = document.createElement('div');
            noticeElement.className = 'judgment-notice';
            noticeElement.innerHTML = `
                <div class="notice-title">【ご注意】</div>
                <div class="notice-content">階別の詳細情報が入力されていないため、10号、11号、12号、13号、15号に該当するかどうかの判定は行われていません。</div>
            `;
            rei21Card.appendChild(noticeElement);
        }
        
        // 詳細判定ボタンを追加（階別判定が未実行の場合のみ）
        if (判定結果_令21.階別判定未実行) {
            const detailButton = document.createElement('button');
            detailButton.className = 'detail-judgment-button';
            detailButton.innerHTML = `
                <span class="material-icons">expand_more</span>
                詳細な部分判定を行う
            `;
            detailButton.onclick = function() {
                showFloorInfoSection();
            };
            rei21Card.appendChild(detailButton);
        }
    } else {
        rei21Card.querySelector('.result-details').textContent = 'この建物には自動火災報知設備の設置義務がありません。';
    }
    
    resultContent.appendChild(rei21Card);
    
    // 特小自火報の判定結果カード
    const tokushoCard = createResultCard(
        '特定小規模施設用自動火災報知設備',
        特小判定結果.設置可否,
        特小判定結果.設置可否 === '設置可能' ? 'success' : 
        特小判定結果.設置可否 === '判定対象外' ? 'warning' : 'error'
    );
    
    tokushoCard.querySelector('.result-details').textContent = 特小判定結果.根拠;
    resultContent.appendChild(tokushoCard);
    
    // 入力内容の確認カード
    const inputCard = createInputSummaryCard(建物情報);
    resultContent.appendChild(inputCard);
    
    // 結果セクションを表示
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 結果カードを作成
 */
function createResultCard(title, status, type) {
    const card = document.createElement('div');
    card.className = `result-card ${type}`;
    
    const iconMap = {
        success: 'check_circle',
        warning: 'warning',
        error: 'error'
    };
    
    card.innerHTML = `
        <div class="result-title">
            <span class="material-icons">${iconMap[type]}</span>
            ${title}
        </div>
        <div class="result-description">${status}</div>
        <div class="result-details"></div>
    `;
    
    return card;
}

/**
 * 入力内容サマリーカードを作成
 */
function createInputSummaryCard(建物情報) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    let summary = `主用途: ${建物情報.主用途}\n`;
    summary += `延べ面積: ${建物情報.延べ面積}㎡\n`;
    summary += `地上階数: ${建物情報.地上階数}階\n`;
    summary += `地下階数: ${建物情報.地下階数}階\n`;
    summary += `指定可燃物倍数: ${建物情報.指定可燃物倍数}\n`;
    summary += `特定一階段等防火対象物: ${建物情報.特定一階段フラグ ? 'はい' : 'いいえ'}\n`;
    
    if (建物情報.is小規模特複フラグ !== undefined) {
        summary += `小規模特複: ${建物情報.is小規模特複フラグ ? 'はい' : 'いいえ'}\n`;
    }
    
    if (建物情報.複合用途リスト.length > 0) {
        summary += '\n構成用途:\n';
        建物情報.複合用途リスト.forEach((item, index) => {
            summary += `• ${item.用途}: ${item.面積}㎡`;
            if (item.入居宿泊フラグ !== null) {
                summary += ` (宿泊: ${item.入居宿泊フラグ ? 'あり' : 'なし'})`;
            }
            summary += '\n';
        });
    }
    
    card.innerHTML = `
        <div class="result-title">
            <span class="material-icons">info</span>
            入力内容の確認
        </div>
        <div class="result-details">${summary}</div>
    `;
    
    return card;
}

/**
 * フォームをリセット
 */
function resetForm() {
    document.getElementById('building-form').reset();
    document.getElementById('dynamic-form').innerHTML = '';
    document.getElementById('result-section').classList.add('hidden');
    complexUseCounter = 0;
    floorInfoCounter = 0;
    updateForm();
}

/**
 * フォーム送信処理
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        const 建物情報 = collectData();
        
        // バリデーション
        const validation = validateBuildingInfo(建物情報);
        if (!validation.isValid) {
            showValidationErrors(validation.errors);
            return;
        }
        
        // 判定実行をメイン処理に委譲
        window.executeJudgment(建物情報);
        
    } catch (error) {
        console.error('フォーム送信エラー:', error);
        showError('判定処理中にエラーが発生しました。');
    }
}

/**
 * バリデーションエラーを表示
 */
function showValidationErrors(errors) {
    const errorMessage = errors.join('\n');
    showHelpModal('入力エラー', errorMessage);
}

/**
 * エラーメッセージを表示
 */
function showError(message) {
    console.error('エラー:', message);
    // デバッグモードの場合のみアラートを表示
    if (window.appConfig && window.appConfig.debug) {
        alert(message);
    }
}

/**
 * ヘルプクリック処理
 */
function handleHelpClick(event) {
    const helpIcon = event.target.closest('.help-icon');
    if (helpIcon) {
        const helpText = helpIcon.dataset.help;
        showHelpModal('ヘルプ', helpText);
    }
}

/**
 * ヘルプモーダルを表示
 */
function showHelpModal(title, content) {
    const modal = document.getElementById('help-modal');
    const titleElement = document.getElementById('help-title');
    const contentElement = document.getElementById('help-content');
    
    titleElement.textContent = title;
    // 改行文字を<br>タグに変換
    contentElement.innerHTML = content.replace(/\n/g, '<br>');
    modal.classList.add('show');
}

/**
 * ヘルプモーダルを非表示
 */
function hideHelpModal() {
    const modal = document.getElementById('help-modal');
    modal.classList.remove('show');
}

/**
 * 階情報セクションの表示/非表示を切り替え
 */
function toggleFloorInfoSection() {
    const content = document.getElementById('floor-info-content');
    const toggle = document.getElementById('floor-info-toggle');
    const icon = toggle.querySelector('.material-icons');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.textContent = 'expand_less';
        toggle.setAttribute('aria-expanded', 'true');
    } else {
        content.classList.add('hidden');
        icon.textContent = 'expand_more';
        toggle.setAttribute('aria-expanded', 'false');
    }
}

/**
 * 階情報のヘルプを表示
 */
function showFloorInfoHelp() {
    const helpText = '10号～15号など、特定の階や部分のみに設置義務があるか詳しく判定する場合に入力してください。\n\n対象となる判定：\n• 10号：地階・無窓階の特定用途部分\n• 11号：地階・無窓階・3階以上の判定\n• 12号：道路部分の判定\n• 13号：駐車場部分の判定\n• 15号：通信機器室の判定';
    showHelpModal('階別情報について', helpText);
}

/**
 * 階情報セクションを表示
 */
function showFloorInfoSection() {
    const section = document.querySelector('.floor-info-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // セクションが折りたたまれている場合は展開
        const content = document.getElementById('floor-info-content');
        const toggle = document.getElementById('floor-info-toggle');
        const icon = toggle?.querySelector('.material-icons');
        
        if (content && content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            if (icon) icon.textContent = 'expand_less';
            if (toggle) toggle.setAttribute('aria-expanded', 'true');
        }
    }
}

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', init);