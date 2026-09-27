# Nature refresh — 2026-09-26

Generated derivatives use the built-in ImageGen tool with user-supplied references. They are transformed assets, not unmodified source artwork. Source license verification remains separate; filenames alone do not prove licensing. Original files are retained.

## Saved assets

All generated outputs are copied into `assets/derived/`: snow-landscape-v2.png, moon-cutout-v2.png, tree-natural-v2.png, fire-atlas-v2.png, bamboo-spray-v1.png, koi-atlas-v1.png, cloud-atlas-v1.png, leaf-atlas-v1.png, cat-walk-v1.png, ocean-wave-v1.png, wind-trees-v1.png, sakura-atlas-v1.png, rainbow-sky-v3.png.

Stars use supplied Starburst_in_NGC_4449_(captured_by_the_Hubble_Space_Telescope).jpg and Alpha_Perse_-_star.png, copied without bitmap modification into assets/stock/starburst.jpg and starfield.png.

## Prompts

### snowLandscapePrompt

Use case: stylized-concept. Two reference photos show a snowy woodland road and snow-covered oak branches. Generate a refined poetic winter landscape for an immersive art wall, panoramic 21:9 at highest available resolution. Clear finely detailed frost-laden oak and birch branches frame the left and right edges; an OPEN snowy clearing stretches across the full lower half, tree trunks remain toward the sides and distant background. A meandering path leads into subtle lavender haze and peach-pink dawn light in the center. Ivory snow, powder blue shadows, delicate warm reflected light, natural photographic detail with restrained painterly atmosphere, crisp foreground crystals and bark, not blurry, not cartoon. Ground horizon approximately halfway down image. No people, buildings, text, border or airborne snowflakes: moving flakes will be animated separately. Preserve the winter woodland character of the supplied references while simplifying tangled clutter.

### moonCutPrompt

Use case: background-extraction. Edit target: supplied lunar photograph. Remove the entire black rectangular background and isolate ONLY the visible illuminated gibbous moon. Preserve its exact crater pattern, grey color, phase, proportions and orientation; do not repaint or invent the lunar surface. The unilluminated near-black left crescent should fade into transparency, not leave a dark ring or disc silhouette. Clean alpha edge, no black fringe, no glow, no stars, no text. Center the isolated moon in a square transparent canvas with 5% padding.

### treeNaturalPrompt

Use case: compositing. References: first dark historic oak painting for bark character; second meadow painting for painterly foliage and shrubs; third apple-tree photograph for natural branching anatomy and bark detail. Create one high-detail naturalistic painterly mature tree, fully isolated on true transparent background, no scenery or sky. Wide irregular leafy canopy, thick gnarled textured trunk with visible bark ridges and twisting connected branches, exposed roots at bottom, small varied shrubs and tufts of grass around the base, restrained scattered red apples. Real organic anatomy, rich but subdued green/ochre pigment, clear detail and realistic lighting, NOT cartoon, NOT flat vector, no uniform Y forks. Entire tree and shrubs contained with padding, trunk root at horizontal center near 94% height. Main branch fork near center around 60% height, broad canopy above. Square composition, no text, no rectangular ground, transparency between leaves and branches.

### fireAtlasPrompt

Use case: compositing. Reference image: supplied real fire-pit photo. Create a photorealistic transparent flame sprite atlas for animation. Exactly FOUR different isolated flame plumes arranged in a 2 by 2 equal grid with generous transparent padding, no overlap between cells. Each plume starts at bottom center of its cell and rises upward: first broad roaring flame, second tall curling tongue, third small forked flame, fourth medium turbulent wispy flame. Natural orange, amber and pale yellow hot cores with semi-transparent feathered edges, fluid curling structure like real burning wood. No logs, no ground, no pit, no black or red background, no smoke backdrop, no rectangular glow, no sparks outside cells, no text. Actual alpha transparency. Crisp natural detail, not cartoon, not identical copies, no stretched vertical texture.

### bambooPrompt

Use case: compositing. Reference images are two historic ink bamboo paintings, used for leaf brushwork and branch rhythm. Create one isolated bamboo leafy twig sprite, jade and sage GREEN instead of black, on true transparent background. Delicate long pointed leaves in varied sizes, expressive tapered ink-wash brushwork, subtle translucent pigment. The twig attachment starts at the LEFT CENTER of the canvas and slender connected branches extend to the right into an airy asymmetrical spray of leaves. Entire twig contained with 8% padding. No main bamboo trunk, no paper, no scenery, no calligraphy, no stamp, no text. Landscape 3:2 sprite, crisp clean alpha edges.

### fishPrompt

