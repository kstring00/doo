import { NextRequest, NextResponse } from 'next/server';

type RequestBody = {
  missedTopics?: string[];
  missedQuestions?: { question: string; chosen: string; correct: string; topic: string }[];
  mode?: 'quiz' | 'flashcards' | 'both';
};

function extractText(data: any) {
  const parts: string[] = [];
  for (const item of data?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'AI coach is not configured. Add OPENAI_API_KEY in your Vercel environment variables.' },
      { status: 503 },
    );
  }

  const body = (await req.json()) as RequestBody;
  const missedTopics = (body.missedTopics ?? []).slice(0, 12);
  const missedQuestions = (body.missedQuestions ?? []).slice(0, 12);
  const mode = body.mode ?? 'both';

  const sourceContext = `
The learner is preparing for an interview for Director of Operations at an ABA clinic. The public job description emphasizes: day-to-day clinic leadership; sustainable operations; growth strategies and processes; leading a high-performance operations team; client and stakeholder communication; subordinate training; timely documentation; compliance with accrediting/licensing bodies; financial oversight and department budgets; employee/client safety; facility tours; referral-source and family communication; compliance and quality-assurance projects; weekly/monthly/quarterly reporting; crisis intervention with the clinical team; medication-policy adherence; and mitigating missed services.

Operational tools/concepts already taught in this site:
- Microsoft Teams Shifts represents planned staffing/schedules.
- ABA Connect represents operational/service-delivery outcomes such as scheduled/rendered services, billable hours, cancellations, appointments, documentation and performance indicators.
- Immediate recurring event with a known response -> playbook / logic tree.
- Repeatable required work -> workflow / checklist.
- Ongoing state that can drift -> tracker / dashboard.
- Meaningful measurable process/output gap with unknown causes -> DMAIC investigation after immediate containment if needed.
- Individual performance concerns begin with a performance-management workflow: define the missed expectation, verify evidence, determine clarity/training/ability/barriers, coach or hold accountable as appropriate, set follow-up, and reassess.
- Operational authority boundaries matter: own operational decisions, collaborate when clinical judgment is involved, and escalate HR/compliance/high-risk or out-of-scope decisions.
`;

  const prompt = `You are an adaptive interview-prep coach. Create a focused study pack based primarily on the learner's missed material. Do not invent company policies or claim specific authority the public job description does not establish. Keep clinical decisions with clinical leaders. Make questions realistic, director-level, and objectively gradeable from the provided context. Avoid Lean Six Sigma unless a measurable recurring process problem with unknown causes is explicitly part of the question.

Requested mode: ${mode}
Missed topics: ${missedTopics.length ? missedTopics.join(', ') : 'none yet — use the core role responsibilities'}
Missed questions: ${JSON.stringify(missedQuestions)}

${sourceContext}

Return 6 flashcards and 6 single-answer multiple-choice questions. At least 4 of the 6 questions should directly remediate the missed topics/questions when misses are supplied. Include concise rationales.`;

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      focus: { type: 'string' },
      flashcards: {
        type: 'array',
        minItems: 6,
        maxItems: 6,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            front: { type: 'string' },
            back: { type: 'string' },
            topic: { type: 'string' },
          },
          required: ['front', 'back', 'topic'],
        },
      },
      quiz: {
        type: 'array',
        minItems: 6,
        maxItems: 6,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            question: { type: 'string' },
            options: {
              type: 'array',
              minItems: 4,
              maxItems: 4,
              items: { type: 'string' },
            },
            correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
            rationale: { type: 'string' },
            topic: { type: 'string' },
          },
          required: ['question', 'options', 'correctIndex', 'rationale', 'topic'],
        },
      },
    },
    required: ['focus', 'flashcards', 'quiz'],
  };

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
        store: false,
        input: prompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'doo_study_pack',
            strict: true,
            schema,
          },
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: 'OpenAI request failed', detail }, { status: 502 });
    }

    const data = await response.json();
    const text = extractText(data);
    if (!text) return NextResponse.json({ error: 'AI coach returned no text.' }, { status: 502 });

    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected AI coach error.' },
      { status: 500 },
    );
  }
}
