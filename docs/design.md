# Design Specification

## Direction

The guest website should feel like a handmade invitation rather than a web dashboard. The supplied watercolor and paper assets carry the identity. UI chrome should remain quiet: generous whitespace, soft paper surfaces, thin dividers, and a limited set of controls.

The admin interface should deliberately switch to a calm operational style: dense enough for tables and check-in, high contrast, minimal decoration, and no wedding-background imagery behind working data.

## Design principles

- One dominant visual idea per section.
- Full-bleed artwork where a background is supplied.
- Generate dedicated backgrounds for sections without supplied artwork instead of leaving visually abrupt plain blocks.
- Generated backgrounds must share the same soft watercolor, handmade paper, and botanical language as the supplied assets.
- Maximum two typefaces.
- Pastel colors for atmosphere, darker ink colors for readable text.
- Avoid generic card grids; use editorial columns, lists, dividers, and framed media.
- Carousels must serve photography or invitation browsing, not routine text.
- Keep controls visually consistent even when section backgrounds vary.

## Suggested design tokens

Final values should be sampled and contrast-tested against the production assets.

| Token | Suggested value | Usage |
| --- | --- | --- |
| `paper` | `#FFF9EF` | Primary light surface |
| `ink` | `#3F3A37` | Main readable text |
| `muted-ink` | `#6F6761` | Secondary text |
| `blush` | `#EFB6C3` | Primary pastel accent |
| `sage` | `#AFC99D` | Secondary accent |
| `sky` | `#B9D8E8` | Informational accent |
| `butter` | `#F5D98B` | Highlight |
| `clay` | `#C99D78` | Envelope/earth accent |
| `focus` | `#315E73` | Accessible focus ring |
| `danger` | `#A13B45` | Destructive/error state |

Do not use pale pastel text on white. Pastels are backgrounds and accents; body copy uses `ink`.

## Typography

- Display: an elegant serif with strong readability, such as Cormorant Garamond or Fraunces.
- Body/UI: Inter, Manrope, or another neutral sans-serif.
- The script lettering embedded in assets is decorative and must not be reused for long UI text.
- Load fonts through `next/font` and provide system fallbacks.
- Suggested scale: 16px body minimum, 18–20px lead text, fluid section headings, and large but restrained couple names.

## Layout and breakpoints

- Mobile is the primary composition, not a compressed desktop layout.
- Mobile-first baseline: 320px and above.
- Content max width: approximately 1120–1200px, while backgrounds remain full bleed.
- Horizontal page padding: 20–24px mobile, 40–64px tablet/desktop.
- Sticky navbar height: approximately 64–72px; section anchors use matching `scroll-margin-top`.
- Use `100svh`, not only `100vh`, for full-screen mobile invitation states.
- Test at 320, 375, 390, 768, 1024, 1366, and 1440px widths.

### Mobile design contract

- Design and approve the 390px composition before adapting it to desktop.
- Support 320px without horizontal scrolling or hidden actions.
- Use normal document flow for primary content; avoid fixed pixel positioning that only aligns at 1366px.
- Replace multi-column layouts with ordered single-column narratives on narrow screens.
- Use fluid type and spacing for headings and section rhythm.
- Keep primary actions within thumb reach and at least 44×44px.
- Do not depend on hover to reveal labels, controls, venue details, or carousel navigation.
- Use a mobile Sheet/Drawer for navigation; do not shrink the complete desktop navbar.
- Use art-directed mobile image sources when background focal crops differ.
- Serve responsive photograph sizes so phones do not download unnecessarily large originals.
- Carousels support touch swiping and visible previous/next controls.
- QR codes remain fully visible with their quiet zone and never exceed the viewport.
- Long names, venue addresses, account identifiers, and FAQ answers wrap without clipping.
- Test portrait and landscape phone orientation.

## Entrance experience

### Closed state

- Neutral darkened or paper-toned page background behind the transparent asset.
- Center the envelope with `object-contain`; do not crop the seal.
- Make the entire envelope a button while preserving a visible focus treatment.
- Add a short text cue below or over a calm area: “Tap to open”.
- On small phones, scale the envelope to viewport width and available `svh` while keeping the seal and action visible without scrolling.

### Opening sequence

Recommended sequence, 1.2–1.8 seconds total:

1. Seal responds with a small scale/press effect.
2. Closed image fades/scales into open image.
3. Open envelope settles upward.
4. Form content fades and rises into the blank card area.

Do not attempt a complex pseudo-3D flap simulation unless the artwork is later split into independent layers. With the current flattened PNGs, a choreographed cross-fade will be more credible.

### Form safe area

`enveloped_open.png` provides a large blank rectangular card in the upper-middle area. Keep the form short:

- heading;
- full-name field;
- primary submit button;
- concise help/error text.

The detailed RSVP fields should appear in a following step/modal/page after a safe match rather than overcrowding the envelope card.

On mobile, prefer a dedicated next step/page or bottom sheet for detailed RSVP fields. Do not squeeze the full form into the open-envelope artwork.

## Main-page section specifications

### Navbar

- Translucent warm-paper surface with backdrop blur only if text remains crisp.
- Couple monogram/name left, anchor links center, Admin action right.
- Mobile uses a Sheet/Drawer with focus trapping.
- Hide or reduce visual prominence while scrolling down; restore on upward scroll only if this behavior remains predictable.

### Welcome — `bg2.png`

