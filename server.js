const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));

io.on('connection', (socket) => {
    // 管理者からの映像信号(Offer)を閲覧者に送る
    socket.on('offer', (data) => {
        socket.broadcast.emit('offer', data);
    });

    // 閲覧者からの応答(Answer)を管理者に送る
    socket.on('answer', (data) => {
        socket.broadcast.emit('answer', data);
    });

    // ネットワーク経路情報(ICE Candidate)の交換
    socket.on('candidate', (data) => {
        socket.broadcast.emit('candidate', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
