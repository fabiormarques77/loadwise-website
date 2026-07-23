const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"] as const;

export function getMailEnvironment() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER!,
    password: process.env.SMTP_PASSWORD!,
    to: process.env.CONTACT_TO_EMAIL!,
    from: process.env.CONTACT_FROM_EMAIL!
  };
}
