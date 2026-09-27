# Tenzer Wall Prototype 2 — datasets

The installation is a static web app. `config.json` is the content dataset, not a database. The application fetches and validates it, prepares the referenced images, distributes characters fairly with random selection among equally represented entries, and dispatches touches to a reusable animation behavior.

Content flow: **JSON dataset → validation → asset preparation → character → touch → configured behavior and sound**.

## Add or replace a character

1. Put authorized images (and optional sound or character SVG) in `assets/`.
2. Add or edit an entry in `config.json`. IDs must be unique.
3. Update `ASSET-SOURCES.md` with the source and licensing record.
4. Publish the static files together. No build step or core JavaScript edit is needed for existing behaviors.

Minimal entry (replace the illustrative filenames with real files):

```json
{
  "id": "new-character",
  "glyph": "雪",
  "meaning": "Snow",
  "behavior": "reveal",
  "assets": ["assets/my-licensed-painting.jpg"],
  "sound": {"src": "assets/my-licensed-sound.mp3", "volume": 0.4},
  "duration": 15
}
```

This example reuses the painting-reveal effect; it does not create a snowfall algorithm. **A genuinely new animation algorithm still requires a renderer implementation.** Changing a character, images, sound, timing, or selecting an existing behavior does not.

## Fields

| Field | Meaning |
|---|---|
| `version` | Dataset schema version; currently `1` |
| `title`, `background` | Page title and six-digit hex canvas background |
| `entries` | Character records; at least one enabled record required |
| `id`, `meaning` | Unique stable identifier and human-readable label |
| `glyph` | Font-rendered character; keeps the existing brush typeface |
| `kanjiAsset` | Optional SVG/PNG character artwork, preferred over `glyph` |
| `enabled` | Set `false` to remove a record from selection without deleting it |
| `behavior` | `bloom`, `glow`, `fly`, `reveal`, `mountain`, `rainbow`, `lightning`, `rain`, `tree`, `fire`, `moon`, `snow`, `wind`, `river`, `ocean`, `water`, `bamboo`, `fish`, `star`, `cloud`, `leaves`, `cat` |
| `assets` | Array of image URLs, relative to the dataset location |
| `duration` | Total scene lifetime in seconds, including enter/exit fades |
| `transitions` | `enter`, `exit`, and `switch` seconds; record values override dataset defaults |
| `hue` | Interaction-ripple hue, 0–360 |
| `sound` | Optional `{src, volume}` audio file, or `{frequency}` synthesized chime; omit for silence |
| `crops` | Optional `{asset, crop, shape}` records; asset is an array index, crop is normalized `[x,y,width,height]`; shape is a normalized polygon within that crop |
| `variants` | Glow compositions: `{mode:"backdrop",asset:0}` or `{mode:"disc",asset:0,rays:1}` |
| `options` | Behavior-specific settings below |

If `crops` is omitted, the entire image is used. Canvas masks preserve the loaded asset pixels. Some loaded assets are explicitly documented AI-assisted derivatives, not untouched originals. Set crop `transparent: true` to preserve an asset's alpha without circular feathering. Optional normalized `pivot` controls a bloom's petal hinge. Fly crops can specify `facing: -1` for left-facing source art (mirrored for rightward flight), plus `wing: {pivot, shape}` for a continuous single-image wing deformation, not a duplicated overlay. Glow `disc` mode expects a centered solar-disc source; use `backdrop` for arbitrary paintings.

The `mountain` behavior accepts `layers`: `{crop, x, y, width, opacity, delay}`. Coordinates and width are normalized; delay is seconds. Each crop is a separate mass, faded and lifted in depth order. Use sufficiently large licensed or approved derived cutouts for the target display.

### Behavior options

- `bloom`: `countMin`, `countMax`, `reducedCount`, `spreadSeconds`, `openSeconds`.
- `glow`: `settleSeconds`, `pulseSeconds`.
- `fly`: `count`, `reducedCount`, `flightSeconds`, `staggerSeconds`, `flapSeconds`.
- `mountain`: `revealSeconds`.
- `reveal`: `revealSeconds`, `staggerSeconds`.
- `rainbow`: `growSeconds`, `scale`; assets are the sky and transparent spectral layer.
- `lightning`: `intervalSeconds` (minimum 2.4), `strikeSeconds`; no rapid full-frame strobe.
- `rain`: `count`, `reducedCount`, `speed`, `surfaces` aligned to assets. Active dataset uses two floor backgrounds (dark and purple).
- `bamboo`: `count`, `growSeconds`; transparent leaf spray attaches at its left-center.
- `fish`: `count`, `swimSeconds`; first asset is a 2×2 right-facing koi atlas, second is water.
- `star`: `count`, `nightSeconds`; astronomical backgrounds alternate across activations.
- `cloud`: `count`, `driftSeconds`; 2×2 cloud atlas with edge feathering.
- `leaves`: `count`, `growSeconds`; 2×2 upright leaf atlas.
- `cat`: `crossSeconds`; consistent right-facing walk poses in a 2×2 atlas.
- `tree`: `growSeconds`; transparent whole tree and shrub sprite, rooted reveal.
- `fire`: `spreadSeconds`, `emberCount`; transparent four-plume atlas.
- `moon`: `nightSeconds`, `riseSeconds`; isolated moon asset.
- `snow`: `count`, `reducedCount`; winter plate then crystal sprite, with ground-contact melting.
- `wind`: `count`, `reducedCount`; transparent wind-bent grove, leaf sprigs sampled from it.
- `river`: `flowSeconds`, normalized `channels` paths; flow follows smoothed curves.
- `ocean`: `waveSeconds`; isolated breaking wave with shoreward motion.
- `water`: continuous surface and 20 expanding ripple rings; no flying glyph-dot effect.

Existing defaults preserve the current effects. The renderer contains motion algorithms, not character names, source filenames, or character-specific crop coordinates.

## Switch the entire installation

Use the default `config.json`, or open `?dataset=datasets/another-show.json`. The alternate dataset can have entirely different IDs, glyphs, image assets, and sounds. Relative asset paths resolve from that JSON file, so a dataset in `datasets/` can use `../assets/example.jpg`. Dataset and asset URLs must remain on the same origin. Use an HTTP server, not a `file://` URL.

## Failure behavior

Invalid configuration shows an explanatory startup message and keeps Begin disabled. If a character's image or glyph asset fails, that record is unavailable; the other loaded records remain usable and the startup screen lists the affected meanings. Image loading has a 30-second timeout. An audio failure does not interrupt the scene. Audio is opt-in through Sound on.

## Public-wall input

A document-level capture listener cancels `contextmenu` on the canvas, controls, and overlays. Native dragging and touch callouts are disabled. Hammer's tap/press recognizers remain enabled; non-primary mouse release is ignored in the pointer fallback. This suppresses the web page's menu, not Windows shell or browser-chrome menus outside the page. Test on the physical infrared wall; if Windows shows its own UI, ask the wall administrator about OS press-and-hold settings.

## Verification

`node config.test.cjs` tests dataset validation. `prototype2.test.cjs` exercises the real browser: transitions, right-click cancellation, press activation, all configured variants, alternate dataset and glyph assets, audio routing, and visible invalid-config errors. Browser tests need Playwright, Chrome, and the local preview server. These tooling files belong in the research repository, not the public deployment repository.
