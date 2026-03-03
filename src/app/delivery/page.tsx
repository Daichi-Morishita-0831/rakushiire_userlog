"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Send, MessageSquare, Mail, Phone, ArrowRight, ArrowLeft, Check, Users, Clock, Eye } from "lucide-react";

type Channel = "line" | "email" | "sms";

const mockSegments = [
  { id: 1, name: "離反リスク（30日未注文）", memberCount: 47 },
  { id: 2, name: "高単価顧客（月20万以上）", memberCount: 68 },
  { id: 3, name: "新規顧客（30日以内）", memberCount: 18 },
  { id: 4, name: "LINE未連携", memberCount: 89 },
  { id: 5, name: "3月キャンペーン対象", memberCount: 150 },
  { id: 6, name: "カゴ落ちユーザー", memberCount: 23 },
];

const STEPS = ["対象選択", "チャネル選択", "メッセージ作成", "確認", "完了"] as const;

function StepIndicator({ current, steps }: { current: number; steps: readonly string[] }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            idx < current
              ? "bg-green-100 text-green-700"
              : idx === current
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}>
            {idx < current ? <Check className="h-3 w-3" /> : <span>{idx + 1}</span>}
            {step}
          </div>
          {idx < steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      ))}
    </div>
  );
}

export default function DeliveryPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  // Wizard form state
  const [targetType, setTargetType] = useState<"segment" | "all">("segment");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>("");
  const [channel, setChannel] = useState<Channel>("line");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");

  const resetWizard = () => {
    setStep(0);
    setTargetType("segment");
    setSelectedSegmentId("");
    setChannel("line");
    setSubject("");
    setBody("");
    setScheduleType("now");
    setScheduledDate("");
    setScheduledTime("09:00");
  };

  const openWizard = (ch?: Channel) => {
    resetWizard();
    if (ch) {
      setChannel(ch);
      setStep(0);
    }
    setShowWizard(true);
  };

  const selectedSegment = mockSegments.find((s) => s.id === Number(selectedSegmentId));
  const targetCount = targetType === "all" ? 342 : (selectedSegment?.memberCount || 0);

  const canNext = () => {
    if (step === 0) return targetType === "all" || !!selectedSegmentId;
    if (step === 1) return true;
    if (step === 2) return body.trim().length > 0;
    return true;
  };

  const handleSend = () => {
    setStep(4); // Move to "完了" step
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">手動配信</h1>
        <p className="text-sm text-muted-foreground">
          LINE / メール / SMS の手動送信
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-green-200"
          onClick={() => openWizard("line")}
        >
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mx-auto">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium mt-3">LINE配信</h3>
            <p className="text-xs text-muted-foreground mt-1">
              LINE連携済みユーザーに送信
            </p>
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
              配信可能: 342人
            </Badge>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-blue-200"
          onClick={() => openWizard("email")}
        >
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mx-auto">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium mt-3">メール配信</h3>
            <p className="text-xs text-muted-foreground mt-1">
              メールアドレス登録済みユーザーに送信
            </p>
            <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700">
              配信可能: 498人
            </Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border-purple-200 opacity-60">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mx-auto">
              <Phone className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium mt-3">SMS配信</h3>
            <p className="text-xs text-muted-foreground mt-1">
              電話番号登録済みユーザーに送信
            </p>
            <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-500">
              SMS未導入（PDM確認中）
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Delivery wizard dialog */}
      <Dialog open={showWizard} onOpenChange={(open) => { if (!open) setShowWizard(false); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>配信作成</DialogTitle>
          </DialogHeader>

          <StepIndicator current={step} steps={STEPS} />

          <div className="min-h-[300px]">
            {/* Step 0: Target selection */}
            {step === 0 && (
              <div className="space-y-4 pt-4">
                <Label>配信対象</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card
                    className={`cursor-pointer transition-all ${targetType === "segment" ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"}`}
                    onClick={() => setTargetType("segment")}
                  >
                    <CardContent className="p-4 text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">セグメントから選択</p>
                      <p className="text-xs text-muted-foreground mt-1">条件に合う顧客に配信</p>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all ${targetType === "all" ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"}`}
                    onClick={() => setTargetType("all")}
                  >
                    <CardContent className="p-4 text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">全アクティブ顧客</p>
                      <p className="text-xs text-muted-foreground mt-1">342人に配信</p>
                    </CardContent>
                  </Card>
                </div>

                {targetType === "segment" && (
                  <div className="space-y-2">
                    <Label>セグメント</Label>
                    <Select value={selectedSegmentId} onValueChange={setSelectedSegmentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="セグメントを選択..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSegments.map((seg) => (
                          <SelectItem key={seg.id} value={String(seg.id)}>
                            {seg.name}（{seg.memberCount}人）
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(targetType === "all" || selectedSegmentId) && (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm">
                      配信対象: <span className="font-bold">{targetCount}人</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Channel selection */}
            {step === 1 && (
              <div className="space-y-4 pt-4">
                <Label>配信チャネル</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card
                    className={`cursor-pointer transition-all ${channel === "line" ? "border-green-500 ring-1 ring-green-500" : "hover:border-green-300"}`}
                    onClick={() => setChannel("line")}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-2">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">LINE</p>
                        <p className="text-xs text-muted-foreground">プッシュ通知</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all ${channel === "email" ? "border-blue-500 ring-1 ring-blue-500" : "hover:border-blue-300"}`}
                    onClick={() => setChannel("email")}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">メール</p>
                        <p className="text-xs text-muted-foreground">AWS SES</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 2: Message composition */}
            {step === 2 && (
              <div className="space-y-4 pt-4">
                {channel === "email" && (
                  <div className="space-y-2">
                    <Label htmlFor="delivery-subject">件名</Label>
                    <Input
                      id="delivery-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="メールの件名"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="delivery-body">
                    {channel === "line" ? "メッセージ本文" : "メール本文"}
                  </Label>
                  <Textarea
                    id="delivery-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={channel === "line"
                      ? "LINEメッセージの本文を入力...\n\n※変数: {{customer_name}}, {{shop_name}}"
                      : "メール本文を入力...\n\n※変数: {{customer_name}}, {{shop_name}}"
                    }
                    rows={8}
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>利用可能な変数:</span>
                    <Badge variant="outline" className="text-[10px] cursor-pointer" onClick={() => setBody(body + "{{customer_name}}")}>
                      {"{{customer_name}}"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] cursor-pointer" onClick={() => setBody(body + "{{shop_name}}")}>
                      {"{{shop_name}}"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] cursor-pointer" onClick={() => setBody(body + "{{last_order_date}}")}>
                      {"{{last_order_date}}"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>配信タイミング</Label>
                  <div className="flex gap-3">
                    <Card
                      className={`cursor-pointer flex-1 transition-all ${scheduleType === "now" ? "border-primary ring-1 ring-primary" : ""}`}
                      onClick={() => setScheduleType("now")}
                    >
                      <CardContent className="p-3 flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        <span className="text-sm">即時送信</span>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer flex-1 transition-all ${scheduleType === "scheduled" ? "border-primary ring-1 ring-primary" : ""}`}
                      onClick={() => setScheduleType("scheduled")}
                    >
                      <CardContent className="p-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">予約配信</span>
                      </CardContent>
                    </Card>
                  </div>
                  {scheduleType === "scheduled" && (
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-[180px]"
                      />
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-[120px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-4 pt-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" /> 配信内容の確認
                </h3>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">配信対象:</span>{" "}
                      <span className="font-medium">
                        {targetType === "all" ? "全アクティブ顧客" : selectedSegment?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">対象人数:</span>{" "}
                      <span className="font-medium">{targetCount}人</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">チャネル:</span>{" "}
                      <Badge variant="secondary" className={`text-[10px] ${
                        channel === "line" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {channel.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">タイミング:</span>{" "}
                      <span className="font-medium">
                        {scheduleType === "now" ? "即時送信" : `${scheduledDate} ${scheduledTime}`}
                      </span>
                    </div>
                  </div>
                  {subject && (
                    <div>
                      <p className="text-xs text-muted-foreground">件名</p>
                      <p className="text-sm font-medium">{subject}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">本文</p>
                    <div className="mt-1 rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">
                      {body}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === 4 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold mt-4">
                  {scheduleType === "now" ? "配信が完了しました" : "配信を予約しました"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {targetCount}人に{channel.toUpperCase()}を
                  {scheduleType === "now" ? "送信しました" : `${scheduledDate} ${scheduledTime}に送信します`}
                </p>
                <Button className="mt-6" onClick={() => setShowWizard(false)}>
                  閉じる
                </Button>
              </div>
            )}
          </div>

          {step < 4 && (
            <DialogFooter className="flex justify-between">
              <div>
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> 戻る
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowWizard(false)}>
                  キャンセル
                </Button>
                {step < 3 ? (
                  <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
                    次へ <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSend} className="bg-green-600 hover:bg-green-700">
                    <Send className="h-4 w-4 mr-1" /> {scheduleType === "now" ? "送信する" : "予約する"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
