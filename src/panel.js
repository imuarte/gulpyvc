import { getPeerList, onPeerListChange } from './webrtc.js';

const FONT = "'Comic Neue', comicsansms, sans-serif";

const CSS = `
#gulpyvc-panel {
  position: fixed;
  top: 48px;
  left: 8px;
  z-index: 9999;
  font-family: ${FONT};
  font-size: 13px;
  color: #d0e8ff;
  min-width: 140px;
  max-width: 200px;
  pointer-events: auto;
  user-select: none;
}
#gulpyvc-panel-header {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 5px;
  transition: opacity 0.15s;
}
#gulpyvc-panel-header:hover { opacity: 0.75; }
#gulpyvc-panel-arrow {
  font-size: 10px;
  transition: transform 0.15s;
  display: inline-block;
}
#gulpyvc-panel-arrow.open { transform: rotate(90deg); }
#gulpyvc-panel-list {
  margin-top: 3px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.gulpyvc-peer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 7px;
  border-radius: 4px;
  transition: color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gulpyvc-peer.speaking {
  color: #afffb2;
  text-shadow: 0 0 6px rgba(100,255,110,0.5);
}
.gulpyvc-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #555;
  transition: background 0.15s, box-shadow 0.15s;
}
.gulpyvc-peer.speaking .gulpyvc-dot {
  background: #66ff6e;
  box-shadow: 0 0 5px #66ff6e;
}
.gulpyvc-peer.local .gulpyvc-dot { background: #90caf9; }
.gulpyvc-peer.local.speaking .gulpyvc-dot { background: #66ff6e; box-shadow: 0 0 5px #66ff6e; }
.gulpyvc-nick { overflow: hidden; text-overflow: ellipsis; }
.gulpyvc-you { font-size: 10px; opacity: 0.55; margin-left: 2px; }
`;

let _panel      = null;
let _list       = null;
let _arrow      = null;
let _label      = null;
let _collapsed  = false;

function renderList() {
    if (!_list) return;
    const peers = getPeerList();

    // speaking first, then rest
    peers.sort((a, b) => (b.speaking ? 1 : 0) - (a.speaking ? 1 : 0));

    _list.innerHTML = '';

    for (const p of peers) {
        const row = document.createElement('div');
        row.className = 'gulpyvc-peer' +
            (p.speaking ? ' speaking' : '') +
            (p.local    ? ' local'    : '');

        const dot  = document.createElement('div');
        dot.className = 'gulpyvc-dot';

        const nick = document.createElement('span');
        nick.className = 'gulpyvc-nick';
        nick.textContent = p.nick;

        row.appendChild(dot);
        row.appendChild(nick);

        if (p.local) {
            const you = document.createElement('span');
            you.className = 'gulpyvc-you';
            you.textContent = '(you)';
            row.appendChild(you);
        }

        _list.appendChild(row);
    }

    // label stays as "voice chat" - no count needed
}

export function initPanel() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    _panel = document.createElement('div');
    _panel.id = 'gulpyvc-panel';

    const header = document.createElement('div');
    header.id = 'gulpyvc-panel-header';

    _arrow = document.createElement('span');
    _arrow.id = 'gulpyvc-panel-arrow';
    _arrow.textContent = '▶';
    _arrow.classList.add('open');

    _label = document.createElement('span');
    _label.textContent = 'voice chat';

    header.appendChild(_arrow);
    header.appendChild(_label);

    _list = document.createElement('div');
    _list.id = 'gulpyvc-panel-list';

    header.addEventListener('click', () => {
        _collapsed = !_collapsed;
        _list.style.display = _collapsed ? 'none' : 'flex';
        _arrow.classList.toggle('open', !_collapsed);
    });

    _panel.appendChild(header);
    _panel.appendChild(_list);
    document.body.appendChild(_panel);

    onPeerListChange(renderList);
    renderList();
}
