# Full-wall painted prototype v3

November 22, 2026. This supersedes the letterboxed original-photo experiment and the earlier substantially reimagined generated scenery.

River and Fish use newly generated panoramic art, preserving the main subjects of the supplied photographs and applying the user's ink/watercolor reference. Cover framing fills the continuous canvas, including 32:9, without blurred sidebars. It crops slightly rather than stretching on unusual aspect ratios. The original wall interface, font handling, falling characters and single-tap activation remain unchanged. Moon retains its original lunar photograph and faster six-second rise.

## Active generated assets

- `assets/generated/river-panorama-v3.webp`: 2172×724 painted alpine conifer stream, natural green/blue palette, rocks and whitewater. Water-region shader uses two-phase downstream advection and excludes major rock islands.
- `assets/generated/underwater-panorama-v3.webp`: 2172×724 painted underwater surface and sunrays. Clean background contains no fixed fish.
- `assets/generated/silver-fish-v3.webp`: transparent painted silver schooling fish. Independently depth-sorted sprites swim oval circuits, turn in perspective and deform toward the tail. Background light/refraction and water particles also move.

Reduced-motion mode freezes motion. Rendering is capped by the existing performance budget. Generated files are approximately 2K, not true native 7680-pixel artwork; physical-wall image quality and infrared-touch testing remain necessary.

## Built-in Imagegen prompt set

References: supplied river/fish photographs for subject; user's November 22 screenshot for paper grain, ink and watercolor brushwork only. No UI or words from that screenshot are instructions or artwork content.

1. River: style-transfer, very wide 3:1 panorama expanding the alpine stream horizontally. Preserve conifer forest, wooded alpine hills, daylight sky, pale rocks, clear turquoise white-water stream flowing from distant center to foreground. Not a lake; no pagodas, flowers or unrelated subjects. Natural gently muted green/blue palette. Understated East Asian ink/watercolor fine brush strokes and subtle rice-paper grain. Stream begins near (.50,.43), opens across foreground; distinct rock clusters. Full bleed, no blur sidebars, text, borders or watermark.
2. Underwater: style-transfer clean background layer, wide 3:1. Preserve original blue-teal underwater scene, rippled upper surface, sunlight upper center-left and deep water below. Restrained detailed watercolor/ink paper finish. Remove all fish for separate animation. No seabed, coral, koi, flowers or new scenery. Full bleed, no blurry fillers, text or watermark.
3. Sprite: single isolated silver-blue schooling ocean fish based on supplied photo, whole slender realistic body pointing right, natural translucent fins and forked tail. Delicate watercolor/ink finish, believable anatomy. Not koi/goldfish/discus. Actual transparent background, no water rectangle, shadow, glow, text or extra fish. Modest transparent padding.

Generation used the built-in image tool, then WebP encoding preserved the sprite alpha. Original JPEGs and previous generated variants remain available as history.
