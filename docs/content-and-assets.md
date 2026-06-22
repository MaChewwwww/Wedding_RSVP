# Content and Asset Plan

## Existing asset audit

| Asset | Dimensions | Observed content | Planned use |
| --- | ---: | --- | --- |
| `assets/enveloped_closed.png` | 1366×1337 | Closed kraft-paper envelope and wax seal | Initial invitation gate |
| `assets/enveloped_open.png` | 1366×1570 | Open envelope, blank invitation card, embedded RSVP deadline | Open state and lookup form |
| `assets/seal.png` | 1366×1337 | Separate seal composition | Optional layered interaction after verification |
| `assets/bg1.png` | 1366×1337 | Pastel paper patchwork with small flowers and stamp | RSVP/detail or timeline paper background |
| `assets/bg2.png` | 1366×768 | Watercolor flower meadow | Welcome section |
| `assets/bg3.png` | 1366×768 | Repeating pastel floral patchwork | Wedding pass/QR section |
| `assets/bg4.png` | 1366×1660 | Tall illustration of Jobert and April | Featured pre-wedding section |
| `assets/bg5.png` | 1366×768 | Pale cream/yellow/green watercolor wash | Announcement backdrop |
| `assets/bg6.png` | 1366×897 | Watercolor church and surrounding area | Wedding venue feature |
| `assets/announcement.png` | 1366×768 | Transparent lace frame with blank center | Announcement copy frame |

## Asset cautions

- `enveloped_open.png` contains the baked-in date text “Please answer before July 10, 2026.” The authoritative value comes from the server-only `RSVP_DEADLINE` environment variable. Replace the asset if its embedded date differs from configuration.
- Several PNGs contain transparency. Verify their alpha edges on both light and dark surfaces.
- The 1366px-wide assets may look soft on high-density large displays. Prefer restrained maximum visual scale and request higher-resolution masters if available.
- Mobile crops must be art-directed individually. Do not apply one global `background-size: cover` rule.
- Every supplied and generated background requires a reviewed mobile crop or dedicated mobile variant.
- `bg4.png` is the couple illustration, not a generic pre-wedding background.
- `announcement.png` is the decorative frame; it should be layered over `bg5.png`.
- Preserve source PNGs. Create optimized WebP/AVIF derivatives during implementation rather than replacing the originals.

## Background coverage

Supplied artwork does not cover every section. The following backgrounds should be generated during the visual asset-production phase:

- timeline;
- horizontal pre-wedding gallery;
- invitations;
- entourage;
- FAQ;
- Love Gift;
- footer.

The entrance, RSVP, welcome, pass, featured pre-wedding, announcement, and church venue areas already have supplied artwork. Other venue entries may use generated companion artwork or the shared venue-paper treatment.

See [background-art-plan.md](./background-art-plan.md) for detailed briefs and filenames.

## Required content before production

### Couple and event

- Official spelling and preferred styling of “Jobert & April”.
- Wedding date and timezone.
- RSVP deadline.
- Primary RSVP support person and contact method.
- Footer line and optional hashtag.

### Guest data

- Full guest list.
- Invitation party/grouping rules.
- One named guest per invitation; no plus-ones.
- Children policy and individual seating requirements.
- Known nicknames or aliases.
- Optional initial email addresses.

### Timeline

For each event:

- year/date;
- title, such as “How We Met”;
- 2–4 sentence description;
- 3–5 photographs;
- alt text or enough context to write it.

### Pre-wedding photography

- Featured portrait set for the vertical section.
- Full gallery set.
- Preferred sequence and crops.
- Photographer credit and usage approval if required.

### Venues

For Preparation Venue, Wedding Venue, and Reception Venue:

- official name;
- complete address;
- Google Maps URL or coordinates;
- date;
- start/end time;
- arrival instructions;
- parking/transport notes;
- accessibility notes;
- short description;
- venue image if available.

### Invitation carousel

- Final invitation card images.
- Front/back order.
- Download permissions.

### Entourage

For each person:

- group and role;
- display name;
- short description;
- portrait;
- image focal point/approved crop.

### FAQ

Recommended questions:

- What should I wear?
- Can I bring a plus-one?
- Are children invited?
- What time should I arrive?
- Is parking available?
- Are the ceremony and reception in the same place?
- Who should I contact if my plans change?
- Can I update my RSVP?
- What should I do if I lose my QR pass?

### Love gift

- Final optional-gift wording.
- Bank/e-wallet provider.
- Account name and approved display format.
- Account number or identifier.
- QR image.
- Whether copy-to-clipboard is allowed.

## Approved announcement copy

> The countdown is on! We are so excited to gather our favorite people in one place for a day of love, laughter, and a lot of celebrating. Whether you are traveling from near or far, we appreciate you making the trip. Check out the schedule and places below for where you need to be and when!

Copy editing recommendation: preserve the couple’s voice, but consider replacing “places below” with “schedule and venue details below” for clarity.

## Placeholder policy

- Use neutral aspect-ratio placeholders labeled by purpose, not stock-photo URLs that may disappear.
- Placeholder records live in development seed data or content configuration.
- Never ship lorem ipsum to production.
- Every placeholder must be listed in a pre-launch content checklist.
- Generated backgrounds are production assets, not placeholders. They require explicit visual approval before implementation.
