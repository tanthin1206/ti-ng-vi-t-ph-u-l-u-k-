/* =========================================================
   ĐỌC HIỂU – Chặng 4 "Lâu đài đọc hiểu"
   Bám theo tiến trình âm – vần của Tiếng Việt 1 (Kết nối tri thức).
   • p01 lấy đúng đoạn đọc của bài “ua, ưa” trong sách.
   • Các bài còn lại là đoạn đọc ngắn soạn theo vần của bài học tương ứng;
     cô có thể thay bằng đúng đoạn trong sách (giữ nguyên cấu trúc mỗi dòng).
   Trường dữ liệu:
     k     : mã (ảnh assets/img/s4/<k>.jpg, âm thanh assets/audio/<nu|nam>/doc|hoi/<k>.mp3)
     bai   : bài học (vần) trong sách
     doan  : đoạn văn
     hoi   : câu hỏi
     dung  : đáp án đúng ;  sai : 2 đáp án sai
     chung : cụm từ trong đoạn văn chứa câu trả lời (được tô sáng sau khi trả lời)
   ⚠ Mỗi mục giữ trên 1 dòng – tools/gen_audio.py đọc file này.
   ========================================================= */
const DOC_HIEU = [
  { k:"p01", bai:"ua, ưa",   doan:"Mẹ đi chợ mua cá, mua cua. Mẹ mua cả sữa chua, dưa lê.", hoi:"Mẹ đi chợ mua gì?", dung:"mua cá, cua, sữa chua, dưa lê", sai:["mua táo", "mua lê"], chung:"mua cá, mua cua. Mẹ mua cả sữa chua, dưa lê" },
  { k:"p02", bai:"ia",       doan:"Chị Kha tỉa lá cây. Bé Lê chia kẹo cho bà.", hoi:"Bé Lê chia kẹo cho ai?", dung:"cho bà", sai:["cho mẹ", "cho bố"], chung:"chia kẹo cho bà" },
  { k:"p03", bai:"ao, eo",   doan:"Mèo con trèo lên cây cao. Chú chim sáo hót véo von.", hoi:"Mèo con trèo lên đâu?", dung:"lên cây cao", sai:["lên mái nhà", "lên ghế"], chung:"trèo lên cây cao" },
  { k:"p04", bai:"ai, ay",   doan:"Bé chạy ra đón bà. Bà cho bé nải chuối và chùm vải.", hoi:"Bà cho bé những gì?", dung:"nải chuối và chùm vải", sai:["cam và táo", "bánh và kẹo"], chung:"nải chuối và chùm vải" },
  { k:"p05", bai:"an, ăn",   doan:"Bố dẫn Lan ra bờ sông. Lan ngắm đàn cá bơi lăn tăn.", hoi:"Bố dẫn Lan đi đâu?", dung:"ra bờ sông", sai:["ra chợ", "ra vườn"], chung:"ra bờ sông" },
  { k:"p06", bai:"ôi, ơi",   doan:"Trời nắng. Ông ngồi nghỉ ở gốc cây. Bé đem nước mời ông.", hoi:"Bé đem gì mời ông?", dung:"nước", sai:["bánh", "quả ổi"], chung:"đem nước mời ông" },
  { k:"p07", bai:"ong, ông", doan:"Cả nhà đi chơi công viên. Bé chơi cầu trượt, còn anh chơi bóng.", hoi:"Anh chơi gì?", dung:"chơi bóng", sai:["chơi cầu trượt", "thả diều"], chung:"anh chơi bóng" },
  { k:"p08", bai:"ung, ưng", doan:"Trung thu, bé rước đèn ông sao. Mẹ mua bánh nướng cho cả nhà.", hoi:"Trung thu, bé rước đèn gì?", dung:"đèn ông sao", sai:["đèn kéo quân", "đèn pin"], chung:"rước đèn ông sao" },
  { k:"p09", bai:"uôi, ươi", doan:"Buổi sáng, bé tưới cây cùng mẹ. Cây bưởi trong vườn đã ra quả.", hoi:"Bé tưới cây cùng ai?", dung:"cùng mẹ", sai:["cùng bố", "cùng bà"], chung:"tưới cây cùng mẹ" },
  { k:"p10", bai:"ăm, âm",   doan:"Chủ nhật, cả nhà về thăm bà. Bà nấu nồi chè thơm cho cả nhà.", hoi:"Chủ nhật, cả nhà đi đâu?", dung:"về thăm bà", sai:["đi biển", "đi sở thú"], chung:"về thăm bà" },
  { k:"p11", bai:"at, ăt",   doan:"Hà và Nam hát bài hát về mẹ. Cô giáo khen hai bạn hát hay.", hoi:"Cô giáo khen hai bạn thế nào?", dung:"hát hay", sai:["vẽ đẹp", "chạy nhanh"], chung:"khen hai bạn hát hay" },
  { k:"p12", bai:"ươn, ương",doan:"Vườn nhà bà có nhiều hoa. Bướm vàng bay lượn trên vườn hoa.", hoi:"Con gì bay lượn trên vườn hoa?", dung:"bướm vàng", sai:["chim sẻ", "con ong"], chung:"Bướm vàng bay lượn" },
];
