import { initGUI, setKeyState } from './gui.js';
import { initKeys } from './keys.js';

(function () {
    'use strict';

    function start() {
        try {
            initGUI();
            initKeys(
                active => setKeyState('mic', active),
                active => setKeyState('audio', active),
            );
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
