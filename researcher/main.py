"""
PrepMate Research Backend — FastAPI + GPT Researcher
Streams structured mentor output via Server-Sent Events (SSE)
"""

import asyncio
import json
import os
import sys
import traceback
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

# ============================================
# APP LIFESPAN
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 PrepMate Research Backend starting...")
    print(f"   OpenAI API Key: {'✅ Set' if os.getenv('OPENAI_API_KEY') else '❌ Missing'}")
    print(f"   Tavily API Key: {'✅ Set' if os.getenv('TAVILY_API_KEY') else '⚠️  Missing (fallback disabled)'}")
    yield
    print("👋 PrepMate Research Backend shutting down...")


app = FastAPI(
    title="PrepMate Research API",
    description="AI-powered deep research for study and interview preparation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# MODELS
# ============================================
class ResearchRequest(BaseModel):
    topic: str
    depth: str = "Advanced"  # Beginner | Advanced | Interview-Ready
    session_id: str
    additional_context: Optional[str] = None


# ============================================
# MENTOR PROMPT BUILDER
# ============================================
DEPTH_INSTRUCTIONS = {
    "Beginner": "Explain as if to a complete beginner. Use analogies. Avoid jargon.",
    "Advanced": "Assume solid foundational knowledge. Go deep technically. Use precise terminology.",
    "Interview-Ready": "Focus specifically on interview performance. Include real interview questions from top companies like Google, Meta, Amazon. Be brutally honest about what candidates get wrong.",
}

MENTOR_SYSTEM_PROMPT = """You are PrepMate — an elite, super-strict AI mentor and interview coach with the rigor of a top FAANG interviewer and the depth of a world-class professor.

Your ONLY goal is to produce highly structured, advanced, in-depth learning content. You do NOT chat. You teach.

STRICT OUTPUT FORMAT — Follow this EXACTLY:
---

## BRIEF
[3 precise sentences: what this topic is, why it matters, and what mastery looks like]

## CORE CONCEPTS
[Numbered list of the 5-8 fundamental building blocks. Each has: concept name + 2-3 sentence explanation + concrete example]

## DEEP DIVE
[Technical deep dive with examples, edge cases, trade-offs, and real-world applications. Minimum 400 words. Use code examples where relevant.]

## COMMON MISTAKES
[5-7 specific mistakes candidates/learners make. For each: mistake + why it happens + how to fix it]

## INTERVIEW Q&A
[10 interview questions spanning Easy/Medium/Hard. Format:
**Q1 [Easy/Medium/Hard]:** Question text
**Answer:** Complete model answer with examples]

## PRACTICE
[3-5 hands-on exercises or problems. For each: title + description + what to focus on]

## MASTERY CHECKLIST
[10 yes/no checkpoints. If a learner can't answer "yes" to all, they're not ready]

---
RULES:
- No fluff. No encouragement. Pure information density.
- Every claim must be specific, not vague.
- Use real examples from production systems, not toy examples.
- Depth level: {depth_level}
- {depth_instruction}
"""


def build_research_query(topic: str, depth: str) -> str:
    depth_modifier = {
        "Beginner": "introduction fundamentals basics",
        "Advanced": "advanced technical implementation internals",
        "Interview-Ready": "interview questions FAANG technical interview preparation",
    }.get(depth, "advanced technical")

    return f"{topic} {depth_modifier} comprehensive guide"


# ============================================
# GPT RESEARCHER INTEGRATION
# ============================================
async def run_gpt_researcher(topic: str, depth: str) -> AsyncGenerator[str, None]:
    """Use GPT Researcher to gather comprehensive research, then structure it."""
    try:
        from gpt_researcher import GPTResearcher

        query = build_research_query(topic, depth)

        researcher = GPTResearcher(
            query=query,
            report_type="research_report",
            verbose=False,
        )

        yield _sse_event("status", {"message": "Initiating deep research...", "phase": 1})
        await asyncio.sleep(0.1)

        research_result = await researcher.conduct_research()

        yield _sse_event("status", {"message": "Research gathered. Structuring mentor output...", "phase": 2})
        await asyncio.sleep(0.1)

        raw_report = await researcher.write_report()

        yield _sse_event("status", {"message": "Generating structured mentor format...", "phase": 3})
        await asyncio.sleep(0.1)

        # Now structure the raw report through OpenAI
        structured = await _structure_with_openai(topic, depth, raw_report)

        # Stream section by section
        async for chunk in _stream_sections(structured):
            yield chunk

        yield _sse_event("complete", {"message": "Research complete"})

    except ImportError:
        yield _sse_event("error", {"message": "GPT Researcher not installed. Falling back to direct research."})
        async for chunk in _fallback_research(topic, depth):
            yield chunk
    except Exception as e:
        yield _sse_event("error", {"message": f"Research error: {str(e)}"})
        async for chunk in _fallback_research(topic, depth):
            yield chunk


async def _structure_with_openai(topic: str, depth: str, raw_content: str) -> str:
    """Structure raw research content into mentor format using OpenAI."""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    prompt = MENTOR_SYSTEM_PROMPT.format(
        depth_level=depth,
        depth_instruction=DEPTH_INSTRUCTIONS.get(depth, DEPTH_INSTRUCTIONS["Advanced"]),
    )

    user_message = f"""Topic: {topic}

Based on this research data, generate a comprehensive mentor-format learning guide:

{raw_content[:8000]}  

Follow the STRICT OUTPUT FORMAT exactly. Make it extremely detailed and advanced."""

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        max_tokens=4000,
    )

    return response.choices[0].message.content or ""


