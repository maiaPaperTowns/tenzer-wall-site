# Nature expansion — September 26, 2026

Updated active assets and all new derivative prompts are documented in [NATURE-REFRESH-PROMPTS.md](NATURE-REFRESH-PROMPTS.md). The source inventory below records the earlier version, not the current active configuration. `config.json` is authoritative. Current moon, snow, tree, fire, wind, ocean and flower scenes use the new approved-for-prototyping derivatives; original photographs remain available for recovery.

User-supplied references are not independently license-verified. Preserve source URLs, creators, license terms and purchase receipts before final installation. No AI-assisted derivative is represented as an untouched museum original.

## Original source photographs (copied unchanged; some now archival)

- Fire: `Fire_in_fire_pit_2.jpg` → `assets/stock/fire-pit.jpg`; `Redrosedust_wright_f2000.jpg` → `assets/stock/fire-nebula.jpg`. The nebula supplies atmospheric color, not a claim that it depicts terrestrial fire.
- Moon: `Moon_Essentials-_Turntable_(SVS5319).jpg` → `assets/stock/moon-disc.jpg`. `Full_moon_partially_obscured_by_atmosphere.jpg` is retained as `moon-atmosphere.jpg` for reference, not rotated as a second moon.
- Snow: `Snowy_road_Sosonka_2013_G1.jpg` and `Oak_in_snow_2017_BW_G1.jpg` → `snow-road.jpg`, `snow-oak.jpg`.
- River: `Desna_river_Vinn_meadow_2019_G01.jpg` → `river-meadow.jpg`; muted photographic texture with three code-rendered flowing channels.
- Ocean: `Waves_in_sea.jpg` → `ocean-waves.jpg`; `Ocean_Splashing_on_Rocks.jpg` retained as `ocean-rocks.jpg`. Surf is rendered dynamically over the beach reference.
- Water: `Water-pattern-1.jpg` → `water-pattern.jpg`.

Tree paintings `SAAM-1966.5_2.jpg`, `SAAM-1962.4.20_1.jpg`, the apple-tree photograph, and the wind painting screenshot inform mood only; they are not displayed as full-screen plates.

## Transparent derivatives — built-in ImageGen

### Leaf atlas

Source: `ark__65665_m3b683531db2324e19bf8f5c74dc5bb269.jpg`.
Saved asset: `assets/derived/tree-leaves-v1.png`.
Used by the tree and wind renderers; branches are continuous Canvas paths, not image slices.

Prompt: Use case: background-extraction. Input is the user's botanical leafy twig photograph, edit target. Produce a transparent botanical sprite atlas with four separate individual leaves taken from this specimen, retaining natural muted green pigment, vein texture and leaf shape. Square atlas with exact 2 by 2 equal cells, one leaf centered per cell with clear transparent padding, each leaf stem base at bottom center, tips pointing upward. Remove paper, twig, labels, border and ruler. No text, no shadows, no invented decorative objects. Actual alpha transparency. These leaves will unfurl on growing branches in an interactive artwork.

### Snow crystal

Source: `Snowflake_crop.png`. Saved asset: `assets/derived/snowflake-v1.png`.

Prompt: Use case: background-extraction. Edit target: supplied macro photograph of a real snow crystal. Extract the single six-armed snowflake, removing ALL blurry background and supporting snow/ice beneath it. Preserve delicate crystalline branching and icy blue-white detail. Complete only the small occluded tips as needed to make one coherent six-armed crystal. Center with transparent padding, real alpha transparency, no text, no rectangular backdrop, no glow outside crystal. Sprite for falling snow animation.

## Animation and accessibility

New entries: 木/tree, 火/fire, 月/moon, 雪/snow, 風/wind, 川/river, 海/ocean, 水/water.
Each uses a JSON behavior and options; implementations live in `nature-scenes.js`. No new network or AI calls occur during use. Ink particles originate from sampled glyph pixels. Reduced motion renders a stable composition; all layers inherit the scene exit opacity.

### River landscape

Built-in ImageGen derivative from `Desna_river_Vinn_meadow_2019_G01.jpg`, saved as `assets/derived/river-channels-v1.png`. Replaces the initial geometric channel composition. Three flow paths follow the generated river courses in normalized image coordinates, configured in JSON and mapped through the same cover transform as the background.

Prompt: Use case: compositing. Reference: supplied misty meadow river photograph. Create an artistic naturalistic panoramic overhead oblique view of THREE slender winding river channels through soft sage-green reeds and marsh grasses, reflecting the pale blue-grey misty dawn colors and fine natural texture of the reference. One unified continuous landscape, not separate panels. Three gently sinuous water channels run roughly vertically from distant top to foreground bottom, centered near 17%, 50%, 83% of image width. Natural irregular grassy banks, no geometric outlines. Calm water with subtle soft reflections, no frozen splash or big ripples. Soft atmospheric haze, refined painterly photographic detail, landscape 16:9, no buildings, no text, no border. This is a backdrop for separately animated flowing water highlights.

These are artistic approximations, not fluid or biological simulations. Original source resolutions are retained; the supplied small photos may be visibly soft on the full 7680×2160 wall and should be replaced with higher-resolution licensed originals for final installation.
