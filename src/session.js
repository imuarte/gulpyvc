const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

let _server    = null;
let _roomPath  = null;
let _onReady   = null;

export function getServer()   { return _server; }
export function getRoomPath() { return _roomPath; }
export function onSessionReady(fn) { _onReady = fn; }

export function getSessionKey() {
    if (!_server) return null;
    const path = _roomPath ? _roomPath.replace(/\/\d+$/, '') : null;
    return path ? `${_server}${path}` : _server;
}

export function initSession() {
    const OrigWS = win.WebSocket;

    function HookedWS(url, protocols) {
        const ws = protocols ? new OrigWS(url, protocols) : new OrigWS(url);
        try {
            const u = new URL(url);
            // Only fire for actual game connections (has /game/ in path)
            if (!u.pathname.includes('/game/')) return ws;

            const prevKey = getSessionKey();
            _server   = u.host;
            _roomPath = u.pathname !== '/' ? u.pathname : (u.searchParams.get('room') || null);

            // Fire only on new session (not reconnects to same room)
            if (getSessionKey() !== prevKey) _onReady?.(getSessionKey());
        } catch {}
        return ws;
    }

    Object.setPrototypeOf(HookedWS, OrigWS);
    HookedWS.prototype = OrigWS.prototype;
    win.WebSocket = HookedWS;
}
