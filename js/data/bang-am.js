/* =========================================================
   BẢNG ÂM – Tiếng Việt lớp 1 (theo thứ tự bảng âm SGK)
   k   : mã file âm thanh (kiểu gõ Telex, không dấu)
   c   : chữ hiển thị
   doc : cách đọc âm (dùng để tạo file / đọc dự phòng)
   tu  : từ ví dụ chứa âm, hinh: hình minh họa
   File âm thanh:  assets/audio/am/<k>.mp3   (đọc âm)
                   assets/audio/tu/<k>.mp3   (đọc từ ví dụ)
   ⚠ Mỗi mục giữ trên 1 dòng – tools/gen_audio.py đọc file này.
   ========================================================= */
const BANG_AM = [
  { k:"a",   c:"a",   doc:"a",       tu:"lá",    hinh:"🍃", nhom:"don" },
  { k:"aw",  c:"ă",   doc:"á",       tu:"bắp",   hinh:"🌽", nhom:"don" },
  { k:"aa",  c:"â",   doc:"ớ",       tu:"gấu",   hinh:"🐻", nhom:"don" },
  { k:"b",   c:"b",   doc:"bờ",      tu:"bò",    hinh:"🐄", nhom:"don" },
  { k:"c",   c:"c",   doc:"cờ",      tu:"cá",    hinh:"🐟", nhom:"don" },
  { k:"d",   c:"d",   doc:"dờ",      tu:"dê",    hinh:"🐐", nhom:"don" },
  { k:"dd",  c:"đ",   doc:"đờ",      tu:"đèn",   hinh:"💡", nhom:"don" },
  { k:"e",   c:"e",   doc:"e",       tu:"xe",    hinh:"🚗", nhom:"don" },
  { k:"ee",  c:"ê",   doc:"ê",       tu:"dế",    hinh:"🦗", nhom:"don" },
  { k:"g",   c:"g",   doc:"gờ",      tu:"gà",    hinh:"🐔", nhom:"don" },
  { k:"h",   c:"h",   doc:"hờ",      tu:"hoa",   hinh:"🌸", nhom:"don" },
  { k:"i",   c:"i",   doc:"i",       tu:"chì",   hinh:"✏️", nhom:"don" },
  { k:"k",   c:"k",   doc:"ca",      tu:"kẹo",   hinh:"🍬", nhom:"don" },
  { k:"l",   c:"l",   doc:"lờ",      tu:"lê",    hinh:"🍐", nhom:"don" },
  { k:"m",   c:"m",   doc:"mờ",      tu:"mèo",   hinh:"🐱", nhom:"don" },
  { k:"n",   c:"n",   doc:"nờ",      tu:"nơ",    hinh:"🎀", nhom:"don" },
  { k:"o",   c:"o",   doc:"o",       tu:"ong",   hinh:"🐝", nhom:"don" },
  { k:"oo",  c:"ô",   doc:"ô",       tu:"ô",     hinh:"☂️", nhom:"don" },
  { k:"ow",  c:"ơ",   doc:"ơ",       tu:"cờ",    hinh:"🚩", nhom:"don" },
  { k:"p",   c:"p",   doc:"pờ",      tu:"pin",   hinh:"🔋", nhom:"don" },
  { k:"q",   c:"q",   doc:"cu",      tu:"quà",   hinh:"🎁", nhom:"don" },
  { k:"r",   c:"r",   doc:"rờ",      tu:"rùa",   hinh:"🐢", nhom:"don" },
  { k:"s",   c:"s",   doc:"sờ",      tu:"sao",   hinh:"⭐", nhom:"don" },
  { k:"t",   c:"t",   doc:"tờ",      tu:"táo",   hinh:"🍎", nhom:"don" },
  { k:"u",   c:"u",   doc:"u",       tu:"mũ",    hinh:"🧢", nhom:"don" },
  { k:"uw",  c:"ư",   doc:"ư",       tu:"sư tử", hinh:"🦁", nhom:"don" },
  { k:"v",   c:"v",   doc:"vờ",      tu:"voi",   hinh:"🐘", nhom:"don" },
  { k:"x",   c:"x",   doc:"xờ",      tu:"xoài",  hinh:"🥭", nhom:"don" },
  { k:"y",   c:"y",   doc:"i dài",   tu:"y tá",  hinh:"👩‍⚕️", nhom:"don" },
  { k:"ch",  c:"ch",  doc:"chờ",     tu:"chó",   hinh:"🐶", nhom:"ghep" },
  { k:"tr",  c:"tr",  doc:"trờ",     tu:"trống", hinh:"🥁", nhom:"ghep" },
  { k:"kh",  c:"kh",  doc:"khờ",     tu:"khỉ",   hinh:"🐒", nhom:"ghep" },
  { k:"nh",  c:"nh",  doc:"nhờ",     tu:"nhà",   hinh:"🏠", nhom:"ghep" },
  { k:"th",  c:"th",  doc:"thờ",     tu:"thỏ",   hinh:"🐰", nhom:"ghep" },
  { k:"ph",  c:"ph",  doc:"phờ",     tu:"phở",   hinh:"🍜", nhom:"ghep" },
  { k:"ng",  c:"ng",  doc:"ngờ",     tu:"ngựa",  hinh:"🐴", nhom:"ghep" },
  { k:"ngh", c:"ngh", doc:"ngờ kép", tu:"nghé",  hinh:"🐃", nhom:"ghep" },
  { k:"gh",  c:"gh",  doc:"gờ kép",  tu:"ghế",   hinh:"🪑", nhom:"ghep" },
  { k:"qu",  c:"qu",  doc:"quờ",     tu:"quần",  hinh:"👖", nhom:"ghep" },
  { k:"gi",  c:"gi",  doc:"di",      tu:"giày",  hinh:"👟", nhom:"ghep" },
];

