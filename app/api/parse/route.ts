import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rawContent = '';

    // Determine type and parse
    if (file.type === 'application/pdf') {
      const data = await pdfParse(buffer);
      rawContent = data.text;
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      rawContent = result.value;
    } else if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
      rawContent = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file format' },
        { status: 400 }
      );
    }

    if (!rawContent.trim()) {
      return NextResponse.json(
        { success: false, error: 'File is empty or could not be parsed' },
        { status: 400 }
      );
    }

    // Extract topics (simple heuristic: split by newlines, grab non-empty short lines)
    const lines = rawContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 3 && l.length < 100);
      
    // Deduplicate and get top 20
    const topics = Array.from(new Set(lines)).slice(0, 20);

    return NextResponse.json({
      success: true,
      data: {
        name: file.name,
        type: file.type,
        rawContent,
        topics,
        topicCount: topics.length,
      },
    });
  } catch (error: any) {
    console.error('File parsing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during parsing' },
      { status: 500 }
    );
  }
}
