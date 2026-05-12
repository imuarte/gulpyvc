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
  function setCallback(key, fn) {
    _callbacks[key] = fn;
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
    applyState(icon, slash, state[key], false);
    wrap.addEventListener("click", () => {
      const next = !state[key];
      const cb = _callbacks[key];
      if (cb) {
        cb(next);
      } else {
        state[key] = next;
        applyState(icon, slash, next, true);
        bounce(wrap);
      }
    });
    return wrap;
  }
  function bounce(wrap) {
    wrap.style.animation = "none";
    wrap.offsetWidth;
    wrap.style.animation = "gulpyvc-bounce 0.28s ease";
  }
  function applyState(icon, slash, active, animate) {
    const svgEl = icon.querySelector("svg");
    if (svgEl)
      svgEl.style.color = active ? COLOR_ON : COLOR_OFF;
    const line = slash.querySelector(".gulpyvc-slash-line");
    if (!line)
      return;
    if (active) {
      if (animate) {
        line.style.transition = "none";
        line.style.strokeDashoffset = "0";
        line.offsetWidth;
        line.style.transition = "";
        line.style.strokeDashoffset = String(SLASH_LEN);
        line.addEventListener("transitionend", () => {
          slash.style.display = "none";
        }, { once: true });
      } else {
        slash.style.display = "none";
        line.style.transition = "none";
        line.style.strokeDashoffset = String(SLASH_LEN);
      }
    } else {
      slash.style.display = "block";
      if (animate) {
        line.style.transition = "none";
        line.style.strokeDashoffset = String(SLASH_LEN);
        line.offsetWidth;
        line.style.transition = "";
        line.style.strokeDashoffset = "0";
      } else {
        line.style.transition = "none";
        line.style.strokeDashoffset = "0";
      }
    }
  }
  function setKeyState(key, active) {
    const ref = btnRefs[key];
    if (!ref)
      return;
    applyState(ref.icon, ref.slash, active, true);
    bounce(ref.wrap);
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
  var COLOR_ON, COLOR_OFF, SLASH_LEN, SLASH_SVG, CSS, BTNS, _callbacks, btnRefs;
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
  <line class="gulpyvc-slash-line" x1="19" y1="4" x2="4" y2="19"
    stroke="${COLOR_OFF}" stroke-width="2.5" stroke-linecap="round"
    stroke-dasharray="${SLASH_LEN}" stroke-dashoffset="${SLASH_LEN}"/>
</svg>`;
      CSS = `
@keyframes gulpyvc-bounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(0.91); }
  70%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}
