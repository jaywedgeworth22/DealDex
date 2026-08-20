#!/usr/bin/env python3
"""Turn SVG path `d` strings into SwiftUI Path builder code."""

from __future__ import annotations

import math
import re

TOKEN = re.compile(r"[MmLlHhVvCcSsZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?")


def tokens(d: str) -> list[str]:
    return TOKEN.findall(d.replace(",", " "))


def nums(seq: list[str], i: int, n: int) -> tuple[list[float], int]:
    out: list[float] = []
    while len(out) < n and i < len(seq):
        out.append(float(seq[i]))
        i += 1
    return out, i


def to_swift(d: str, ident: str) -> str:
    ts = tokens(d)
    i = 0
    cmd = "M"
    cx = cy = 0.0
    sx = sy = 0.0
    last_c2: tuple[float, float] | None = None
    lines: list[str] = [f"    static func {ident}() -> Path {{", "        var p = Path()"]
    while i < len(ts):
        t = ts[i]
        if t.isalpha():
            cmd = t
            i += 1
            if cmd in "Zz":
                lines.append("        p.closeSubpath()")
                cx, cy = sx, sy
                last_c2 = None
                continue
        rel = cmd.islower()
        op = cmd.upper()
        if op == "M":
            (x, y), i = nums(ts, i, 2)
            if rel:
                x += cx
                y += cy
            cx, cy = x, y
            sx, sy = x, y
            lines.append(f"        p.move(to: CGPoint(x: {x:.3f}, y: {y:.3f}))")
            last_c2 = None
            cmd = "l" if rel else "L"
        elif op == "L":
            (x, y), i = nums(ts, i, 2)
            if rel:
                x += cx
                y += cy
            cx, cy = x, y
            lines.append(f"        p.addLine(to: CGPoint(x: {x:.3f}, y: {y:.3f}))")
            last_c2 = None
        elif op == "H":
            (x,), i = nums(ts, i, 1)
            if rel:
                x += cx
            cx = x
            lines.append(f"        p.addLine(to: CGPoint(x: {cx:.3f}, y: {cy:.3f}))")
            last_c2 = None
        elif op == "V":
            (y,), i = nums(ts, i, 1)
            if rel:
                y += cy
            cy = y
            lines.append(f"        p.addLine(to: CGPoint(x: {cx:.3f}, y: {cy:.3f}))")
            last_c2 = None
        elif op == "C":
            (x1, y1, x2, y2, x, y), i = nums(ts, i, 6)
            if rel:
                x1 += cx
                y1 += cy
                x2 += cx
                y2 += cy
                x += cx
                y += cy
            lines.append(
                "        p.addCurve(to: CGPoint(x: {x:.3f}, y: {y:.3f}), "
                "control1: CGPoint(x: {x1:.3f}, y: {y1:.3f}), "
                "control2: CGPoint(x: {x2:.3f}, y: {y2:.3f}))".format(
                    x=x, y=y, x1=x1, y1=y1, x2=x2, y2=y2
                )
            )
            last_c2 = (x2, y2)
            cx, cy = x, y
        elif op == "S":
            (x2, y2, x, y), i = nums(ts, i, 4)
            if rel:
                x2 += cx
                y2 += cy
                x += cx
                y += cy
            if last_c2:
                x1 = 2 * cx - last_c2[0]
                y1 = 2 * cy - last_c2[1]
            else:
                x1, y1 = cx, cy
            lines.append(
                "        p.addCurve(to: CGPoint(x: {x:.3f}, y: {y:.3f}), "
                "control1: CGPoint(x: {x1:.3f}, y: {y1:.3f}), "
                "control2: CGPoint(x: {x2:.3f}, y: {y2:.3f}))".format(
                    x=x, y=y, x1=x1, y1=y1, x2=x2, y2=y2
                )
            )
            last_c2 = (x2, y2)
            cx, cy = x, y
        else:
            raise SystemExit(f"unsupported command {cmd!r} at {i}")
    lines.append("        return p")
    lines.append("    }")
    return "\n".join(lines)


