import { prisma } from "../lib/prisma";

async function migrate() {
  const docs = await prisma.document.findMany({ include: { folder: true } });
  for (const doc of docs) {
    // 例: "A-B-001-01" → ["A", "B", "001", "01"]
    const managementNumber = (doc as any).management_number;
    if (!managementNumber) continue;
    const match = managementNumber.match(/^([A-Z]+)(?:-([A-Z]+))?-(\d{3})(?:-(\d{2}))?$/);
    if (!match) continue;
    const [, code1, code2, seq, rev] = match;
    let folder = null;
    if (code2) {
      // サブフォルダ
      folder = await prisma.folder.findFirst({ where: { code: code2 } });
    } else {
      folder = await prisma.folder.findFirst({ where: { code: code1 } });
    }
    if (!folder) continue;
    await prisma.document.update({
      where: { id: doc.id },
      data: {
        folder_id: folder.id,
        sequence: Number(seq),
        revision: rev ? Number(rev) : 0
      }
    });
  }
  console.log("migrate done");
}

migrate().then(() => process.exit(0));
