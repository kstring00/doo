'use client';

import { useEffect, useMemo, useState } from 'react';

type Tab = 'home' | 'manual' | 'playbooks' | 'monitor' | 'interview' | 'study';
type Responsibility = {
  title: string;
  plain: string;
  success: string;
  systems: string[];
  watch: string[];
  routine: string;
  break: string;
  authority: 'Own' | 'Collaborate' | 'Escalate' | 'Mixed';
  interview: string;
};

type QuizQ = {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
};

type Miss = { question: string; chosen: string; correct: string; topic: string };

type AiPack = {
  focus: string;
  flashcards: { front: string; back: string; topic: string }[];
  quiz: { question: string; options: string[]; correctIndex: number; rationale: string; topic: string }[];
};

const responsibilities: Responsibility[] = [
  {
    title: 'Day-to-day clinic leadership',
    plain: 'Keep the clinic operating reliably each day: staffing, priorities, communication, follow-through, and rapid response when normal operations break.',
    success: 'The clinic is staffed, decisions are made on time, urgent problems are contained, and work does not stall waiting for direction.',
    systems: ['Teams Shifts', 'ABA Connect', 'Daily huddle', 'Escalation channels'],
    watch: ['Coverage gaps', 'Callouts', 'Missed services', 'Operational blockers'],
    routine: 'Review the day, identify risks, assign ownership, remove blockers, and follow up.',
    break: 'Open the relevant playbook: callout, coverage gap, safety issue, documentation issue, or family concern.',
    authority: 'Mixed',
    interview: 'Describe how you prioritize service continuity, people, safety, and communication without trying to personally do every task.',
  },
  {
    title: 'Build sustainable operations',
    plain: 'Create repeatable ways of working so the clinic is not dependent on one person remembering everything.',
    success: 'Routine work has owners, clear steps, deadlines, visible status, and a way to detect drift.',
    systems: ['Playbooks', 'Checklists', 'Trackers', 'Ownership map'],
    watch: ['Repeat emergencies', 'Dropped handoffs', 'Workarounds', 'Single points of failure'],
    routine: 'Standardize recurring work and clarify who owns each step.',
    break: 'If a process repeatedly misses target and the cause is unclear, define the measurable gap and investigate it systematically.',
    authority: 'Own',
    interview: 'Explain that sustainable operations means building systems people can execute consistently, not relying on heroics.',
  },
  {
    title: 'Growth strategies and processes',
    plain: 'Help the clinic expand capacity without creating operational chaos.',
    success: 'Growth in clients, staff, rooms, and service hours is matched by scheduling, onboarding, training, and support capacity.',
    systems: ['Capacity planning', 'Hiring pipeline', 'Onboarding', 'Room/schedule planning'],
    watch: ['Open demand', 'Vacancies', 'Staff readiness', 'Space constraints'],
    routine: 'Compare demand with staffing and operational capacity before growth creates bottlenecks.',
    break: 'Identify the limiting constraint and coordinate the correct owner rather than pushing every part of the system harder.',
    authority: 'Collaborate',
    interview: 'Show that growth is not just more clients; it is matching demand to safe, trained, sustainable capacity.',
  },
  {
    title: 'Lead a high-performance operations team',
    plain: 'Set expectations, develop people, address missed expectations, and create accountability without confusing management with punishment.',
    success: 'Employees know what good performance looks like, receive feedback, have needed training, and patterns are addressed promptly.',
    systems: ['Performance reviews', 'Coaching workflow', 'Training tracker', 'Follow-up dates'],
    watch: ['Repeat misses', 'Attendance patterns', 'Training gaps', 'Feedback themes'],
    routine: 'Recognize strong performance, coach gaps, set clear next expectations, and reassess.',
    break: 'Use the performance-management logic tree before deciding whether the issue is training, clarity, barrier, fit, or accountability.',
    authority: 'Mixed',
    interview: 'Be specific about evidence, expectations, coaching, follow-up, and when HR or clinical leadership must be involved.',
  },
  {
    title: 'Client and stakeholder communication',
    plain: 'Make sure families, referral sources, and internal partners receive timely operational communication and know who owns next steps.',
    success: 'Concerns do not disappear into a void; communication is prompt, professional, documented where required, and routed correctly.',
    systems: ['Contact ownership', 'Follow-up tracker', 'Escalation path'],
    watch: ['Open concerns', 'Unreturned follow-ups', 'Recurring complaints'],
    routine: 'Acknowledge, clarify the operational need, assign the right owner, and close the loop.',
    break: 'Separate operational concerns from clinical questions and involve clinical leadership when treatment judgment is required.',
    authority: 'Collaborate',
    interview: 'Emphasize responsiveness while respecting the boundary between operational communication and clinical recommendations.',
  },
  {
    title: 'Training of subordinates',
    plain: 'Ensure required training is assigned, completed, understood, and followed up when performance shows a gap.',
    success: 'Required training is current and employees can perform the expected operational tasks.',
    systems: ['Training matrix', 'Due-date tracker', 'Competency follow-up'],
    watch: ['Overdue training', 'Expirations', 'Repeat errors after training'],
    routine: 'Track requirements, completion, due dates, and remediation.',
    break: 'If training was completed but performance still fails, move into the performance workflow rather than repeatedly assigning the same training.',
    authority: 'Own',
    interview: 'Distinguish training completion from actual performance and explain how you would verify both.',
  },
  {
    title: 'Timely documentation',
    plain: 'Ensure required documentation is completed within company expectations and operational delays are identified quickly.',
    success: 'Documentation is completed on time and repeat late patterns are visible and addressed.',
    systems: ['ABA Connect', 'Timeliness report', 'Follow-up workflow'],
    watch: ['On-time percentage', 'Overdue items', 'Repeat patterns by time/day/workflow'],
    routine: 'Monitor completion, follow up on misses, and clarify expectations.',
    break: 'One late note gets normal follow-up. A center-wide decline may become a measurable process problem requiring deeper investigation.',
    authority: 'Mixed',
    interview: 'Own timeliness operationally while recognizing that clinical documentation quality belongs with qualified clinical oversight.',
  },
  {
    title: 'Compliance and quality assurance',
    plain: 'Make sure operational practices follow required company, licensing, accreditation, and quality standards.',
    success: 'Requirements are known, assigned, documented, and exceptions are escalated rather than improvised.',
    systems: ['Audit checklist', 'Policy library', 'Corrective-action tracker'],
    watch: ['Audit findings', 'Expired requirements', 'Repeat exceptions'],
    routine: 'Review requirements, maintain evidence, correct gaps, and coordinate leadership support.',
    break: 'Contain risk, preserve facts, and escalate when an issue exceeds operational authority.',
    authority: 'Escalate',
    interview: 'Do not pretend to be the legal/compliance expert; show disciplined adherence, documentation, and escalation.',
  },
  {
    title: 'Financial oversight and budgets',
    plain: 'Understand what the clinic is spending, whether departments are within budget, and what operational decisions are driving labor and other costs.',
    success: 'Expenses are visible, exceptions are understood, approvals are disciplined, and service capacity is not managed blindly.',
    systems: ['Budget report', 'Expense approvals', 'Labor/OT report', 'Variance review'],
    watch: ['Actual vs budget', 'Overtime', 'Administrative labor', 'Unexpected expenses'],
    routine: 'Review budget-to-actual, ask why meaningful variances exist, and coordinate corrective action.',
    break: 'Do not cut blindly. Determine whether excess cost reflects vacancies, callout coverage, scheduling, demand, training, or another driver.',
    authority: 'Mixed',
    interview: 'If experience is limited, say so, then explain the core discipline: compare actual to plan, understand drivers, make controlled decisions, and escalate exceptions.',
  },
  {
    title: 'Employee and client safety',
    plain: 'Maintain an environment where foreseeable operational risks are identified and urgent safety events trigger the correct response.',
    success: 'Immediate safety takes priority, staff know escalation paths, and incidents are handled according to policy.',
    systems: ['Safety checks', 'Incident workflow', 'Emergency contacts', 'Facility checks'],
    watch: ['Incidents', 'Hazards', 'Repeat safety themes'],
    routine: 'Inspect, correct routine hazards, reinforce procedures, and keep escalation paths clear.',
    break: 'Stabilize immediate safety first, then notify and document through the required channels.',
    authority: 'Mixed',
    interview: 'Lead with immediate safety and policy, then coordination; do not freelance clinical crisis procedures.',
  },
  {
    title: 'Facility tours and readiness',
    plain: 'Keep the physical clinic presentable, functional, safe, and ready for clients, families, staff, and visitors.',
    success: 'The facility is orderly, issues are visible, and repairs or readiness gaps have owners.',
    systems: ['Walkthrough checklist', 'Facilities ticketing', 'Readiness log'],
    watch: ['Open repairs', 'Safety hazards', 'Room readiness'],
    routine: 'Walk the facility, capture issues, assign ownership, and follow up.',
    break: 'Prioritize by safety and service impact, not by which problem is most annoying.',
    authority: 'Own',
    interview: 'Frame tours as operational observation, relationship building, and issue detection rather than ceremonial walkthroughs.',
  },
  {
    title: 'Weekly, monthly, and quarterly reporting',
    plain: 'Turn operational activity into a reliable picture leadership can use to make decisions.',
    success: 'Reports are accurate, on time, and explain meaningful changes rather than merely listing numbers.',
    systems: ['Reporting calendar', 'Dashboard', 'Variance notes'],
    watch: ['Service delivery', 'Staffing', 'Documentation', 'Budget', 'Quality/safety indicators'],
    routine: 'Collect, validate, summarize, explain variance, and identify actions/owners.',
    break: 'If data conflict across systems, verify the source before drawing a conclusion.',
    authority: 'Own',
    interview: 'Explain the difference between reporting a metric and interpreting what it means operationally.',
  },
  {
    title: 'Crisis intervention with clinical team',
    plain: 'Support safe operations during crises while qualified clinical leaders direct clinical intervention.',
    success: 'Roles are clear, the environment is supported, communication happens quickly, and operational needs do not interfere with clinical safety.',
    systems: ['Crisis protocol', 'Escalation contacts', 'Staffing support'],
    watch: ['Incident frequency', 'Staff readiness', 'Operational barriers during crises'],
    routine: 'Maintain readiness and role clarity.',
    break: 'Follow crisis policy and clinical direction; support staffing, space, communication, and escalation.',
    authority: 'Collaborate',
    interview: 'State the scope boundary clearly: operations supports the response; clinical leaders own clinical judgment.',
  },
  {
    title: 'Medication policy adherence',
    plain: 'Ensure operational handling follows defined medication procedures and deviations are escalated.',
    success: 'Staff follow policy exactly and questions are routed to the appropriate qualified leader.',
    systems: ['Medication policy', 'Training records', 'Exception reporting'],
    watch: ['Policy deviations', 'Training gaps'],
    routine: 'Confirm required process and training are followed.',
    break: 'Do not improvise medication decisions; secure the situation and escalate according to policy.',
    authority: 'Escalate',
    interview: 'Show policy discipline and scope awareness, not medical decision-making.',
  },
  {
    title: 'Mitigate missed services',
    plain: 'Reduce preventable loss of planned client service by responding to callouts, cancellations, vacancies, and schedule gaps quickly and intelligently.',
    success: 'At-risk sessions are identified early, qualified coverage is used when appropriate, and recurring loss patterns become visible.',
    systems: ['Teams Shifts', 'ABA Connect', 'Coverage Board', 'Callout playbook'],
    watch: ['Scheduled vs rendered hours', 'Callouts', 'Client cancellations', 'Coverage gaps', 'Vacancies'],
    routine: 'Compare planned staffing/service with actual delivery and resolve immediate gaps.',
    break: 'Contain today first; if missed services become a recurring measurable pattern with unclear causes, investigate the process rather than guessing.',
    authority: 'Mixed',
    interview: 'Walk through the 7:10 AM callout logic: identify services at risk, find appropriate coverage, avoid creating a second gap, communicate, update systems, then verify delivery.',
  },
];

