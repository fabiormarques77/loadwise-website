import nodemailer from "nodemailer";
import { getMailEnvironment } from "@/lib/env";
import type { OperatorApplication } from "@/types/application";

export async function sendOperatorApplication(application: OperatorApplication, documents: File[]) {
  const environment = getMailEnvironment();
  const transporter = nodemailer.createTransport({ host: environment.host, port: environment.port, secure: environment.secure, auth: { user: environment.user, pass: environment.password } });
  await transporter.sendMail({
    from: environment.from,
    to: environment.to,
    replyTo: application.email,
    subject: `LoadWise early access application — ${application.name}`,
    text: [
      `Name: ${application.name}`, `Phone: ${application.phone}`, `Email: ${application.email}`,
      `ZIP: ${application.zip}`, `Operation: ${application.operationType}`,
      `Vehicles: ${application.fleetSize}`, `Equipment: ${application.equipment}`
    ].join("\n"),
    attachments: await Promise.all(documents.map(async (file) => ({ filename: file.name, content: Buffer.from(await file.arrayBuffer()), contentType: file.type })))
  });
}
