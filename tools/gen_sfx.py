"""
Tạo file âm thanh hiệu ứng (WAV) cho trò chơi – không cần thư viện ngoài.
  python tools/gen_sfx.py
Kết quả: assets/sfx/ok.wav, bad.wav, win.wav, pop.wav, flip.wav
"""
import math
import struct
import wave
from pathlib import Path

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "assets" / "sfx"


def bell(freq, dur, vol=0.5, decay=6.0):
    """Tiếng chuông trong trẻo: sóng sin + bồi âm, tắt dần."""
    n = int(SR * dur)
    out = []
    for i in range(n):
        t = i / SR
        env = math.exp(-decay * t) * min(1.0, t * 200)  # bắt đầu mềm
        s = (math.sin(2 * math.pi * freq * t)
             + 0.45 * math.sin(2 * math.pi * freq * 2 * t)
             + 0.2 * math.sin(2 * math.pi * freq * 3.01 * t))
        out.append(vol * env * s / 1.65)
    return out


def sweep(f0, f1, dur, vol=0.5):
    """Tiếng “bọp/boing” trượt tần số, mềm mại."""
    n = int(SR * dur)
    out, phase = [], 0.0
    for i in range(n):
        t = i / SR
        f = f0 * (f1 / f0) ** (t / dur)
        phase += 2 * math.pi * f / SR
        env = math.sin(math.pi * min(1.0, t / dur)) ** 0.6
        out.append(vol * env * (math.sin(phase) + 0.25 * math.sin(2 * phase)) / 1.25)
    return out


def mix(tracks, total):
    buf = [0.0] * int(SR * total)
    for start, samples in tracks:
        s0 = int(SR * start)
        for i, v in enumerate(samples):
            if s0 + i < len(buf):
                buf[s0 + i] += v
    peak = max(1e-9, max(abs(x) for x in buf))
    if peak > 0.95:
        buf = [x * 0.95 / peak for x in buf]
    return buf


def save(name, buf):
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, x)) * 32767)) for x in buf))
    print("  ✓", OUT / name)


# Đúng: ting–ting–ting đi lên (Đô–Mi–Sol–Đô)
save("ok.wav", mix([(0.00, bell(1046, .5, .5)), (0.08, bell(1318, .5, .5)),
                    (0.16, bell(1568, .6, .5)), (0.24, bell(2093, .8, .45))], 1.0))
# Sai: “bọp” trầm nhẹ đi xuống, không gây sợ
save("bad.wav", mix([(0.0, sweep(420, 210, .22, .55)), (0.2, sweep(300, 160, .28, .5))], 0.55))
# Hoàn thành: kèn chiến thắng
notes = [(0.00, 523), (0.14, 659), (0.28, 784), (0.42, 1046), (0.62, 784), (0.76, 1046)]
save("win.wav", mix([(t, bell(f, 1.2 if i == 5 else .45, .45, 3.5 if i == 5 else 6)) for i, (t, f) in enumerate(notes)]
                    + [(0.76, bell(1318, 1.2, .3, 3.5)), (0.76, bell(1568, 1.2, .25, 3.5))], 2.0))
# Pop: chạm nút
save("pop.wav", mix([(0, sweep(500, 900, .07, .5))], 0.09))
# Lật thẻ
save("flip.wav", mix([(0, bell(1760, .15, .35, 25))], 0.16))
