const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'admin.html'));
});

io.on('connection', (socket) => {
    // 閲覧者が「入りました」と通知
    socket.on('join-viewer', () => {
        // 管理者に、新しく来た人のIDを添えて「配信して！」と頼む
        socket.broadcast.emit('viewer-joined', socket.id);
    });

    // 特定の相手(to)へ信号を転送
    socket.on('offer', (data) => {
        socket.to(data.to).emit('offer', { from: socket.id, offer: data.offer });
    });

    socket.on('answer', (data) => {
        socket.to(data.to).emit('answer', { from: socket.id, answer: data.answer });
    });

    socket.on('candidate', (data) => {
        socket.to(data.to).emit('candidate', { from: socket.id, candidate: data.candidate });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-left', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
