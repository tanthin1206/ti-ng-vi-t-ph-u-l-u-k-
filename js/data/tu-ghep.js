/* =========================================================
   TỪ GHÉP – Chặng 2 "Cầu ghép vần"
   w    : mã file âm thanh (không dấu)  → assets/audio/<nu|nam>/ghep/<w>.mp3
   tu   : từ hoàn chỉnh
   m    : các mảnh ghép theo đúng thứ tự (nối lại phải bằng tu)
   hinh : hình minh họa
   ⚠ Mỗi mục giữ trên 1 dòng – tools/gen_audio.py đọc file này.
   ========================================================= */
const TU_GHEP = [
  // ---- Dễ: 2 mảnh ----
  { w:"bo",     tu:"bò",     m:["b","ò"],             hinh:"🐄" },
  { w:"ca",     tu:"cá",     m:["c","á"],             hinh:"🐟" },
  { w:"ga",     tu:"gà",     m:["g","à"],             hinh:"🐔" },
  { w:"la",     tu:"lá",     m:["l","á"],             hinh:"🍃" },
  { w:"de",     tu:"dê",     m:["d","ê"],             hinh:"🐐" },
  { w:"le",     tu:"lê",     m:["l","ê"],             hinh:"🍐" },
  { w:"no",     tu:"nơ",     m:["n","ơ"],             hinh:"🎀" },
  { w:"xe",     tu:"xe",     m:["x","e"],             hinh:"🚗" },
  { w:"co",     tu:"cờ",     m:["c","ờ"],             hinh:"🚩" },
  { w:"mu",     tu:"mũ",     m:["m","ũ"],             hinh:"🧢" },
  { w:"tho",    tu:"thỏ",    m:["th","ỏ"],            hinh:"🐰" },
  { w:"nha",    tu:"nhà",    m:["nh","à"],            hinh:"🏠" },
  { w:"khi",    tu:"khỉ",    m:["kh","ỉ"],            hinh:"🐒" },
  { w:"ghe",    tu:"ghế",    m:["gh","ế"],            hinh:"🪑" },
  { w:"nghe",   tu:"nghé",   m:["ngh","é"],           hinh:"🐃" },
  { w:"qua",    tu:"quà",    m:["qu","à"],            hinh:"🎁" },
  { w:"pho",    tu:"phở",    m:["ph","ở"],            hinh:"🍜" },
  { w:"cho",    tu:"chó",    m:["ch","ó"],            hinh:"🐶" },
  { w:"nho",    tu:"nho",    m:["nh","o"],            hinh:"🍇" },
  { w:"ong",    tu:"ong",    m:["o","ng"],            hinh:"🐝" },
  // ---- Vừa: 3 mảnh ----
  { w:"meo",    tu:"mèo",    m:["m","è","o"],         hinh:"🐱" },
  { w:"voi",    tu:"voi",    m:["v","o","i"],         hinh:"🐘" },
  { w:"hoa",    tu:"hoa",    m:["h","o","a"],         hinh:"🌸" },
  { w:"sao",    tu:"sao",    m:["s","a","o"],         hinh:"⭐" },
  { w:"tao",    tu:"táo",    m:["t","á","o"],         hinh:"🍎" },
  { w:"cay",    tu:"cây",    m:["c","â","y"],         hinh:"🌳" },
  { w:"gau",    tu:"gấu",    m:["g","ấ","u"],         hinh:"🐻" },
  { w:"keo",    tu:"kẹo",    m:["k","ẹ","o"],         hinh:"🍬" },
  { w:"mua",    tu:"mưa",    m:["m","ư","a"],         hinh:"🌧️" },
  { w:"ngua",   tu:"ngựa",   m:["ng","ự","a"],        hinh:"🐴" },
  { w:"giay",   tu:"giày",   m:["gi","à","y"],        hinh:"👟" },
  { w:"sach",   tu:"sách",   m:["s","á","ch"],        hinh:"📖" },
  { w:"nam",    tu:"nấm",    m:["n","ấ","m"],         hinh:"🍄" },
  { w:"but",    tu:"bút",    m:["b","ú","t"],         hinh:"🖊️" },
  { w:"rua",    tu:"rùa",    m:["r","ù","a"],         hinh:"🐢" },
  { w:"trang",  tu:"trăng",  m:["tr","ă","ng"],       hinh:"🌙" },
  { w:"trong",  tu:"trống",  m:["tr","ố","ng"],       hinh:"🥁" },
  { w:"cam",    tu:"cam",    m:["c","a","m"],         hinh:"🍊" },
  { w:"kem",    tu:"kem",    m:["k","e","m"],         hinh:"🍦" },
  { w:"den",    tu:"đèn",    m:["đ","è","n"],         hinh:"💡" },
  { w:"dua",    tu:"dưa",    m:["d","ư","a"],         hinh:"🍉" },
  { w:"rong",   tu:"rồng",   m:["r","ồ","ng"],        hinh:"🐉" },
  // ---- Khó: 4–5 mảnh ----
  { w:"chuoi",  tu:"chuối",  m:["ch","u","ố","i"],    hinh:"🍌" },
  { w:"thuyen", tu:"thuyền", m:["th","u","y","ề","n"],hinh:"⛵" },
  { w:"buom",   tu:"bướm",   m:["b","ư","ớ","m"],     hinh:"🦋" },
  { w:"chuot",  tu:"chuột",  m:["ch","u","ộ","t"],    hinh:"🐭" },
  { w:"xoai",   tu:"xoài",   m:["x","o","à","i"],     hinh:"🥭" },
  { w:"giuong", tu:"giường", m:["gi","ư","ờ","ng"],   hinh:"🛏️" },
  { w:"chuong", tu:"chuông", m:["ch","u","ô","ng"],   hinh:"🔔" },
  { w:"khoai",  tu:"khoai",  m:["kh","o","a","i"],    hinh:"🥔" },
  { w:"tuyet",  tu:"tuyết",  m:["t","u","y","ế","t"], hinh:"❄️" },
  { w:"thuoc",  tu:"thuốc",  m:["th","u","ố","c"],    hinh:"💊" },
  { w:"huou",   tu:"hươu",   m:["h","ư","ơ","u"],     hinh:"🦌" },
];