Use case: compositing. Reference: supplied overhead photograph of koi. Generate a transparent sprite atlas of FOUR natural koi viewed directly from above, each horizontal facing RIGHT, tail at left, head at right. 2 by 2 equal grid, each fish entirely inside its cell with 12% transparent padding. One orange-white koi, one gold koi, one white-red-black koi, one pale ivory koi. Preserve natural realistic koi anatomy, delicate translucent pectoral fins and forked tails, clear scales, restrained painterly finish. No water, ripples, shadows outside the fish, background, text, or scenery. True transparent background. Straight relaxed bodies for runtime tail animation. Wide landscape canvas.

### cloudPrompt

Use case: compositing. Reference 1 is a cloud photograph for realistic volume; references 2 and 3 are paintings for painterly texture and soft ivory/peach/blue-grey colors. Create FOUR isolated cloud banks arranged in a strict 2 by 2 equal sprite grid. Each entirely inside its cell with generous clear transparent margins. Varied cumulus shapes: high billowing bank, long airy wisps, rounded soft bank, delicate peach-lit small cloud. Detailed softly feathered edges, luminous oil-paint brush texture, elegant atmospheric naturalism. Clouds ONLY, true transparent alpha background, no sky, landscape, paper, frames, writing, stars, or opaque backdrop. Landscape canvas.

### leafPrompt

Use case: compositing. Two reference photographs: broad dark green hosta leaves and macro serrated leaf with fine veins. Create a clean transparent 2 by 2 sprite atlas with FOUR separate whole leaves: two broad heart-shaped hosta leaves in deep jade and sage, two softly serrated green leaves with intricate veins. Each leaf upright, pointed tip near top, short stalk at bottom center; each fully contained inside own equal grid cell with 15% empty padding. Keep realistic photographic venation, natural curved surfaces, subtle varied green pigments. No surrounding plants, backdrop, cast shadows, text, grid lines or glow. True transparent alpha background.

### catPrompt

Use case: compositing. Reference is a historical drawing of a brown striped tabby reclining on a cushion. Create an animation sprite sheet of that SAME golden-brown tabby with dark stripes, yellow eyes and softly textured lithographic fur, now WALKING to the RIGHT in strict side profile. Four chronological walk cycle poses in a strict 2 by 2 equal grid; consistent identical body size, head position, floor baseline and proportions within each cell. Legs change position in natural alternating steps. Long tail curls upward behind the rump and changes gentle curvature each pose. Whole cat and tail contained with generous transparent padding in every cell, no overlap. No cushion, backdrop, floor, text or shadow. TRUE transparent alpha, not a black background.

### oceanPrompt

Use case: background-extraction. Edit targets: two supplied surf photographs. Isolate and reconstruct a wide natural turquoise breaking wave crest with white foam and spray, matching the actual waves in the references. Only one long horizontal breaking wave, clean detailed translucent water and frothy white lip, with tapered transparent edges all around. Remove ALL sky, boats, rocks, sand and distant ocean. Transparent background, no rectangular water plate, no text. Wide panoramic sprite for moving shoreward in animation. Keep realistic wave structure, not a cartoon.

### windPrompt

Use case: background-extraction. Edit target supplied painting of wind-bent trees. Preserve the exact painterly green foliage and thin brown trunks. Remove the pale sky and paper border; isolate the wind-bent tree group with connected shrubs and narrow grassy base, full width composition with all crowns contained. True transparent background between trunks and around crowns, no rectangle, no new scenery, no text. Preserve texture, species and leftward lean from original.

### sakuraPrompt

Use case: compositing. Reference 1 cherry blossom photo is the flower identity, petals and pink colors. Reference 2 botanical painting is only a subtle soft painterly texture reference. Create a transparent sprite atlas of SIX different SINGLE cherry blossoms, in strict 3 columns by 2 rows equal grid. Each cell contains exactly one flower fully contained with 15% padding. Five delicate notched petals, fine burgundy filaments and golden anthers. Variations of blush pink, pale ivory pink, rose pink; four frontal blooms and two slightly angled blooms. Natural dimensional petals, delicate veins, high detail, softly lit, gentle not oversaturated. No flower clusters, branches, leaves, background, paper, text, shadows outside flowers, or borders. True transparent alpha background, landscape 3:2 canvas.

### rainbowSkyPrompt

Use case: precise-object-edit. Edit target: supplied panoramic landscape. Remove ALL trees, forest, mountains, hills, grass and ground. Replace entire lower portion with open pale blue sky and subtle atmospheric clouds consistent with existing upper sky. Keep soft artistic painterly texture and warm sunlight from upper left, reduce busy dramatic detail, quiet airy background for a separate rainbow overlay. SKY ONLY across whole image, no horizon landscape, no rainbow (added separately by app), no text. Panoramic 3:1 composition.

