const express = require('express');
const path = require('path'); // 追加
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// path.joinを使って絶対パスで指定する（403回避に有効）
app.use(express.static(path.join(__dirname, 'public')));

// ルートにアクセスした時にadminへ飛ばす設定（任意）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

io.on('connection', (socket) => {
    socket.on('join-viewer', () => socket.broadcast.emit('viewer-joined'));
    socket.on('offer', (data) => socket.broadcast.emit('offer', data));
    socket.on('answer', (data) => socket.broadcast.emit('answer', data));
    socket.on('candidate', (data) => socket.broadcast.emit('candidate', data));
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
