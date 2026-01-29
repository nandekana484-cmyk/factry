// 管理番号生成関数
export function generateManagementNumber(
  folder: { code: string; parent?: { code: string } | null },
  sequence: number,
  revision: number
): string {
  let base = folder.code;
  if (folder.parent && folder.parent.code) {
    base = `${folder.parent.code}-${base}`;
  }
  let number = `${base}-${String(sequence).padStart(3, "0")}`;
  if (revision > 0) {
    number += `-${String(revision).padStart(2, "0")}`;
  }
  return number;
}
