import { ImageResponse } from "next/og";

import en from "@/../messages/en.json";
import pt from "@/../messages/pt.json";
import { routing } from "@/i18n/routing";

/**
 * The card that shows up when someone pastes the link.
 *
 * Without it every share — WhatsApp, Discord, anywhere — renders a bare
 * rectangle, which is a poor first impression for a project whose whole pitch
 * is that it looks like it was made on purpose.
 *
 * The composition is the mark and the one sentence the site leads with, on the
 * same violet ground as the page. No custom font: loading one into ImageResponse
 * means shipping the file, and at this size the layout carries the identity.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "CipherMesh";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const MESSAGES = { en, pt } as const;

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = MESSAGES[locale as keyof typeof MESSAGES] ?? en;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#07070b",
        backgroundImage:
          "radial-gradient(1000px 520px at 50% -10%, rgba(123,45,255,0.30), transparent 70%)",
      }}
    >
      {/* The mark: the half you hold, and the half on the wire. */}
      <div
        style={{ display: "flex", position: "relative", width: 92, height: 92 }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 52,
            height: 52,
            background: "#a06bff",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 40,
            width: 52,
            height: 52,
            background: "#4cc9f0",
            borderRadius: 4,
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            color: "#e8e6f0",
            letterSpacing: -2,
            lineHeight: 1.1,
            maxWidth: 940,
          }}
        >
          {messages.hero.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 30,
            color: "#b4b1c8",
            maxWidth: 880,
          }}
        >
          {messages.footer.tagline}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderTop: "2px solid #232336",
          paddingTop: 26,
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#a06bff" }}>
          $ npx ciphermesh@latest
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#4cc9f0" }}>
          ciphermesh.de
        </div>
      </div>
    </div>,
    size,
  );
}
