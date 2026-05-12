const SIGNAL_URL = 'wss://gulpyvc-signal.fly.dev';

let _ws        = null;
let _sessionKey = null;
let _peerId    = null;
let _nick      = null;
let _handlers  = {};

export function onSignal(type, fn) {
    _handlers[type] = fn;
}

function dispatch(msg) {
    const fn = _handlers[msg.type];
    if (fn) fn(msg);
}

export function connectSignaling(sessionKey, peerId, nick) {
    // If already connected to same session, just update nick via re-join
    if (_ws && _ws.readyState === 1 && _sessionKey === sessionKey) {
        _nick = nick;
        _ws.send(JSON.stringify({ type: 'join', session: _sessionKey, peerId: _peerId, nick }));
        return;
    }
    if (_ws && _ws.readyState <= 1) _ws.close();

    _sessionKey = sessionKey;
    _peerId     = String(peerId);
    _nick       = nick;

    _ws = new WebSocket(SIGNAL_URL);

    _ws.onopen = () => {
        _ws.send(JSON.stringify({ type: 'join', session: _sessionKey, peerId: _peerId, nick: _nick }));
        console.log('[GulpyVC] signaling connected');
    };

    _ws.onmessage = e => {
        try { dispatch(JSON.parse(e.data)); } catch {}
    };

    _ws.onclose = () => {
        console.log('[GulpyVC] signaling disconnected');
        _ws = null;
        // reconnect after 3s
        setTimeout(() => connectSignaling(_sessionKey, _peerId, _nick), 3000);
    };
}

export function sendSignal(msg) {
    if (_ws && _ws.readyState === 1) _ws.send(JSON.stringify(msg));
}
