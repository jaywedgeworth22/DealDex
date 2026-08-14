# 2026-08-13 — Scan desk polish

Seat: GROK-BUILD

## What changed

- Wordmarks sit in a locked 14px-tall box (`35×14` eBay, `64×14` Mercari).
  A parent `[&_svg]:size-auto` was letting the SVGs paint at viewBox size
  (1000px / 251px) and cover the phone preview.
- Listing-row and alert marks are bare — no grey pill.
- Card thumbs and dossier art use a **600×825** frame (`aspect-[600/825]`).
  Listing photos are cropped to that; official TCGDex art already matches.
- Last scan hydrates from localStorage, then refreshes in place.
- Listing ledger records first seen, optional marketplace list date, and
  ask ticks. A spark + delta shows when the ask moved.
- Title Case on titles and buttons: Good Deal, Desks Differ, Any Verdict,
  Scan Market. "Every live single, scored" stays as written.

## Verify

- Phone ~390px: logos stay small; no overlay on the search card.
- Listing row: wordmark, then verdict chip, no grey bubble on the mark.
- Thumb is taller than the old 64×80 box (64×88).
