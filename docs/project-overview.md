# Project Overview

## Product statement

The Jobert & April Wedding RSVP website is a private-by-invitation wedding microsite. It combines an animated digital invitation, guest RSVP verification, a downloadable QR wedding pass, event information, and an operational admin console for guest, seating, and attendance management.

## Visual thesis

A handmade pastel wedding story presented like an unfolding keepsake: watercolor scenery, paper textures, editorial photography, and restrained motion.

## Content plan

1. Invitation gate: closed envelope, opening sequence, and RSVP form.
2. Personalized arrival: welcome message and wedding celebration.
3. Practical guest pass: downloadable QR code and invitation.
4. Couple story: timeline and pre-wedding photography.
5. Event logistics: announcement, schedule, and mapped venues.
6. Wedding details: invitation cards, entourage, questions, and gifts.
7. Closing footer.

## Interaction thesis

- The envelope opening is the single theatrical entrance moment.
- The main page uses gentle reveal and parallax-like depth sparingly to make the watercolor artwork feel dimensional.
- Carousels support stories and photographs, while practical controls remain direct and predictable.

## Goals

- Allow invited guests to find and submit their RSVP without creating an account.
- Handle common name variations and typos without leaking the guest list or creating unsafe matches.
- Give each confirmed invitation a secure, downloadable QR pass.
- Optionally email the pass and invitation when a guest provides an email address.
- Present all wedding information in a polished, mobile-first single-page experience.
- Give administrators reliable tools for guest records, seating, attendance, and operational exports.
- Support manual attendance for guests without a phone or QR pass.

## Non-goals for the initial release

- Public user registration or social login.
- Guest-created accounts or passwords.
- Payment processing or in-site monetary donations.
- Full drag-and-drop floor-plan design.
- Native iOS or Android applications.
- Facial recognition or identity-document verification.
- General-purpose CMS capabilities beyond wedding-specific content.
- Live chat, social feed, or guest photo uploads.

## Users and roles

### Guest

The one named person assigned to an invitation. A guest can search for their invitation, submit or update an RSVP within the allowed period, view personalized content, and download their wedding pass.

### Administrator

A seeded, authenticated account controlled by the couple or assigned coordinator. An administrator can manage all operational wedding data.

### Check-in staff

Initially the same admin role and interface. A separate restricted `check_in_staff` role may be added later if devices will be delegated on the wedding day.

## Important domain terms

- **Invitee:** one named person in the guest list.
- **Invitation:** one named guest and their authorization/session boundary.
- **RSVP:** the named guest’s attendance response.
- **Wedding pass:** the personalized screen/download containing an opaque QR token.
- **Check-in:** marking the attending invited guest as present.
- **Table assignment:** seating assignment for an attending invitee.

## Key assumptions

- Guest names are manually imported or entered by an administrator as a single `full_name` field.
- Every invitation is strictly assigned to one named guest. No plus-ones or grouped household invitations are supported.
- Email is optional and is not required to complete an RSVP.
- The wedding date, final RSVP deadline, venue data, entourage, FAQs, accounts, and production photographs are not yet finalized.
- The authoritative RSVP deadline is configured through the server-only `RSVP_DEADLINE` environment variable.
- `enveloped_open.png` visibly contains the text “Please answer before July 10, 2026.” This embedded text is not authoritative. The production asset must be replaced if it does not match the configured deadline.
- The website should be usable primarily on mobile devices and on weak event-venue connections.

## Success criteria

- At least 95% of invited guests with correctly entered names reach their invitation without admin assistance.
- No guest can enumerate or retrieve another guest’s information through the name search.
- QR check-in returns a clear result in under two seconds under normal connectivity.
- Repeated QR scans do not duplicate attendance.
- Admins can export invitees, RSVP status, seating, and attendance as CSV.
- All critical guest and admin workflows pass keyboard, mobile, and reduced-motion testing.
- No guest can create or modify an RSVP at or after the configured deadline; administrators retain an audited override.
