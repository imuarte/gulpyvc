import { getMicStream } from './mic.js';
import { sendSignal, onSignal } from './signaling.js';

const STUN = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// peerId -> RTCPeerConnection
const _peers = new Map();

function createPeer(remoteId, polite) {
    if (_peers.has(remoteId)) return _peers.get(remoteId);

    const pc = new RTCPeerConnection(STUN);
    _peers.set(remoteId, pc);

    // Add mic track
    const stream = getMicStream();
    if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));

    // Play remote audio
    pc.ontrack = ({ streams }) => {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.srcObject = streams[0];
        document.body.appendChild(audio);
    };

    pc.onicecandidate = ({ candidate }) => {
        if (candidate) sendSignal({ type: 'ice', to: remoteId, candidate });
    };

    pc.onnegotiationneeded = async () => {
        try {
            await pc.setLocalDescription();
            sendSignal({ type: 'offer', to: remoteId, sdp: pc.localDescription });
        } catch (e) {
            console.error('[GulpyVC] offer error', e);
        }
    };

    // Perfect negotiation - polite peer rolls back on collision
    pc.onsignalingstatechange = () => {};

    pc._polite = polite;
    pc._makingOffer = false;
    return pc;
}

function removePeer(id) {
    const pc = _peers.get(id);
    if (pc) { pc.close(); _peers.delete(id); }
}

export function initWebRTC() {
    onSignal('peers', ({ peers }) => {
        for (const p of peers) {
            console.log('[GulpyVC] existing peer:', p.id, p.nick);
            createPeer(p.id, true); // we are polite to existing peers
        }
    });

    onSignal('peer-joined', ({ id, nick }) => {
        console.log('[GulpyVC] peer joined VC:', id, nick);
        createPeer(id, false); // they joined after us, we are impolite
    });

    onSignal('peer-left', ({ id }) => {
        console.log('[GulpyVC] peer left VC:', id);
        removePeer(id);
    });

    onSignal('offer', async ({ from, sdp }) => {
        const pc = createPeer(from, true);
        const offerCollision = sdp.type === 'offer' && (pc._makingOffer || pc.signalingState !== 'stable');
        if (offerCollision && !pc._polite) return; // impolite: ignore
        try {
            await pc.setRemoteDescription(sdp);
            if (sdp.type === 'offer') {
                await pc.setLocalDescription();
                sendSignal({ type: 'answer', to: from, sdp: pc.localDescription });
            }
        } catch (e) {
            console.error('[GulpyVC] offer handling error', e);
        }
    });

    onSignal('answer', async ({ from, sdp }) => {
        const pc = _peers.get(from);
        if (!pc) return;
        try { await pc.setRemoteDescription(sdp); } catch {}
    });

    onSignal('ice', async ({ from, candidate }) => {
        const pc = _peers.get(from);
        if (!pc) return;
        try { await pc.addIceCandidate(candidate); } catch {}
    });
}

export function addMicToPeers() {
    const stream = getMicStream();
    if (!stream) return;
    for (const pc of _peers.values()) {
        if (pc.getSenders().length === 0) {
            stream.getTracks().forEach(t => pc.addTrack(t, stream));
        }
    }
}
