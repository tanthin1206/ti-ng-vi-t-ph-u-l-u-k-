/* =========================================================
   CHẶNG 3 – NGÔI NHÀ TỪ NGỮ
   Nhìn tranh + nghe từ → chọn tiếng còn thiếu để ghép thành từ.
   Mỗi từ đúng: một ô cửa sổ của ngôi nhà mở ra, sáng đèn.
   ========================================================= */
window.STAGE_GAMES = window.STAGE_GAMES || {};

(() => {
  const SO_TU = 10;
  const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = arr => arr[Math.random() * arr.length | 0];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- Tiếng gây nhiễu ---------- */
  const TONE_RE = /[\u0300\u0301\u0303\u0309\u0323]/g;
  const TONES = ["", "\u0300", "\u0301", "\u0309", "\u0303", "\u0323"];
  const VOWEL_RE = /[aăâeêioôơuưy]/;
  // đặt dấu thanh lên nguyên âm chính (đơn giản hoá: nguyên âm có dấu phụ, nếu không thì nguyên âm thứ hai khi có âm cuối, ngược lại nguyên âm đầu)
  function retone(syl, tone) {
    const base = syl.normalize("NFD").replace(TONE_RE, "").normalize("NFC");
    const chars = [...base];
    const vIdx = chars.map((c, i) => VOWEL_RE.test(c) ? i : -1).filter(i => i >= 0);
    if (!vIdx.length) return base;
    let at = vIdx.filter(i => /[ăâêôơư]/.test(chars[i])).pop();
    if (at == null) {
      const last = vIdx[vIdx.length - 1], endsWithVowel = last === chars.length - 1;
      at = vIdx.length >= 2 && !endsWithVowel ? vIdx[1] : vIdx[0];
      if (/^(gi|qu)/.test(base) && vIdx.length > 1 && vIdx[0] === 1) at = vIdx[1];   // gi-, qu-
    }
    chars[at] = (chars[at].normalize("NFD") + tone).normalize("NFC");
    return chars.join("");
  }
  const toneOf = s => (s.normalize("NFD").match(TONE_RE) || [""])[0];
  function distractors(word, pos, pool) {
    const target = pos === 0 ? word.a : word.b;
    const given = pos === 0 ? word.b : word.a;
    // tiếng nào ghép với tiếng có sẵn cũng thành từ trong sách → không dùng làm đáp án nhiễu
    const alsoValid = new Set(TU_NGU.filter(w => (pos === 0 ? w.b : w.a) === given).map(w => (pos === 0 ? w.a : w.b)));
    const ok = s => s && s !== target && !alsoValid.has(s);
    const out = new Set();
    const base = target.normalize("NFD").replace(TONE_RE, "").normalize("NFC");
    const tones = /(p|t|c|ch)$/.test(base) ? ["\u0301", "\u0323"] : TONES;   // vần có âm cuối p, t, c, ch chỉ mang dấu sắc / nặng
    shuffle(tones.filter(t => t !== toneOf(target))).map(t => retone(target, t)).filter(ok).slice(0, 2).forEach(s => out.add(s));
    const others = shuffle([...new Set(pool.map(w => (pos === 0 ? w.a : w.b)))]).filter(ok);
    others.slice(0, 3 - out.size).forEach(s => out.add(s));
    return shuffle([...out]).slice(0, 2);
  }

  /* ---------- Ngôi nhà (SVG) ---------- */
  const WIN = [   // 10 ô cửa sổ: tầng trên 5, tầng dưới 4 (giữa là cửa chính), 1 cửa sổ áp mái
    [133, 222], [226, 222], [320, 222], [414, 222], [507, 222],
    [133, 345], [226, 345], [414, 345], [507, 345], [320, 100],
  ];
  const HOUSE_SVG = `
    <svg class="g3-house" viewBox="0 0 640 480" aria-hidden="true">
      <defs>
        <linearGradient id="g3wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6e6"/><stop offset="1" stop-color="#ffe7c7"/></linearGradient>
        <linearGradient id="g3roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a6b"/><stop offset="1" stop-color="#e2503f"/></linearGradient>
        <radialGradient id="g3light" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fffbe0"/><stop offset="1" stop-color="#ffd86b"/></radialGradient>
      </defs>
      <ellipse cx="320" cy="452" rx="300" ry="22" fill="#9fd98a" opacity=".7"/>
      <!-- ống khói -->
      <rect x="470" y="40" width="40" height="70" rx="6" fill="#c97b5b" stroke="#9c5a3f" stroke-width="4"/>
      <g class="g3-smoke"><circle cx="490" cy="26" r="10" fill="#fff" opacity=".8"/><circle cx="502" cy="8" r="13" fill="#fff" opacity=".6"/></g>
      <!-- tường -->
      <rect x="70" y="130" width="500" height="320" rx="16" fill="url(#g3wall)" stroke="#d9a777" stroke-width="5"/>
      <!-- mái -->
      <path d="M40 150 L320 22 L600 150 Q608 158 598 164 H42 Q32 158 40 150Z" fill="url(#g3roof)" stroke="#b83d2f" stroke-width="5" stroke-linejoin="round"/>
      <path d="M90 140 L320 38 L550 140" fill="none" stroke="#ffb3a8" stroke-width="5" stroke-linecap="round" opacity=".7"/>
      <!-- cửa chính -->
      <path d="M282 450 V350 Q320 312 358 350 V450Z" fill="#b97a4a" stroke="#8a5629" stroke-width="5"/>
      <circle cx="346" cy="404" r="6" fill="#ffd34d"/>
      <rect x="262" y="446" width="116" height="10" rx="5" fill="#d9a777"/>
      <!-- bậc & chậu hoa -->
      <g><rect x="232" y="420" width="34" height="30" rx="6" fill="#e2895f"/><circle cx="242" cy="414" r="11" fill="#ff8fb1"/><circle cx="256" cy="410" r="10" fill="#ffd34d"/></g>
      <g><rect x="374" y="420" width="34" height="30" rx="6" fill="#e2895f"/><circle cx="384" cy="412" r="11" fill="#7cc98a"/><circle cx="398" cy="414" r="10" fill="#ff8fb1"/></g>
      <!-- cửa sổ -->
      ${WIN.map(([x, y], i) => `
        <g class="g3-win" data-w="${i}" transform="translate(${x} ${y})">
          <rect x="-40" y="-40" width="80" height="80" rx="12" fill="#5f6f8f" stroke="#8a5629" stroke-width="5"/>
          <rect class="g3-win-light" x="-35" y="-35" width="70" height="70" rx="8" fill="url(#g3light)"/>
          <text class="g3-win-pic" x="0" y="14" text-anchor="middle" font-size="40"></text>
          <rect class="g3-shut l" x="-40" y="-40" width="40" height="80" rx="8" fill="#7ab8f5" stroke="#3d7fc4" stroke-width="4"/>
          <rect class="g3-shut r" x="0" y="-40" width="40" height="80" rx="8" fill="#7ab8f5" stroke="#3d7fc4" stroke-width="4"/>
          <rect x="-46" y="38" width="92" height="10" rx="5" fill="#d9a777"/>
        </g>`).join("")}
    </svg>`;

  function mount(root, api) {
    let alive = true;
    const inclusive = () => api.state.settings.inclusive;
    root.classList.add("g3-root");

    root.innerHTML = `
      <div class="g3-stage">
        <div class="g3-sky" aria-hidden="true"><i class="g3-cloud c1"></i><i class="g3-cloud c2"></i><i class="g3-sun"></i></div>
        <div class="g3-play hidden" id="g3-play">
          <div class="g3-left">${HOUSE_SVG}</div>
          <div class="g3-right">
            <div class="g3-top">
              <div class="g3-count" id="g3-count">Từ 1/10</div>
            </div>
            <div class="g3-q">
              <div class="g3-pic" id="g3-pic"></div>
              <button class="g3-speaker" id="g3-speaker" data-nosfx aria-label="Nghe từ">🔊</button>
            </div>
            <div class="g3-word" id="g3-word"></div>
            <div class="g3-status" id="g3-status" aria-live="polite">Bé chọn tiếng còn thiếu nhé</div>
            <div class="g3-opts" id="g3-opts"></div>
          </div>
        </div>

        <div class="g3-overlay hidden" id="g3-result"></div>
      </div>`;

    const $ = s => root.querySelector(s);
    const $$ = s => [...root.querySelectorAll(s)];
    let game = null;

    function resetHouse() {
      $$(".g3-win").forEach(w => { w.classList.remove("open", "next"); w.querySelector(".g3-win-pic").textContent = ""; });
    }
    /* Bắt đầu lượt: 10 từ ngẫu nhiên trong cả sách (Bài 11 – 69) */
    const introOpen = () => !document.getElementById("stage-intro")?.classList.contains("hidden");
    const onIntroStart = () => setTimeout(() => { if (alive && game && !game.locked) playWord(); }, 450);
    document.getElementById("btn-stage-intro-start")?.addEventListener("click", onIntroStart);

    function start() {
      api.stopAudio();
      const pool = TU_NGU;
      game = { pool, list: shuffle(pool).slice(0, SO_TU), i: 0, score: 0, missed: [] };
      resetHouse();
      $(".g3-left")?.classList.remove("party");
      $("#g3-result").classList.add("hidden");
      $("#g3-play").classList.remove("hidden");
      ask();
    }

    function setStatus(text, type = "") {
      const el = $("#g3-status");
      el.textContent = text;
      el.className = "g3-status" + (type ? " " + type : "");
      void el.offsetWidth; if (type) el.classList.add("pop");
      api.show(text);
    }

    function ask() {
      const w = game.list[game.i];
      const pos = Math.random() < .5 ? 0 : 1;              // thiếu tiếng đầu hay tiếng sau
      Object.assign(game, { pos, tries: 0, locked: false });
      $("#g3-count").textContent = `Từ ${game.i + 1}/${game.list.length}`;
      $$(".g3-win").forEach((el, i) => el.classList.toggle("next", i === game.i));
      const pic = $("#g3-pic");
      pic.textContent = w.hinh;
      pic.classList.remove("swing"); void pic.offsetWidth; pic.classList.add("swing");
      const given = pos === 0 ? w.b : w.a;
      $("#g3-word").innerHTML = pos === 0
        ? `<span class="g3-slot q" id="g3-hole">?</span><span class="g3-slot filled">${esc(given)}</span>`
        : `<span class="g3-slot filled">${esc(given)}</span><span class="g3-slot q" id="g3-hole">?</span>`;
      const target = pos === 0 ? w.a : w.b;
      const opts = shuffle([target, ...distractors(w, pos, game.pool)]);
      $("#g3-opts").innerHTML = opts.map((o, i) => `<button class="g3-opt" data-t="${esc(o)}" data-nosfx style="--d:${i * .07}s">${esc(o)}</button>`).join("");
      setStatus(`Bé chọn tiếng còn thiếu để ghép thành từ nhé`);
      setTimeout(() => alive && game && !introOpen() && playWord(), 450);
    }

    async function playWord() {
      if (!game) return;
      const w = game.list[game.i], sp = $("#g3-speaker");
      sp.classList.add("speaking");
      await api.playSound("tu3", w.k, `${w.a} ${w.b}`);
      sp.classList.remove("speaking");
    }
    $("#g3-speaker").addEventListener("click", playWord);

    function fly(fromEl, toEl, text, done) {
      const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      const f = document.createElement("div");
      f.className = "g3-flying"; f.textContent = text;
      Object.assign(f.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
      document.body.appendChild(f);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        f.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px)`;
      }));
      setTimeout(() => { f.remove(); done(); }, 340);
    }

    $("#g3-opts").addEventListener("click", e => {
      const btn = e.target.closest(".g3-opt");
      if (!btn || !game || game.locked || btn.disabled) return;
      const w = game.list[game.i], target = game.pos === 0 ? w.a : w.b;
      if (btn.dataset.t === target) {
        game.locked = true;
        api.stopAudio();
        btn.classList.add("used");
        const hole = $("#g3-hole");
        fly(btn, hole, target, () => {
          if (!alive || !game) return;
          hole.textContent = target; hole.classList.remove("q"); hole.classList.add("filled", "new");
          $("#g3-word").classList.add("done");
          api.sfx("ok");
          const first = game.tries === 0;
          if (first) game.score++; else game.missed.push(w);
          const win = $$(".g3-win")[game.i];
          win.querySelector(".g3-win-pic").textContent = w.hinh;
          win.classList.remove("next"); win.classList.add("open");
          api.burst($("#g3-word"), first ? 22 : 12);
          api.floatTag($("#g3-word"), first ? "+⭐" : "👍", "good");
          setStatus(`${first ? "🎉" : "👍"} Đúng rồi: “${w.a} ${w.b}”!`, "good");
          setTimeout(next, 1600);
        });
      } else {
        game.tries++;
        api.sfx("bad");
        btn.classList.add("wrong"); btn.disabled = true;
        api.floatTag(btn, "✖", "bad");
        if (!inclusive() && game.tries >= 2) {
          const right = $$(".g3-opt").find(b => b.dataset.t === target);
          right.classList.add("hint");
          setStatus(`💡 Tiếng đúng là “${target}” – bé chọn nhé!`, "info");
        } else {
          if (inclusive()) $$(".g3-opt").find(b => b.dataset.t === target).classList.add("hint");
          setStatus(pick(["🤔 Chưa đúng, bé nghe lại từ nhé!", "💪 Gần đúng rồi, bé thử tiếng khác nhé!"]), "bad");
          setTimeout(() => alive && game && !game.locked && playWord(), 700);
        }
      }
    });

    function next() {
      if (!game) return;
      $("#g3-word").classList.remove("done");
      game.i++;
      if (game.i < game.list.length) ask(); else finish();
    }

    function finish() {
      const { score, list, missed } = game;
      const ratio = score / list.length;
      const stars = ratio >= .9 ? 3 : ratio >= .6 ? 2 : 1;
      const prev = api.state.stars[3] || 0;
      api.finishStage(3, stars);
      api.setStars(Math.max(prev, stars));
      $("#g3-play").querySelector(".g3-left").classList.add("party");
      setTimeout(() => {
        if (!alive) return;
        const r = $("#g3-result");
        r.innerHTML = `
          <div class="g3-board pop-in">
            <div class="result-stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? "on" : ""}" style="--d:${i * .25}s">★</span>`).join("")}</div>
            <h3 class="g3-title small">${stars === 3 ? "Xuất sắc!" : stars === 2 ? "Giỏi lắm!" : "Bé đã cố gắng!"}</h3>
            <p class="g3-sub">Bé ghép đúng ngay lần đầu <b>${score}/${list.length}</b> từ</p>
            ${missed.length ? `<div class="g3-review"><span>Ôn lại:</span>${missed.map(w => `<button class="am-chip" data-k="${w.k}" data-nosfx>${w.hinh} ${esc(w.a)} ${esc(w.b)}</button>`).join("")}</div>` : ""}
            <div class="result-actions">
              <button class="btn btn-ghost" id="g3-again">🔁 Chơi lại</button>
              <button class="btn btn-primary" id="g3-map">🗺️ Về bản đồ</button>
            </div>
          </div>`;
        r.classList.remove("hidden");
        r.querySelectorAll(".am-chip").forEach(c => c.addEventListener("click", () => {
          const w = TU_NGU.find(x => x.k === c.dataset.k); api.playSound("tu3", w.k, `${w.a} ${w.b}`);
        }));
        $("#g3-again").addEventListener("click", start);
        $("#g3-map").addEventListener("click", () => api.backToMap());
      }, 1200);
      api.confetti(stars * 40);
      api.sfx(stars >= 2 ? "win" : "ok");
      api.show(stars >= 2 ? "🎉 Ngôi nhà từ ngữ đã sáng đèn!" : "💪 Bé đã cố gắng lắm! Mình cùng chơi lại nhé!");
      game = null;
    }

    start();
    api.say("Ngôi nhà từ ngữ đây rồi! Bé hãy ghép các tiếng để tạo thành từ đúng với bức tranh nhé!", "intro-3");
    return () => { alive = false; game = null; document.getElementById("btn-stage-intro-start")?.removeEventListener("click", onIntroStart); root.classList.remove("g3-root"); document.querySelectorAll(".g3-flying").forEach(f => f.remove()); };
  }

  window.STAGE_GAMES[3] = { mount };
})();
