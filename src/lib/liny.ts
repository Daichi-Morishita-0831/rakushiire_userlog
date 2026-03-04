/**
 * Liny API Client
 *
 * Liny APIは「外部→Liny」方向のWebhook送信型。
 * CRMからLinyエンドポイントにPOSTすることで、
 * Liny側で設定したアクション（タグ付与・メッセージ送信・シナリオ起動・友だち情報更新）を発動させる。
 *
 * API仕様:
 * - メソッド: POST
 * - 認証: Bearer Token
 * - Content-Type: application/json
 * - 対象友だち識別: LINE UID (uid) or Liny friend_id
 */

export type LinyActionType = "tag_add" | "tag_remove" | "message" | "scenario" | "friend_info";

export interface LinyRequestPayload {
  /** LINE UID — SocialiteProvider.provider_id に対応 */
  uid: string;
  /** カスタムパラメータ（Liny側エンドポイントで定義したJSONキーに合わせる） */
  [key: string]: string | number | boolean | undefined;
}

export interface LinyApiResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

export interface LinyConfig {
  endpointUrl: string;
  apiToken: string;
}

/**
 * 環境変数からLiny設定を取得
 */
export function getLinyConfig(): LinyConfig | null {
  const endpointUrl = process.env.LINY_ENDPOINT_URL;
  const apiToken = process.env.LINY_API_TOKEN;

  if (!endpointUrl || !apiToken) {
    return null;
  }

  return { endpointUrl, apiToken };
}

/**
 * Liny APIにリクエストを送信
 */
export async function sendLinyRequest(
  payload: LinyRequestPayload,
  config?: LinyConfig
): Promise<LinyApiResult> {
  const linyConfig = config || getLinyConfig();

  if (!linyConfig) {
    return {
      success: false,
      error: "Liny APIの設定が見つかりません。環境変数 LINY_ENDPOINT_URL と LINY_API_TOKEN を設定してください。",
    };
  }

  try {
    const response = await fetch(linyConfig.endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${linyConfig.apiToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return { success: true, statusCode: response.status };
    }

    const errorText = await response.text().catch(() => "");
    return {
      success: false,
      statusCode: response.status,
      error: `Liny API Error (${response.status}): ${errorText}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `ネットワークエラー: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * 接続テスト — ドライランで認証を確認
 * ※ 実際にはLiny APIにテスト用エンドポイントがないため、
 *    設定値の存在チェック + エンドポイントの疎通確認のみ
 */
export async function testLinyConnection(config?: LinyConfig): Promise<LinyApiResult> {
  const linyConfig = config || getLinyConfig();

  if (!linyConfig) {
    return {
      success: false,
      error: "Liny APIの設定が見つかりません",
    };
  }

  // URLフォーマット検証
  try {
    new URL(linyConfig.endpointUrl);
  } catch {
    return {
      success: false,
      error: "エンドポイントURLの形式が不正です",
    };
  }

  // トークンフォーマット検証（UUID形式）
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(linyConfig.apiToken)) {
    return {
      success: false,
      error: "アクセストークンの形式が不正です（UUID形式が必要です）",
    };
  }

  return {
    success: true,
    statusCode: 200,
  };
}

/**
 * バッチ送信 — 複数友だちに対してLinyアクションを発動
 */
export async function sendLinyBatchRequest(
  payloads: LinyRequestPayload[],
  config?: LinyConfig
): Promise<{ total: number; success: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(
    payloads.map((payload) => sendLinyRequest(payload, config))
  );

  const errors: string[] = [];
  let successCount = 0;
  let failedCount = 0;

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.success) {
      successCount++;
    } else {
      failedCount++;
      if (result.status === "fulfilled" && result.value.error) {
        errors.push(result.value.error);
      } else if (result.status === "rejected") {
        errors.push(String(result.reason));
      }
    }
  }

  return { total: payloads.length, success: successCount, failed: failedCount, errors };
}
