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
 * 接続テスト — 実際にHTTPリクエストを送って疎通確認
 * エンドポイントへの到達性 + 認証ヘッダーの有効性を検証
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

  // 実際にエンドポイントへ疎通確認（空ペイロードでPOST）
  // Liny APIはWebhook型のため、uid無しだとアクション未実行で完了する想定
  try {
    const response = await fetch(linyConfig.endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${linyConfig.apiToken}`,
      },
      body: JSON.stringify({ _test: true }),
      signal: AbortSignal.timeout(10000), // 10秒タイムアウト
    });

    // 認証エラー
    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        statusCode: response.status,
        error: `認証エラー (${response.status}): トークンが無効です`,
      };
    }

    // 404はエンドポイントURLが間違っている
    if (response.status === 404) {
      return {
        success: false,
        statusCode: 404,
        error: "エンドポイントが見つかりません。URLを確認してください",
      };
    }

    // 2xx or 422（バリデーションエラー=到達＆認証OK）は成功とみなす
    if (response.ok || response.status === 422) {
      return { success: true, statusCode: response.status };
    }

    return {
      success: false,
      statusCode: response.status,
      error: `予期しないレスポンス (${response.status})`,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return { success: false, error: "タイムアウト: 10秒以内にレスポンスがありません" };
    }
    return {
      success: false,
      error: `接続エラー: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * バッチ送信 — 複数友だちに対してLinyアクションを発動
 * レート制限: 同時実行5件、各バッチ間200msスリープ
 */
export async function sendLinyBatchRequest(
  payloads: LinyRequestPayload[],
  config?: LinyConfig,
  options?: { concurrency?: number; delayMs?: number }
): Promise<{ total: number; success: number; failed: number; errors: string[] }> {
  const concurrency = options?.concurrency ?? 5;
  const delayMs = options?.delayMs ?? 200;

  const errors: string[] = [];
  let successCount = 0;
  let failedCount = 0;

  // チャンクに分割して順次実行
  for (let i = 0; i < payloads.length; i += concurrency) {
    const chunk = payloads.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      chunk.map((payload) => sendLinyRequest(payload, config))
    );

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

    // レート制限: 最後のチャンク以外はスリープ
    if (i + concurrency < payloads.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { total: payloads.length, success: successCount, failed: failedCount, errors };
}
