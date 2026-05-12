// Obfuscated property keys from gulper.io
const K_ID    = '$c1';
const K_NICK  = '$c7';
const K_SCORE = '$cs';
const K_DEAD  = '$cg';
const K_SPAWN = '$c3';

const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

const PLAYER_MAP_SLOT = Symbol('gulpyvcPlayerMap');
const MANAGER_SLOT    = Symbol('gulpyvcManager');

let _activeMap = null;
const _knownMaps = new Set();

// Players present in the session: id -> { id, nick, score }
const _players = new Map();

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

export function initPlayers() {
    // Hook game internals to find the player map fast
    hookObjectProperty('$bo', PLAYER_MAP_SLOT, (owner, value) => {
        if (value instanceof Map) trackMap(value);
    });
    hookObjectProperty('$me', MANAGER_SLOT, (owner, value) => {
        if (value?.$bo instanceof Map) trackMap(value.$bo);
    });

    // Map.prototype.set - detect player additions
    const origSet = win.Map.prototype.set;
    win.Map.prototype.set = function (key, value) {
        if (isPlayerObj(value)) {
            trackMap(this);
            const p = normalize(value);
            _players.set(p.id, p);
        }
        return origSet.call(this, key, value);
    };

    // Map.prototype.delete - clean up departed players
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
    // 1. Nick input (reliable - set before game starts, value persists while hidden)
    const input = document.querySelector('#nick-input');
    if (input?.value?.trim()) return input.value.trim();

    // 2. gulper.io stores the game instance as window._ghGame
    const w = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const localEntity = w._ghGame?.$me?.$bp ?? w._ghGame?.$bp ?? null;
    if (localEntity && _activeMap) {
        for (const [, p] of _activeMap) {
            if (p.$ch === localEntity && p.$c7?.trim()) return p.$c7.trim();
        }
    }

    return null;
}

export function debugPlayers() {
    const players = getSessionPlayers();
    if (!players.length) {
        console.log('[GulpyVC] no players detected yet');
        return;
    }
    console.group(`[GulpyVC] ${players.length} player(s) in session:`);
    for (const p of players) {
        console.log(`  id=${p.id}  nick="${p.nick}"  score=${p.score}  alive=${p.alive}`);
    }
    console.groupEnd();
}