/* Các nhóm âm dễ nhầm – dùng để chọn đáp án gây nhiễu */
const AM_DE_NHAM = [
  ["b", "d", "dd", "p", "q"], ["m", "n"], ["o", "oo", "ow"], ["a", "aw", "aa"],
  ["e", "ee"], ["u", "uw"], ["c", "k", "q", "qu"], ["g", "gh", "gi"], ["ng", "ngh"],
  ["ch", "tr"], ["s", "x"], ["d", "gi", "r"], ["l", "n"], ["i", "y"], ["t", "th"],
  ["p", "ph"], ["k", "kh"], ["n", "nh"], ["h", "kh", "th"],
];

/* Câu nói của bạn Cú – file: assets/audio/loi/<k>.mp3 */
const LOI_NOI = [
  { k:"intro-1", text:"Chào mừng bé đến Rừng chữ cái! Bé hãy lắng nghe thật kỹ rồi chọn đúng chữ cái nhé!" },
  { k:"intro-2", text:"Đây là Cầu ghép vần! Bé hãy kéo các chữ vào ô trống để ghép thành tiếng nhé!" },
  { k:"intro-3", text:"Ngôi nhà từ ngữ đây rồi! Bé hãy ghép các tiếng để tạo thành từ đúng với bức tranh nhé!" },
  { k:"intro-4", text:"Lâu đài đọc hiểu thật đẹp! Bé đọc câu, xem tranh rồi chọn câu trả lời đúng nhé!" },
  { k:"intro-5", text:"Wow, Kho báu tri thức! Bé sắp xếp các tiếng thành câu để mở rương báu nhé!" },
  { k:"hoc-bang", text:"Bé chạm vào từng ô để nghe đọc âm nhé!" },
  { k:"nghe-chon", text:"Bé nghe và chọn chữ đúng nhé!" },
  { k:"dung-1", text:"Đúng rồi! Bé giỏi quá!" },
  { k:"dung-2", text:"Chính xác! Tuyệt vời!" },
  { k:"dung-3", text:"Hoan hô! Bé làm đúng rồi!" },
  { k:"sai-1", text:"Chưa đúng rồi, bé nghe lại và thử lần nữa nhé!" },
  { k:"sai-2", text:"Không sao đâu, bé cố lên nhé!" },
  { k:"dap-an", text:"Đáp án đúng là chữ này nhé!" },
  { k:"xong-1", text:"Hoan hô! Bé đã hoàn thành Rừng chữ cái!" },
  { k:"chao-ban-do", text:"Chào bạn! Mình cùng khám phá Tiếng Việt Phiêu Lưu Ký nhé! Chọn một chặng để bắt đầu nào!" },
  { k:"chon-phan", text:"Bé chọn phần muốn luyện rồi nghe và chọn chữ đúng nhé!" },
  { k:"nghe-het", text:"Hoan hô! Bé đã nghe hết bảng âm rồi!" },
  { k:"co-gang", text:"Bé đã cố gắng lắm! Mình cùng ôn lại và chơi tiếp nhé!" },
  { k:"hoc-het", text:"Giỏi quá! Bé đã học hết bảng âm rồi!" },
];
