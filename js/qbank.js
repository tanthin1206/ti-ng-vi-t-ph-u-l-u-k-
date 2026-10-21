/* =========================================================
   NGÂN HÀNG CÂU HỎI CỦA TÔI – thêm / xóa câu hỏi cho từng chặng
   • Lưu trong trình duyệt (localStorage "vqav_qbank")
   • Khi mở bằng Mo_Ung_Dung.bat: tự lưu thêm vào js/data/cau-hoi-rieng.js
     để gửi kèm thư mục code cho người khác.
   • Áp dụng trực tiếp vào các mảng dữ liệu: BANG_AM, TU_GHEP, TU_NGU,
     DOC_HIEU, CAU_SAP_XEP (giữ nguyên tên biến để các chặng dùng như cũ).
   ========================================================= */
(() => {
  const KEY = "vqav_qbank";
  const SERVER = "http://127.0.0.1:8080";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nfc = s => String(s ?? "").normalize("NFC").trim().replace(/\s+/g, " ");
  const newId = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  /* ---------- Mô tả 5 chặng ---------- */
  const STAGE = {
    1: { name: "🌳 Chặng 1 – Nghe & chọn âm", arr: () => BANG_AM, key: "k", min: 4,
         label: a => `<b class="qb-big">${esc(a.c)}</b><small>đọc “${esc(a.doc)}” · ${esc(a.hinh)} ${esc(a.tu)}</small>` },
    2: { name: "🌉 Chặng 2 – Cầu ghép vần", arr: () => TU_GHEP, key: "w", min: 1,
         label: w => `<span class="qb-pic">${esc(w.hinh)}</span><b>${esc(w.tu)}</b><small>${w.m.map(esc).join(" + ")}</small>` },
    3: { name: "🏠 Chặng 3 – Ngôi nhà từ ngữ", arr: () => TU_NGU, key: "k", min: 1,
         label: w => `<span class="qb-pic">${esc(w.hinh)}</span><b>${esc(w.a)} ${esc(w.b)}</b>` },
    4: { name: "🏰 Chặng 4 – Lâu đài đọc hiểu", arr: () => DOC_HIEU, key: "k", min: 1,
         label: d => `<span class="qb-text"><b>${esc(d.doan)}</b><br>❓ ${esc(d.hoi)} → ✅ ${esc(d.dung)}</span>` },
    5: { name: "💎 Chặng 5 – Kho báu tri thức", arr: () => CAU_SAP_XEP, key: "k", min: 1,
         label: c => `<span class="qb-text"><b>${esc(c.cau)}</b></span>` },
  };

  // Bản gốc (trước khi áp dụng thay đổi)
  const BASE = {};
  Object.keys(STAGE).forEach(n => { try { BASE[n] = [...STAGE[n].arr()]; } catch (e) { BASE[n] = []; } });

  // Mặc định: Chặng 5 đã bỏ chế độ Khó → câu dài (muc "kho") tạm ẩn, cô có thể khôi phục
  const defaultStage = n => ({ removed: n == 5 ? BASE[5].filter(c => c.muc === "kho").map(c => c.k) : [], added: [] });

  /* ---------- Đọc / ghi cấu hình ---------- */
  function loadCfg() {
    let local = null, file = null;
    try { local = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    file = window.CAU_HOI_RIENG || null;
    const pick = (local && file) ? ((file.t || 0) > (local.t || 0) ? file : local) : (local || file);
    const cfg = { v: 1, t: 0, stages: {} };
    if (pick && pick.stages) Object.assign(cfg, pick);
    Object.keys(STAGE).forEach(n => { cfg.stages[n] = cfg.stages[n] || defaultStage(n); });
    return cfg;
  }
  let cfg = loadCfg();

  function apply(n) {
    const st = STAGE[n], c = cfg.stages[n], arr = st.arr();
    const removed = new Set(c.removed);
    const list = BASE[n].filter(x => !removed.has(x[st.key])).concat(c.added.filter(x => !removed.has(x[st.key])));
    arr.length = 0;
    list.forEach(x => arr.push(x));
  }
  Object.keys(STAGE).forEach(apply);

  let syncOk = null;
  async function save() {
    cfg.t = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(cfg)); }
    catch (e) { window.VQAV?.toast("⚠️ Bộ nhớ trình duyệt đầy (ảnh quá lớn?)"); }
    try {
      const r = await fetch(`${SERVER}/api/save-qbank`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) });
      syncOk = r.ok;
    } catch (e) { syncOk = false; }
    renderSync();
  }

  /* ---------- Ảnh (Chặng 4): thu nhỏ để lưu gọn ---------- */
  function readImage(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = rej;
      fr.onload = () => {
        const img = new Image();
        img.onerror = rej;
        img.onload = () => {
          const s = Math.min(1, 720 / Math.max(img.width, img.height));
          const cv = document.createElement("canvas");
          cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
          cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
          res(cv.toDataURL("image/jpeg", .82));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /* ---------- Giao diện ---------- */
  const EMOJI = "🐄 🐟 🐔 🐱 🐶 🐰 🐻 🐝 🦋 🐦 🦆 🐸 🐢 🦀 🐘 🦁 🐯 🐒 🍎 🍌 🍊 🍉 🍇 🍅 🥕 🌽 🌶️ 🍋 🥥 🍞 🍚 🥛 🌸 🌻 🌳 🍃 ☀️ 🌙 ⭐ ☁️ 🌧️ 🏠 🏫 🚲 🚗 ⛵ ✈️ 📚 ✏️ 🎒 👕 👟 🎈 ⚽ 🪁 🔔 ⏰ 🧸 👦 👧 👵 👴".split(" ");

  const FORMS = {
    1: `<label>Chữ / âm<input name="c" maxlength="4" placeholder="vd: ă" required></label>
        <label>Cách đọc<input name="doc" placeholder="vd: á" required></label>
        <label>Từ ví dụ<input name="tu" placeholder="vd: bắp" required></label>
        <label class="qb-emoji-field">Hình<input name="hinh" placeholder="🌽" required></label>`,
    2: `<label>Từ<input name="tu" placeholder="vd: bò" required></label>
        <label class="qb-wide">Các mảnh ghép (cách nhau bằng dấu cách)<input name="m" placeholder="vd: b ò" required></label>
        <label class="qb-emoji-field">Hình<input name="hinh" placeholder="🐄" required></label>`,
    3: `<label>Tiếng thứ nhất<input name="a" placeholder="vd: cà" required></label>
        <label>Tiếng thứ hai<input name="b" placeholder="vd: chua" required></label>
        <label class="qb-emoji-field">Hình<input name="hinh" placeholder="🍅" required></label>`,
    4: `<label class="qb-wide">Đoạn văn<textarea name="doan" rows="2" placeholder="vd: Mẹ đi chợ mua cá, mua cua." required></textarea></label>
        <label class="qb-wide">Câu hỏi<input name="hoi" placeholder="vd: Mẹ đi chợ mua gì?" required></label>
        <label>Đáp án đúng<input name="dung" placeholder="vd: mua cá, mua cua" required></label>
        <label>Đáp án sai 1<input name="sai1" placeholder="vd: mua táo" required></label>
        <label>Đáp án sai 2<input name="sai2" placeholder="vd: mua lê" required></label>
        <label class="qb-wide">Tranh minh họa (không bắt buộc)<input name="img" type="file" accept="image/*"></label>`,
    5: `<label class="qb-wide">Câu hoàn chỉnh (các tiếng cách nhau bằng dấu cách, có dấu chấm cuối câu)<input name="cau" placeholder="vd: Bé đi học sớm." required></label>`,
  };

  async function buildEntry(n, f) {
    const g = k => nfc(f.elements[k]?.value);
    if (n == 1) {
      const id = newId("u1");
      return { k: id, c: g("c"), doc: g("doc"), tu: g("tu"), hinh: g("hinh"), nhom: [...g("c")].length > 1 ? "ghep" : "don", rieng: 1 };
    }
    if (n == 2) {
      const m = g("m").split(" ").filter(Boolean);
      const tu = g("tu");
      if (m.join("") !== tu.replace(/\s/g, "")) throw new Error(`Các mảnh “${m.join(" + ")}” ghép lại phải đúng bằng từ “${tu}”.`);
      if (m.length < 2) throw new Error("Cần ít nhất 2 mảnh ghép.");
      return { w: newId("u2"), tu, m, hinh: g("hinh"), rieng: 1 };
    }
    if (n == 3) return { k: newId("u3"), bai: "", so: 0, a: g("a"), b: g("b"), hinh: g("hinh"), rieng: 1 };
    if (n == 4) {
      const file = f.elements.img?.files?.[0];
      const e = { k: newId("u4"), bai: "", doan: g("doan"), hoi: g("hoi"), dung: g("dung"), sai: [g("sai1"), g("sai2")], chung: g("dung"), rieng: 1 };
      if (file) e.img = await readImage(file);
      return e;
    }
    if (n == 5) {
      let cau = g("cau");
      if (!/[.!?]$/.test(cau)) cau += ".";
      if (cau.split(" ").length < 2) throw new Error("Câu cần có ít nhất 2 tiếng.");
      return { k: newId("u5"), bai: "", cau, muc: "de", rieng: 1 };
    }
  }

  let modal, cur = 1;
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "modal hidden";
    modal.id = "modal-qbank";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <div class="modal-card modal-wide qb-card pop-in">
        <div class="ma-head">
          <h3>📝 Soạn câu hỏi các chặng</h3>
          <button class="am-close" id="qb-close" aria-label="Đóng">✖</button>
        </div>
        <p class="ma-help">Thêm câu hỏi mới hoặc xóa câu có sẵn cho từng chặng. Mỗi lượt chơi lấy ngẫu nhiên <b>10 câu</b> trong danh sách. Âm thanh cho câu mới: thu tại <b>🎙️ Quản lý âm thanh của tôi</b>.</p>
        <div class="ma-tabs" id="qb-tabs">
          ${Object.keys(STAGE).map(n => `<button class="g1-tab${n == 1 ? " active" : ""}" data-n="${n}">${STAGE[n].name.split(" – ")[0]}</button>`).join("")}
        </div>
        <div class="qb-sync" id="qb-sync"></div>
        <div class="ma-list qb-list" id="qb-list"></div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="qb-reset">↺ Khôi phục mặc định chặng này</button>
          <button class="btn btn-primary" id="qb-done">Xong</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const $ = s => modal.querySelector(s);
    $("#qb-close").onclick = $("#qb-done").onclick = close;
    modal.addEventListener("click", e => { if (e.target === modal) close(); });
    $("#qb-tabs").addEventListener("click", e => {
      const b = e.target.closest(".g1-tab"); if (!b) return;
      cur = +b.dataset.n;
      modal.querySelectorAll("#qb-tabs .g1-tab").forEach(x => x.classList.toggle("active", x === b));
      render();
    });
    $("#qb-reset").onclick = () => {
      if (!confirm(`Khôi phục danh sách mặc định cho ${STAGE[cur].name}?\nCác câu cô tự thêm ở chặng này sẽ bị xóa.`)) return;
      cfg.stages[cur] = defaultStage(cur);
      apply(cur); save(); render();
      window.VQAV?.toast("↺ Đã khôi phục mặc định");
    };
    $("#qb-list").addEventListener("click", onListClick);
    $("#qb-list").addEventListener("submit", onSubmit);
    return modal;
  }

  function renderSync() {
    const el = modal?.querySelector("#qb-sync");
    if (!el) return;
    el.className = "qb-sync " + (syncOk ? "ok" : syncOk === false ? "off" : "");
    el.innerHTML = syncOk
      ? "🟢 Đã lưu vào trình duyệt <b>và</b> thư mục code (<code>js/data/cau-hoi-rieng.js</code>) – gửi kèm thư mục là người khác có cùng bộ câu hỏi."
      : syncOk === false
        ? "💡 Đã lưu trong trình duyệt. Mở app bằng <b>Mo_Ung_Dung.bat</b> để tự lưu thêm vào thư mục code (gửi được cho người khác)."
        : "Thay đổi được lưu tự động.";
  }

  function render() {
    const st = STAGE[cur], c = cfg.stages[cur];
    const arr = st.arr();
    const removedSet = new Set(c.removed);
    const removedBase = BASE[cur].filter(x => removedSet.has(x[st.key]));
    const list = modal.querySelector("#qb-list");
    const warn = arr.length < 10 ? ` <span class="qb-warn">(ít hơn 10 – mỗi lượt sẽ hỏi cả ${arr.length} câu)</span>` : "";
    list.innerHTML = `
      <form class="qb-form" autocomplete="off">
        <div class="qb-form-title">➕ Thêm câu mới cho ${esc(st.name)}</div>
        <div class="qb-fields">${FORMS[cur]}</div>
        ${[1, 2, 3].includes(cur) ? `<div class="qb-emojis">${EMOJI.map(e => `<button type="button" class="qb-emo" data-e="${e}">${e}</button>`).join("")}</div>` : ""}
        <div class="qb-form-actions"><button class="btn btn-primary" type="submit">➕ Thêm câu</button></div>
      </form>
      <div class="ma-sum">Đang có <b>${arr.length}</b> câu${warn}</div>
      ${arr.map(x => `
        <div class="ma-row qb-row${x.rieng ? " mine" : ""}" data-id="${esc(x[st.key])}">
          <div class="ma-label">${x.rieng ? `<span class="ma-cat-tag">✏️ Tự thêm</span>` : ""}${st.label(x)}</div>
          <div class="ma-btns"><button class="ma-btn del" data-act="del" title="Xóa câu này">🗑️</button></div>
        </div>`).join("")}
      ${removedBase.length ? `
        <details class="qb-removed">
          <summary>🗂️ Câu có sẵn đã xóa (${removedBase.length}) – bấm để khôi phục</summary>
          ${removedBase.map(x => `
            <div class="ma-row qb-row removed" data-id="${esc(x[st.key])}">
              <div class="ma-label">${st.label(x)}</div>
              <div class="ma-btns"><button class="ma-btn" data-act="restore" title="Khôi phục">↩️</button></div>
            </div>`).join("")}
        </details>` : ""}`;
    renderSync();
  }

  function onListClick(e) {
    const emo = e.target.closest(".qb-emo");
    if (emo) {
      const inp = modal.querySelector('.qb-form input[name="hinh"]');
      if (inp) { inp.value = emo.dataset.e; inp.focus(); }
      return;
    }
    const btn = e.target.closest(".ma-btn"); if (!btn) return;
    const id = btn.closest(".qb-row").dataset.id;
    const st = STAGE[cur], c = cfg.stages[cur];
    if (btn.dataset.act === "del") {
      if (st.arr().length <= st.min) return window.VQAV?.toast(`⚠️ Chặng này cần ít nhất ${st.min} câu.`);
      const added = c.added.findIndex(x => x[st.key] === id);
      if (added >= 0) c.added.splice(added, 1);
      else if (!c.removed.includes(id)) c.removed.push(id);
      window.VQAV?.toast("🗑️ Đã xóa câu");
    } else if (btn.dataset.act === "restore") {
      c.removed = c.removed.filter(k => k !== id);
      window.VQAV?.toast("↩️ Đã khôi phục câu");
    }
    apply(cur); save(); render();
  }

  async function onSubmit(e) {
    e.preventDefault();
    const f = e.target;
    try {
      const entry = await buildEntry(cur, f);
      cfg.stages[cur].added.push(entry);
      apply(cur); await save(); render();
      window.VQAV?.toast("✅ Đã thêm câu mới – có hiệu lực từ lượt chơi tiếp theo");
    } catch (err) {
      window.VQAV?.toast("⚠️ " + (err.message || "Không thêm được câu"));
    }
  }

  function open() { ensureModal(); render(); modal.classList.remove("hidden"); }
  function close() { modal?.classList.add("hidden"); }

  window.QBank = { open, close, count: n => STAGE[n].arr().length };
  document.getElementById("btn-qbank")?.addEventListener("click", open);
})();
