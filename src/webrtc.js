import { getMicStream } from './mic.js';
import { sendSignal, onSignal } from './signaling.js';

const STUN = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const SPEAKING_THRESHOLD = 12;
const SPEAKING_POLL_MS   = 80;

// peerId -> RTCPeerConnection
const _peers = new Map();

// peerId -> { nick, speaking, audioCtx, analyser }
const _info = new Map();

let _localInfo = null; // { nick, speaking, analyser }
let _audioCtx  = null;
let _onChange  = null;

export function onPeerListChange(fn) { _onChange = fn; }

export function getPeerList() {
    const list = [];
    if (_localInfo) list.push({ id: '__local__', ..._localInfo, local: true });
    for (const [id, info] of _info) list.push({ id, ...info, local: false });
    return list;
}

export function setLocalPeer(nick) {
    _localInfo = { nick, speaking: false, analyser: null };
    _onChange?.();
}

function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new AudioContext();
    return _audioCtx;
}

function startAnalyser(stream, onSpeaking) {
    try {
        const ctx = getAudioCtx();
        const source   = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);

        const id = setInterval(() => {
            analyser.getByteFrequencyData(buf);
            const level = buf.reduce((a, b) => a + b, 0) / buf.length;
            onSpeaking(level > SPEAKING_THRESHOLD);
        }, SPEAKING_POLL_MS);

        return () => clearInterval(id);
    } catch { return () => {}; }
}

export function startLocalAnalyser() {
    const stream = getMicStream();
    if (!stream || !_localInfo) return;
    startAnalyser(stream, speaking => {
        if (_localInfo.speaking !== speaking) {
            _localInfo.speaking = speaking;
            _onChange?.();
        }
    });
}

function createPeer(remoteId, polite, nick) {
    if (_peers.has(remoteId)) return _peers.get(remoteId);

    const pc = new RTCPeerConnection(STUN);
    _peers.set(remoteId, pc);
    _info.set(remoteId, { nick: nick || remoteId, speaking: false });
    _onChange?.();

    const stream = getMicStream();
    if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));

    pc.ontrack = ({ streams }) => {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.srcObject = streams[0];
        audio.dataset.gulpyvc = remoteId;
        document.body.appendChild(audio);

        // speaking detection for this peer
        startAnalyser(streams[0], speaking => {
            const info = _info.get(remoteId);
            if (info && info.speaking !== speaking) {
                info.speaking = speaking;
                _onChange?.();
            }
        });
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

    pc._polite = polite;
    return pc;
}

function removePeer(id) {
    const pc = _peers.get(id);
    if (pc) { pc.close(); _peers.delete(id); }
    _info.delete(id);
    _onChange?.();
}

export function initWebRTC() {
    onSignal('peers', ({ peers }) => {
        for (const p of peers) createPeer(p.id, true, p.nick);
    });

    onSignal('peer-joined', ({ id, nick }) => {
        createPeer(id, false, nick);
    });

    onSignal('peer-left', ({ id }) => removePeer(id));

    onSignal('offer', async ({ from, sdp }) => {
        const pc = createPeer(from, true);
        const offerCollision = sdp.type === 'offer' && (pc._makingOffer || pc.signalingState !== 'stable');
        if (offerCollision && !pc._polite) return;
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
        if (pc) try { await pc.setRemoteDescription(sdp); } catch {}
    });

    onSignal('ice', async ({ from, candidate }) => {
        const pc = _peers.get(from);
        if (pc) try { await pc.addIceCandidate(candidate); } catch {}
    });

    // Mute/unmute audio element when remote peer changes mic state
    onSignal('mic-state', ({ from, active }) => {
        const audio = document.querySelector(`audio[data-gulpyvc="${from}"]`);
        if (audio) audio.muted = !active;

        // Update speaking dot state
        const info = _info.get(from);
        if (info && !active) {
            info.speaking = false;
            _onChange?.();
        }
    });
}

// mute/unmute all remote audio elements
export function setAudioEnabled(enabled) {
    document.querySelectorAll('audio[data-gulpyvc]').forEach(a => { a.muted = !enabled; });
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
