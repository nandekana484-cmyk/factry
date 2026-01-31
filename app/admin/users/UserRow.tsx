import { useState } from "react";

const ROLE_OPTIONS = [
  { value: "user", label: "未分類(user)" },
  { value: "creator", label: "作成者(creator)" },
  { value: "checker", label: "確認者(checker)" },
  { value: "approver", label: "承認者(approver)" },
  { value: "admin", label: "管理者(admin)" },
];

export function UserRow({ user }: {
  user: { id: number, name: string, email: string, role: string }
}) {
  return (
    <div className="flex items-center gap-4 py-2 border-b">
      <div className="flex-1">{user.name} <span className="text-gray-400 text-xs">{user.email}</span></div>
      <span className="px-2 py-1 rounded bg-gray-100 border text-xs">{user.role}</span>
    </div>
  );
}
