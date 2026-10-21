/* =========================================================
   CHẶNG 1 – RỪNG CHỮ CÁI
   • Mặc định: Nghe & chọn – nghe âm, chọn đúng chữ (10 câu, tính sao)
   • Chức năng phụ (nút ở góc): Bảng âm – chạm từng ô để nghe, hoặc đọc cả bảng
   ========================================================= */
window.STAGE_GAMES = window.STAGE_GAMES || {};

(() => {
  // Âm thanh phát qua api.playSound("am"|"tu", mã) – tự chọn giọng nữ/nam/âm thanh của tôi
  const byKey = new Proxy({}, { get: (_, k) => BANG_AM.find(a => a.k === k) });   // luôn theo danh sách hiện tại
  const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = arr => arr[Math.random() * arr.length | 0];
  const SO_CAU = 10;

  /* Bỏ dấu thanh (giữ ă â ê ô ơ ư) để tìm âm trong từ */
  const boThanh = s => s.normalize("NFD").replace(/[\u0300\u0301\u0303\u0309\u0323]/g, "").normalize("NFC").toLowerCase();
  function toDamTu(am) {
    const goc = [...am.tu], khong = [...boThanh(am.tu)];
    const i = khong.join("").indexOf(am.c);
    if (i < 0) return am.tu;
    // chỉ số theo ký tự (mỗi ký tự NFC tương ứng 1-1)
    const pre = [...khong.join("").slice(0, i)].length, len = [...am.c].length;
    return goc.slice(0, pre).join("") + `<mark>${goc.slice(pre, pre + len).join("")}</mark>` + goc.slice(pre + len).join("");
  }

  function mount(root, api) {
    let alive = true;
    const inclusive = () => api.state.settings.inclusive;
    const learned = new Set(api.getData("s1_learned", []));

    root.innerHTML = `
      <div class="g1">
        <!-- Nút chức năng phụ ở góc: mở Bảng âm -->
        <button class="g1-board-btn" id="g1-open-board" title="Xem & đọc bảng âm">📖 Bảng âm</button>

        <!-- ===== BẢNG ÂM (chức năng phụ, mở dạng cửa sổ) ===== -->
        <div class="g1-board hidden" id="g1-board" role="dialog" aria-modal="true" aria-label="Bảng âm">
         <div class="g1-board-card pop-in">
          <div class="g1-toolbar">
            <button class="btn btn-primary" id="g1-readall">▶ Đọc cả bảng</button>
            <div class="g1-progress"><span>Đã học</span><div class="bar"><i id="g1-bar"></i></div><b id="g1-count">0/${BANG_AM.length}</b></div>
            <button class="am-close g1-board-close" id="g1-close-board" aria-label="Đóng bảng âm">✖</button>
          </div>
          <div class="chalkboard">
            <div class="chalk-title">BẢNG <span>ÂM</span></div>
            <div class="am-grid" id="g1-grid">
              ${BANG_AM.map(a => `
                <button class="am-cell ${a.nhom}" data-k="${a.k}" data-nosfx aria-label="Âm ${a.c}">
                  <span>${a.c}</span>
                </button>`).join("")}
            </div>
            <p class="chalk-note">🟡 ô vàng: chữ cái &nbsp;·&nbsp; 🔵 ô xanh: âm ghép &nbsp;·&nbsp; ⭐ đã học</p>
          </div>

          <div class="am-detail hidden" id="g1-detail">
            <div class="am-detail-card pop-in">
              <button class="am-close" id="g1-close" aria-label="Đóng">✖</button>
              <button class="am-nav prev" id="g1-prev" aria-label="Âm trước">❮</button>
              <button class="am-nav next" id="g1-next" aria-label="Âm sau">❯</button>
              <div class="am-big" id="g1-big">b</div>
              <div class="am-read" id="g1-read">bờ</div>
              <div class="am-example">
                <span class="am-pic" id="g1-pic">🐄</span>
                <span class="am-word" id="g1-word">bò</span>
              </div>
              <div class="am-actions">
                <button class="btn btn-soft" id="g1-say-am" data-nosfx>🔊 Nghe âm</button>
                <button class="btn btn-soft" id="g1-say-tu" data-nosfx>🔊 Nghe từ</button>
              </div>
            </div>
          </div>
         </div>
        </div>

        <!-- ===== NGHE & CHỌN (màn chính, 10 câu) ===== -->
        <div class="g1-panel active" data-panel="quiz">
          <div class="quiz-play hidden" id="q-play">
            <div class="quiz-dots" id="q-dots"></div>
            <button class="pv-speaker q-speaker" id="q-speaker" data-nosfx aria-label="Nghe lại">🔊</button>
            <div class="quiz-status" id="q-status" aria-live="polite">Bé nghe và chọn chữ đúng</div>
            <div class="quiz-options" id="q-options"></div>
            <div class="quiz-reveal-slot"><div class="quiz-reveal hidden" id="q-reveal"></div></div>
          </div>

          <div class="quiz-result hidden" id="q-result"></div>
        </div>
      </div>`;

    const $ = s => root.querySelector(s);
    const $$ = s => [...root.querySelectorAll(s)];

    const introOpen = () => !document.getElementById("stage-intro")?.classList.contains("hidden");
    const canAutoPlay = () => $("#g1-board").classList.contains("hidden") && !introOpen();
    const onIntroStart = () => setTimeout(() => { if (alive && quiz && !quiz.locked && canAutoPlay()) playQuestion(); }, 450);
    document.getElementById("btn-stage-intro-start")?.addEventListener("click", onIntroStart);

    /* ---------- Bảng âm: chức năng phụ mở từ nút ở góc ---------- */
    function openBoard() {
      api.stopAudio();
      $("#g1-board").classList.remove("hidden");
      api.show("Bé chạm vào từng ô để nghe đọc âm nhé!");
    }
    function closeBoard() {
      stopReadAll();
      closeDetail();
      $("#g1-board").classList.add("hidden");
      if (quiz && !quiz.locked) playQuestion();   // quay lại câu đang làm
    }
    $("#g1-open-board").addEventListener("click", openBoard);
    $("#g1-close-board").addEventListener("click", closeBoard);
    $("#g1-board").addEventListener("click", e => { if (e.target.id === "g1-board") closeBoard(); });

    /* =========================================================
       HỌC BẢNG ÂM
       ========================================================= */
    function refreshLearned() {
      $$(".am-cell").forEach(c => c.classList.toggle("learned", learned.has(c.dataset.k)));
      $("#g1-count").textContent = `${learned.size}/${BANG_AM.length}`;
      $("#g1-bar").style.width = (learned.size / BANG_AM.length * 100) + "%";
    }
    function markLearned(k) {
      if (learned.has(k)) return;
      learned.add(k);
      api.setData("s1_learned", [...learned]);
      refreshLearned();
      if (learned.size === BANG_AM.length) { api.confetti(); api.toast("🎉 Bé đã học hết bảng âm!"); setTimeout(() => alive && api.say("Giỏi quá! Bé đã học hết bảng âm rồi!", "hoc-het"), 2500); }
    }
    refreshLearned();

    let detailIdx = -1;
    async function openDetail(idx) {
      stopReadAll();
      detailIdx = (idx + BANG_AM.length) % BANG_AM.length;
      const a = BANG_AM[detailIdx];
      $("#g1-big").textContent = a.c;
      $("#g1-read").textContent = `đọc là “${a.doc}”`;
      $("#g1-pic").textContent = a.hinh;
      $("#g1-word").innerHTML = toDamTu(a);
      $("#g1-detail").classList.remove("hidden");
      const card = $(".am-detail-card");
      card.classList.remove("pop-in"); void card.offsetWidth; card.classList.add("pop-in");
      markLearned(a.k);
      await api.playSound("am", a.k, a.doc);
      if (!alive || detailIdx < 0 || BANG_AM[detailIdx] !== a) return;
      await api.wait(350);
      if (!alive || detailIdx < 0 || BANG_AM[detailIdx] !== a) return;
      api.playSound("tu", a.k, a.tu);
    }
    function closeDetail() { detailIdx = -1; api.stopAudio(); $("#g1-detail").classList.add("hidden"); }

    $("#g1-grid").addEventListener("click", e => {
      const cell = e.target.closest(".am-cell");
      if (!cell) return;
      openDetail(BANG_AM.findIndex(a => a.k === cell.dataset.k));
    });
    $("#g1-close").addEventListener("click", closeDetail);
    $("#g1-detail").addEventListener("click", e => { if (e.target.id === "g1-detail") closeDetail(); });
    $("#g1-prev").addEventListener("click", () => openDetail(detailIdx - 1));
    $("#g1-next").addEventListener("click", () => openDetail(detailIdx + 1));
    $("#g1-say-am").addEventListener("click", () => { const a = BANG_AM[detailIdx]; a && api.playSound("am", a.k, a.doc); });
    $("#g1-say-tu").addEventListener("click", () => { const a = BANG_AM[detailIdx]; a && api.playSound("tu", a.k, a.tu); });

    /* Đọc cả bảng */
    let readToken = 0;
    function stopReadAll() {
      if (!readToken) return;
      readToken = 0;
      api.stopAudio();
      $$(".am-cell.reading").forEach(c => c.classList.remove("reading"));
      $("#g1-readall").textContent = "▶ Đọc cả bảng";
    }
    $("#g1-readall").addEventListener("click", async () => {
      if (readToken) return stopReadAll();
      closeDetail();
      const my = readToken = Date.now();
      $("#g1-readall").textContent = "⏸ Dừng đọc";
      for (const a of BANG_AM) {
        if (!alive || readToken !== my) return;
        const cell = $(`.am-cell[data-k="${a.k}"]`);
        cell.classList.add("reading");
        cell.scrollIntoView({ block: "nearest", behavior: "smooth" });
        await api.playSound("am", a.k, a.doc);
        cell.classList.remove("reading");
        if (readToken !== my) return;
        markLearned(a.k);
        await api.wait(inclusive() ? 700 : 300);
      }
      if (readToken === my) { stopReadAll(); api.say("Hoan hô! Bé đã nghe hết bảng âm rồi!", "nghe-het"); }
    });

    /* =========================================================
       NGHE & CHỌN
       ========================================================= */
    let quiz = null;



    /* Dòng trạng thái dưới nút loa: hiện hướng dẫn / thông báo đúng-sai */
    let fbTimer;
    function setStatus(text, type = "") {
      const el = $("#q-status");
      el.textContent = text;
      el.className = "quiz-status" + (type ? " " + type : "");
      void el.offsetWidth; if (type) el.classList.add("pop");
    }
    function feedback(text, type, backToHint = false) {
      setStatus(text, type);
      api.show(text);
      clearTimeout(fbTimer);
      if (backToHint) fbTimer = setTimeout(() => quiz && !quiz.locked && setStatus(hintText()), 1600);
    }
    const hintText = () => `Câu ${quiz.i + 1}/${quiz.list.length} · Bé nghe 🔊 rồi chọn chữ đúng`;

    function makeOptions(q, pool) {
      const n = inclusive() ? 3 : 4;
      const confuse = shuffle([...new Set(AM_DE_NHAM.filter(g => g.includes(q.k)).flat())].filter(k => k !== q.k))
        .slice(0, inclusive() ? 1 : 2).map(k => byKey[k]);
      const rest = shuffle(pool.filter(a => a !== q && !confuse.includes(a)));
      return shuffle([q, ...confuse, ...rest].slice(0, n));
    }

    function startQuiz() {
      const pool = BANG_AM;
      quiz = { pool, list: shuffle(pool).slice(0, SO_CAU), i: 0, score: 0, missed: [] };
      $("#q-result").classList.add("hidden");
      $("#q-play").classList.remove("hidden");
      $("#q-dots").innerHTML = quiz.list.map(() => "<i></i>").join("");
      ask();
    }

    async function playQuestion() {
      if (!quiz) return;
      const q = quiz.list[quiz.i];
      const sp = $("#q-speaker");
      sp.classList.add("speaking");
      await api.playSound("am", q.k, q.doc);
      sp.classList.remove("speaking");
    }

    async function ask() {
      const q = quiz.list[quiz.i];
      quiz.tries = 0; quiz.locked = false;
      clearTimeout(fbTimer);
      $$("#q-dots i").forEach((d, i) => d.classList.toggle("current", i === quiz.i));
      setStatus(hintText());
      api.show(`Câu ${quiz.i + 1}: Bé nghe kỹ rồi chọn chữ đúng nhé! Bấm 🔊 để nghe lại.`);
      $("#q-reveal").classList.add("hidden");
      $("#q-options").innerHTML = makeOptions(q, quiz.pool).map((a, i) => `
        <button class="q-opt" data-k="${a.k}" data-nosfx style="--d:${i * .07}s"><span>${a.c}</span></button>`).join("");
      await api.wait(500);
      if (alive && quiz && canAutoPlay()) playQuestion();
    }

    $("#q-speaker").addEventListener("click", playQuestion);

    $("#q-options").addEventListener("click", async e => {
      const btn = e.target.closest(".q-opt");
      if (!btn || !quiz || quiz.locked || btn.disabled) return;
      const q = quiz.list[quiz.i];
      const dot = $$("#q-dots i")[quiz.i];

      if (btn.dataset.k === q.k) {
        quiz.locked = true;
        api.stopAudio();
        btn.classList.add("right");
        api.sfx("ok");
        const firstTry = quiz.tries === 0;
        if (firstTry) quiz.score++;
        dot.classList.add(firstTry ? "ok" : "half");
        api.burst(btn, firstTry ? 22 : 12);
        api.floatTag(btn, firstTry ? "+⭐" : "👍", "good");
        feedback(pick(["🎉 Đúng rồi! Bé giỏi quá!", "⭐ Chính xác! Tuyệt vời!", "👏 Hoan hô! Bé làm đúng rồi!"]), "good");
        showReveal(q);
        await api.wait(1500);
        if (!alive || !quiz) return;
        next();
      } else {
        quiz.tries++;
        api.stopAudio();
        btn.classList.add("wrong"); btn.disabled = true;
        api.sfx("bad");
        api.floatTag(btn, "✖", "bad");
        if (!quiz.missed.includes(q)) quiz.missed.push(q);

        if (!inclusive() && quiz.tries >= 2) {
          // hiện đáp án rồi sang câu mới
          quiz.locked = true;
          dot.classList.add("miss");
          $(`.q-opt[data-k="${q.k}"]`).classList.add("reveal");
          feedback(`💡 Đáp án đúng là “${q.c}”`, "info");
          showReveal(q);
          await api.wait(2000);
          if (!alive || !quiz) return;
          next();
        } else {
          if (inclusive()) $(`.q-opt[data-k="${q.k}"]`).classList.add("hint");
          feedback(pick(["🤔 Chưa đúng, bé nghe lại nhé!", "💪 Cố lên, bé thử lần nữa nhé!"]), "bad", true);
          await api.wait(800);
          if (!alive || !quiz || quiz.locked) return;
          playQuestion();   // phát lại âm của câu hỏi để bé nghe lại
        }
      }
    });

    function showReveal(q) {
      const r = $("#q-reveal");
      r.innerHTML = `<span class="rv-pic">${q.hinh}</span><span class="rv-word">${toDamTu(q)}</span>`;
      r.classList.remove("hidden");
    }

    function next() {
      quiz.i++;
      if (quiz.i < quiz.list.length) ask();
      else finish();
    }

    function finish() {
      const { score, list, missed } = quiz;
      const ratio = score / list.length;
      const stars = ratio >= .9 ? 3 : ratio >= .6 ? 2 : 1;
      const prev = api.state.stars[1] || 0;
      api.finishStage(1, stars);
      api.setStars(Math.max(prev, stars));
      $("#q-play").classList.add("hidden");
      const r = $("#q-result");
      r.innerHTML = `
        <div class="result-card pop-in">
          <div class="result-stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? "on" : ""}" style="--d:${i * .25}s">★</span>`).join("")}</div>
          <h3>${stars === 3 ? "Xuất sắc!" : stars === 2 ? "Giỏi lắm!" : "Bé đã cố gắng!"}</h3>
          <p>Bé chọn đúng ngay lần đầu <b>${score}/${list.length}</b> câu</p>
          ${missed.length ? `
            <div class="result-missed">
              <p>Mình cùng ôn lại các âm này nhé:</p>
              <div>${missed.map(a => `<button class="am-chip" data-k="${a.k}" data-nosfx>${a.c} <small>${a.hinh}</small></button>`).join("")}</div>
            </div>` : ""}
          <div class="result-actions">
            <button class="btn btn-ghost" id="r-again">🔁 Chơi lại</button>
            <button class="btn btn-ghost" id="r-learn">📖 Bảng âm</button>
            <button class="btn btn-primary" id="r-map">🗺️ Về bản đồ</button>
          </div>
        </div>`;
      r.classList.remove("hidden");
      api.confetti(stars * 40);
      api.sfx(stars >= 2 ? "win" : "ok");
      api.show(stars >= 2 ? "🎉 Hoan hô! Bé đã hoàn thành Rừng chữ cái!" : "💪 Bé đã cố gắng lắm! Mình cùng ôn lại và chơi tiếp nhé!");
      r.querySelectorAll(".am-chip").forEach(c => c.addEventListener("click", async () => {
        const a = byKey[c.dataset.k];
        await api.playSound("am", a.k, a.doc);
        if (alive) { await api.wait(250); api.playSound("tu", a.k, a.tu); }
      }));
      $("#r-again").addEventListener("click", startQuiz);
      $("#r-learn").addEventListener("click", openBoard);
      $("#r-map").addEventListener("click", () => api.backToMap());
      quiz = null;
    }

    /* Bắt đầu */
    api.say("Chào mừng bé đến Rừng chữ cái! Bé hãy lắng nghe thật kỹ rồi chọn đúng chữ cái nhé!", "intro-1");
    startQuiz();

    return () => {
      alive = false; readToken = 0; quiz = null;
      document.getElementById("btn-stage-intro-start")?.removeEventListener("click", onIntroStart);
    };
  }

  window.STAGE_GAMES[1] = { mount };
})();
