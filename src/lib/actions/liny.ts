"use server";

import { getLinyConfig, testLinyConnection, sendLinyRequest } from "@/lib/liny";
import type { LinyApiResult } from "@/lib/liny";

/**
 * Liny接続状態を取得
 */
export async function getLinyConnectionStatus(): Promise<{
  configured: boolean;
  endpointUrl?: string;
  tokenPreview?: string;
}> {
  const config = getLinyConfig();
  if (!config) {
    return { configured: false };
  }

  // トークンの先頭8文字のみ表示（セキュリティ）
  const tokenPreview = config.apiToken.substring(0, 8) + "****";

  return {
    configured: true,
    endpointUrl: config.endpointUrl,
    tokenPreview,
  };
}

/**
 * Liny接続テスト
 */
export async function testLinyConnectionAction(): Promise<LinyApiResult> {
  return testLinyConnection();
}

/**
 * 友だちにタグを付与（Liny経由）
 */
export async function addLinyTag(
  uid: string,
  tagName: string
): Promise<LinyApiResult> {
  return sendLinyRequest({
    uid,
    action_type: "tag_add",
    tag_name: tagName,
  });
}

/**
 * 友だちのタグを削除（Liny経由）
 */
export async function removeLinyTag(
  uid: string,
  tagName: string
): Promise<LinyApiResult> {
  return sendLinyRequest({
    uid,
    action_type: "tag_remove",
    tag_name: tagName,
  });
}

/**
 * 友だち情報を更新（Liny経由）
 */
export async function updateLinyFriendInfo(
  uid: string,
  fieldName: string,
  value: string | number
): Promise<LinyApiResult> {
  return sendLinyRequest({
    uid,
    action_type: "friend_info",
    field_name: fieldName,
    field_value: value,
  });
}

/**
 * シナリオを起動（Liny経由）
 */
export async function triggerLinyScenario(
  uid: string,
  scenarioId?: string
): Promise<LinyApiResult> {
  return sendLinyRequest({
    uid,
    action_type: "scenario",
    ...(scenarioId ? { scenario_id: scenarioId } : {}),
  });
}

/**
 * CRM自動配信ルール実行時のLinyアクション
 * 離反リスク検知→タグ付与＋シナリオ起動 など複合アクションに対応
 */
export async function executeLinyAutomationAction(
  uid: string,
  actions: {
    tagAdd?: string[];
    tagRemove?: string[];
    friendInfo?: { field: string; value: string | number }[];
    triggerScenario?: boolean;
    scenarioId?: string;
  }
): Promise<{ results: LinyApiResult[]; summary: string }> {
  const results: LinyApiResult[] = [];
  const actionLabels: string[] = [];

  // タグ追加
  if (actions.tagAdd) {
    for (const tag of actions.tagAdd) {
      const result = await addLinyTag(uid, tag);
      results.push(result);
      actionLabels.push(`タグ追加「${tag}」: ${result.success ? "成功" : "失敗"}`);
    }
  }

  // タグ削除
  if (actions.tagRemove) {
    for (const tag of actions.tagRemove) {
      const result = await removeLinyTag(uid, tag);
      results.push(result);
      actionLabels.push(`タグ削除「${tag}」: ${result.success ? "成功" : "失敗"}`);
    }
  }

  // 友だち情報更新
  if (actions.friendInfo) {
    for (const info of actions.friendInfo) {
      const result = await updateLinyFriendInfo(uid, info.field, info.value);
      results.push(result);
      actionLabels.push(`友だち情報「${info.field}」更新: ${result.success ? "成功" : "失敗"}`);
    }
  }

  // シナリオ起動
  if (actions.triggerScenario) {
    const result = await triggerLinyScenario(uid, actions.scenarioId);
    results.push(result);
    actionLabels.push(`シナリオ起動: ${result.success ? "成功" : "失敗"}`);
  }

  const successCount = results.filter((r) => r.success).length;
  const summary = `${successCount}/${results.length}件のアクションが成功\n${actionLabels.join("\n")}`;

  return { results, summary };
}
