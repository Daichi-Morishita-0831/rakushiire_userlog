"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingDown,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  MessageSquare,
} from "lucide-react";
import { mockChurnAnalysis } from "@/lib/mock-data";
import Link from "next/link";

// パートナーレベルの離反データ（モック）
const partnerChurnData = [
  { customerCode: "C-10003", customerName: "焼肉 炎", partnerName: "丸山精肉店", prevAmount: 180000, currAmount: 45000, changeRate: -75.0 },
  { customerCode: "C-10003", customerName: "焼肉 炎", partnerName: "鮮魚マルイチ", prevAmount: 65000, currAmount: 40000, changeRate: -38.5 },
  { customerCode: "C-10006", customerName: "居酒屋 まるよし", partnerName: "酒類ワタナベ", prevAmount: 85000, currAmount: 0, changeRate: -100 },
  { customerCode: "C-10006", customerName: "居酒屋 まるよし", partnerName: "鮮魚マルイチ", prevAmount: 55000, currAmount: 0, changeRate: -100 },
  { customerCode: "C-10016", customerName: "ダイニングバー MOON", partnerName: "冷凍食品サトウ", prevAmount: 65000, currAmount: 20000, changeRate: -69.2 },
  { customerCode: "C-10016", customerName: "ダイニングバー MOON", partnerName: "調味料ナカムラ", prevAmount: 45000, currAmount: 25000, changeRate: -44.4 },
];

// 商品レベルの離反データ（モック）
const productChurnData = [
  { customerCode: "C-10003", customerName: "焼肉 炎", partnerName: "丸山精肉店", productName: "黒毛和牛ロース 1kg", prevAmount: 96000, currAmount: 0, changeRate: -100 },
  { customerCode: "C-10003", customerName: "焼肉 炎", partnerName: "丸山精肉店", productName: "国産鶏もも肉 2kg", prevAmount: 48000, currAmount: 25600, changeRate: -46.7 },
  { customerCode: "C-10006", customerName: "居酒屋 まるよし", partnerName: "酒類ワタナベ", productName: "生ビール樽 20L", prevAmount: 45000, currAmount: 0, changeRate: -100 },
  { customerCode: "C-10006", customerName: "居酒屋 まるよし", partnerName: "鮮魚マルイチ", productName: "天然サーモン 1kg", prevAmount: 28800, currAmount: 0, changeRate: -100 },
  { customerCode: "C-10016", customerName: "ダイニングバー MOON", partnerName: "冷凍食品サトウ", productName: "冷凍枝豆 500g×10袋", prevAmount: 36000, currAmount: 9000, changeRate: -75.0 },
];

// 新規取引パートナーデータ（モック）
const newPartnerData = [
  { customerCode: "C-10001", customerName: "イタリアンバル ROSSO", partnerName: "製麺カトウ", startDate: "2026-02-15", currAmount: 32000 },
  { customerCode: "C-10005", customerName: "フレンチビストロ Le Ciel", partnerName: "酒類ワタナベ", startDate: "2026-02-20", currAmount: 85000 },
  { customerCode: "C-10011", customerName: "ラーメン 麺屋武蔵", partnerName: "冷凍食品サトウ", startDate: "2026-03-01", currAmount: 18000 },
];

