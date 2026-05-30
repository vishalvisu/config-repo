import { ImageResponse } from "next/og";

import { SEO } from "@/lib/seo";

export const alt = SEO.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "linear-gradient(135deg, #1a0a2e 0%, #0c0a14 50%, #1a1028 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #fbbf24, #f97316, #f43f5e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            T
          </div>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#fdba74" }}>
            ClickKaro
          </span>
        </div>
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: "900px",
            background: "linear-gradient(90deg, #fde68a, #fb923c, #f472b6)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Title aur Thumbnail Check
        </div>
        <p
          style={{
            marginTop: "28px",
            fontSize: "28px",
            lineHeight: 1.4,
            color: "#d4d4d8",
            maxWidth: "880px",
          }}
        >
          Free YouTube title checker &amp; thumbnail analyzer for Indian
          creators — CTR grade, Hinglish titles, AI tips.
        </p>
      </div>
    ),
    { ...size },
  );
}
