"use client";
import { useEffect, useState } from "react";

interface Department {
  id: number;
  name: string;
}

export default function DepartmentMaster() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await fetch("/api/admin/departments");
    if (res.ok) {
      const data = await res.json();
      setDepartments(data.departments);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      setNewName("");
      fetchDepartments();
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleUpdate = async () => {
    if (!editingName.trim() || editingId === null) return;
    const res = await fetch("/api/admin/departments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, name: editingName }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditingName("");
      fetchDepartments();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    const res = await fetch("/api/admin/departments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchDepartments();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-bold mb-4">部署マスタ管理</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
          placeholder="新規部署名"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >追加</button>
      </div>
      <ul>
        {departments.map(dep => (
          <li key={dep.id} className="flex items-center gap-2 mb-2">
            {editingId === dep.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className="border rounded px-2 py-1 flex-1"
                />
                <button onClick={handleUpdate} className="bg-green-600 text-white px-2 py-1 rounded">保存</button>
                <button onClick={() => setEditingId(null)} className="bg-gray-300 px-2 py-1 rounded">キャンセル</button>
              </>
            ) : (
              <>
                <span className="flex-1">{dep.name}</span>
                <button onClick={() => handleEdit(dep.id, dep.name)} className="bg-yellow-500 text-white px-2 py-1 rounded">編集</button>
                <button onClick={() => handleDelete(dep.id)} className="bg-red-600 text-white px-2 py-1 rounded">削除</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
