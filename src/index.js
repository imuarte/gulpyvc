import { initGUI, setKeyState } from './gui.js';
import { initKeys } from './keys.js';
import { initSession, getSessionKey } from './session.js';
import { initPlayers, getSessionPlayers, debugPlayers } from './players.js';
import { requestMic, setMicActive } from './mic.js';
import { connectSignaling } from './signaling.js';
import { initWebRTC, addMicToPeers } from './webrtc.js';

const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

let _micReady  = false;
let _localId   = null;
let _localNick = null;
let _connected = false;

async function onMicChange(active) {
    if (active && !_micReady) {
        try {
            await requestMic();
            _micReady = true;
            addMicToPeers();
        } catch (e) {
            console.warn('[GulpyVC] mic permission denied:', e.message);
            setKeyState('mic', false);
            return;
        }
    }
    setMicActive(active);
    setKeyState('mic', active);

    // Connect to signaling on first mic enable
    if (active && !_connected && getSessionKey()) {
        _connected = true;
        const me = getSessionPlayers().find(p => p.id === _localId) || getSessionPlayers()[0];
        _localNick = me?.nick || 'Player';
        connectSignaling(getSessionKey(), _localId || 'unknown', _localNick);
    }
}

function onAudioChange(active) {
    setKeyState('audio', active);
}

(function () {
    'use strict';

    // Must run before DOM - hooks WebSocket and Map
    initSession();
    initPlayers();

    win._gulpyvc = { debug: debugPlayers, session: getSessionKey };

    function start() {
        try {
            initWebRTC();
            initGUI();
            initKeys(onMicChange, onAudioChange);
            console.log('[GulpyVC] ready | session:', getSessionKey() ?? '(not yet connected)');
        } catch (e) {
            console.error('[GulpyVC] init error:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
