# Golden Luxury Theme Design Guidelines

## Design Approach
**Reference-Based: Luxury E-commerce/Premium SaaS**
Drawing inspiration from high-end luxury brands (Rolex, Louis Vuitton digital experiences) and premium product sites (Apple, Tesla). The design emphasizes sophistication, exclusivity, and refined elegance with strategic gold accents against rich dark backgrounds.

## Typography System

**Primary Font:** Playfair Display (serif) - Headlines and premium messaging
**Secondary Font:** Inter (sans-serif) - Body text and UI elements

**Hierarchy:**
- Hero Headlines: text-6xl to text-7xl, font-bold, tracking-tight
- Section Headers: text-4xl to text-5xl, font-semibold
- Subheadings: text-2xl to text-3xl, font-medium
- Body Text: text-base to text-lg, leading-relaxed
- Fine Print: text-sm, tracking-wide, uppercase for labels

## Layout & Spacing System

**Spacing Units:** Use Tailwind's 4, 8, 12, 16, 24, 32 for consistency

**Section Padding:**
- Desktop: py-32 for major sections, py-24 for secondary
- Tablet: py-20 for major sections, py-16 for secondary  
- Mobile: py-16 for major sections, py-12 for secondary

**Container Strategy:**
- Full-width sections with max-w-7xl inner containers
- Text content: max-w-4xl for readability
- Asymmetric layouts encouraged for visual interest

## Core Components

### Navigation
Sticky top navigation with backdrop blur, minimal height (h-20), logo left, menu right with generous spacing (gap-8), gold underline accent on active states

### Hero Section
Full-viewport (min-h-screen) with large background image, overlay gradient for text readability. Centered content with headline, subheadline (max-w-3xl), dual CTA buttons (primary gold, secondary outlined). Buttons require backdrop-blur-md bg-opacity-90 treatment when over images.

### Feature Cards
Grid layouts (grid-cols-1 md:grid-cols-2 lg:grid-cols-3), each card with:
- Gold accent border on top (border-t-4)
- Icon or small image (w-16 h-16)
- Title (text-xl font-semibold)
- Description (text-base)
- Padding: p-8 to p-10
- Subtle hover elevation effect

### CTA Sections
Full-width with background image or solid fill, centered content (max-w-4xl), large headline, supporting text, dual button layout (inline-flex gap-6)

### Testimonials
3-column grid on desktop (2-col tablet, 1-col mobile), each featuring:
- Quote in elegant serif font
- Gold quotation marks or accent line
- Customer photo (rounded-full, w-16 h-16)
- Name and title
- Padding: p-8

### Footer
Multi-column layout (grid-cols-2 lg:grid-cols-4), includes:
- Brand column with logo and tagline
- Quick links navigation
- Contact information with icons
- Newsletter signup with gold accent button
- Bottom bar with copyright and social links
- Overall padding: pt-20 pb-12

## Images Section

### Large Hero Image
**Placement:** Full-width hero section background
**Description:** High-quality, cinematic image conveying luxury and sophistication. Examples: architectural elegance, premium product photography with dramatic lighting, abstract gold metallic textures, or minimalist luxury interior. Image should have darker tones to complement gold accents and ensure text readability with subtle gradient overlay.

### Supporting Images
**Feature Sections:** 3-4 high-quality images showing product details, lifestyle contexts, or service applications. Place in alternating left-right layouts with text.

**Portfolio/Gallery:** If applicable, masonry grid or card-based layout showcasing work/products with 2:3 or 16:9 aspect ratios.

**Team/About:** Professional headshots with consistent styling, subtle gold border treatment.

## Visual Refinements

**Borders & Dividers:** Use hairline borders (border-opacity-20), gold accent lines (h-px or w-1) sparingly for emphasis

**Cards & Containers:** Subtle elevation with border treatment, avoid heavy shadows. Use border-opacity for sophisticated separation.

**Icons:** Use Heroicons (outline style) exclusively, sized at w-6 h-6 for standard use, w-8 h-8 for feature emphasis, w-12 h-12 for hero sections

**Buttons:** Primary buttons use gold background with dark text, secondary buttons use outlined style with gold border. All buttons over images require backdrop-blur-md treatment.

**Forms:** Input fields with minimal styling, border-b-2 underline approach, gold focus states, generous padding (px-6 py-4)

## Animation Philosophy
Minimal, refined animations only. Subtle fade-ins on scroll, gentle hover state transitions (transition-all duration-300). Avoid distracting motion - let the luxury aesthetic speak through stillness and elegance.