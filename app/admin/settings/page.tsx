"use client";

import { useState, useEffect } from "react";

interface NumberingRule {
  id: string;
  numberingFormat: string;
  hierarchyLevels: number;
  seqDigits: number;
  separator: string;
  description: string;
}

const DEFAULT_RULES: NumberingRule[] = [
  {
    id: "default",
    numberingFormat: "{HIERARCHY}{SEQ}",
    hierarchyLevels: 3,
    seqDigits: 3,
    separator: "/",
    description: "デフォルト: A/B/001-001",
  },
];

export default function SettingsPage() {
  const [rules, setRules] = useState<NumberingRule[]>(DEFAULT_RULES);
  const [editingRule, setEditingRule] = useState<NumberingRule | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // localStorage から採番ルールを読み込む
    const stored = localStorage.getItem("numberingRules");
    if (stored) {
      setRules(JSON.parse(stored));
    }
  }, []);

  const handleSave = (rule: NumberingRule) => {
    const updated = rules.map((r) => (r.id === rule.id ? rule : r));
    setRules(updated);
    localStorage.setItem("numberingRules", JSON.stringify(updated));
    setEditingRule(null);
    setShowDialog(false);
  };

  const handleNew = () => {
    const newRule: NumberingRule = {
      id: Date.now().toString(),
      numberingFormat: "{HIERARCHY}{SEQ}",
      hierarchyLevels: 3,
      seqDigits: 3,
      separator: "/",
      description: "新規ルール",
    };
    setEditingRule(newRule);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    localStorage.setItem(
      "numberingRules",
      JSON.stringify(rules.filter((r) => r.id !== id))
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">採番ルール管理</h1>

      <div className="mb-4">
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          新規ルールを作成
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">説明</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                フォーマット
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                階層数
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                連番桁数
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{rule.description}</td>
                <td className="px-4 py-2 text-sm font-mono text-gray-600">
                  {rule.numberingFormat}
                </td>
                <td className="px-4 py-2 text-sm text-center">{rule.hierarchyLevels}</td>
                <td className="px-4 py-2 text-sm text-center">{rule.seqDigits}</td>
                <td className="px-4 py-2 text-sm">
                  <button
                    onClick={() => {
                      setEditingRule(rule);
                      setShowDialog(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 mr-3"
                  >
                    編集
                  </button>
                  {rule.id !== "default" && (
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      削除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 編集ダイアログ */}
      {showDialog && editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">採番ルール編集</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">説明</label>
                <input
                  type="text"
                  value={editingRule.description}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  フォーマット（例：{"{HIERARCHY}{SEQ}"}）
                </label>
                <input
                  type="text"
                  value={editingRule.numberingFormat}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      numberingFormat: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {"{HIERARCHY}"} = 階層値, {"{SEQ}"} = 連番
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    階層数
                  </label>
                  <input
                    type="number"
                    value={editingRule.hierarchyLevels}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        hierarchyLevels: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    連番桁数
                  </label>
                  <input
                    type="number"
                    value={editingRule.seqDigits}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        seqDigits: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  階層区切り文字
                </label>
                <input
                  type="text"
                  value={editingRule.separator}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      separator: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                  maxLength="1"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <p className="font-medium mb-1">プレビュー：</p>
                <p className="font-mono">
                  {editingRule.numberingFormat
                    .replace(
                      "{HIERARCHY}",
                      Array(editingRule.hierarchyLevels)
                        .fill("X")
                        .join(editingRule.separator)
                    )
                    .replace("{SEQ}", "0".repeat(editingRule.seqDigits))}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDialog(false);
                  setEditingRule(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleSave(editingRule)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
