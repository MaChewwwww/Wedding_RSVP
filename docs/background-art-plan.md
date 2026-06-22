# Generated Background Art Plan

## Purpose

The supplied assets establish the visual language but do not cover every section. A coordinated set of new background artworks should be generated before frontend implementation so the long-scroll page feels continuous rather than alternating between illustrated and empty sections.

These are standalone raster assets. They must not contain UI layouts, embedded text, fake photo frames, buttons, cards, QR codes, or other elements that would conflict with actual page content.

## Shared art direction

All generated backgrounds should use:

- soft watercolor and gouache treatment;
- subtle handmade-paper grain;
- pastel blush, sage, butter yellow, powder blue, cream, and restrained warm clay;
- delicate garden flowers consistent with the supplied meadow and patchwork assets;
- diffuse daylight, except the footer’s dusk treatment;
- gentle imperfection rather than glossy digital gradients;
- low visual contrast in content-safe areas;
- edge-weighted decoration so text and photographs remain readable.

The set should feel related to the existing artwork without copying an identifiable artist’s style.

## Required assets

| Working filename | Section | Desktop composition | Mobile requirement |
| --- | --- | --- | --- |
| `bg-timeline.png` | Our Story Timeline | Tall warm paper landscape with faint story-path details and a clear central vertical corridor | Dedicated portrait variant strongly recommended |
| `bg-gallery.png` | Pre-wedding Gallery | Wide pastel paper wash with pressed flowers around top/side edges | Crop-safe, but portrait variant preferred |
| `bg-invitations.png` | Invitations | Elegant stationery-table atmosphere with lace, ribbon, and botanical edge details; empty center | Dedicated portrait variant |
| `bg-entourage.png` | The Entourage | Loose floral arch around outer edges with broad open center | Dedicated portrait variant to prevent portrait collisions |
| `bg-faq.png` | Questions & Answers | Minimal warm paper with sparse corner botanicals | Desktop asset may be crop-safe if corners survive |
| `bg-love-gift.png` | Love Gift | Refined gift-table atmosphere with subtle ribbon, blossoms, and warm paper perimeter | Dedicated portrait variant recommended |
| `bg-footer.png` | Footer | Panoramic pastel meadow at dusk, visually echoing `bg2.png` | Dedicated shallow portrait/mobile footer variant |

Optional venue companion assets:

| Working filename | Use |
| --- | --- |
| `bg-preparation-venue.png` | Watercolor exterior/interior based on the final preparation venue |
| `bg-reception-venue.png` | Watercolor reception venue based on final reference photography |

Venue-specific artwork should only be generated after the actual venue is confirmed and reference photos are available. It must not invent misleading architecture.

## Generation briefs

### Timeline

Create a tall, seamless-feeling watercolor background on warm handmade paper. Use faint winding stems, small dated-keepsake motifs, and barely visible landscape transitions near the outer thirds. Preserve a wide, low-detail vertical corridor through the center for the timeline rule and year markers. No text, numbers, people, frames, or photographs.

Suggested source size:

- desktop: 1920×2600 or larger;
- mobile: 1080×2400 or larger.

### Pre-wedding gallery

Create a wide pastel watercolor paper backdrop with a subtle blush-to-cream wash. Place pressed flowers, small leaves, and ribbon fragments around the upper and side edges. Keep the middle 70% visually quiet for large horizontal photographs. No frames, cards, text, people, or image placeholders.

Suggested source size:

- desktop: 2400×1400 or larger;
- mobile: 1080×1800 or larger.

### Invitations

Create an elegant overhead stationery-table atmosphere in watercolor: cream paper, faint lace edges, a soft silk ribbon, tiny blossoms, and restrained warm shadows. The central presentation area must remain empty because the real invitation carousel will be placed there. Do not generate invitation cards, envelopes, stamps, seals, handwriting, or readable text.

Suggested source size:

- desktop: 1920×1400 or larger;
- mobile: 1080×1800 or larger.

### Entourage

Create a celebratory but restrained watercolor floral arch using pastel garden flowers and sage leaves around the outer border. Keep the center broad, pale, and low-detail for circular portraits and names. Maintain balanced visual weight without creating individual wreaths or fake portrait frames.

Suggested source size:

- desktop: 1920×1800 or larger;
- mobile: 1080×2400 or larger.

### FAQ

Create a minimal warm ivory handmade-paper background with very sparse watercolor botanicals in the corners and occasional faint paper fibers. The center must be nearly plain to support multiple accordion rows and strong text contrast. No question marks, lettering, icons, or decorative boxes.

Suggested source size:

- desktop: 1920×1600 or larger;
- mobile: 1080×2000 or larger.

### Love Gift

Create a refined watercolor background suggesting a wedding gift table through peripheral details only: a soft ribbon, a few small blossoms, cream wrapping paper, and subtle golden-beige accents. Keep the center and lower-center open for account details and real QR images. Do not generate currency, bank logos, account numbers, QR patterns, gift cards, or readable labels.

Suggested source size:

- desktop: 1920×1400 or larger;
- mobile: 1080×1800 or larger.

### Footer

Create a shallow panoramic watercolor meadow at pastel dusk that echoes the flower field in `bg2.png`, using muted pink, lavender, powder blue, and sage. Keep the central sky calm for the couple’s names and closing line. Avoid people, buildings, text, dramatic darkness, or high-contrast flowers behind the content.

Suggested source size:

- desktop: 2400×900 or larger;
- mobile: 1080×1000 or larger.

## Production workflow

1. Generate two or three candidates for each background.
2. Review them together as one continuous page, not as isolated images.
3. Review the mobile composition first at 390px, then verify 320px and desktop layouts.
4. Select candidates based on safe zones, palette consistency, and section purpose.
5. Correct artifacts and produce desktop/mobile variants.
6. Export lossless masters.
7. Produce optimized AVIF/WebP delivery versions during implementation.
8. Record dimensions, focal points, alt treatment, and approved crop behavior in the asset configuration.

## Acceptance checklist

- No accidental lettering or pseudo-text.
- No fake UI or content containers.
- No malformed flowers, objects, architecture, or QR-like patterns.
- Text-safe area is large enough at desktop and mobile sizes.
- Section content remains the visual priority.
- Palette matches the supplied assets when viewed in sequence.
- Background does not make the site feel like unrelated illustrated slides.
- Mobile crop does not remove all decorative context.
- Mobile artwork leaves enough safe space for real content without relying on precise absolute positioning.
- Image compression does not create visible banding or muddy paper texture.
