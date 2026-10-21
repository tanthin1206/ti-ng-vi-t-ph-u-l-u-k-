/* =========================================================
   CHẶNG 4 – LÂU ĐÀI ĐỌC HIỂU
   Nhìn tranh – đọc đoạn văn – chọn câu trả lời đúng (A/B/C).
   Mỗi lượt 10 câu. Trả lời xong: tô sáng câu chứa đáp án trong đoạn văn.
   ========================================================= */
window.STAGE_GAMES = window.STAGE_GAMES || {};

(() => {
  const SO_CAU = 10;
  const LETTERS = ["A", "B", "C"];
  const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = arr => arr[Math.random() * arr.length | 0];
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const CASTLE_SVG = `
    <svg class="g4-castle" viewBox="0 0 400 260" aria-hidden="true">
      <g fill="#ffffff" opacity=".55">
        <rect x="40" y="110" width="70" height="150" rx="6"/><path d="M30 112 L75 50 L120 112Z"/>
        <rect x="290" y="110" width="70" height="150" rx="6"/><path d="M280 112 L325 50 L370 112Z"/>
        <rect x="110" y="140" width="180" height="120"/>
        <rect x="160" y="70" width="80" height="190" rx="6"/><path d="M148 72 L200 0 L252 72Z"/>
        <path d="M110 140 h20 v-16 h20 v16 h20 v-16 h20 v16 h20 v-16 h20 v16 h20 v-16 h20 v16 h20 v-16 h20 v16"/>
      </g>
      <g fill="#b8a2f0" opacity=".55">
        <path d="M178 260 V215 Q200 190 222 215 V260Z"/>
        <rect x="190" y="110" width="20" height="30" rx="10"/><rect x="65" y="150" width="20" height="28" rx="10"/><rect x="315" y="150" width="20" height="28" rx="10"/>
      </g>
      <g stroke="#ffffff" stroke-width="3" opacity=".7"><line x1="200" y1="0" x2="200" y2="-26"/><line x1="75" y1="50" x2="75" y2="30"/><line x1="325" y1="50" x2="325" y2="30"/></g>
      <path d="M200 -26 l24 7 -24 7Z M75 30 l18 5 -18 5Z M325 30 l18 5 -18 5Z" fill="#ff8fb1"/>
    </svg>`;

  function mount(root, api) {
    let alive = true;
    const inclusive = () => api.state.settings.inclusive;
    root.classList.add("g4-root");

    root.innerHTML = `
      <div class="g4-stage" id="g4-stage">
        <div class="g4-bg" aria-hidden="true">
          ${CASTLE_SVG}
          ${Array.from({ length: 14 }, (_, i) => `<i class="g4-twinkle" style="left:${(i * 37) % 100}%;top:${(i * 23) % 60}%;--d:${(i % 5) * .6}s"></i>`).join("")}
        </div>

        <!-- ===== MÀN CHƠI ===== -->
        <div class="g4-play hidden" id="g4-play">
          <div class="g4-top">
            <div class="g4-count" id="g4-count">Câu 1/10</div>
            <div class="g4-flags" id="g4-flags"></div>
          </div>

          <div class="g4-grid">
            <!-- Tranh -->
            <figure class="g4-picture" id="g4-picture">
              <img id="g4-img" alt="Tranh minh họa" draggable="false" />
              <span class="g4-bai" id="g4-bai">Bài ua, ưa</span>
            </figure>

            <!-- Đọc + hỏi -->
            <div class="g4-right">
              <div class="g4-passage">
                <div class="g4-label">📖 Đọc đoạn văn <button class="g4-listen" id="g4-listen-doan" data-nosfx title="Nghe đọc">🔊</button></div>
                <p class="g4-text" id="g4-text"></p>
              </div>
              <div class="g4-question">
                <span class="g4-q-ico">❓</span>
                <span id="g4-hoi"></span>
                <button class="g4-listen" id="g4-listen-hoi" data-nosfx title="Nghe câu hỏi">🔊</button>
              </div>
              <div class="g4-options" id="g4-options"></div>
              <div class="g4-foot">
                <div class="g4-status" id="g4-status" aria-live="polite">Bé đọc kỹ rồi chọn câu trả lời đúng nhé</div>
                <button class="g4-next hidden" id="g4-next">Câu tiếp theo ▶</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== MÀN BẮT ĐẦU ===== -->
        <div class="g4-overlay" id="g4-start">
          <div class="g4-board pop-in">
            <div class="g4-board-kicker">CHẶNG 4</div>
            <h3 class="g4-board-title">Lâu Đài Đọc Hiểu</h3>
            <div class="g4-steps">
              <span>🖼️ Nhìn tranh</span><b>›</b><span>📖 Đọc đoạn văn</span><b>›</b><span>✅ Chọn câu trả lời</span>
            </div>
            <p class="g4-board-sub">Mỗi lượt ${SO_CAU} câu · Trả lời đúng ngay lần đầu để được nhiều sao</p>
            <button class="btn btn-primary btn-xl" id="g4-go">🏰 Vào lâu đài</button>
          </div>
        </div>

        <div class="g4-overlay hidden" id="g4-result"></div>
      </div>`;

    const $ = s => root.querySelector(s);
    const $$ = s => [...root.querySelectorAll(s)];
    let game = null;

    /* ---------- Bắt đầu ---------- */
    function showStart() {
      game = null;
      api.stopAudio();
      $("#g4-start").classList.remove("hidden");
      $("#g4-result").classList.add("hidden");
      $("#g4-play").classList.add("hidden");
    }
    $("#g4-go").addEventListener("click", () => {
      game = { list: shuffle(DOC_HIEU).slice(0, SO_CAU), i: 0, score: 0, missed: [] };
      $("#g4-start").classList.add("hidden");
      $("#g4-play").classList.remove("hidden");
      $("#g4-flags").innerHTML = game.list.map(() => "<i></i>").join("");
      ask();
    });

    /* ---------- Trạng thái ---------- */
    function setStatus(text, type = "") {
      const el = $("#g4-status");
      el.textContent = text;
      el.className = "g4-status" + (type ? " " + type : "");
      void el.offsetWidth; if (type) el.classList.add("pop");
      api.show(text);
    }

    /* ---------- Một câu ---------- */
    function renderText(d, showEvidence) {
      const t = esc(d.doan);
      $("#g4-text").innerHTML = showEvidence ? t.replace(esc(d.chung), `<mark class="g4-ev">${esc(d.chung)}</mark>`) : t;
    }

    function ask() {
      const d = game.list[game.i];
      Object.assign(game, { tries: 0, locked: false });
      api.stopAudio();
      $("#g4-count").textContent = `Câu ${game.i + 1}/${game.list.length}`;
      $$("#g4-flags i").forEach((f, i) => f.classList.toggle("current", i === game.i));

      const img = $("#g4-img");
      img.classList.remove("show");
      img.onload = () => img.classList.add("show");
      img.onerror = () => { img.removeAttribute("src"); $("#g4-picture").classList.add("noimg"); };
      $("#g4-picture").classList.remove("noimg");
      img.src = d.img || `assets/img/s4/${d.k}.jpg`;
      $("#g4-bai").textContent = `Vần ${d.bai}`;

      renderText(d, false);
      $("#g4-hoi").textContent = d.hoi;
      const opts = shuffle([{ t: d.dung, ok: true }, ...d.sai.map(t => ({ t, ok: false }))]);
      $("#g4-options").innerHTML = opts.map((o, i) => `
        <button class="g4-opt" data-ok="${o.ok ? 1 : 0}" data-nosfx style="--d:${i * .08}s">
          <span class="g4-letter">${LETTERS[i]}</span><span class="g4-opt-text">${esc(o.t)}</span>
        </button>`).join("");
      $("#g4-next").classList.add("hidden");
      setStatus("Bé đọc kỹ đoạn văn rồi chọn câu trả lời đúng nhé");
      $(".g4-right").classList.remove("swap"); void $(".g4-right").offsetWidth; $(".g4-right").classList.add("swap");
    }

    $("#g4-listen-doan").addEventListener("click", () => { const d = game && game.list[game.i]; d && api.playSound("doc", d.k, d.doan); });
    $("#g4-listen-hoi").addEventListener("click", () => { const d = game && game.list[game.i]; d && api.playSound("hoi", d.k, d.hoi); });

    $("#g4-options").addEventListener("click", e => {
      const btn = e.target.closest(".g4-opt");
      if (!btn || !game || game.locked || btn.disabled) return;
      const d = game.list[game.i], flag = $$("#g4-flags i")[game.i];

      if (btn.dataset.ok === "1") {
        game.locked = true;
        api.stopAudio();
        btn.classList.add("right");
        $$(".g4-opt").forEach(b => b !== btn && b.classList.add("dim"));
        api.sfx("ok");
        const first = game.tries === 0;
        if (first) game.score++; else game.missed.push(d);
        flag.classList.add(first ? "ok" : "half");
        api.burst(btn, first ? 22 : 12);
        api.floatTag(btn, first ? "+⭐" : "👍", "good");
        renderText(d, true);
        setStatus(pick(["🎉 Đúng rồi! Bé đọc giỏi quá!", "⭐ Chính xác! Tuyệt vời!", "👏 Hoan hô! Bé hiểu bài rồi!"]), "good");
        showNext();
      } else {
        game.tries++;
        api.stopAudio();
        btn.classList.add("wrong"); btn.disabled = true;
        api.sfx("bad");
        api.floatTag(btn, "✖", "bad");
        if (!inclusive() && game.tries >= 2) {
          game.locked = true;
          game.missed.push(d);
          flag.classList.add("miss");
          const right = $$(".g4-opt").find(b => b.dataset.ok === "1");
          right.classList.add("reveal");
          renderText(d, true);
          setStatus("💡 Đáp án đúng đây! Bé xem phần được tô vàng trong đoạn văn nhé", "info");
          showNext();
        } else {
          if (inclusive()) renderText(d, true);   // hỗ trợ: tô sáng câu chứa đáp án
          setStatus(inclusive() ? "🤔 Chưa đúng. Bé đọc phần tô vàng rồi chọn lại nhé!" : "🤔 Chưa đúng, bé đọc lại đoạn văn nhé!", "bad");
        }
      }
    });

    function showNext() {
      const n = $("#g4-next");
      n.textContent = game.i + 1 < game.list.length ? "Câu tiếp theo ▶" : "Xem kết quả 🏆";
      n.classList.remove("hidden");
    }
    $("#g4-next").addEventListener("click", () => {
      if (!game) return;
      game.i++;
      if (game.i < game.list.length) ask(); else finish();
    });

    /* ---------- Kết quả ---------- */
    function finish() {
      const { score, list, missed } = game;
      const ratio = score / list.length;
      const stars = ratio >= .9 ? 3 : ratio >= .6 ? 2 : 1;
      const prev = api.state.stars[4] || 0;
      api.finishStage(4, stars);
      api.setStars(Math.max(prev, stars));
      $("#g4-play").classList.add("hidden");
      const r = $("#g4-result");
      r.innerHTML = `
        <div class="g4-board pop-in">
          <div class="result-stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? "on" : ""}" style="--d:${i * .25}s">★</span>`).join("")}</div>
          <h3 class="g4-board-title small">${stars === 3 ? "Xuất sắc!" : stars === 2 ? "Giỏi lắm!" : "Bé đã cố gắng!"}</h3>
          <p class="g4-board-sub">Bé trả lời đúng ngay lần đầu <b>${score}/${list.length}</b> câu</p>
          ${missed.length ? `
            <div class="g4-review">
              <div class="g4-review-title">Mình cùng đọc lại nhé:</div>
              ${missed.map(d => `<div class="g4-review-item"><b>${esc(d.hoi)}</b> → ${esc(d.dung)}</div>`).join("")}
            </div>` : ""}
          <div class="result-actions">
            <button class="btn btn-ghost" id="g4-again">🔁 Chơi lại</button>
            <button class="btn btn-primary" id="g4-map">🗺️ Về bản đồ</button>
          </div>
        </div>`;
      r.classList.remove("hidden");
      api.confetti(stars * 40);
      api.sfx(stars >= 2 ? "win" : "ok");
      api.show(stars >= 2 ? "🎉 Hoan hô! Bé đã chinh phục Lâu đài đọc hiểu!" : "💪 Bé đã cố gắng lắm! Mình cùng chơi lại nhé!");
      $("#g4-again").addEventListener("click", showStart);
      $("#g4-map").addEventListener("click", () => api.backToMap());
      game = null;
    }

    showStart();
    api.say("Lâu đài đọc hiểu thật đẹp! Bé đọc câu, xem tranh rồi chọn câu trả lời đúng nhé!", "intro-4");

    return () => { alive = false; game = null; root.classList.remove("g4-root"); };
  }

  window.STAGE_GAMES[4] = { mount };
})();
