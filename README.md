# DOO Field Manual

Interactive interview-prep site for learning the Director of Operations role in an ABA clinic by operating through responsibilities, playbooks, monitoring, scenarios, and adaptive study.

## Core sections

- **Start Here** — six operating machines + the four work-management modes.
- **JD Manual** — each public job-description responsibility translated into plain English, success criteria, systems, monitoring, normal operation, failure response, authority boundaries, and interview lens.
- **Playbooks** — visual logic trees for recurring operational events, beginning with a 7:10 AM RBT callout, individual performance management, and falling service delivery.
- **Coverage Command** — simplified staffing-match simulator that teaches time, qualification, clinical constraints, displacement, and labor-risk checks.
- **Monitor** — conceptual dashboard for reading planned vs actual operations using the mental model of Teams Shifts + ABA Connect.
- **Interview Room** — difficult questions, including experience-gap challenges, with answer frameworks and model responses.
- **AI Study Coach** — local adaptive quiz/flashcards plus optional AI-generated remediation based on missed topics/questions.

## Important boundaries

This is an interview-learning tool, not an official company operating policy. Company-specific policy, clinical approval rules, HR procedures, compliance requirements, and escalation paths should replace the general learning models where known.

Do **not** enter protected health information (PHI), client names, credentials, proprietary case details, or other sensitive internal information into the AI Study Coach.

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## AI Study Coach

The built-in adaptive quiz and flashcards work without any API key. To enable fresh AI-generated targeted remediation, set:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6-luna
```

`OPENAI_MODEL` is optional. The API route uses the OpenAI Responses API server-side and sets `store: false`.

For Vercel, add `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in Project Settings → Environment Variables. Never expose the API key through a `NEXT_PUBLIC_` variable.

## Source backbone

The responsibility map is based on the current public Director of Operations — ABA Centers of TX, Katy posting available in August 2026. It is paraphrased for study rather than reproduced as internal policy.