const quizBank: QuizQ[] = [
  {
    id: 'q1', topic: 'playbooks',
    question: 'At 7:10 AM an RBT calls out for an 8:30 AM session. What is the strongest first operational move?',
    options: ['Begin a DMAIC project on attendance', 'Identify the affected session and service risk, then open the coverage process', 'Immediately discipline the RBT', 'Wait to see whether the family cancels'],
    correctIndex: 1,
    rationale: 'The immediate responsibility is containment: identify what service is at risk and activate the known coverage process. Trend investigation can happen later if callouts are recurring.',
  },
  {
    id: 'q2', topic: 'authority',
    question: 'A potential replacement RBT is available, but there is a client-specific clinical concern about the pairing. What should the DOO do?',
    options: ['Make the clinical judgment because staffing is operations', 'Ask the family to decide', 'Coordinate with the appropriate clinical leader before finalizing the pairing', 'Cancel automatically without checking alternatives'],
    correctIndex: 2,
    rationale: 'Operations can coordinate staffing, but clinical appropriateness belongs with qualified clinical leadership.',
  },
  {
    id: 'q3', topic: 'monitoring',
    question: 'Which example best represents monitoring rather than problem-solving?',
    options: ['Reviewing scheduled versus rendered hours each week for drift', 'Coaching an employee after a documented performance miss', 'Replacing an absent RBT this morning', 'Investigating a sustained decline in documentation timeliness'],
    correctIndex: 0,
    rationale: 'Monitoring is the gauge function: watching an indicator so drift is noticed before or when it becomes a problem.',
  },
  {
    id: 'q4', topic: 'performance',
    question: 'One employee repeatedly misses an established operational expectation. What should happen before assuming the employee is lazy or a poor fit?',
    options: ['Verify the expectation, evidence, training, ability, and possible barriers', 'Move directly to termination', 'Launch a center-wide process redesign', 'Ignore it until the annual review'],
    correctIndex: 0,
    rationale: 'Individual performance management begins by defining the miss and checking clarity, training, ability, barriers, and evidence before selecting coaching or accountability.',
  },
  {
    id: 'q5', topic: 'finance',
    question: 'Overtime is above budget for the month. What is the best director-level response?',
    options: ['Ban all overtime immediately', 'Accept it because healthcare is expensive', 'Compare actual to plan and determine the operational drivers before choosing an action', 'Reduce client service hours until payroll falls'],
    correctIndex: 2,
    rationale: 'Budget variance is a signal. The DOO should understand whether vacancies, callout coverage, scheduling, demand, or another driver explains it before acting.',
  },
  {
    id: 'q6', topic: 'documentation',
    question: 'Documentation timeliness drops from a stable high level to a sustained low level across the center. What changes about your response?',
    options: ['Nothing; treat every late note as unrelated', 'The recurring measurable gap may justify a process-level investigation after immediate follow-up', 'Clinical documentation should be ignored by operations', 'Replace the entire staff immediately'],
    correctIndex: 1,
    rationale: 'A widespread sustained decline is different from one late item. It may indicate a process/output problem that needs systematic investigation.',
  },
  {
    id: 'q7', topic: 'service delivery',
    question: 'Teams Shifts shows what should happen while ABA Connect shows what actually happened. What comparison is especially useful to a DOO?',
    options: ['Planned staffing/service versus actual rendered service', 'Employee birthdays versus client ages', 'Parking spaces versus documentation count', 'Job titles versus office supplies'],
    correctIndex: 0,
    rationale: 'A core operations question is whether planned capacity became delivered service and, if not, where the gap occurred.',
  },
  {
    id: 'q8', topic: 'systems',
    question: 'Which problem most clearly calls for a checklist/workflow rather than DMAIC?',
    options: ['A required onboarding sequence must happen the same way for every new employee', 'Callout rate doubled for eight weeks and the cause is unknown', 'Missed services are rising with no obvious driver', 'Overtime rose sharply despite stable demand'],
    correctIndex: 0,
    rationale: 'Known repeatable required work should be standardized as a workflow/checklist. DMAIC is for meaningful measurable performance gaps with unclear causes.',
  },
  {
    id: 'q9', topic: 'leadership',
    question: 'Which statement best reflects director-level leadership?',
    options: ['I personally solve every problem so staff know I care', 'I make sure the right owner, standard, information, decision, and follow-up are in place', 'I avoid delegating anything important', 'I focus only on problems that appear on dashboards'],
    correctIndex: 1,
    rationale: 'A director builds reliable execution through ownership, standards, decisions, support, and follow-up rather than becoming the bottleneck.',
  },
  {
    id: 'q10', topic: 'safety',
    question: 'During an urgent safety event, what takes priority before longer-term process analysis?',
    options: ['Immediate safety and required escalation', 'Budget analysis', 'A quarterly report', 'A root-cause workshop'],
    correctIndex: 0,
    rationale: 'Immediate safety and stabilization come first. Analysis and improvement follow after the urgent situation is contained.',
  },
  {
    id: 'q11', topic: 'experience gap',
    question: 'If asked about limited budgeting experience, which answer strategy is strongest?',
    options: ['Pretend you have managed a clinic P&L', 'Say finances are not important because care comes first', 'Acknowledge the gap, then explain budget-to-actual, variance drivers, disciplined approvals, and willingness to learn the company process', 'Change the subject to clinical skills'],
    correctIndex: 2,
    rationale: 'Credibility comes from naming the experience gap without surrendering the underlying operational understanding or learning plan.',
  },
  {
    id: 'q12', topic: 'missed services',
    question: 'When reassigning an RBT to cover a callout, which check prevents solving one problem by creating another?',
    options: ['Whether the replacement likes the new room', 'Whether moving the RBT uncovers another client/session', 'Whether the replacement has the newest badge', 'Whether the absent employee has used PTO before'],
    correctIndex: 1,
    rationale: 'Coverage decisions must account for downstream displacement; moving one person can simply transfer the service gap elsewhere.',
  },
];

