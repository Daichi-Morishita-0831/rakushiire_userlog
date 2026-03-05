import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendLinyBatchRequest } from "../liny";

describe("sendLinyBatchRequest", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("全件成功時にsuccess=totalを返す", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    const payloads = [
      { uid: "U001" },
      { uid: "U002" },
      { uid: "U003" },
    ];

    const result = await sendLinyBatchRequest(payloads, {
      endpointUrl: "https://api.lineml.jp/v1/test",
      apiToken: "test-token",
    });

    expect(result.total).toBe(3);
    expect(result.success).toBe(3);
    expect(result.failed).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("一部失敗時にfailedカウントが増える", async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 2) {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve("Server Error"),
        });
      }
      return Promise.resolve({ ok: true, status: 200 });
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await sendLinyBatchRequest(
      [{ uid: "U001" }, { uid: "U002" }, { uid: "U003" }],
      { endpointUrl: "https://api.lineml.jp/v1/test", apiToken: "token" }
    );

    expect(result.total).toBe(3);
    expect(result.success).toBe(2);
    expect(result.failed).toBe(1);
    expect(result.errors).toHaveLength(1);
  });

  it("concurrencyオプションでチャンクサイズを制御", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    const payloads = Array.from({ length: 6 }, (_, i) => ({ uid: `U${i}` }));

    const result = await sendLinyBatchRequest(
      payloads,
      { endpointUrl: "https://api.lineml.jp/v1/test", apiToken: "token" },
      { concurrency: 2, delayMs: 0 }
    );

    expect(result.total).toBe(6);
    expect(result.success).toBe(6);
  });

  it("空配列でも正常に動作する", async () => {
    const result = await sendLinyBatchRequest([], {
      endpointUrl: "https://api.lineml.jp/v1/test",
      apiToken: "token",
    });

    expect(result.total).toBe(0);
    expect(result.success).toBe(0);
    expect(result.failed).toBe(0);
  });
});
