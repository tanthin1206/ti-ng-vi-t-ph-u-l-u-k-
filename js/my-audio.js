/* =========================================================
   ÂM THANH CỦA TÔI – thu âm / tải file cho từng âm, từ, lời nói
   Lưu trong trình duyệt (IndexedDB) qua VQAV.myAudio
   ========================================================= */
(() => {
  const $ = s => document.querySelector(s);
  const A = () => window.VQAV;
  const norm = s => s.normalize("NFC").trim().toLowerCase();

  const DH = () => (typeof DOC_HIEU !== "undefined" ? DOC_HIEU : []);

  const INTRO_ITEMS = [
    {
      id: "loi/chao-ban-do",
      cat: "loi",
      k: "chao-ban-do",
      badge: "🗺️ Toàn cảnh",
      label: `<span class="ma-text"><b>Lời mở đầu Toàn cảnh Bản đồ:</b> “Chào bạn! Mình cùng khám phá Tiếng Việt Phiêu Lưu Ký nhé! Chọn một chặng để bắt đầu nào!”</span>`,
      alias: ["chao-ban-do", "loi-chao-ban-do", "mo-dau-toan-canh"],
      text: "Chào bạn! Mình cùng khám phá Tiếng Việt Phiêu Lưu Ký nhé! Chọn một chặng để bắt đầu nào!"
    },
    {
      id: "loi/stage-intro-1",
      cat: "loi",
      k: "stage-intro-1",
      badge: "🌳 Chặng 1",
      label: `<span class="ma-text"><b>Mở đầu Chặng 1 (Rừng chữ cái):</b> “Xin chào! Xin chào các nhà thám hiểm nhí! Mình là Trạng Tý… TIẾNG VIỆT PHIÊU LƯU KÝ… BẮT ĐẦU!”</span>`,
      alias: ["stage-intro-1", "intro-1", "mo-dau-1"],
      text: "Xin chào! Xin chào các nhà thám hiểm nhí! Mình là Trạng Tý – người bạn đồng hành của các bạn trong chuyến phiêu lưu kỳ thú hôm nay! Các bạn có biết không? Một thế giới Tiếng Việt đầy phép màu đang chờ chúng mình khám phá đấy! Ở đó có những chữ cái tinh nghịch, những cây cầu ghép vần bí ẩn, những ngôi nhà từ ngữ đáng yêu và cả một kho báu đang chờ được mở ra! Nhưng để chinh phục kho báu ấy, chúng mình phải vượt qua 5 chặng thử thách! Mỗi chặng có 10 câu hỏi, mỗi câu trả lời đúng sẽ mang về 10 điểm! Hãy cố gắng tích lũy thật nhiều điểm để giành những huy hiệu Đồng, Bạc và Vàng lấp lánh nhé! Các nhà thám hiểm nhí đã sẵn sàng chưa nào? Ba… hai… một… TIẾNG VIỆT PHIÊU LƯU KÝ… BẮT ĐẦU! Nào! Cùng Tý lên đường thôi!"
    },
    {
      id: "loi/stage-intro-2",
      cat: "loi",
      k: "stage-intro-2",
      badge: "🌉 Chặng 2",
      label: `<span class="ma-text"><b>Mở đầu Chặng 2 (Cầu ghép vần):</b> “Wow! Các bạn giỏi quá! Chặng đầu tiên đã chinh phục thành công! Phía trước là Cầu Ghép Vần kỳ diệu…”</span>`,
      alias: ["stage-intro-2", "intro-2", "mo-dau-2"],
      text: "Wow! Các bạn giỏi quá! Chặng đầu tiên đã chinh phục thành công! Phía trước là Cầu Ghép Vần kỳ diệu! Ghép đúng một tiếng, cây cầu sẽ sáng lên! Nào, cùng Trạng Tý vượt cầu thôi!"
    },
    {
      id: "loi/stage-intro-3",
      cat: "loi",
      k: "stage-intro-3",
      badge: "🏠 Chặng 3",
      label: `<span class="ma-text"><b>Mở đầu Chặng 3 (Ngôi nhà từ ngữ):</b> “Hoan hô! Chúng mình đã vượt cầu thành công! Ô kìa! Những từ ngữ đáng yêu đang chờ…”</span>`,
      alias: ["stage-intro-3", "intro-3", "mo-dau-3"],
      text: "Hoan hô! Chúng mình đã vượt cầu thành công! Ô kìa! Những từ ngữ đáng yêu đang chờ được khám phá! Nhanh mắt, nhanh trí! Cùng Trạng Tý mở cửa Ngôi Nhà Từ Ngữ nào!"
    },
    {
      id: "loi/stage-intro-4",
      cat: "loi",
      k: "stage-intro-4",
      badge: "🏰 Chặng 4",
      label: `<span class="ma-text"><b>Mở đầu Chặng 4 (Lâu đài đọc hiểu):</b> “Xuất sắc! Các nhà thám hiểm nhí thật tài giỏi! Một lâu đài bí ẩn đã xuất hiện…”</span>`,
      alias: ["stage-intro-4", "intro-4", "mo-dau-4"],
      text: "Xuất sắc! Các nhà thám hiểm nhí thật tài giỏi! Một lâu đài bí ẩn đã xuất hiện! Muốn mở cánh cửa thần kỳ, chúng mình phải đọc thật hay, hiểu thật đúng! Sẵn sàng chưa? Tiến vào lâu đài thôi!"
    },
    {
      id: "loi/stage-intro-5",
      cat: "loi",
      k: "stage-intro-5",
      badge: "💎 Chặng 5",
      label: `<span class="ma-text"><b>Mở đầu Chặng 5 (Kho báu tri thức):</b> “Ố là la! Chặng cuối cùng đến rồi! Kho báu tri thức đang ở ngay trước mắt… TRẠNG TÝ TIN CÁC BẠN SẼ LÀM ĐƯỢC!”</span>`,
      alias: ["stage-intro-5", "intro-5", "mo-dau-5"],
      text: "Ố là la! Chặng cuối cùng đến rồi! Kho báu tri thức đang ở ngay trước mắt! Chỉ còn mười câu hỏi nữa thôi! Tập trung hết sức, thể hiện tài năng và rinh huy hiệu vàng nào! TRẠNG TÝ TIN CÁC BẠN SẼ LÀM ĐƯỢC!"
    }
  ];

  const CATS = {
    // Tab riêng cho tất cả lời mở đầu toàn cảnh & từng chặng
    intro: () => INTRO_ITEMS,

    // Chặng 1: Lời mở đầu + Phát âm chữ cái (am) + Từ ví dụ (tu)
    s1: () => {
      const out = [INTRO_ITEMS[1]]; // Lời mở đầu Chặng 1
      (typeof BANG_AM !== "undefined" ? BANG_AM : []).forEach(a => {
        out.push({
          id: `am/${a.k}`,
          cat: "am",
          k: a.k,
          badge: "🔤 Âm",
          label: `<b class="ma-big">${a.c}</b><small>Phát âm: “<b>${a.doc}</b>”</small>`,
          alias: [a.k, a.c, a.doc, `am-${a.k}`, `am-${a.c}`],
          text: a.doc
        });
        out.push({
          id: `tu/${a.k}`,
          cat: "tu",
          k: a.k,
          badge: "🖼️ Từ ví dụ",
          label: `<span class="ma-pic">${a.hinh}</span><b>${a.tu}</b><small>Từ ví dụ cho âm <b>${a.c}</b></small>`,
          alias: [a.tu, `tu-${a.k}`, `tu-${a.tu}`],
          text: a.tu
        });
      });
      return out;
    },
    ghep: () => [
      INTRO_ITEMS[2], // Lời mở đầu Chặng 2
      ...(typeof TU_GHEP !== "undefined" ? TU_GHEP : []).map(w => ({
        id: `ghep/${w.w}`,
        cat: "ghep",
        k: w.w,
        badge: "🌉 Từ ghép",
        label: `<span class="ma-pic">${w.hinh}</span><b>${w.tu}</b><small>${w.m.join(" · ")}</small>`,
        alias: [w.w, w.tu],
        text: w.tu
      }))
    ],
    tu3: () => [
      INTRO_ITEMS[3], // Lời mở đầu Chặng 3
      ...(typeof TU_NGU !== "undefined" ? TU_NGU : []).map(w => ({
        id: `tu3/${w.k}`,
        cat: "tu3",
        k: w.k,
        badge: "🏠 Từ ngữ",
        label: `<span class="ma-pic">${w.hinh}</span><b>${w.tu}</b><small>Bài ${w.bai}</small>`,
        alias: [w.k, w.tu],
        text: w.tu
      }))
    ],
    s4: () => {
      const out = [INTRO_ITEMS[4]]; // Lời mở đầu Chặng 4
      DH().forEach(d => {
        out.push({
          id: `doc/${d.k}`,
          cat: "doc",
          k: d.k,
          badge: "📖 Đoạn văn",
          label: `<span class="ma-text"><b>Bài ${d.bai}:</b> ${d.doan}</span>`,
          alias: [d.k, `doc-${d.k}`],
          text: d.doan
        });
        out.push({
          id: `hoi/${d.k}`,
          cat: "hoi",
          k: d.k,
          badge: "❓ Câu hỏi",
          label: `<span class="ma-text">❓ ${d.hoi}</span>`,
          alias: [`hoi-${d.k}`, d.k],
          text: d.hoi
        });
      });
      return out;
    },
    cau: () => [
      INTRO_ITEMS[5], // Lời mở đầu Chặng 5
      ...(typeof CAU_SAP_XEP !== "undefined" ? CAU_SAP_XEP : []).map(c => ({
        id: `cau/${c.k}`,
        cat: "cau",
        k: c.k,
        badge: "💎 Câu",
        label: `<span class="ma-text">${c.cau}</span><small>Bài ${c.bai}</small>`,
        alias: [c.k, c.cau],
        text: c.cau
      }))
    ]
  };

  let cat = "intro";
  let subFilter = "all";
  let rec = null;   // { id, mr, chunks, stream, btn, timer }

  const modal = $("#modal-myaudio"), list = $("#ma-list");
  const picker = Object.assign(document.createElement("input"), { type: "file", accept: "audio/*", hidden: true });
  document.body.appendChild(picker);
  let pickFor = null;

  const hasSample = (c, k) => {
    if (c === "am" || c === "tu") return true;
    if (c === "loi") return k === "chao-ban-do" || k === "stage-intro-1";
    return false;
  };

  function render() {
    const ma = A().myAudio;
    const allItems = CATS[cat] ? CATS[cat]() : [];
    const items = subFilter === "all" ? allItems : allItems.filter(it => it.cat === subFilter);
    const haveAll = allItems.filter(it => ma.has(it.id)).length;

    let subHtml = "";
    if (cat === "s1") {
      const amCount = allItems.filter(it => it.cat === "am").length;
      const tuCount = allItems.filter(it => it.cat === "tu").length;
      subHtml = `
        <div class="ma-subfilter">
          <button class="ma-subbtn ${subFilter === "all" ? "active" : ""}" data-sub="all">Tất cả (${allItems.length})</button>
          <button class="ma-subbtn ${subFilter === "am" ? "active" : ""}" data-sub="am">🔤 Âm (${amCount})</button>
          <button class="ma-subbtn ${subFilter === "tu" ? "active" : ""}" data-sub="tu">🖼️ Từ ví dụ (${tuCount})</button>
        </div>`;
    } else if (cat === "s4") {
      const docCount = allItems.filter(it => it.cat === "doc").length;
      const hoiCount = allItems.filter(it => it.cat === "hoi").length;
      subHtml = `
        <div class="ma-subfilter">
          <button class="ma-subbtn ${subFilter === "all" ? "active" : ""}" data-sub="all">Tất cả (${allItems.length})</button>
          <button class="ma-subbtn ${subFilter === "doc" ? "active" : ""}" data-sub="doc">📖 Đoạn văn (${docCount})</button>
          <button class="ma-subbtn ${subFilter === "hoi" ? "active" : ""}" data-sub="hoi">❓ Câu hỏi (${hoiCount})</button>
        </div>`;
    }

    let sumHtml = "";
    if (cat === "s1") {
      sumHtml = `<div class="ma-sum">Đã có <b>${haveAll}/${allItems.length}</b> âm thanh của bạn (các mục còn lại dùng giọng mẫu có sẵn)</div>`;
    } else if (cat === "intro") {
      sumHtml = `<div class="ma-sum">Đã có <b>${haveAll}/${allItems.length}</b> lời mở đầu tự thêm (Toàn cảnh & Chặng 1 có sẵn giọng mẫu, Chặng 2–5 cô tự thêm)</div>`;
    } else {
      sumHtml = `<div class="ma-sum">Đã có <b>${haveAll}/${allItems.length}</b> âm thanh tự thêm (Chặng này cô tự thu âm 🎙️ hoặc tải file 📁)</div>`;
    }

    list.innerHTML = subHtml + sumHtml +
      items.map(it => {
        const id = it.id, mine = ma.has(id);
        const withSample = hasSample(it.cat, it.k);
        let badgeHtml = "";
        if (mine) {
          badgeHtml = `<span class="ma-badge mine">✓ Đã thêm</span>`;
        } else if (withSample) {
          badgeHtml = `<span class="ma-badge sample">Giọng mẫu</span>`;
        } else {
          badgeHtml = `<span class="ma-badge empty">⚠️ Chưa có</span>`;
        }
        return `
        <div class="ma-row ${mine ? "mine" : !withSample ? "empty-sound" : ""}" data-id="${id}">
          <div class="ma-label">${it.badge ? `<span class="ma-cat-tag">${it.badge}</span>` : ""}${it.label}</div>
          ${badgeHtml}
          <div class="ma-btns">
            <button class="ma-btn" data-act="play" title="${mine ? "Nghe lại bản thu" : withSample ? "Nghe giọng mẫu" : "Chưa có âm thanh"}" data-nosfx>▶</button>
            <button class="ma-btn rec" data-act="rec" title="Thu âm" data-nosfx>🎙️</button>
            <button class="ma-btn" data-act="file" title="Chọn file" data-nosfx>📁</button>
            <button class="ma-btn del" data-act="del" title="Xóa" data-nosfx ${mine ? "" : "disabled"}>🗑️</button>
          </div>
        </div>`;
      }).join("");

    list.querySelectorAll(".ma-subbtn").forEach(b => {
      b.addEventListener("click", () => {
        subFilter = b.dataset.sub;
        render();
      });
    });
  }

  function textFor(id) {
    for (const fn of Object.values(CATS)) {
      const it = fn().find(x => x.id === id);
      if (it) return it.text;
    }
    return "";
  }

  /* ---------- Tự động tạo bản clone vào thư mục code (assets/audio/rieng/) ---------- */
  const SERVER_URL = "http://127.0.0.1:8080";

  async function checkServerStatus() {
    try {
      const res = await fetch(`${SERVER_URL}/api/status`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return { online: true, count: data.count, dir: data.dir };
      }
    } catch (e) {}
    return { online: false };
  }

  async function syncCloneToServer(id, blob) {
    try {
      const reader = new FileReader();
      const b64Promise = new Promise((res, rej) => {
        reader.onloadend = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });
      const data = await b64Promise;
      const res = await fetch(`${SERVER_URL}/api/save-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, data })
      });
      if (res.ok) {
        const json = await res.json();
        return json.path;
      }
    } catch (e) {
      console.warn("Chưa kết nối máy chủ tự lưu:", e);
    }
    return null;
  }

  async function deleteCloneFromServer(id) {
    try {
      await fetch(`${SERVER_URL}/api/delete-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    } catch (e) {}
  }

  async function updateSyncStatusUI() {
    const statBox = $("#ma-sync-status");
    const syncText = $("#sync-text");
    if (!statBox || !syncText) return;
    const st = await checkServerStatus();
    if (st.online) {
      statBox.classList.remove("offline");
      syncText.innerHTML = `🟢 <b>Tự động lưu thư mục code ĐANG BẬT</b>: Mọi âm thanh thêm vào sẽ tự tạo file clone vào <code>assets/audio/rieng/</code> (${st.count} file)`;
    } else {
      statBox.classList.add("offline");
      syncText.innerHTML = `💡 Nhấp đúp <b>Mo_Ung_Dung.bat</b> để tự động clone thẳng vào thư mục code (hoặc dùng nút Xuất ZIP)`;
    }
  }

  /* ---------- Đóng gói ZIP không cần thư viện bên ngoài ---------- */
  const crc32Table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    crc32Table[i] = c;
  }
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crc32Table[(crc ^ buf[i]) & 0xFF];
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function createSimpleZip(files) {
    let offset = 0;
    const localHeaders = [];
    const centralHeaders = [];
    const enc = new TextEncoder();

    for (const f of files) {
      const nameBytes = enc.encode(f.path);
      const dataBytes = f.data;
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      const local = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, size, true);
      lv.setUint32(22, size, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      local.set(nameBytes, 30);

      const central = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, size, true);
      cv.setUint32(24, size, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      central.set(nameBytes, 46);

      localHeaders.push(local, dataBytes);
      centralHeaders.push(central);
      offset += local.length + size;
    }

    const centralOffset = offset;
    let centralSize = 0;
    for (const c of centralHeaders) centralSize += c.length;

    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, centralOffset, true);
    ev.setUint16(20, 0, true);

    return new Blob([...localHeaders, ...centralHeaders, end], { type: "application/zip" });
  }

  async function exportAllZip() {
    const allClips = await A().myAudio.getAll();
    if (!allClips || allClips.length === 0) {
      return A().toast("Chưa có âm thanh tự thêm nào để xuất ZIP!");
    }
    A().toast(`⏳ Đang đóng gói ${allClips.length} file âm thanh...`);
    const zipFiles = [];
    for (const clip of allClips) {
      const buf = await clip.blob.arrayBuffer();
      let cleanId = clip.id;
      for (const ext of [".mp3", ".wav", ".webm", ".m4a"]) {
        if (cleanId.endsWith(ext)) cleanId = cleanId.slice(0, -ext.length);
      }
      zipFiles.push({
        path: `assets/audio/rieng/${cleanId}.mp3`,
        data: new Uint8Array(buf)
      });
    }
    const zipBlob = createSimpleZip(zipFiles);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `am-thanh-rieng-tieng-viet-1.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    A().toast(`📦 Đã xuất file ZIP chứa ${allClips.length} file! Bạn có thể giải nén đè vào thư mục code hoặc gửi kèm.`);
  }

  async function save(id, blob, name) {
    try {
      await A().myAudio.set(id, blob, name);
      A().refreshMyAudioCount();
      render();
      flash(id);

      // Tự động tạo bản clone vào thư mục code
      const clonePath = await syncCloneToServer(id, blob);
      if (clonePath) {
        A().toast(`✅ Đã lưu và tạo file clone tại ${clonePath}!`);
      } else {
        A().toast("✅ Đã lưu vào trình duyệt. (Mở Mo_Ung_Dung.bat để tự động clone vào thư mục code)");
      }
      updateSyncStatusUI();
    } catch (e) {
      A().toast("⚠️ Không lưu được âm thanh: " + e.message);
    }
  }
  function flash(id) {
    const row = list.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (row) { row.classList.add("flash"); setTimeout(() => row.classList.remove("flash"), 900); }
  }

  /* ---------- Thu âm ---------- */
  async function startRec(id, btn) {
    if (rec) await stopRec();
    if (!navigator.mediaDevices || !window.MediaRecorder) return A().toast("⚠️ Trình duyệt không hỗ trợ thu âm. Hãy dùng Chrome hoặc Edge.");
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch (e) { return A().toast("⚠️ Chưa cho phép dùng micro. Hãy bấm “Cho phép” khi trình duyệt hỏi."); }
    A().stopAudio();
    const mr = new MediaRecorder(stream);
    const chunks = [];
    mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    const me = { id, mr, chunks, stream, btn };
    rec = me;
    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      clearTimeout(me.timer);
      const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
      if (rec === me) rec = null;
      me.btn.classList.remove("on"); me.btn.textContent = "🎙️";
      if (blob.size > 1000) { await save(id, blob, "thu-am"); A().playClip(A().myAudio.url(id)); }
      else A().toast("Bản thu quá ngắn, cô thử lại nhé!");
    };
    mr.start();
    btn.classList.add("on"); btn.textContent = "⏹";
    me.timer = setTimeout(() => { if (mr.state !== "inactive") mr.stop(); }, id.startsWith("loi/") || id.startsWith("doc/") ? 25000 : 6000); // tự dừng
  }
  function stopRec() {
    if (!rec) return;
    if (rec.mr.state !== "inactive") rec.mr.stop();
  }

  /* ---------- Sự kiện ---------- */
  list.addEventListener("click", async e => {
    const btn = e.target.closest(".ma-btn");
    if (!btn) return;
    const id = btn.closest(".ma-row").dataset.id;
    const act = btn.dataset.act, ma = A().myAudio;
    const allItems = CATS[cat] ? CATS[cat]() : [];
    const it = allItems.find(x => x.id === id);
    const withSample = it ? hasSample(it.cat, it.k) : false;
    const mine = ma.has(id);

    if (act === "play") {
      if (mine) {
        A().playClip(ma.url(id), textFor(id));
      } else if (withSample) {
        const g = A().state.settings.gender === "nam" ? "nam" : "nu";
        A().playClip(`assets/audio/${g}/${id}.mp3`, textFor(id));
      } else {
        A().toast("Mục này chưa có âm thanh. Cô bấm 🎙️ để thu hoặc 📁 để tải file nhé!");
      }
    } else if (act === "rec") {
      if (rec && rec.id === id) stopRec(); else startRec(id, btn);
    } else if (act === "file") {
      pickFor = id; picker.value = ""; picker.click();
    } else if (act === "del") {
      await ma.remove(id);
      await deleteCloneFromServer(id);
      A().refreshMyAudioCount(); render();
      updateSyncStatusUI();
      A().toast("Đã xóa âm thanh tự thêm & file clone của mục này.");
    }
  });
  picker.addEventListener("change", () => {
    const f = picker.files[0];
    if (f && pickFor) save(pickFor, f, f.name);
  });

  $("#ma-bulk").addEventListener("change", async e => {
    const files = [...e.target.files];
    const items = CATS[cat] ? CATS[cat]() : [];
    let ok = 0; const miss = [];
    for (const f of files) {
      const base = norm(f.name.replace(/\.[^.]+$/, ""));
      const it = items.find(x => x.alias.some(a => norm(a) === base));
      if (it) {
        await A().myAudio.set(it.id, f, f.name);
        await syncCloneToServer(it.id, f);
        ok++;
      } else miss.push(f.name);
    }
    e.target.value = "";
    A().refreshMyAudioCount(); render();
    updateSyncStatusUI();
    A().toast(`📥 Đã thêm ${ok} file & tự tạo bản clone vào thư mục code!` + (miss.length ? ` · Không khớp tên: ${miss.slice(0, 4).join(", ")}${miss.length > 4 ? "…" : ""}` : ""));
  });

  document.querySelectorAll("#ma-tabs .g1-tab").forEach(t => t.addEventListener("click", () => {
    stopRec();
    document.querySelectorAll("#ma-tabs .g1-tab").forEach(x => x.classList.toggle("active", x === t));
    cat = t.dataset.cat;
    subFilter = "all";
    render();
    list.scrollTop = 0;
  }));

  const close = () => { stopRec(); A().stopAudio(); modal.classList.add("hidden"); };
  $("#ma-close").addEventListener("click", close);
  $("#ma-done").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  $("#ma-clear").addEventListener("click", async () => {
    if (!confirm("Xóa TẤT CẢ âm thanh bạn đã thu / thêm?")) return;
    const allClips = await A().myAudio.getAll();
    for (const c of allClips) {
      await deleteCloneFromServer(c.id);
    }
    await A().myAudio.clear();
    A().refreshMyAudioCount();
    render();
    updateSyncStatusUI();
  });

  $("#btn-export-zip")?.addEventListener("click", exportAllZip);
  $("#btn-open-rieng-folder")?.addEventListener("click", async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/open-folder`, { method: "POST" });
      if (res.ok) return A().toast("📂 Đã mở thư mục assets/audio/rieng trên máy tính!");
    } catch (e) {}
    A().toast("📁 Thư mục lưu clone tại: assets/audio/rieng/");
  });

  window.MyAudioUI = {
    async open() {
      await A().myAudio.ready;
      cat = "intro";
      subFilter = "all";
      document.querySelectorAll("#ma-tabs .g1-tab").forEach(x => x.classList.toggle("active", x.dataset.cat === "intro"));
      render();
      modal.classList.remove("hidden");
      updateSyncStatusUI();
    }
  };
})();
