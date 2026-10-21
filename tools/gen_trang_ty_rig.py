"""Tạo các lớp hoạt ảnh cho Trạng Tý từ assets/img/trang-ty-full.png (660x920).
Lớp: body (không có bàn tay), wing (bàn tay vẫy), blink (mắt nhắm),
mouth-closed / mouth-half (khung nhép môi). Kết quả thu nhỏ 330x460.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

SRC = "assets/img/trang-ty-full.png"
OUT = "assets/img/"
TARGET = (330, 460)
SKIN = (253, 203, 170)
LINE = (92, 38, 28, 255)

full = Image.open(SRC).convert("RGBA")
W, H = full.size
arr = np.array(full).astype(float)


def soft_mask(poly, blur=1.5):
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    return np.array(m.filter(ImageFilter.GaussianBlur(blur))).astype(float) / 255.0


def skin_patch(ellipses, blur=1.6):
    """Mảng da màu đồng nhất, chỉ làm mờ alpha -> không có viền xám."""
    a = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(a)
    for box in ellipses:
        d.ellipse(box, fill=255)
    a = a.filter(ImageFilter.GaussianBlur(blur))
    img = Image.new("RGBA", (W, H), SKIN + (0,))
    img.putalpha(a)
    return img


def save(img, name):
    img.resize(TARGET, Image.LANCZOS).save(OUT + name)
    print("saved", name)


# ---------- Bàn tay vẫy (xoay quanh cổ tay ~ (111,323)) ----------
hand_poly = [(20, 224), (168, 224), (172, 292), (148, 318), (80, 352), (55, 330), (20, 300)]
cut_poly = [(20, 224), (168, 224), (172, 288), (142, 304), (84, 336), (55, 322), (20, 296)]
hand_m = soft_mask(hand_poly)
cut_m = soft_mask(cut_poly)
hand = arr.copy(); hand[:, :, 3] *= hand_m
body = arr.copy(); body[:, :, 3] *= (1 - cut_m)
hand_img = Image.fromarray(hand.clip(0, 255).astype(np.uint8), "RGBA")
body_img = Image.fromarray(body.clip(0, 255).astype(np.uint8), "RGBA")

# ---------- Mắt nhắm (cười híp ^ ^) ----------
eyes = [(280, 271, 32, 27), (408, 280, 31, 26)]
blink = skin_patch([[cx - rx, cy - ry, cx + rx, cy + ry] for cx, cy, rx, ry in eyes])
ld = ImageDraw.Draw(blink)
for cx, cy, rx, ry in eyes:
    ld.arc([cx - 25, cy - 8, cx + 25, cy + 30], start=200, end=340, fill=LINE, width=6)

# ---------- Khung miệng ----------
MX0, MY0, MX1, MY1 = 295, 312, 390, 371
mouth_box = [342 - 50, 341 - 30, 342 + 50, 341 + 30]

# Miệng khép: nụ cười cong + má lúm nhẹ
closed = skin_patch([mouth_box])
cd = ImageDraw.Draw(closed)
cd.arc([304, 296, 380, 346], start=22, end=158, fill=LINE, width=6)
cd.arc([296, 318, 312, 334], start=200, end=300, fill=LINE, width=4)
cd.arc([372, 318, 388, 334], start=240, end=340, fill=LINE, width=4)

# Miệng hé: thu nhỏ miệng gốc theo chiều dọc
half = skin_patch([mouth_box])
mouth = full.crop((MX0, MY0, MX1, MY1))
mh = mouth.resize((int((MX1 - MX0) * 0.92), int((MY1 - MY0) * 0.52)), Image.LANCZOS)
half.alpha_composite(mh, (MX0 + int((MX1 - MX0) * 0.04), MY0 + 2))

save(body_img, "mascot-body.png")
save(hand_img, "mascot-wing.png")
save(blink, "mascot-blink.png")
save(closed, "mascot-mouth-closed.png")
save(half, "mascot-mouth-half.png")
save(full, "mascot.png")
