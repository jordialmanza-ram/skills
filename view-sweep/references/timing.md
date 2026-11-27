# Timing

Everything is a function of two numbers read every frame: the time since the press, and the wave's progress `p` (0 to 1, from glimm).

- **Page eased back** = `smooth(t / backMs) × (1 − smooth((p − 0.5) / 0.5))`. It goes back within `backMs` of the press, holds while the wave is in the top half, and comes forward as the wave crosses the bottom half. It's home exactly when `p` reaches 1.
- **Reveal edge** = the wave's crest. The new page shows above it (the wave travels top to bottom), through a soft elliptical mask that follows glimm's parabola, so the edge and the band line up.
- **Content drift**: the old page is nudged down up to 10 px as the wave arrives; the new page flows up from 26 px behind it (eased with `(1 − p)²`). It makes the content feel carried by the wave.

## Why these numbers

- **The wave's easing is `cubic-bezier(.25, .55, .35, 1)`**: fast off the press, long and soft at the end. A symmetric ease-in-out made the start feel like a pause.
- **`sweepMs` 1850**: below ~1500 ms the wave reads as a flash; above ~2200 ms people wait for it.
- **`backMs` 320**: the press has to answer immediately. Over ~450 ms it feels like lag.
- **The transition ends with `skipTransition()`** after the wave's outro, when the snapshots already match the live page. Ending on a CSS timer instead is what caused the old "jump at the end".

## Tuning

Change one number at a time, and only these: `sweepMs`, `backMs`, `depth`, `curve`. Add `?slow` style dev switches (multiply the times by 5) to inspect the motion; never ship them.
