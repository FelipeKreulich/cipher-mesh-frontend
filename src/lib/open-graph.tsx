import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** The same visual grammar as the homepage card, with route-specific copy. */
export function openGraphCard({
  title,
  lead,
  command,
}: {
  title: string;
  lead: string;
  command: string;
}) {
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
      <div style={{ display: "flex", gap: 12 }}>
        <div
          style={{
            width: 34,
            height: 34,
            background: "#a06bff",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            width: 34,
            height: 34,
            background: "#4cc9f0",
            borderRadius: 4,
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            maxWidth: 980,
            color: "#e8e6f0",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.08,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 940,
            marginTop: 26,
            color: "#b4b1c8",
            fontSize: 28,
            lineHeight: 1.3,
          }}
        >
          {lead}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "2px solid #232336",
          paddingTop: 26,
          color: "#a06bff",
          fontSize: 26,
        }}
      >
        <span>{command}</span>
        <span style={{ color: "#4cc9f0" }}>ciphermesh.de</span>
      </div>
    </div>,
    { ...ogSize },
  );
}
