import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateEnv } from "../env";

describe("validateEnv", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("必須環境変数が設定されていればvalidを返す", () => {
    vi.stubEnv("AUTH_SECRET", "test-secret");

    const result = validateEnv();
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("AUTH_SECRET未設定時にmissingに含まれる", () => {
    vi.stubEnv("AUTH_SECRET", "");

    const result = validateEnv();
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.missing[0]).toContain("AUTH_SECRET");
  });
});
