const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// 静的ファイルの場所を絶対パスで指定（403回避の鍵）
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// URL直打ち（https://.../）でadminを表示するように設定
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'admin.html'));
});

io.on('connection', (socket) => {
    socket.on('join-viewer', () => socket.broadcast.emit('viewer-joined'));
    socket.on('offer', (data) => socket.broadcast.emit('offer', data));
    socket.on('answer', (data) => socket.broadcast.emit('answer', data));
    socket.on('candidate', (data) => socket.broadcast.emit('candidate', data));
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
