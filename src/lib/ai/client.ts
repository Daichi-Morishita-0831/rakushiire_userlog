/**
 * Anthropic SDK クライアント — シングルトン + callClaude<T> ヘルパー
 *
 * Comdesk Next Generationのパターンを踏襲:
 * - グローバルシングルトンで再生成を防止（prisma.tsと同一パターン）
 * - ジェネリック callClaude<T> でJSON抽出まで一括処理
 * - 正規表現でJSON抽出（AIがJSON前後に説明文を含めても対応）
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ClaudeOptions } from "./types";

// シングルトン（dev環境でのHMR再生成を防止）
const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_TEMPERATURE = 0.3;
const DEFAULT_MAX_TOKENS = 2048;

function getAnthropicClient(): Anthropic {
  if (!globalForAnthropic.anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY環境変数が未設定です");
    }
    globalForAnthropic.anthropic = new Anthropic({ apiKey });
  }
  return globalForAnthropic.anthropic;
}

/** 会話履歴の1メッセージ */
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Claude APIを呼び出し、JSONレスポンスを型付きで返す
 *
 * @param systemPrompt - システムプロンプト
 * @param userMessage - ユーザーメッセージ（最新の1件）
 * @param options - モデル・温度・トークン数のオーバーライド
 * @param conversationHistory - 過去の会話履歴（直近N件、古い順）
 * @returns data: パース済みJSON, inputTokens/outputTokens: トークン使用量
 */
export async function callClaude<T>(
  systemPrompt: string,
  userMessage: string,
  options?: ClaudeOptions,
  conversationHistory?: ConversationMessage[]
): Promise<{ data: T; inputTokens: number; outputTokens: number }> {
  const client = getAnthropicClient();

  // 会話履歴 + 最新メッセージを messages 配列に組み立て
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...(conversationHistory ?? []),
    { role: "user", content: userMessage },
  ];

  const response = await client.messages.create({
    model: options?.model ?? DEFAULT_MODEL,
    temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
    system: systemPrompt,
    messages,
  });

  // テキストブロックを取得
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI応答にテキストブロックがありません");
  }

  // JSON抽出（Comdesk NGパターン: 正規表現で最初のJSONオブジェクトを取得）
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(
      `AI応答からJSONを抽出できませんでした: ${textBlock.text.substring(0, 200)}`
    );
  }

  const data = JSON.parse(jsonMatch[0]) as T;

  return {
    data,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}
