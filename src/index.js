import { initGUI, setKeyState } from './gui.js';
import { initKeys } from './keys.js';
import { initSession, getSessionKey } from './session.js';
import { initPlayers, debugPlayers } from './players.js';

const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

(function () {
    'use strict';

    // Session + players hooks must run before DOM is ready
    initSession();
    initPlayers();

    // Expose debug helper to console
    win._gulpyvc = { debug: debugPlayers, session: getSessionKey };

    function start() {
        try {
            initGUI();
            initKeys(
                active => setKeyState('mic', active),
                active => setKeyState('audio', active),
            );

            // Print session info once DOM is ready
            console.log('[GulpyVC] ready | session:', getSessionKey() ?? '(not connected yet)');
        } catch (e) {
            console.error('[GulpyVC] Init error:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
