# October 7 nature reference refresh

All new visuals were generated with the built-in imagegen tool from the user's corresponding card screenshots. No fallback CLI generation was used. Selected PNG originals are retained in `authorized-site/assets/derived/`; runtime WebP siblings use quality 86 and preserve sprite alpha. Paths below are relative to `authorized-site/`. Superseded previews remain locally and are not used by the site.

## Shared prompt constraints

Use case: stylized-concept (except clean plates: precise-object-edit). Naturally extend each supplied card to a full-bleed 3:1 panorama, matching its dreamy painterly anime-watercolor light and detail, not stretching it. Remove Japanese/English lettering, borders, logos and people. Animated animals are excluded from backgrounds. Transparent atlases explicitly request actual transparency.

## Selected prompt set and saved files

| Saved runtime asset in `assets/derived/` | Final scene-specific prompt specification |
| --- | --- |
| `fire-world-v3.webp` | Orange/gold twisting fire ribbons above dark charcoal, plum smoke, pale yellow cores, lavender haze left, embers; no flowers. |
| `horse-meadow-v2.webp` | Peach sky, lavender snowy mountains, green-gold meadow with horizontal travel lane; sparse wildflowers, no cherry canopy or horse baked in. |
| `green-tree-world-v2.webp` | Latest tree reference: one ancient tree near 60% width, massive textured trunk and exposed roots, lush green canopy, golden shafts, mossy ground. No pink blossoms. |
| `green-tree-plate-v2.webp` | Edit the selected tree panorama: remove only the foreground tree, roots and canopy; reconstruct the sunlit clearing with matching distant woodland and light. |
| `koi-pond-world-v3.webp` | Top-down clear blue-teal pond, light shafts, caustics, indigo edges, sparse corner pink flowers, open central water; no baked fish. |
| `rain-sakura-world-v3.webp` | Dark purple twilight pond, lavender mist, pink cherry branches at edges, subtle surface ripples; no blue ocean, only faint baked rain. |
| `star-lake-world-v3.webp` | Indigo starry sky, lavender haze, distant mountains and village lake; no moon, large starbursts or baked meteor trails. Runtime crops to top 66% for sky-first framing. |
| `forest-world-v2.webp` | Many tall dark trunks receding into blue-green mist, overhead canopy, golden light shafts, mossy path and sparse fireflies; immersive forest, no isolated hero tree. |
| `ice-world-v1.webp` | Glassy frozen lake, blue/peach clouds, pale mountains, large transparent faceted crystal shards around foreground, luminous blue-white edges. |
| `leaf-world-v2.webp` | Warm pink-cream glow, blossoms around edges, sparse corner green canopy, airy center for moving leaves. |
| `lotus-world-v1.webp` | Pink lotus flowers above blue-green round pads, still blue water, warm light, open reflective center, oblique view. |
| `cat-wall-world-v2.webp` | Gray stone wall across foreground, pink sunset and blue hills, cherry branches in upper corners; no baked cat. |
| `sakura-world-v4.webp` | Abundant five-petal pink-white sakura on graceful dark branches around airy pink center; no landscape. |
| `wind-world-v2.webp` | Lavender-blue sky, peach clouds, diffuse sweeping pink-white wind ribbons, sparse blossoms on distant slopes; dynamic airy mood. |
| `sand-world-v1.webp` | Peach-gold dunes with fine ripple texture, curved ridges, lavender sunset clouds and low glowing sun; no plants or flowers. |
| `wisteria-world-v1.webp` | Long purple/lilac racemes hanging from wooden pergola, small warm lantern, dappled garden light and open center. |
| `bamboo-world-v2.webp` | Tall emerald/teal segmented bamboo, irregular depth and spacing, sparse pointed leaf sprays, golden misty sunlight; no flowers. |
| `river-world-v3.webp` | Blue-white fast water in three channels around rocks, green mossy banks, lavender mountains; remove all cherry blossoms and petals. |
| `wildflower-world-v5.webp` | Latest Flower reference: varied pink, orange, yellow, purple and white cosmos/daisies, fresh fine stems, blue sky, airy center; no woody branches or sakura trees. |
| `wildflower-clusters-v1.webp` | Transparent 2×2 atlas: pink cosmos; orange/yellow cosmos; purple daisies; white/yellow daisies. Each cell has separate flower heads and generous transparent gaps, no stems or leaves. |

## Motion and testing

- Five new selectable characters: 氷 Ice, 蓮 Lotus, 桜 Cherry Blossom, 砂 Sand, 藤 Wisteria.
- 花 remains distinct from 桜; current 花 uses varied wildflowers, not sakura.
- 木 uses a clean plate and progressive trunk/canopy masks. 森 uses many enclosing trunks.
- 雷 uses one trunk with subsidiary branches per event, a new shape/location per event and roughly 1–2.7-second irregular intervals. No full-screen white flash. Reduced motion is fixed.
- 星 uses separate twinkle phases, quick meteor trails and one slower comet-like trail; reduced motion disables trails.
- 月 radius is multiplied by 1.25. Existing lake/halo animation is preserved.
- All dynamic renderers respect fade-out and reduced motion. Tests cover these invariants and the full app's input workflow; on-wall hardware performance still needs physical verification.
