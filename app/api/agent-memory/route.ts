import { NextRequest, NextResponse } from "next/server";
import {
  addAgentMemory,
  flushAgent,
  searchMemory,
  isEverosConfigured,
  EverosMessage,
} from "../../lib/everos";

/**
 * Writes a mentoring "case" (agent trajectory) to EverOS agent memory and
 * flushes it so EverOS can distill it into agent skills.
 *
 * Body: { userId, sessionId, messages: [{ role, content }] }
 */
export async function POST(req: NextRequest) {
  if (!isEverosConfigured()) {
    return NextResponse.json(
      { ok: false, error: "EVERMIND_API_KEY is not configured." },
      { status: 200 }
    );
  }

  try {
    const { userId, sessionId, messages } = (await req.json()) as {
      userId: string;
      sessionId: string;
      messages: EverosMessage[];
    };

    if (!userId || !sessionId || !Array.isArray(messages)) {
      return NextResponse.json(
        { ok: false, error: "userId, sessionId and messages are required." },
        { status: 400 }
      );
    }

    const addResult = await addAgentMemory({ userId, sessionId, messages });
    // Best-effort flush; extraction is async on EverOS' side.
    await flushAgent({ userId, sessionId }).catch(() => null);

    return NextResponse.json({ ok: true, data: addResult });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("Error writing agent memory:", message);
    // Non-fatal: the demo narrative never depends on this call.
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}

/**
 * Searches EverOS for prior coaching cases / distilled skills.
 * Query params: ?userId=...&query=...&topK=...
 */
export async function GET(req: NextRequest) {
  if (!isEverosConfigured()) {
    return NextResponse.json(
      { ok: false, error: "EVERMIND_API_KEY is not configured.", data: null },
      { status: 200 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const query = searchParams.get("query") || "coaching strategy for this student";
    const topK = Number(searchParams.get("topK") || "5");

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "userId is required." },
        { status: 400 }
      );
    }

    const result = await searchMemory({
      userId,
      query,
      topK,
      memoryTypes: ["agent_memory"],
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("Error searching agent memory:", message);
    return NextResponse.json({ ok: false, error: message, data: null }, { status: 200 });
  }
}
