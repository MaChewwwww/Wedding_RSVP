import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
  Hr,
} from "@react-email/components";
import { site } from "@/config/site";

/*
  Invitation/pass email — beautiful pastel wedding design matching the
  Jobert & April brand: rose, blush, gold, cream tones.
  QR codes served via Supabase Storage public URLs for universal compatibility.
*/

export type PassEmailProps = {
  partyName: string;
  passUrl: string;
  googleCalendarUrl: string;
  passes?: { id: string; label: string; qrDataUrl: string; publicUrl?: string }[];
};

export function PassEmail({ partyName, passUrl, googleCalendarUrl, passes }: PassEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>✨ Your Wedding Pass — {site.couple.displayName} ✨</Preview>

      <Body style={{
        margin: 0,
        padding: 0,
        backgroundColor: "#fdf6f0",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}>

        {/* ── Outer wrapper ─────────────────────────────────────────── */}
        <Container style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#fdf6f0",
        }}>

          {/* ── Top petal border strip ─────────────────────────────── */}
          <Section style={{
            background: "linear-gradient(135deg, #fde8f0 0%, #f5e4f8 50%, #e8f0fd 100%)",
            margin: "0 20px",
            padding: "8px 0",
            textAlign: "center" as const,
            fontSize: "20px",
            letterSpacing: "4px",
            borderRadius: "12px 12px 0 0",
            borderLeft: "1px solid #fde8f0",
            borderRight: "1px solid #fde8f0",
            borderTop: "1px solid #fde8f0",
          }}>
            <Text style={{ margin: 0, color: "#d4516e" }}>🌸 🌷 🌸 🌷 🌸</Text>
          </Section>

          {/* ── Hero header ───────────────────────────────────────── */}
          <Section style={{
            background: "linear-gradient(160deg, #fde8f0 0%, #fdf3c0 40%, #fde8f0 100%)",
            margin: "0 20px",
            padding: "48px 40px 36px",
            textAlign: "center" as const,
            borderLeft: "1px solid #fde8f0",
            borderRight: "1px solid #fde8f0",
          }}>
            {/* Eyebrow */}
            <Text style={{
              margin: "0 0 6px",
              fontSize: "11px",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: "700",
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
              color: "#c8963c",
            }}>
              You are cordially invited
            </Text>

            {/* Couple name */}
            <Heading style={{
              margin: "0 0 4px",
              fontSize: "52px",
              lineHeight: "1.1",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: "400",
              fontStyle: "italic",
              color: "#d4516e",
              textShadow: "none",
            }}>
              {site.couple.displayName}
            </Heading>

            {/* Decorative divider */}
            <Text style={{
              margin: "12px 0",
              fontSize: "18px",
              color: "#e8a8b8",
              letterSpacing: "6px",
            }}>
              ✦ ✦ ✦
            </Text>

            {/* Tagline */}
            <Text style={{
              margin: 0,
              fontSize: "15px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              color: "#6f6761",
              lineHeight: "1.5",
            }}>
              Together with their families and friends
            </Text>
          </Section>

          {/* ── Main card body ────────────────────────────────────── */}
          <Section style={{
            backgroundColor: "#ffffff",
            margin: "0 20px",
            padding: "40px 40px 32px",
            borderLeft: "1px solid #fde8f0",
            borderRight: "1px solid #fde8f0",
          }}>

            {/* Greeting */}
            <Text style={{
              margin: "0 0 24px",
              fontSize: "17px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#3f3a37",
              lineHeight: "1.7",
              textAlign: "center" as const,
            }}>
              Dear <strong style={{ color: "#d4516e" }}>{partyName}</strong>,<br />
              your RSVP has been confirmed with love.<br />
              We cannot wait to celebrate this beautiful day with you.
            </Text>

            <Hr style={{ borderColor: "#fde8f0", borderTopWidth: "1px", margin: "28px 0" }} />

            {/* QR Pass section */}
            {passes && passes.length > 0 && (
              <Section>
                {/* Section heading */}
                <Text style={{
                  margin: "0 0 6px",
                  textAlign: "center" as const,
                  fontSize: "10px",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontWeight: "700",
                  letterSpacing: "3px",
                  textTransform: "uppercase" as const,
                  color: "#c8963c",
                }}>
                  Your Entry Pass
                </Text>
                <Text style={{
                  margin: "0 0 28px",
                  textAlign: "center" as const,
                  fontSize: "22px",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  color: "#3f3a37",
                }}>
                  Wedding Pass
                </Text>

                {passes.map((p, idx) => (
                  <Section key={p.id} style={{
                    backgroundColor: idx % 2 === 0 ? "#fdf3f7" : "#fdf8ee",
                    border: `1px solid ${idx % 2 === 0 ? "#f9d8e5" : "#f5e4a8"}`,
                    borderRadius: "12px",
                    padding: "28px 24px",
                    textAlign: "center" as const,
                    marginBottom: passes.length > 1 ? "20px" : "0",
                  }}>
                    {/* Guest name */}
                    <Text style={{
                      margin: "0 0 4px",
                      fontSize: "10px",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontWeight: "700",
                      letterSpacing: "2px",
                      textTransform: "uppercase" as const,
                      color: "#c8963c",
                    }}>
                      Guest Pass
                    </Text>
                    <Text style={{
                      margin: "0 0 20px",
                      fontSize: "24px",
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontWeight: "700",
                      color: "#3f3a37",
                    }}>
                      {p.label}
                    </Text>

                    {/* QR Code */}
                    {p.publicUrl ? (
                      <table align="center" border={0} cellPadding="0" cellSpacing="0" style={{ margin: "0 auto 16px" }}>
                        <tbody>
                          <tr>
                            <td align="center" style={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #fde8f0",
                              borderRadius: "10px",
                              padding: "16px",
                            }}>
                              <Img
                                src={p.publicUrl}
                                alt={`QR Code for ${p.label}`}
                                width="180"
                                height="180"
                                style={{ display: "block", margin: "0 auto" }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : null}

                    <Text style={{
                      margin: "12px 0 0",
                      fontSize: "11px",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      color: "#b09080",
                      letterSpacing: "1px",
                    }}>
                      Present this QR code at check-in
                    </Text>
                  </Section>
                ))}

                <Hr style={{ borderColor: "#fde8f0", borderTopWidth: "1px", margin: "32px 0 24px" }} />
              </Section>
            )}

            {/* CTA button */}
            <Section style={{ textAlign: "center" as const }}>
              <Text style={{
                margin: "0 0 16px",
                fontSize: "14px",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                color: "#6f6761",
              }}>
                You can also view your pass anytime online:
              </Text>
              <Link
                href={passUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: "#d4516e",
                  color: "#ffffff",
                  padding: "14px 36px",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase" as const,
                }}
              >
                View My Wedding Pass
              </Link>
              <div style={{ marginTop: "12px" }}>
                <Link
                  href={googleCalendarUrl}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#ffffff",
                    color: "#d4516e",
                    border: "2px solid #d4516e",
                    padding: "12px 30px",
                    borderRadius: "50px",
                    textDecoration: "none",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Add to Google Calendar
                </Link>
              </div>
            </Section>
          </Section>

          {/* ── Warm note card ────────────────────────────────────── */}
          <Section style={{
            background: "linear-gradient(135deg, #fde8f0 0%, #f5e4f8 100%)",
            margin: "0 20px",
            padding: "28px 40px",
            borderLeft: "1px solid #f9d8e5",
            borderRight: "1px solid #f9d8e5",
            textAlign: "center" as const,
          }}>
            <Text style={{
              margin: 0,
              fontSize: "16px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              color: "#9a6075",
              lineHeight: "1.8",
            }}>
              &ldquo;Your presence is our greatest gift.&rdquo;
            </Text>
          </Section>

          {/* ── Footer ────────────────────────────────────────────── */}
          <Section style={{
            background: "linear-gradient(135deg, #fdf3c0 0%, #fde8f0 100%)",
            margin: "0 20px",
            padding: "32px 40px 24px",
            borderLeft: "1px solid #f5e4a8",
            borderRight: "1px solid #f9d8e5",
            textAlign: "center" as const,
          }}>
            <Text style={{
              margin: "0 0 8px",
              fontSize: "11px",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: "700",
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
              color: "#c8963c",
            }}>
              With all our love
            </Text>
            <Text style={{
              margin: "0 0 16px",
              fontSize: "32px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              color: "#d4516e",
            }}>
              {site.couple.displayName}
            </Text>
            <Text style={{
              margin: 0,
              fontSize: "12px",
              fontFamily: "Arial, Helvetica, sans-serif",
              color: "#b09080",
            }}>
              {site.event.weddingDate}
            </Text>
          </Section>

          {/* ── Bottom petal strip ────────────────────────────────── */}
          <Section style={{
            background: "linear-gradient(135deg, #e8f0fd 0%, #f5e4f8 50%, #fde8f0 100%)",
            margin: "0 20px",
            padding: "8px 0",
            textAlign: "center" as const,
            fontSize: "20px",
            letterSpacing: "4px",
            borderLeft: "1px solid #fde8f0",
            borderRight: "1px solid #fde8f0",
            borderBottom: "3px solid #d4516e",
            borderRadius: "0 0 12px 12px",
          }}>
            <Text style={{ margin: 0, color: "#d4516e" }}>🌸 🌷 🌸 🌷 🌸</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
