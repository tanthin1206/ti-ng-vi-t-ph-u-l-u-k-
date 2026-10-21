/* =========================================================
   Tiếng Việt Phiêu Lưu Ký – điều hướng màn hình, bản đồ, cài đặt
   ========================================================= */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Lưu trữ tiến độ ---------- */
  const KEY = "vqav_state_v1";
  const defaultState = () => ({
    name: "",
    avatar: "👦",
    stars: {},          // { stageId: 0..3 }
    unlocked: 1,        // chặng cao nhất đã mở
    settings: { voice: true, sfx: true, bgm: true, introMap: true, introStage: true, inclusive: false, teacher: true, gender: "nu", custom: true }
  });
  let state = load();
  let tyTalkUntil = 0;   // Trạng Tý đang "nói" gợi ý bằng chữ tới thời điểm này

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s) return { ...defaultState(), ...s, settings: { ...defaultState().settings, ...s.settings } };
    } catch (e) { /* bỏ qua */ }
    return defaultState();
  }
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));

  /* ---------- Ảnh dự phòng & hoạt ảnh chú Cú nháy mắt, vẫy tay ---------- */
  function applyImgFallback(img) {
    img.addEventListener("error", () => {
      const span = document.createElement("span");
      span.className = img.className + " emoji-fallback";
      span.textContent = img.dataset.fallback || "🖼️";
      span.setAttribute("role", "img");
      span.setAttribute("aria-label", img.alt || "");
      img.replaceWith(span);
    }, { once: true });
  }
  function upgradeOwlMascot(img) {
    const wrap = document.createElement("span");
    wrap.className = img.className.replace(/\bbounce\b/g, "").trim() + " owl-rig";
    if (img.alt) { wrap.setAttribute("role", "img"); wrap.setAttribute("aria-label", img.alt); }
    else wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = `
      <img class="owl-layer owl-body" src="assets/img/mascot-body.png?v=51" alt="" />
      <img class="owl-layer owl-mouth owl-mouth-half" src="assets/img/mascot-mouth-half.png?v=51" alt="" />
      <img class="owl-layer owl-mouth owl-mouth-closed" src="assets/img/mascot-mouth-closed.png?v=51" alt="" />
      <img class="owl-layer owl-blink" src="assets/img/mascot-blink.png?v=51" alt="" />
      <img class="owl-layer owl-wing" src="assets/img/mascot-wing.png?v=51" alt="" />`;
    wrap.setAttribute("title", "Bé bấm vào Trạng Tý nhé!");
    wrap.addEventListener("click", () => {
      sfx("ok");
      wrap.classList.remove("trang-ty-hop");
      void wrap.offsetWidth;
      wrap.classList.add("trang-ty-hop");
      if (!wrap.closest("#ty-corner")) toast("Trạng Tý chào bạn thám hiểm nhí! ✨");
    });
    img.replaceWith(wrap);
  }
  $$("img.mascot").forEach(upgradeOwlMascot);
  $$("img[data-fallback]").forEach(applyImgFallback);

  /* Vòng lặp hoạt ảnh Trạng Tý: vẫy tay, chớp mắt, nhấp nhô & nhép môi khi đang nói */
  (() => {
    const t0 = performance.now();
    // Đang nói = có giọng đọc (file âm thanh hoặc giọng máy) đang phát
    const isTalking = () =>
      performance.now() < tyTalkUntil ||
      (typeof curAudio !== "undefined" && curAudio && !curAudio.paused && !curAudio.ended) ||
      ("speechSynthesis" in window && speechSynthesis.speaking);
    // Khung miệng: 0 = mở to (ảnh gốc), 1 = hé, 2 = khép
    let mouthFrame = 0, nextMouthAt = 0;
    const MOUTH_SEQ = [1, 0, 2, 1, 0, 1, 2, 0, 1, 2];
    let seqI = 0;
    function tickOwl(now) {
      const s = (now - t0) / 1000;
      const talking = isTalking();
      // Vẫy tay quanh cổ tay (~1.2 nhịp/giây)
      const waveAng = -4.0 + 16.0 * Math.sin(s * 7.4);
      const bobY = -3.2 * Math.sin(s * (talking ? 6.0 : 3.6));
      const tilt = 1.4 * Math.sin(s * 3.6);
      // Chớp mắt: nháy đơn & nháy đúp
      const phase = s % 3.2;
      const isBlink = (phase > 0.40 && phase < 0.56) || (phase > 2.10 && phase < 2.24) || (phase > 2.36 && phase < 2.50);
      // Nhép môi theo nhịp nói (đổi khung mỗi 90–150ms)
      if (talking) {
        if (now >= nextMouthAt) {
          mouthFrame = MOUTH_SEQ[seqI++ % MOUTH_SEQ.length];
          nextMouthAt = now + 90 + Math.random() * 60;
        }
      } else {
        mouthFrame = 0;
      }
      document.querySelectorAll(".owl-rig").forEach(rig => {
        rig.style.transform = `translateY(${bobY.toFixed(1)}px) rotate(${tilt.toFixed(1)}deg)`;
        const wing = rig.querySelector(".owl-wing");
        if (wing) wing.style.transform = `rotate(${waveAng.toFixed(1)}deg)`;
        const blink = rig.querySelector(".owl-blink");
        if (blink) blink.style.opacity = isBlink ? "1" : "0";
        const mh = rig.querySelector(".owl-mouth-half");
        const mc = rig.querySelector(".owl-mouth-closed");
        if (mh) mh.style.opacity = mouthFrame === 1 ? "1" : "0";
        if (mc) mc.style.opacity = mouthFrame === 2 ? "1" : "0";
      });
      requestAnimationFrame(tickOwl);
    }
    requestAnimationFrame(tickOwl);
  })();

  /* ---------- Giọng đọc máy (dự phòng cuối cùng) ---------- */
  let viVoices = [];
  if ("speechSynthesis" in window) {
    const load = () => { viVoices = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith("vi")); };
    load();
    speechSynthesis.onvoiceschanged = load;
  }
  function pickVoice() {
    const female = /hoaimy|hoai my|linh|mai|female|nữ|google/i, male = /\ban\b|namminh|nam minh|\bmale/i;
    if (state.settings.gender === "nam") return viVoices.find(v => male.test(v.name)) || null;
    return viVoices.find(v => female.test(v.name)) || viVoices.find(v => !male.test(v.name)) || null;
  }
  function tts(text, rate) {
    return new Promise(res => {
      if (!("speechSynthesis" in window) || !text) return res();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "vi-VN";
      const v = pickVoice();
      if (v) u.voice = v;
      u.rate = rate || (state.settings.inclusive ? 0.75 : 0.9);
      u.pitch = state.settings.gender === "nam" ? 0.95 : 1.15;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
      setTimeout(res, 6000); // phòng khi trình duyệt không báo kết thúc
    });
  }

  /* ---------- Âm thanh của tôi (lưu trong trình duyệt – IndexedDB) ---------- */
  const myAudio = (() => {
    const urls = new Map();           // "am/b" -> blob URL
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open("vqav_audio", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("clips");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const tx = async (mode, fn) => {
      const db = await open();
      return new Promise((res, rej) => {
        const t = db.transaction("clips", mode), st = t.objectStore("clips");
        const out = fn(st);
        t.oncomplete = () => res(out && out.result);
        t.onerror = () => rej(t.error);
      });
    };
    const ready = (async () => {
      try {
        const db = await open();
        await new Promise(res => {
          const cur = db.transaction("clips").objectStore("clips").openCursor();
          cur.onsuccess = () => {
            const c = cur.result;
            if (!c) return res();
            urls.set(c.key, URL.createObjectURL(c.value.blob));
            c.continue();
          };
          cur.onerror = () => res();
        });
      } catch (e) { console.warn("Không mở được kho âm thanh:", e); }
    })();
    return {
      ready,
      has: id => urls.has(id),
      url: id => urls.get(id),
      count: () => urls.size,
      async set(id, blob, name = "") {
        await tx("readwrite", st => st.put({ blob, name, date: Date.now() }, id));
        if (urls.has(id)) URL.revokeObjectURL(urls.get(id));
        urls.set(id, URL.createObjectURL(blob));
      },
      async remove(id) {
        await tx("readwrite", st => st.delete(id));
        if (urls.has(id)) URL.revokeObjectURL(urls.get(id));
        urls.delete(id);
      },
      async clear() {
        await tx("readwrite", st => st.clear());
        urls.forEach(u => URL.revokeObjectURL(u));
        urls.clear();
      },
      async getAll() {
        const db = await open();
        return new Promise(res => {
          const out = [];
          const cur = db.transaction("clips").objectStore("clips").openCursor();
          cur.onsuccess = () => {
            const c = cur.result;
            if (!c) return res(out);
            out.push({ id: c.key, blob: c.value.blob, name: c.value.name });
            c.continue();
          };
          cur.onerror = () => res(out);
        });
      }
    };
  })();

  /* ---------- Phát âm thanh ---------- */
  let curAudio = null, playToken = 0;
  function stopAudio() {
    playToken++;
    if (curAudio) { curAudio.pause(); curAudio = null; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }
  /* Thử lần lượt từng nguồn; nếu cho phép fallbackText thì đọc bằng giọng máy.
     Trả về Promise kết thúc khi đọc xong. */
  function playSources(srcs, fallbackText) {
    stopAudio();
    const my = playToken;
    const list = srcs.filter(Boolean);
    return new Promise(res => {
      const tryNext = () => {
        if (my !== playToken) return res();
        const src = list.shift();
        if (!src) {
          if (fallbackText) return tts(fallbackText).then(res);
          return res();
        }
        const a = new Audio(src);
        let failed = false;
        const fail = () => { if (failed) return; failed = true; if (curAudio === a) curAudio = null; tryNext(); };
        a.playbackRate = state.settings.inclusive ? 0.85 : 1;
        curAudio = a;
        a.onended = () => { if (curAudio === a) curAudio = null; res(); };
        a.onerror = fail;
        a.play().catch(fail);
      };
      tryNext();
    });
  }

  /* Kiểm tra xem mục này có âm thanh mẫu hay không.
     Theo yêu cầu: TRỪ CHẶNG 1 RA, TẤT CẢ CÁC PHẦN CÒN LẠI ĐÃ BỎ ÂM THANH MẪU (cô tự thêm 100%).
     - Chặng 1 có mẫu: bảng âm ("am"), từ ví dụ ("tu"), lời chào bản đồ ("chao-ban-do"), lời mở đầu chặng 1 ("stage-intro-1") và một số âm hiệu ứng.
     - Các phần còn lại: "ghep" (chặng 2), "tu3" (chặng 3), "doc" & "hoi" (chặng 4), "cau" (chặng 5), lời mở đầu chặng 2..5: KHÔNG CÓ ÂM THANH MẪU.
  */
  function hasSampleAudio(cat, k) {
    if (cat === "am" || cat === "tu") return true;
    if (cat === "loi") {
      const allowed = ["chao-ban-do", "stage-intro-1"];   // chỉ giữ giọng mẫu cho lời mở đầu
      return allowed.includes(k);
    }
    return false;
  }

  /* Nguồn cho 1 âm thanh */
  function soundSources(cat, k) {
    const id = `${cat}/${k}`, s = state.settings, out = [];
    // 1. Luôn ưu tiên âm thanh của người dùng (tự thu âm hoặc tải file trong app)
    if (myAudio.has(id)) out.push(myAudio.url(id));
    out.push(`assets/audio/rieng/${id}.mp3`);

    // 2. Âm thanh mẫu: CHỈ nạp cho phần 1 (chặng 1)
    if (hasSampleAudio(cat, k)) {
      out.push(`assets/audio/${s.gender === "nam" ? "nam" : "nu"}/${id}.mp3`);
    }
    return out;
  }

  function playSound(cat, k, fallbackText) {
    const isStage1 = hasSampleAudio(cat, k);
    const id = `${cat}/${k}`;
    if (!isStage1 && !myAudio.has(id)) {
      // Thử phát từ thư mục assets/audio/rieng nếu người dùng chép file trực tiếp vào đó
      const riengSrc = `assets/audio/rieng/${id}.mp3`;
      return new Promise(res => {
        const audio = new Audio(riengSrc);
        audio.oncanplaythrough = () => {
          stopAudio();
          curAudio = audio;
          audio.onended = () => { curAudio = null; res(); };
          audio.play().catch(() => res());
        };
        audio.onerror = () => {
          // Chưa có âm thanh: không phát âm mẫu, không TTS, chỉ báo nhẹ nếu là câu hỏi/từ trong bài
          if (cat !== "loi") toast("Mục này chưa có âm thanh tự thêm 🎙️");
          res();
        };
      });
    }
    return playSources(k ? soundSources(cat, k) : [], isStage1 ? fallbackText : null);
  }

  function playClip(src, fallbackText) { return playSources([src], fallbackText); }

  /* Lời hướng dẫn của bạn Cú (tôn trọng cài đặt “Giọng đọc”) */
  let lastSay = { text: "", clipKey: null };
  function speak(text, clipKey) {
    lastSay = { text, clipKey };
    if (!state.settings.voice) return Promise.resolve();
    return playSound("loi", clipKey, text);
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* Pháo giấy */
  function confetti(n = 60) {
    if (state.settings.inclusive) n = 20;
    const colors = ["#ff8a5c", "#ffcf5c", "#7cc98a", "#7ab8f5", "#b8a2f0", "#f7a8b8"];
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      p.className = "confetti";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 1.6 + Math.random() * 1.6 + "s";
      p.style.animationDelay = Math.random() * .4 + "s";
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3800);
    }
  }

  /* Pháo giấy bung ra từ một phần tử (vd: thẻ bé vừa chọn) */
  function burst(el, n = 18) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const colors = ["#ff8a5c", "#ffcf5c", "#7cc98a", "#7ab8f5", "#b8a2f0", "#f7a8b8"];
    if (state.settings.inclusive) n = Math.min(n, 8);
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      p.className = "burst";
      const ang = (Math.PI * 2 * i) / n + Math.random() * .4;
      const dist = 70 + Math.random() * 70;
      p.style.left = cx + "px"; p.style.top = cy + "px";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }
  /* Nhãn nhỏ bay lên từ phần tử: "+⭐", "✖"… */
  function floatTag(el, text, cls = "") {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const t = document.createElement("span");
    t.className = "float-tag " + cls;
    t.textContent = text;
    t.style.left = r.left + r.width / 2 + "px";
    t.style.top = r.top + "px";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1100);
  }

  /* ---------- Nhạc nền du dương (BGM) ---------- */
  let bgmAudio = null;
  function initBGM() {
    if (bgmAudio) return bgmAudio;
    bgmAudio = new Audio("assets/audio/bgm.mp3");
    bgmAudio.loop = true;
    bgmAudio.volume = 0.22; // Du dương nhẹ nhàng, không lấn át giọng đọc
    return bgmAudio;
  }

  function playBGM() {
    if (!state.settings.bgm) return;
    const a = initBGM();
    if (a.paused) {
      a.play().catch(() => {
        const unlock = () => {
          if (state.settings.bgm && bgmAudio && bgmAudio.paused) bgmAudio.play().catch(() => {});
          window.removeEventListener("pointerdown", unlock);
        };
        window.addEventListener("pointerdown", unlock, { once: true });
      });
    }
    updateMusicUI();
  }

  function pauseBGM() {
    if (bgmAudio) bgmAudio.pause();
    updateMusicUI();
  }

  function toggleBGM() {
    state.settings.bgm = !state.settings.bgm;
    save();
    if (state.settings.bgm) {
      playBGM();
      toast("🎵 Đã bật nhạc nền du dương");
    } else {
      pauseBGM();
      toast("🔇 Đã tắt nhạc nền");
    }
    updateMusicUI();
    const setBgm = $("#set-bgm");
    if (setBgm) setBgm.checked = state.settings.bgm;
  }

  function updateMusicUI() {
    const btn = $("#btn-music");
    if (!btn) return;
    const on = !!state.settings.bgm;
    btn.textContent = on ? "🎵" : "🔇";
    btn.classList.toggle("muted", !on);
    btn.title = on ? "Tắt nhạc nền (đang bật)" : "Bật nhạc nền (đang tắt)";
  }

  /* ---------- Âm thanh hiệu ứng ----------
     Dùng file thật trong assets/sfx (tạo bằng tools/gen_sfx.py).
     Phát độc lập, không làm dừng giọng đọc âm/từ. */
  const SFX_FILES = { ok: "ok.wav", bad: "bad.wav", win: "win.wav", pop: "pop.wav", flip: "flip.wav" };
  const sfxCache = {};
  Object.entries(SFX_FILES).forEach(([k, f]) => {
    const a = new Audio(`assets/sfx/${f}`);
    a.preload = "auto";
    sfxCache[k] = a;
  });

  let actx;
  function beep(freq = 660, dur = 0.12) {         // dự phòng khi không phát được file
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "triangle"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.25, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
      o.connect(g).connect(actx.destination);
      o.start(); o.stop(actx.currentTime + dur);
    } catch (e) { /* bỏ qua */ }
  }

  /* sfx("ok" | "bad" | "win" | "pop" | "flip") */
  function sfx(name) {
    if (!state.settings.sfx) return;
    const base = sfxCache[name] || sfxCache.pop;
    const a = base.cloneNode();                   // cho phép phát chồng nhiều lần
    a.volume = name === "pop" ? 0.5 : 0.9;
    a.play().catch(() => beep(name === "bad" ? 220 : name === "ok" ? 1046 : 660, name === "pop" ? .08 : .25));
  }
  function ting() { sfx("pop"); }

  document.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b && !b.hasAttribute("data-nosfx")) sfx("pop");
  });

  /* Khóa hoàn toàn lướt chuột / cuộn trang */
  window.addEventListener("wheel", e => {
    if (e.target.closest("#modal-settings, #modal-my-audio, #modal-qbank, .ma-list, .modal-card")) return;
    e.preventDefault();
  }, { passive: false });

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.add("hidden"), 2200);
  }

  /* ---------- Chuyển màn hình ---------- */
  function show(id) {
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
    const inGame = id === "screen-stage" && $("#screen-stage").classList.contains("has-game");
    document.body.classList.toggle("in-game", inGame);
    $("#topbar").classList.toggle("hidden", id === "screen-home" || inGame);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $("#btn-settings-2").addEventListener("click", () => $("#btn-settings").click());

  function refreshTopbar() {
    $("#player-name").textContent = state.name || "Bé";
    $("#player-avatar").textContent = state.avatar;
    $("#star-total").textContent = Object.values(state.stars).reduce((a, b) => a + b, 0);
  }

  /* ---------- Màn hình chào ---------- */
  $("#input-name").value = state.name;
  $$(".avatar-opt").forEach(b => {
    b.classList.toggle("selected", b.dataset.avatar === state.avatar);
    b.addEventListener("click", () => {
      $$(".avatar-opt").forEach(x => x.classList.remove("selected"));
      b.classList.add("selected");
      state.avatar = b.dataset.avatar;
    });
  });
  $("#btn-start").addEventListener("click", () => {
    const name = $("#input-name").value.trim();
    if (!name) {
      $("#input-name").classList.add("shake");
      setTimeout(() => $("#input-name").classList.remove("shake"), 500);
      toast("Bé nhập tên trước nhé! ✏️");
      $("#input-name").focus();
      return;
    }
    state.name = name;
    save();
    playBGM();
    openMap(true);
  });
  $("#input-name").addEventListener("keydown", e => { if (e.key === "Enter") $("#btn-start").click(); });

  /* ---------- Bản đồ ---------- */
  const isUnlocked = id => state.settings.teacher || id <= state.unlocked;

  function renderMap() {
    const map = $("#map");
    $$(".node", map).forEach(n => n.remove());
    STAGES.forEach(st => {
      const open = isUnlocked(st.id);
      const stars = state.stars[st.id] || 0;
      const node = document.createElement("button");
      node.className = "node" + (open ? "" : " locked") + (stars ? " done" : "");
      node.style.setProperty("--x", st.pos.x + "%");
      node.style.setProperty("--y", st.pos.y + "%");
      node.style.setProperty("--c", st.color);
      node.style.setProperty("--cd", st.colorDark);
      node.style.setProperty("--i", st.id);
      node.setAttribute("aria-label", `Chặng ${st.id}: ${st.name}${open ? "" : " (đang khóa)"}`);
      node.innerHTML = `
        <span class="node-img">
          <span class="node-pic">
            <img src="${st.img}" alt="" data-fallback="${st.emoji}" />
            ${open ? "" : '<span class="lock">🔒</span>'}
          </span>
          <span class="node-num">${st.id}</span>
          <span class="node-stars" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= stars ? "on" : ""}">★</i>`).join("")}</span>
        </span>
        <span class="node-label">
          <b>${st.name}</b>
          <small>${st.short}</small>
        </span>`;
      applyImgFallback(node.querySelector("img"));
      node.addEventListener("click", () => {
        if (!open) {
          toast("🔒 Bé hoàn thành chặng trước để mở chặng này nhé!");
          return;
        }
        openStage(st.id);
      });
      map.appendChild(node);
    });
  }

  /* ---------- Bộ chạy thoại: hiện TỪNG CÂU khớp với giọng đọc ----------
     - Có file âm thanh: chia thời lượng file theo độ dài từng câu.
     - Giọng máy: ước lượng thời gian đọc.
     - Không có âm thanh (tắt tiếng / chưa thu): tự chuyển câu theo tốc độ đọc.
     - Bấm vào khung thoại để sang câu tiếp theo. */
  const plain = s => s.replace(/<[^>]+>/g, "");
  let dlg = null;   // phiên thoại đang chạy
  function stopDialogue() { if (dlg) { dlg.dead = true; dlg = null; } }

  function runDialogue(bubble, lines, clipKey, withVoice) {
    stopDialogue();
    const me = { dead: false, idx: -1, manual: 0 };
    dlg = me;
    // Trọng số mỗi câu = số chữ + quãng nghỉ
    const w = lines.map(l => plain(l).length + 12);
    const total = w.reduce((a, b) => a + b, 0);
    const cum = []; w.reduce((a, b, i) => (cum[i] = a + b), 0);
    const silentMs = lines.reduce((a, l) => a + 900 + plain(l).length * 70, 0);
    const ttsMs = plain(lines.join(" ")).length * (state.settings.inclusive ? 95 : 78) + lines.length * 350;

    bubble.innerHTML = `
      <div class="dlg-line" aria-live="polite"></div>
      <div class="dlg-dots">${lines.map(() => "<i></i>").join("")}</div>`;
    const lineEl = bubble.querySelector(".dlg-line");
    const dots = [...bubble.querySelectorAll(".dlg-dots i")];

    function show(i) {
      if (i === me.idx || i >= lines.length) return;
      me.idx = i;
      const html = lines[i];
      // Hiện chữ từng từ một (câu thường); câu nhấn mạnh hiện cả câu
      if (/<[^>]+>/.test(html)) {
        lineEl.innerHTML = `<span class="dlg-text dlg-pop">${html}</span>`;
      } else {
        lineEl.innerHTML = '<span class="dlg-text">' + html.split(/(\s+)/).map((wd, k) =>
          /^\s+$/.test(wd) ? wd : `<span class="dlg-word" style="animation-delay:${k * 28}ms">${wd}</span>`
        ).join("") + "</span>";
      }
      dots.forEach((d, k) => { d.classList.toggle("on", k === i); d.classList.toggle("done", k < i); });
    }
    bubble.onclick = () => { if (me.idx < lines.length - 1) { me.manual = me.idx + 1; show(me.manual); } };

    if (withVoice) speak(plain(lines.join(" ")), clipKey);
    const t0 = performance.now();
    let audioSeen = false;
    function tick(now) {
      if (me.dead) return;
      const el = now - t0;
      let p;
      const a = typeof curAudio !== "undefined" ? curAudio : null;
      const ttsOn = "speechSynthesis" in window && speechSynthesis.speaking;
      if (a && isFinite(a.duration) && a.duration > 0 && !a.ended) {
        audioSeen = true;
        p = a.currentTime / a.duration;
      } else if (audioSeen) {
        p = 1;                                   // file âm thanh đã đọc xong
      } else if (ttsOn) {
        p = el / ttsMs;
      } else if (withVoice && (el < 700 || (a && !a.ended && el < 3000))) {
        p = 0;                                   // chờ âm thanh bắt đầu
      } else {
        p = el / silentMs;
      }
      const pos = Math.min(p, 1) * total;
      let i = cum.findIndex(c => pos < c);
      if (i < 0) i = lines.length - 1;
      show(Math.max(i, me.manual, me.idx));
      if (me.idx < lines.length - 1 || p < 1) requestAnimationFrame(tick);
    }
    show(0);
    requestAnimationFrame(tick);
  }

  const MAP_GREETING = [
    "Chào bạn!",
    "Mình cùng khám phá Tiếng Việt Phiêu Lưu Ký nhé!",
    "Chọn một chặng để bắt đầu nào!"
  ];

  function showMapIntro() {
    const msg = MAP_GREETING.join(" ");
    const mb = $("#map-bubble"); if (mb) mb.textContent = msg;
    const intro = $("#map-intro");
    const introBubble = $("#intro-bubble");
    if (intro) {
      intro.classList.remove("hidden");
      $("#btn-replay-intro")?.classList.add("invisible");
    }
    stopAudio();
    if (introBubble) runDialogue(introBubble, MAP_GREETING, "chao-ban-do", state.settings.introMap !== false);
  }

  function closeMapIntro() {
    stopDialogue();
    stopAudio();
    $("#map-intro")?.classList.add("hidden");
    $("#btn-replay-intro")?.classList.remove("invisible");
  }

  $("#btn-intro-close")?.addEventListener("click", closeMapIntro);
  $("#btn-replay-intro")?.addEventListener("click", showMapIntro);

  function openMap(greet = false) {
    refreshTopbar();
    renderMap();
    show("screen-map");
    playBGM();
    const msg = `Chào bạn! Mình cùng khám phá Tiếng Việt Phiêu Lưu Ký nhé! Chọn một chặng để bắt đầu nào!`;
    const mb = $("#map-bubble"); if (mb) mb.textContent = msg;
    if (greet) showMapIntro();
    else closeMapIntro();
  }

  /* ---------- Dữ liệu lời mở đầu từng chặng của Trạng Tý ---------- */
  const STAGE_SPEECHES = {
    1: {
      tag: "🌳 CHẶNG 1 – RỪNG CHỮ CÁI",
      btn: "🚀 Bắt đầu Chặng 1 ▶",
      audioKey: "stage-intro-1",
      paragraphs: [
        "Xin chào! Xin chào các nhà thám hiểm nhí!",
        "Mình là Trạng Tý – người bạn đồng hành của các bạn trong chuyến phiêu lưu kỳ thú hôm nay!",
        "Các bạn có biết không? Một thế giới Tiếng Việt đầy phép màu đang chờ chúng mình khám phá đấy!",
        "Ở đó có những chữ cái tinh nghịch, những cây cầu ghép vần bí ẩn, những ngôi nhà từ ngữ đáng yêu và cả một kho báu đang chờ được mở ra!",
        "Nhưng để chinh phục kho báu ấy, chúng mình phải vượt qua 5 chặng thử thách!",
        "Mỗi chặng có 10 câu hỏi, mỗi câu trả lời đúng sẽ mang về 10 điểm!",
        "Hãy cố gắng tích lũy thật nhiều điểm để giành những huy hiệu Đồng, Bạc và Vàng lấp lánh nhé!",
        "Các nhà thám hiểm nhí đã sẵn sàng chưa nào?",
        "Ba… hai… một…",
        '<b class="intro-highlight">TIẾNG VIỆT PHIÊU LƯU KÝ… BẮT ĐẦU!</b>',
        "Nào! Cùng Tý lên đường thôi!"
      ]
    },
    2: {
      tag: "🌉 CHẶNG 2 – CẦU GHÉP VẦN",
      btn: "🌉 Cùng Trạng Tý vượt cầu thôi! ▶",
      audioKey: "stage-intro-2",
      paragraphs: [
        "Wow! Các bạn giỏi quá! Chặng đầu tiên đã chinh phục thành công!",
        "Phía trước là Cầu Ghép Vần kỳ diệu! Ghép đúng một tiếng, cây cầu sẽ sáng lên!",
        "Nào, cùng Trạng Tý vượt cầu thôi!"
      ]
    },
    3: {
      tag: "🏡 CHẶNG 3 – NGÔI NHÀ TỪ NGỮ",
      btn: "🏡 Mở cửa Ngôi Nhà Từ Ngữ nào! ▶",
      audioKey: "stage-intro-3",
      paragraphs: [
        "Hoan hô! Chúng mình đã vượt cầu thành công!",
        "Ô kìa! Những từ ngữ đáng yêu đang chờ được khám phá!",
        "Nhanh mắt, nhanh trí! Cùng Trạng Tý mở cửa Ngôi Nhà Từ Ngữ nào!"
      ]
    },
    4: {
      tag: "🏰 CHẶNG 4 – LÂU ĐÀI ĐỌC HIỂU",
      btn: "🏰 Tiến vào lâu đài thôi! ▶",
      audioKey: "stage-intro-4",
      paragraphs: [
        "Xuất sắc! Các nhà thám hiểm nhí thật tài giỏi!",
        "Một lâu đài bí ẩn đã xuất hiện! Muốn mở cánh cửa thần kỳ, chúng mình phải đọc thật hay, hiểu thật đúng!",
        "Sẵn sàng chưa? Tiến vào lâu đài thôi!"
      ]
    },
    5: {
      tag: "💎 CHẶNG 5 – KHO BÁU TRI THỨC",
      btn: "💎 Chinh phục Kho Báu Tri Thức! ▶",
      audioKey: "stage-intro-5",
      paragraphs: [
        "Ố là la! Chặng cuối cùng đến rồi!",
        "Kho báu tri thức đang ở ngay trước mắt! Chỉ còn mười câu hỏi nữa thôi!",
        "Tập trung hết sức, thể hiện tài năng và rinh huy hiệu vàng nào!",
        '<b class="intro-highlight">TRẠNG TÝ TIN CÁC BẠN SẼ LÀM ĐƯỢC!</b>'
      ]
    }
  };

  let stageIntroResolve = null;
  function showStageIntro(stageId) {
    const sp = STAGE_SPEECHES[stageId];
    if (!sp) { closeStageIntro(); return Promise.resolve(); }
    stopAudio();
    const modal = $("#stage-intro");
    const tag = $("#stage-intro-tag");
    const bubble = $("#stage-intro-bubble");
    const btn = $("#btn-stage-intro-start");

    if (tag) tag.textContent = sp.tag;
    if (btn) btn.textContent = sp.btn;
    if (modal) modal.classList.remove("hidden");
    if (bubble) runDialogue(bubble, sp.paragraphs, sp.audioKey, state.settings.introStage !== false);

    return new Promise(res => { stageIntroResolve = res; });
  }

  function closeStageIntro() {
    stopDialogue();
    stopAudio();
    $("#stage-intro")?.classList.add("hidden");
    tyHold = false;
    if (tyPending) { const h = tyPending; tyPending = null; setTimeout(() => tyHint(h), 350); }
    if (typeof stageIntroResolve === "function") {
      const fn = stageIntroResolve;
      stageIntroResolve = null;
      fn();
    }
  }

  $("#btn-stage-intro-start")?.addEventListener("click", closeStageIntro);

  /* ---------- Màn hình chặng ---------- */
  let current = null;
  function openStage(id) {
    if (!$("#map-intro")?.classList.contains("hidden")) return;
    closeMapIntro();
    const st = STAGES.find(s => s.id === id);
    current = st;
    const wrap = $("#screen-stage");
    wrap.style.setProperty("--c", st.color);
    wrap.style.setProperty("--cd", st.colorDark);
    $("#stage-num").textContent = `Chặng ${st.id}`;
    $("#stage-name").textContent = `${st.emoji} ${st.name}`;
    const stars = state.stars[st.id] || 0;
    $("#stage-stars").textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
    $("#stage-bubble").textContent = st.intro;

    // ảnh bìa (có dự phòng)
    let cover = $("#stage-cover");
    if (cover.tagName !== "IMG") {
      const img = document.createElement("img");
      img.id = "stage-cover"; img.className = "stage-cover";
      cover.replaceWith(img); cover = img;
    }
    cover.dataset.fallback = st.emoji;
    cover.alt = st.name;
    applyImgFallback(cover);
    cover.src = st.img;

    unmountGame();
    const game = (window.STAGE_GAMES || {})[st.id];
    wrap.classList.toggle("has-game", !!game);
    show("screen-stage");
    if (game) {
      tyHold = true;   // giữ gợi ý tới khi bé bấm "Bắt đầu" ở lời mở đầu
      $("#play-board").innerHTML = "";
      gameCleanup = game.mount($("#play-board"), gameApi(st)) || null;
    } else {
      $("#play-board").innerHTML = st.preview();
    }

    // Hiển thị lời mở đầu của Trạng Tý làm mờ phần trò chơi phía sau
    showStageIntro(st.id);
  }

  /* ---------- Trạng Tý đứng ở góc màn hình nói gợi ý (chỉ chữ, không phát âm thanh) ---------- */
  let tyHintTimer = null, tyLastHint = "", tyPending = null, tyHold = false;
  function tyHint(text, keepMs) {
    if (!text) return;
    tyLastHint = text;
    // Đang hiện lời mở đầu chặng -> đợi bấm "Bắt đầu" rồi mới nói
    if (tyHold || !$("#stage-intro")?.classList.contains("hidden")) { tyPending = text; return; }
    const box = $("#ty-corner"), bub = $("#ty-bubble");
    if (!box || !bub) return;
    bub.textContent = text;
    box.classList.remove("ty-say"); void box.offsetWidth; box.classList.add("ty-say");
    const ms = keepMs || Math.max(4500, text.length * 85);
    tyTalkUntil = performance.now() + Math.min(ms, 600 + text.length * 55);
    clearTimeout(tyHintTimer);
    tyHintTimer = setTimeout(() => box.classList.remove("ty-say"), ms);
  }
  function tyHintHide() { clearTimeout(tyHintTimer); tyPending = null; $("#ty-corner")?.classList.remove("ty-say"); tyTalkUntil = 0; }
  $("#ty-corner")?.addEventListener("click", () => tyHint(tyLastHint || "Bé cố lên nhé! Trạng Tý luôn ở đây cùng bé!"));

  let gameCleanup = null;
  function unmountGame() {
    tyHintHide();
    tyLastHint = "";
    stopAudio();
    closeStageIntro();
    tyHintHide();
    if (typeof gameCleanup === "function") gameCleanup();
    gameCleanup = null;
  }
  function gameApi(st) {
    return {
      ...window.VQAV,
      stage: st,
      /* Trạng Tý nói gợi ý ở góc màn hình (chỉ giữ âm thanh cho lời mở đầu) */
      say(text) { $("#stage-bubble").textContent = text; tyHint(text); return Promise.resolve(); },
      show(text) { $("#stage-bubble").textContent = text; tyHint(text); },
      setStars(n) { $("#stage-stars").textContent = "★".repeat(n) + "☆".repeat(3 - n); },
      backToMap() { unmountGame(); openMap(); }
    };
  }

  $("#btn-back-map").addEventListener("click", () => { unmountGame(); openMap(); });
  $("#btn-listen").addEventListener("click", () => tyHint(tyLastHint || lastSay.text));
  $("#btn-home").addEventListener("click", () => { unmountGame(); show("screen-home"); });

  /* ---------- Cài đặt ---------- */
  const settingIds = { voice: "#set-voice", sfx: "#set-sfx", bgm: "#set-bgm", introMap: "#set-intro-map", introStage: "#set-intro-stage", inclusive: "#set-inclusive", teacher: "#set-teacher", custom: "#set-custom" };
  function applySettings() {
    document.body.classList.toggle("inclusive", state.settings.inclusive);
    Object.entries(settingIds).forEach(([k, sel]) => { const el = $(sel); if (el) el.checked = state.settings[k]; });
    $$('input[name="set-gender"]').forEach(r => { r.checked = r.value === state.settings.gender; });
    $("#btn-myaudio").classList.toggle("dim", !state.settings.custom);
    refreshMyAudioCount();
    updateMusicUI();
    if (state.settings.bgm && bgmAudio && bgmAudio.paused) playBGM();
    else if (!state.settings.bgm && bgmAudio && !bgmAudio.paused) pauseBGM();
  }
  function refreshMyAudioCount() { $("#myaudio-count").textContent = myAudio.count(); }
  myAudio.ready.then(refreshMyAudioCount);

  $("#btn-music")?.addEventListener("click", toggleBGM);

  Object.entries(settingIds).forEach(([k, sel]) => {
    $(sel)?.addEventListener("change", e => {
      state.settings[k] = e.target.checked;
      save();
      applySettings();
      if (k === "bgm") {
        if (e.target.checked) playBGM();
        else pauseBGM();
      }
      if (k === "teacher" && $("#screen-map").classList.contains("active")) renderMap();
      if (k === "custom") toast(e.target.checked ? "🎙️ Đang ưu tiên âm thanh của bạn" : "🗣️ Dùng giọng mẫu");
    });
  });
  $$('input[name="set-gender"]').forEach(r => r.addEventListener("change", () => {
    state.settings.gender = r.value;
    save();
    // nghe thử giọng vừa chọn
    playSound("am", "b", "bờ").then(() => wait(200)).then(() => playSound("tu", "b", "bò"));
  }));
  $("#btn-myaudio").addEventListener("click", () => window.MyAudioUI && window.MyAudioUI.open());
  $("#btn-settings").addEventListener("click", () => { applySettings(); $("#modal-settings").classList.remove("hidden"); });
  $("#btn-close-settings").addEventListener("click", () => $("#modal-settings").classList.add("hidden"));
  $("#modal-settings").addEventListener("click", e => {
    if (e.target.id === "modal-settings") e.currentTarget.classList.add("hidden");
  });
  $("#btn-reset").addEventListener("click", () => {
    if (!confirm("Xóa toàn bộ tiến độ và chơi lại từ đầu?")) return;
    const keep = state.settings;
    state = { ...defaultState(), settings: keep };
    save();
    $("#input-name").value = "";
    $("#modal-settings").classList.add("hidden");
    unmountGame();
    show("screen-home");
  });

  /* ---------- Khởi động ---------- */
  applySettings();
  refreshTopbar();

  // API công khai để các chặng dùng chung
  window.VQAV = {
    speak, ting, sfx, toast, playClip, playSound, stopAudio, wait, confetti, burst, floatTag,
    myAudio, refreshMyAudioCount,
    hasSampleAudio,
    hasAudio(cat, k) { const id = `${cat}/${k}`; return hasSampleAudio(cat, k) || myAudio.has(id); },
    finishStage(id, stars) {
      state.stars[id] = Math.max(state.stars[id] || 0, stars);
      state.unlocked = Math.max(state.unlocked, id + 1);
      save(); refreshTopbar();
    },
    /* Lưu dữ liệu riêng của từng chặng (vd: âm đã học) */
    getData(key, def) { return (state.data && state.data[key]) ?? def; },
    setData(key, val) { state.data = state.data || {}; state.data[key] = val; save(); },
    get state() { return state; }
  };
})();
