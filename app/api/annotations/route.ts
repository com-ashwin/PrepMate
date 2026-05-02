import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, sessionId, sectionId, sectionTitle, content, text, color, startOffset, endOffset, userId } = body;

    // Use a default user if none provided
    const activeUserId = userId || 'anonymous-user';

    let result;
    if (type === 'bookmark') {
      result = await db.bookmark.create({
        data: { userId: activeUserId, sessionId, sectionId, sectionTitle },
      });
    } else if (type === 'note') {
      result = await db.note.create({
        data: { userId: activeUserId, sessionId, sectionId, content },
      });
    } else if (type === 'highlight') {
      result = await db.highlight.create({
        data: { userId: activeUserId, sessionId, sectionId, text, color, startOffset, endOffset },
      });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid annotation type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ success: false, error: 'ID and type required' }, { status: 400 });
    }

    if (type === 'bookmark') {
      await db.bookmark.delete({ where: { id } });
    } else if (type === 'note') {
      await db.note.delete({ where: { id } });
    } else if (type === 'highlight') {
      await db.highlight.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
