const K_ID    = '$c1';
const K_NICK  = '$c7';
const K_SCORE = '$cs';
const K_DEAD  = '$cg';
const K_SPAWN = '$c3';

const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

const PLAYER_MAP_SLOT = Symbol('gulpyvcPlayerMap');
const MANAGER_SLOT    = Symbol('gulpyvcManager');
const BP_SLOT         = Symbol('gulpyvcBP');

let _activeMap   = null;
let _onLocalNick = null; // callback(nick) when local player is assigned
const _knownMaps = new Set();
const _players   = new Map();

function isPlayerObj(value) {
    if (!value || typeof value !== 'object') return false;
    return value[K_ID] != null && typeof value[K_NICK] === 'string' && value[K_NICK].trim();
}

function normalize(value) {
    return {
        id:    value[K_ID],
        nick:  value[K_NICK]?.trim() || '?',
        score: value[K_SCORE] ?? 0,
        alive: value[K_DEAD] === 0 && value[K_SPAWN] !== Number.MAX_VALUE,
    };
}

function hookObjectProperty(propName, slotSym, onSet) {
    const desc = Object.getOwnPropertyDescriptor(Object.prototype, propName);
    if (desc && !desc.configurable) return;
    Object.defineProperty(Object.prototype, propName, {
        configurable: true,
        enumerable: false,
        get() { return this[slotSym]; },
        set(v) {
            this[slotSym] = v;
            try { onSet(this, v); } catch {}
        },
    });
}

function trackMap(map) {
    if (!(map instanceof Map) || _knownMaps.has(map)) return;
    _knownMaps.add(map);
    _activeMap = map;
}

// Called when local nick is resolved - callback receives nick string
export function onLocalNick(fn) { _onLocalNick = fn; }

export function initPlayers() {
    hookObjectProperty('$bo', PLAYER_MAP_SLOT, (owner, value) => {
        if (value instanceof Map) trackMap(value);
    });
    hookObjectProperty('$me', MANAGER_SLOT, (owner, value) => {
        if (value?.$bo instanceof Map) trackMap(value.$bo);
    });

    // $bp is the local player object - fires exactly when server assigns us our slot
    hookObjectProperty('$bp', BP_SLOT, (owner, value) => {
        const nick = value?.[K_NICK]?.trim();
        if (nick) {
            console.log('[GulpyVC] local nick detected:', nick);
            _onLocalNick?.(nick);
        }
    });

    const origSet = win.Map.prototype.set;
    win.Map.prototype.set = function (key, value) {
        if (isPlayerObj(value)) {
            trackMap(this);
            _players.set(normalize(value).id, normalize(value));
        }
        return origSet.call(this, key, value);
    };

    const origDelete = win.Map.prototype.delete;
    win.Map.prototype.delete = function (key) {
        if (_knownMaps.has(this)) _players.delete(key);
        return origDelete.call(this, key);
    };
}

export function getSessionPlayers() {
    return Array.from(_players.values());
}

export function getLocalNick() {
    const w = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    // 1. Live game object - set once server assigns us a player
    const liveNick = w._ghGame?.$me?.$bp?.[K_NICK]?.trim();
    if (liveNick) return liveNick;

    // 2. Match by game.$c1 (local player ID) against player map
    const localId = w._ghGame?.$c1;
    if (localId != null && _activeMap) {
        for (const [, p] of _activeMap) {
            if (p[K_ID] === localId && p[K_NICK]?.trim()) return p[K_NICK].trim();
        }
    }

    // 3. Nick input field
    const input = document.querySelector('#nick-input');
    if (input?.value?.trim()) return input.value.trim();

    // 4. localStorage - gulper.io stores as btoa(unescape(encodeURIComponent(nick)))
    try {
        const encoded = w.localStorage?.getItem('last_nick');
        if (encoded) {
            const decoded = decodeURIComponent(escape(atob(encoded)));
            if (decoded.trim()) return decoded.trim();
        }
    } catch {}

    return null;
}

export function debugPlayers() {
    const players = getSessionPlayers();
    if (!players.length) { console.log('[GulpyVC] no players detected yet'); return; }
    console.group(`[GulpyVC] ${players.length} player(s):`);
    for (const p of players) console.log(`  id=${p.id}  nick="${p.nick}"  score=${p.score}`);
    console.groupEnd();
}
