let _stream = null;
let _track  = null;

export async function requestMic() {
    if (_stream) return _stream;
    _stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    _track = _stream.getAudioTracks()[0];
    _track.enabled = false; // start muted
    console.log('[GulpyVC] mic ready');
    return _stream;
}

export function setMicActive(active) {
    if (_track) _track.enabled = active;
}

export function getMicStream() {
    return _stream;
}

export function getMicTrack() {
    return _track;
}