const baseFlashcards = [
  { topic: 'systems', front: 'When do I use a playbook?', back: 'When a recurring event happens and the immediate response is already known: callout, safety event, timesheet error, cancellation, etc.' },
  { topic: 'systems', front: 'When do I use a workflow/checklist?', back: 'When required work must be completed consistently: onboarding, training completion, documentation follow-up, audits, reporting.' },
  { topic: 'monitoring', front: 'What does a dashboard do for a DOO?', back: 'It acts like gauges: it shows whether staffing, service delivery, documentation, budget, and other systems are staying within expectations.' },
  { topic: 'dmaic', front: 'When does DMAIC enter the picture?', back: 'When there is a meaningful measurable process/output gap, the important causes are not yet known, and immediate containment has already been handled if needed.' },
  { topic: 'authority', front: 'What are the three authority buckets?', back: 'Own operational decisions; collaborate where another discipline such as clinical judgment is involved; escalate HR, compliance, high-risk, or out-of-scope issues.' },
  { topic: 'service delivery', front: 'Teams Shifts vs ABA Connect?', back: 'Shifts = planned people/schedule. ABA Connect = what happened with services and operational outcomes. The DOO compares plan to actual.' },
  { topic: 'performance', front: 'What comes before calling someone lazy?', back: 'Define the missed expectation, verify evidence, confirm clarity and training, assess ability/barriers, then select coaching, support, accountability, or escalation.' },
  { topic: 'finance', front: 'What is budget variance?', back: 'The difference between what was planned/budgeted and what was actually spent. The DOO asks what operational drivers caused a meaningful variance.' },
];

