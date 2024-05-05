let peerConnection;
let localStream;
let remoteStream;

let servers = {
    iceServers: [
        {
            urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }
    ]
}

let ws = new WebSocket('ws://localhost:8080/user1');


let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    document.getElementById('user-1').srcObject = localStream
}

let createPeerConnection = async () => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
    }

}


let createAnswer = async (offer) => {
    createPeerConnection('answer-sdp')

    if (!offer) return alert('Retrieve offer from peer first...')

    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    ws.send(JSON.stringify({ type: 'answer', answer: answer }));
}

init()

ws.onmessage = async (msg) => {
    let data = JSON.parse(msg.data)
    if (data.type === 'offer') {
        console.log("Received offer");

        await createAnswer(data);

    } else if (data.type === 'candidate') {
        console.log("Received candidate");
        await peerConnection.addIceCandidate(data.candidate);
    }
}

// document.getElementById('create-offer').addEventListener('click', createOffer)
// document.getElementById('create-answer').addEventListener('click', createAnswer)
// document.getElementById('add-answer').addEventListener('click', addAnswer)
