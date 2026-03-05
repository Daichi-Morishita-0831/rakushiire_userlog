import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../auth-utils";

describe("auth-utils", () => {
  it("パスワードをハッシュ化して検証できる", async () => {
    const password = "test-password-123";
    const hashed = await hashPassword(password);

    expect(hashed).not.toBe(password);
    expect(hashed).toMatch(/^\$2[aby]\$/);

    const isValid = await verifyPassword(password, hashed);
    expect(isValid).toBe(true);
  });

  it("間違ったパスワードで検証失敗する", async () => {
    const hashed = await hashPassword("correct-password");
    const isValid = await verifyPassword("wrong-password", hashed);
    expect(isValid).toBe(false);
  });

  it("同じパスワードでも異なるハッシュが生成される", async () => {
    const password = "same-password";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });
});
