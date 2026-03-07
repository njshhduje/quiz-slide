<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>閲覧者 - ライブ配信</title>
    <script src="/socket.io/socket.io.js"></script>
    <style>
        /* 画面全体を黒背景にし、余計な隙間をなくす */
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            font-family: sans-serif;
        }

        /* 待機中のメッセージスタイル */
        #status-message {
            color: white;
            font-size: 1.5rem;
            z-index: 10;
            text-align: center;
        }

        /* ビデオのスタイル：最初は非表示 */
        video {
            display: none;
            width: 100vw;
            height: 100vh;
            object-fit: contain; /* アスペクト比を維持して最大化 */
        }

        /* 映像があるとき用のクラス */
        .playing video {
            display: block;
        }
        .playing #status-message {
            display: none;
        }
    </style>
</head>
<body>

    <div id="status-message">
        <p>📡 配信を待機しています...</p>
        <p style="font-size: 0.9rem; color: #aaa;">管理者が共有を開始すると自動的に表示されます</p>
    </div>

    <video id="remoteVideo" autoplay playsinline></video>

    <script>
        const socket = io();
        const remoteVideo = document.getElementById('remoteVideo');
        const statusMessage = document.getElementById('status-message');
        let peerConnection;
        const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

        // 参加したことをサーバー経由で管理者に通知
        socket.emit('join-viewer');

        socket.on('offer', async (offer) => {
            peerConnection = new RTCPeerConnection(config);
            
            peerConnection.ontrack = (event) => {
                // 映像ストリームを受け取った時の処理
                remoteVideo.srcObject = event.streams[0];
                
                // 映像が流れ始めたら表示を切り替え
                remoteVideo.onloadedmetadata = () => {
                    document.body.classList.add('playing');
                };
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) socket.emit('candidate', event.candidate);
            };

            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('answer', answer);
        });

        socket.on('candidate', async (candidate) => {
            if (peerConnection) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        // 接続が切れた場合の処理
        socket.on('disconnect', () => {
            document.body.classList.remove('playing');
        });
    </script>
</body>
</html>
