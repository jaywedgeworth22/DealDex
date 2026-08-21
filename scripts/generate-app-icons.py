#!/usr/bin/env python3
"""Build iOS / Android / web launcher slots from the isolated DD mark.

The live 1024 AppIcon is the interlocking DD on a Socratic.Trade-style tiled
field (soft top-left light, recessed grout, no candlesticks).  Favicons stay
the isolated DD on a transparent field so Safari does not fall back to a
letter tile.

Source of truth: native/brand/dealdex-dd-isolated.png
Run from the repo root:  python3 scripts/generate-app-icons.py
Requires Pillow and numpy (dev-only; generated PNGs are committed).
"""

from __future__ import annotations

import base64
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
MARK_SOURCE = ROOT / "native/brand/dealdex-dd-isolated.png"
ICON_SOURCE = ROOT / "native/brand/dealdex-dd-icon-1024.png"

IOS_ICONSET = ROOT / "native/ios/DealDex/Assets.xcassets/AppIcon.appiconset"
ANDROID_RES = ROOT / "native/android/app/src/main/res"
WEB_ICON_180 = ROOT / "public/__grok/icon-180.png"
FAVICON_SVG = ROOT / "public/favicon.svg"
FAVICON_PNG = ROOT / "public/favicon.png"
FAVICON_16 = ROOT / "public/favicon-16.png"
FAVICON_32 = ROOT / "public/favicon-32.png"
FAVICON_ICO = ROOT / "public/favicon.ico"

SIZE = 1024

# Lighting sampled from the four corners of Jay's ST iOS icon (no candlesticks).
ST_TL = (254, 254, 254)
ST_TR = (233, 236, 243)
ST_BL = (227, 229, 234)
ST_BR = (223, 226, 232)

# (filename, pixel size) — modern iPhone + iPad + marketing set.
IOS_SIZES: list[tuple[str, int]] = [
    ("Icon-20.png", 20),
    ("Icon-20@2x.png", 40),
    ("Icon-20@3x.png", 60),
    ("Icon-29.png", 29),
    ("Icon-29@2x.png", 58),
    ("Icon-29@3x.png", 87),
    ("Icon-40.png", 40),
    ("Icon-40@2x.png", 80),
    ("Icon-40@3x.png", 120),
    ("Icon-60@2x.png", 120),
    ("Icon-60@3x.png", 180),
    ("Icon-76.png", 76),
    ("Icon-76@2x.png", 152),
    ("Icon-83.5@2x.png", 167),
    ("Icon-1024.png", 1024),
]

ANDROID_MIPMAP = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# Adaptive foreground is 108dp; xxxhdpi = 432px.
FOREGROUND_PX = 432

# DD scale vs the 1024 canvas.  Padding matches the ST home-screen icon.
MARK_SCALE = 0.78


def st_background(size: int = SIZE, tile: int = 32, grout: int = 2) -> Image.Image:
    """Reconstruct the ST tiled field from corner lighting.  No candlesticks."""
    last = size - 1
    ys, xs = np.mgrid[0:size, 0:size]
    tx = xs / last
    ty = ys / last
    tl = np.array(ST_TL, dtype=np.float64)
    tr = np.array(ST_TR, dtype=np.float64)
    bl = np.array(ST_BL, dtype=np.float64)
    br = np.array(ST_BR, dtype=np.float64)
    top = tl + (tr - tl) * tx[..., None]
    bot = bl + (br - bl) * tx[..., None]
    base = top + (bot - top) * ty[..., None]
    lx = xs % tile
    ly = ys % tile
    grout_mask = (lx < grout) | (ly < grout)
    shade = 0.965 - 0.035 * ty
    bevel = 1.0 + 0.018 * (1 - ly / tile) + 0.012 * (1 - lx / tile)
    scale = np.where(grout_mask, shade, bevel)[..., None]
    rgb = np.clip(base * scale, 0, 255).astype(np.uint8)
    return Image.fromarray(rgb, mode="RGB")


