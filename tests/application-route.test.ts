import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/applications/route";

describe("public application proxy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.LOADWISE_API_URL;
  });

  it("forwards multipart data and the idempotency key to the configured Backend", async () => {
    process.env.LOADWISE_API_URL = "https://backend.example.test/";
    const backendResponse = new Response(JSON.stringify({ id: "lead-1", status: "NEW_LEAD" }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
    const fetchMock = vi.fn().mockResolvedValue(backendResponse);
    vi.stubGlobal("fetch", fetchMock);
    const form = new FormData();
    form.set("fullName", "Test Lead");

    const response = await POST({
      formData: vi.fn().mockResolvedValue(form),
      headers: new Headers({ "x-idempotency-key": "contact:test-key" }),
    } as unknown as Request);

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ id: "lead-1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example.test/api/applications",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        headers: { "x-idempotency-key": "contact:test-key" },
      }),
    );
  });

  it("returns the public generic response when the Backend is unavailable", async () => {
    process.env.LOADWISE_API_URL = "https://backend.example.test";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));
    const response = await POST({
      formData: vi.fn().mockResolvedValue(new FormData()),
      headers: new Headers(),
    } as unknown as Request);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      message: "The application service is temporarily unavailable. Please try again.",
    });
  });
});
