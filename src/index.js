import { initGUI, setKeyState, setCallback } from './gui.js';
import { initKeys } from './keys.js';
import { initSession, getSessionKey } from './session.js';
import { initPlayers, getSessionPlayers, debugPlayers, getLocalNick } from './players.js';
import { requestMic, setMicActive } from './mic.js';
import { connectSignaling } from './signaling.js';
import { initWebRTC, addMicToPeers, setLocalPeer, startLocalAnalyser } from './webrtc.js';
import { initPanel } from './panel.js';
import { state } from './state.js';

const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

let _micReady  = false;
let _connected = false;

async function onMicChange(active) {
    // First enable: request mic permission
    if (active && !_micReady) {
        try {
            await requestMic();
            _micReady = true;
            addMicToPeers();
            startLocalAnalyser();
        } catch (e) {
            console.warn('[GulpyVC] mic permission denied:', e.message);
            // revert visual
            state.mic = false;
            setKeyState('mic', false);
            return;
        }
    }

    // Update state and visual
    state.mic = active;
    setMicActive(active);
    setKeyState('mic', active);

    // Connect to signaling on first mic enable
    if (active && !_connected && getSessionKey()) {
        _connected = true;
        const me = getSessionPlayers()[0];
        const nick = me?.nick || 'Player';
        setLocalPeer(nick);
        connectSignaling(getSessionKey(), me?.id ?? 'unknown', nick);
    }
}

function onAudioChange(active) {
    state.audio = active;
    setKeyState('audio', active);
}

(function () {
    'use strict';

    initSession();
    initPlayers();

    win._gulpyvc = { debug: debugPlayers, session: getSessionKey };

    function start() {
        try {
            initWebRTC();
            initGUI();
            initPanel();
            setCallback('mic',   onMicChange);
            setCallback('audio', onAudioChange);
            initKeys(onMicChange, onAudioChange);

            // Show local player immediately - try DOM nick, fall back to game players
            const earlyNick = getLocalNick()
                || getSessionPlayers()[0]?.nick
                || 'You';
            setLocalPeer(earlyNick);

            // If nick input is empty now, update once the user types it
            const nickInput = document.querySelector('#nick-input');
            if (nickInput) {
                nickInput.addEventListener('input', () => {
                    if (nickInput.value.trim()) setLocalPeer(nickInput.value.trim());
                });
            }

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
