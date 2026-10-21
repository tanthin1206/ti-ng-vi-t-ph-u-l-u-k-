/* =========================================================
   CHẶNG 5 – KHO BÁU TRI THỨC
   Sắp xếp các tiếng thành câu có nghĩa (câu trong sách Tiếng Việt 1 – KNTT).
   Chạm tiếng để đặt vào ô kế tiếp; chạm tiếng đã đặt để trả về.
   Đặt đủ → tự kiểm tra. Mỗi câu đúng nhận 1 viên ngọc; đủ 10 viên mở rương báu.
   ========================================================= */
window.STAGE_GAMES = window.STAGE_GAMES || {};

(() => {
  const SO_CAU = 10;
  const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = arr => arr[Math.random() * arr.length | 0];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const GEMS = ["💎", "🔷", "💚", "❤️", "💜", "🧡", "💛", "🩵", "🤍", "💗"];

  /* Tách câu: giữ dấu phẩy dính với tiếng, dấu kết câu đứng riêng ở cuối */
  function split(cau) {
    const m = cau.trim().match(/^(.*?)([.!?])?$/);
    return { tokens: m[1].split(/\s+/), end: m[2] || "." };
  }
  // trộn sao cho khác thứ tự đúng
  function scramble(tokens) {
    if (new Set(tokens).size < 2) return [...tokens];
    let s; do { s = shuffle(tokens); } while (s.join(" ") === tokens.join(" "));
    return s;
  }

  const CHEST_SVG = `
    <svg class="g5-chest" viewBox="0 0 200 170" aria-hidden="true">
      <ellipse cx="100" cy="160" rx="90" ry="10" fill="rgba(120,70,10,.25)"/>
      <g class="g5-glow"><circle cx="100" cy="70" r="70" fill="url(#g5glow)"/></g>
      <defs><radialGradient id="g5glow"><stop offset="0" stop-color="#fff6b0" stop-opacity=".95"/><stop offset="1" stop-color="#ffd34d" stop-opacity="0"/></radialGradient></defs>
      <rect x="22" y="80" width="156" height="76" rx="10" fill="#b8742f" stroke="#7a4a1a" stroke-width="5"/>
      <rect x="22" y="104" width="156" height="12" fill="#e0a83c" stroke="#9a6a14" stroke-width="3"/>
      <rect x="88" y="98" width="24" height="30" rx="5" fill="#ffd34d" stroke="#9a6a14" stroke-width="3"/>
      <circle cx="100" cy="112" r="4" fill="#7a4a1a"/>
      <g class="g5-lid">
        <path d="M22 82 Q22 36 100 36 Q178 36 178 82Z" fill="#c9843a" stroke="#7a4a1a" stroke-width="5" stroke-linejoin="round"/>
        <path d="M60 40 V82 M140 40 V82" stroke="#e0a83c" stroke-width="10"/>
      </g>
    </svg>`;

  const TRAPS = ["nhé", "lắm", "quá", "nữa", "đang", "rất", "cùng", "ngoan", "xanh", "tươi", "nhỉ", "chưa"];

  function mount(root, api) {
    let alive = true;
    const inclusive = () => api.state.settings.inclusive;
    root.classList.add("g5-root");

    root.innerHTML = `
      <div class="g5-stage" data-mode="de">
        <div class="g5-bg" aria-hidden="true">
          ${Array.from({ length: 16 }, (_, i) => `<i class="g5-spark" style="left:${(i * 41) % 100}%;top:${(i * 29) % 90}%;--d:${(i % 6) * .5}s"></i>`).join("")}
        </div>
        ${CHEST_SVG}

        <div class="g5-play hidden" id="g5-play">
          <div class="g5-top">
            <div class="g5-gems" id="g5-gems"></div>
            <div class="g5-count" id="g5-count">Câu 1/10</div>
          </div>

          <div class="g5-task">
            <span class="g5-task-text" id="g5-task-text">Sắp xếp các tiếng thành câu có nghĩa</span>
            <button class="g5-tool" id="g5-listen" data-nosfx title="Nghe câu">🔊</button>
            <button class="g5-tool" id="g5-hint" title="Gợi ý">💡</button>
          </div>

          <div class="g5-answer" id="g5-answer"></div>
          <div class="g5-status" id="g5-status" aria-live="polite">Bé chạm vào từng tiếng theo đúng thứ tự nhé</div>
          <div class="g5-tray" id="g5-tray"></div>
        </div>

        <div class="g5-overlay hidden" id="g5-result"></div>
      </div>`;

    const $ = s => root.querySelector(s);
    const $$ = s => [...root.querySelectorAll(s)];
    const stageEl = $(".g5-stage");
    let game = null;

    /* Vào chơi ngay: 10 câu ngẫu nhiên (câu ngắn, có gợi ý ô đầu) */
    function startGame() {
      api.stopAudio();
      root.querySelector(".g5-chest").classList.remove("open", "peek");
      game = { list: shuffle(CAU_SAP_XEP).slice(0, SO_CAU), i: 0, score: 0, missed: [] };
      $("#g5-result").classList.add("hidden");
      $("#g5-play").classList.remove("hidden");
      $("#g5-gems").innerHTML = game.list.map(() => `<i></i>`).join("");
      ask();
    }

    function setStatus(text, type = "") {
      const el = $("#g5-status");
      el.textContent = text;
      el.className = "g5-status" + (type ? " " + type : "");
      void el.offsetWidth; if (type) el.classList.add("pop");
      api.show(text);
    }

    /* ---------- Một câu ---------- */
    function ask() {
      const c = game.list[game.i];
      const { tokens, end } = split(c.cau);
      const trap = null;
      const trayTokens = scramble(tokens);

      Object.assign(game, { tokens, end, trap, slots: tokens.map(() => null), tries: 0, hinted: false, locked: false });
      $("#g5-count").textContent = `Câu ${game.i + 1}/${game.list.length}`;
      $("#g5-task-text").textContent = "Sắp xếp các tiếng thành câu có nghĩa";
      $$("#g5-gems i").forEach((g, i) => g.classList.toggle("current", i === game.i));

      $("#g5-answer").innerHTML = tokens.map((t, i) => {
        const ghost = i === 0 ? ` data-ghost="${esc(t)}"` : "";
        return `<span class="g5-slot" data-s="${i}"${ghost}></span>`;
      }).join("") + `<span class="g5-end">${end}</span>`;
      $("#g5-answer").style.setProperty("--n", tokens.length);
      $("#g5-answer").classList.toggle("compact", tokens.length >= 8);

      $("#g5-tray").innerHTML = trayTokens.map((t, i) => `<button class="g5-tile" data-t="${esc(t)}" data-id="${i}" data-nosfx style="--d:${i * .04}s">${esc(t)}</button>`).join("");
      $("#g5-tray").classList.toggle("compact", trayTokens.length >= 9);

      setStatus("Ô đầu có gợi ý mờ, bé chạm từng tiếng theo thứ tự nhé!");
      markNext();
    }
    function markNext() {
      const idx = game.slots.indexOf(null);
      $$(".g5-slot").forEach((s, i) => s.classList.toggle("next", i === idx));
    }

    function fly(fromEl, toEl, text, done) {
      const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      const f = document.createElement("div");
      f.className = "g5-flying"; f.textContent = text;
      Object.assign(f.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
      document.body.appendChild(f);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        f.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px)`;
      }));
      setTimeout(() => { f.remove(); done(); }, 280);
    }

    function place(tile, slotIdx) {
      const slot = $$(".g5-slot")[slotIdx];
      game.slots[slotIdx] = tile.dataset.id;
      tile.classList.add("used"); tile.disabled = true;
      api.sfx("flip");
      fly(tile, slot, tile.dataset.t, () => {
        if (!alive || !game) return;
        slot.textContent = tile.dataset.t; slot.dataset.id = tile.dataset.id;
        slot.classList.add("filled");
        markNext();
        if (game.slots.every(s => s !== null)) check();
      });
    }

    // chạm tiếng trong khay → ô trống kế tiếp
    $("#g5-tray").addEventListener("click", e => {
      const tile = e.target.closest(".g5-tile");
      if (!tile || tile.disabled || !game || game.locked) return;
      const idx = game.slots.indexOf(null);
      if (idx >= 0) place(tile, idx);
    });
    // chạm tiếng đã đặt → trả về khay
    $("#g5-answer").addEventListener("click", e => {
      const slot = e.target.closest(".g5-slot.filled");
      if (!slot || !game || game.locked || slot.classList.contains("lock")) return;
      unplace(+slot.dataset.s);
      api.sfx("pop");
      markNext();
    });
    function unplace(i) {
      const slot = $$(".g5-slot")[i], id = game.slots[i];
      if (id == null) return;
      const tile = $(`.g5-tile[data-id="${id}"]`);
      tile.classList.remove("used"); tile.disabled = false;
      game.slots[i] = null;
      slot.textContent = ""; slot.classList.remove("filled", "bad"); delete slot.dataset.id;
    }

    function check() {
      if (!game || game.locked) return;   // tránh kiểm tra 2 lần khi bé chạm nhanh
      const tiles = id => $(`.g5-tile[data-id="${id}"]`).dataset.t;
      const placed = game.slots.map(tiles);
      const ok = placed.every((t, i) => t === game.tokens[i]);
      const c = game.list[game.i];
      if (ok) {
        game.locked = true;
        const first = game.tries === 0 && !game.hinted;
        if (first) game.score++; else game.missed.push(c);
        $$(".g5-slot").forEach((s, i) => { s.classList.add("good"); s.style.setProperty("--k", i); });
        $$(".g5-tile").forEach(t => t.disabled = true);
        $("#g5-answer").classList.add("done");
        api.sfx("ok");
        const gem = $$("#g5-gems i")[game.i];
        gem.textContent = GEMS[game.i % GEMS.length];
        gem.classList.remove("current"); gem.classList.add("got"); if (!first) gem.classList.add("half");
        const chest = root.querySelector(".g5-chest");
        chest.classList.add("peek"); setTimeout(() => chest.classList.remove("peek"), 1200);
        api.burst($("#g5-answer"), first ? 26 : 14);
        api.floatTag(gem, first ? "+💎" : "👍", "good");
        setStatus(pick(["🎉 Đúng rồi! Câu hay quá!", "💎 Chính xác! Bé nhận một viên ngọc!", "👏 Hoan hô! Bé sắp xếp giỏi quá!"]), "good");
        setTimeout(() => { if (!alive || !game) return; $("#g5-answer").classList.remove("done"); game.i++; game.i < game.list.length ? ask() : finish(); }, 1900);
      } else {
        game.tries++;
        api.sfx("bad");
        const lockRight = true;
        const wrong = [];
        placed.forEach((t, i) => {
          const s = $$(".g5-slot")[i];
          if (t === game.tokens[i]) { if (lockRight) s.classList.add("lock", "good"); }
          else { s.classList.add("bad"); wrong.push(i); }
        });
        setStatus(lockRight ? "🤔 Các ô xanh đã đúng rồi, bé xếp lại các tiếng còn lại nhé!" : "🤔 Chưa đúng thứ tự, bé thử lại nhé!", "bad");
        game.locked = true;
        setTimeout(() => {
          if (!alive || !game) return;
          wrong.forEach(i => unplace(i));
          $$(".g5-slot:not(.lock)").forEach(s => s.classList.remove("good"));
          game.locked = false;
          markNext();
        }, 950);
      }
    }

    // gợi ý: đặt đúng tiếng tiếp theo
    $("#g5-hint").addEventListener("click", () => {
      if (!game || game.locked) return;
      for (let i = 0; i < game.slots.length; i++) {
        const id = game.slots[i];
        if (id != null && $(`.g5-tile[data-id="${id}"]`).dataset.t !== game.tokens[i]) unplace(i);
      }
      const idx = game.slots.indexOf(null);
      if (idx < 0) return;
      const tile = $$(".g5-tile").find(t => !t.disabled && t.dataset.t === game.tokens[idx]);
      if (!tile) return;
      game.hinted = true;
      place(tile, idx);
      $$(".g5-slot")[idx].classList.add("lock");
    });
    $("#g5-listen").addEventListener("click", () => { const c = game && game.list[game.i]; c && api.playSound("cau", c.k, c.cau); });

    /* ---------- Kết quả ---------- */
    function finish() {
      const { score, list, missed } = game;
      const ratio = score / list.length;
      const stars = ratio >= .9 ? 3 : ratio >= .6 ? 2 : 1;
      const prev = api.state.stars[5] || 0;
      api.finishStage(5, stars);
      api.setStars(Math.max(prev, stars));
      const chest = root.querySelector(".g5-chest");
      chest.classList.add("open");
      api.confetti(stars * 50);
      api.sfx("win");
      setTimeout(() => {
        if (!alive) return;
        $("#g5-play").classList.add("hidden");
        const r = $("#g5-result");
        r.innerHTML = `
          <div class="g5-board pop-in">
            <div class="g5-kicker">CHẶNG 5</div>
            <div class="g5-badge">${stars === 3 ? "👑" : stars === 2 ? "🏅" : "🎖️"}</div>
            <div class="result-stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? "on" : ""}" style="--d:${i * .25}s">★</span>`).join("")}</div>
            <h3 class="g5-title small">${stars === 3 ? "Vua Tiếng Việt!" : stars === 2 ? "Nhà thám hiểm giỏi!" : "Bé đã cố gắng!"}</h3>
            <p class="g5-sub">Bé xếp đúng ngay lần đầu <b>${score}/${list.length}</b> câu</p>
            ${missed.length ? `<div class="g5-review"><div class="g5-review-title">Mình cùng đọc lại nhé:</div>${missed.map(c => `<button class="g5-review-item" data-k="${c.k}" data-nosfx>🔊 ${esc(c.cau)}</button>`).join("")}</div>` : ""}
            <div class="result-actions">
              <button class="btn btn-ghost" id="g5-again">🔁 Chơi lại</button>
              <button class="btn btn-primary" id="g5-map">🗺️ Về bản đồ</button>
            </div>
          </div>`;
        r.classList.remove("hidden");
        r.querySelectorAll(".g5-review-item").forEach(b => b.addEventListener("click", () => {
          const c = CAU_SAP_XEP.find(x => x.k === b.dataset.k); api.playSound("cau", c.k, c.cau);
        }));
        $("#g5-again").addEventListener("click", startGame);
        $("#g5-map").addEventListener("click", () => api.backToMap());
      }, 1300);
      api.show(stars >= 2 ? "🎉 Bé đã mở được kho báu tri thức!" : "💪 Bé đã cố gắng lắm! Mình cùng chơi lại nhé!");
      game = null;
    }

    startGame();
    api.say("Wow, Kho báu tri thức! Bé sắp xếp các tiếng thành câu để mở rương báu nhé!", "intro-5");
    return () => { alive = false; game = null; root.classList.remove("g5-root"); document.querySelectorAll(".g5-flying").forEach(f => f.remove()); };
  }

  window.STAGE_GAMES[5] = { mount };
})();
