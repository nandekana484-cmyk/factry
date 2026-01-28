import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDocumentTypes() {
  console.log("Seeding document types...");

  const documentTypes = [
    {
      code: "RP",
      name: "報告書",
      description: "業務報告、プロジェクト報告など",
      order: 1,
    },
    {
      code: "WI",
      name: "作業指示書",
      description: "製造手順、作業手順など",
      order: 2,
    },
    {
      code: "MN",
      name: "マニュアル",
      description: "操作マニュアル、運用マニュアルなど",
      order: 3,
    },
    {
      code: "SP",
      name: "仕様書",
      description: "製品仕様、システム仕様など",
      order: 4,
    },
    {
      code: "QA",
      name: "品質文書",
      description: "検査記録、品質記録など",
      order: 5,
    },
  ];

  for (const dt of documentTypes) {
    const existing = await prisma.documentType.findUnique({
      where: { code: dt.code },
    });

    if (!existing) {
      await prisma.documentType.create({ data: dt });
      console.log(`Created document type: ${dt.code} (${dt.name})`);
    } else {
      console.log(`Document type already exists: ${dt.code}`);
    }
  }

  console.log("Document types seeding completed!");
}

seedDocumentTypes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
