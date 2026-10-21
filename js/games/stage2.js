/* =========================================================
   CHẶNG 2 – CẦU GHÉP VẦN  (bản thiết kế lại – toàn cảnh)
   Cảnh sông chiếm toàn bộ màn chơi; bảng gỗ treo (tranh + loa),
   cầu gỗ thật với cột & dây thừng, khay mảnh chữ bằng gỗ.
   Kéo / chạm mảnh chữ → mảnh bay lên ván → bạn nhỏ bước tới.
   Ghép đủ từ → bạn nhỏ qua cầu, bước vào cổng làng.
   ========================================================= */
window.STAGE_GAMES = window.STAGE_GAMES || {};

(() => {
  const SO_TU = 10;                                   // mỗi lượt 10 từ ngẫu nhiên
  const extraFor = w => (w.m.length >= 4 ? 3 : 2);     // số mảnh gây nhiễu theo độ dài từ
  // Vị trí trong khung cảnh SVG (% của khung)
  const SHORE = { x: 13, y: 78, h: 27 };   // bờ trái – cuối lối đá
  const GATE  = { x: 90, y: 62.8, h: 19 }; // trước cửa cổng làng

  const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = arr => arr[Math.random() * arr.length | 0];

  /* ---------- Mảnh gây nhiễu ---------- */
  const TONES = ["", "\u0300", "\u0301", "\u0309", "\u0303", "\u0323"];
  const stripTone = s => s.normalize("NFD").replace(/[\u0300\u0301\u0303\u0309\u0323]/g, "").normalize("NFC");
  const withTone = (s, t) => (stripTone(s).normalize("NFD") + t).normalize("NFC");
  const isVowel = s => /^[aăâeêioôơuưy]$/.test(stripTone(s));
  const CONSONANT_MIX = [
    ["b", "d", "đ", "p"], ["m", "n"], ["c", "k", "qu"], ["g", "gh"], ["ng", "ngh"], ["ch", "tr"],
    ["s", "x"], ["d", "gi", "r"], ["l", "n"], ["t", "th"], ["ph", "p"], ["kh", "k"], ["nh", "n"], ["h", "kh"], ["v", "b"],
  ];
  const VOWEL_MIX = [["a", "ă", "â"], ["o", "ô", "ơ"], ["e", "ê"], ["u", "ư"], ["i", "y"]];
  const FILLERS = ["a", "o", "e", "u", "i", "n", "m", "t", "c", "ng", "nh", "ch"];
  function distractors(word, n) {
    const correct = new Set(word.m), cands = new Set();
    word.m.forEach(p => {
      if (isVowel(p)) {
        const tone = p.normalize("NFD").match(/[\u0300\u0301\u0303\u0309\u0323]/), t = tone ? tone[0] : "";
        TONES.forEach(t2 => t2 !== t && cands.add(withTone(p, t2)));
        VOWEL_MIX.filter(g => g.includes(stripTone(p))).flat().forEach(v => v !== stripTone(p) && cands.add(withTone(v, t)));
      } else CONSONANT_MIX.filter(g => g.includes(p)).flat().forEach(c => cands.add(c));
    });
    FILLERS.forEach(f => cands.add(f));
    return shuffle([...cands].filter(c => !correct.has(c))).slice(0, n);
  }

  function mount(root, api) {
    let alive = true;
    const inclusive = () => api.state.settings.inclusive;
    root.classList.add("g2-root");

    root.innerHTML = `
      <div class="g2-stage" id="g2-stage">
        <!-- ===== KHUNG CẢNH ===== -->
        <div class="g2-scene" id="g2-scene">
          ${window.S2_SCENE_SVG || ""}
          <div class="g2-sky" aria-hidden="true">
            <svg class="g2-bird b1" viewBox="0 0 40 14"><path d="M2 10 Q10 0 20 9 Q30 0 38 10" /></svg>
            <svg class="g2-bird b2" viewBox="0 0 40 14"><path d="M2 10 Q10 0 20 9 Q30 0 38 10" /></svg>
            <svg class="g2-bird b3" viewBox="0 0 40 14"><path d="M2 10 Q10 0 20 9 Q30 0 38 10" /></svg>
          </div>
          <div class="g2-water" aria-hidden="true">
            ${[[36, 86], [50, 93], [62, 84], [70, 95], [44, 64], [58, 62]].map(([x, y], i) =>
              `<i class="g2-ripple" style="left:${x}%;top:${y}%;--d:${i * 1.1}s"></i>`).join("")}
            <i class="g2-glint"></i>
          </div>
          <div class="g2-gate-glow" id="g2-gate-glow" aria-hidden="true"></div>
          <span class="g2-fly-bug f1" aria-hidden="true">🦋</span>
          <span class="g2-fly-bug f2" aria-hidden="true">🦋</span>

          <div class="g2-bridge" id="g2-bridge">
            <div class="g2-bshadow"></div>
            <div class="g2-3d">
              <div class="g2-deck">
                <div class="g2-planks" id="g2-planks"></div>
              </div>
            </div>
          </div>

          <div class="g2-boy" id="g2-boy">
            <i class="g2-boy-shadow"></i>
            <img class="g2-boy-img" src="assets/img/s2-boy.png" alt="Bạn nhỏ" draggable="false" />
          </div>
        </div>

        <!-- ===== BẢNG GỖ TREO ===== -->
        <div class="g2-hud hidden" id="g2-hud">
          <div class="g2-sign">
            <i class="g2-sign-rope l"></i><i class="g2-sign-rope r"></i>
            <div class="g2-sign-dots" id="g2-dots"></div>
            <div class="g2-sign-row">
              <div class="g2-pic" id="g2-pic">⛵</div>
              <button class="g2-speaker" id="g2-speaker" data-nosfx aria-label="Nghe từ">🔊</button>
              <button class="g2-hint" id="g2-hint" title="Gợi ý" aria-label="Gợi ý">💡</button>
            </div>
          </div>
          <div class="g2-banner" id="g2-status" aria-live="polite">Nghe rồi ghép chữ lên cầu nhé</div>
        </div>

        <!-- ===== KHAY MẢNH CHỮ ===== -->
        <div class="g2-dock hidden" id="g2-dock">
          <div class="g2-tray" id="g2-tray"></div>
        </div>

        <div class="g2-overlay hidden" id="g2-result"></div>
      </div>`;

    const $ = s => root.querySelector(s);
    const $$ = s => [...root.querySelectorAll(s)];
    let game = null;

    $(".g2-boy-img").addEventListener("error", e => {
      const s = document.createElement("div"); s.className = "g2-boy-img g2-boy-emoji"; s.textContent = "🧒"; e.target.replaceWith(s);
    }, { once: true });

    /* ---------- Bắt đầu lượt: 10 từ ngẫu nhiên ---------- */
    const introOpen = () => !document.getElementById("stage-intro")?.classList.contains("hidden");
    const onIntroStart = () => setTimeout(() => { if (alive && game && !game.locked) playWord(); }, 450);
    document.getElementById("btn-stage-intro-start")?.addEventListener("click", onIntroStart);

    function start() {
      api.stopAudio();
      game = { list: shuffle(TU_GHEP).slice(0, SO_TU), i: 0, perfect: 0, missed: [] };
      $("#g2-result").classList.add("hidden");
      $("#g2-hud").classList.remove("hidden");
      $("#g2-dock").classList.remove("hidden");
      $("#g2-dots").innerHTML = game.list.map(() => "<i></i>").join("");
      nextWord();
    }

    /* ---------- Dòng trạng thái ---------- */
    let stTimer;
    const hintText = () => `Từ ${game.i + 1}/${game.list.length} · Nghe 🔊 rồi đặt mảnh chữ lên cầu`;
    function setStatus(text, type = "", revert = false) {
      const el = $("#g2-status");
      el.textContent = text;
      el.className = "g2-banner" + (type ? " " + type : "");
      void el.offsetWidth; if (type) el.classList.add("pop");
      api.show(text);
      clearTimeout(stTimer);
      if (revert) stTimer = setTimeout(() => game && !game.locked && setStatus(hintText()), 1700);
    }

    /* ---------- Dựng cây cầu ---------- */
    function buildBridge(pieces, empty = false) {
      const n = pieces.length;
      const pad = Math.max(0, 4 - n), padL = Math.floor(pad / 2), total = n + pad;   // ván trơn hai đầu cho từ ngắn
      $("#g2-bridge").style.setProperty("--n", total);
      const plain = k => Array.from({ length: k }, () => `<div class="g2-plank plain"></div>`).join("");
      $("#g2-planks").innerHTML = plain(padL) + pieces.map((p, i) => `
        <div class="g2-plank" data-i="${i}" style="--k:${i}">
          <div class="g2-face">
            <span class="g2-ghost"></span>
            <span class="g2-letter"></span>
          </div>
        </div>`).join("") + plain(pad - padL);
      // vòm cong nhẹ: ván giữa nhô cao hơn ván hai đầu
      [...$("#g2-planks").children].forEach((el, j) => {
        el.style.setProperty("--lift", (Math.sin(Math.PI * (j + .5) / total) * 2.4).toFixed(2) + "cqw");
        if (j === 0) el.classList.add("first");
        if (j === total - 1) el.classList.add("last");
      });
      markTarget();
    }
    function markTarget() {
      const idx = game ? game.filled.indexOf(false) : -1;
      $$(".g2-plank[data-i]").forEach((p, i) => p.classList.toggle("next", i === idx));
    }

    /* ---------- Nhân vật ---------- */
    function placeBoy(where, instant = false) {
      const boy = $("#g2-boy"), scene = $("#g2-scene");
      let p;
      if (where === "shore") p = SHORE;
      else if (where === "gate") p = GATE;
      else {
        const plank = $$(".g2-plank[data-i]")[where];
        const sr = scene.getBoundingClientRect(), r = plank.getBoundingClientRect();
        if (!sr.width) p = SHORE;
        else p = { x: ((r.left + r.width / 2) - sr.left) / sr.width * 100, y: ((r.top + r.height * .25) - sr.top) / sr.height * 100, h: 21 };
      }
      boy.classList.toggle("instant", instant);
      boy.classList.remove("enter");
      if (!instant) { boy.classList.add("walking"); clearTimeout(boy._t); boy._t = setTimeout(() => boy.classList.remove("walking"), 700); }
      boy.style.left = p.x + "%";
      boy.style.top = p.y + "%";
      boy.style.height = p.h + "%";
    }
    const contiguous = () => { let k = 0; while (k < game.filled.length && game.filled[k]) k++; return k; };
    const onResize = () => {
      if (!game) return placeBoy("shore", true);
      if (game.locked) return;
      const k = contiguous();
      placeBoy(k ? k - 1 : "shore", true);
    };
    window.addEventListener("resize", onResize);

    /* ---------- Một từ mới ---------- */
    function nextWord() {
      const w = game.list[game.i];
      Object.assign(game, { tries: 0, hinted: false, filled: w.m.map(() => false), locked: false });
      $$("#g2-dots i").forEach((d, i) => d.classList.toggle("current", i === game.i));
      const pic = $("#g2-pic");
      pic.textContent = w.hinh;
      pic.classList.remove("swing"); void pic.offsetWidth; pic.classList.add("swing");
      setStatus(hintText());
      buildBridge(w.m);
      $("#g2-bridge").classList.remove("done");
      $("#g2-gate-glow").classList.remove("on");

      const tiles = shuffle([...w.m, ...distractors(w, inclusive() ? 1 : extraFor(w))]);
      $("#g2-tray").innerHTML = tiles.map((t, i) => `
        <button class="g2-tile" data-t="${t}" data-nosfx style="--d:${i * .06}s"><span>${t}</span></button>`).join("");

      const boy = $("#g2-boy");
      boy.classList.add("instant", "appear");
      placeBoy("shore", true);
      setTimeout(() => boy.classList.remove("appear"), 600);
      setTimeout(() => alive && game && !introOpen() && playWord(), 500);
    }

    async function playWord() {
      if (!game) return;
      const w = game.list[game.i], sp = $("#g2-speaker");
      sp.classList.add("speaking");
      await api.playSound("ghep", w.w, w.tu);
      sp.classList.remove("speaking");
    }
    $("#g2-speaker").addEventListener("click", playWord);

    /* ---------- Mảnh chữ bay ---------- */
    function fly(fromRect, toEl, text, done) {
      const to = toEl.getBoundingClientRect();
      const f = document.createElement("div");
      f.className = "g2-flying";
      f.innerHTML = `<span>${text}</span>`;
      Object.assign(f.style, { left: fromRect.left + "px", top: fromRect.top + "px", width: fromRect.width + "px", height: fromRect.height + "px" });
      document.body.appendChild(f);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const dx = to.left + to.width / 2 - (fromRect.left + fromRect.width / 2);
        const dy = to.top + to.height / 2 - (fromRect.top + fromRect.height / 2);
        f.style.transform = `translate(${dx}px, ${dy}px) scale(${Math.min(1.1, to.width / fromRect.width)})`;
        f.style.opacity = ".2";
      }));
      setTimeout(() => { f.remove(); done && done(); }, 330);
    }

    /* ---------- Đặt mảnh chữ ---------- */
    function tryPlace(tile, plankIdx, fromRect) {
      if (!game || game.locked || tile.disabled) return false;
      const w = game.list[game.i];
      if (plankIdx == null) plankIdx = game.filled.indexOf(false);
      if (plankIdx < 0 || game.filled[plankIdx]) return false;
      const plank = $$(".g2-plank[data-i]")[plankIdx];
      const rect = fromRect || tile.getBoundingClientRect();

      if (tile.dataset.t === w.m[plankIdx]) {
        game.filled[plankIdx] = true;
        tile.disabled = true; tile.classList.add("used");
        $$(".g2-tile.hint").forEach(t => t.classList.remove("hint"));
        markTarget();
        fly(rect, plank.querySelector(".g2-face"), tile.dataset.t, () => {
          if (!alive) return;
          plank.classList.add("filled", "thunk");
          plank.querySelector(".g2-letter").textContent = tile.dataset.t;
          setTimeout(() => plank.classList.remove("thunk"), 400);
          api.sfx("flip");
          api.burst(plank, 8);
          const k = contiguous();
          if (k) placeBoy(k - 1);
          if (game && game.filled.every(Boolean)) complete();
        });
        return true;
      }
      game.tries++;
      api.sfx("bad");
      tile.classList.remove("shake"); void tile.offsetWidth; tile.classList.add("shake");
      setTimeout(() => tile.classList.remove("shake"), 450);
      plank.classList.remove("nope"); void plank.offsetWidth; plank.classList.add("nope");
      api.floatTag(plank, "✖", "bad");
      setStatus(pick(["🤔 Chưa đúng chỗ, bé thử lại nhé!", "💪 Gần đúng rồi, bé thử mảnh khác nhé!"]), "bad", true);
      if (inclusive()) showHint(false);
      return false;
    }

    function showHint(count = true) {
      if (!game || game.locked) return;
      const w = game.list[game.i], idx = game.filled.indexOf(false);
      if (idx < 0) return;
      if (count) game.hinted = true;
      $$(".g2-tile.hint").forEach(t => t.classList.remove("hint"));
      const t = $$(".g2-tile").find(t => !t.disabled && t.dataset.t === w.m[idx]);
      if (t) t.classList.add("hint");
      const pl = $$(".g2-plank[data-i]")[idx];
      pl.classList.add("target"); setTimeout(() => pl.classList.remove("target"), 1300);
    }
    $("#g2-hint").addEventListener("click", () => showHint(true));

    async function complete() {
      game.locked = true;
      const w = game.list[game.i];
      const perfect = game.tries === 0 && !game.hinted;
      if (perfect) game.perfect++; else game.missed.push(w);
      $$("#g2-dots i")[game.i].classList.add(perfect ? "ok" : "half");
      $("#g2-bridge").classList.add("done");
      api.sfx("ok");
      setStatus(`${perfect ? "🎉" : "👍"} Đúng rồi: “${w.tu}”! Bạn nhỏ qua cầu nào!`, "good");
      await api.wait(550);
      if (!alive || !game) return;
      $("#g2-gate-glow").classList.add("on");
      placeBoy("gate");
      await api.wait(750);
      if (!alive || !game) return;
      api.burst($("#g2-boy"), 22);
      api.floatTag($("#g2-boy"), perfect ? "+⭐" : "👍", "good");
      $("#g2-boy").classList.add("enter");
      await api.wait(1100);
      if (!alive || !game) return;
      game.i++;
      if (game.i < game.list.length) nextWord(); else finish();
    }

    /* ---------- Kéo thả (chuột + cảm ứng) ---------- */
    let drag = null;
    $("#g2-tray").addEventListener("pointerdown", e => {
      const tile = e.target.closest(".g2-tile");
      if (!tile || tile.disabled || !game || game.locked) return;
      e.preventDefault();
      const r = tile.getBoundingClientRect();
      drag = { tile, r, x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, ghost: null, moved: false, over: null };
      tile.setPointerCapture(e.pointerId);
    });
    root.addEventListener("pointermove", e => {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 8) {
        drag.moved = true;
        const g = drag.tile.cloneNode(true);
        g.classList.add("g2-drag-ghost");
        Object.assign(g.style, { width: drag.r.width + "px", height: drag.r.height + "px" });
        document.body.appendChild(g);
        drag.ghost = g;
        drag.tile.classList.add("lifted");
        api.sfx("pop");
      }
      if (!drag.moved) return;
      drag.ghost.style.left = e.clientX - drag.dx + "px";
      drag.ghost.style.top = e.clientY - drag.dy + "px";
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const plank = el && el.closest && el.closest(".g2-plank:not(.filled)");
      if (plank !== drag.over) {
        drag.over && drag.over.classList.remove("over");
        plank && plank.classList.add("over");
        drag.over = plank;
      }
    });
    const endDrag = () => {
      if (!drag) return;
      const d = drag; drag = null;
      d.over && d.over.classList.remove("over");
      if (!d.moved) { d.tile.classList.remove("lifted"); tryPlace(d.tile); return; }
      const gr = d.ghost.getBoundingClientRect();
      d.ghost.remove();
      const ok = d.over ? tryPlace(d.tile, +d.over.dataset.i, gr) : false;
      if (!ok) {
        // bay về khay
        fly(gr, d.tile, d.tile.dataset.t, () => d.tile.classList.remove("lifted"));
      } else d.tile.classList.remove("lifted");
    };
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);

    /* ---------- Kết thúc lượt ---------- */
    function finish() {
      const { perfect, list, missed } = game;
      const ratio = perfect / list.length;
      const stars = ratio >= .85 ? 3 : ratio >= .5 ? 2 : 1;
      const prev = api.state.stars[2] || 0;
      api.finishStage(2, stars);
      api.setStars(Math.max(prev, stars));
      $("#g2-hud").classList.add("hidden");
      $("#g2-dock").classList.add("hidden");
      const r = $("#g2-result");
      r.innerHTML = `
        <div class="g2-board pop-in">
          <i class="g2-sign-rope l"></i><i class="g2-sign-rope r"></i>
          <div class="result-stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? "on" : ""}" style="--d:${i * .25}s">★</span>`).join("")}</div>
          <h3 class="g2-board-title small">${stars === 3 ? "Xuất sắc!" : stars === 2 ? "Giỏi lắm!" : "Bé đã cố gắng!"}</h3>
          <div class="g2-board-sub">Ghép đúng ngay lần đầu <b>${perfect}/${list.length}</b> từ</div>
          ${missed.length ? `
            <div class="g2-review">
              <span>Ôn lại:</span>
              ${missed.map(w => `<button class="am-chip" data-w="${w.w}" data-nosfx>${w.hinh} ${w.tu}</button>`).join("")}
            </div>` : ""}
          <div class="result-actions">
            <button class="btn btn-ghost" id="g2-again">🔁 Chơi lại</button>
            <button class="btn btn-primary" id="g2-map">🗺️ Về bản đồ</button>
          </div>
        </div>`;
      r.classList.remove("hidden");
      api.confetti(stars * 40);
      api.sfx(stars >= 2 ? "win" : "ok");
      r.querySelectorAll(".am-chip").forEach(c => c.addEventListener("click", () => {
        const w = TU_GHEP.find(x => x.w === c.dataset.w);
        api.playSound("ghep", w.w, w.tu);
      }));
      $("#g2-again").addEventListener("click", start);
      $("#g2-map").addEventListener("click", () => api.backToMap());
      game = null;
    }

    /* Bắt đầu */
    start();
    requestAnimationFrame(() => placeBoy("shore", true));
    api.say("Đây là Cầu ghép vần! Bé hãy kéo các chữ vào ô trống để ghép thành tiếng nhé!", "intro-2");

    return () => {
      alive = false; game = null;
      document.getElementById("btn-stage-intro-start")?.removeEventListener("click", onIntroStart);
      root.classList.remove("g2-root");
      window.removeEventListener("resize", onResize);
      document.querySelectorAll(".g2-drag-ghost, .g2-flying").forEach(g => g.remove());
    };
  }

  window.STAGE_GAMES[2] = { mount };
})();
