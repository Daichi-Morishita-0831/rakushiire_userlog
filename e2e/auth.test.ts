import { test, expect } from "@playwright/test";

test.describe("認証", () => {
  test("未認証ユーザーはログインページにリダイレクトされる", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("間違ったパスワードでエラーが表示される", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "admin@rakushiire.com");
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=メールアドレスまたはパスワードが正しくありません")
    ).toBeVisible({ timeout: 10000 });
  });

  test("admin でログインするとダッシュボードが表示される", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "admin@rakushiire.com");
    await page.fill("#password", "admin123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();
  });

  test("sales でログインするとセグメント・自動配信・設定が非表示", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("#email", "sales@rakushiire.com");
    await page.fill("#password", "sales123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();

    // salesロールでは表示されないメニュー
    await expect(page.getByRole("link", { name: "セグメント" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "自動配信" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "設定" })).not.toBeVisible();
  });
});

test.describe("ナビゲーション", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "admin@rakushiire.com");
    await page.fill("#password", "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/", { timeout: 15000 });
  });

  test("ユーザー一覧に遷移できる", async ({ page }) => {
    await page.getByRole("link", { name: "ユーザー一覧" }).click();
    await expect(page).toHaveURL("/users");
    await expect(page.getByRole("heading", { name: "ユーザー一覧" })).toBeVisible();
  });

  test("配信履歴に遷移できる", async ({ page }) => {
    await page.getByRole("link", { name: "配信履歴" }).click();
    await expect(page).toHaveURL("/history");
  });

  test("404ページが表示される", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(
      page.locator("text=ページが見つかりません")
    ).toBeVisible({ timeout: 10000 });
  });
});
