# Living Ink — Tenzer Wall Study

An interactive, full-screen generative artwork exploring how brush-written kanji can act as portals into animated landscape scenes. Characters drift through a quiet paper-like canvas; selecting one transforms the entire display into a corresponding visual world.

**[Open the live installation →](https://maiapapertowns.github.io/tenzer-wall-site/)**

> Prototype 02 · DePauw Student Research Associate project · Designed for a 7680 × 2160 Windows display and adaptable to desktop, tablet, and touch installations.

## Research premise

Living Ink investigates a simple interaction model: **one character, one touch, one world**. The interface deliberately removes conventional navigation so the artwork can remain approachable in a public space. Meaning is revealed through motion rather than explanatory UI.

The current vocabulary contains 24 concepts. Configuration lives in `config.json`; scene renderers preserve distinct motion for similar meanings.

| Kanji | Concept | Scene behavior |
| --- | --- | --- |
| 花 | Flower | Sakura canopies bloom around a pastel mountain lake; independent petals drift across the scene. |
| 日 | Sun | A warm radial atmosphere expands softly while painted currents and cloud forms settle independently. |
| 虹 | Rainbow | A large rainbow appears against an uncluttered sky. |
| 雨 | Rain | Layered rainfall crosses the complete painting at varied depth, speed, opacity, and scale. |
| 鳥 | Bird | A flock traverses the canvas; the rendered bird species varies between activations. |
| 山 | Mountain | Separate mountain strata rise sequentially through mist to create spatial depth. |
| 雷 | Thunder | Indigo storm clouds drift over a mountain lake; branching lightning illuminates clouds and reflects in the water. |
| 木 | Tree | One prominent tree grows from the selected character; canopy clusters unfold in stages. |
| 森 | Forest | Multiple tree layers and three reference paintings surround the viewer. |
| 馬 | Horse | The glyph enlarges and dissolves into a horse; walking accelerates into a horizontal gallop and exit. |
| 滝 | Waterfall | Ink drips become a luminous blue-white waterfall, with moving water, forest cliffs, mist and spray. |
| 川 | River | Three flowing river channels with faster downstream current trails. |
| 水 | Water | Blue-white painted water; one gentle drop every 3.8 seconds, followed by expanding rings. |
| 海 | Ocean / Sea | Panoramic peach sunset and turquoise surf, fixed horizon and shoreward rolling water. |
| 竹 | Bamboo | Slender stems grow at varied times; sparse leaf sprays slowly open and sway. |
| 猫 | Cat | A fluffy cat walks across the wall with four staggered leg contacts and an independent tail. |
| 葉 | Leaf | Textured leaves form a loose, irregular composition. |
| 雲 | Cloud | Layered clouds drift gently. |
| 星 | Star | Stars twinkle in a dark sky. |
| 魚 | Fish | Koi swim through a bright pond with surface rings. |
| 火 | Fire | Layered flame artwork flickers with rising embers. |
| 月 | Moon | The existing cutout moon rises over an indigo lake, with a warm halo and rippling reflection. |
| 雪 | Snow | White flakes fall and dissolve at ground contact. |
| 風 | Wind | Trees bend while leaves, petals, and drawn gusts cross the scene. |

## Interaction design

- Kanji are distributed through responsive lanes with balanced concept frequency.
- Pairwise spacing correction prevents falling characters from visually sticking together.
- Hammer.js normalizes single-touch input with generous movement thresholds for the infrared sensor.
- Both a short tap and a deliberate press activate the nearest character within an enlarged hit radius.
- Duplicate gesture suppression prevents one physical contact from opening the same scene twice.
- `Enter` and `Space` provide an equivalent keyboard interaction.
- The installation begins behind a restrained onboarding veil and reduces UI prominence after the first interaction.
- Sound is optional and only starts after explicit user input, respecting browser autoplay policies.

## Target installation

| Property | Specification |
| --- | --- |
| Host | Windows PC running Chrome |
| Logical canvas | **7680 × 2160** |
| Video topology | Two 4K outputs; each output drives a 2×2 grid of 1920×1080 panels |
| Input | Infrared touch, up to 32 simultaneous contacts |
| Initial interaction level | Single touch, intentionally optimized before multi-touch and gestures |

At the wall's 32:9 aspect ratio, character size and starting density increase automatically while retaining wide separation. Touch targets are larger than their visible glyphs to compensate for infrared imprecision. The current prototype avoids drag, kinetic scrolling, and edge-dependent controls; those patterns are unreliable on this hardware. Multi-touch recognizers can be introduced through the existing Hammer.js manager after single-touch field testing.

## Technical architecture

The prototype is a buildless static HTML/CSS/JavaScript application built on Canvas 2D and Web Audio. Hammer.js provides a focused gesture-recognition boundary while the visual simulation remains framework-free.

```text
Input (Hammer.js / Pointer Events fallback / keyboard)
          │
          ▼
Character scheduler ──► spatial collision correction
          │
          ▼
Scene state machine ──► particles + image layers + procedural effects
          │
          ▼
requestAnimationFrame render loop ──► responsive Canvas 2D output
```

Each active object carries its own elapsed lifetime. Scene opacity follows a sinusoidal envelope, producing a gentle entrance and exit without abrupt cuts. Visual assets are composited with procedural systems—particles, mist, glow, rain, lightning, and easing—so scenes behave as animations rather than static images appearing on top of the canvas.

### Rendering and performance

- The main canvas caps pixel ratio at `1.5` and total backing pixels at approximately 4.2 million. Scene artwork renders to a reusable layer of at most 1.5 million pixels before compositing; input coordinates remain in CSS pixels.
- Water and pond color treatments are cached once instead of reapplying image filters to every animated strip. The tradeoff is softer background detail on very large/Retina screens, while animation, layout and touch targets are preserved.
- `perf-budget-check.cjs` compares direct versus budgeted drawing. One local Chrome sample at 1200×750/2× backing measured waterfall 4.3→1.4 ms, moon 10.5→1.6 ms, and flower 9.2→1.8 ms per draw. This is a small rendering benchmark, not an end-to-end FPS or touch-latency guarantee on installation hardware.
- Frame delta is clamped to prevent large simulation jumps after a suspended tab resumes.
- Completed characters, particles, ripples, and scenes are removed every frame.
- Image assets and the brush font are preloaded before interaction where practical.
- Responsive sizing uses viewport-relative bounds with explicit minimums and maximums.
- `prefers-reduced-motion` lowers particle and flock counts and accelerates the interaction cadence.

### Typography and visual system

Typography uses Adobe Fonts **UD Digi Kyokasho Pro** (`uddigikyokasho-pro`, weight 400, normal), kit `lyl2dnk`, with a sans-serif fallback and bounded loading timeout. Adobe Fonts needs network access and appropriate kit domain settings. The neutral paper ground and artwork draw on East Asian painting references.

### October 2026 motion refresh

Branch-free flower variants, a new ocean painting, and a fluffy cat rig were generated with the built-in image tool. Asset paths and prompts are documented in `REFRESH-20261007.md`. Existing reference art is retained separately. Lightning now has four branched bolts per strike at 1.15-second intervals, with localized glow rather than repeated full-screen white flashes. Reduced-motion mode uses a static, restrained strike.

The four reference-led landscape revisions are documented in `DREAM-SCENES.md`, including generated asset paths and prompts. Each uses its own environment; cherry blossoms are not added to every scene.

The later 3:1 waterfall, slow-drip water and sunset-sea revisions are documented in `WATER-PANORAMA-PROMPTS.md`; they closely follow the supplied card references with lettering and blossoms removed.

`world-check.cjs` checks eleven changed scenes for animation, deterministic reduced-motion rendering, and clean fade-out, plus horse exit coordinates at 1200 and 7680 pixels. These browser checks do not replace an on-wall hardware/performance or accessibility review.

## Project structure

```text
.
├── .openai/
│   └── hosting.json       # Static hosting configuration
└── dist/
    ├── index.html         # Semantic shell and installation controls
    ├── styles.css         # Responsive presentation and accessibility states
    ├── app.js             # Simulation, interaction, audio, and rendering systems
    ├── config.json        # 24 concepts and scene parameters
    ├── config-loader.js   # Validated configuration
    ├── stock-scenes.js    # Asset preparation and scene dispatch
    ├── nature-scenes.js   # Nature animation systems
    ├── world-scenes.js    # Forest, horse, waterfall, flower, fluffy cat
    ├── dream-scenes.js    # Reference-led flower, thunder, waterfall and moon
    ├── render-budget.js   # Bounded reusable scene surfaces for responsive rendering
    └── assets/            # Font and composited scene artwork
```

## Run locally

No build step is required. Serve `dist/` with any static web server:

```bash
cd dist
python3 -m http.server 4175
```

Then open [http://127.0.0.1:4175](http://127.0.0.1:4175).

For installation use, launch a current Chromium-based browser with `F11` or kiosk mode. Hammer.js consumes Pointer Events when available, while the fallback keeps the same canvas usable with a mouse, touch display, or pen if the library cannot load.

## Deployment

The production build is deployed as a static site:

- **Live:** [maiapapertowns.github.io/tenzer-wall-site](https://maiapapertowns.github.io/tenzer-wall-site/)
- **Public deployment:** [maiaPaperTowns/tenzer-wall-site](https://github.com/maiaPaperTowns/tenzer-wall-site), files at repository root.
- **Document root:** `dist/`
- **Authoring source:** `authorized-site/`, mirrored into `dist/` before GitHub publication. Legacy hosting configuration is not used for this deployment.

## Evaluation plan

The next research iteration can evaluate:

1. **Discoverability:** Do first-time viewers understand that the characters are interactive without instruction?
2. **Embodied pacing:** Does the character fall rate allow comfortable selection on a large wall display?
3. **Semantic legibility:** Can viewers associate each transformation with its kanji after repeated exposure?
4. **Affective response:** Do reveal timing, density, color, and sound sustain a soft, immersive mood?
5. **Display resilience:** How consistently do composition, hit targets, and frame time hold across aspect ratios and touch hardware?

Useful measurements include time to first interaction, successful-target rate, repeat activations per concept, dwell time, frame-time percentiles, and short qualitative interviews. Any analytics should be opt-in and avoid collecting identifying information.

## Roadmap

- Evaluate the expanded 24-concept scene registry on the physical wall.
- Add deterministic random seeds for repeatable studies and visual regression tests.
- Separate simulation, rendering, and content configuration into testable modules.
- Introduce automated checks for keyboard access, reduced motion, and multiple aspect ratios.
- Add an installation mode with calibration, idle reset, diagnostics, and offline asset verification.
- Explore multi-character encounters where one scene dissolves naturally into the next.

## Status

This repository contains a research prototype, not a production installation package. Artwork and interaction parameters are under active iteration. Confirm font and image licensing before redistribution or public commercial use.
