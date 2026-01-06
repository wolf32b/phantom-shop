# Persona 5 "Phantom Thieves" Golden Design Guidelines

## Design Approach
**Reference-Based: Persona 5 Gaming Aesthetic**
Drawing directly from Persona 5's bold visual language with angular UI, dramatic contrast, and rebellious energy. Combines crimson red (#DC143C), pure black (#000000), and brilliant metallic gold (#FFD700) with jagged geometric shapes, halftone textures, and "calling card" typography. This is a high-energy, stylized interface that demands attention.

## Typography System

**Primary Font:** Bebas Neue or Oswald - All caps headlines, angular and bold
**Secondary Font:** Roboto Condensed - Body text, menu items, and UI labels

**Hierarchy:**
- Hero Headlines: text-7xl to text-8xl, font-black, tracking-tighter, uppercase
- Section Headers: text-5xl to text-6xl, font-bold, uppercase, skewed transforms
- Subheadings: text-3xl, font-semibold, uppercase
- Body Text: text-lg, leading-relaxed, normal case
- Labels: text-xs to text-sm, uppercase, tracking-widest

## Layout & Spacing System

**Spacing Units:** Tailwind's 4, 8, 16, 24, 32 for aggressive geometric rhythm

**Section Padding:**
- Desktop: py-24 for major sections, py-16 for secondary
- Tablet: py-16, py-12 for secondary
- Mobile: py-12, py-8 for secondary

**Angular Layout Strategy:**
- Use CSS transforms: skew, rotate for dynamic angles
- Diagonal section dividers with clip-path
- Asymmetric, off-kilter grids
- Jagged borders using SVG patterns or pseudo-elements

## Core Components

### Navigation
Fixed top nav with sharp angular edges, black background with red bottom border (border-b-4 border-red-600). Logo left with gold accent, menu items uppercase with aggressive letter-spacing, gold underline on hover with slide-in animation.

### Hero Section
Full-viewport (min-h-screen) with dramatic background image overlaid with halftone pattern and red gradient. Skewed content container (-skew-y-2), massive headline in Bebas Neue, gold accent bar (h-2 w-24), dual CTAs with angular borders. Primary button: gold bg with black text and sharp corners, secondary: outlined red with transparent fill. Both buttons require backdrop-blur-md bg-black/80 treatment.

### Feature Cards
Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) with cards featuring:
- Angular top-left corner cut (clip-path polygon)
- Red diagonal accent stripe (absolute positioned, -skew-x-12)
- Gold icon (w-12 h-12) with black circular bg
- Title in uppercase bold
- Black bg with red border-l-4
- Padding: p-8
- Hover: gold border glow effect

### "Calling Card" CTA Sections
Full-width with textured background (halftone or noise), dramatic skewed container with torn-paper edge effect. Large proclamation-style headline ("TAKE YOUR HEART"), gold foil stamp effect, date/time typography element, signature-style tagline, single bold CTA button centered.

### Testimonials/Social Proof
2-column grid (1-col mobile) styled as "confidential files":
- Black cards with red corner tabs
- Gold "CLASSIFIED" stamp overlay
- Monospace quote text
- Profile image in circular gold border
- Code-name style attribution
- Padding: p-10

### Footer
Sharp angular top border with sawtooth pattern, 4-column grid on desktop, black bg with red accent lines. Includes:
- Brand logo with gold tagline
- Quick navigation with red hover states
- Newsletter with gold submit button
- Social icons in gold
- Bottom bar with red divider line
- Overall padding: pt-16 pb-8

## Images Section

### Large Hero Image
**Placement:** Full-width hero background
**Description:** High-contrast noir cityscape at night with red neon lights, or abstract geometric pattern with halftone dots on black. Should have dramatic shadows and deep blacks to support gold/red text overlay. Apply red gradient overlay (from-black/80 via-red-900/40 to-black/80).

### Supporting Images
**Feature Sections:** 3-4 images with strong angular crops - masked personas/characters, urban night photography, abstract geometric compositions. Each with red or gold accent borders.

**Accent Elements:** Halftone pattern overlays, torn paper edge textures, "stamp" graphics, scattered playing card motifs.

## Visual Refinements

**Borders:** Bold 2-4px borders in red or gold, never subtle. Use clip-path for angular cuts.

**Patterns:** Halftone dots (radial-gradient circles), diagonal stripes, scattered geometric shapes as background elements.

**Icons:** Heroicons in gold, sized w-8 h-8 standard, w-12 h-12 for emphasis. Place in black circular backgrounds.

**Buttons:** Sharp rectangular with no border-radius. Gold buttons: bg-yellow-400 text-black font-bold uppercase. Red outlined: border-2 border-red-600 text-red-600. Gold shimmer on hover using gradient animation.

**Forms:** Black inputs with red underline (border-b-2), gold focus states, uppercase labels, px-6 py-4 padding.

**Accent Elements:** Diagonal slash dividers between sections, "ripped paper" edges, scattered dot patterns, corner bracket decorations.

## Animation Philosophy
Bold, snappy animations. Sharp slide-ins (transform translateX), quick fade-ups on scroll, button pulse effects. Embrace dramatic transitions (duration-200) that feel immediate and impactful. Gold shimmer effects on key elements using gradient animations.