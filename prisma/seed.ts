import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ユーザーを作成
  const writerPassword = await bcrypt.hash('password', 10);
  const approverPassword = await bcrypt.hash('password', 10);
  const adminPassword = await bcrypt.hash('password', 10);

  const writer = await prisma.user.upsert({
    where: { email: 'writer@example.com' },
    update: {},
    create: {
      name: '作成者',
      email: 'writer@example.com',
      password: writerPassword,
      role: 'user',
    },
  });

  const approver = await prisma.user.upsert({
    where: { email: 'approver@example.com' },
    update: {},
    create: {
      name: '承認者',
      email: 'approver@example.com',
      password: approverPassword,
      role: 'approver',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  console.log('Users created:', { writer, approver, admin });

  // フォルダを作成
  const wiFolder = await prisma.folder.create({
    data: {
      name: '作業指示書',
      code: 'WI',
    },
  });

  const manualFolder = await prisma.folder.create({
    data: {
      name: 'マニュアル',
      code: 'MANUAL',
    },
  });

  const generalFolder = await prisma.folder.create({
    data: {
      name: '一般文書',
      code: 'GENERAL',
    },
  });

  console.log('Folders created:', { wiFolder, manualFolder, generalFolder });

  // --- ここから重複code検出ロジック ---
  const allFolders = await prisma.folder.findMany();
  const codeCount: Record<string, number> = {};
  for (const folder of allFolders) {
    codeCount[folder.code] = (codeCount[folder.code] || 0) + 1;
  }
  const duplicates = Object.entries(codeCount).filter(([code, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log('重複しているcode:', duplicates.map(([code, count]) => code));
    for (const [dupCode] of duplicates) {
      const dups = allFolders.filter(f => f.code === dupCode);
      console.log(`code=${dupCode} の重複レコード:`, dups);
    }
  } else {
    console.log('codeの重複はありません');
  }
  // --- ここまで重複code検出ロジック ---

  // サンプル文書を作成
  const draftDoc = await prisma.document.create({
    data: {
      title: '下書き文書のサンプル',
      status: 'draft',
      creator_id: writer.id,
      folder_id: wiFolder.id,
      sequence: 1,
      revision: 0,
      blocks: {
        create: [
          {
            type: 'title',
            content: JSON.stringify({
              type: 'title',
              text: '下書き文書のサンプル',
              x: 50,
              y: 50,
              width: 400,
              height: 60,
            }),
            position_x: 50,
            position_y: 50,
            width: 400,
            height: 60,
            sort_order: 0,
          },
          {
            type: 'text',
            content: JSON.stringify({
              type: 'text',
              text: 'これは下書き状態の文書です。',
              x: 50,
              y: 150,
              width: 500,
              height: 100,
            }),
            position_x: 50,
            position_y: 150,
            width: 500,
            height: 100,
            sort_order: 1,
          },
        ],
      },
    },
  });

  const pendingDoc = await prisma.document.create({
    data: {
      title: '確認中文書のサンプル',
      status: 'checking',
      creator_id: writer.id,
      folder_id: wiFolder.id,
      sequence: 2,
      revision: 0,
      blocks: {
        create: [
          {
            type: 'title',
            content: JSON.stringify({
              type: 'title',
              text: '確認中文書のサンプル',
              x: 50,
              y: 50,
              width: 400,
              height: 60,
            }),
            position_x: 50,
            position_y: 50,
            width: 400,
            height: 60,
            sort_order: 0,
          },
          {
            type: 'text',
            content: JSON.stringify({
              type: 'text',
              text: 'この文書は確認を待っています。',
              x: 50,
              y: 150,
              width: 500,
              height: 100,
            }),
            position_x: 50,
            position_y: 150,
            width: 500,
            height: 100,
            sort_order: 1,
          },
        ],
      },
      approvalRequest: {
        create: {
          requester_id: writer.id,
          checker_id: approver.id,
          approver_id: approver.id,
          comment: '確認をお願いします',
        },
      },
      approvalHistories: {
        create: {
          user_id: writer.id,
          action: 'submitted',
          comment: '確認をお願いします',
        },
      },
    },
  });

  const approvedDoc = await prisma.document.create({
    data: {
      title: '承認済み文書のサンプル',
      status: 'approved',
      creator_id: writer.id,
      folder_id: wiFolder.id,
      sequence: 3,
      revision: 0,
      blocks: {
        create: [
          {
            type: 'title',
            content: JSON.stringify({
              type: 'title',
              text: '承認済み文書のサンプル',
              x: 50,
              y: 50,
              width: 400,
              height: 60,
            }),
            position_x: 50,
            position_y: 50,
            width: 400,
            height: 60,
            sort_order: 0,
          },
          {
            type: 'text',
            content: JSON.stringify({
              type: 'text',
              text: 'この文書は承認済みです。',
              x: 50,
              y: 150,
              width: 500,
              height: 100,
            }),
            position_x: 50,
            position_y: 150,
            width: 500,
            height: 100,
            sort_order: 1,
          },
        ],
      },
      approvalHistories: {
        create: [
          {
            user_id: writer.id,
            action: 'submitted',
            comment: '確認をお願いします',
          },
          {
            user_id: approver.id,
            action: 'confirmed',
            comment: '確認しました',
          },
          {
            user_id: approver.id,
            action: 'approved',
            comment: '承認しました',
          },
        ],
      },
    },
  });

  // RevisionHistoryに承認済み文書の履歴を追加
  await prisma.revisionHistory.create({
    data: {
      document_id: approvedDoc.id,
      management_number: 'A-001',
      revision_symbol: 'R0',
      title: approvedDoc.title,
      approved_by_id: approver.id,
      checked_by_id: approver.id,
      created_by_id: writer.id,
      approved_at: new Date(),
    },
  });

  console.log('Documents created:', { draftDoc, pendingDoc, approvedDoc });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
