const socket = io();
let currentRole = 'viewer';
let currentState = { currentPage: 0, isVisible: true };

// スライドのベースURL（ご提示いただいたIDを使用）
const SLIDE_ID = "2PACX-1vSpub-fOzG-SkXTwVkrR4JidqMnhW5XCBZDhzHrzKG-v8VES0YAYdYgAh-n14fzug4klVsy8l5e1QaT";
const BASE_URL = `https://docs.google.com/presentation/d/e/${SLIDE_ID}/pubembed`;

// スライドの枚数（スライドに合わせて調整してください）
const TOTAL_PAGES = 10; 

function setRole(role) {
    currentRole = role;
    document.getElementById('role-selection').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    if (role === 'admin') {
        document.getElementById('admin-controls').classList.remove('hidden');
    }
    initThumbnails();
}

function initThumbnails() {
    const list = document.getElementById('thumbnail-list');
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

    // スライドのURLを更新（&slide= パラメータでページ指定）
    frame.src = `${BASE_URL}?start=false&loop=false&delayms=2000&slide=${state.currentPage}`;
    
    // 表示・非表示の切り替え
    state.isVisible ? overlay.classList.add('hidden') : overlay.classList.remove('hidden');

    // サイドバーのハイライト更新
    document.querySelectorAll('.thumb').forEach(el => el.classList.remove('active'));
    document.getElementById(`thumb-${state.currentPage}`)?.classList.add('active');
});

// 管理者用：状態更新関数
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