const interviewQuestions = [
  {
    q: 'You have not been a Director of Operations before. Why should we take the risk on you?',
    framework: 'Do not argue that experience does not matter. Acknowledge the gap, show that you understand the role, connect your frontline insight to operational thinking, and explain how you will use structure, data, collaboration, and escalation instead of pretending to know everything.',
    sample: 'I would not claim that my current experience is equivalent to someone who has already run a clinic. The case I would make is that I understand the operating responsibilities I am stepping into, I have direct visibility into how scheduling, documentation, staffing and service delivery affect the floor, and I am deliberate about turning ambiguity into clear ownership and process. Where I lack company-specific experience, especially finance or higher-level HR decisions, I would learn the established process quickly and involve the right leader rather than guessing. I think the risk is best reduced by how I learn and how I make decisions, not by pretending the gap is not there.',
  },
  {
    q: 'It is 7:10 AM and two RBTs call out. What do you do?',
    framework: 'Contain first. Identify sessions at risk, review available qualified coverage, check clinical/client constraints, avoid creating another gap, consider labor implications, communicate changes, update the schedule, then verify service delivery. Recurring callouts become a separate trend problem.',
    sample: 'My first move is to identify exactly which client sessions are now at risk. I would review available staffing in the schedule, look for qualified coverage that fits the required time, and make sure I do not solve one gap by uncovering another session. If the pairing has a clinical consideration, I involve the clinical leader rather than making that judgment myself. After the assignment is settled I update the schedule, communicate the change, and later verify whether the service was actually delivered. If this is becoming a pattern, I separate that from the morning response and investigate the recurring attendance or staffing issue.',
  },
  {
    q: 'How would you handle an employee who is not meeting expectations?',
    framework: 'Start with a specific observable expectation and evidence. Check understanding, training, ability, barriers, and pattern. Coach/retrain/support or hold accountable as appropriate. Set a follow-up date and reassess. Involve HR/clinical leadership when the issue crosses those scopes.',
    sample: 'I would start by making the performance gap specific rather than labeling the person. I want to know what expectation was missed, what evidence I have, whether the employee understood it, whether they were trained, and whether there is a real barrier preventing performance. Then I can decide whether the response is coaching, retraining, operational support, or accountability. I would make the next expectation and follow-up date clear so the conversation actually leads somewhere. If the issue involves clinical competency, serious discipline, or another area outside my scope, I would involve the appropriate leader.',
  },
  {
    q: 'What do you know about managing a clinic budget?',
    framework: 'Be transparent about experience. Demonstrate the mental model: budget versus actual, meaningful variances, labor/OT/admin time and other expenses, causal drivers, approvals, and escalation.',
    sample: 'I am still developing hands-on budget ownership experience, so I would not overstate that. My understanding is that the operational discipline is to know the plan, compare actual spending against it, identify meaningful variances and understand the drivers before making a decision. Labor would be a major area I would watch, including overtime and paid administrative capacity, but I would not cut a number blindly if the real driver were vacancies or callout coverage. I would learn the company budget and approval process quickly and use it consistently.',
  },
  {
    q: 'How would you work with the Clinical Director?',
    framework: 'Define complementary ownership. DOO protects operational reliability; CD protects clinical quality. Collaborate where staffing and service delivery have clinical consequences.',
    sample: 'I see the relationship as complementary rather than competitive. I would own the operational systems that let care happen reliably — staffing, scheduling, training follow-through, documentation timeliness, budget, facility and service continuity — while respecting that treatment decisions and clinical competency belong with qualified clinical leadership. The overlap is where communication matters most, such as determining whether a coverage pairing is clinically appropriate or supporting a crisis without trying to direct the clinical intervention.',
  },
  {
    q: 'What would you do if you genuinely did not know what to do?',
    framework: 'Do not improvise outside scope. Clarify urgency, protect safety/service, identify decision owner, gather facts, use policy/playbook, escalate appropriately, then learn from it so the same uncertainty is easier next time.',
    sample: 'I would first determine whether the situation is urgent and whether safety or service continuity needs immediate containment. Then I would identify whether the decision is actually mine. I would use the relevant policy, data or playbook, and if the decision crosses clinical, HR, compliance or regional authority I would involve that owner rather than guessing. Afterward I would capture what I learned so the next occurrence has a clearer path.',
  },
];