EBAY = [
    (
        "ebayEBowl",
        "M199.636 185.866c-1.944-46.877-35.78-64.42-71.941-64.42-38.994 0-70.127 19.733-75.58 64.42z",
    ),
    (
        "ebayEBody",
        "M51.034 219.191c2.704 45.484 34.07 72.384 77.198 72.384 29.88 0 56.46-12.175 65.359-38.66h51.684c-10.052 53.74-67.154 71.98-116.303 71.98C39.606 324.895 0 275.679 0 209.307 0 136.242 40.966 88.122 129.788 88.122c70.699 0 122.5 36.999 122.5 117.756v13.313z",
    ),
    (
        "ebayBBowl",
        "M380.832 290.624c46.572 0 78.441-33.522 78.441-84.109 0-50.582-31.869-84.108-78.441-84.108-46.311 0-78.444 33.526-78.444 84.108 0 50.587 32.133 84.109 78.444 84.109z",
    ),
    (
        "ebayBStem",
        "M252.285 0h50.103v125.877c24.557-29.26 58.389-37.755 91.69-37.755 55.835 0 117.851 37.677 117.851 119.029 0 68.122-49.322 117.745-118.781 117.745-36.357 0-70.581-13.043-91.687-38.883 0 10.321-.576 20.724-1.705 30.564h-49.172c.855-15.909 1.706-35.718 1.706-51.747z",
    ),
    (
        "ebayALeft",
        "M633.078 212.533c-45.439 1.489-73.671 9.689-73.671 39.619 0 19.376 15.447 40.382 54.663 40.382 52.577 0 80.643-28.659 80.643-75.663v-5.17c-18.433 0-41.164.161-61.637.833z",
    ),
    (
        "ebayABody",
        "M744.829 274.636c0 14.583.422 28.978 1.694 41.941h-46.614c-1.243-10.674-1.697-21.28-1.697-31.567-25.202 30.98-55.177 39.886-96.762 39.886-61.676 0-94.7-32.6-94.7-70.307 0-54.612 44.916-73.867 122.89-75.654 21.323-.487 45.274-.559 65.075-.559v-5.336c0-36.561-23.444-51.593-64.068-51.593-30.158 0-52.386 12.48-54.676 34.047h-52.652c5.572-53.772 62.067-67.371 111.74-67.371 59.509 0 109.773 21.173 109.773 84.115z",
    ),
    (
        "ebayY",
        "m1000 96.457-154.945 304.294h-56.106l44.547-84.495L716.89 96.457h58.627l85.805 171.731 85.563-171.731z",
    ),
]

# The website a-body path starts at M744.829 implicitly via the zm join.
# The original is: zm111.751 62.103c0 14.583... relative to previous close.
# Hand-split so Swift can fill e/b/a/y in official colors.

MERCARI = [
    ("mercariM", "M17.2 33.3 26.6 15.2h7.5v33.5h-7.4V29.5h-.1l-7.2 12.9h-4.8L7.5 29.5H7.4v19.1H0V15.1h7.5l9.5 18.2h.2z"),
    ("mercariE", "M72 54.5v-6.9H54.7v-6.4h16.5v-6.8H54.7v-6.7H72V21H47.3v33.5H72z"),
    ("mercariR1", "M107.6 18.1c2.4 2 3.6 4.7 3.6 8.1.1 4.4-2.4 8.5-6.4 10.4l7.4 12.1h-8.4L97.4 38h-5.3v10.6h-7.4V15.1h13.8c3.7 0 6.8 1 9.1 3zM97.3 22h-5.2v9.2h5.2c4.5 0 6.7-1.6 6.7-4.7 0-3.1-2.2-4.5-6.7-4.5z"),
    ("mercariC", "M147.4 43.5c-2.2 3-5.2 4.6-8.8 4.6-2.6.1-5.2-.9-7.1-2.8-1.9-1.9-2.9-4.4-2.9-7.6s1-5.7 2.9-7.5c1.8-1.8 4.2-2.8 6.7-2.8 3.4-.1 6.6 1.6 8.6 4.4l.1.2 5-5.1-.1-.1c-3.4-4.2-7.8-6.3-13.3-6.3-5 0-9.2 1.6-12.5 4.8-3.3 3.2-5 7.4-5 12.6 0 5.1 1.7 9.3 5 12.5 3.3 3.1 7.6 4.7 12.7 4.7 5.6 0 10.1-2.1 13.6-6.3l.1-.1-4.9-5.2-.1.1z"),
    ("mercariA", "M172.2 15.1h6.9l13 33.4h-7.6l-2.4-6h-12.9l-2.4 6h-7.7l.1-.3 13-33.1zm-.6 20.9h8l-4-10.6-4 10.6z"),
    ("mercariR2", "M224.7 23.9c2.4 2 3.6 4.7 3.6 8.1.1 4.4-2.4 8.5-6.4 10.4l7.4 12.1h-8.4l-6.5-10.6h-5.3v10.6h-7.4V21h13.8c3.8 0 6.8.9 9.2 2.9zM214.4 27.8h-5.2V37h5.2c4.5 0 6.7-1.6 6.7-4.7 0-3-2.1-4.5-6.7-4.5z"),
    ("mercariI", "M240.4 18h7.3v30.6h-7.3V18z"),
    ("mercariDot", "M239.6 8 243 0l8.1 3.4-3.4 8-8.1-3.4z"),
]


def main() -> None:
    chunks = ["enum WordmarkPaths {"]
    for name, d in EBAY + MERCARI:
        chunks.append(to_swift(d, name))
        chunks.append("")
    chunks.append("}")
    print("\n".join(chunks))


if __name__ == "__main__":
    main()
