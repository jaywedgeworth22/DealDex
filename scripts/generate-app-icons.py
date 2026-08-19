#!/usr/bin/env python3
"""Resize the official DealDex DD mark into iOS / Android / web launcher slots.

Source of truth: native/brand/dealdex-dd-icon-1024.png
Run from the repo root:  python3 scripts/generate-app-icons.py
Requires Pillow (dev-only; generated PNGs are committed).
"""

from __future__ import annotations

import base64
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "native/brand/dealdex-dd-icon-1024.png"

IOS_ICONSET = ROOT / "native/ios/DealDex/Assets.xcassets/AppIcon.appiconset"
ANDROID_RES = ROOT / "native/android/app/src/main/res"
WEB_ICON_180 = ROOT / "public/__grok/icon-180.png"
FAVICON_SVG = ROOT / "public/favicon.svg"

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

# Adaptive foreground is 108dp; xxxhdpi = 432px. Keep the DD in the 66% safe zone.
FOREGROUND_PX = 432
SAFE_FRACTION = 0.66


def resize_square(src: Image.Image, size: int) -> Image.Image:
    return src.resize((size, size), Image.Resampling.LANCZOS)


def save_png(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb = im.convert("RGB")
    rgb.save(path, format="PNG", optimize=True)


def adaptive_foreground(src: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", (FOREGROUND_PX, FOREGROUND_PX), (255, 255, 255, 255))
    inner = max(1, int(FOREGROUND_PX * SAFE_FRACTION))
    mark = resize_square(src, inner).convert("RGBA")
    origin = (FOREGROUND_PX - inner) // 2
    canvas.paste(mark, (origin, origin), mark)
    return canvas


def write_favicon_svg(src: Image.Image) -> None:
    thumb = resize_square(src, 128).convert("RGB")
    buf = BytesIO()
    thumb.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">\n'
        f'  <image href="data:image/png;base64,{b64}" width="128" height="128"/>\n'
        "</svg>\n"
    )
    FAVICON_SVG.write_text(svg, encoding="utf-8")


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
    lines = ['{\n  "images" : [']
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
        "  ],\n"
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
    if not SOURCE.is_file():
        raise SystemExit(f"missing source icon: {SOURCE}")
    src = Image.open(SOURCE).convert("RGB")
    if src.size != (1024, 1024):
        src = resize_square(src, 1024)

    write_catalog_root()
    IOS_ICONSET.mkdir(parents=True, exist_ok=True)
    for name, size in IOS_SIZES:
        save_png(resize_square(src, size), IOS_ICONSET / name)
    write_contents_json()

    for folder, size in ANDROID_MIPMAP.items():
        icon = resize_square(src, size)
        save_png(icon, ANDROID_RES / folder / "ic_launcher.png")
        save_png(icon, ANDROID_RES / folder / "ic_launcher_round.png")

    save_png(adaptive_foreground(src), ANDROID_RES / "drawable" / "ic_launcher_foreground.png")
    save_png(resize_square(src, 180), WEB_ICON_180)
    write_favicon_svg(src)
    print("wrote iOS AppIcon, Android mipmaps, PWA 180, favicon.svg")


if __name__ == "__main__":
    main()
