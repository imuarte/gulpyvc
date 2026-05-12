import { initGUI, setKeyState, setCallback } from './gui.js';
import { initKeys } from './keys.js';
import { initSession, onSessionReady, getSessionKey } from './session.js';
import { initPlayers, getSessionPlayers, debugPlayers, getLocalNick } from './players.js';
import { requestMic, setMicActive } from './mic.js';
import { connectSignaling, sendSignal } from './signaling.js';
import { initWebRTC, addMicToPeers, setLocalPeer, startLocalAnalyser, setAudioEnabled } from './webrtc.js';
import { initPanel } from './panel.js';
import { state } from './state.js';

const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

// Unique ID for signaling (independent of game player ID)
const SIGNAL_ID = Math.random().toString(36).slice(2, 10);

let _micReady = false;

async function onMicChange(active) {
    if (active && !_micReady) {
        try {
            await requestMic();
            _micReady = true;
            addMicToPeers();
            startLocalAnalyser();
        } catch (e) {
            console.warn('[GulpyVC] mic permission denied:', e.message);
            state.mic = false;
            setKeyState('mic', false);
            return;
        }
    }

    state.mic = active;
    setMicActive(active);
    setKeyState('mic', active);

    // Tell peers our mic state so they can mute us on their end
    sendSignal({ type: 'mic-state', active });
}

function onAudioChange(active) {
    state.audio = active;
    setAudioEnabled(active);
    setKeyState('audio', active);
}

function resolveNick() {
    return getLocalNick()
        || getSessionPlayers()[0]?.nick
        || 'Player';
}

(function () {
    'use strict';

    initSession();
    initPlayers();

    win._gulpyvc = { debug: debugPlayers, session: getSessionKey };

    // Auto-connect to signaling when game session is detected
    onSessionReady(sessionKey => {
        // _ghGame.$me.$bp is set slightly after WebSocket connect - give it a tick
        setTimeout(() => {
            const nick = resolveNick();
            setLocalPeer(nick);
            connectSignaling(sessionKey, SIGNAL_ID, nick);
            console.log('[GulpyVC] joining session:', sessionKey, 'as', nick);
        }, 500);
    });

    function start() {
        try {
            initWebRTC();
            initGUI();
            initPanel();
            setCallback('mic',   onMicChange);
            setCallback('audio', onAudioChange);
            initKeys(onMicChange, onAudioChange);

            // Show self immediately even before session is ready
            const nick = resolveNick();
            setLocalPeer(nick);

            // Update nick if user changes it in the input
            const nickInput = document.querySelector('#nick-input');
            if (nickInput) {
                nickInput.addEventListener('input', () => {
                    if (nickInput.value.trim()) setLocalPeer(nickInput.value.trim());
                });
            }

            console.log('[GulpyVC] ready');
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
