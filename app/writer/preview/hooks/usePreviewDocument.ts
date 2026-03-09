import { useState, useEffect } from "react";

export function usePreviewDocument(id: string) {
  const [documentData, setDocumentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/documents/${id}`);
        if (!res.ok) {
          setDocumentData(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setDocumentData(data.document);
      } catch (e) {
        setDocumentData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return { documentData, loading };
}
