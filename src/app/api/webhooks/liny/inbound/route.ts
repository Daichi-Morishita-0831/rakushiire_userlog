/**
 * Liny インバウンドWebhookエンドポイント
 *
 * POST /api/webhooks/liny/inbound
 *
 * フロー:
 * 1. 署名検証（HMAC-SHA256）
 * 2. ペイロード解析（LINE UID + メッセージテキスト）
 * 3. セッション取得/作成（30分ウィンドウ）
 * 4. 顧客メッセージ保存
 * 5. AI応答生成（Claude）
 * 6. AI応答保存 + トークン記録
 * 7. エスカレーション処理（Linyタグ + Webhook通知）
 * 8. Liny経由でLINE返信
 * 9. 200 OK 返却
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { handleInboundMessage } from "@/lib/ai/chat-responder";
import { handleEscalation } from "@/lib/ai/escalation";
import { trackTokenUsage } from "@/lib/ai/token-tracker";
import { sendLinyRequest } from "@/lib/liny";
import {
  createOrGetChatSession,
  saveChatMessage,
  updateSessionStatus,
} from "@/lib/actions/chat";

// ============================================================
// 署名検証
// ============================================================

function verifyWebhookSignature(
  request: NextRequest,
  rawBody: string
): boolean {
  const secret = process.env.LINY_WEBHOOK_SECRET;

  if (!secret) {
    // 開発モードでは署名検証をスキップ（警告ログ出力）
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Webhook] LINY_WEBHOOK_SECRET未設定。開発モードのため署名検証をスキップ"
      );
      return true;
    }
    console.error("[Webhook] LINY_WEBHOOK_SECRET未設定。本番環境では必須です");
    return false;
  }

  // Liny の署名ヘッダー（実際のヘッダー名は Liny ドキュメントで確認が必要）
  const signature =
    request.headers.get("x-liny-signature") ??
    request.headers.get("x-webhook-signature") ??
    request.headers.get("x-hub-signature-256");

  if (!signature) {
    console.error("[Webhook] 署名ヘッダーがありません");
    return false;
  }

  // sha256= プレフィックスの除去（GitHub Webhooks 形式の場合）
  const providedSig = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(providedSig, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

// ============================================================
// レートリミット（インメモリ、同一UIDの連続リクエスト抑制）
// ============================================================

/** UID毎のリクエストタイムスタンプ */
const rateLimitMap = new Map<string, number[]>();

/** レートリミット: 1分あたり最大10リクエスト/UID */
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

/** 古いエントリを定期的にクリーンアップ（メモリリーク防止） */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function checkRateLimit(uid: string): boolean {
  const now = Date.now();

  // 定期クリーンアップ
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const [key, timestamps] of rateLimitMap.entries()) {
      const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (recent.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, recent);
      }
    }
  }

  const timestamps = rateLimitMap.get(uid) ?? [];
  const recentTimestamps = timestamps.filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (recentTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    console.warn(
      `[Webhook] レートリミット超過: uid=${uid.substring(0, 8)}..., ${recentTimestamps.length}回/分`
    );
    return false;
  }

  recentTimestamps.push(now);
  rateLimitMap.set(uid, recentTimestamps);
  return true;
}

// ============================================================
// ペイロード解析
// ============================================================

interface ParsedPayload {
  lineUid: string;
  messageText: string;
}

function parsePayload(body: Record<string, unknown>): ParsedPayload | null {
  // Liny のペイロード形式に柔軟に対応
  const lineUid =
    (body.uid as string) ??
    (body.line_uid as string) ??
    (body.user_id as string) ??
    (body.userId as string);

  const messageText =
    (body.message as string) ??
    (body.text as string) ??
    (body.content as string);

  if (!lineUid || !messageText) {
    return null;
  }

  return { lineUid, messageText };
}

// ============================================================
// POST ハンドラ
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: リクエストボディ取得
    const rawBody = await request.text();

    // Step 2: 署名検証
    if (!verifyWebhookSignature(request, rawBody)) {
      console.error("[Webhook] 署名検証失敗");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Step 3: ペイロード解析
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const parsed = parsePayload(body);
    if (!parsed) {
      return NextResponse.json(
        { error: "Missing uid or message in payload" },
        { status: 400 }
      );
    }

    const { lineUid, messageText } = parsed;

    // Step 3.5: レートリミットチェック
    if (!checkRateLimit(lineUid)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before sending more messages." },
        { status: 429 }
      );
    }

    console.log(
      `[Webhook] Inbound: uid=${lineUid.substring(0, 8)}..., message="${messageText.substring(0, 50)}"`
    );

    // Step 4: セッション取得/作成
    const session = await createOrGetChatSession(lineUid);

    // Step 5: 顧客メッセージ保存
    await saveChatMessage({
      sessionId: session.id,
      role: "customer",
      content: messageText,
    });

    // Step 6: AI応答生成（セッション内の会話履歴を含むマルチターン対応）
    const aiResponse = await handleInboundMessage(lineUid, messageText, session.id);

    // Step 7: AI応答保存
    await saveChatMessage({
      sessionId: session.id,
      role: "assistant",
      content: aiResponse.reply,
      category: aiResponse.category,
      needsHumanSupport: aiResponse.needsHumanSupport,
      confidence: aiResponse.confidence,
      inputTokens: aiResponse.tokensUsed.input,
      outputTokens: aiResponse.tokensUsed.output,
    });

    // Step 8: トークン使用量を記録
    trackTokenUsage({
      sessionId: session.id,
      inputTokens: aiResponse.tokensUsed.input,
      outputTokens: aiResponse.tokensUsed.output,
      category: aiResponse.category,
    });

    // Step 9: エスカレーション処理（Linyタグ付与 + 外部Webhook通知）
    const escalationResult = await handleEscalation(
      session,
      aiResponse,
      lineUid
    );

    // エスカレーションなしの場合もカテゴリは更新
    if (!aiResponse.needsHumanSupport) {
      await updateSessionStatus(session.id, "active", {
        inquiryCategory: aiResponse.category,
      });
    }

    // Step 10: Liny経由でLINE返信
    const linyResult = await sendLinyRequest({
      uid: lineUid,
      action_type: "message",
      message: aiResponse.reply,
    });

    if (!linyResult.success) {
      console.error("[Webhook] Liny送信失敗:", linyResult.error);
      // Liny送信失敗でもWebhookは成功扱い（メッセージはDB保存済み）
    }

    const elapsedMs = Date.now() - startTime;
    console.log(
      `[Webhook] 完了: category=${aiResponse.category}, escalated=${aiResponse.needsHumanSupport}, confidence=${aiResponse.confidence}, ${elapsedMs}ms`
    );

    // Step 11: レスポンス返却
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      category: aiResponse.category,
      needsHumanSupport: aiResponse.needsHumanSupport,
      confidence: aiResponse.confidence,
      escalation: escalationResult.escalated
        ? {
            linyTags: escalationResult.linyTagResult.tagsAdded,
            webhookSent: escalationResult.webhookResult.sent,
          }
        : null,
      elapsedMs,
    });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error(`[Webhook] 内部エラー (${elapsedMs}ms):`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
