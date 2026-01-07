"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ▼ 数値で自由に調整できる設定
  const cardWidth = 400;        // カード横幅
  const cardHeight = 350;       // カード縦幅

  const titleFontSize = 24;     // タイトルのフォントサイズ
  const titleMarginTop = 20;    // タイトルを下げる（上に余白）
  const titleMarginBottom = 30; // タイトルと入力欄の間隔

  const inputWidth = 250;       // 入力欄横幅
  const inputHeight = 40;       // 入力欄縦幅
  const inputFontSize = 16;     // 入力欄フォントサイズ

  const spaceY = 30;            // 入力欄同士の間隔

  const buttonWidth = 250;      // ボタン横幅
  const buttonHeight = 45;      // ボタン縦幅
  const buttonFontSize = 18;    // ボタンフォントサイズ

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card
        className="shadow-lg"
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
        }}
      >
        <CardHeader>
          <CardTitle
            className="text-center font-bold"
            style={{
              fontSize: `${titleFontSize}px`,
              marginTop: `${titleMarginTop}px`,
              marginBottom: `${titleMarginBottom}px`,
            }}
          >
            ログイン
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center", // 入力欄を中央に配置
              gap: `${spaceY}px`,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Label htmlFor="email" style={{ fontSize: `${inputFontSize}px` }}>
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                style={{
                  width: `${inputWidth}px`,
                  height: `${inputHeight}px`,
                  fontSize: `${inputFontSize}px`,
                }}
              />
            </div>

            <div style={{ textAlign: "center" }}>
              <Label htmlFor="password" style={{ fontSize: `${inputFontSize}px` }}>
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                style={{
                  width: `${inputWidth}px`,
                  height: `${inputHeight}px`,
                  fontSize: `${inputFontSize}px`,
                }}
              />
            </div>

            <Button
              type="submit"
              style={{
                width: `${buttonWidth}px`,
                height: `${buttonHeight}px`,
                fontSize: `${buttonFontSize}px`,
              }}
            >
              ログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}