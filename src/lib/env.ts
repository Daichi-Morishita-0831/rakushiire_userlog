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
  { key: "ANTHROPIC_API_KEY", required: false, description: "Anthropic APIキー（AIチャット用）" },
  { key: "LINY_WEBHOOK_SECRET", required: false, description: "Liny Webhook署名検証キー" },
  { key: "ESCALATION_WEBHOOK_URL", required: false, description: "エスカレーション通知先Webhook URL（汎用）" },
  { key: "SLACK_ESCALATION_WEBHOOK_URL", required: false, description: "Slackエスカレーション通知Incoming Webhook URL" },
  { key: "AI_MONTHLY_TOKEN_BUDGET", required: false, description: "AI月次トークン予算（デフォルト: 500000）" },
  { key: "GOOGLE_CLIENT_ID", required: false, description: "Google OAuth クライアントID" },
  { key: "GOOGLE_CLIENT_SECRET", required: false, description: "Google OAuth クライアントシークレット" },
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
