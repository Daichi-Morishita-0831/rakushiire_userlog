"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Zap, Clock, Power, PowerOff, Trash2, Pencil, Tag, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { AutomationRule } from "@/lib/actions/automation";

const TRIGGER_TYPES = [
  { value: "no_order", label: "注文なし（日数指定）", description: "指定日数以上注文がない場合" },
  { value: "cart_abandon", label: "カゴ落ち", description: "カートに商品を入れたまま放置" },
  { value: "order_decline", label: "注文頻度低下", description: "注文頻度が前月比で低下" },
  { value: "no_login", label: "ログインなし（日数指定）", description: "指定日数以上ログインがない場合" },
  { value: "new_customer", label: "新規取引開始", description: "取引開始後にフォローアップ" },
] as const;

const initialRules: AutomationRule[] = [
  { id: 1, name: "離反リスク通知", trigger: "30日間注文なし", triggerType: "no_order", triggerDays: 30, channel: "LINE", channels: ["line"], delay: "即時", delayMinutes: 0, cooldown: 14, isActive: true, executionCount: 156, createdAt: "2026-01-15", messageTemplate: "最近ご注文がないようですが、いかがでしょうか？\n期間限定の特別価格をご用意しております。" },
  { id: 2, name: "カゴ落ちリマインド", trigger: "カート放置24時間", triggerType: "cart_abandon", triggerDays: 1, channel: "LINE", channels: ["line"], delay: "24時間後", delayMinutes: 1440, cooldown: 3, isActive: true, executionCount: 89, createdAt: "2026-01-20", messageTemplate: "カートに商品が残っています。\nご注文をお忘れではありませんか？" },
  { id: 3, name: "新規フォローアップ", trigger: "取引開始後3日", triggerType: "new_customer", triggerDays: 3, channel: "メール", channels: ["email"], delay: "3日後", delayMinutes: 4320, cooldown: 30, isActive: true, executionCount: 42, createdAt: "2026-02-01", messageTemplate: "ご利用ありがとうございます。\n何かご不明点がございましたらお気軽にお問い合わせください。" },
  { id: 4, name: "高単価顧客ケア", trigger: "注文頻度30%低下", triggerType: "order_decline", triggerDays: 0, channel: "LINE+メール", channels: ["line", "email"], delay: "即時", delayMinutes: 0, cooldown: 14, isActive: false, executionCount: 0, createdAt: "2026-02-15" },
  { id: 5, name: "再訪促進", trigger: "60日間ログインなし", triggerType: "no_login", triggerDays: 60, channel: "メール", channels: ["email"], delay: "即時", delayMinutes: 0, cooldown: 30, isActive: false, executionCount: 0, createdAt: "2026-02-20" },
];

