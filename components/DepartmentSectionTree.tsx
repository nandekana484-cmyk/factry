"use client";
import { useEffect, useState } from "react";

interface Department {
  id: number;
  name: string;
  order: number;
  enabled: boolean;
}
interface Section {
  id: number;
  department_id: number;
  name: string;
  order: number;
  enabled: boolean;
}

export default function DepartmentSectionTree() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  const [editingDeptName, setEditingDeptName] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const deptRes = await fetch("/api/admin/departments");
    const secRes = await fetch("/api/admin/sections");
    if (deptRes.ok && secRes.ok) {
      const deptData = await deptRes.json();
      const secData = await secRes.json();
      setDepartments(deptData.departments);
      setSections(secData.sections);
    }
  };

  // 部署追加
  const handleAddDept = async () => {
    if (!newDeptName.trim()) return;
    await fetch("/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDeptName }),
    });
    setNewDeptName("");
    fetchData();
  };
  // 部署編集
  const handleUpdateDept = async () => {
    if (!editingDeptName.trim() || editingDeptId === null) return;
    await fetch("/api/admin/departments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingDeptId, name: editingDeptName }),
    });
    setEditingDeptId(null);
    setEditingDeptName("");
    fetchData();
  };
  // 部署削除
  const handleDeleteDept = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    await fetch("/api/admin/departments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };
  // 部門追加
  const handleAddSection = async () => {
    if (!newSectionName.trim() || !selectedDeptId) return;
    await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSectionName, department_id: selectedDeptId }),
    });
    setNewSectionName("");
    fetchData();
  };
  // 部門編集
  const handleUpdateSection = async () => {
    if (!editingSectionName.trim() || editingSectionId === null) return;
    await fetch("/api/admin/sections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingSectionId, name: editingSectionName }),
    });
    setEditingSectionId(null);
    setEditingSectionName("");
    fetchData();
  };
  // 部門削除
  const handleDeleteSection = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    await fetch("/api/admin/sections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold mb-4">部署・部門管理</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newDeptName}
          onChange={e => setNewDeptName(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
          placeholder="新規部署名"
        />
        <button onClick={handleAddDept} className="bg-blue-600 text-white px-4 py-1 rounded">追加</button>
      </div>
      <ul>
        {departments.map(dept => (
          <li key={dept.id} className="mb-2">
            <div className="flex items-center gap-2">
              {editingDeptId === dept.id ? (
                <>
                  <input
                    type="text"
                    value={editingDeptName}
                    onChange={e => setEditingDeptName(e.target.value)}
                    className="border rounded px-2 py-1 flex-1"
                  />
                  <button onClick={handleUpdateDept} className="bg-green-600 text-white px-2 py-1 rounded">保存</button>
                  <button onClick={() => setEditingDeptId(null)} className="bg-gray-300 px-2 py-1 rounded">キャンセル</button>
                </>
              ) : (
                <>
                  <span className="font-bold cursor-pointer" onClick={() => setSelectedDeptId(dept.id)}>{dept.name}</span>
                  <button onClick={() => {setEditingDeptId(dept.id);setEditingDeptName(dept.name);}} className="bg-yellow-500 text-white px-2 py-1 rounded">編集</button>
                  <button onClick={() => handleDeleteDept(dept.id)} className="bg-red-600 text-white px-2 py-1 rounded">削除</button>
                </>
              )}
            </div>
            {/* 部門リスト */}
            {selectedDeptId === dept.id && (
              <div className="ml-6 mt-2">
                <div className="mb-2 flex gap-2">
                  <input
                    type="text"
                    value={newSectionName}
                    onChange={e => setNewSectionName(e.target.value)}
                    className="border rounded px-2 py-1 flex-1"
                    placeholder="新規部門名"
                  />
                  <button onClick={handleAddSection} className="bg-blue-500 text-white px-3 py-1 rounded">追加</button>
                </div>
                <ul>
                  {sections.filter(sec => sec.department_id === dept.id).map(sec => (
                    <li key={sec.id} className="flex items-center gap-2 mb-1">
                      {editingSectionId === sec.id ? (
                        <>
                          <input
                            type="text"
                            value={editingSectionName}
                            onChange={e => setEditingSectionName(e.target.value)}
                            className="border rounded px-2 py-1 flex-1"
                          />
                          <button onClick={handleUpdateSection} className="bg-green-600 text-white px-2 py-1 rounded">保存</button>
                          <button onClick={() => setEditingSectionId(null)} className="bg-gray-300 px-2 py-1 rounded">キャンセル</button>
                        </>
                      ) : (
                        <>
                          <span>{sec.name}</span>
                          <button onClick={() => {setEditingSectionId(sec.id);setEditingSectionName(sec.name);}} className="bg-yellow-500 text-white px-2 py-1 rounded">編集</button>
                          <button onClick={() => handleDeleteSection(sec.id)} className="bg-red-600 text-white px-2 py-1 rounded">削除</button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
