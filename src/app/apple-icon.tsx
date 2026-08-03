import { ImageResponse } from "next/og";

// Safari's home-screen icon has to be a raster image, so the mark is redrawn
// here instead of reusing icon.svg. Keep the geometry in step with it.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#07070B",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 34,
          top: 34,
          width: 56,
          height: 56,
          background: "#A06BFF",
          borderRadius: 6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 90,
          width: 56,
          height: 56,
          background: "#4CC9F0",
          borderRadius: 6,
        }}
      />
    </div>,
    size,
  );
}