function formatDelay(minutes: number): string {
  if (minutes === 0) return "即時";
  if (minutes < 60) return `${minutes}分後`;
  if (minutes < 1440) return `${minutes / 60}時間後`;
  return `${minutes / 1440}日後`;
}

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>(initialRules);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formTriggerType, setFormTriggerType] = useState("no_order");
  const [formTriggerDays, setFormTriggerDays] = useState(30);
  const [formChannels, setFormChannels] = useState<string[]>(["line"]);
  const [formDelayMinutes, setFormDelayMinutes] = useState(0);
  const [formCooldown, setFormCooldown] = useState(14);
  const [formMessage, setFormMessage] = useState("");
  // Linyアクション
  const [formLinyTagAdd, setFormLinyTagAdd] = useState("");
  const [formLinyScenario, setFormLinyScenario] = useState(false);

  const resetForm = () => {
    setFormName("");
    setFormTriggerType("no_order");
    setFormTriggerDays(30);
    setFormChannels(["line"]);
    setFormDelayMinutes(0);
    setFormCooldown(14);
    setFormMessage("");
    setFormLinyTagAdd("");
    setFormLinyScenario(false);
    setEditingRule(null);
  };

  const openEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormTriggerType(rule.triggerType);
    setFormTriggerDays(rule.triggerDays);
    setFormChannels(rule.channels);
    setFormDelayMinutes(rule.delayMinutes);
    setFormCooldown(rule.cooldown);
    setFormMessage(rule.messageTemplate || "");
    setShowCreate(true);
  };

  const toggleChannel = (ch: string) => {
    setFormChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSave = () => {
    if (!formName.trim() || formChannels.length === 0) return;

    const triggerDef = TRIGGER_TYPES.find((t) => t.value === formTriggerType);
    const triggerLabel = formTriggerType === "no_order"
      ? `${formTriggerDays}日間注文なし`
      : formTriggerType === "no_login"
      ? `${formTriggerDays}日間ログインなし`
      : formTriggerType === "cart_abandon"
      ? `カート放置${formTriggerDays * 24}時間`
      : formTriggerType === "new_customer"
      ? `取引開始後${formTriggerDays}日`
      : triggerDef?.label || "";

    const channelLabel = formChannels.map((c) => c === "line" ? "LINE" : c === "email" ? "メール" : "SMS").join("+");

    if (editingRule) {
      setRules(rules.map((r) =>
        r.id === editingRule.id
          ? {
              ...r,
              name: formName.trim(),
              trigger: triggerLabel,
              triggerType: formTriggerType as AutomationRule["triggerType"],
              triggerDays: formTriggerDays,
              channel: channelLabel,
              channels: formChannels,
              delay: formatDelay(formDelayMinutes),
              delayMinutes: formDelayMinutes,
              cooldown: formCooldown,
              messageTemplate: formMessage.trim() || undefined,
            }
          : r
      ));
      toast.success(`ルール「${formName.trim()}」を更新しました`);
    } else {
      const newRule: AutomationRule = {
        id: Math.max(...rules.map((r) => r.id), 0) + 1,
        name: formName.trim(),
        trigger: triggerLabel,
        triggerType: formTriggerType as AutomationRule["triggerType"],
        triggerDays: formTriggerDays,
        channel: channelLabel,
        channels: formChannels,
        delay: formatDelay(formDelayMinutes),
        delayMinutes: formDelayMinutes,
        cooldown: formCooldown,
        isActive: false,
        executionCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        messageTemplate: formMessage.trim() || undefined,
      };
      setRules([...rules, newRule]);
      toast.success(`ルール「${newRule.name}」を作成しました`);
    }
    setShowCreate(false);
    resetForm();
  };

  const toggleActive = (id: number) => {
    const target = rules.find((r) => r.id === id);
    setRules(rules.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));
    toast.success(`「${target?.name}」を${target?.isActive ? "停止" : "有効化"}しました`);
  };

  const deleteRule = (id: number) => {
    const target = rules.find((r) => r.id === id);
    setRules(rules.filter((r) => r.id !== id));
    toast.success(`ルール「${target?.name}」を削除しました`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">自動配信ルール</h1>
          <p className="text-sm text-muted-foreground">
            トリガー条件に基づく自動配信を設定
          </p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="h-4 w-4 mr-1" /> 新規ルール作成
        </Button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id} className={!rule.isActive ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${rule.isActive ? "bg-green-100" : "bg-gray-100"}`}>
                    <Zap className={`h-4 w-4 ${rule.isActive ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{rule.name}</h3>
                      <Badge variant={rule.isActive ? "default" : "secondary"} className="text-[10px]">
                        {rule.isActive ? "有効" : "無効"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3" /> {rule.trigger}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {rule.delay}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${rule.channel.includes("LINE") ? "border-green-300" : "border-blue-300"}`}>
                        {rule.channel}
                      </Badge>
                    </div>
                    {rule.messageTemplate && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[400px]">
                        {rule.messageTemplate}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{rule.executionCount}回</p>
                    <p className="text-xs text-muted-foreground">累計実行</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">クールダウン</p>
                    <p className="text-sm">{rule.cooldown}日</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rule)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(rule.id)}>
                      {rule.isActive ? <Power className="h-4 w-4 text-green-500" /> : <PowerOff className="h-4 w-4 text-gray-400" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) { setShowCreate(false); resetForm(); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "ルール編集" : "新規ルール作成"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">ルール名</Label>
              <Input
                id="rule-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例: 離反リスク通知"
              />
            </div>

            <div className="space-y-2">
              <Label>トリガー</Label>
              <Select value={formTriggerType} onValueChange={setFormTriggerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <p className="text-sm">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formTriggerType === "no_order" || formTriggerType === "no_login" || formTriggerType === "cart_abandon" || formTriggerType === "new_customer") && (
              <div className="space-y-2">
                <Label>
                  {formTriggerType === "no_order" || formTriggerType === "no_login"
                    ? "未アクション日数"
                    : formTriggerType === "cart_abandon"
                    ? "放置時間（日単位）"
                    : "取引開始後の日数"}
                </Label>
                <Input
                  type="number"
                  value={formTriggerDays}
                  onChange={(e) => setFormTriggerDays(Number(e.target.value))}
                  min={1}
                  className="w-[120px]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>配信チャネル</Label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="ch-line"
                    checked={formChannels.includes("line")}
                    onCheckedChange={() => toggleChannel("line")}
                  />
                  <label htmlFor="ch-line" className="text-sm">LINE</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="ch-email"
                    checked={formChannels.includes("email")}
                    onCheckedChange={() => toggleChannel("email")}
                  />
                  <label htmlFor="ch-email" className="text-sm">メール</label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>送信ディレイ（分）</Label>
                <Select value={String(formDelayMinutes)} onValueChange={(v) => setFormDelayMinutes(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">即時</SelectItem>
                    <SelectItem value="60">1時間後</SelectItem>
                    <SelectItem value="360">6時間後</SelectItem>
                    <SelectItem value="720">12時間後</SelectItem>
                    <SelectItem value="1440">24時間後</SelectItem>
                    <SelectItem value="4320">3日後</SelectItem>
                    <SelectItem value="10080">7日後</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>クールダウン（日）</Label>
                <Input
                  type="number"
                  value={formCooldown}
                  onChange={(e) => setFormCooldown(Number(e.target.value))}
                  min={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-message">メッセージテンプレート</Label>
              <Textarea
                id="rule-message"
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="配信メッセージの内容を入力..."
                rows={4}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>変数:</span>
                <Badge variant="outline" className="text-[10px] cursor-pointer" onClick={() => setFormMessage(formMessage + "{{customer_name}}")}>
                  {"{{customer_name}}"}
                </Badge>
                <Badge variant="outline" className="text-[10px] cursor-pointer" onClick={() => setFormMessage(formMessage + "{{shop_name}}")}>
                  {"{{shop_name}}"}
                </Badge>
              </div>
            </div>

            {/* Linyアクション */}
            {formChannels.includes("line") && (
              <div className="space-y-3 rounded-lg border border-green-200 bg-green-50/50 p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-[#00B900]/10 p-1">
                    <Tag className="h-3.5 w-3.5 text-[#00B900]" />
                  </div>
                  <p className="text-sm font-medium">Linyアクション</p>
                  <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700 border-green-200">API連携</Badge>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liny-tag">タグ付与（カンマ区切りで複数指定可）</Label>
                  <Input
                    id="liny-tag"
                    value={formLinyTagAdd}
                    onChange={(e) => setFormLinyTagAdd(e.target.value)}
                    placeholder="例: 離反リスク, 30日未注文"
                    className="bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="liny-scenario"
                    checked={formLinyScenario}
                    onCheckedChange={(v) => setFormLinyScenario(v === true)}
                  />
                  <Label htmlFor="liny-scenario" className="flex items-center gap-1.5 cursor-pointer">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    Linyシナリオを起動する
                  </Label>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={!formName.trim() || formChannels.length === 0}>
              {editingRule ? "保存" : "作成"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
