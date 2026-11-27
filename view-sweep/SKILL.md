---
name: view-sweep
description: Add a View Sweep page transition to a switch that changes a long page in place (TL;DR / full, tabs of a docs page, a filter that reshapes the content). The page eases back, a soft curved wave drawn with glimm travels down the screen, the new version is revealed behind it and the page comes forward as it leaves. Use when someone wants a switch between two versions of the same page to feel like a change instead of a glitch. Not for route changes, hovers, menus or anything that happens often.
---

# View Sweep

A page transition for switching a long page between two versions of itself, in place.

**The one idea:** the change should be felt where it happens, as one movement with a cause. The press starts it, the wave carries it to the content that changes, and nothing moves on its own afterwards.

## When it fits, and when it doesn't

Use it for a switch that changes most of the page while the top stays put: TL;DR / Detailed, Overview / Reference, a filter that reorders a long list. Those swaps look like nothing happened on a laptop, because the change is below the fold.

Don't use it for navigation between pages, for anything people do many times in a row (filters they flick through, pagination), for hovers or menus, or as a loading state. If the user would never mention the moment, skip the sweep. Say so instead of adding it.

## Setup, in five steps

1. **Install glimm** (the wave): `npm install glimm`. MIT, no dependencies.
2. **Copy the two files** into the project: `view-sweep.ts` (next to other client scripts, e.g. `src/lib/`) and `view-sweep.css` (imported globally on the pages that use it).
3. **Add the canvas** once per page, anywhere in the body: `<canvas class="view-sweep" aria-hidden="true"></canvas>`.
4. **Wire the switch.** Create the sweep once, then call `run(change, from)` from the click handler. `change` must update the DOM synchronously (set a data attribute, swap a class); `from` is the pressed element, so the page eases back towards it.

   ```ts
   import { createViewSweep } from './lib/view-sweep';
   const sweep = createViewSweep({
     canvas: document.querySelector('canvas.view-sweep')!,
     colors: ['#d8b48a', '#c98f73', '#b48a8e'],
     isDark: () => document.documentElement.classList.contains('dark'),
     fallback: () => { /* optional: what happens when the sweep can't run */ },
   });
   button.addEventListener('click', () => sweep.run(() => setView(next), button));
   ```
5. **Pick the colours** from the project's own palette (see `references/colours.md`) and **check it** frame by frame (see `references/checks.md`).

Framework notes for Astro, React and plain HTML are in `references/frameworks.md`.

## Defaults, and what each is for

| Option | Default | Why |
| --- | --- | --- |
| `sweepMs` | 1850 | Long enough to read as one movement down a tall screen, short enough not to wait for. |
| `outroMs` | 300 | The wave fades out after crossing instead of stopping. |
| `backMs` | 320 | The page eases back fast, so it starts with the press. |
| `depth` | 0.025 | A 2.5% ease back. More reads as a zoom effect. |
| `curve` | 0.12 | The wave's ends trail its middle a little, so it reads as a wave, not a wipe. |
| `colors` | sand, clay, dusty rose | Two to four muted tones. Replace with the project's. |

Why the numbers are what they are: `references/timing.md`.

## Rules that matter

- **Never animate the live page.** Only the View Transition snapshots move. Animating the real DOM makes text shimmer when it settles.
- **One clock.** Don't add CSS animations or timeouts around it. Everything reads the wave's progress each frame; that's what stops the end from jumping.
- **Navigation comes back last.** If the page has a table of contents, a pager or a toolbar, hide it in `change` and bring it back after `run()` resolves. It can't point at sections that aren't there yet.
- **Preload the hidden version's first images.** They're lazy while hidden, so the first switch would download and decode them halfway through the wave and stutter. On idle, set `loading = 'eager'` and call `decode()` on the first few. The script already compiles the wave on idle.
- **Content hidden at load must not be in a scroll-reveal state.** If the site reveals blocks on scroll, skip blocks that are hidden (no layout) when the page loads; otherwise they're blank inside the transition.
- **Make the change visible above the fold.** If the first changed block starts below the fold on a laptop, tighten the space above it, or the sweep shows the same screen twice.
- **Respect reduced motion.** `run()` already swaps instantly; `fallback` is where a quiet alternative goes (a short fade or rise).

## Files

- `view-sweep.ts`: the script. `createViewSweep(options)` returns `{ run, busy }`.
- `view-sweep.css`: the snapshot movement and the reveal mask.
- `references/timing.md`, `references/frameworks.md`, `references/colours.md`, `references/checks.md`.