def alpha_crop(im: Image.Image, pad: int = 0, threshold: int = 8) -> Image.Image:
    rgba = im.convert("RGBA")
    mask = rgba.getchannel("A").point(lambda p: 255 if p > threshold else 0)
    bbox = mask.getbbox()
    if bbox is None:
        return rgba
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(rgba.width, x1 + pad)
    y1 = min(rgba.height, y1 + pad)
    return rgba.crop((x0, y0, x1, y1))


def fit_mark(mark: Image.Image, box: int) -> Image.Image:
    w, h = mark.size
    scale = min(box / w, box / h)
    nw = max(1, int(w * scale))
    nh = max(1, int(h * scale))
    return mark.resize((nw, nh), Image.Resampling.LANCZOS)


def oval_shadow(size: int, box: tuple[int, int, int, int]) -> Image.Image:
    x0, y0, x1, y1 = box
    cx = (x0 + x1) / 2
    cy = y1 - 4
    rw = max(8, (x1 - x0) * 0.40)
    rh = 36
    pad = 96
    bw = int(rw * 2) + pad * 2
    bh = int(rh * 2) + pad * 2
    blob = Image.new("L", (bw, bh), 0)
    draw = ImageDraw.Draw(blob)
    draw.ellipse((pad, pad, pad + int(rw * 2), pad + int(rh * 2)), fill=140)
    blob = blob.filter(ImageFilter.GaussianBlur(radius=26))
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = int(cx - bw / 2)
    oy = int(cy - bh / 2) + 16
    colored = Image.merge(
        "RGBA",
        (
            Image.new("L", blob.size, 0),
            Image.new("L", blob.size, 0),
            Image.new("L", blob.size, 0),
            blob,
        ),
    )
    layer.paste(colored, (ox, oy), colored)
    return layer


def compose_app_icon(mark: Image.Image, size: int = SIZE) -> Image.Image:
    bg = st_background(size).convert("RGBA")
    cropped = alpha_crop(mark, pad=2)
    inner = max(1, int(size * MARK_SCALE))
    fitted = fit_mark(cropped, inner)
    ox = (size - fitted.width) // 2
    oy = (size - fitted.height) // 2 - 6
    canvas = Image.alpha_composite(bg, oval_shadow(size, (ox, oy, ox + fitted.width, oy + fitted.height)))
    canvas.alpha_composite(fitted, (ox, oy))
    return canvas.convert("RGB")


def resize_square(src: Image.Image, size: int) -> Image.Image:
    return src.resize((size, size), Image.Resampling.LANCZOS)


def save_png(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb = im.convert("RGB")
    rgb.save(path, format="PNG", optimize=True)


def save_png_rgba(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rgba = im.convert("RGBA")
    rgba.save(path, format="PNG", optimize=True)


def favicon_mark(mark: Image.Image, size: int, margin_frac: float = 0.08) -> Image.Image:
    cropped = alpha_crop(mark, pad=2)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    inner = max(1, int(size * (1 - 2 * margin_frac)))
    fitted = fit_mark(cropped, inner)
    ox = (size - fitted.width) // 2
    oy = (size - fitted.height) // 2
    canvas.alpha_composite(fitted, (ox, oy))
    return canvas


def adaptive_foreground(icon: Image.Image) -> Image.Image:
    """Full ST-grid + DD icon.  Adaptive mask crops the outer 18%."""
    return resize_square(icon, FOREGROUND_PX).convert("RGBA")


def write_favicon_svg(mark: Image.Image) -> None:
    thumb = favicon_mark(mark, 64)
    buf = BytesIO()
    thumb.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n'
        f'  <image href="data:image/png;base64,{b64}" width="64" height="64"/>\n'
        "</svg>\n"
    )
    FAVICON_SVG.write_text(svg, encoding="utf-8")


def write_favicons(mark: Image.Image) -> None:
    png32 = favicon_mark(mark, 32)
    png16 = favicon_mark(mark, 16)
    save_png_rgba(png32, FAVICON_PNG)
    save_png_rgba(png32, FAVICON_32)
    save_png_rgba(png16, FAVICON_16)
    write_favicon_svg(mark)
    FAVICON_ICO.parent.mkdir(parents=True, exist_ok=True)
    png32.save(FAVICON_ICO, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])


