const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;

// session key -> Map<peerId, { ws, nick }>
const sessions = new Map();

const wss = new WebSocketServer({ port: PORT });

function getOrCreateSession(key) {
    if (!sessions.has(key)) sessions.set(key, new Map());
    return sessions.get(key);
}

function broadcast(session, msg, excludeId) {
    const data = JSON.stringify(msg);
    for (const [id, peer] of session) {
        if (id !== excludeId && peer.ws.readyState === 1) {
            peer.ws.send(data);
        }
    }
}

function relay(session, to, msg) {
    const peer = session.get(to);
    if (peer && peer.ws.readyState === 1) peer.ws.send(JSON.stringify(msg));
}

wss.on('connection', ws => {
    let sessionKey = null;
    let peerId     = null;
    let session    = null;

    ws.on('message', raw => {
        let msg;
        try { msg = JSON.parse(raw); } catch { return; }

        if (msg.type === 'join') {
            const newNick = msg.nick || '?';
            // Re-join: nick update only, no new peer notification
            if (session && peerId && session.has(peerId)) {
                session.get(peerId).nick = newNick;
                broadcast(session, { type: 'peer-nick', id: peerId, nick: newNick }, peerId);
                console.log(`[~] ${peerId} nick updated to "${newNick}"`);
                return;
            }

            sessionKey = msg.session;
            peerId     = String(msg.peerId);
            session    = getOrCreateSession(sessionKey);

            const existing = Array.from(session.entries()).map(([id, p]) => ({ id, nick: p.nick }));
            session.set(peerId, { ws, nick: newNick });

            ws.send(JSON.stringify({ type: 'peers', peers: existing }));
            broadcast(session, { type: 'peer-joined', id: peerId, nick: newNick }, peerId);
            console.log(`[+] ${peerId} "${newNick}" joined ${sessionKey} (${session.size} in session)`);
            return;
        }

        if (!session) return;

        if (msg.type === 'offer' || msg.type === 'answer' || msg.type === 'ice') {
            relay(session, String(msg.to), { ...msg, from: peerId });
        }

        if (msg.type === 'mic-state') {
            broadcast(session, { type: 'mic-state', from: peerId, active: msg.active }, peerId);
        }
    });

    ws.on('close', () => {
        if (!session || !peerId) return;
        session.delete(peerId);
        broadcast(session, { type: 'peer-left', id: peerId });
        if (session.size === 0) sessions.delete(sessionKey);
        console.log(`[-] ${peerId} left ${sessionKey} (${session.size} remaining)`);
    });
});

console.log(`[GulpyVC signaling] listening on :${PORT}`);
