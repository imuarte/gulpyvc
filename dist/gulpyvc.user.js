// ==UserScript==
// @name         GulpyVC
// @namespace    gulpyvc
// @version      0.1.0
// @description  Voice chat for gulper.io
// @author       imuarte
// @match        *://gulper.io/*
// @grant        none
// ==/UserScript==
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/state.js
  var state;
  var init_state = __esm({
    "src/state.js"() {
      state = {
        mic: false,
        audio: true
      };
    }
  });

  // src/assets/microphone.svg
  var microphone_default;
  var init_microphone = __esm({
    "src/assets/microphone.svg"() {
      microphone_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">\n  <rect x="9" y="2" width="6" height="11" rx="3"/>\n  <path d="M5 11a7 7 0 0 0 14 0h-2a5 5 0 0 1-10 0H5z"/>\n  <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>\n  <line x1="9"  y1="21" x2="15" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>\n</svg>\n';
    }
  });

  // src/assets/headphones.svg
  var headphones_default;
  var init_headphones = __esm({
    "src/assets/headphones.svg"() {
      headphones_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">\n  <path d="M3 13v-1a9 9 0 0 1 18 0v1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>\n  <rect x="2"  y="13" width="4" height="7" rx="2"/>\n  <rect x="18" y="13" width="4" height="7" rx="2"/>\n</svg>\n';
    }
  });

  // src/gui.js
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  function makeButton({ key, svg, title }) {
    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      position: "relative",
      width: "28px",
      height: "28px",
      cursor: "pointer",
      flexShrink: "0"
    });
    wrap.title = title;
    const icon = document.createElement("div");
    icon.innerHTML = svg;
    Object.assign(icon.style, {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    const svgEl = icon.querySelector("svg");
    if (svgEl)
      Object.assign(svgEl.style, { width: "24px", height: "24px", display: "block" });
    const slash = document.createElement("div");
    slash.innerHTML = SLASH_SVG;
    Object.assign(slash.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none"
    });
    wrap.appendChild(icon);
    wrap.appendChild(slash);
    applyState(wrap, icon, slash, state[key], false);
    wrap.addEventListener("click", () => {
      state[key] = !state[key];
      applyState(wrap, icon, slash, state[key], true);
      wrap.style.animation = "none";
      wrap.offsetWidth;
      wrap.style.animation = "gulpyvc-bounce 0.28s ease";
    });
    return wrap;
  }
  function applyState(wrap, icon, slash, active, animate) {
    const svgEl = icon.querySelector("svg");
    if (svgEl)
      svgEl.style.color = active ? COLOR_ON : COLOR_OFF;
    const line = slash.querySelector(".gulpyvc-slash");
    if (!line)
      return;
    line.style.animation = "none";
    line.offsetWidth;
    if (active) {
      if (animate) {
        line.style.strokeDashoffset = "0";
        line.style.animation = "gulpyvc-erase 0.2s ease forwards";
        line.addEventListener("animationend", (e) => {
          if (e.animationName !== "gulpyvc-erase")
            return;
          slash.style.display = "none";
          line.style.strokeDashoffset = String(SLASH_LEN);
          line.style.animation = "none";
        }, { once: true });
      } else {
        slash.style.display = "none";
        line.style.strokeDashoffset = String(SLASH_LEN);
      }
    } else {
      slash.style.display = "block";
      line.style.strokeDashoffset = String(SLASH_LEN);
      line.offsetWidth;
      if (animate) {
        line.style.animation = "gulpyvc-draw 0.22s ease forwards";
      } else {
        line.style.strokeDashoffset = "0";
      }
    }
  }
  function setKeyState(key, active) {
    const ref = btnRefs[key];
    if (!ref)
      return;
    applyState(ref.wrap, ref.icon, ref.slash, active, true);
    ref.wrap.style.animation = "none";
    ref.wrap.offsetWidth;
    ref.wrap.style.animation = "gulpyvc-bounce 0.28s ease";
  }
  function initGUI() {
    injectStyles();
    const bar = document.createElement("div");
    bar.id = "gulpyvc-bar";
    Object.assign(bar.style, {
      position: "fixed",
      top: "8px",
      left: "8px",
      zIndex: "9999",
      display: "flex",
      gap: "8px",
      pointerEvents: "auto"
    });
    for (const def of BTNS) {
      const wrap = makeButton(def);
      btnRefs[def.key] = {
        wrap,
        icon: wrap.firstChild,
        slash: wrap.lastChild
      };
      bar.appendChild(wrap);
    }
    document.body.appendChild(bar);
  }
  var COLOR_ON, COLOR_OFF, SLASH_LEN, SLASH_SVG, CSS, BTNS, btnRefs;
  var init_gui = __esm({
    "src/gui.js"() {
      init_state();
      init_microphone();
      init_headphones();
      COLOR_ON = "#ffffff";
      COLOR_OFF = "#e06060";
      SLASH_LEN = 21.2;
      SLASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none">
  <line class="gulpyvc-slash" x1="19" y1="4" x2="4" y2="19"
    stroke="${COLOR_OFF}" stroke-width="2.5" stroke-linecap="round"
    stroke-dasharray="${SLASH_LEN}" stroke-dashoffset="${SLASH_LEN}"/>
</svg>`;
      CSS = `
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
      BTNS = [
        { key: "mic", svg: microphone_default, title: "Microphone" },
        { key: "audio", svg: headphones_default, title: "Audio" }
      ];
      btnRefs = {};
    }
  });

  // src/keys.js
  function initKeys(onMicChange, onAudioChange) {
    const isTyping = () => ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
    document.addEventListener("keydown", (e) => {
      if (isTyping())
        return;
      if (e.repeat)
        return;
      if (e.code === "KeyM") {
        state.mic = !state.mic;
        onMicChange(state.mic);
      }
      if (e.code === "KeyH") {
        state.audio = !state.audio;
        onAudioChange(state.audio);
      }
      if (e.code === "KeyV") {
        state.mic = true;
        onMicChange(true);
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.code === "KeyV") {
        state.mic = false;
        onMicChange(false);
      }
    });
  }
  var init_keys = __esm({
    "src/keys.js"() {
      init_state();
    }
  });

  // src/session.js
  function getSessionKey() {
    if (!_server)
      return null;
    return _roomPath ? `${_server}${_roomPath}` : _server;
  }
  function initSession() {
    const OrigWS = win.WebSocket;
    function HookedWS(url, protocols) {
      const ws = protocols ? new OrigWS(url, protocols) : new OrigWS(url);
      try {
        const u = new URL(url);
        _server = u.host;
        _roomPath = u.pathname !== "/" ? u.pathname : u.searchParams.get("room") || null;
        _ws = ws;
        console.log("[GulpyVC] session:", getSessionKey());
      } catch {
      }
      return ws;
    }
    Object.setPrototypeOf(HookedWS, OrigWS);
    HookedWS.prototype = OrigWS.prototype;
    win.WebSocket = HookedWS;
  }
  var win, _server, _roomPath, _ws;
  var init_session = __esm({
    "src/session.js"() {
      win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      _server = null;
      _roomPath = null;
      _ws = null;
    }
  });

  // src/players.js
  function isPlayerObj(value) {
    if (!value || typeof value !== "object")
      return false;
    return value[K_ID] != null && typeof value[K_NICK] === "string" && value[K_NICK].trim();
  }
  function normalize(value) {
    return {
      id: value[K_ID],
      nick: value[K_NICK]?.trim() || "?",
      score: value[K_SCORE] ?? 0,
      alive: value[K_DEAD] === 0 && value[K_SPAWN] !== Number.MAX_VALUE
    };
  }
  function hookObjectProperty(propName, slotSym, onSet) {
    const desc = Object.getOwnPropertyDescriptor(Object.prototype, propName);
    if (desc && !desc.configurable)
      return;
    Object.defineProperty(Object.prototype, propName, {
      configurable: true,
      enumerable: false,
      get() {
        return this[slotSym];
      },
      set(v) {
        this[slotSym] = v;
        try {
          onSet(this, v);
        } catch {
        }
      }
    });
  }
  function trackMap(map) {
    if (!(map instanceof Map) || _knownMaps.has(map))
      return;
    _knownMaps.add(map);
    _activeMap = map;
  }
  function initPlayers() {
    hookObjectProperty("$bo", PLAYER_MAP_SLOT, (owner, value) => {
      if (value instanceof Map)
        trackMap(value);
    });
    hookObjectProperty("$me", MANAGER_SLOT, (owner, value) => {
      if (value?.$bo instanceof Map)
        trackMap(value.$bo);
    });
    const origSet = win2.Map.prototype.set;
    win2.Map.prototype.set = function(key, value) {
      if (isPlayerObj(value)) {
        trackMap(this);
        const p = normalize(value);
        if (!_players.has(p.id)) {
          console.log("[GulpyVC] player joined:", p.id, p.nick);
        }
        _players.set(p.id, p);
      }
      return origSet.call(this, key, value);
    };
    const origDelete = win2.Map.prototype.delete;
    win2.Map.prototype.delete = function(key) {
      if (_knownMaps.has(this) && _players.has(key)) {
        const p = _players.get(key);
        console.log("[GulpyVC] player left:", p.id, p.nick);
        _players.delete(key);
      }
      return origDelete.call(this, key);
    };
  }
  function getSessionPlayers() {
    return Array.from(_players.values());
  }
  function debugPlayers() {
    const players = getSessionPlayers();
    if (!players.length) {
      console.log("[GulpyVC] no players detected yet");
      return;
    }
    console.group(`[GulpyVC] ${players.length} player(s) in session:`);
    for (const p of players) {
      console.log(`  id=${p.id}  nick="${p.nick}"  score=${p.score}  alive=${p.alive}`);
    }
    console.groupEnd();
  }
  var K_ID, K_NICK, K_SCORE, K_DEAD, K_SPAWN, win2, PLAYER_MAP_SLOT, MANAGER_SLOT, _activeMap, _knownMaps, _players;
  var init_players = __esm({
    "src/players.js"() {
      K_ID = "$c1";
      K_NICK = "$c7";
      K_SCORE = "$cs";
      K_DEAD = "$cg";
      K_SPAWN = "$c3";
      win2 = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      PLAYER_MAP_SLOT = Symbol("gulpyvcPlayerMap");
      MANAGER_SLOT = Symbol("gulpyvcManager");
      _activeMap = null;
      _knownMaps = /* @__PURE__ */ new Set();
      _players = /* @__PURE__ */ new Map();
    }
  });

  // src/index.js
  var require_src = __commonJS({
    "src/index.js"() {
      init_gui();
      init_keys();
      init_session();
      init_players();
      var win3 = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      (function() {
        "use strict";
        initSession();
        initPlayers();
        win3._gulpyvc = { debug: debugPlayers, session: getSessionKey };
        function start() {
          try {
            initGUI();
            initKeys(
              (active) => setKeyState("mic", active),
              (active) => setKeyState("audio", active)
            );
            console.log("[GulpyVC] ready | session:", getSessionKey() ?? "(not connected yet)");
          } catch (e) {
            console.error("[GulpyVC] Init error:", e);
          }
        }
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", start);
        } else {
          start();
        }
      })();
    }
  });
  require_src();
})();
