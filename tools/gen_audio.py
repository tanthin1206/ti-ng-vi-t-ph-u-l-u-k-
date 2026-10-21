"""
Tạo file âm thanh MP3 tiếng Việt cho trò chơi bằng edge-tts.
  pip install -U edge-tts
  python tools/gen_audio.py                 # giọng nữ (mặc định), chỉ tạo file còn thiếu
  python tools/gen_audio.py --gender nam    # giọng nam
  python tools/gen_audio.py --gender all    # cả hai
  python tools/gen_audio.py --force         # tạo lại tất cả

Kết quả: assets/audio/<nu|nam>/<am|tu|loi>/<k>.mp3
Đọc dữ liệu từ js/data/bang-am.js.
Muốn dùng giọng thu âm của mình: bật “Âm thanh của tôi” trong Cài đặt của trò chơi,
hoặc chép file mp3 cùng tên vào assets/audio/rieng/<am|tu|loi>/.
"""
import argparse
import asyncio
import re
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "js" / "data" / "bang-am.js"
OUT = ROOT / "assets" / "audio"
VOICES = {"nu": ("vi-VN-HoaiMyNeural", "+8Hz"), "nam": ("vi-VN-NamMinhNeural", "+0Hz")}


def parse(gender):
    src = DATA.read_text(encoding="utf-8")
    am = re.findall(r'k:"([^"]+)",\s*c:"[^"]+",\s*doc:"([^"]+)",\s*tu:"([^"]+)"', src)
    loi = re.findall(r'k:"([^"]+)",\s*text:"([^"]+)"', src)
    base = OUT / gender
    jobs = []
    for k, doc, tu in am:
        jobs.append((base / "am" / f"{k}.mp3", doc, "-15%"))
        jobs.append((base / "tu" / f"{k}.mp3", tu, "-15%"))
    for k, text in loi:
        jobs.append((base / "loi" / f"{k}.mp3", text, "-5%"))
    ghep_file = ROOT / "js" / "data" / "tu-ghep.js"
    if ghep_file.exists():
        for w, tu in re.findall(r'w:"([^"]+)",\s*tu:"([^"]+)"', ghep_file.read_text(encoding="utf-8")):
            jobs.append((base / "ghep" / f"{w}.mp3", tu, "-15%"))
    dh_file = ROOT / "js" / "data" / "doc-hieu.js"
    if dh_file.exists():
        for k, doan, hoi in re.findall(r'k:"([^"]+)",\s*bai:"[^"]*",\s*doan:"([^"]+)",\s*hoi:"([^"]+)"', dh_file.read_text(encoding="utf-8")):
            jobs.append((base / "doc" / f"{k}.mp3", doan, "-20%"))
            jobs.append((base / "hoi" / f"{k}.mp3", hoi, "-10%"))
    tn_file = ROOT / "js" / "data" / "tu-ngu.js"
    if tn_file.exists():
        for k, a, b in re.findall(r'k:"([^"]+)",\s*bai:"[^"]*",\s*a:"([^"]+)",\s*b:"([^"]+)"', tn_file.read_text(encoding="utf-8")):
            jobs.append((base / "tu3" / f"{k}.mp3", f"{a} {b}", "-15%"))
    cs_file = ROOT / "js" / "data" / "cau-sap-xep.js"
    if cs_file.exists():
        for k, cau in re.findall(r'k:"([^"]+)",\s*bai:"[^"]*",\s*cau:"([^"]+)"', cs_file.read_text(encoding="utf-8")):
            jobs.append((base / "cau" / f"{k}.mp3", cau, "-20%"))
    return jobs


async def make(path, text, rate, voice, pitch, sem):
    async with sem:
        path.parent.mkdir(parents=True, exist_ok=True)
        for attempt in range(5):
            try:
                comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
                await asyncio.wait_for(comm.save(str(path)), timeout=15)
                if path.exists() and path.stat().st_size > 500:
                    print(f"  ✓ {path.relative_to(ROOT)}  «{text}»", flush=True)
                    return True
                path.unlink(missing_ok=True)
            except Exception as e:  # mạng / máy chủ chập chờn -> thử lại
                path.unlink(missing_ok=True)
                if attempt == 4:
                    print(f"  ✗ {path.name}: {str(e)[:80]}", file=sys.stderr, flush=True)
            await asyncio.sleep(1.5 + attempt * 1.5)
        return False


async def run(gender, force):
    voice, pitch = VOICES[gender]
    for pass_no in range(1, 5):
        jobs = [j for j in parse(gender) if force or not (j[0].exists() and j[0].stat().st_size > 500)]
        force = False
        if not jobs:
            print(f"[{gender}] Hoàn tất 100%!", flush=True)
            return
        print(f"[{gender}] Lượt {pass_no}: Tạo {len(jobs)} file với giọng {voice} ...", flush=True)
        sem = asyncio.Semaphore(4)
        res = await asyncio.gather(*(make(p, t, r, voice, pitch, sem) for p, t, r in jobs))
        fail = res.count(False)
        if not fail:
            print(f"[{gender}] Hoàn tất 100%!", flush=True)
            return
        print(f"[{gender}] Còn {fail} file lỗi, thử lại...", flush=True)
        await asyncio.sleep(2)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gender", choices=["nu", "nam", "all"], default="nu")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    for g in (["nu", "nam"] if a.gender == "all" else [a.gender]):
        await run(g, a.force)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    asyncio.run(main())
