import asyncio
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "audio"

VOICES = {
    "nu": ("vi-VN-HoaiMyNeural", "+8Hz"),
    "nam": ("vi-VN-NamMinhNeural", "+0Hz")
}

SPEECHES = {
    "stage-intro-1": (
        "Xin chào! Xin chào các nhà thám hiểm nhí! "
        "Mình là Trạng Tý – người bạn đồng hành của các bạn trong chuyến phiêu lưu kỳ thú hôm nay! "
        "Các bạn có biết không? Một thế giới Tiếng Việt đầy phép màu đang chờ chúng mình khám phá đấy! "
        "Ở đó có những chữ cái tinh nghịch, những cây cầu ghép vần bí ẩn, những ngôi nhà từ ngữ đáng yêu và cả một kho báu đang chờ được mở ra! "
        "Nhưng để chinh phục kho báu ấy, chúng mình phải vượt qua 5 chặng thử thách! "
        "Mỗi chặng có 10 câu hỏi, mỗi câu trả lời đúng sẽ mang về 10 điểm! "
        "Hãy cố gắng tích lũy thật nhiều điểm để giành những huy hiệu Đồng, Bạc và Vàng lấp lánh nhé! "
        "Các nhà thám hiểm nhí đã sẵn sàng chưa nào? "
        "Ba… hai… một… "
        "TIẾNG VIỆT PHIÊU LƯU KÝ… BẮT ĐẦU! "
        "Nào! Cùng Tý lên đường thôi!"
    ),
    "stage-intro-2": (
        "Wow! Các bạn giỏi quá! Chặng đầu tiên đã chinh phục thành công! "
        "Phía trước là Cầu Ghép Vần kỳ diệu! Ghép đúng một tiếng, cây cầu sẽ sáng lên! "
        "Nào, cùng Trạng Tý vượt cầu thôi!"
    ),
    "stage-intro-3": (
        "Hoan hô! Chúng mình đã vượt cầu thành công! "
        "Ô kìa! Những từ ngữ đáng yêu đang chờ được khám phá! "
        "Nhanh mắt, nhanh trí! Cùng Trạng Tý mở cửa Ngôi Nhà Từ Ngữ nào!"
    ),
    "stage-intro-4": (
        "Xuất sắc! Các nhà thám hiểm nhí thật tài giỏi! "
        "Một lâu đài bí ẩn đã xuất hiện! Muốn mở cánh cửa thần kỳ, chúng mình phải đọc thật hay, hiểu thật đúng! "
        "Sẵn sàng chưa? Tiến vào lâu đài thôi!"
    ),
    "stage-intro-5": (
        "Ố là la! Chặng cuối cùng đến rồi! "
        "Kho báu tri thức đang ở ngay trước mắt! Chỉ còn mười câu hỏi nữa thôi! "
        "Tập trung hết sức, thể hiện tài năng và rinh huy hiệu vàng nào! "
        "TRẠNG TÝ TIN CÁC BẠN SẼ LÀM ĐƯỢC!"
    )
}

async def make(path, text, voice, pitch):
    path.parent.mkdir(parents=True, exist_ok=True)
    c = edge_tts.Communicate(text, voice, pitch=pitch, rate="-5%")
    await c.save(str(path))
    print(f"Generated: {path.name} ({voice})")

async def main():
    for gender, (voice, pitch) in VOICES.items():
        for key, text in SPEECHES.items():
            p = OUT / gender / "loi" / f"{key}.mp3"
            await make(p, text, voice, pitch)

if __name__ == "__main__":
    asyncio.run(main())
