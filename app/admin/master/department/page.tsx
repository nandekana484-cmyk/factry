import DepartmentSectionTree from "@/components/DepartmentSectionTree";
import Link from "next/link";

export default function DepartmentMasterPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">部署・部門マスタ管理</h1>
      <DepartmentSectionTree />
      <div className="mt-8 flex justify-center">
        <Link href="/admin/users">
          <button className="bg-gray-300 text-gray-700 px-6 py-2 rounded shadow hover:bg-gray-400">
            ユーザー管理に戻る
          </button>
        </Link>
      </div>
    </div>
  );
}
