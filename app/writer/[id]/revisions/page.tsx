"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Revision = {
  id: number;
  managementNumber: string;
  revisionSymbol: string;
  title: string;
  approvedBy: { id: number; name: string } | null;
  checkedBy: { id: number; name: string } | null;
  createdBy: { id: number; name: string };
  approvedAt: string | null;
  createdAt: string;
};

export default function WriterRevisionsPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}/revisions`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "改訂履歴の取得に失敗しました");
        }

        setRevisions(data.revisions || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchRevisions();
    }
  }, [documentId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "承認待ち";
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">改訂履歴</h1>
        <Button variant="outline" onClick={() => router.back()}>
          戻る
        </Button>
      </div>

      {revisions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-600">改訂履歴がありません</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">管理番号</TableHead>
                <TableHead className="font-bold">改定記号</TableHead>
                <TableHead className="font-bold">タイトル</TableHead>
                <TableHead className="font-bold">承認者</TableHead>
                <TableHead className="font-bold">確認者</TableHead>
                <TableHead className="font-bold">作成者</TableHead>
                <TableHead className="font-bold">承認日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revisions.map((revision) => (
                <TableRow key={revision.id}>
                  <TableCell className="font-medium">
                    {revision.managementNumber}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        revision.revisionSymbol === "R0"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }
                    >
                      {revision.revisionSymbol}
                    </Badge>
                  </TableCell>
                  <TableCell>{revision.title}</TableCell>
                  <TableCell>
                    {revision.approvedBy ? (
                      <span>{revision.approvedBy.name}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {revision.checkedBy ? (
                      <span>{revision.checkedBy.name}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{revision.createdBy.name}</TableCell>
                  <TableCell>
                    <span
                      className={
                        revision.approvedAt
                          ? "text-gray-900"
                          : "text-orange-600 font-medium"
                      }
                    >
                      {formatDate(revision.approvedAt)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
