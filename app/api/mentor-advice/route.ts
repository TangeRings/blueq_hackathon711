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

const JSON_SCHEMA_DESCRIPTION = `
You MUST respond with a valid JSON object and nothing else. No markdown, no code fences.

Schema:
{
  "reply": string,                  // Your mentor response (100-150 words, direct and actionable)
  "shouldUpdateState": boolean,     // true if project state should change
  "stateUpdates": {                 // only populated when shouldUpdateState is true
    "projectName": string,          // identified project title, or omit if already set / not yet clear
    "problemStatement": string,     // concise problem statement the student is solving, or omit if not yet clear
    "reasoning": string,            // brief reasoning behind the current direction, or omit if not yet clear
    "actionItems": [                // full updated action item list, or omit if no change
      { "id": string, "text": string, "completed": boolean, "source": "ai" }
    ],
    "hypotheses": [                 // full updated hypothesis list, or omit if no change
      { "id": string, "text": string, "status": "Needs validation" | "Partially supported" | "Validated" | "Challenged" | "Active" }
    ],
    "decisions": [                  // full updated decision list, or omit if no change
      { "id": string, "decision": string, "reason": string, "status": "Active" | "Under review" | "Challenged" | "Superseded" }
    ],
    "learningItem": {               // new learning to append, or omit if no change
      "description": string
    }
  }
}
`;

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
    const problemStmt = projectState.problemStatement || '(not yet identified)';
    const reasoning = projectState.reasoning || '(not yet identified)';
    const actionItemsStr = projectState.actionItems?.length
      ? projectState.actionItems.map((a: any) => `- [${a.completed ? 'x' : ' '}] ${a.text}`).join('\n')
      : '(none yet)';

    // Count how many mentor turns have happened so far (excluding the current message)
    const mentorTurnCount = history.filter((h: any) => h.sender === 'mentor').length;
    const isEarlyStage = !projectState.projectName && !projectState.problemStatement;

    const systemPrompt = `You are "Project Mentor", a friendly and encouraging mentor for high school students working on real-world project-based learning (PBL) capstone projects. Your tone is warm, casual, and easy to understand — like a cool older sibling or a relatable teacher who gets excited about ideas. Avoid jargon and business buzzwords. Speak plainly, as if talking to a smart 16-year-old.

Current Week: Week ${projectState.week} — ${projectState.weekName}
Milestone: ${projectState.milestone}

── Current project state ──
Project Title     : ${projectTitle}
Problem Statement : ${problemStmt}
Reasoning         : ${reasoning}
Action Items      :
${actionItemsStr}
Hypotheses        :
${hypothesesStr || '(none yet)'}
Previous Decisions:
${decisionsStr || '(none yet)'}
Learning Memory   :
${learningMemoryStr || '(none yet)'}
Teacher Feedback  : ${teacherFeedbackStr}

── How to behave ──

PHASE 1 — DISCOVERY (project title and problem NOT yet confirmed):
  You are in discovery mode right now if: isEarlyStage = ${isEarlyStage}, mentorTurnCount = ${mentorTurnCount}.

  Rules while in discovery mode:
  • Ask ONE focused follow-up question per turn to probe deeper. Never ask more than one question at a time.
  • The goal is to reach a confident understanding of: (a) what the student is building, (b) who it is for, and (c) what pain they are solving.
  • You need at least 2 student turns that show real understanding before you commit the project title and problem statement.
  • Do NOT surface (populate) projectName, problemStatement, or reasoning in stateUpdates until the student has answered at least 2 of your probing questions with enough clarity. If you are still unsure after 2 turns, ask one more question.
  • When you ARE confident (typically after turn 2 or 3), write a brief confirmation like "Got it — let me capture that." and populate all the fields.

PHASE 2 — ONGOING MENTORING (project title and problem already confirmed):
  • Give practical, real-world advice based on what the student is learning and doing. Reference their hypotheses, decisions, and teacher feedback naturally.
  • Help them think about what they learned from talking to real people (interviews), what changed, and what to do next.
  • Suggest concrete next steps when they seem stuck or need direction.
  • Be concise — 80–130 words max per reply.

GENERAL RULES (always apply):
  • Use simple, everyday language. No business buzzwords or academic jargon (e.g. say "test your idea with real people" instead of "validate your hypothesis").
  • Use bullet points to structure your reply whenever there are multiple ideas, steps, or observations — keep each bullet tight (1–2 sentences max).
  • Lead with one short opening sentence to set context, then use bullets for the substance.
  • No hollow openers like "Great question!" or "Absolutely!".
  • If the student's message warrants any state change, set shouldUpdateState = true and fill the relevant stateUpdates fields.
  • Only populate a stateUpdates field if you are genuinely updating it; omit fields that have not changed.

${JSON_SCHEMA_DESCRIPTION}`;

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
    const content = aiResult.choices?.[0]?.message?.content ?? "{}";
    const data = JSON.parse(content.trim());
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/mentor-advice:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
