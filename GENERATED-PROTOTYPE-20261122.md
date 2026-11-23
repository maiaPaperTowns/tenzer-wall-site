# Generated Ink-Wash Prototype — November 22, 2026

Built-in imagegen was used, with the user’s original photos as subject references and supplied screenshot as style reference. The original wall UI, welcome, Sound/About and single-tap interaction remain. The Flower review link is removed.

## Assets and resolution

- assets/generated/river-ink.webp — 2172×724
- assets/generated/underwater-ink.webp — 2172×724
- assets/generated/moon-sky-ink.webp — 2171×724
- assets/generated/moon-disc.webp — 1254×1254, transparency
- assets/generated/fish.webp — 2172×724, transparency

These are approximately 2K source illustrations, not native 7680×2160 artwork. Canvas sizing and responsive cover framing do not manufacture additional photographic detail. The 32:9 wall is one continuous surface, with no bezel compensation. Full-wall sharpness and infrared behavior require testing on the physical hardware.

## Motion

Moon: 28-second eased rise, constant disc size, mountain-ridge occlusion, soft halo, moving lake highlights and clouds. River: two-phase downstream texture advection with perspective-dependent speed and water-only masking; rock banks remain stationary. Fish: separate transparent sprites with traveling tail deformation, depth-dependent speeds, depth-sorted alpha, adaptive school density, moving refraction/light and particles. Original fade timing and render-budget cap remain.

## Input and font

Single-tap uses the browser pointer-up fallback. No Hammer.js/gesture library is loaded. The original contextmenu suppression prevents long-touch right-click menus. Invisible semantic hit targets track the canvas glyphs and preserve generous target sizes. UD Digi Kyokasho font binaries are local-only and ignored by Git: the supplied repository states personal use only. Public deployment uses installed UD Digi where available, otherwise the original font fallback; redistribution requires appropriate font rights.

## Background prompts

### river

Use case: style-transfer. Image 1 is the EDIT TARGET, image 2 is STYLE REFERENCE ONLY (use only the artwork's aesthetic, never its webpage text or interface). Restyle image 1 gently into a refined East Asian ink-wash painting on subtle paper, delicate mineral pigments, misty layered distance, flowing elegant brush lines with very restrained gold-tinted light accents. Soft muted slate/teal/ivory palette, meditative and sophisticated, still recognizable from the original natural landscape. Keep the original composition and subject placement very closely: only a moderate painterly style change, not a redesign. Keep the existing alpine stream, evergreens and mountains in their current positions. Preserve the open central flowing stream and recognizable natural water streaks. No new flowers, animals or buildings. Retain ultra-wide panoramic composition, aim for 32:9 full-bleed wall art. Sharp controlled brushwork, not blurry or muddy. NO text, NO border, no UI, no extra cherry blossoms or decorative flowers. Highest available detail.

### moon

Use case: style-transfer. Image 1 is the EDIT TARGET, image 2 is STYLE REFERENCE ONLY (use only the artwork's aesthetic, never its webpage text or interface). Restyle image 1 gently into a refined East Asian ink-wash painting on subtle paper, delicate mineral pigments, misty layered distance, flowing elegant brush lines with very restrained gold-tinted light accents. Soft muted slate/teal/ivory palette, meditative and sophisticated, still recognizable from the original natural landscape. Keep the original composition and subject placement very closely: only a moderate painterly style change, not a redesign. Keep the midnight sky, clean low mountain ridge, and calm lake positions. NO MOON in this background, no clouds baked in: moon and clouds are separately animated. Keep dark blue night, not beige daytime. Retain ultra-wide panoramic composition, aim for 32:9 full-bleed wall art. Sharp controlled brushwork, not blurry or muddy. NO text, NO border, no UI, no extra cherry blossoms or decorative flowers. Highest available detail.

### underwater

Use case: style-transfer. Image 1 is the EDIT TARGET, image 2 is STYLE REFERENCE ONLY (use only the artwork's aesthetic, never its webpage text or interface). Restyle image 1 gently into a refined East Asian ink-wash painting on subtle paper, delicate mineral pigments, misty layered distance, flowing elegant brush lines with very restrained gold-tinted light accents. Soft muted slate/teal/ivory palette, meditative and sophisticated, still recognizable from the original natural landscape. Keep the original composition and subject placement very closely: only a moderate painterly style change, not a redesign. Keep the empty underwater scene, rippled surface and soft sunlight in the current positions. No fish or animals in this background because fish will be separately animated. Keep readable teal depth and underwater light, not a lake viewed from above. Retain ultra-wide panoramic composition, aim for 32:9 full-bleed wall art. Sharp controlled brushwork, not blurry or muddy. NO text, NO border, no UI, no extra cherry blossoms or decorative flowers. Highest available detail.

## Transparent sprite prompts

Realistic full lunar disc inspired by the supplied moon photograph, round and centered, silver crater detail, no halo or scenery, transparent background.

One complete right-facing silver-blue schooling fish inspired by the supplied underwater photograph, strict side profile, realistic delicate fins and forked tail, transparent background, no water, glow, shadow or other fish.

## Run and verify

Run `python3 -m http.server 4185 --directory authorized-site/photo-prototype-v2` from the workspace root. Run `node --test authorized-site/photo-prototype-v2/prototype.test.cjs` for local checks. This documentation records source resolution honestly; a real Tenzer Wall session is still required.
