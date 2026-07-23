import { NextResponse } from "next/server";
import { sendOperatorApplication } from "@/lib/mail";
import type { OperatorApplication } from "@/types/application";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maxFileSize = 10 * 1024 * 1024;
const maxFiles = 8;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const application: OperatorApplication = {
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      email: String(form.get("email") || "").trim().toLowerCase(),
      zip: String(form.get("zip") || "").trim(),
      operationType: String(form.get("operationType") || "").trim(),
      equipment: String(form.get("equipment") || "").trim(),
      fleetSize: Number(form.get("fleetSize") || 0)
    };
    const documents = form.getAll("documents").filter((value): value is File => value instanceof File && value.size > 0);
    const isInvalid = !application.name || !application.phone || !/^\S+@\S+\.\S+$/.test(application.email) || !/^\d{5}(-\d{4})?$/.test(application.zip) || !application.operationType || !application.equipment || application.fleetSize < 1;
    if (isInvalid || !documents.length || documents.length > maxFiles) return NextResponse.json({ error: "invalid" }, { status: 400 });
    if (documents.some((file) => file.size > maxFileSize || !allowedTypes.has(file.type))) return NextResponse.json({ error: "file" }, { status: 400 });
    await sendOperatorApplication(application, documents);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Operator application failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
