"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: number;
  name: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates((data.templates || []).map((t: any) => ({ ...t, id: Number(t.id) })));
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(templateId: number | string) {
    if (!window.confirm("本当にこのテンプレートを削除しますか？")) return;
    try {
      const id = Number(templateId);
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        loadTemplates();
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      alert("削除時にエラーが発生しました");
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>テンプレート管理</CardTitle>
          <CardDescription>
            文書テンプレートの一覧を管理します
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-muted-foreground">テンプレートがありません</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>テンプレート名</TableHead>
                  <TableHead>作成者</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>更新日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.id}</TableCell>
                    <TableCell className="font-medium cursor-pointer hover:text-blue-700" onClick={() => router.push(`/admin/templates/new?templateId=${template.id}`)}>{template.name}</TableCell>
                    <TableCell>{template.createdBy}</TableCell>
                    <TableCell>{new Date(template.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell>{new Date(template.updatedAt).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >削除</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