const nav: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Start Here' },
  { id: 'manual', label: 'JD Manual' },
  { id: 'playbooks', label: 'Playbooks' },
  { id: 'monitor', label: 'Monitor' },
  { id: 'interview', label: 'Interview Room' },
  { id: 'study', label: 'AI Study Coach' },
];

function AuthorityTag({ value }: { value: Responsibility['authority'] }) {
  if (value === 'Own') return <span className="tag own">Own</span>;
  if (value === 'Collaborate') return <span className="tag collab">Collaborate</span>;
  if (value === 'Escalate') return <span className="tag escalate">Escalate</span>;
  return <><span className="tag own">Own pieces</span><span className="tag collab">Collaborate</span><span className="tag escalate">Escalate when needed</span></>;
}

export default function Page() {
  const [tab, setTab] = useState<Tab>('home');
  const [openResponsibility, setOpenResponsibility] = useState<number | null>(0);
  const [coverageChoice, setCoverageChoice] = useState<string | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [misses, setMisses] = useState<Miss[]>([]);
  const [score, setScore] = useState(0);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiPack, setAiPack] = useState<AiPack | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [interviewIndex, setInterviewIndex] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('doo-study-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.misses)) setMisses(parsed.misses);
        if (typeof parsed.score === 'number') setScore(parsed.score);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('doo-study-state', JSON.stringify({ misses, score })); } catch {}
  }, [misses, score]);

  const weakTopics = useMemo(() => {
    const counts = new Map<string, number>();
    misses.forEach(m => counts.set(m.topic, (counts.get(m.topic) || 0) + 1));
    return [...counts.entries()].sort((a,b) => b[1]-a[1]).map(([topic]) => topic);
  }, [misses]);

  const adaptiveFlashcards = useMemo(() => {
    if (!weakTopics.length) return baseFlashcards;
    return [...baseFlashcards].sort((a,b) => Number(weakTopics.includes(b.topic)) - Number(weakTopics.includes(a.topic)));
  }, [weakTopics]);

  const currentQ = quizBank[quizIndex % quizBank.length];

  function answerQuiz(i: number) {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === currentQ.correctIndex) setScore(s => s + 1);
    else {
      setMisses(prev => [...prev, {
        question: currentQ.question,
        chosen: currentQ.options[i],
        correct: currentQ.options[currentQ.correctIndex],
        topic: currentQ.topic,
      }].slice(-30));
    }
  }

  function nextQuestion() {
    setQuizIndex(i => (i + 1) % quizBank.length);
    setSelected(null);
    setAnswered(false);
  }

  async function generateAiPack() {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missedTopics: weakTopics, missedQuestions: misses, mode: 'both' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Unable to generate study pack.');
      setAiPack(data);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Unable to generate study pack.');
    } finally { setAiLoading(false); }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbarInner">
          <div className="brand"><span className="brandMark">DO</span><span>DOO Field Manual</span></div>
          <nav className="nav" aria-label="Main navigation">
            {nav.map(item => <button key={item.id} className={tab===item.id?'active':''} onClick={()=>setTab(item.id)}>{item.label}</button>)}
          </nav>
        </div>
      </header>

      <main className="main">
        {tab === 'home' && <>
          <div className="hero">
            <section className="card heroMain">
              <div className="eyebrow">Interview instruction manual</div>
              <h1>Learn the job by operating it.</h1>
              <p className="lead">The goal is not to memorize 40 responsibilities. Learn what the DOO owns, what the clinic gauges are telling you, which playbook to open when something happens, and how to explain your thinking under interview pressure.</p>
              <div className="pillRow"><span className="pill">JD → plain English</span><span className="pill">Logic trees</span><span className="pill">Coverage simulator</span><span className="pill">Experience-gap practice</span><span className="pill">Adaptive AI study</span></div>
            </section>
            <aside className="card">
              <div className="eyebrow">Core mental model</div>
              <h2 style={{marginTop:8}}>Four ways to manage work</h2>
              <div className="stack">
                <div><strong>Event → Playbook</strong><div className="muted small">Something happened. The immediate response is known.</div></div>
                <div><strong>Required work → Workflow</strong><div className="muted small">Something must happen consistently.</div></div>
                <div><strong>Ongoing state → Monitor</strong><div className="muted small">A gauge can drift, so watch it.</div></div>
                <div><strong>Measured gap + unknown cause → DMAIC</strong><div className="muted small">Investigate only after urgent containment if needed.</div></div>
              </div>
            </aside>
          </div>

          <section className="section">
            <div className="sectionHead"><div><div className="eyebrow">The map</div><h2>Six operating machines</h2><p className="muted">These organize the role. They are not six giant assignments you must solve at once.</p></div></div>
            <div className="grid6">
              {[
                ['People','Staffing, attendance, training, performance'],
                ['Service Delivery','Planned care becoming delivered care'],
                ['Execution','Documentation, deadlines, recurring work'],
                ['Money','Labor, overtime, expenses, budget variance'],
                ['Safety','People, facility, incidents, readiness'],
                ['Leadership','Priorities, ownership, communication, escalation'],
              ].map(([a,b])=><div className="machine" key={a}><strong>{a}</strong><span className="muted small">{b}</span></div>)}
            </div>
          </section>

          <section className="section grid3">
            <div className="card"><div className="eyebrow">Start 1</div><h3>Learn the JD</h3><p className="muted">Every responsibility is translated into what it means, what success looks like, what to watch, what breaks, and how to answer it.</p><button className="btn btnPrimary" onClick={()=>setTab('manual')}>Open JD Manual</button></div>
            <div className="card"><div className="eyebrow">Start 2</div><h3>Run the 7:10 AM callout</h3><p className="muted">Use a logic tree so the process carries the cognitive load while you still make the judgment calls.</p><button className="btn btnPrimary" onClick={()=>setTab('playbooks')}>Open Playbooks</button></div>
            <div className="card"><div className="eyebrow">Start 3</div><h3>Practice being challenged</h3><p className="muted">Answer the questions most likely to expose the experience gap before the interviewer gets the chance.</p><button className="btn btnPrimary" onClick={()=>setTab('interview')}>Enter Interview Room</button></div>
          </section>
        </>}

        {tab === 'manual' && <>
          <div className="sectionHead"><div><div className="eyebrow">Public job description translated</div><h1 style={{fontSize:44,color:'var(--ink)'}}>What does this job actually entail?</h1><p className="muted">Open one responsibility at a time. The purpose is comprehension, not memorization.</p></div></div>
          <div className="stack">
            {responsibilities.map((r,i)=><section className="card" key={r.title}>
              <div className="jdCard">
                <div className="num">{String(i+1).padStart(2,'0')}</div>
                <div><h3>{r.title}</h3><p className="muted" style={{marginBottom:4}}>{r.plain}</p><AuthorityTag value={r.authority}/></div>
                <button className="btn btnGhost" onClick={()=>setOpenResponsibility(openResponsibility===i?null:i)}>{openResponsibility===i?'Close':'Learn'}</button>
              </div>
              {openResponsibility===i && <div className="details">
                <div className="detail"><div className="detailLabel">Success looks like</div>{r.success}</div>
                <div className="detail"><div className="detailLabel">Systems / tools</div>{r.systems.map(x=><span className="tag" key={x}>{x}</span>)}</div>
                <div className="detail"><div className="detailLabel">What I watch</div>{r.watch.map(x=><span className="tag" key={x}>{x}</span>)}</div>
                <div className="detail"><div className="detailLabel">Normal operation</div>{r.routine}</div>
                <div className="detail"><div className="detailLabel">When it breaks</div>{r.break}</div>
                <div className="detail" style={{gridColumn:'span 3'}}><div className="detailLabel">Interview lens</div>{r.interview}</div>
              </div>}
            </section>)}
          </div>
        </>}

        {tab === 'playbooks' && <>
          <div className="sectionHead"><div><div className="eyebrow">Known event → known response</div><h1 style={{fontSize:44,color:'var(--ink)'}}>Playbook Room</h1><p className="muted">A playbook removes the “what am I forgetting?” problem. It does not remove judgment.</p></div></div>

          <section className="card">
            <div className="sectionHead"><div><div className="eyebrow">Playbook 01</div><h2>7:10 AM RBT Callout</h2><p className="muted">Learning model — exact company policy or approval rules should replace these general steps when known.</p></div><span className="tag escalate">Service at risk</span></div>
            <div className="flowWrap"><div className="flow">
              {[
                ['Callout received','alert'],['Identify affected session','action'],['Check Shifts / available capacity','action'],['Filter for time + qualification','action'],['Check clinical constraints','action'],['Avoid creating second gap','action'],['Confirm assignment / escalate','action'],['Update + communicate','success'],['Verify rendered service','success'],
              ].map(([label,kind],i)=><span style={{display:'contents'}} key={label}><div className={`flowNode ${kind}`}>{label}</div>{i<8&&<div className="flowArrow">→</div>}</span>)}
            </div></div>
          </section>

          <section className="section simGrid">
            <div className="card">
              <div className="eyebrow">Coverage command</div><h2>Who covers Client B?</h2>
              <p><strong>Need:</strong> 8:30 AM–12:30 PM · 4 service hours at risk</p>
              <p className="muted small">Choose the strongest operational match. Clinical appropriateness is intentionally shown as a required check, not a DOO-only judgment.</p>
              {[
                {name:'Taylor — Float',best:true,checks:['Available ✓','Full time match ✓','Qualified ✓','No displacement ✓','No OT risk ✓']},
                {name:'Chris — Assigned to Client E',best:false,checks:['Time match ✓','Qualified ✓','Moving creates gap ✕']},
                {name:'Jamie — Starts 10:00 AM',best:false,checks:['Qualified ✓','Time mismatch ✕']},
              ].map(p=><button key={p.name} className={`person ${coverageChoice===p.name?'best':''}`} style={{width:'100%',textAlign:'left'}} onClick={()=>setCoverageChoice(p.name)}>
                <strong>{p.name}</strong><div className="checks">{p.checks.map(c=><span key={c} className={`check ${c.includes('✕')?'no':''}`}>{c}</span>)}</div>
              </button>)}
              {coverageChoice && <div className="answerBox" style={{marginTop:12}}>{coverageChoice.startsWith('Taylor') ? <><strong>Strong choice.</strong> Taylor preserves the affected service without creating a second uncovered client in this simplified scenario. Next: verify any client-specific clinical constraints, confirm the assignment, update Shifts/communication, and later verify service delivery.</> : <><strong>Keep evaluating.</strong> This choice has a visible operational constraint. A director should avoid transferring the problem elsewhere or accepting a time mismatch without first checking better options.</>}</div>}
            </div>

            <div className="card">
              <div className="eyebrow">Playbook 02</div><h2>Employee misses an expectation</h2>
              <div className="stack">
                {['Define the exact expectation that was missed','Verify evidence — what actually happened?','Did the employee know the expectation?','Were they trained and able to perform it?','Is there a real barrier or competing condition?','Is this isolated or a pattern?','Choose support / retraining / coaching / accountability','Set the next expectation and follow-up date','Did performance improve?'].map((x,i)=><div className="detail" key={x}><strong>{i+1}. {x}</strong></div>)}
              </div>
              <p className="muted small" style={{marginTop:12}}>Clinical competency, serious discipline, HR matters, and other out-of-scope decisions require the appropriate partner/escalation rather than a unilateral DOO answer.</p>
            </div>
          </section>

          <section className="section card">
            <div className="eyebrow">Playbook 03</div><h2>Service delivery falls below target</h2>
            <div className="flowWrap"><div className="flow">
              {['Gauge shows sustained gap','Define exact service gap','Contain current uncovered sessions','Measure where loss occurs','Analyze callouts / cancellations / vacancies / schedule gaps','Improve validated drivers','Control: keep watching the gauge'].map((x,i)=><span style={{display:'contents'}} key={x}><div className={`flowNode ${i===0?'alert':i===6?'success':'action'}`}>{x}</div>{i<6&&<div className="flowArrow">→</div>}</span>)}
            </div></div>
            <p className="muted small" style={{marginTop:12}}>This is where DMAIC belongs: not because “operations uses Six Sigma,” but because a measurable recurring output is underperforming and the important causes are not yet known.</p>
          </section>
        </>}

        {tab === 'monitor' && <>
          <div className="sectionHead"><div><div className="eyebrow">The instrument panel</div><h1 style={{fontSize:44,color:'var(--ink)'}}>Monitor the clinic</h1><p className="muted">This is a conceptual learning dashboard inspired by the kinds of gauges you showed from ABA Connect. It is not a copy of internal company data.</p></div></div>
          <div className="metricGrid">
            <div className="metric"><div className="detailLabel">Completed services</div><div className="metricValue">95%</div><div className="goal">Goal ≥ 85%</div><div className="progress"><span style={{width:'95%'}}/></div></div>
            <div className="metric"><div className="detailLabel">RBT weekly average</div><div className="metricValue">21h</div><div className="goal">Goal 25h</div><div className="progress"><span style={{width:'84%'}}/></div></div>
            <div className="metric"><div className="detailLabel">At-risk service</div><div className="metricValue">8h</div><div className="muted small">Callouts + open coverage</div><div className="progress"><span style={{width:'32%'}}/></div></div>
            <div className="metric"><div className="detailLabel">Documentation on time</div><div className="metricValue">92%</div><div className="muted small">Watch trend, not one point</div><div className="progress"><span style={{width:'92%'}}/></div></div>
          </div>

          <section className="section grid2">
            <div className="card"><div className="eyebrow">Planned reality</div><h2>Teams Shifts</h2><p className="muted">Who is supposed to work, when they are scheduled, where coverage exists, and where staffing gaps may form.</p><div className="answerBox"><strong>Question:</strong> Do we have the people/capacity to execute the plan?</div></div>
            <div className="card"><div className="eyebrow">Actual reality</div><h2>ABA Connect</h2><p className="muted">What happened with scheduled/rendered service, billable hours, cancellations, appointments, documentation and other operational indicators.</p><div className="answerBox"><strong>Question:</strong> Did planned capacity actually become delivered service?</div></div>
          </section>

          <section className="section card">
            <h2>How a DOO reads a gauge</h2>
            <div className="grid3">
              <div className="detail"><div className="detailLabel">1. Observe</div>What is the number or trend actually saying?</div>
              <div className="detail"><div className="detailLabel">2. Compare</div>Against goal, prior period, schedule, budget, or expectation.</div>
              <div className="detail"><div className="detailLabel">3. Decide</div>Normal variation, immediate containment, performance follow-up, or deeper process investigation?</div>
            </div>
          </section>
        </>}

        {tab === 'interview' && <>
          <div className="sectionHead"><div><div className="eyebrow">The driver's test</div><h1 style={{fontSize:44,color:'var(--ink)'}}>Interview Room</h1><p className="muted">Practice the exact questions that can expose a knowledge or experience gap. Do not memorize the sample word-for-word; learn the structure.</p></div></div>
          <div className="grid2">
            <section className="card">
              <div className="eyebrow">Question {interviewIndex+1} of {interviewQuestions.length}</div>
              <h2 className="interviewQ" style={{marginTop:10}}>{interviewQuestions[interviewIndex].q}</h2>
              <textarea value={practiceAnswer} onChange={e=>setPracticeAnswer(e.target.value)} placeholder="Answer out loud first if you can, then type the version you want to refine…"/>
              <div className="pillRow">
                <button className="btn btnSecondary" onClick={()=>{setInterviewIndex(i=>(i-1+interviewQuestions.length)%interviewQuestions.length);setPracticeAnswer('')}}>Previous</button>
                <button className="btn btnPrimary" onClick={()=>{setInterviewIndex(i=>(i+1)%interviewQuestions.length);setPracticeAnswer('')}}>Next question</button>
              </div>
            </section>
            <section className="card">
              <div className="eyebrow">Answer architecture</div><h3 style={{marginTop:8}}>What a strong answer should contain</h3><div className="answerBox">{interviewQuestions[interviewIndex].framework}</div>
              <div className="spacer"/><div className="eyebrow">Model answer</div><div className="answerBox" style={{marginTop:8}}>{interviewQuestions[interviewIndex].sample}</div>
            </section>
          </div>
          <section className="section card">
            <h2>The experience-gap rule</h2>
            <div className="grid3">
              <div className="detail"><strong>Do not fake experience.</strong><p className="muted small">Credibility is more useful than inflated claims.</p></div>
              <div className="detail"><strong>Demonstrate the operating logic.</strong><p className="muted small">Show what you would look at, decide, own, collaborate on, and escalate.</p></div>
              <div className="detail"><strong>Name how you close the gap.</strong><p className="muted small">Company process, mentorship, data, policy, feedback, and deliberate follow-up.</p></div>
            </div>
          </section>
        </>}

        {tab === 'study' && <>
          <div className="sectionHead"><div><div className="eyebrow">Adaptive retention</div><h1 style={{fontSize:44,color:'var(--ink)'}}>AI Study Coach</h1><p className="muted">Misses are saved in this browser. Weak topics move to the front of your review, and the AI coach can generate a fresh targeted pack from the material you missed.</p></div></div>
          <div className="grid2">
            <section className="card">
              <div className="sectionHead"><div><div className="eyebrow">Adaptive quiz</div><h2>{currentQ.topic}</h2></div><span className="pill">Score: {score}</span></div>
              <h3>{currentQ.question}</h3>
              {currentQ.options.map((opt,i)=>{
                let cls='quizOption';
                if(selected===i) cls+=' selected';
                if(answered && i===currentQ.correctIndex) cls+=' correct';
                if(answered && selected===i && i!==currentQ.correctIndex) cls+=' wrong';
                return <button className={cls} key={opt} onClick={()=>answerQuiz(i)}>{opt}</button>;
              })}
              {answered && <><div className="answerBox" style={{marginTop:12}}>{currentQ.rationale}</div><button className="btn btnPrimary" style={{marginTop:12}} onClick={nextQuestion}>Next question</button></>}
            </section>

            <section className="card">
              <div className="sectionHead"><div><div className="eyebrow">Flashcards</div><h2>{adaptiveFlashcards[flashIndex%adaptiveFlashcards.length].topic}</h2></div><span className="pill">Weak topics first</span></div>
              <button className="flashcard" style={{width:'100%'}} onClick={()=>setFlashFlipped(v=>!v)}>
                {!flashFlipped ? <div><div className="eyebrow">Prompt</div><h2>{adaptiveFlashcards[flashIndex%adaptiveFlashcards.length].front}</h2><div className="muted small">Tap to reveal</div></div> : <div className="answer"><div className="eyebrow">Answer</div><strong>{adaptiveFlashcards[flashIndex%adaptiveFlashcards.length].back}</strong></div>}
              </button>
              <div className="pillRow"><button className="btn btnSecondary" onClick={()=>{setFlashIndex(i=>(i-1+adaptiveFlashcards.length)%adaptiveFlashcards.length);setFlashFlipped(false)}}>Previous</button><button className="btn btnPrimary" onClick={()=>{setFlashIndex(i=>(i+1)%adaptiveFlashcards.length);setFlashFlipped(false)}}>Next card</button></div>
            </section>
          </div>

          <section className="section card aiBox">
            <div className="sectionHead"><div><div className="eyebrow">AI remediation engine</div><h2>Generate a quiz from what you missed</h2><p className="muted">The server sends only your study misses/topics to the model. Do not enter client names, PHI, internal credentials, or proprietary case information.</p></div><button className="btn btnPrimary" style={{background:'#fff',color:'var(--navy)'}} onClick={generateAiPack} disabled={aiLoading}>{aiLoading?'Generating…':'Build targeted study pack'}</button></div>
            <div className="pillRow">{weakTopics.length ? weakTopics.map(t=><span className="pill" key={t}>{t}</span>) : <span className="pill">No misses yet — core role review</span>}</div>
            {aiError && <div className="aiOutput" style={{marginTop:14}}>{aiError} The built-in adaptive quiz and flashcards still work without the API.</div>}
            {aiPack && <div className="grid2" style={{marginTop:16}}>
              <div><h3>Focus: {aiPack.focus}</h3>{aiPack.flashcards.map((f,i)=><div className="aiOutput" style={{marginTop:8}} key={i}><strong>{f.front}</strong><div style={{marginTop:5,opacity:.86}}>{f.back}</div><div className="small" style={{marginTop:6,opacity:.62}}>{f.topic}</div></div>)}</div>
              <div><h3>Targeted questions</h3>{aiPack.quiz.map((q,i)=><div className="aiOutput" style={{marginTop:8}} key={i}><strong>{i+1}. {q.question}</strong><div className="small" style={{marginTop:6,opacity:.82}}>Answer: {q.options[q.correctIndex]}</div><div className="small" style={{marginTop:4,opacity:.66}}>{q.rationale}</div></div>)}</div>
            </div>}
          </section>

          <section className="section card">
            <div className="sectionHead"><div><h2>What the coach is learning</h2><p className="muted">Only your quiz performance in this browser — not employee/client data.</p></div><button className="btn btnDanger" onClick={()=>{setMisses([]);setScore(0);setAiPack(null)}}>Reset study history</button></div>
            {misses.length===0 ? <p className="muted">No misses recorded yet. Take the quiz and this section will begin identifying your weak areas.</p> : <div className="grid3">{weakTopics.map(topic=><div className="detail" key={topic}><strong>{topic}</strong><div className="muted small">{misses.filter(m=>m.topic===topic).length} miss(es) recorded</div></div>)}</div>}
          </section>
        </>}
      </main>
    </div>
  );
}
