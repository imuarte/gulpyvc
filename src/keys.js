import { state } from './state.js';
import { toggleUIVisible } from './gui.js';

export function initKeys(onMicChange, onAudioChange) {
    const isTyping = () => ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

    document.addEventListener('keydown', e => {
        if (isTyping()) return;
        if (e.repeat) return;

        if (e.code === 'KeyM') {
            state.mic = !state.mic;
            onMicChange(state.mic);
        }
        if (e.code === 'KeyH') {
            state.audio = !state.audio;
            onAudioChange(state.audio);
        }
        if (e.code === 'KeyV') {
            state.mic = true;
            onMicChange(true);
        }
        if (e.code === 'KeyU') {
            toggleUIVisible();
        }
    });

    document.addEventListener('keyup', e => {
        if (e.code === 'KeyV') {
            state.mic = false;
            onMicChange(false);
        }
    });
}
