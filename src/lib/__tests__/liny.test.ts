import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLinyConfig, testLinyConnection, sendLinyRequest } from "../liny";

describe("getLinyConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("環境変数が設定されていればconfigを返す", () => {
    vi.stubEnv("LINY_ENDPOINT_URL", "https://api.lineml.jp/v1/test");
    vi.stubEnv("LINY_API_TOKEN", "a6a4ef1e-0864-44a8-85a4-9fef83db103a");

    const config = getLinyConfig();
    expect(config).toEqual({
      endpointUrl: "https://api.lineml.jp/v1/test",
      apiToken: "a6a4ef1e-0864-44a8-85a4-9fef83db103a",
    });
  });

  it("環境変数が未設定ならnullを返す", () => {
    vi.stubEnv("LINY_ENDPOINT_URL", "");
    vi.stubEnv("LINY_API_TOKEN", "");

    const config = getLinyConfig();
    expect(config).toBeNull();
  });
});

describe("testLinyConnection", () => {
  it("config未設定時にエラーを返す", async () => {
    const result = await testLinyConnection({
      endpointUrl: "",
      apiToken: "",
    });
    // 空URL → URL検証失敗 or config null
    expect(result.success).toBe(false);
  });

  it("不正なURLフォーマットでエラーを返す", async () => {
    const result = await testLinyConnection({
      endpointUrl: "not-a-url",
      apiToken: "a6a4ef1e-0864-44a8-85a4-9fef83db103a",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("URL");
  });

  it("不正なトークンフォーマットでエラーを返す", async () => {
    const result = await testLinyConnection({
      endpointUrl: "https://api.lineml.jp/v1/test",
      apiToken: "invalid-token",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("トークン");
  });
});

describe("sendLinyRequest", () => {
  it("config未設定時にエラーを返す", async () => {
    vi.stubEnv("LINY_ENDPOINT_URL", "");
    vi.stubEnv("LINY_API_TOKEN", "");

    const result = await sendLinyRequest({ uid: "test-uid" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("設定が見つかりません");
  });

  it("fetch成功時にsuccessを返す", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await sendLinyRequest(
      { uid: "U1234567890" },
      { endpointUrl: "https://api.lineml.jp/v1/test", apiToken: "test-token" }
    );
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);

    vi.unstubAllGlobals();
  });

  it("fetch失敗時にエラーを返す", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await sendLinyRequest(
      { uid: "U1234567890" },
      { endpointUrl: "https://api.lineml.jp/v1/test", apiToken: "test-token" }
    );
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(500);

    vi.unstubAllGlobals();
  });

  it("ネットワークエラー時にエラーを返す", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", mockFetch);

    const result = await sendLinyRequest(
      { uid: "U1234567890" },
      { endpointUrl: "https://api.lineml.jp/v1/test", apiToken: "test-token" }
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("ネットワークエラー");

    vi.unstubAllGlobals();
  });
});
