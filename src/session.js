const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

let _server = null;
let _roomPath = null;
let _ws = null;

export function getServer()   { return _server; }
export function getRoomPath() { return _roomPath; }
export function getSessionKey() {
    if (!_server) return null;
    return _roomPath ? `${_server}${_roomPath}` : _server;
}

export function initSession() {
    const OrigWS = win.WebSocket;

    function HookedWS(url, protocols) {
        const ws = protocols ? new OrigWS(url, protocols) : new OrigWS(url);
        try {
            const u = new URL(url);
            _server   = u.host;
            _roomPath = u.pathname !== '/' ? u.pathname : (u.searchParams.get('room') || null);
            _ws = ws;
            console.log('[GulpyVC] session:', getSessionKey());
        } catch {}
        return ws;
    }

    Object.setPrototypeOf(HookedWS, OrigWS);
    HookedWS.prototype = OrigWS.prototype;
    win.WebSocket = HookedWS;
}
