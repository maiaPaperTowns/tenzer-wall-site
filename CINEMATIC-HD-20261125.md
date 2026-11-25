# Photographic animation / Full HD output

November 25, 2026. Original UI, falling characters, single tap, sound, About and context-menu suppression remain unchanged. No painterly overlay is active.

## What changed

Water/light v2: stronger two-axis refraction moves the photographed surface, with a 32:9-aware falloff. Drifting sunbeams, moving irregular caustics and slow exposure variation extend through the water column; fish highlights share the light phase. Reduced motion disables all these effects. No new image assets or changes to Moon/River.

- Fish now uses a clean photographic plate plus independently translating transparent fish sprites, rather than deformation of a still school. Depth-sorted fish move in both directions, with tail-led body waves and moving highlights. The surface ripples, sunbeams sway and suspended particles drift. Reduced motion freezes all motion.
- River uses a detail-restored photographic reference, existing water mask and downstream two-phase flow; major rock exclusions keep the banks and rocks still.
- Moon uses a detail-restored photographic reference with the same six-second rise and black background.

## Asset files and honest resolution limits

Built-in Imagegen edits/reconstructions, not a video-generation model:

- `assets/fish-clean-plate.webp` — 1535×1024, fish removed and water filled.
- `assets/fish-photographic-cutout.webp` — 2172×724 with alpha, reconstructed silver fish based on source photograph.
- `assets/river-restored-hd.webp` — 1536×1024 photographic restoration.
- `assets/moon-restored-hd.webp` — 1536×1024 photographic restoration.

The original 724px-wide JPEGs remain unchanged. AI-restored details and the isolated fish are reconstructed, not guaranteed pixel-identical to the originals. They are higher resolution than the supplied references but **not native Full HD sources**. The animation canvas supports and is tested at 1920×1080 output, plus the 32:9 wall ratio, with an existing 3-million-pixel scene budget. Native 8K detail is not claimed. Wide-screen cover framing crops source edges without stretching anatomy. For uncompromised photographic detail, licensed high-resolution originals remain preferable.

## Built-in Imagegen prompts

1. Clean plate: edit supplied fish photograph, remove all fish, fill only their locations with surrounding seawater; preserve original 3:2 framing, rippled upper surface, bright upper-center sun, rays, navy/blue gradients and photographic texture. No changed viewpoint, new scenery, fish, seabed, painting or text.
2. Fish alpha: isolate/reconstruct one silver-blue slender schooling fish of the source type and proportions, photorealistic scales, natural reflected blue light, translucent fins and forked tail. Side profile right, whole body visible, 3:1 horizontal framing. Actual transparent background. No koi, stylization, water rectangle, text, shadow or glow.
3. River restoration: reproduce supplied photograph's camera position, composition, conifer contours, mountain, rocks, whitewater path and daylight colors. Enhance fine photographic detail at highest practical resolution, target 2048×1365 or larger. Keep geometry aligned for water mask. No painting, new objects, scene reinterpretation, borders or text.
4. Moon restoration: preserve centered disc shape, lunar orientation/maria, monochrome texture, diameter and framing on black. Enhance realistic fine lunar detail at highest practical resolution, target 2048×1365 or larger. No new sky, stars, clouds, warm grade, glow, text or scenery.

Returned sizes are recorded above rather than assuming requested sizes were delivered. Tests verify fish translation over time, tail phase changes, lighting time, reduced motion, finite geometry and unchanged original JPEG hashes. Physical wall performance and infrared touch still require hardware testing.
