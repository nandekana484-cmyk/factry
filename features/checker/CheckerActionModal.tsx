"use client";

import type { FC } from "react";

interface Props {
  open: boolean;
  mode: "confirm" | "approve" | "reject";
  documentId: number | null;
  comment: string;
  onChangeComment: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  error?: string;
}

const modeConfig = {
  confirm: {
    title: "確認処理",
    desc: "この文書を確認します。コメントは任意です。",
    button: { color: "bg-green-600 hover:bg-green-700", label: "確認する" },
  },
  approve: {
    title: "承認処理",
    desc: "この文書を承認します。コメントは任意です。",
    button: { color: "bg-blue-600 hover:bg-blue-700", label: "承認する" },
  },
  reject: {
    title: "差し戻し処理",
    desc: "この文書を差し戻します。理由を必ず入力してください。",
    button: { color: "bg-red-600 hover:bg-red-700", label: "差し戻す" },
  },
};

export const CheckerActionModal: FC<Props> = ({
  open,
  mode,
  documentId,
  comment,
  onChangeComment,
  onSubmit,
  onCancel,
  error,
}) => {
  if (!open) return null;

  const { title, desc, button } = modeConfig[mode];
  const isReject = mode === "reject";
  const disabled = isReject && !comment.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">{desc}</p>
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            コメント{isReject && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            value={comment}
            onChange={e => onChangeComment(e.target.value)}
            required={isReject}
            placeholder={isReject ? "差し戻し理由を入力してください" : "コメント（任意）"}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium text-white rounded ${button.color}`}
            onClick={disabled ? undefined : onSubmit}
            disabled={disabled}
          >
            {button.label}
          </button>
        </div>
      </div>
    </div>
  );
};
