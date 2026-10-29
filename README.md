# Living Ink — Tenzer Kanji Wall

An immersive, touch-responsive artwork that connects Kanji characters with their meanings. Falling characters become animated landscapes, plants, animals and weather when selected.

**[Explore the live Kanji Wall](https://maiapapertowns.github.io/tenzer-wall-site/)** · [Source repository](https://github.com/maiaPaperTowns/tenzer-wall) · [Deployment repository](https://github.com/maiaPaperTowns/tenzer-wall-site)

Prototype 02 · DePauw University · Documentation updated October 29, 2026

## Experience

The wall opens on a fixed, misty ink-wash mountain background with a blush watercolor welcome panel. Kanji begin falling after artwork loads, so visitors can see the interaction before dismissing the welcome message with **Explore**.

Click or touch a falling character to reveal its meaning as an animated scene. Selecting another character transitions to its scene; completed scenes fade back to the wall. **Sound** and **About** sit together at the bottom center. The About panel explains the project and credits its contributors.

The dataset contains **29 characters**. Each complete scheduling round includes every available character once in a random order, keeping appearance counts balanced. Characters share the same size within a viewport and remain upright. Random starting positions, varied fall speeds, gentle horizontal drift and spacing correction create variation without crowding. Activated glyphs fade over approximately 3.8 seconds; characters approaching the bottom also fade gradually.

## Latest artwork and motion

The current artwork uses separately animated sprites, masked cloud layers, water movement and procedural effects. Backgrounds use proportional cover fitting, with cropping where needed to fill the viewport; foreground sprites preserve their proportions.

- **Flower:** 14 ivory-white watercolor flower and branch clusters bloom at staggered times, with gentle swaying and drifting petals.
- **Cherry Blossom:** muted pink flowering branches frame a Japanese wooden bridge and stream. Branches bloom and sway, with falling petals and a softer background palette.
- **Cat:** a seated calico stays anchored to the stone wall while its separate tail sways. Clouds drift behind it.
- **Atmosphere:** moving cloud layers extend across sand, tree, moon, river, horse, ocean and flower scenes; storm clouds move around the lightning.
- **Plants:** tree canopies, forest foliage, leafy branches, bamboo and hanging wisteria have continuing motion. Tree trunks remain established while the canopy moves.
- **Water:** river flow, ocean crests, pond reflections, rain ripples and waterfall spray provide movement within the landscape.
- **Reveals:** horse and waterfall scenes enter directly with their animation. Sand appears as a complete scene rather than a horizontal reveal.

| Kanji | Meaning | Scene |
| --- | --- | --- |
| 森 | Forest | Layered green woodland, subtle foliage movement, sunlight and airborne particles. |
| 馬 | Horse | Full-body gallop moving across a meadow, with drifting clouds. |
| 滝 | Waterfall | Flowing water with white spray, foam and mist at its base. |
| 猫 | Cat | Calico seated on a wall, with a moving tail and clouds. |
| 葉 | Leaf | Green leaves and branches flutter and sway. |
| 花 | Flower | White watercolor flowers bloom across multiple branches. |
| 桜 | Cherry Blossom | Muted pink blossoms and falling petals around a wooden bridge. |
| 竹 | Bamboo | Separate bamboo layers sway in filtered light. |
| 木 | Tree | Established trunk and roots with a moving canopy and sky. |
| 川 | River | Flowing channels and foam around anchored rocks. |
| 海 | Ocean / Sea | Moving water, advancing wave crests and drifting sunset clouds. |
| 水 | Water | Painted water with surface movement and expanding drop rings. |
| 雨 | Rain | Falling rain, animated surface rings and descending petals. |
| 雷 | Thunder | Moving storm clouds and irregular branching lightning. |
| 風 | Wind | Animated gust ribbons, cloud forms and sweeping particles. |
| 氷 | Ice | Separate ice clusters appear with small glints. |
| 蓮 | Lotus | Pink blossoms and green pads drift over moving pond reflections. |
| 藤 | Wisteria | Hanging purple flower clusters sway beneath a pergola. |
| 砂 | Sand | Sunset dunes with drifting clouds and fine sand movement. |
| 月 | Moon | Large moon over a lake with cloud and reflection movement. |
| 星 | Star | Twinkling stars and independently timed meteor trails. |
| 火 | Fire | Animated painted flames and rising embers. |
| 雪 | Snow | Falling snowflakes dissolve near the ground. |
| 雲 | Cloud | Layered clouds drift across the scene. |
| 日 | Sun | Warm light, atmospheric currents and cloud movement. |
| 虹 | Rainbow | Rainbow landscape with moving atmospheric and rain effects. |
| 山 | Mountain | Layered mountain forms and moving mist. |
| 鳥 | Bird | Animated flocks cross the display. |
| 魚 | Fish | Koi swim beneath pond ripples. |

## Sound, input and accessibility

Sound starts only after the visitor enables it. Characters share the same gentle synthesized chime, gain level and envelope, with a distinct, stable pitch per character. This uses a common volume setting; perceived loudness can still vary with pitch and playback hardware.

Mouse, touch and pen input use Hammer.js with a Pointer Events fallback. Enlarged hit areas help selection on the infrared wall, and duplicate gesture suppression reduces repeated activations from one touch. **Enter** or **Space** starts the experience or activates an available character when focus is outside the controls.

Buttons expose focus states. About uses a native dialog and restores focus when closed. Reduced-motion preferences are passed to the renderers to restrain or freeze scene animation. These features do not constitute a complete accessibility audit.

Kanji drawing prefers **UD Digi Kyokasho NK-B**, then Adobe Fonts **UD Digi Kyokasho Pro**, then a system sans-serif fallback. The Adobe kit requires connectivity and a permitted domain. Welcome and About headings use serif typography with responsive HTML text.

## Run locally

The artwork is a buildless static HTML/CSS/JavaScript application. No package installation is required to serve it. From the repository root:

```bash
python3 -m http.server 4183 --bind 127.0.0.1 --directory authorized-site
```

Open **http://127.0.0.1:4183/**. Replace `authorized-site` with `dist` to preview the deployment mirror.

Use HTTP or HTTPS rather than opening `index.html` through `file://`. The configuration loader enforces same-origin URLs; opening the file directly can show **Artwork unavailable** or **Assets and datasets must use this website’s origin**. Use the local server or the live installation link instead.

For the physical wall, use a current Chromium-based browser in fullscreen or kiosk mode. External font and gesture-library requests need connectivity; font and input fallbacks are provided.

## Project structure

```text
authorized-site/                Authoring source
  index.html                   Welcome, controls, About and canvas shell
  styles.css                   Responsive watercolor UI and fixed wall background
  app.js                       Scheduling, interaction, audio and scene lifecycle
  config.json                  29 concepts, assets, durations and transitions
  config-loader.js             Validation and same-origin loading
  stock-scenes.js              Asset preparation and scene dispatch
  dream-scenes.js              Layered scenes and atmospheric effects
  world-scenes.js              Landscape, animal and plant animation systems
  nature-scenes.js             Additional natural effects and renderers
  render-budget.js             Reusable scene canvas with bounded resolution
  assets/derived/              Generated artwork and sprite atlases
  assets/stock/                Supporting photographic assets
  *.cjs                        Preview, validation and browser-check scripts
dist/                          Deployment mirror and supporting legacy assets
research/                      Research drafts, protocols and references
stock-flower-update/            Earlier flower implementation retained for reference
CHI-2027-RESEARCH-PLAN.md        Research planning document
```

Edit `authorized-site/` first and synchronize the intended runtime files into `dist/` before publication. Original artwork and runtime images are retained in the source repository. Many active scenes use WebP copies; original PNGs support further editing. Older assets remain for reference and are not all loaded by the current dataset.

## Configuration and performance

`authorized-site/config.json` defines each glyph, meaning, behavior, assets, duration, options and transition overrides. Defaults are a 1.4-second entrance, 2.2-second exit and 0.75-second scene switch; individual entries can override them. Optional datasets use `?dataset=...`, subject to configuration validation and same-origin rules.

The application uses Canvas 2D, Web Audio and `requestAnimationFrame`, without a frontend framework or compilation step. Each scene tracks elapsed time and composites background plates, sprites and procedural effects into a reusable surface.

- Main canvas: pixel ratio capped at **1.5**, with approximately **4.2 million backing pixels** maximum.
- Scene surface: capped at **3 million pixels**, preserving aspect ratio.
- Character movement uses a clamped frame delta to limit jumps after tab suspension.
- Completed characters, scenes and interaction ripples are removed during the render loop.
- Images, masks and color treatments are cached where supported by the renderers.

These budgets balance detail and rendering cost; they do not promise native-resolution artwork across the entire 7680 × 2160 wall. Frame rate and touch latency should be measured on installation hardware.

## Validation

The configuration check uses Node.js built-in modules:

```bash
node authorized-site/config.test.cjs
```

Additional browser checks cover portrait and landscape scene fitting, continuing animation, reduced-motion stability, clean exits, character balance, UI and rendering budgets. Examples include `layered-motion-check.cjs`, `balanced-falling-check.cjs`, `wall-ui-check.cjs` and `perf-budget-check.cjs`. They require the browser tooling and preview setup expected by each script; inspect their setup before running on a new machine.

Configuration validation passed 15 assertions during the October 29 repository sync. Earlier scene checks are recorded with the artwork revisions. These checks do not replace on-wall testing or an accessibility review.

## Artwork documentation

- [White flowers, cherry bridge and calico cat](https://github.com/maiaPaperTowns/tenzer-wall/blob/main/authorized-site/WHITE-SAKURA-CALICO-20261008.md)
- [Watercolor flower revision](https://github.com/maiaPaperTowns/tenzer-wall/blob/main/authorized-site/FLOWER-WATERCOLOR-20261008.md)
- [Layered motion revision](https://github.com/maiaPaperTowns/tenzer-wall/blob/main/authorized-site/LAYERED-MOTION-20261007.md)
- [Nature reference prompts](https://github.com/maiaPaperTowns/tenzer-wall/blob/main/authorized-site/NATURE-REFERENCE-PROMPTS.md)
- [Water and landscape prompts](https://github.com/maiaPaperTowns/tenzer-wall/blob/main/authorized-site/WATER-PANORAMA-PROMPTS.md)
- [Asset sources](https://github.com/maiaPaperTowns/tenzer-wall/blob/main/authorized-site/ASSET-SOURCES.md)

These documents record individual revisions and may describe earlier artwork. The current configuration and active renderers identify what is used now. Public repository visibility does not grant a blanket license to third-party fonts or images; consult source and license information before reuse.

## Deployment and installation

The live experience uses **GitHub Pages**, with runtime files at the root of [tenzer-wall-site](https://github.com/maiaPaperTowns/tenzer-wall-site). [tenzer-wall](https://github.com/maiaPaperTowns/tenzer-wall) contains authoring source, the deployment mirror, original artwork and research materials. Both repositories are public. Legacy hosting configuration is not the active deployment path.

The target installation is a Windows PC running Chrome with a **7680 × 2160** logical display and an infrared touch frame supporting up to 32 contacts. Interaction currently centers on selecting one character at a time; hardware capacity is not a claim of tested multi-user interaction. Responsive layouts also support desktop, tablet and portrait previews.

## Credits and research

Designed by **Dave Berque, Hiroko Chiba and Maia Le**; implemented by **Maia Le**. The experience is modeled after a museum exhibit produced by the Japanese design group **teamLab**. At DePauw University, the project was supported by the **Tenzer Technology Center** and the **Information Technology Associates (ITAP) program**.

The research premise is **one character, one touch, one world**: explore whether artistic interaction helps visitors connect Kanji forms with their meanings. Literature reviews, study protocols and CHI 2027 planning materials are in `research/` and the root research plan. They are working documents, not evidence that a study has been conducted or approved.

Next steps include on-wall evaluation of discoverability, selection accuracy, pacing, semantic recall and rendering performance, together with accessibility and installation-resilience work.
