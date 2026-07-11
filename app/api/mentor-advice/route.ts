import { NextRequest, NextResponse } from "next/server";
import { searchMemory, isEverosConfigured } from "../../lib/everos";

const DEEPSEEK_API_URL = "https://api.deepseek.com";
const MODEL = "deepseek-chat";
const STUDENT_USER_ID = "student_alex_demo";

/**
 * Best-effort retrieval of learned coaching skills from EverOS agent memory.
 * Returns a prompt-ready string, or "" if EverOS is unconfigured/unavailable.
 */
async function retrieveLearnedCoaching(query: string): Promise<string> {
  if (!isEverosConfigured()) return "";
  try {
    const result: any = await searchMemory({
      userId: STUDENT_USER_ID,
      query,
      topK: 5,
      memoryTypes: ["agent_memory"],
    });

    const data = result?.data ?? {};
    const chunks: string[] = [];

    for (const ep of data.episodes ?? []) {
      if (ep?.summary) chunks.push(ep.summary);
      else if (ep?.episode) chunks.push(ep.episode);
      for (const fact of ep?.atomic_facts ?? []) {
        if (fact?.content) chunks.push(fact.content);
      }
    }
    for (const skill of data.skills ?? []) {
      if (typeof skill === "string") chunks.push(skill);
      else if (skill?.content) chunks.push(skill.content);
    }

    const unique = Array.from(new Set(chunks.map(c => c.trim()).filter(Boolean))).slice(0, 6);
    if (unique.length === 0) return "";

    return `\n\u2500\u2500 Learned coaching patterns for this student (from EverOS agent memory) \u2500\u2500\n${unique
      .map(c => `\u2022 ${c}`)
      .join("\n")}\nApply these learned patterns when they fit — this student responds better to concrete, specific tasks than broad exploration.\n`;
  } catch (err) {
    console.warn("EverOS retrieval failed (non-fatal):", err);
    return "";
  }
}

// JSON schema is injected at the END of the system prompt so the model reads it last.

