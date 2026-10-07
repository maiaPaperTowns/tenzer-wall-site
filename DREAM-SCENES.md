# Four landscape scenes — October 7, 2026

Visual direction: the user's four-scene reference and full Dreamy Kanji Nature Card Collage. Soft cinematic painted realism, atmospheric depth, scene-specific palettes. Sakura is specific to Flower, not a motif imposed on the other three scenes. No font changes.

All four backgrounds were generated with the built-in image generation tool, then copied into project assets. Existing moon cutout and transparent sakura clusters are reused. Original assets remain intact.

## Saved assets / prompt set

- `assets/derived/sakura-world-v3.png`: illustration-story, full-bleed wide Japanese sakura landscape, lavender/peach dusk, distant violet mountains and reflective lake, abundant pale-pink blossoms around the edges, spacious center, woody branches/trunks concealed behind flowers, soft detailed painted realism. No people, buildings, text, kanji, borders, watermark.
- `assets/derived/storm-lake-v2.png`: illustration-story, full-bleed wide storm lake, rolling navy/violet cloud masses upper two thirds, dark jagged mountains and reflective lake below, peach twilight on the horizon, cinematic atmospheric painted realism. No painted lightning (bolts are animated separately), moon, sun, flowers, people, text, borders.
- `assets/derived/waterfall-world-v2.png`: illustration-story, majestic luminous blue-white waterfall from top of frame into turquoise pool, main curtain x .34–.68, mist and spray below, mossy blue-green cliffs and deep forest at sides, natural fine water strands and painted realism. No woodblock outlines, sakura, people, typography, kanji, borders.
- `assets/derived/moon-lake-v2.png`: illustration-story, wide midnight-indigo lake, sparse stars, low lavender clouds with faint peach edges, dark mountain ridges and small rocky island, calm rippled lake, open sky for composited moon. No baked-in moon or sun, flowers, foreground branches, people, text or borders.

## Animation design

- **花**: landscape reveal, staggered blossom opening at canopy edges, independent drifting petals and subtle lake shimmer. No procedural woody branches.
- **雷**: softly drifting cloud layer, four branching strikes per 1.15-second cycle, localized cloud illumination and broken reflections below the lake horizon. No full-screen white flash. Reduced-motion mode is static.
- **滝**: preserved stroke-bottom dripping transition, followed by vertical moving water texture confined to the central waterfall, stable rock faces, expanding mist and subtle spray at the base.
- **月**: existing transparent moon rises over the new lake, soft warm halo and changing water reflection; the background contains no second moon.

`dream-scenes.js` is dispatched before legacy renderers. `world-check.cjs` tests motion, reduced-motion determinism and zero-opacity exit for 11 scenes. Real 7680 × 2160 wall performance and subjective pacing still need installation testing.
