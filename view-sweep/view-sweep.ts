// View Sweep: a page transition for switching a long page between two versions in place
// (a short and a full read, two tabs of a docs page, a filter that reshapes the content).
//
// On press the page eases back towards what was pressed, a soft curved wave travels down the
// screen, the new version is revealed behind it, and the page comes forward again as the wave
// leaves. The page itself never animates: the old and new pages are View Transition snapshots,
// and the wave is a glimm canvas (https://glimm.dev, MIT) drawn above them. Everything runs on
// one clock, read every frame, so it's a single movement and nothing jumps when it ends.
//
// Without View Transitions, WebGL, or with reduced motion, it just swaps (and calls `fallback`).
// Pair it with view-sweep.css and a <canvas class="view-sweep"> anywhere in the body.
import { createShader, playSweep, accentChain, cubicBezier, type ShaderController } from 'glimm';

export type ViewSweepOptions = {
  /** The full-viewport canvas the wave is drawn on (<canvas class="view-sweep">). */
  canvas: HTMLCanvasElement;
  /** Two to four hex colours for the wave, ideally muted tones from your own palette. */
  colors?: string[];
  /** ms for the wave to cross the screen. Default 1850. */
  sweepMs?: number;
  /** ms for the wave to fade out after crossing. Default 300. */
  outroMs?: number;
  /** ms for the page to ease back after the press. Default 320. */
  backMs?: number;
  /** How far the wave's ends trail its middle, as a share of the screen height. Default 0.12. */
  curve?: number;
  /** How far the page eases back (scale). Default 0.025. */
  depth?: number;
  /** Is the page dark right now? Dims the wave on dark backgrounds. */
  isDark?: () => boolean;
  /** Called instead of the sweep when it can't or shouldn't run. */
  fallback?: () => void;
};

const OVERSCAN = 0.2; // glimm starts and ends the band this far outside the screen
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);

export function createViewSweep(o: ViewSweepOptions) {
  const root = document.documentElement;
  const colors = o.colors ?? ['#d8b48a', '#c98f73', '#b48a8e'];
  const palette = accentChain(colors);
  const sweepMs = o.sweepMs ?? 1850, outroMs = o.outroMs ?? 300, backMs = o.backMs ?? 320;
  const curve = o.curve ?? 0.12, depth = o.depth ?? 0.025;
  let ctrl: ShaderController | null = null;
  let busy = false;

  // The wave's crest at the centre, in CSS px from the top, for glimm's progress p
  const crestY = (p: number) => innerHeight * (-OVERSCAN + p * (1 + 2 * OVERSCAN));
  // One frame of the one clock: how far the page has eased back (from the press), where the
  // wave is, and how far the page has come forward again (from the wave's halfway point)
  const frame = (p: number, since: number) => {
    const back = smooth(clamp(since / backMs)) * (1 - smooth(clamp((p - 0.5) / 0.5)));
    root.style.setProperty('--vs-front', `${crestY(p)}px`);
    root.style.setProperty('--vs-p', String(p));
    root.style.setProperty('--vs-scale', String(1 - depth * back));
    root.style.setProperty('--vs-blur', `${back.toFixed(2)}px`);
  };

  /** Swap the page with `apply` (which changes the DOM), sweeping from `from` if given. */
  const run = async (apply: () => void, from?: Element | null) => {
    if (busy) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!still && document.startViewTransition) {
      ctrl ??= createShader({ canvas: o.canvas, palette, direction: 'ttb', bandTight: 12, curve, swellAmount: 0.2, rippleAmount: 1.6, waveAmount: 2, waveSpeed: 1.6 });
    }
    if (!ctrl || still || !document.startViewTransition) { apply(); o.fallback?.(); return; }
    busy = true;
    const r = from?.getBoundingClientRect();
    root.style.setProperty('--vs-x', r ? `${r.left + r.width / 2}px` : '50%');
    root.style.setProperty('--vs-y', r ? `${r.top + r.height / 2}px` : '0px');
    // The reveal edge follows the wave's parabola: an ellipse whose bottom sits on the crest
    // and whose sides rise by `curve` at the screen edges
    root.style.setProperty('--vs-eb', `${(curve * innerHeight) / 0.3}px`);
    ctrl.setProgress(0);
    frame(0, 0);
    root.classList.add('vs-run');
    const vt = document.startViewTransition(apply);
    try { await vt.ready; } catch { root.classList.remove('vs-run'); busy = false; return; }
    const t0 = performance.now();
    let raf = 0;
    const tick = () => { frame(ctrl!.getProgress(), performance.now() - t0); raf = requestAnimationFrame(tick); };
    tick();
    const dark = o.isDark?.() ?? false;
    await playSweep(ctrl, {
      palette, direction: 'ttb', sweepMs, outroMs, easing: cubicBezier(0.25, 0.55, 0.35, 1),
      waveAmount: 2, rippleAmount: 1.6, waveSpeed: 1.6, swellAmount: 0.2,
      peakAlpha: dark ? 0.9 : 0.75, brightness: dark ? 1.05 : 0.95,
    }).done;
    cancelAnimationFrame(raf);
    frame(1, Infinity);
    // The snapshots are now exactly where the live page is, so ending here can't jump
    vt.skipTransition();
    await vt.finished.catch(() => {});
    root.classList.remove('vs-run');
    busy = false;
  };

  return { run, get busy() { return busy; } };
}
