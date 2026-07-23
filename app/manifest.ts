import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "LoadWise", short_name: "LoadWise", description: "The AI-powered operating system for independent freight.", start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#090b10", icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }] };
}