def write_contents_json() -> None:
    # Explicit slots so TestFlight sees 60@2x (120) and 76@2x (152) in the catalog.
    entries = [
        ("20x20", "iphone", "Icon-20@2x.png", "2x"),
        ("20x20", "iphone", "Icon-20@3x.png", "3x"),
        ("29x29", "iphone", "Icon-29@2x.png", "2x"),
        ("29x29", "iphone", "Icon-29@3x.png", "3x"),
        ("40x40", "iphone", "Icon-40@2x.png", "2x"),
        ("40x40", "iphone", "Icon-40@3x.png", "3x"),
        ("60x60", "iphone", "Icon-60@2x.png", "2x"),
        ("60x60", "iphone", "Icon-60@3x.png", "3x"),
        ("20x20", "ipad", "Icon-20.png", "1x"),
        ("20x20", "ipad", "Icon-20@2x.png", "2x"),
        ("29x29", "ipad", "Icon-29.png", "1x"),
        ("29x29", "ipad", "Icon-29@2x.png", "2x"),
        ("40x40", "ipad", "Icon-40.png", "1x"),
        ("40x40", "ipad", "Icon-40@2x.png", "2x"),
        ("76x76", "ipad", "Icon-76.png", "1x"),
        ("76x76", "ipad", "Icon-76@2x.png", "2x"),
        ("83.5x83.5", "ipad", "Icon-83.5@2x.png", "2x"),
        ("1024x1024", "ios-marketing", "Icon-1024.png", "1x"),
    ]
    lines = ['{\n  "images" : [\n']
    chunks = []
    for size, idiom, filename, scale in entries:
        chunks.append(
            "    {\n"
            f'      "filename" : "{filename}",\n'
            f'      "idiom" : "{idiom}",\n'
            f'      "scale" : "{scale}",\n'
            f'      "size" : "{size}"\n'
            "    }"
        )
    lines.append(",\n".join(chunks))
    lines.append(
        "\n  ],\n"
        '  "info" : {\n'
        '    "author" : "xcode",\n'
        '    "version" : 1\n'
        "  }\n"
        "}\n"
    )
    (IOS_ICONSET / "Contents.json").write_text("".join(lines), encoding="utf-8")


def write_catalog_root() -> None:
    catalog = ROOT / "native/ios/DealDex/Assets.xcassets/Contents.json"
    catalog.parent.mkdir(parents=True, exist_ok=True)
    catalog.write_text(
        '{\n  "info" : {\n    "author" : "xcode",\n    "version" : 1\n  }\n}\n',
        encoding="utf-8",
    )


def main() -> None:
    if not MARK_SOURCE.is_file():
        raise SystemExit(f"missing isolated mark: {MARK_SOURCE}")
    mark = Image.open(MARK_SOURCE).convert("RGBA")
    icon = compose_app_icon(mark, SIZE)
    ICON_SOURCE.parent.mkdir(parents=True, exist_ok=True)
    save_png(icon, ICON_SOURCE)

    write_catalog_root()
    IOS_ICONSET.mkdir(parents=True, exist_ok=True)
    for name, size in IOS_SIZES:
        save_png(resize_square(icon, size), IOS_ICONSET / name)
    write_contents_json()

    for folder, size in ANDROID_MIPMAP.items():
        slot = resize_square(icon, size)
        save_png(slot, ANDROID_RES / folder / "ic_launcher.png")
        save_png(slot, ANDROID_RES / folder / "ic_launcher_round.png")

    save_png_rgba(adaptive_foreground(icon), ANDROID_RES / "drawable" / "ic_launcher_foreground.png")
    save_png(resize_square(icon, 180), WEB_ICON_180)
    write_favicons(mark)
    print("wrote ST-grid AppIcon, Android mipmaps, PWA 180, transparent favicon PNG/ICO")


if __name__ == "__main__":
    main()
