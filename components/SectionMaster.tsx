"use client";
import { useEffect, useState } from "react";

interface Section {
  id: number;
  name: string;
}

export default function SectionMaster() {
  const [sections, setSections] = useState<Section[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    const res = await fetch("/api/admin/sections");
    if (res.ok) {
      const data = await res.json();
      setSections(data.sections);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      setNewName("");
      fetchSections();
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleUpdate = async () => {
    if (!editingName.trim() || editingId === null) return;
    const res = await fetch("/api/admin/sections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, name: editingName }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditingName("");
      fetchSections();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    const res = await fetch("/api/admin/sections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchSections();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-bold mb-4">部門マスタ管理</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
          placeholder="新規部門名"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >追加</button>
      </div>
      <ul>
        {sections.map(sec => (
          <li key={sec.id} className="flex items-center gap-2 mb-2">
            {editingId === sec.id ? (
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
                <span className="flex-1">{sec.name}</span>
                <button onClick={() => handleEdit(sec.id, sec.name)} className="bg-yellow-500 text-white px-2 py-1 rounded">編集</button>
                <button onClick={() => handleDelete(sec.id)} className="bg-red-600 text-white px-2 py-1 rounded">削除</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
