"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Users, Zap, Trash2, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import type {
  Segment,
  SegmentCondition,
  SegmentConditionGroup,
} from "@/lib/segment-fields";
import {
  SEGMENT_FIELDS,
  OPERATORS,
} from "@/lib/segment-fields";

const initialSegments: Segment[] = [
  {
    id: 1, name: "離反リスク（30日未注文）", type: "dynamic", memberCount: 47, lastUpdated: "2026-03-03", createdAt: "2026-01-15",
    conditionGroups: [{ id: "g1", logic: "AND", conditions: [{ id: "c1", field: "lastOrderDaysAgo", operator: "gte", value: 30 }, { id: "c2", field: "crmStatus", operator: "eq", value: "churn_risk" }] }],
  },
  {
    id: 2, name: "高単価顧客（月20万以上）", type: "dynamic", memberCount: 68, lastUpdated: "2026-03-03", createdAt: "2026-01-15",
    conditionGroups: [{ id: "g1", logic: "AND", conditions: [{ id: "c1", field: "monthlyOrderAmount", operator: "gte", value: 200000 }] }],
  },
  {
    id: 3, name: "新規顧客（30日以内）", type: "dynamic", memberCount: 18, lastUpdated: "2026-03-03", createdAt: "2026-02-01",
    conditionGroups: [{ id: "g1", logic: "AND", conditions: [{ id: "c1", field: "startTradingDaysAgo", operator: "lte", value: 30 }] }],
  },
  {
    id: 4, name: "LINE未連携", type: "dynamic", memberCount: 89, lastUpdated: "2026-03-03", createdAt: "2026-02-01",
    conditionGroups: [{ id: "g1", logic: "AND", conditions: [{ id: "c1", field: "lineConnected", operator: "eq", value: "false" }] }],
  },
  {
    id: 5, name: "3月キャンペーン対象", type: "static", memberCount: 150, lastUpdated: "2026-03-01", createdAt: "2026-03-01",
    conditionGroups: [],
  },
  {
    id: 6, name: "カゴ落ちユーザー", type: "dynamic", memberCount: 23, lastUpdated: "2026-03-03", createdAt: "2026-02-15",
    conditionGroups: [{ id: "g1", logic: "AND", conditions: [{ id: "c1", field: "crmStatus", operator: "eq", value: "active" }] }],
  },
];

let nextId = 7;
function genId() {
  return `id_${nextId++}_${Date.now()}`;
}

function getFieldDef(fieldValue: string) {
  return SEGMENT_FIELDS.find((f) => f.value === fieldValue);
}

function getOperatorsForField(fieldValue: string) {
  const field = getFieldDef(fieldValue);
  if (!field) return OPERATORS.number;
  if (field.type === "select") return OPERATORS.select;
  if (field.type === "boolean") return OPERATORS.boolean;
  return OPERATORS.number;
}