export async function POST(req: NextRequest) {
  try {
    const { message, projectState, history } = await req.json();

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "DEEPSEEK_API_KEY environment variable is not configured. Please add it to .env.local.",
        },
        { status: 500 }
      );
    }

    // Construct project state context for the AI
    const hypothesesStr = projectState.hypotheses
      .map((h: any) => `- ${h.text} (Status: ${h.status})`)
      .join("\n");
    const decisionsStr = projectState.previousDecisions
      .map((d: any) => `- ${d.decision} (Reason: ${d.reason}, Status: ${d.status})`)
      .join("\n");
    const learningMemoryStr = projectState.learningMemory
      .map((l: any) => `- ${l.week}: ${l.description}`)
      .join("\n");
    const teacherFeedbackStr = `"${projectState.teacherFeedback.text}" - ${projectState.teacherFeedback.author}, ${projectState.teacherFeedback.role}`;

    const projectTitle = projectState.projectName || '(not yet identified)';
    const actionItemsStr = projectState.actionItems?.length
      ? projectState.actionItems.map((a: any) => `- [${a.completed ? 'x' : ' '}] ${a.text}`).join('\n')
      : '(none yet)';

    const isEarlyStage = !projectState.projectName;

    // Student turns so far (used to force commit)
    const studentTurnCount = history.filter((h: any) => h.sender === 'student').length;

    const systemPrompt = `You are a friendly PBL mentor for high school students. Warm, casual, plain English — like a cool older sibling.

Week ${projectState.week} — ${projectState.weekName}. Milestone: ${projectState.milestone}
Teacher feedback: ${teacherFeedbackStr}

Current project state:
- Title: ${projectTitle}
- Action items: ${actionItemsStr}
- Hypotheses: ${hypothesesStr || 'none'}
- Decisions: ${decisionsStr || 'none'}
- Learning: ${learningMemoryStr || 'none'}

=== DISCOVERY MODE (title not yet confirmed) ===
isEarlyStage=${isEarlyStage}, studentTurns=${studentTurnCount}

STRICT RULES for discovery:
1. Ask ONLY ONE short question per turn (max 40 words). No bullet lists. No advice. No action plans.
2. After student turn 1: ask who the target user is.
3. After student turn 2: if you know (a) what they're building and (b) who it's for — COMMIT immediately. Do not ask more questions.
4. COMMIT means: set shouldUpdateState=true and fill projectName, problemStatement (one clear sentence describing the pain and who has it), actionItems (3 items max), hypotheses (2 items max). The FIRST action item MUST be a research task like "Talk to 5 people who have this problem (not friends)".
5. If studentTurns >= 3 and isEarlyStage is still true: YOU MUST COMMIT NOW regardless. Use your best guess from the conversation.

=== DIAGNOSTIC COACHING MODE (title already set) ===
You assigned action items last week (see "Action items" — unchecked ones are NOT done). When the student reports back, do NOT presuppose what they did. First read their message and figure out which common mistake, if any, they are making. Different mistakes call for different responses:

1. DIDN'T FINISH THE RESEARCH ("I did 2", "only a couple", "ran out of time") -> Press on who they actually reached, what blocked the rest, and a hard deadline to finish.
2. ONLY TALKED TO FRIENDS/FAMILY -> Friends give biased encouragement. Redirect them to real target users who feel the pain.
3. JUDGED THE DESIGN, NOT THE PROBLEM ("they said it looks cool") -> Nice-UI feedback isn't validation. Refocus on whether the underlying problem is real.
4. OPINIONS, NOT BEHAVIOR ("they'd use it", "sounds useful") -> Hypotheticals are weak. Ask what the person actually did the last time they hit this problem.
5. BUILT BEFORE VALIDATING ("I already coded it") -> Slow the build. Confirm the problem is real and worth solving before writing more code.

A generic assistant just congratulates the student and moves on. YOU MUST NOT. Name the specific issue you noticed and give the matching push. If they genuinely did solid work (real users, real behavior, honest numbers), acknowledge it and move them forward.

Rules for this mode:
- Max 70 words. Warm but firm.
- One clear, pointed follow-up. No long bullet lists.
- Do not hand out brand-new tasks until the current mistake is addressed.

=== OUTPUT FORMAT — READ THIS LAST ===
Your response MUST be ONLY a JSON object. No text before or after it. No markdown fences.

{
  "reply": "<your message to the student, plain conversational text>",
  "shouldUpdateState": <true or false>,
  "stateUpdates": {
    "projectName": "<string, only if committing>",
    "problemStatement": "<string, only if committing — one sentence: who has it + what the pain is>",
    "actionItems": [{"id":"a1","text":"<task>","completed":false,"source":"ai"}],
    "hypotheses": [{"id":"h1","text":"<hypothesis>","status":"Needs validation"}],
    "decisions": [{"id":"d1","decision":"<decision>","reason":"<why>","status":"Active"}],
    "learningItem": {"description":"<string>"}
  }
}

Only include stateUpdates fields that are actually changing. If shouldUpdateState is false, omit stateUpdates entirely.`;

    // Retrieve learned coaching patterns from EverOS (best-effort, non-blocking to the narrative).
    const learnedCoaching = await retrieveLearnedCoaching(message);
    const finalSystemPrompt = learnedCoaching
      ? `${systemPrompt}\n${learnedCoaching}`
      : systemPrompt;

    // Convert chat history to OpenAI message format
    const messages = [
      { role: "system", content: finalSystemPrompt },
      ...history.map((h: any) => ({
        role: h.sender === "student" ? "user" : "assistant",
        content: h.text,
      })),
      { role: "user", content: message },
    ];

    const aiResponse = await fetch(`${DEEPSEEK_API_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`DeepSeek API error ${aiResponse.status}: ${errText}`);
    }

    const aiResult = await aiResponse.json();
    const rawContent = (aiResult.choices?.[0]?.message?.content ?? "").trim();

    if (!rawContent) {
      throw new Error("DeepSeek returned an empty response. Please try again.");
    }

    // Attempt 1: strip optional markdown fences and parse the whole content.
    const stripped = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    let data: Record<string, unknown> | null = null;

    try {
      data = JSON.parse(stripped);
    } catch {
      // Attempt 2: DeepSeek sometimes writes prose first, then appends the JSON
      // object at the end. Extract the last {...} block and parse that.
      const jsonMatch = stripped.match(/\{[\s\S]*\}(?=[^}]*$)/);
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[0]);
        } catch {
          // extraction failed — fall through to plain-text fallback
        }
      }
    }

    if (!data) {
      // Attempt 3: pure plain-text response. Use it directly as the reply so the
      // chat still works even when DeepSeek ignores the JSON instruction entirely.
      console.warn("Using plain-text reply:", rawContent.slice(0, 120));
      data = { reply: rawContent, shouldUpdateState: false };
    }

    if (!data.reply) {
      throw new Error("AI response was missing the reply field.");
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/mentor-advice:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