#gulpyvc-bar > div svg { transition: color 0.2s ease; }
.gulpyvc-slash-line { transition: stroke-dashoffset 0.22s ease; }
`;
      BTNS = [
        { key: "mic", svg: microphone_default, title: "Microphone" },
        { key: "audio", svg: headphones_default, title: "Audio" }
      ];
      _callbacks = {};
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
  function onSessionReady(fn) {
    _onReady = fn;
  }
  function getSessionKey() {
    if (!_server)
      return null;
    const path = _roomPath ? _roomPath.replace(/\/\d+$/, "") : null;
    return path ? `${_server}${path}` : _server;
  }
  function initSession() {
    const OrigWS = win.WebSocket;
    function HookedWS(url, protocols) {
      const ws = protocols ? new OrigWS(url, protocols) : new OrigWS(url);
      try {
        const u = new URL(url);
        if (!u.pathname.includes("/game/"))
          return ws;
        const prevKey = getSessionKey();
        _server = u.host;
        _roomPath = u.pathname !== "/" ? u.pathname : u.searchParams.get("room") || null;
        if (getSessionKey() !== prevKey)
          _onReady?.(getSessionKey());
      } catch {
      }
      return ws;
    }
    Object.setPrototypeOf(HookedWS, OrigWS);
    HookedWS.prototype = OrigWS.prototype;
    win.WebSocket = HookedWS;
  }
  var win, _server, _roomPath, _onReady;
  var init_session = __esm({
    "src/session.js"() {
      win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      _server = null;
      _roomPath = null;
      _onReady = null;
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
  function onLocalNick(fn) {
    _onLocalNick = fn;
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
    hookObjectProperty("$bp", BP_SLOT, (owner, value) => {
      const nick = value?.[K_NICK]?.trim();
      if (nick) {
        console.log("[GulpyVC] local nick detected:", nick);
        _onLocalNick?.(nick);
      }
    });
    const origSet = win2.Map.prototype.set;
    win2.Map.prototype.set = function(key, value) {
      if (isPlayerObj(value)) {
        trackMap(this);
        _players.set(normalize(value).id, normalize(value));
      }
      return origSet.call(this, key, value);
    };
    const origDelete = win2.Map.prototype.delete;
    win2.Map.prototype.delete = function(key) {
      if (_knownMaps.has(this))
        _players.delete(key);
      return origDelete.call(this, key);
    };
  }
  function getSessionPlayers() {
    return Array.from(_players.values());
  }
  function getLocalNick() {
    const w = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const liveNick = w._ghGame?.$me?.$bp?.[K_NICK]?.trim();
    if (liveNick)
      return liveNick;
    const localId = w._ghGame?.$c1;
    if (localId != null && _activeMap) {
      for (const [, p] of _activeMap) {
        if (p[K_ID] === localId && p[K_NICK]?.trim())
          return p[K_NICK].trim();
      }
    }
    const input = document.querySelector("#nick-input");
    if (input?.value?.trim())
      return input.value.trim();
    try {
      const encoded = w.localStorage?.getItem("last_nick");
      if (encoded) {
        const decoded = decodeURIComponent(escape(atob(encoded)));
        if (decoded.trim())
          return decoded.trim();
      }
    } catch {
    }
    return null;
  }
  function debugPlayers() {
    const players = getSessionPlayers();
    if (!players.length) {
      console.log("[GulpyVC] no players detected yet");
      return;
    }
    console.group(`[GulpyVC] ${players.length} player(s):`);
    for (const p of players)
      console.log(`  id=${p.id}  nick="${p.nick}"  score=${p.score}`);
    console.groupEnd();
  }
  var K_ID, K_NICK, K_SCORE, K_DEAD, K_SPAWN, win2, PLAYER_MAP_SLOT, MANAGER_SLOT, BP_SLOT, _activeMap, _onLocalNick, _knownMaps, _players;
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
      BP_SLOT = Symbol("gulpyvcBP");
      _activeMap = null;
      _onLocalNick = null;
      _knownMaps = /* @__PURE__ */ new Set();
      _players = /* @__PURE__ */ new Map();
    }
  });

  // src/mic.js
  async function requestMic() {
    if (_stream)
      return _stream;
    _stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    _track = _stream.getAudioTracks()[0];
    _track.enabled = false;
    console.log("[GulpyVC] mic ready");
    return _stream;
  }
  function setMicActive(active) {
    if (_track)
      _track.enabled = active;
  }
  function getMicStream() {
    return _stream;
  }
  var _stream, _track;
  var init_mic = __esm({
    "src/mic.js"() {
      _stream = null;
      _track = null;
    }
  });

  // src/signaling.js
  function onSignal(type, fn) {
    _handlers[type] = fn;
  }
  function dispatch(msg) {
    const fn = _handlers[msg.type];
    if (fn)
      fn(msg);
  }
  function connectSignaling(sessionKey, peerId, nick) {
    if (_ws && _ws.readyState === 1 && _sessionKey === sessionKey) {
      _nick = nick;
      _ws.send(JSON.stringify({ type: "join", session: _sessionKey, peerId: _peerId, nick }));
      return;
    }
    if (_ws && _ws.readyState <= 1)
      _ws.close();
    _sessionKey = sessionKey;
    _peerId = String(peerId);
    _nick = nick;
    _ws = new WebSocket(SIGNAL_URL);
    _ws.onopen = () => {
      _ws.send(JSON.stringify({ type: "join", session: _sessionKey, peerId: _peerId, nick: _nick }));
      console.log("[GulpyVC] signaling connected");
    };
    _ws.onmessage = (e) => {
      try {
        dispatch(JSON.parse(e.data));
      } catch {
      }
    };
    _ws.onclose = () => {
      console.log("[GulpyVC] signaling disconnected");
      _ws = null;
      setTimeout(() => connectSignaling(_sessionKey, _peerId, _nick), 3e3);
    };
  }
  function sendSignal(msg) {
    if (_ws && _ws.readyState === 1)
      _ws.send(JSON.stringify(msg));
  }
  var SIGNAL_URL, _ws, _sessionKey, _peerId, _nick, _handlers;
  var init_signaling = __esm({
    "src/signaling.js"() {
      SIGNAL_URL = "wss://gulpyvc-signal.fly.dev";
      _ws = null;
      _sessionKey = null;
      _peerId = null;
      _nick = null;
      _handlers = {};
    }
  });

  // src/webrtc.js
  function onPeerListChange(fn) {
    _onChange = fn;
  }
  function getPeerList() {
    const list = [];
    if (_localInfo)
      list.push({ id: "__local__", ..._localInfo, local: true });
    for (const [id, info] of _info)
      list.push({ id, ...info, local: false });
    return list;
  }
  function setLocalPeer(nick) {
    _localInfo = { nick, speaking: false, analyser: null };
    _onChange?.();
  }
  function getAudioCtx() {
    if (!_audioCtx)
      _audioCtx = new AudioContext();
    return _audioCtx;
  }
  function startAnalyser(stream, onSpeaking) {
    try {
      const ctx = getAudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const id = setInterval(() => {
        analyser.getByteFrequencyData(buf);
        const level = buf.reduce((a, b) => a + b, 0) / buf.length;
        onSpeaking(level > SPEAKING_THRESHOLD);
      }, SPEAKING_POLL_MS);
      return () => clearInterval(id);
    } catch {
      return () => {
      };
    }
  }
  function startLocalAnalyser() {
    const stream = getMicStream();
    if (!stream || !_localInfo)
      return;
    startAnalyser(stream, (speaking) => {
      if (_localInfo.speaking !== speaking) {
        _localInfo.speaking = speaking;
        _onChange?.();
      }
    });
  }
  function createPeer(remoteId, polite, nick) {
    if (_peers.has(remoteId))
      return _peers.get(remoteId);
    const pc = new RTCPeerConnection(STUN);
    _peers.set(remoteId, pc);
    _info.set(remoteId, { nick: nick || remoteId, speaking: false });
    _onChange?.();
    const stream = getMicStream();
    if (stream)
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.ontrack = ({ streams }) => {
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.srcObject = streams[0];
      audio.dataset.gulpyvc = remoteId;
      document.body.appendChild(audio);
      startAnalyser(streams[0], (speaking) => {
        const info = _info.get(remoteId);
        if (info && info.speaking !== speaking) {
          info.speaking = speaking;
          _onChange?.();
        }
      });
    };
    pc.onicecandidate = ({ candidate }) => {
      if (candidate)
        sendSignal({ type: "ice", to: remoteId, candidate });
    };
    pc.onnegotiationneeded = async () => {
      try {
        await pc.setLocalDescription();
        sendSignal({ type: "offer", to: remoteId, sdp: pc.localDescription });
      } catch (e) {
        console.error("[GulpyVC] offer error", e);
      }
    };
    pc._polite = polite;
    return pc;
  }
  function removePeer(id) {
    const pc = _peers.get(id);
    if (pc) {
      pc.close();
      _peers.delete(id);
    }
    _info.delete(id);
    _onChange?.();
  }
  function initWebRTC() {
    onSignal("peers", ({ peers }) => {
      for (const p of peers)
        createPeer(p.id, true, p.nick);
    });
    onSignal("peer-joined", ({ id, nick }) => {
      createPeer(id, false, nick);
    });
    onSignal("peer-left", ({ id }) => removePeer(id));
    onSignal("peer-nick", ({ id, nick }) => {
      const info = _info.get(id);
      if (info) {
        info.nick = nick;
        _onChange?.();
      }
    });
    onSignal("offer", async ({ from, sdp }) => {
      const pc = createPeer(from, true);
      const offerCollision = sdp.type === "offer" && (pc._makingOffer || pc.signalingState !== "stable");
      if (offerCollision && !pc._polite)
        return;
      try {
        await pc.setRemoteDescription(sdp);
        if (sdp.type === "offer") {
          await pc.setLocalDescription();
          sendSignal({ type: "answer", to: from, sdp: pc.localDescription });
        }
      } catch (e) {
        console.error("[GulpyVC] offer handling error", e);
      }
    });
    onSignal("answer", async ({ from, sdp }) => {
      const pc = _peers.get(from);
      if (pc)
        try {
          await pc.setRemoteDescription(sdp);
        } catch {
        }
    });
    onSignal("ice", async ({ from, candidate }) => {
      const pc = _peers.get(from);
      if (pc)
        try {
          await pc.addIceCandidate(candidate);
        } catch {
        }
    });
    onSignal("mic-state", ({ from, active }) => {
      const audio = document.querySelector(`audio[data-gulpyvc="${from}"]`);
      if (audio)
        audio.muted = !active;
      const info = _info.get(from);
      if (info && !active) {
        info.speaking = false;
        _onChange?.();
      }
    });
  }
  function setAudioEnabled(enabled) {
    document.querySelectorAll("audio[data-gulpyvc]").forEach((a) => {
      a.muted = !enabled;
    });
  }
  function addMicToPeers() {
    const stream = getMicStream();
    if (!stream)
      return;
    for (const pc of _peers.values()) {
      if (pc.getSenders().length === 0) {
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      }
    }
  }
  var STUN, SPEAKING_THRESHOLD, SPEAKING_POLL_MS, _peers, _info, _localInfo, _audioCtx, _onChange;
  var init_webrtc = __esm({
    "src/webrtc.js"() {
      init_mic();
      init_signaling();
      STUN = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
      SPEAKING_THRESHOLD = 12;
      SPEAKING_POLL_MS = 80;
      _peers = /* @__PURE__ */ new Map();
      _info = /* @__PURE__ */ new Map();
      _localInfo = null;
      _audioCtx = null;
      _onChange = null;
    }
  });

  // src/panel.js
  function renderList() {
    if (!_list)
      return;
    const peers = getPeerList();
    peers.sort((a, b) => (b.speaking ? 1 : 0) - (a.speaking ? 1 : 0));
    _list.innerHTML = "";
    for (const p of peers) {
      const row = document.createElement("div");
      row.className = "gulpyvc-peer" + (p.speaking ? " speaking" : "") + (p.local ? " local" : "");
      const dot = document.createElement("div");
      dot.className = "gulpyvc-dot";
      const nick = document.createElement("span");
      nick.className = "gulpyvc-nick";
      nick.textContent = p.nick;
      row.appendChild(dot);
      row.appendChild(nick);
      if (p.local) {
        const you = document.createElement("span");
        you.className = "gulpyvc-you";
        you.textContent = "(you)";
        row.appendChild(you);
      }
      _list.appendChild(row);
    }
  }
  function initPanel() {
    const style = document.createElement("style");
    style.textContent = CSS2;
    document.head.appendChild(style);
    _panel = document.createElement("div");
    _panel.id = "gulpyvc-panel";
    const header = document.createElement("div");
    header.id = "gulpyvc-panel-header";
    _arrow = document.createElement("span");
    _arrow.id = "gulpyvc-panel-arrow";
    _arrow.textContent = "\u25B6";
    _arrow.classList.add("open");
    _label = document.createElement("span");
    _label.textContent = "voice chat";
    header.appendChild(_arrow);
    header.appendChild(_label);
    _list = document.createElement("div");
    _list.id = "gulpyvc-panel-list";
    header.addEventListener("click", () => {
      _collapsed = !_collapsed;
      _list.style.display = _collapsed ? "none" : "flex";
      _arrow.classList.toggle("open", !_collapsed);
    });
    _panel.appendChild(header);
    _panel.appendChild(_list);
    document.body.appendChild(_panel);
    onPeerListChange(renderList);
    renderList();
  }
  var FONT, CSS2, _panel, _list, _arrow, _label, _collapsed;
  var init_panel = __esm({
    "src/panel.js"() {
      init_webrtc();
      FONT = "'Comic Neue', comicsansms, sans-serif";
      CSS2 = `
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
      _panel = null;
      _list = null;
      _arrow = null;
      _label = null;
      _collapsed = false;
    }
  });

  // src/index.js
  var require_src = __commonJS({
    "src/index.js"() {
      init_gui();
      init_keys();
      init_session();
      init_players();
      init_mic();
      init_signaling();
      init_webrtc();
      init_panel();
      init_state();
      var win3 = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      var SIGNAL_ID = Math.random().toString(36).slice(2, 10);
      var _micReady = false;
      async function onMicChange(active) {
        if (active && !_micReady) {
          try {
            await requestMic();
            _micReady = true;
            addMicToPeers();
            startLocalAnalyser();
          } catch (e) {
            console.warn("[GulpyVC] mic permission denied:", e.message);
            state.mic = false;
            setKeyState("mic", false);
            return;
          }
        }
        state.mic = active;
        setMicActive(active);
        setKeyState("mic", active);
        sendSignal({ type: "mic-state", active });
      }
      function onAudioChange(active) {
        state.audio = active;
        setAudioEnabled(active);
        setKeyState("audio", active);
      }
      function resolveNick() {
        return getLocalNick() || getSessionPlayers()[0]?.nick || "Player";
      }
      (function() {
        "use strict";
        initSession();
        initPlayers();
        win3._gulpyvc = { debug: debugPlayers, session: getSessionKey };
        onLocalNick((nick) => {
          setLocalPeer(nick);
          const key = getSessionKey();
          if (key)
            connectSignaling(key, SIGNAL_ID, nick);
        });
        onSessionReady((sessionKey) => {
          const nick = resolveNick();
          setLocalPeer(nick);
          connectSignaling(sessionKey, SIGNAL_ID, nick);
          console.log("[GulpyVC] joining session:", sessionKey, "as", nick);
        });
        function start() {
          try {
            initWebRTC();
            initGUI();
            initPanel();
            setCallback("mic", onMicChange);
            setCallback("audio", onAudioChange);
            initKeys(onMicChange, onAudioChange);
            const nick = resolveNick();
            setLocalPeer(nick);
            const nickInput = document.querySelector("#nick-input");
            if (nickInput) {
              nickInput.addEventListener("input", () => {
                if (nickInput.value.trim())
                  setLocalPeer(nickInput.value.trim());
              });
            }
            console.log("[GulpyVC] ready");
          } catch (e) {
            console.error("[GulpyVC] init error:", e);
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
