/* =========================================================
   Dữ liệu 5 chặng + giao diện XEM TRƯỚC của từng chặng.
   Khi triển khai thật, mỗi chặng sẽ có file riêng (js/games/stageX.js)
   ========================================================= */
const STAGES = [
  {
    id: 1,
    name: "Rừng chữ cái",
    short: "Nghe âm và chọn đúng chữ",
    emoji: "🌳",
    color: "#58bf6e",
    colorDark: "#2f8a44",
    img: "assets/img/stage1.jpg",
    pos: { x: 13, y: 71 },
    intro: "Chào mừng bé đến Rừng chữ cái! Bé hãy lắng nghe thật kỹ rồi chọn đúng chữ cái nhé!",
    preview: () => `
      <div class="pv pv-forest">
        <button class="pv-speaker pulse" type="button" aria-label="Nghe âm">🔊</button>
        <p class="pv-hint">Bé nghe và chọn chữ đúng</p>
        <div class="pv-cards">
          ${["a", "ă", "â", "b"].map((c, i) =>
            `<div class="pv-card" style="--d:${i * 0.08}s"><span>${c}</span><small>${["🍃","🍄","🌼","🐿️"][i]}</small></div>`).join("")}
        </div>
      </div>`
  },
  {
    id: 2,
    name: "Cầu ghép vần",
    short: "Kéo thả chữ để tạo tiếng",
    emoji: "🌉",
    color: "#5aa6f0",
    colorDark: "#2d6fb8",
    img: "assets/img/stage2.jpg",
    pos: { x: 31, y: 55 },
    intro: "Đây là Cầu ghép vần! Bé hãy kéo các chữ vào ô trống để ghép thành tiếng nhé!",
    preview: () => `
      <div class="pv pv-bridge">
        <div class="pv-picture">🐄</div>
        <div class="pv-slots">
          <div class="pv-slot filled">b</div>
          <span class="pv-plus">+</span>
          <div class="pv-slot">?</div>
          <span class="pv-plus">=</span>
          <div class="pv-slot result">bò</div>
        </div>
        <div class="pv-tiles">
          ${["o", "ò", "a", "ê"].map(c => `<div class="pv-tile">${c}</div>`).join("")}
        </div>
      </div>`
  },
  {
    id: 3,
    name: "Ngôi nhà từ ngữ",
    short: "Ghép tiếng thành từ phù hợp",
    emoji: "🏡",
    color: "#f27d98",
    colorDark: "#bf4664",
    img: "assets/img/stage3.jpg",
    pos: { x: 50, y: 73 },
    intro: "Ngôi nhà từ ngữ đây rồi! Bé hãy ghép các tiếng để tạo thành từ đúng với bức tranh nhé!",
    preview: () => `
      <div class="pv pv-house">
        <div class="pv-house-rows">
          <div class="pv-row"><span class="pv-pic">🐟</span><div class="pv-word"><b>con</b><b class="empty">?</b></div></div>
          <div class="pv-row"><span class="pv-pic">🌸</span><div class="pv-word"><b>bông</b><b class="empty">?</b></div></div>
          <div class="pv-row"><span class="pv-pic">🎒</span><div class="pv-word"><b>cặp</b><b class="empty">?</b></div></div>
        </div>
        <div class="pv-tiles">
          ${["cá", "hoa", "sách"].map(c => `<div class="pv-tile wide">${c}</div>`).join("")}
        </div>
      </div>`
  },
  {
    id: 4,
    name: "Lâu đài đọc hiểu",
    short: "Đọc đoạn văn, trả lời câu hỏi",
    emoji: "🏰",
    color: "#9d82ec",
    colorDark: "#6648c4",
    img: "assets/img/stage4.jpg",
    pos: { x: 68, y: 49 },
    intro: "Lâu đài đọc hiểu thật đẹp! Bé đọc câu, xem tranh rồi chọn câu trả lời đúng nhé!",
    preview: () => `
      <div class="pv pv-castle">
        <div class="pv-story">
          <div class="pv-scene">🐱☀️🐟</div>
          <p class="pv-sentence">Mẹ mua cá cho mèo.</p>
        </div>
        <p class="pv-question">❓ Mẹ mua gì cho mèo?</p>
        <div class="pv-answers">
          <div class="pv-ans">🥛 sữa</div>
          <div class="pv-ans correct">🐟 cá</div>
          <div class="pv-ans">🍚 cơm</div>
        </div>
      </div>`
  },
  {
    id: 5,
    name: "Kho báu tri thức",
    short: "Sắp xếp tiếng thành câu",
    emoji: "💎",
    color: "#f5b335",
    colorDark: "#bf7a0c",
    img: "assets/img/stage5.jpg",
    pos: { x: 87, y: 63 },
    intro: "Wow, Kho báu tri thức! Bé sắp xếp các tiếng thành câu để mở rương báu nhé!",
    preview: () => `
      <div class="pv pv-treasure">
        <div class="pv-chest float">🎁</div>
        <p class="pv-hint">Bộ sưu tập huy hiệu của bé</p>
        <div class="pv-badges">
          ${[["🌳","Thợ săn chữ"],["🌉","Kiến trúc sư vần"],["🏡","Nhà từ ngữ"],["🏰","Hiệp sĩ đọc"],["👑","Vua Tiếng Việt"]]
            .map(([e, t], i) => `<div class="pv-badge ${i < 1 ? "got" : ""}"><span>${e}</span><small>${t}</small></div>`).join("")}
        </div>
      </div>`
  }
];
