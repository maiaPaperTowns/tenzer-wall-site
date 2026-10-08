# Layered motion and responsive artwork

Mode: built-in ImageGen; no fallback CLI or API key. Original generated PNGs are preserved. Workspace source assets are in `authorized-site/assets/derived/`; runtime assets use the matching versioned `.webp` filenames at quality 92, with alpha retained. Existing assets are not deleted. Deployment copies runtime files into `dist/assets/derived/` and the public website's `assets/derived/`.

## Final production prompt set and saved assets

All prompts prohibit text and rectangular backgrounds on sprite atlases. Plates use a 3:1 composition; viewport fitting crops proportionally instead of stretching. Prompt specifications below summarize the final requests used with the built-in tool.

| Saved stem (.png source, .webp runtime) | Prompt specification |
| --- | --- |
| horse-gallop-v2 | Transparent eight-frame 4×2 sprite atlas; same realistic chestnut horse facing right, intact rounded torso and four anatomical legs, consecutive gather/contact/push/suspension/reach/landing gallop poses, consistent scale and alignment, no detached limbs. |
| ice-plate-v2 | Crisp blue frozen lake, remove foreground crystals and most clouds, retain low distant mountains and clear sky. |
| ice-clusters-v2 | Transparent 2×2 atlas of four distinct faceted blue-white crystal clusters, compact bases, clear gutters. |
| wind-plate-v3 | Clean blue-peach landscape plate; remove all wind ribbons and floating petals. |
| wind-ribbons-v3 | Transparent 2×2 atlas of four separate long ivory-pink swirling silk-like gust ribbons; no scene background. |
| star-sky-v4 | Crisp dark indigo star field and purple Milky Way, sky only, no mountains/water/haze or baked comets. |
| storm-sky-v3 | Sharp dramatic indigo-charcoal storm cloud layers throughout frame; no mountains, ground, water, horizon or baked lightning. |
| ocean-plate-v4 | Keep sunset sky and horizon at 36%; remove large breaking crests, replace with crisp low rolling turquoise water. |
| ocean-crests-v4 | Two separate wide transparent turquoise breaking-wave ribbons, detailed irregular ivory foam, tapering edges, no sky or ocean rectangle. |
| lotus-plate-v2 | Preserve sunlit teal pond, remove all blossoms, stems and large foreground pads; detailed water across whole frame. |
| lotus-floats-v2 | Transparent 2×2 atlas of four pink lotus blossoms resting directly on floating green pads, no tall stems, sharp petals/veins. |
| leaf-plate-v4 | Sharp green leafy branches framing blue sky; remove all pink/white flowers and petals, preserve daylight and leaf veins. |
| wisteria-plate-v2 | Remove hanging flower racemes and loose petals; preserve pergola, lantern, steps, path and garden. |
| wisteria-clusters-v2 | Transparent 2×2 atlas of four hanging purple/lilac/pink wisteria racemes, short top-center attachment stems, clear margins. |
| sand-world-v2 | Remove 90% of clouds, keep warm sunset and dune composition, sharpen ridges and foreground sand ripples, remove haze. |
| cat-seated-v4 | Transparent two-cell atlas: seated fluffy brown tabby looking left without a tail; separate matching curved fluffy tail in right cell, base at left end. |
| flower-plate-v6 | Remove every blossom and flying petal from wildflower garden; preserve sky and low green foliage; no tall bare stems. |
| rain-plate-v4 | Remove all baked circular rings, splashes and falling rain streaks; preserve pond reflections, cherry branches and forest. |
| sakura-plate-v5 | Remove every blossom, bud and petal; preserve graceful bare dark branches and pale blush-blue sky. |
| fire-frames-v4 | Transparent eight-frame 4×2 hand-drawn anime-style fire cycle, consistent base, tongues rise/curl/split/dissipate, bright gold core and orange tips, no coals or backdrop. |
| bamboo-cutouts-v3 | Transparent 2×2 atlas of four different complete green jointed bamboo stalks with narrow leaves, roots and branches; sharp painterly sunlit detail, no forest backdrop. |
| tree-cutouts-v3 | Transparent 2×2 atlas: one complete rooted bare oak trunk/branches, three separate lush green canopy clusters; no landscape, no leaves baked on trunk. |
| water-plate-v2 | Single continuous oblique blue water surface throughout frame; remove giant circular ring, hard horizon and upright foliage wall, no baked drops or splashes. |

## Runtime behavior

### October 8 refinements

New asset: `assets/derived/sakura-clusters-v6.png` (source) and `assets/derived/sakura-clusters-v6.webp` (runtime). Mode: built-in ImageGen, transparent output. Final prompt: four distinct lush sakura clusters in a square 2×2 transparent atlas, pale pink/blush-white five-petal flowers, golden stamens, darker buds and tiny twig attachments; crisp painterly anime botanical detail, naturally irregular clusters, generous transparent gutters, no backdrop, boxes, text or haze. The scene now uses these new clusters and two independently phased falling-petal streams.

Latest behavior choices supersede earlier growth notes: tree trunk and complete canopy are present immediately, with foliage-only sway; forest fades in as a complete scene with localized canopy/light motion; wisteria is full-size from the start, swaying without falling petals. Waterfall appears directly without the blue glyph transformation. Horse runs immediately without the black silhouette. Bamboo reveals upward at full stalk proportions, then sways gently. Ice has three spaced clusters; larger lotus floats use staggered spacing and bounded drift. Every character has a synthesized Web Audio profile controlled by Sound on/off; these are designed effects, not field recordings.

- Cover fitting is cached once per scene size. Background and transparent sprite roles are separate; atlases are never treated as landscape plates.
- Flower/cherry reveal timing applies to every visible flower cluster, and each keeps swaying after bloom. Wisteria swings from its stem instead of shifting the pergola.
- Tree roots stay anchored; separate canopy clusters grow and sway. Bamboo roots stay below the frame while stalks bend continuously.
- Wind clouds drift at different speeds beneath independent flexible gusts. Star twinkles and five independently timed meteor/comet streams are rendered live. Lightning remains one branching strike at a time with varied geometry and irregular pauses.
- Ocean uses moving distant water plus advancing/breaking foam bands. Water and rain reflections move, and impact rings are generated live. Lotus pads float and bob independently. River's blue/white water texture moves beneath channel foam without moving the rocky landscape.
- Normal animation continues after the reveal. Reduced-motion output is time-stable. Fade-zero exits clear completely. Scene rendering retains its existing fixed pixel budget.

## Verification

Run `config.test.cjs`, `layered-motion-check.cjs`, `nature-reference-check.cjs`, `weather-check.cjs`, `prototype2.test.cjs` and `perf-budget-check.cjs` against `preview.cjs`. Review portrait and landscape screenshots as well as consecutive animation frames; a changing screenshot alone does not establish natural motion.
