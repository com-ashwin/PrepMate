import { NextRequest, NextResponse } from 'next/server';

// Proxy the SSE connection to the Python backend
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Default to port 8001 if env is missing
    const researcherUrl = process.env.RESEARCHER_URL || 'http://localhost:8001';
    
    const backendRes = await fetch(`${researcherUrl}/research/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: 'Backend research engine returned an error' },
        { status: backendRes.status }
      );
    }

    // Proxy the stream
    return new NextResponse(backendRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Research Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to research engine' },
      { status: 500 }
    );
  }
}
