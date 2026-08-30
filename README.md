# DOO Field Manual

Private interview-preparation instrument for learning a Director of Operations role in an ABA clinic by operating through the job rather than memorizing a list of responsibilities.

## Six sections — this is the ceiling

1. **Start Here** — six operating machines, four work modes, the 90-day restraint layer, and the working Money machine.
2. **JD Manual** — the role responsibilities translated into operating meaning, success criteria, systems, gauges, authority boundaries, and interview angle.
3. **Playbooks** — decision trees for known recurring events, with escalation triggers, manager-notification windows, and a changed-detail escalation rep.
4. **Monitor** — a 13-gauge baseline sheet with current value, target, source, and confirmation state. `not yet tracked` is a valid finding.
5. **Interview Room** — six decision questions with drafting surfaces and 90-second practice timers. No model scripts.
6. **AI Study Coach** — one skeptical executive-interviewer pushback per answer: unsupported assumption, missing number, and method challenge.

The framing remains:

- **Event → Playbook**
- **Required work → Workflow**
- **Ongoing state → Monitor**
- **Measured gap → DMAIC**

And the six operating machines remain: **People, Service Delivery, Execution, Money, Safety, Leadership**.

## Privacy gate — required

This project is intentionally `noindex, nofollow` in both metadata and response headers. It is also blocked unless a site password is configured.

Set the following before local use or deployment:

```bash
SITE_PASSWORD=choose-a-private-password
```

The middleware uses HTTP Basic authentication. The username can be anything; the password must match `SITE_PASSWORD`. If the environment variable is missing, the site returns `503` instead of serving the content publicly.

For Vercel: Project Settings → Environment Variables → add `SITE_PASSWORD` for every environment you plan to use.

## AI skeptical interviewer

The coach works in a deterministic fallback mode when no API key is present. For model-generated pushback, add:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6-luna
```

`OPENAI_MODEL` is optional. The API route uses the OpenAI Responses API server-side with `store: false`. Never put the API key in a `NEXT_PUBLIC_` variable.

Do not enter PHI, client names, credentials, proprietary case detail, or other sensitive internal information into the coach.

## Local setup

```bash
npm install
SITE_PASSWORD=your_password npm run dev
```

Open `http://localhost:3000` and enter any username plus the configured password when prompted.

## Financial model boundary

The Money machine is an interview-learning model, not a statement of Katy clinic economics. Every input defaults to **assumed**. Mark an input **confirmed** only when you have a source you would be willing to name. The site deliberately distinguishes assumptions from confirmed operating data.

## Source / policy boundary

This is not official company policy. Company procedures, delegated authority, clinical rules, HR procedures, compliance requirements, and escalation thresholds override the learning models wherever they differ.