- Full-bleed meadow artwork.
- The calmest text zone is the upper central sky.
- Use a subtle light text scrim/gradient only behind copy if needed.
- Flowers should remain the lower visual anchor.
- Personalized name is a supporting eyebrow; “Jobert & April” remains the visual brand.

### Wedding pass — `bg3.png`

- Patterned pastel background.
- Place QR and instructions on one large paper panel rather than several small cards.
- QR requires a white quiet zone and no texture behind the modules.
- On mobile, panel width should remain within the viewport with at least 16px outer margin.

### Our story timeline

- Use the generated `bg-timeline` artwork: warm handmade paper, faint watercolor landscape transitions, and a calm center corridor for the vertical line.
- Desktop: line at center, media and copy alternate or remain consistently paired.
- Each event has year, title, 2–4 sentence description, and 3–5 images maximum.
- Auto-carousel pauses on hover, focus, reduced motion, and when the tab is hidden.
- Mobile: line on the left, content stacked to the right; no tiny two-column layout.

### Featured pre-wedding — `bg4.png`

- This is a tall 1366×1660 illustration containing the couple in the lower center-right.
- Desktop: use the image as a tall section background with `background-position` tuned so the couple remains visible. Place the vertical photo rail rightward only after checking collision with the figures; an overlay mask or paper mat may be required.
- Mobile: avoid `background-size: cover` if it crops both figures. Prefer a contained illustration layer beneath a separate photo sequence.
- Keep photographs visually distinct through paper mats or restrained borders, not heavy shadows.

### Horizontal gallery

- Use the generated `bg-gallery` panoramic paper artwork with pressed flowers concentrated near the top and side edges.
- One dominant image with partial next/previous images visible.
- Use CSS scroll snap or an accessible carousel primitive.
- Preserve image aspect ratios and provide descriptive alt text once final photos are supplied.
- Do not auto-advance this gallery by default.

### Places and venues

- `bg5.png` is a quiet pale watercolor wash suitable for the announcement.
- `announcement.png` is a transparent lace frame; use it as a decorative frame around the supplied announcement copy.
- Venue information follows as a vertical editorial list with alternating artwork/map orientation.
- `bg6.png` is a church illustration and may support the Wedding Venue entry.
- Generated styling for other venues should use CSS paper/watercolor gradients, not newly generated image files unless separately approved.
- Google Maps buttons must include meaningful venue labels.

### Invitations

- Use the generated `bg-invitations` artwork inspired by a flat-lay stationery table, without embedded cards, envelopes, or text that could be mistaken for interactive content.
- Use a gallery/carousel that respects each invitation image’s native aspect ratio.
- Include zoom/lightbox only if it is keyboard and screen-reader accessible.

### Entourage

- Use the generated `bg-entourage` artwork with a loose floral arch around the outer perimeter and an open center for portraits and names.
- Use grouped headings and portrait rows/grids.
- Circular portrait size should remain large enough to recognize the person.
- On mobile, use two columns only when names do not wrap awkwardly; otherwise use a single compact list.

### FAQ

- Use the generated `bg-faq` artwork: nearly plain warm paper with sparse watercolor corner botanicals.
- Full-width accordion rows separated by thin lines.
- Avoid enclosing every question in a separate floating card.
- Animate height/opacity briefly; remove height animation in reduced-motion mode.

### Love gift

- Use the generated `bg-love-gift` artwork with restrained ribbons, small blossoms, and gift-table details around the edges.
- Quiet, respectful section with optional-gift language before account details.
- QR images appear on clean paper blocks.
- Mask or partially hide account identifiers if the couple requests added privacy.

### Footer

- Use the generated `bg-footer` dusk meadow artwork as a visual callback to `bg2.png`.
- Keep the center and lower-center calm enough for the couple’s names, wedding date, and closing line.
- The footer background should feel conclusive, not like another full content section.

## Generated background rules

- Generate separate desktop landscape and mobile portrait compositions where cropping would damage the focal layout.
- Backgrounds contain no readable text, logos, UI controls, QR codes, people, photo frames, or fake content panels.
- Decoration stays near the perimeter unless the section specification says otherwise.
- Every background includes a defined text-safe zone and focal point.
- Generated art should not imitate a named living artist.
- Use consistent grain, watercolor softness, palette, and lighting across the complete set.
- Final assets are reviewed for contrast, seams, artifacts, accidental lettering, and culturally inappropriate details.
- See [background-art-plan.md](./background-art-plan.md) for the asset inventory and generation briefs.

## Motion system

- Entrance: envelope opening sequence.
- Scroll: subtle section-title and media reveal; no animation for every paragraph.
- Depth: very slow background-position or scale shift on one or two scenic sections only.
- Interaction: carousel slide, accordion expansion, and button/focus feedback.
- Standard transitions: 150–250ms.
- Section reveals: 400–700ms.
- Respect `prefers-reduced-motion: reduce` and provide equivalent immediate state changes.

## Accessibility

- All functionality works with keyboard only.
- Minimum touch target: 44×44px.
- Visible focus indicators must survive pastel backgrounds.
- QR download has a text action and human-readable pass details.
- Carousel controls have labels, slide position, and pause control when auto-playing.
- Decorative artwork uses empty alt text; meaningful photos use descriptive alt text.
- Error messages are associated with their fields and announced.
- Do not rely only on color for attendance or check-in status.
- Test text contrast on the actual backgrounds, not only token swatches.
