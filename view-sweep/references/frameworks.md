# Frameworks

The script is plain TypeScript and only touches `document.documentElement` and one canvas. It needs to run in the browser, after the page is parsed.

## Astro

Astro sends plain HTML by default and only runs client code inside `<script>` tags (bundled) or islands.

```astro
---
import '../styles/view-sweep.css';
---
<div class="switch">
  <button data-view="short">Short</button>
  <button data-view="full" aria-selected="true">Full</button>
</div>
<canvas class="view-sweep" aria-hidden="true"></canvas>

<script>
  import { createViewSweep } from '../lib/view-sweep';
  const root = document.documentElement;
  const sweep = createViewSweep({ canvas: document.querySelector('canvas.view-sweep')! });
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((b) =>
    b.addEventListener('click', () => sweep.run(() => { root.dataset.view = b.dataset.view!; }, b)));
</script>
```

Set the initial view in a small `<script is:inline>` so it's right before the first paint. If you use Astro's own `<ClientRouter />` (view transitions between routes), don't call the sweep during a route change; it's for in-page switches.

## React / Next.js

Create the sweep once in an effect and keep it in a ref. `change` must update the DOM synchronously, so wrap the state update in `flushSync`:

```tsx
const sweep = useRef<ReturnType<typeof createViewSweep>>();
useEffect(() => { sweep.current = createViewSweep({ canvas: canvasRef.current! }); }, []);
const onPick = (next: View, el: HTMLElement) =>
  sweep.current?.run(() => flushSync(() => setView(next)), el);
```

## Plain HTML

Load it as a module (`<script type="module">`) and import glimm from a CDN that serves ES modules, or bundle it with any tool.
