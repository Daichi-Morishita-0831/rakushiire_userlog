/**
 * 環境変数バリデーション
 * サーバー起動時に必須環境変数の存在を検証
 */

type EnvVar = {
  key: string;
  required: boolean;
  description: string;
};

const envVars: EnvVar[] = [
  { key: "AUTH_SECRET", required: true, description: "NextAuth暗号化キー" },
  { key: "LINY_API_TOKEN", required: false, description: "Liny APIトークン" },
  { key: "LINY_ENDPOINT_URL", required: false, description: "Liny エンドポイントURL" },
  // DB接続時に有効化
  // { key: "DATABASE_URL", required: true, description: "MySQL接続文字列" },
];

export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const v of envVars) {
    if (v.required && !process.env[v.key]) {
      missing.push(`${v.key} (${v.description})`);
    }
  }

  if (missing.length > 0) {
    console.error(
      `[ENV] 必須環境変数が未設定です:\n${missing.map((m) => `  - ${m}`).join("\n")}`
    );
  }

  return { valid: missing.length === 0, missing };
}
