const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// 状態管理（現在のページと表示フラグ）
let state = {
    currentPage: 0,
    isVisible: true
};

io.on('connection', (socket) => {
    // 接続時に現在の状態を送信
    socket.emit('init', state);

    // 管理者からの操作を受信して全員に転送
    socket.on('admin-control', (data) => {
        state = { ...state, ...data };
        socket.broadcast.emit('update', state);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
