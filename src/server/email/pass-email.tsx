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
} from "@react-email/components";
import { site } from "@/config/site";

/*
  Invitation/pass email (docs/architecture.md "Email architecture"). Keep it
  light: no huge inline images, no raw QR token outside the intended pass URL.
  The pass URL points to the guest's pass page, which renders the QR there.
*/

export type PassEmailProps = {
  partyName: string;
  passUrl: string;
};

export function PassEmail({ partyName, passUrl }: PassEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your wedding pass for {site.couple.displayName}</Preview>
      <Body style={{ backgroundColor: "#fff9ef", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ color: "#3f3a37" }}>
            {site.couple.displayName}
          </Heading>
          <Text style={{ color: "#3f3a37", fontSize: "16px" }}>
            Dear {partyName}, thank you for confirming your RSVP. We can&apos;t
            wait to celebrate with you.
          </Text>
          <Section style={{ margin: "24px 0" }}>
            <Link
              href={passUrl}
              style={{
                backgroundColor: "#c99d78",
                color: "#fff9ef",
                padding: "12px 20px",
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              View your wedding pass
            </Link>
          </Section>
          <Text style={{ color: "#6f6761", fontSize: "13px" }}>
            Present the QR code on your pass at check-in. If the button
            doesn&apos;t work, open this link: {passUrl}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
