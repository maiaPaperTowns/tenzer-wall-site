# Natural motion refresh — 2026-09-27

Mode: built-in imagegen. Generated originals retained; project copies below have their original alpha preserved.

## cat-rig-v2.png

Reference: `assets/derived/cat-walk-v1.png` (the user's antique brown tabby visual).

Prompt: Make a clean 2×2 transparent animation rig atlas preserving the cat's fine antique lithograph texture, brown-gold fur, black stripes and yellow eyes. Top-left: horizontal torso and attached head, right-facing, no legs or tail. Top-right: complete relaxed front leg, shoulder at top, paw pointing right. Bottom-left: complete hind leg, natural hock, paw right. Bottom-right: long upward-curving tail attached at bottom. Isolated centered parts, generous gutters, no labels, shadows or grid. These are puppet parts, not four whole cats.

Implementation: four staggered continuous stance/swing phases, body height fixed, stride tied to travel speed, separate swaying tail. No frame swapping.

## tree-reference-v3.png

Reference: user-supplied `SAAM-1962.4.20_1.jpg`.

Prompt: Extract the large tree on the right and its immediate low shrubs onto true transparency. Preserve its asymmetrical loose green and pale golden foliage, fine branches, earthy natural trunk, painterly texture and organic proportions. Remove sky, distant landscape, meadow and path. Reconstruct only the obscured lower trunk. Full tree with transparent margins; no apple tree, cartoon redesign, symmetric icon, text or background shadow.

## pond-water-v2.png

Reference: user-supplied `Goldifishgroupkoi.jpg`.

Prompt: Remove all fish and their shadows and reconstruct clear pond water underneath. A realistic overhead pond background for animated koi, preserving sunlight caustics, muted pebble detail, refraction and delicate overlapping ripples. Fresh pale jade and aquamarine, not electric cyan or milky. Landscape 3:2, no shore, horizon, animals, plants, large whirlpools or text. Match the top-down viewpoint and natural light.

## Code-native changes

Living water strips move continuously; fish share a translucent water layer. Ocean animates the original shore photograph without repeated cutout foam bars. Sakura has tapered main branches and 28 growing twigs, smaller flowers opening along branches. White snow crystals retain landing/melting. Bamboo has five stems, 2–3 sprays per stem with slower opening. Leaves use seeded irregular positions. Stars twinkle independently. Bird inverse mapping renders each bird once with no second wing overlay.
