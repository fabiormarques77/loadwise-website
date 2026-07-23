type Translate = (message: string) => string;

export async function applicationErrorMessage(
  response: Pick<Response, "json">,
  translate: Translate
) {
  const result: { message?: unknown } = await response.json().catch(() => ({}));
  const messages = Array.isArray(result?.message) ? result.message : [result?.message];
  const usable = messages.filter((message: unknown): message is string => typeof message === "string" && message.trim().length > 0);
  return usable.length
    ? usable.map((message) => translate(message)).join(" ")
    : translate("We couldn't send your request right now.");
}
