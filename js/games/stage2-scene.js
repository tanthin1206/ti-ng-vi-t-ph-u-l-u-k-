/* =========================================================
   CHẶNG 2 – Khung cảnh vẽ bằng SVG (không dùng ảnh nền)
   viewBox 1600×900 (16:9). Bờ trái: x 0–450, sông giữa,
   bờ phải + cổng làng: x 1150–1600. Cầu bắc qua x 384–1216.
   ========================================================= */
window.S2_SCENE_SVG = (() => {
  // cây tròn trên bờ xa
  const tree = (x, y, s, c1, c2) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-5" y="-6" width="10" height="34" rx="4" fill="#8a5a33"/>
      <circle cx="0" cy="-30" r="34" fill="${c1}"/>
      <circle cx="-22" cy="-14" r="22" fill="${c2}"/>
      <circle cx="22" cy="-16" r="24" fill="${c2}"/>
      <circle cx="-8" cy="-42" r="14" fill="#ffffff" opacity=".18"/>
    </g>`;
  const farTrees = [[60, 488, .8], [150, 482, 1], [560, 492, .7], [640, 486, .9], [1000, 490, .75], [1080, 484, .95], [1530, 486, .85]]
    .map(([x, y, s], i) => tree(x, y, s, i % 2 ? "#5fb85a" : "#6cc464", i % 2 ? "#4fa64c" : "#58b555")).join("");
  // lá sen + hoa sen
  const pad = (x, y, r) => `<path d="M${x} ${y} m${r} 0 a${r} ${r * .42} 0 1 1 -${r * .25} -${r * .38} L${x} ${y} Z" fill="#4fae55" stroke="#3d8f44" stroke-width="2"/>`;
  const lotus = (x, y, s) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="6" rx="34" ry="10" fill="#4fae55"/>
      <path d="M0 4 C-16 -6 -18 -26 0 -40 C18 -26 16 -6 0 4Z" fill="#ffb3cf"/>
      <path d="M0 4 C-26 0 -34 -18 -24 -30 C-12 -20 -6 -8 0 4Z" fill="#ff9cc2"/>
      <path d="M0 4 C26 0 34 -18 24 -30 C12 -20 6 -8 0 4Z" fill="#ff9cc2"/>
      <circle cx="0" cy="-8" r="5" fill="#ffd34d"/>
    </g>`;
  const stones = [[70, 860, 44], [140, 792, 38], [196, 734, 34], [238, 684, 30], [272, 642, 26], [298, 606, 22]]
    .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .45}" fill="#e3ddcf" stroke="#b9b2a2" stroke-width="3"/>`).join("");
  const flowers = [[40, 650, "#ff8fb1"], [110, 700, "#ffd34d"], [60, 760, "#ffffff"], [240, 830, "#ff8fb1"], [1350, 800, "#ffd34d"], [1430, 740, "#ff8fb1"], [1560, 700, "#ffffff"], [1520, 820, "#ffd34d"]]
    .map(([x, y, c]) => `<g transform="translate(${x} ${y})"><circle r="7" cx="-7" fill="${c}"/><circle r="7" cx="7" fill="${c}"/><circle r="7" cy="-7" fill="${c}"/><circle r="7" cy="7" fill="${c}"/><circle r="5" fill="#ffb02e"/></g>`).join("");

  return `
  <svg class="g2-art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="s2sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8ff"/><stop offset=".7" stop-color="#cdeeff"/><stop offset="1" stop-color="#eaf8ff"/></linearGradient>
      <linearGradient id="s2water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd6f5"/><stop offset="1" stop-color="#2e9fe0"/></linearGradient>
      <linearGradient id="s2grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ede72"/><stop offset="1" stop-color="#5fb84a"/></linearGradient>
      <radialGradient id="s2sun"><stop offset="0" stop-color="#fff7c2"/><stop offset=".6" stop-color="#ffe07a"/><stop offset="1" stop-color="#ffd04d" stop-opacity="0"/></radialGradient>
      <radialGradient id="s2door" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#fffbe0"/><stop offset=".6" stop-color="#ffe58a"/><stop offset="1" stop-color="#f5b942"/></radialGradient>
      <radialGradient id="s2lamp"><stop offset="0" stop-color="#fff2a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffb040" stop-opacity="0"/></radialGradient>
    </defs>

    <!-- Bầu trời -->
    <rect width="1600" height="900" fill="url(#s2sky)"/>
    <circle cx="1270" cy="130" r="150" fill="url(#s2sun)" opacity=".55"/>
    <circle cx="1270" cy="130" r="58" fill="#fff3b0"/>
    <g class="s2-cloud c1"><ellipse cx="200" cy="120" rx="90" ry="34" fill="#fff"/><ellipse cx="250" cy="100" rx="60" ry="40" fill="#fff"/><ellipse cx="160" cy="105" rx="45" ry="30" fill="#fff"/></g>
    <g class="s2-cloud c2"><ellipse cx="760" cy="80" rx="110" ry="36" fill="#fff" opacity=".95"/><ellipse cx="810" cy="58" rx="66" ry="40" fill="#fff"/><ellipse cx="710" cy="64" rx="50" ry="30" fill="#fff"/></g>
    <g class="s2-cloud c3"><ellipse cx="1480" cy="230" rx="80" ry="26" fill="#fff" opacity=".9"/><ellipse cx="1515" cy="214" rx="48" ry="28" fill="#fff" opacity=".9"/></g>

    <g transform="translate(0 -50)">
    <!-- Núi xa -->
    <path fill="#bfe5d8" d="M0 470 L70 340 Q100 290 135 340 L190 410 L265 255 Q295 205 330 255 L410 380 L480 305 Q510 270 545 305 L625 430 L705 285 Q740 235 775 285 L865 420 L945 335 Q975 305 1010 340 L1095 440 L1170 300 Q1205 250 1240 300 L1325 405 L1405 325 Q1435 295 1470 325 L1600 445 V540 H0Z"/>
    <path fill="#a6d9c3" d="M0 505 Q200 430 420 480 T820 470 T1220 478 T1600 468 V545 H0Z"/>
    <!-- chùa nhỏ trên núi -->
    <g transform="translate(300 240)"><rect x="-10" y="0" width="20" height="18" fill="#e8d3a6"/><path d="M-22 2 Q0 -6 22 2 L14 -6 H-14Z" fill="#d9584a"/><rect x="-7" y="-18" width="14" height="12" fill="#e8d3a6"/><path d="M-16 -16 Q0 -24 16 -16 L10 -24 H-10Z" fill="#d9584a"/></g>

    <!-- Bờ xa + cây -->
    <path fill="#90d26f" d="M0 500 Q400 474 800 494 T1600 488 V535 H0Z"/>
    ${farTrees}
    </g>

    <!-- Dòng sông -->
    <rect x="0" y="468" width="1600" height="432" fill="url(#s2water)"/>
    <g class="s2-waves" fill="none" stroke="#ffffff" stroke-linecap="round" opacity=".55">
      <path d="M480 600 q30 -10 60 0 t60 0" stroke-width="5"/><path d="M820 640 q30 -10 60 0 t60 0" stroke-width="5"/>
      <path d="M620 720 q30 -10 60 0 t60 0" stroke-width="6"/><path d="M960 760 q30 -10 60 0 t60 0" stroke-width="6"/>
      <path d="M540 830 q30 -10 60 0 t60 0" stroke-width="7"/><path d="M1000 860 q30 -10 60 0 t60 0" stroke-width="7"/>
      <path d="M700 560 q24 -8 48 0 t48 0" stroke-width="4"/><path d="M1040 575 q24 -8 48 0 t48 0" stroke-width="4"/>
    </g>
    ${pad(560, 790, 40)}${pad(1060, 820, 46)}${pad(900, 870, 38)}${pad(700, 880, 34)}
    ${lotus(640, 820, 1)}${lotus(1000, 850, 1.15)}${lotus(520, 700, .7)}

    <!-- Bờ trái -->
    <path fill="#b77d45" d="M0 556 Q170 544 292 568 Q356 582 368 626 Q382 706 342 786 Q312 856 328 900 H0Z"/>
    <path fill="url(#s2grass)" d="M0 540 Q160 528 280 552 Q340 566 352 610 Q366 690 326 770 Q296 840 312 900 H0Z"/>
    ${stones}
    <g fill="#5aae43"><circle cx="30" cy="590" r="44"/><circle cx="90" cy="575" r="34"/></g>
    <g fill="#6cc157"><circle cx="60" cy="600" r="30"/></g>

    <!-- Bờ phải -->
    <path fill="#b77d45" d="M1600 546 Q1430 536 1308 562 Q1246 576 1234 622 Q1220 702 1260 782 Q1290 852 1274 900 H1600Z"/>
    <path fill="url(#s2grass)" d="M1600 530 Q1440 520 1320 546 Q1262 560 1250 606 Q1236 686 1276 766 Q1306 836 1290 900 H1600Z"/>
    <ellipse cx="1440" cy="566" rx="118" ry="22" fill="#ead8aa"/>


    <!-- Mố cầu bằng đá hai bên bờ -->
    ${[[268, 594], [1236, 588]].map(([x, y]) => `
      <g transform="translate(${x} ${y})">
        <path d="M0 10 Q0 0 10 0 H86 Q96 0 96 10 V104 H0Z" fill="#cfc8b8" stroke="#9c9483" stroke-width="4"/>
        <path d="M0 36 H96 M0 70 H96 M30 0 V36 M66 0 V36 M14 36 V70 M50 36 V70 M82 36 V70 M32 70 V104 M70 70 V104" stroke="#a9a190" stroke-width="3"/>
        <path d="M4 8 H92" stroke="#ece7dc" stroke-width="5" stroke-linecap="round"/>
      </g>`).join("")}
    <!-- Cổng làng -->
    <g class="s2-gate" transform="translate(1440 562) scale(.85) translate(-1391 -612)">
      <rect x="1296" y="420" width="190" height="16" rx="4" fill="#c99a5e"/>
      <path d="M1304 436 H1478 V612 H1434 V520 Q1391 466 1348 520 V612 H1304Z" fill="#f6e6bf" stroke="#b07a42" stroke-width="5" stroke-linejoin="round"/>
      <path class="s2-door" d="M1348 612 V520 Q1391 466 1434 520 V612Z" fill="url(#s2door)"/>
      <rect x="1290" y="430" width="30" height="186" rx="5" fill="#ecd3a2" stroke="#b07a42" stroke-width="5"/>
      <rect x="1462" y="430" width="30" height="186" rx="5" fill="#ecd3a2" stroke="#b07a42" stroke-width="5"/>
      <rect x="1350" y="446" width="82" height="24" rx="4" fill="#d9473a" stroke="#a83228" stroke-width="3"/>
      <rect x="1362" y="453" width="58" height="10" rx="3" fill="#ffd34d" opacity=".9"/>
      <!-- mái -->
      <path d="M1256 432 Q1282 424 1296 402 H1486 Q1500 424 1526 432 Q1494 426 1391 426 Q1288 426 1256 432Z" fill="#d9473a" stroke="#a83228" stroke-width="4" stroke-linejoin="round"/>
      <path d="M1296 402 H1486 L1470 386 H1312Z" fill="#c43c30"/>
      <path d="M1300 380 Q1318 374 1330 352 H1452 Q1464 374 1482 380 Q1452 376 1391 376 Q1330 376 1300 380Z" fill="#d9473a" stroke="#a83228" stroke-width="4" stroke-linejoin="round"/>
      <rect x="1336" y="380" width="110" height="8" fill="#e8d3a6"/>
      <path d="M1330 352 H1452 L1440 340 H1342Z" fill="#c43c30"/>
      <circle cx="1391" cy="334" r="9" fill="#ffd34d" stroke="#c9952a" stroke-width="3"/>
      <!-- cờ -->
      <line x1="1470" y1="352" x2="1470" y2="262" stroke="#7a4a22" stroke-width="5" stroke-linecap="round"/>
      <path d="M1472 264 H1530 V302 H1472Z" fill="#e53935"/>
      <path d="M1501 272 l4 9 10 1 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 -1z" fill="#ffd600"/>
      <!-- đèn lồng -->
      <g class="s2-lamp"><circle cx="1278" cy="478" r="34" fill="url(#s2lamp)"/><line x1="1278" y1="440" x2="1278" y2="460" stroke="#7a4a22" stroke-width="3"/><ellipse cx="1278" cy="478" rx="13" ry="17" fill="#e53935" stroke="#b71c1c" stroke-width="2"/><rect x="1272" y="458" width="12" height="4" fill="#ffc107"/><rect x="1272" y="494" width="12" height="4" fill="#ffc107"/></g>
      <g class="s2-lamp"><circle cx="1504" cy="478" r="34" fill="url(#s2lamp)"/><line x1="1504" y1="440" x2="1504" y2="460" stroke="#7a4a22" stroke-width="3"/><ellipse cx="1504" cy="478" rx="13" ry="17" fill="#e53935" stroke="#b71c1c" stroke-width="2"/><rect x="1498" y="458" width="12" height="4" fill="#ffc107"/><rect x="1498" y="494" width="12" height="4" fill="#ffc107"/></g>
    </g>
    <g fill="#5aae43"><circle cx="1590" cy="560" r="36"/></g>

    <!-- Hoa & cỏ tiền cảnh -->
    ${flowers}
    <g fill="#4e9f3d">
      <path d="M0 900 q20 -70 30 0 q10 -90 30 0 q15 -60 25 0Z"/><path d="M1520 900 q20 -70 30 0 q10 -90 30 0 q15 -60 25 0Z"/>
    </g>
  </svg>`;
})();
