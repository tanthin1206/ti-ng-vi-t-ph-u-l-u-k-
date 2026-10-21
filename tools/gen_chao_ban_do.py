import asyncio
import edge_tts

TEXT = "Chào bạn! Mình cùng khám phá Tiếng Việt Phiêu Lưu Ký nhé! Chọn một chặng để bắt đầu nào!"
VOICES = {"nu": ("vi-VN-HoaiMyNeural", "+8Hz"), "nam": ("vi-VN-NamMinhNeural", "+0Hz")}


async def main():
    for g, (voice, pitch) in VOICES.items():
        out = f"assets/audio/{g}/loi/chao-ban-do.mp3"
        await edge_tts.Communicate(TEXT, voice, rate="-5%", pitch=pitch).save(out)
        print("ok", out)

asyncio.run(main())
