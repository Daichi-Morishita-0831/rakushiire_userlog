export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("@/lib/env");
    const result = validateEnv();
    if (!result.valid) {
      console.warn("[ENV] アプリケーションは一部機能が制限された状態で起動します");
    }
  }
}
