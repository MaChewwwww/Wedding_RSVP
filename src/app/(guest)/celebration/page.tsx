import type { Metadata } from "next";
import { SiteNavbar } from "@/components/nav/site-navbar";
import { WelcomeSection } from "@/components/sections/welcome-section";
import { PassSection } from "@/components/sections/pass-section";
import { StorySection } from "@/components/sections/story-section";
import { FeaturedSection } from "@/components/sections/featured-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { PlacesSection } from "@/components/sections/places-section";
import { InvitationsSection } from "@/components/sections/invitations-section";
import { FaqSection } from "@/components/sections/faq-section";
import { GiftSection } from "@/components/sections/gift-section";
import { FooterSection } from "@/components/sections/footer-section";
import { SectionDivider } from "@/components/sections/section-divider";
import { CelebrationLayout } from "@/components/sections/celebration-layout";
import { loadCurrentParty } from "@/server/rsvp/loader";
import { isBackendConfigured, serverEnv } from "@/config/env";
import { loadPasses } from "@/server/qr/pass-loader";


export const dynamic = "force-dynamic";

/*
  Main single-page celebration. SectionDivider components are placed between
  every adjacent section pair to smoothly blend section backgrounds with
  SVG wave/cloud shapes and ambient glow blobs.
*/
export default async function CelebrationPage() {
  const configured = isBackendConfigured();
  const envConfig = configured ? serverEnv() : null;
  const [party, passData] = configured
    ? await Promise.all([loadCurrentParty(), loadPasses()])
    : [null, null];

  return (
    <CelebrationLayout>
      <SiteNavbar />
      <main className="flex flex-col bg-[#fdfbf7]" style={{ paddingTop: "var(--nav-height)" }}>
        <WelcomeSection
          displayName={
            party && party.guest.rsvpStatus !== "pending"
              ? party.guest.fullName
              : undefined
          }
          weddingDate={configured ? envConfig?.WEDDING_DATE : undefined}
        />

        <SectionDivider />

        {/* ── Pass (bg3 watercolor tile) ─────────────────────────────── */}
        <PassSection passes={passData?.passes ?? []} weddingDate={configured ? envConfig?.WEDDING_DATE : undefined} />

        <SectionDivider />

        {/* ── Invitations (butter/gold gradient) ────────────────────── */}
        <InvitationsSection />

        <SectionDivider />

        {/* ── Our Story (blush/lavender/sage gradient) ───────────────── */}
        <StorySection />

        <SectionDivider />

        {/* ── Featured / Jobert & April (couple hero BG) ─────────────── */}
        <FeaturedSection />

        <SectionDivider />

        {/* ── Gallery (sage/green gradient) ─────────────────────────── */}
        <GallerySection />

        <SectionDivider />

        {/* ── Places & Venues (bg5 outdoor) ─────────────────────────── */}
        <PlacesSection weddingDate={configured ? envConfig?.WEDDING_DATE : undefined} />

        <SectionDivider />

        {/* ── FAQ (blush/lavender gradient) ─────────────────────────── */}
        <FaqSection />

        <SectionDivider />

        {/* ── Love Gift (butter/gold gradient) ──────────────────────── */}
        <GiftSection />

        <SectionDivider />

        {/* ── Footer (romantic dusk gradient) ───────────────────────── */}
        <FooterSection weddingDate={configured ? envConfig?.WEDDING_DATE : undefined} />
      </main>
    </CelebrationLayout>
  );
}
