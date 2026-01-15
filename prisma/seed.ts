import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ユーザーを作成
  const writerPassword = await bcrypt.hash('password', 10);
  const approverPassword = await bcrypt.hash('password', 10);

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

  console.log('Users created:', { writer, approver });

  // フォルダを作成
  const wiFolder = await (prisma as any).folder.create({
    data: {
      name: '作業指示書',
      code: 'WI',
    },
  });

  const manualFolder = await (prisma as any).folder.create({
    data: {
      name: 'マニュアル',
      code: 'MANUAL',
    },
  });

  const generalFolder = await (prisma as any).folder.create({
    data: {
      name: '一般文書',
      code: 'GENERAL',
    },
  });

  console.log('Folders created:', { wiFolder, manualFolder, generalFolder });

  // サンプル文書を作成
  const draftDoc = await prisma.document.create({
    data: {
      title: '下書き文書のサンプル',
      status: 'draft',
      creator_id: writer.id,
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
      title: '承認待ち文書のサンプル',
      status: 'pending',
      creator_id: writer.id,
      blocks: {
        create: [
          {
            type: 'title',
            content: JSON.stringify({
              type: 'title',
              text: '承認待ち文書のサンプル',
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
              text: 'この文書は承認を待っています。',
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
          comment: '承認をお願いします',
        },
      },
      approvalHistories: {
        create: {
          user_id: writer.id,
          action: 'submitted',
          comment: '承認をお願いします',
        },
      },
    },
  });

  const approvedDoc = await prisma.document.create({
    data: {
      title: '承認済み文書のサンプル',
      status: 'approved',
      creator_id: writer.id,
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
            comment: '承認をお願いします',
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
