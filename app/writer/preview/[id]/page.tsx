"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PreviewCanvas from "../PreviewCanvas";

export default function PreviewPage() {
  const { id } = useParams();
  const [documentData, setDocumentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/documents/${id}`);
        const data = await res.json();

        console.log("FULL DOCUMENT:", data.document);

        setDocumentData(data.document);
      } catch (e) {
        console.error("Failed to load document", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div>読み込み中...</div>;
  if (!documentData) return <div>文書が見つかりません</div>;

  const { pages, paper, orientation } = documentData;

  return (
    <div className="preview-mode">
      {pages.map((page: any, idx: number) => (
        <div className="preview-page" key={page.id || idx}>
          <PreviewCanvas
            blocks={page.blocks}
            paper={paper}
            orientation={orientation}
            currentPage={page.number}
          />
        </div>
      ))}
    </div>
  );
}