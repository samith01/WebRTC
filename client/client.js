let peerConnection;
let localStream;
let remoteStream;

let servers = {
    iceServers:[
        {
            urls:['stun:stun1.1.google.com:19302']
        }
    ]
}

let ws = new WebSocket('wss://nlj8mtrg-1000.asse.devtunnels.ms/user1');

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    document.getElementById('user-1').srcObject = localStream
    // createOffer();
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
            console.log("sent candidate");
        }
    }
}

let createOffer = async () => {
    await createPeerConnection('offer-sdp')

    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    offer = JSON.stringify(offer);
    document.getElementById('offer-sdp').value = offer;
    ws.send(offer);
    // console.log("sent offer")
}


let addAnswer = async (answer) => {
    
    if(!answer) return alert('Failed to connect');
    document.getElementById('answer-sdp').value = JSON.stringify(answer);

    if(!peerConnection.currentRemoteDescription){
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    }
}

init()
ws.onopen = () => {
    console.log('WebSocket connection established.');
    createOffer(); // Send offer once WebSocket is open
};

ws.onmessage = async (msg) => {
    let data = JSON.parse(msg.data);
    if (data.type === "answer" ){
        addAnswer(data.answer);
    }
    if (data.type === "candidate" ){
        await peerConnection.addIceCandidate(data.candidate);
    }
}

// document.getElementById('create-offer').addEventListener('click', createOffer)
// document.getElementById('create-answer').addEventListener('click', createAnswer)
// document.getElementById('add-answer').addEventListener('click', addAnswer)
