import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, depth, source, fileName, userId } = body;

    if (!topic || !depth) {
      return NextResponse.json(
        { success: false, error: 'Topic and depth are required' },
        { status: 400 }
      );
    }

    // Default to an anonymous user if none provided (for initial setup simplicity, though in prod we'd create one or require login)
    let activeUserId = userId;
    if (!activeUserId) {
      // Find or create anonymous user
      const anonUser = await db.user.upsert({
        where: { id: 'anonymous-user' },
        update: {},
        create: {
          id: 'anonymous-user',
          name: 'Anonymous Learner',
          avatar: 'AN',
        },
      });
      activeUserId = anonUser.id;
    }

    const session = await db.session.create({
      data: {
        userId: activeUserId,
        topic,
        depth,
        source: source || 'topic',
        fileName,
        status: 'researching',
      },
    });

    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
    }

    const session = await db.session.findUnique({
      where: { id },
      include: {
        bookmarks: true,
        notes: true,
        highlights: true,
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, report, sections } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
    }

    const session = await db.session.update({
      where: { id },
      data: {
        status,
        ...(report && { report }),
        ...(sections && { sections: JSON.stringify(sections) }),
      },
    });

    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
