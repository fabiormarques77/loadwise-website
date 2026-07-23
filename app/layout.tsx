import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";
import "./language.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "loadwisesys.com";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const title = "LoadWise | The Operating System for Independent Freight";
  const description = "LoadWise is the AI-powered operating system for independent freight—connecting operational, dispatcher, fleet, market and business intelligence.";
  return { metadataBase: new URL(`${protocol}://${host}`), title, description, alternates: { canonical: "/" }, openGraph: { title, description, type: "website", images: [{ url: image, width: 1536, height: 1024 }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geist.variable} ${mono.variable}`}><MotionProvider>{children}</MotionProvider></body></html>;
}
