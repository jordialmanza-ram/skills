# Checks

A screenshot after the fact shows nothing: the bugs are in the middle of the movement. Check it like this:

1. **Slow it down.** Temporarily multiply `sweepMs`, `outroMs` and `backMs` by 5 (a dev-only query param works) and capture three to five frames through the sweep.
2. **Log the clock.** Sample the CSS variables (`--vs-p`, `--vs-scale`) every 150 ms during one run. `--vs-scale` must start dropping on the first sample, and both must reach their end values before `vs-run` is removed.
3. **Look for:**
   - A pause between the press and the first movement (the wave should be visible within ~150 ms).
   - Frames that hang mid-wave on the **first** switch only: images of the hidden version loading late, or the shader compiling on the press. Log frame timestamps; any gap over ~50 ms during the wave is a stutter.
   - Anything that changes at once at the end (a block popping in, a scroll jump, a toolbar snapping).
   - Blank areas in the new view (content still in a scroll-reveal state).
   - Text that shimmers after it settles (something animating the live page).
   - The same screen before and after on a laptop (the change is below the fold).
4. **Check both directions, both themes, and reduced motion.**
5. **Test in a foreground tab.** Background tabs pause rendering and the transition waits for frames, so it looks stuck.