# ============================================
# FALLBACK: Direct OpenAI (no GPT Researcher)
# ============================================
async def _fallback_research(topic: str, depth: str) -> AsyncGenerator[str, None]:
    """Fallback using OpenAI directly when GPT Researcher fails."""
    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        yield _sse_event("status", {"message": "Using direct AI research mode...", "phase": 1})

        prompt = MENTOR_SYSTEM_PROMPT.format(
            depth_level=depth,
            depth_instruction=DEPTH_INSTRUCTIONS.get(depth, DEPTH_INSTRUCTIONS["Advanced"]),
        )

        stream = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {
                    "role": "user",
                    "content": f"Create a complete study guide for: {topic}\n\nDepth: {depth}\nBe exhaustive, technical, and production-level accurate.",
                },
            ],
            temperature=0.3,
            max_tokens=4000,
            stream=True,
        )

        yield _sse_event("status", {"message": "Streaming mentor output...", "phase": 2})

        full_content = ""
        current_section = None

        async for chunk in stream:
            delta = chunk.choices[0].delta.content or ""
            full_content += delta

            # Detect section headers
            section_map = {
                "## BRIEF": "brief",
                "## CORE CONCEPTS": "core_concepts",
                "## DEEP DIVE": "deep_dive",
                "## COMMON MISTAKES": "common_mistakes",
                "## INTERVIEW Q&A": "interview_qa",
                "## PRACTICE": "practice",
                "## MASTERY CHECKLIST": "mastery_checklist",
            }

            for header, section_type in section_map.items():
                if header in full_content and current_section != section_type:
                    current_section = section_type
                    yield _sse_event("section_start", {"type": section_type, "title": header.replace("## ", "")})

            yield _sse_event("content", {"text": delta, "section": current_section})

        yield _sse_event("complete", {"message": "Research complete", "report": full_content})

    except Exception as e:
        yield _sse_event("fatal_error", {"message": str(e), "traceback": traceback.format_exc()})


async def _stream_sections(structured_content: str) -> AsyncGenerator[str, None]:
    """Stream pre-structured content section by section."""
    section_map = {
        "## BRIEF": "brief",
        "## CORE CONCEPTS": "core_concepts",
        "## DEEP DIVE": "deep_dive",
        "## COMMON MISTAKES": "common_mistakes",
        "## INTERVIEW Q&A": "interview_qa",
        "## PRACTICE": "practice",
        "## MASTERY CHECKLIST": "mastery_checklist",
    }

    lines = structured_content.split("\n")
    current_section = None
    buffer = []

    for line in lines:
        matched = False
        for header, section_type in section_map.items():
            if line.strip().startswith(header):
                # Flush previous section
                if current_section and buffer:
                    yield _sse_event("section_content", {
                        "type": current_section,
                        "content": "\n".join(buffer).strip(),
                    })
                    buffer = []

                current_section = section_type
                yield _sse_event("section_start", {
                    "type": section_type,
                    "title": line.strip().replace("## ", ""),
                })
                matched = True
                break

        if not matched:
            buffer.append(line)
            # Stream content in chunks for real-time feel
            if len(buffer) % 5 == 0 and current_section:
                yield _sse_event("content", {
                    "text": "\n".join(buffer[-5:]),
                    "section": current_section,
                })
                await asyncio.sleep(0.02)

    # Flush remaining
    if current_section and buffer:
        yield _sse_event("section_content", {
            "type": current_section,
            "content": "\n".join(buffer).strip(),
        })


# ============================================
# SSE HELPER
# ============================================
def _sse_event(event_type: str, data: dict) -> str:
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"


# ============================================
# ROUTES
# ============================================
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "tavily": bool(os.getenv("TAVILY_API_KEY")),
    }


@app.post("/research/stream")
async def research_stream(request: ResearchRequest):
    """Stream structured research via SSE."""
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=503, detail="OpenAI API key not configured")

    async def event_generator() -> AsyncGenerator[str, None]:
        async for chunk in run_gpt_researcher(request.topic, request.depth):
            yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.post("/research/sync")
async def research_sync(request: ResearchRequest):
    """Non-streaming research (collect all, return at once)."""
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=503, detail="OpenAI API key not configured")

    full_content = ""
    async for chunk in _fallback_research(request.topic, request.depth):
        if '"text":' in chunk:
            try:
                event_data = json.loads(chunk.split("data: ", 1)[1])
                full_content += event_data.get("text", "")
            except Exception:
                pass

    return {"content": full_content, "topic": request.topic, "depth": request.depth}


# ============================================
# ENTRY POINT
# ============================================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info",
    )
