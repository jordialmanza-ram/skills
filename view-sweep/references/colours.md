# Colours

The wave is a gradient through two to four colours (`colors`), fitted by glimm into a cosine palette. Pick them from the project, not from a preset.

1. Read the project's tokens or CSS variables. Take its accent and one or two neighbouring tones (warm next to warm, cool next to cool).
2. **Mute them.** Lower saturation and push lightness up until each sits comfortably on the page background. On a warm cream page, sand / clay / dusty rose (`#d8b48a`, `#c98f73`, `#b48a8e`) is the reference.
3. **Avoid greens and pure blues next to warm tones.** glimm's fit can push an olive into lime.
4. Check both themes. The script dims the wave on dark backgrounds through `isDark`; if it still looks muddy on dark, raise lightness, not saturation.

Bright, saturated waves read as a loading state or an ad. If anyone describes the wave as "colourful", it's too strong.
