/**
 * HTMLテーブルをパースして2次元配列とメタデータに変換
 */
export interface ParsedTableData {
  rows: number;
  cols: number;
  cells: Array<
    Array<{
      text: string;
      fontSize: number;
      fontWeight: string;
      color: string;
      width: number;
      height: number;
    }>
  >;
}

export const parseTableFromHTML = (html: string): ParsedTableData | null => {
  try {
    // HTMLをパース
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const table = doc.querySelector("table");

    if (!table) {
      return null;
    }

    const rows = table.querySelectorAll("tr");
    if (rows.length === 0) {
      return null;
    }

    const rowCount = rows.length;
    let colCount = 0;

    // 列数を計算
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td, th");
      colCount = Math.max(colCount, cells.length);
    });

    if (colCount === 0) {
      return null;
    }

    // セルデータを抽出
    const cellsData: ParsedTableData["cells"] = [];
    rows.forEach((row) => {
      const rowCells = row.querySelectorAll("td, th");
      const rowData: ParsedTableData["cells"][0] = [];

      for (let i = 0; i < colCount; i++) {
        const cell = rowCells[i];
        const text = cell ? cell.textContent?.trim() || "" : "";

        rowData.push({
          text,
          fontSize: 12,
          fontWeight: "normal",
          color: "#000000",
          width: 80,
          height: 30,
        });
      }

      cellsData.push(rowData);
    });

    return {
      rows: rowCount,
      cols: colCount,
      cells: cellsData,
    };
  } catch (error) {
    console.error("テーブルパースエラー:", error);
    return null;
  }
};

/**
 * テーブルから全テキストを抽出
 */
export const extractTextFromTable = (cells: ParsedTableData["cells"]): string => {
  return cells
    .map((row) => row.map((cell) => cell.text || "").join("\t"))
    .join("\n");
};
