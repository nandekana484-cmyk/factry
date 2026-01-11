"use client";

import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  documentReferences?: Array<{ managementNumber: string; title: string }>;
  generatedContent?: {
    type: "text" | "table";
    data: any;
  };
}

interface AIChatProps {
  onInsertText: (text: string) => void;
  onInsertTable: (cells: any[][]) => void;
  blocks: any[];
  onSubmit: () => void;
  isSaving: boolean;
}

export default function AIChat({
  onInsertText,
  onInsertTable,
  blocks,
  onSubmit,
  isSaving,
}: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージが追加されたらスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // AI応答を取得（後で実装）
      const response = await fetchAIResponse(input, blocks);
      
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error("AI応答エラー:", error);
      const errorMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: "申し訳ありません。AI応答の取得に失敗しました。",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInsertText = (message: ChatMessage) => {
    if (message.generatedContent?.type === "text") {
      onInsertText(message.generatedContent.data);
    }
  };

  const handleInsertTable = (message: ChatMessage) => {
    if (message.generatedContent?.type === "table") {
      onInsertTable(message.generatedContent.data);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l">
      {/* ヘッダー */}
      <div className="p-4 border-b bg-blue-50">
        <h3 className="font-bold text-sm">AI 補助</h3>
        <p className="text-xs text-gray-600 mt-1">
          AIと対話しながら文書を作成できます
        </p>
      </div>

      {/* メッセージ領域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <p>質問を入力して、AIの支援を受けましょう</p>
            <p className="text-xs mt-2">
              過去文書の参照や文章生成を依頼できます
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {/* 参照ドキュメント */}
                {message.documentReferences && (
                  <div className="mt-2 space-y-1 border-t border-opacity-20 border-gray-400 pt-2">
                    <p className="text-xs font-semibold">参照文書：</p>
                    {message.documentReferences.map((ref, idx) => (
                      <a
                        key={idx}
                        href={`/dashboard/documents/${ref.managementNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline hover:opacity-80 block text-left"
                      >
                        {ref.managementNumber} - {ref.title}
                      </a>
                    ))}
                  </div>
                )}

                {/* コンテンツ挿入ボタン */}
                {message.generatedContent && message.role === "assistant" && (
                  <div className="mt-2 space-y-1 border-t border-opacity-20 border-gray-400 pt-2">
                    {message.generatedContent.type === "text" && (
                      <button
                        onClick={() => handleInsertText(message)}
                        className="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-gray-100 block w-full text-left"
                      >
                        💬 テキストを挿入
                      </button>
                    )}
                    {message.generatedContent.type === "table" && (
                      <button
                        onClick={() => handleInsertTable(message)}
                        className="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-gray-100 block w-full text-left"
                      >
                        📊 表を追加
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力欄 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="質問を入力..."
            disabled={isLoading}
            className="flex-1 border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
            rows={3}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium h-fit"
          >
            送信
          </button>
        </div>

        {/* 提出ボタン */}
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onSubmit}
            disabled={isSaving}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "提出中..." : "ドキュメントを提出"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ダミーAI応答関数（後で実装）
async function fetchAIResponse(
  input: string,
  blocks: any[]
): Promise<ChatMessage> {
  // 実装予定：OpenAI API呼び出し
  // 現在はダミー応答
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: nanoid(),
    role: "assistant",
    content: `「${input}」についてですね。\n\n現在はダミー応答です。実装予定の機能：\n- 過去文書の検索と参照\n- テキスト生成\n- 表の生成\n- 文脈に応じた提案`,
    documentReferences: [
      {
        managementNumber: "2025-001-001",
        title: "サンプル文書",
      },
    ],
    generatedContent: {
      type: "text",
      data: "これはAIが生成したテキストの例です。",
    },
  };
}
