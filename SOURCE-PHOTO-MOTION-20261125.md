# Source-photo motion — November 25, 2026

Active assets are the exact, unchanged `assets/moon.jpg`, `assets/river.jpg` and `assets/fish.jpg` supplied by the user. No generated imagery, painterly overlay, paper grain, recoloring or substitute fish is active. Previous generated files remain inactive history.

The renderer uses source-region layers: river water is masked with rock exclusions, and eight fish regions have independent bounded motion phases. These are local photo deformations, not separately segmented alpha sprites or a 3D reconstruction. Nearby water may move slightly inside a fish region; movement is deliberately small to retain original forms. Underwater light shifts subtly. Moon retains the six-second rise and exact lunar pixels. Reduced-motion mode freezes movement.

River and Fish fill the screen using proportional cover framing, never stretching objects or using blurred sidebars. Wide or portrait screens crop the original photograph; preserving every edge and simultaneously filling 32:9 without distortion would require a different framing compromise. Original source width is 724px, so the images are not native 8K detail.

Original interface, random falling characters, single tap, audio/About controls and long-touch context-menu suppression are unchanged. Four automated checks cover unchanged asset hashes, active asset/renderer selection, finite geometry and reduced motion. Physical-wall validation remains necessary.
