const EVEROS_BASE_URL = "https://api.evermind.ai/api/v1";

export type EverosRole = "user" | "assistant" | "tool";

export interface EverosMessage {
  role: EverosRole;
  content: string;
  timestamp?: number;
  sender_id?: string;
  sender_name?: string;
}

function getApiKey(): string | null {
  return process.env.EVERMIND_API_KEY || null;
}

async function everosFetch(path: string, body: unknown) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("EVERMIND_API_KEY is not configured");
  }

  const resp = await fetch(`${EVEROS_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`EverOS ${path} error ${resp.status}: ${text}`);
  }

  return resp.status === 204 ? {} : resp.json();
}

/**
 * Store an agent trajectory (a mentoring "case") in EverOS agent memory.
 * EverOS distills these cases into agent skills over time.
 */
export async function addAgentMemory(params: {
  userId: string;
  sessionId: string;
  messages: EverosMessage[];
}) {
  const now = Date.now();
  return everosFetch("/memories/agent", {
    user_id: params.userId,
    session_id: params.sessionId,
    messages: params.messages.map((m, i) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp ?? now + i,
      sender_id: m.sender_id ?? (m.role === "user" ? params.userId : "mentor_agent"),
      sender_name: m.sender_name ?? (m.role === "user" ? "Student" : "Mentor Agent"),
    })),
  });
}

/** Force immediate extraction of queued agent memories. */
export async function flushAgent(params: { userId: string; sessionId?: string }) {
  return everosFetch("/memories/agent/flush", {
    user_id: params.userId,
    ...(params.sessionId ? { session_id: params.sessionId } : {}),
  });
}

/**
 * Search memories (used to retrieve prior coaching cases / distilled skills).
 * Defaults to hybrid retrieval, which EverOS recommends.
 */
export async function searchMemory(params: {
  userId: string;
  query: string;
  topK?: number;
  memoryTypes?: string[];
}) {
  return everosFetch("/memories/search", {
    query: params.query,
    method: "hybrid",
    top_k: params.topK ?? 5,
    filters: { user_id: params.userId },
    ...(params.memoryTypes ? { memory_types: params.memoryTypes } : {}),
  });
}

export function isEverosConfigured(): boolean {
  return !!getApiKey();
}
