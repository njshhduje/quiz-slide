const socket = io();
let currentRole = 'viewer';
let currentState = { currentPage: 0, isVisible: true };

// 提供されたベースURL
const SLIDE_URL = "https://docs.google.com/presentation/d/e/2PACX-1vSpub-fOzG-SkXTwVkrR4JidqMnhW5XCBZDhzHrzKG-v8VES0YAYdYgAh-n14fzug4klVsy8l5e1QaT/pubembed";

// スライドの総枚数（実際のスライド枚数に合わせて書き換えてください）
const TOTAL_PAGES = 15; 

function setRole(role) {
    currentRole = role;
    document.getElementById('role-selection').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    if (role === 'admin') {
        document.getElementById('admin-controls').classList.remove('hidden');
    }
    initThumbnails();
}

// 左側のスライド一覧を生成
function initThumbnails() {
    const list = document.getElementById('thumbnail-list');
    list.innerHTML = ''; // 初期化
    for (let i = 0; i < TOTAL_PAGES; i++) {
        const div = document.createElement('div');
        div.className = 'thumb';
        div.innerText = `Slide ${i + 1}`;
        div.onclick = () => { if(currentRole === 'admin') updateState({currentPage: i}); };
        div.id = `thumb-${i}`;
        list.appendChild(div);
    }
}

// サーバーからの同期信号を受信
socket.on('sync', (state) => {
    currentState = state;
    const frame = document.getElementById('slide-frame');
    const overlay = document.getElementById('black-out');

    // Googleスライドのページ切り替えURLを生成
    // ブラウザのキャッシュ対策として t= (タイムスタンプ) を付与
    const timestamp = new Date().getTime();
    const newSrc = `${SLIDE_URL}?start=false&loop=false&delayms=3000&slide=${state.currentPage}&t=${timestamp}`;
    
    // 現在のURLと異なる場合のみ更新（チラつき防止）
    if (frame.src !== newSrc) {
        frame.src = newSrc;
    }
    
    // 表示・非表示の切り替え
    if (state.isVisible) {
        overlay.classList.add('hidden');
    } else {
        overlay.classList.remove('hidden');
    }

    // サイドバーのハイライト更新
    document.querySelectorAll('.thumb').forEach(el => el.classList.remove('active'));
    const activeThumb = document.getElementById(`thumb-${state.currentPage}`);
    if (activeThumb) {
        activeThumb.classList.add('active');
        // アクティブなスライドまでサイドバーを自動スクロール
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

// 管理者用：状態更新をサーバーへ送信
function updateState(newData) {
    socket.emit('admin-action', newData);
}

function changePage(step) {
    let next = currentState.currentPage + step;
    if (next >= 0 && next < TOTAL_PAGES) {
        updateState({ currentPage: next });
    }
}

function toggleVisibility() {
    updateState({ isVisible: !currentState.isVisible });
}
