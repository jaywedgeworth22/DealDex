# DealDex AppIcon options (not live)

Live launcher stays `native/brand/dealdex-dd-icon-1024.png` (white field) until the owner picks one of these.

| File | Background | DD scale vs current |
|------|------------|---------------------|
| `ct-gray-90.png` | Congress.Trade light gray + oval shadow | 10% smaller |
| `ct-gray-80.png` | same | 20% smaller |
| `ct-gray-72.png` | same | extra padding (closer to the CT eagle) |
| `st-grid-90.png` | Socratic.Trade light grid + oval shadow | 10% smaller |
| `st-grid-80.png` | same | 20% smaller |
| `st-grid-72.png` | same | extra padding |
| `sheet.png` | contact sheet of all six | — |

Regenerate: `python3 scripts/generate-icon-options.py`
Do not run `scripts/generate-app-icons.py` against an option until the owner picks it.
