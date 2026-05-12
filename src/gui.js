import { state } from './state.js';
import micSVG from './assets/microphone.svg';
import headSVG from './assets/headphones.svg';

const COLOR_ON  = '#ffffff';
const COLOR_OFF = '#e06060';

// diagonal length of a 24x24 box: sqrt(15^2+15^2) ≈ 21.2
const SLASH_LEN = 21.2;

const SLASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none">
  <line class="gulpyvc-slash" x1="19" y1="4" x2="4" y2="19"
    stroke="${COLOR_OFF}" stroke-width="2.5" stroke-linecap="round"
    stroke-dasharray="${SLASH_LEN}" stroke-dashoffset="${SLASH_LEN}"/>
</svg>`;

const CSS = `
@keyframes gulpyvc-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes gulpyvc-erase {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: ${SLASH_LEN}; }
}
@keyframes gulpyvc-bounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(0.91); }
  70%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}
#gulpyvc-bar > div {
  transition: opacity 0.15s;
}
#gulpyvc-bar > div svg {
  transition: color 0.2s ease;
}
`;

const BTNS = [
    { key: 'mic',   svg: micSVG,  title: 'Microphone' },
    { key: 'audio', svg: headSVG, title: 'Audio' },
];

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
}

function makeButton({ key, svg, title }) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
        position: 'relative',
        width: '28px',
        height: '28px',
        cursor: 'pointer',
        flexShrink: '0',
    });
    wrap.title = title;

    const icon = document.createElement('div');
    icon.innerHTML = svg;
    Object.assign(icon.style, {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });
    const svgEl = icon.querySelector('svg');
    if (svgEl) Object.assign(svgEl.style, { width: '24px', height: '24px', display: 'block' });

    const slash = document.createElement('div');
    slash.innerHTML = SLASH_SVG;
    Object.assign(slash.style, {
        position: 'absolute',
        top: '0', left: '0',
        width: '100%', height: '100%',
        pointerEvents: 'none',
    });

    wrap.appendChild(icon);
    wrap.appendChild(slash);

    applyState(wrap, icon, slash, state[key], false);

    wrap.addEventListener('click', () => {
        state[key] = !state[key];
        applyState(wrap, icon, slash, state[key], true);

        wrap.style.animation = 'none';
        wrap.offsetWidth; // reflow to restart
        wrap.style.animation = 'gulpyvc-bounce 0.28s ease';
    });

    return wrap;
}

function applyState(wrap, icon, slash, active, animate) {
    const svgEl = icon.querySelector('svg');
    if (svgEl) svgEl.style.color = active ? COLOR_ON : COLOR_OFF;

    const line = slash.querySelector('.gulpyvc-slash');
    if (!line) return;

    // cancel any running animation first
    line.style.animation = 'none';
    line.offsetWidth; // reflow

    if (active) {
        if (animate) {
            line.style.strokeDashoffset = '0';
            line.style.animation = 'gulpyvc-erase 0.2s ease forwards';
            line.addEventListener('animationend', () => {
                slash.style.display = 'none';
                line.style.strokeDashoffset = String(SLASH_LEN);
                line.style.animation = 'none';
            }, { once: true });
        } else {
            slash.style.display = 'none';
            line.style.strokeDashoffset = String(SLASH_LEN);
        }
    } else {
        slash.style.display = 'block';
        line.style.strokeDashoffset = String(SLASH_LEN);
        line.offsetWidth; // reflow
        if (animate) {
            line.style.animation = 'gulpyvc-draw 0.22s ease forwards';
        } else {
            line.style.strokeDashoffset = '0';
        }
    }
}

const btnRefs = {};

export function setKeyState(key, active) {
    const ref = btnRefs[key];
    if (!ref) return;
    applyState(ref.wrap, ref.icon, ref.slash, active, true);
    ref.wrap.style.animation = 'none';
    ref.wrap.offsetWidth;
    ref.wrap.style.animation = 'gulpyvc-bounce 0.28s ease';
}

export function initGUI() {
    injectStyles();

    const bar = document.createElement('div');
    bar.id = 'gulpyvc-bar';
    Object.assign(bar.style, {
        position: 'fixed',
        top: '8px',
        left: '8px',
        zIndex: '9999',
        display: 'flex',
        gap: '8px',
        pointerEvents: 'auto',
    });

    for (const def of BTNS) {
        const wrap = makeButton(def);
        btnRefs[def.key] = {
            wrap,
            icon: wrap.firstChild,
            slash: wrap.lastChild,
        };
        bar.appendChild(wrap);
    }

    document.body.appendChild(bar);
}