function ConditionRow({
  condition,
  onUpdate,
  onRemove,
  showRemove,
}: {
  condition: SegmentCondition;
  onUpdate: (updated: SegmentCondition) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const fieldDef = getFieldDef(condition.field);
  const operators = getOperatorsForField(condition.field);

  return (
    <div className="flex items-center gap-2">
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select
        value={condition.field}
        onValueChange={(v) => {
          const newFieldDef = getFieldDef(v);
          const newOps = newFieldDef?.type === "select" ? OPERATORS.select : newFieldDef?.type === "boolean" ? OPERATORS.boolean : OPERATORS.number;
          onUpdate({ ...condition, field: v, operator: newOps[0].value, value: "" });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="フィールド" />
        </SelectTrigger>
        <SelectContent>
          {SEGMENT_FIELDS.map((f) => (
            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={condition.operator}
        onValueChange={(v) => onUpdate({ ...condition, operator: v })}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {fieldDef?.type === "select" && "options" in fieldDef ? (
        <Select
          value={String(condition.value)}
          onValueChange={(v) => onUpdate({ ...condition, value: v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="値を選択" />
          </SelectTrigger>
          <SelectContent>
            {fieldDef.options.map((opt: string) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : fieldDef?.type === "boolean" ? (
        <Select
          value={String(condition.value)}
          onValueChange={(v) => onUpdate({ ...condition, value: v })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="値を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">はい</SelectItem>
            <SelectItem value="false">いいえ</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          type="number"
          value={condition.value}
          onChange={(e) => onUpdate({ ...condition, value: e.target.value ? Number(e.target.value) : "" })}
          placeholder="値"
          className="w-[120px]"
        />
      )}

      {showRemove && (
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onRemove}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}

function ConditionGroupEditor({
  group,
  onUpdate,
  onRemove,
  showRemove,
}: {
  group: SegmentConditionGroup;
  onUpdate: (updated: SegmentConditionGroup) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const addCondition = () => {
    onUpdate({
      ...group,
      conditions: [
        ...group.conditions,
        { id: genId(), field: "monthlyOrderAmount", operator: "gte", value: "" },
      ],
    });
  };

  const updateCondition = (idx: number, updated: SegmentCondition) => {
    const newConditions = [...group.conditions];
    newConditions[idx] = updated;
    onUpdate({ ...group, conditions: newConditions });
  };

  const removeCondition = (idx: number) => {
    onUpdate({
      ...group,
      conditions: group.conditions.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">条件グループ</span>
          <Select
            value={group.logic}
            onValueChange={(v: "AND" | "OR") => onUpdate({ ...group, logic: v })}
          >
            <SelectTrigger className="w-[90px] h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND（全て）</SelectItem>
              <SelectItem value="OR">OR（いずれか）</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {showRemove && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onRemove}>
            <Trash2 className="h-3 w-3 mr-1" /> グループ削除
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {group.conditions.map((cond, idx) => (
          <div key={cond.id}>
            {idx > 0 && (
              <div className="flex items-center gap-2 py-1 pl-6">
                <Badge variant="outline" className="text-[10px]">{group.logic}</Badge>
              </div>
            )}
            <ConditionRow
              condition={cond}
              onUpdate={(updated) => updateCondition(idx, updated)}
              onRemove={() => removeCondition(idx)}
              showRemove={group.conditions.length > 1}
            />
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="text-xs h-7" onClick={addCondition}>
        <Plus className="h-3 w-3 mr-1" /> 条件を追加
      </Button>
    </div>
  );
}

function SegmentDetailDialog({
  segment,
  open,
  onClose,
}: {
  segment: Segment | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!segment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {segment.name}
            <Badge variant="outline" className="text-[10px]">
              {segment.type === "dynamic" ? "動的" : "静的"}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">メンバー数:</span>{" "}
              <span className="font-medium">{segment.memberCount}人</span>
            </div>
            <div>
              <span className="text-muted-foreground">作成日:</span>{" "}
              <span>{segment.createdAt}</span>
            </div>
            <div>
              <span className="text-muted-foreground">更新日:</span>{" "}
              <span>{segment.lastUpdated}</span>
            </div>
          </div>

          {segment.conditionGroups.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">条件</h4>
              {segment.conditionGroups.map((group) => (
                <div key={group.id} className="border rounded-md p-3 bg-muted/30 space-y-1">
                  <Badge variant="outline" className="text-[10px] mb-2">
                    {group.logic === "AND" ? "全て一致" : "いずれか一致"}
                  </Badge>
                  {group.conditions.map((cond) => {
                    const fieldDef = getFieldDef(cond.field);
                    const ops = getOperatorsForField(cond.field);
                    const opLabel = ops.find((o) => o.value === cond.operator)?.label || cond.operator;
                    let displayValue = String(cond.value);
                    if (fieldDef?.type === "boolean") {
                      displayValue = cond.value === "true" ? "はい" : "いいえ";
                    }
                    return (
                      <p key={cond.id} className="text-sm">
                        <span className="font-medium">{fieldDef?.label || cond.field}</span>{" "}
                        <span className="text-muted-foreground">{opLabel}</span>{" "}
                        <span className="font-medium">{displayValue}</span>
                      </p>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">静的セグメント（手動で顧客を追加）</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>閉じる</Button>
          <Button>
            <Zap className="h-4 w-4 mr-1" /> このセグメントに配信
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [segType, setSegType] = useState<"dynamic" | "static">("dynamic");
  const [conditionGroups, setConditionGroups] = useState<SegmentConditionGroup[]>([
    { id: genId(), logic: "AND", conditions: [{ id: genId(), field: "monthlyOrderAmount", operator: "gte", value: "" }] },
  ]);

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setSegType("dynamic");
    setConditionGroups([
      { id: genId(), logic: "AND", conditions: [{ id: genId(), field: "monthlyOrderAmount", operator: "gte", value: "" }] },
    ]);
  }, []);

  const addGroup = () => {
    setConditionGroups([
      ...conditionGroups,
      { id: genId(), logic: "AND", conditions: [{ id: genId(), field: "monthlyOrderAmount", operator: "gte", value: "" }] },
    ]);
  };

  const updateGroup = (idx: number, updated: SegmentConditionGroup) => {
    const newGroups = [...conditionGroups];
    newGroups[idx] = updated;
    setConditionGroups(newGroups);
  };

  const removeGroup = (idx: number) => {
    setConditionGroups(conditionGroups.filter((_, i) => i !== idx));
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const newSegment: Segment = {
      id: Math.max(...segments.map((s) => s.id), 0) + 1,
      name: name.trim(),
      type: segType,
      description: description.trim() || undefined,
      conditionGroups: segType === "dynamic" ? conditionGroups : [],
      memberCount: Math.floor(Math.random() * 100) + 10,
      lastUpdated: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setSegments([...segments, newSegment]);
    setShowCreate(false);
    resetForm();
    toast.success(`セグメント「${newSegment.name}」を作成しました`);
  };

  const handleDelete = (id: number) => {
    const target = segments.find((s) => s.id === id);
    setSegments(segments.filter((s) => s.id !== id));
    toast.success(`セグメント「${target?.name}」を削除しました`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">セグメント</h1>
          <p className="text-sm text-muted-foreground">
            属性 + 行動条件でターゲットグループを作成
          </p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="h-4 w-4 mr-1" /> 新規作成
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((seg) => (
          <Card
            key={seg.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedSegment(seg)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{seg.name}</CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {seg.type === "dynamic" ? "動的" : "静的"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold">{seg.memberCount}</span>
                  <span className="text-xs text-muted-foreground">人</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <Zap className="h-3 w-3 mr-1" /> 配信
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 text-red-500 hover:text-red-600"
                    onClick={(e) => { e.stopPropagation(); handleDelete(seg.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {seg.conditionGroups.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {seg.conditionGroups.flatMap((g) =>
                    g.conditions.map((c) => {
                      const f = getFieldDef(c.field);
                      return (
                        <p key={c.id} className="text-[11px] text-muted-foreground truncate">
                          {f?.label || c.field} {getOperatorsForField(c.field).find((o) => o.value === c.operator)?.label} {c.value === "true" ? "はい" : c.value === "false" ? "いいえ" : String(c.value)}
                        </p>
                      );
                    })
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                最終更新: {seg.lastUpdated}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SegmentDetailDialog
        segment={selectedSegment}
        open={!!selectedSegment}
        onClose={() => setSelectedSegment(null)}
      />

      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) setShowCreate(false); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>セグメント新規作成</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seg-name">セグメント名</Label>
                <Input
                  id="seg-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 高単価顧客（月20万以上）"
                />
              </div>
              <div className="space-y-2">
                <Label>タイプ</Label>
                <Select value={segType} onValueChange={(v: "dynamic" | "static") => setSegType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dynamic">動的（条件で自動更新）</SelectItem>
                    <SelectItem value="static">静的（手動追加）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seg-desc">説明（任意）</Label>
              <Textarea
                id="seg-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="セグメントの用途を記載..."
                rows={2}
              />
            </div>

            {segType === "dynamic" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>絞り込み条件</Label>
                  <span className="text-xs text-muted-foreground">
                    グループ間は OR 結合
                  </span>
                </div>

                {conditionGroups.map((group, idx) => (
                  <div key={group.id}>
                    {idx > 0 && (
                      <div className="flex items-center justify-center py-2">
                        <Badge variant="secondary" className="text-[10px]">OR</Badge>
                      </div>
                    )}
                    <ConditionGroupEditor
                      group={group}
                      onUpdate={(updated) => updateGroup(idx, updated)}
                      onRemove={() => removeGroup(idx)}
                      showRemove={conditionGroups.length > 1}
                    />
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={addGroup}>
                  <Plus className="h-4 w-4 mr-1" /> OR グループを追加
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
