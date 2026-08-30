import { NextRequest, NextResponse } from 'next/server';

type RequestBody = {
  question?: string;
  answer?: string;
};

type CoachOutput = {
  pushback: string;
  unsupportedAssumption: string;
  missingNumber: string;
  methodChallenge: string;
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

function fallback(question: string, answer: string): CoachOutput {
  const lower = answer.toLowerCase();
  const vague = lower.includes("i'd look into") || lower.includes('i would look into') || lower.includes('figure out') || lower.includes('assess the situation');
  const hasNumber = /\d/.test(answer);
  return {
    pushback: `You gave me a direction, not yet a director-level decision. On “${question},” what is the first observable fact you would use to decide whether your approach is working?`,
    unsupportedAssumption: 'You are assuming the stated problem is the real driver before showing how you would verify it. Name the source or evidence that would let you make that claim.',
    missingNumber: hasNumber ? 'You used a number. Now tell me its source, target, comparison period, and what threshold would change your action.' : 'Give me the number you would need before acting: current value, target, timeframe, and source.',
    methodChallenge: vague ? '“I’d look into it” is not a method. Tell me exactly what report, system, comparison, observation, or person you would use first and what you would do with the result.' : 'State the method: what you would check first, what you would compare it with, who you would involve, and what finding would make you change course.',
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RequestBody;
  const question = (body.question || '').trim().slice(0, 1200);
  const answer = (body.answer || '').trim().slice(0, 8000);

  if (!question || !answer) {
    return NextResponse.json({ error: 'A question and answer are required.' }, { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json(fallback(question, answer));

  const systemDirection = `You are a regional executive director interviewing an internal candidate for Director of Operations at a single ABA autism-therapy clinic. The candidate is under-qualified on paper and you already know him. You are not hostile and you do not help him along. Probe for evidence. He has no direct-report management history, no P&L ownership, and no compliance ownership. Do not shame those gaps and do not let him conceal them. When he claims a strength, ask what it cost or what evidence proves it. When he proposes a change, ask what data supports it and what he would stop doing if it failed. When he uses a metric, ask its source, target, and comparison period. Refuse to accept “I'd look into it” without a stated method. Respect operational/clinical scope boundaries and do not invent employer policy. Keep this to one sharp exchange, not a dialogue.`;

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      pushback: { type: 'string' },
      unsupportedAssumption: { type: 'string' },
      missingNumber: { type: 'string' },
      methodChallenge: { type: 'string' },
    },
    required: ['pushback', 'unsupportedAssumption', 'missingNumber', 'methodChallenge'],
  };

  const prompt = `${systemDirection}\n\nInterview question:\n${question}\n\nCandidate answer:\n${answer}\n\nReturn exactly one tough follow-up rep. Name the weakest unsupported assumption specifically. Ask for the most decision-relevant missing number. Give one method challenge that forces the candidate to say how he would investigate rather than saying he would simply look into it.`;

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
            name: 'doo_interviewer_pushback',
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
    if (!text) return NextResponse.json({ error: 'The interviewer returned no text.' }, { status: 502 });
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected interviewer error.' }, { status: 500 });
  }
}