export default function ChurnAnalysisPage() {
  const [period, setPeriod] = useState("month");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">離反/新規分析</h1>
          <p className="text-sm text-muted-foreground">
            3階層: 顧客 → パートナー → 商品
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">先週 vs 今週</SelectItem>
              <SelectItem value="month">先月 vs 今月</SelectItem>
              <SelectItem value="quarter">前四半期 vs 今四半期</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* サマリカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">離反顧客数</p>
            </div>
            <p className="text-2xl font-bold mt-1">5</p>
            <p className="text-xs text-muted-foreground">先月比 +2</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">離反による減収</p>
            </div>
            <p className="text-2xl font-bold mt-1">¥688,000</p>
            <p className="text-xs text-muted-foreground">5顧客の合計減少額</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">新規顧客数</p>
            </div>
            <p className="text-2xl font-bold mt-1">2</p>
            <p className="text-xs text-muted-foreground">先月比 +1</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">新規パートナー利用</p>
            </div>
            <p className="text-2xl font-bold mt-1">3</p>
            <p className="text-xs text-muted-foreground">既存顧客の新規取引パートナー</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="churn">
        <TabsList>
          <TabsTrigger value="churn">離反分析</TabsTrigger>
          <TabsTrigger value="new">新規分析</TabsTrigger>
        </TabsList>

        {/* 離反分析 */}
        <TabsContent value="churn" className="space-y-4">
          {/* 顧客レベル */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">Lv.1</Badge>
                  顧客別 離反ランキング
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" /> まとめて配信
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>コード</TableHead>
                    <TableHead>店舗名</TableHead>
                    <TableHead className="text-right">先月注文額</TableHead>
                    <TableHead className="text-right">今月注文額</TableHead>
                    <TableHead className="text-right">変化率</TableHead>
                    <TableHead>最終注文</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockChurnAnalysis.customers.map((c) => (
                    <TableRow key={c.customerCode}>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/users/${c.customerCode}`} className="text-primary hover:underline">
                          {c.customerCode}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right">¥{c.prevAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">¥{c.currAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-red-500 font-medium">{c.changeRate.toFixed(1)}%</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.lastOrderDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* パートナーレベル */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">Lv.2</Badge>
                パートナー別 離反詳細
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>コード</TableHead>
                    <TableHead>店舗名</TableHead>
                    <TableHead>パートナー</TableHead>
                    <TableHead className="text-right">先月</TableHead>
                    <TableHead className="text-right">今月</TableHead>
                    <TableHead className="text-right">変化率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnerChurnData.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/users/${d.customerCode}`} className="text-primary hover:underline">
                          {d.customerCode}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{d.customerName}</TableCell>
                      <TableCell className="text-sm">{d.partnerName}</TableCell>
                      <TableCell className="text-right">¥{d.prevAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">¥{d.currAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-red-500 font-medium">{d.changeRate.toFixed(1)}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 商品レベル */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">Lv.3</Badge>
                商品別 離反詳細
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>店舗名</TableHead>
                    <TableHead>パートナー</TableHead>
                    <TableHead>商品名</TableHead>
                    <TableHead className="text-right">先月</TableHead>
                    <TableHead className="text-right">今月</TableHead>
                    <TableHead className="text-right">変化率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productChurnData.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{d.customerName}</TableCell>
                      <TableCell className="text-sm">{d.partnerName}</TableCell>
                      <TableCell className="text-sm">{d.productName}</TableCell>
                      <TableCell className="text-right">¥{d.prevAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">¥{d.currAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-red-500 font-medium">{d.changeRate.toFixed(1)}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 新規分析 */}
        <TabsContent value="new" className="space-y-4">
          {/* 新規顧客 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">Lv.1</Badge>
                新規顧客
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>コード</TableHead>
                    <TableHead>店舗名</TableHead>
                    <TableHead>取引開始日</TableHead>
                    <TableHead className="text-right">今月注文額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockChurnAnalysis.newCustomers.map((c) => (
                    <TableRow key={c.customerCode}>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/users/${c.customerCode}`} className="text-primary hover:underline">
                          {c.customerCode}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm">{c.startDate}</TableCell>
                      <TableCell className="text-right">¥{c.currAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 新規パートナー利用 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">Lv.2</Badge>
                既存顧客の新規パートナー利用
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>コード</TableHead>
                    <TableHead>店舗名</TableHead>
                    <TableHead>新規パートナー</TableHead>
                    <TableHead>利用開始日</TableHead>
                    <TableHead className="text-right">今月注文額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newPartnerData.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/users/${d.customerCode}`} className="text-primary hover:underline">
                          {d.customerCode}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{d.customerName}</TableCell>
                      <TableCell className="text-sm font-medium">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px]">NEW</Badge>
                        {" "}{d.partnerName}
                      </TableCell>
                      <TableCell className="text-sm">{d.startDate}</TableCell>
                      <TableCell className="text-right font-medium">¥{d.currAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
