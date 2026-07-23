import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const backend = (process.env.LOADWISE_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006").replace(/\/$/, "");
  try {
    const response = await fetch(`${backend}/api/applications`, { method: "POST", body: await request.formData(), cache: "no-store" });
    const body = await response.text();
    return new NextResponse(body, { status: response.status, headers: { "content-type": response.headers.get("content-type") || "application/json" } });
  } catch (error) {
    console.error("Application submission failed", error);
    return NextResponse.json({ message: "The application service is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
