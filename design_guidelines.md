# Persona 5 "Phantom Thieves" Red/Black/White Design Guidelines

## Design Approach
**Reference-Based: Persona 5 Gaming Aesthetic**
High-contrast noir interface with crimson red (#DC143C), pure black (#000000), and stark white (#FFFFFF). Angular UI with jagged geometric shapes, halftone textures, and rebellious "calling card" typography. Bold, stylized, attention-demanding.

## Typography System
**Primary:** Bebas Neue (all caps headlines)
**Secondary:** Roboto Condensed (body, UI labels)

**Hierarchy:**
- Hero Headlines: text-7xl to text-9xl, font-black, uppercase, tracking-tighter
- Section Headers: text-5xl to text-6xl, font-bold, uppercase, skew transforms
- Subheadings: text-3xl, font-semibold, uppercase
- Body: text-lg, leading-relaxed, normal case
- Labels: text-xs to text-sm, uppercase, tracking-widest

## Layout & Spacing
**Units:** Tailwind 4, 8, 16, 24, 32 for aggressive rhythm
**Section Padding:** py-24 desktop, py-16 tablet, py-12 mobile
**Angular Strategy:** CSS skew/rotate transforms, diagonal clip-path dividers, asymmetric grids, jagged SVG borders

## Core Components

### Navigation
Fixed top, black background, red bottom border (border-b-4). Logo left with white accent, uppercase menu items with wide tracking, red underline on hover with slide animation.

### Hero Section
Full-viewport with dramatic noir cityscape background. Black halftone overlay with red gradient (from-black/90 via-red-900/50 to-black/90). Skewed content container (-skew-y-2), massive white headline, red accent bar (h-2 w-32), dual CTAs: primary red button (bg-red-600, white text), secondary outlined white (border-2 border-white, text-white). Buttons require backdrop-blur-md bg-black/80.

### Feature Cards
Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3). Cards with angular top-right corner cut, red diagonal stripe accent, white icon (w-12) on black circle, white title, black bg with red border-l-4, p-8. Hover: red glow border.

### Black Market Section
Underground shop aesthetic with scattered "wanted poster" product cards. Dark textured background with torn-paper dividers. Grid layout (grid-cols-2 lg:grid-cols-4) featuring:
- Product cards: Black bg, white jagged border, red "STOLEN GOODS" stamp overlay
- Diagonal red price tag in corner
- Product image with halftone overlay
- Bold white product name in Bebas Neue
- Red "ADD TO CART" button
- Scattered confidential file aesthetics
- Section header: "THE BLACK MARKET" in massive skewed text with red underline slash

### "Calling Card" CTA
Full-width halftone background, dramatic skewed container with torn edges. Large proclamation headline in white ("CHANGE YOUR FATE"), red stamp effect, date typography, centered red CTA button.

### Testimonials
2-column grid (1-col mobile) as "phantom files". Black cards with red corner brackets, white monospace quotes, circular profile images with red border, code-name attribution, p-10 padding.

### Footer
Sawtooth top border pattern, 4-column desktop grid, black bg with red dividers. Logo with white tagline, navigation with red hovers, newsletter with red submit button, white social icons. Padding: pt-16 pb-8.

## Images

### Large Hero Image
Full-width background: High-contrast noir cityscape at night with neon red accents, or abstract geometric halftone pattern. Deep blacks, dramatic shadows. Apply red gradient overlay.

### Supporting Images
- Black Market products: 8-12 stylized item images (masks, weapons, accessories) with red accent lighting
- Feature sections: 3-4 angular-cropped urban night photography or abstract geometric compositions, white/red borders
- Accent elements: Halftone patterns, torn paper textures, playing card motifs, "WANTED" poster graphics

## Visual Refinements
**Borders:** Bold 2-4px in red or white, clip-path angular cuts
**Patterns:** Halftone dots, diagonal stripes, scattered geometric shapes
**Icons:** Heroicons in white, w-8 standard, w-12 emphasis, black circular backgrounds
**Buttons:** Sharp rectangular, no radius. Red buttons: bg-red-600 text-white. White outlined: border-2 border-white text-white. No hover backgrounds on image overlays.
**Forms:** Black inputs, red underline (border-b-2), white focus states, uppercase labels, px-6 py-4
**Accents:** Diagonal slash dividers, ripped paper edges, corner bracket decorations, scattered dot patterns

## Animation Philosophy
Snappy, bold transitions (duration-200). Sharp slide-ins, quick fade-ups on scroll, dramatic skew animations. Red shimmer effects on key CTAs using gradient animations.