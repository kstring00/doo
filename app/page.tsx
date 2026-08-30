'use client';

import { useEffect, useMemo, useState } from 'react';

type Tab = 'home' | 'manual' | 'playbooks' | 'monitor' | 'interview' | 'study';
type ConfirmState = 'assumed' | 'confirmed' | 'not-yet-tracked';
type MoneyKey =
  | 'authorizedHours'
  | 'utilization'
  | 'reimbursement'
  | 'loadedRbtCost'
  | 'bcbaCost'
  | 'bcbaCount'
  | 'fixedOverhead'
  | 'rbtBudgeted'
  | 'rbtActual';

type MoneyField = {
  label: string;
  value: number;
  state: 'assumed' | 'confirmed';
  unit: string;
};

type MonitorGauge = {
  id: string;
  machine: 'Service Delivery' | 'People' | 'Execution' | 'Money' | 'Safety';
  label: string;
  current: string;
  target: string;
  source: string;
  state: ConfirmState;
};

type Responsibility = {
  title: string;
  plain: string;
  success: string;
  systems: string[];
  watch: string[];
  authority: 'Own' | 'Collaborate' | 'Escalate' | 'Mixed';
  interview: string;
};

type Playbook = {
  id: string;
  title: string;
  trigger: string;
  objective: string;
  steps: string[];
  escalateIf: string[];
  window: 'Immediately' | 'Same day' | 'Weekly report' | 'Not at all';
  scenario: string;
  choices: string[];
  correct: number;
  reasoning: string;
};

type InterviewQuestion = {
  id: string;
  question: string;
  testing: string;
  failure: string;
  note?: string;
  askInterviewer?: boolean;
};

type CoachOutput = {
  pushback: string;
  unsupportedAssumption: string;
  missingNumber: string;
  methodChallenge: string;
};

const nav: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Start Here' },
  { id: 'manual', label: 'JD Manual' },
  { id: 'playbooks', label: 'Playbooks' },
  { id: 'monitor', label: 'Monitor' },
  { id: 'interview', label: 'Interview Room' },
  { id: 'study', label: 'AI Study Coach' },
];

const machines = [
  ['People', 'Staffing, attendance, training, performance, onboarding, retention.'],
  ['Service Delivery', 'Turn planned care into delivered care and recover preventable losses.'],
  ['Execution', 'Documentation, deadlines, reporting, compliance routines, follow-through.'],
  ['Money', 'Labor, utilization, budget, unit economics, and the cost of operational gaps.'],
  ['Safety', 'Facility readiness, incidents, policy adherence, escalation, risk containment.'],
  ['Leadership', 'Priorities, accountability, cross-functional decisions, and fewer surprises upward.'],
] as const;

const workModes = [
  ['Event → Playbook', 'Something happened and the response path is already known.'],
  ['Required work → Workflow', 'Something has to happen consistently and on time.'],
  ['Ongoing state → Monitor', 'A gauge can drift, so you watch it before deciding to intervene.'],
  ['Measured gap → DMAIC', 'A meaningful process/output gap exists and the causes are not yet established.'],
] as const;

const responsibilities: Responsibility[] = [
  {
    title: 'Day-to-day clinic leadership',
    plain: 'Keep the clinic operating reliably each day: staffing, priorities, communication, follow-through, and rapid response when normal operations break.',
    success: 'The clinic is staffed, decisions happen on time, urgent problems are contained, and owners know the next action.',
    systems: ['Teams Shifts', 'ABA Connect', 'Daily huddle', 'Escalation channels'],
    watch: ['Coverage gaps', 'Callouts', 'Missed services', 'Operational blockers'],
    authority: 'Mixed',
    interview: 'Show a sequence: see risk early, contain what is urgent, assign ownership, communicate, then verify follow-through.',
  },
  {
    title: 'Build sustainable operations',
    plain: 'Create repeatable ways of working so the clinic does not depend on one person remembering or rescuing everything.',
    success: 'Recurring work has an owner, steps, due points, visible status, and a way to detect drift.',
    systems: ['Playbooks', 'Checklists', 'Trackers', 'Ownership map'],
    watch: ['Repeat emergencies', 'Dropped handoffs', 'Workarounds', 'Single points of failure'],
    authority: 'Own',
    interview: 'Define operations as reliable execution through systems, not heroics.',
  },
  {
    title: 'Growth strategies and processes',
    plain: 'Help the clinic expand capacity without outrunning staffing, onboarding, training, rooms, schedules, or support.',
    success: 'Demand and operating capacity grow together rather than creating chronic gaps.',
    systems: ['Capacity planning', 'Hiring pipeline', 'Onboarding', 'Room/schedule planning'],
    watch: ['Open demand', 'Vacancies', 'Staff readiness', 'Space constraints'],
    authority: 'Collaborate',
    interview: 'Growth is a capacity problem before it is a volume goal: know the constraint before pushing the system harder.',
  },
  {
    title: 'Lead a high-performance operations team',
    plain: 'Set expectations, develop people, address missed expectations, and create accountability without jumping straight to blame.',
    success: 'Employees know the standard, receive feedback, have needed training, and repeat misses are addressed promptly.',
    systems: ['Performance reviews', 'Coaching workflow', 'Training tracker', 'Follow-up dates'],
    watch: ['Repeat misses', 'Attendance patterns', 'Training gaps', 'Feedback themes'],
    authority: 'Mixed',
    interview: 'Use evidence → expectation → training/barrier check → coaching/accountability → follow-up. Escalate HR or clinical issues instead of freelancing them.',
  },
  {
    title: 'Client and stakeholder communication',
    plain: 'Make sure families, referral sources, and internal partners receive timely operational communication and know who owns next steps.',
    success: 'Concerns are acknowledged, routed correctly, and closed rather than disappearing between departments.',
    systems: ['Contact ownership', 'Follow-up tracker', 'Escalation path'],
    watch: ['Open concerns', 'Unreturned follow-ups', 'Recurring complaints'],
    authority: 'Collaborate',
    interview: 'Be responsive while separating operational communication from clinical recommendations.',
  },
  {
    title: 'Training of subordinates',
    plain: 'Ensure required training is assigned, completed, and followed by competent execution.',
    success: 'Training is current and employees can actually perform the expected work.',
    systems: ['Training matrix', 'Due-date tracker', 'Competency follow-up'],
    watch: ['Overdue training', 'Expirations', 'Repeat errors after training'],
    authority: 'Own',
    interview: 'Distinguish training completion from performance. A checked box is not proof that the task is being executed correctly.',
  },
  {
    title: 'Timely documentation',
    plain: 'Ensure required documentation is completed within expectations and operational delays become visible quickly.',
    success: 'On-time documentation is stable, overdue items are visible, and repeat patterns are addressed.',
    systems: ['ABA Connect', 'Timeliness report', 'Follow-up workflow'],
    watch: ['On-time rate', 'Overdue items', 'Repeat late patterns'],
    authority: 'Mixed',
    interview: 'Own timeliness operationally while leaving clinical documentation quality to qualified clinical oversight.',
  },
  {
    title: 'Compliance and quality assurance',
    plain: 'Make sure operational practices follow required policies, licensing/accreditation expectations, and quality routines.',
    success: 'Requirements are known, evidence is maintained, gaps have owners, and exceptions are escalated rather than improvised.',
    systems: ['Audit checklist', 'Policy library', 'Corrective-action tracker'],
    watch: ['Audit findings', 'Expired requirements', 'Repeat exceptions'],
    authority: 'Escalate',
    interview: 'Do not pretend to be the compliance expert. Show policy discipline, documentation, and escalation judgment.',
  },
  {
    title: 'Financial oversight and budgets',
    plain: 'Understand what the clinic earns and spends, whether labor and departments are within plan, and which operating choices drive variance.',
    success: 'Actual versus plan is visible, meaningful variance is explained, and actions are controlled instead of reflexive.',
    systems: ['Budget report', 'Labor/OT report', 'Expense approvals', 'Unit-economics calculator'],
    watch: ['Budget variance', 'Overtime', 'Labor cost per billable hour', 'Utilization'],
    authority: 'Mixed',
    interview: 'Be transparent about the experience gap, then demonstrate the discipline: compare actual to plan, quantify the driver, decide within authority, and escalate exceptions.',
  },
  {
    title: 'Employee and client safety',
    plain: 'Maintain an environment where foreseeable risks are identified and urgent events trigger the correct response.',
    success: 'Immediate safety is stabilized first, staff know the response path, and incidents are documented/escalated through policy.',
    systems: ['Safety checks', 'Incident workflow', 'Emergency contacts', 'Facility checks'],
    watch: ['Incidents', 'Open corrective actions', 'Hazards', 'Audit dates'],
    authority: 'Mixed',
    interview: 'Lead with immediate safety and policy; support clinical crisis response without inventing clinical procedures.',
  },
  {
    title: 'Facility tours and readiness',
    plain: 'Keep the physical clinic functional, safe, presentable, and ready for clients, families, staff, and visitors.',
    success: 'Issues are visible, prioritized by risk/service impact, assigned, and closed.',
    systems: ['Walkthrough checklist', 'Facilities tickets', 'Readiness log'],
    watch: ['Open repairs', 'Safety hazards', 'Room readiness'],
    authority: 'Own',
    interview: 'Frame the tour as an operating check: observe, capture, assign, follow up.',
  },
  {
    title: 'Weekly, monthly, and quarterly reporting',
    plain: 'Turn activity into a reliable operating picture leadership can use.',
    success: 'Reports are accurate, on time, and explain material changes rather than merely listing numbers.',
    systems: ['Reporting calendar', 'Monitor baseline', 'Variance notes'],
    watch: ['Service delivery', 'Staffing', 'Documentation', 'Budget', 'Safety/quality'],
    authority: 'Own',
    interview: 'A metric is only useful when you can state source, target, current state, variance, cause confidence, and next action.',
  },
  {
    title: 'Crisis intervention with the clinical team',
    plain: 'Support safe operations during crises while qualified clinical leaders own clinical intervention decisions.',
    success: 'Roles are clear, staffing/space/communication support the response, and operations does not interfere with clinical safety.',
    systems: ['Crisis protocol', 'Escalation contacts', 'Staffing support'],
    watch: ['Incident frequency', 'Staff readiness', 'Operational barriers during crises'],
    authority: 'Collaborate',
    interview: 'State the scope boundary clearly: operations supports the environment and coordination; clinical leaders direct clinical judgment.',
  },
  {
    title: 'Medication policy adherence',
    plain: 'Ensure operational handling follows the defined medication procedure and exceptions are escalated.',
    success: 'Staff follow policy exactly and questions move to the appropriate qualified leader.',
    systems: ['Medication policy', 'Training records', 'Exception reporting'],
    watch: ['Policy deviations', 'Training gaps'],
    authority: 'Escalate',
    interview: 'Demonstrate policy discipline and scope awareness, not medical decision-making.',
  },
  {
    title: 'Mitigate missed services',
    plain: 'Reduce preventable loss of planned service by responding to callouts, cancellations, vacancies, and schedule gaps quickly and intelligently.',
    success: 'At-risk sessions are identified early, appropriate coverage is used when possible, and recurring loss patterns become measurable.',
    systems: ['Teams Shifts', 'ABA Connect', 'Coverage Board', 'Callout playbook'],
    watch: ['Utilization', 'Missed-service rate by cause', 'Reschedule capture', 'Coverage gaps'],
    authority: 'Mixed',
    interview: 'Contain today first. Then verify what was delivered. If a recurring measurable gap remains and causes are unclear, investigate the process rather than guessing.',
  },
];

const defaultMoney: Record<MoneyKey, MoneyField> = {
  authorizedHours: { label: 'Authorized hours per week', value: 1200, state: 'assumed', unit: 'hr/wk' },
  utilization: { label: 'Utilization rate', value: 85, state: 'assumed', unit: '%' },
  reimbursement: { label: 'Average reimbursement per hour', value: 85, state: 'assumed', unit: '$/hr' },
  loadedRbtCost: { label: 'Loaded RBT cost per hour', value: 32, state: 'assumed', unit: '$/hr' },
  bcbaCost: { label: 'BCBA cost per month', value: 9500, state: 'assumed', unit: '$/mo' },
  bcbaCount: { label: 'Number of BCBAs', value: 4, state: 'assumed', unit: 'count' },
  fixedOverhead: { label: 'Fixed monthly overhead', value: 30000, state: 'assumed', unit: '$/mo' },
  rbtBudgeted: { label: 'RBT headcount — budgeted', value: 35, state: 'assumed', unit: 'RBTs' },
  rbtActual: { label: 'RBT headcount — actual', value: 32, state: 'assumed', unit: 'RBTs' },
};

const defaultGauges: MonitorGauge[] = [
  { id: 'utilization', machine: 'Service Delivery', label: 'Utilization — delivered ÷ authorized', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'missed-service', machine: 'Service Delivery', label: 'Missed-service rate — family cancel / tech callout / no-show / transportation', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'reschedule-capture', machine: 'Service Delivery', label: 'Reschedule capture rate', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'intake-cycle', machine: 'Service Delivery', label: 'Intake → first session cycle time', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'rbt-turnover', machine: 'People', label: 'RBT turnover — trailing 12 months', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'attrition-90', machine: 'People', label: '90-day attrition', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'time-to-fill', machine: 'People', label: 'Time-to-fill — RBT', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'supervision-ratio', machine: 'People', label: 'BCBA supervision ratio / caseload', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'documentation', machine: 'Execution', label: 'On-time documentation rate', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'claims-ar', machine: 'Execution', label: 'Clean claim rate / days in A/R', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'budget-variance', machine: 'Money', label: 'Budget variance', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'labor-billable', machine: 'Money', label: 'Labor cost per billable hour', current: '', target: '', source: '', state: 'not-yet-tracked' },
  { id: 'safety', machine: 'Safety', label: 'Incident rate / open corrective actions / next audit date', current: '', target: '', source: '', state: 'not-yet-tracked' },
];

const playbooks: Playbook[] = [
  {
    id: 'callout',
    title: '7:10 AM — RBT Callout',
    trigger: 'An RBT calls out before a scheduled client session.',
    objective: 'Preserve the planned service safely and appropriately without creating a second coverage problem.',
    steps: [
      'Identify every affected client/session and how many service hours are now at risk.',
      'Check Teams Shifts for float, unassigned, partial-overlap, or movable capacity.',
      'Filter candidates for time fit and required qualifications/training.',
      'Check client-specific clinical considerations with the appropriate clinical leader when needed.',
      'Reject any move that simply uncovers another client unless leadership deliberately accepts that tradeoff.',
      'Check overtime, policy, and approval implications before committing.',
      'Assign the best viable coverage, update the schedule, and communicate the change.',
      'Later verify in ABA Connect whether the planned service was actually rendered and record the cause if it was missed.',
    ],
    escalateIf: [
      'No appropriate coverage exists and a client will lose a meaningful block of planned service.',
      'Coverage requires an overtime, staffing, or policy exception outside your authority.',
      'Multiple simultaneous callouts create a center-level service continuity problem.',
      'The callout pattern is recurring enough that today is no longer an isolated event.',
    ],
    window: 'Same day',
    scenario: 'Changed detail: a qualified RBT can cover the entire session, but the move would place that employee into overtime that requires approval. What is the escalation call?',
    choices: ['Assign first and mention it in the weekly report', 'Escalate the approval need the same day before committing the OT', 'Do not escalate because service continuity is always more important than labor controls', 'Cancel the client immediately'],
    correct: 1,
    reasoning: 'You found a viable operational option, but the approval constraint means the decision is no longer fully yours. Escalate before creating an unauthorized labor commitment.',
  },
  {
    id: 'performance',
    title: 'Employee Performance Miss',
    trigger: 'An employee repeatedly misses an established operational expectation.',
    objective: 'Correct performance using evidence and the right management response without guessing at motive.',
    steps: [
      'State the exact expectation that was missed and collect specific evidence.',
      'Confirm the employee knew the expectation and had access to the required training/resources.',
      'Determine whether the issue is knowledge/skill, clarity, an operational barrier, or a pattern of nonperformance.',
      'Coordinate with clinical leadership if the concern is clinical competence or treatment execution.',
      'Coach, retrain, remove a verified barrier, or move into accountability/corrective action as appropriate.',
      'Set the next expectation and a concrete follow-up date.',
      'Reassess performance against evidence rather than impressions.',
    ],
    escalateIf: [
      'The issue involves safety, harassment, discrimination, retaliation, or another HR-sensitive allegation.',
      'Formal discipline, suspension, termination, or an action outside your delegated authority may be required.',
      'A clinical-competence concern affects client care.',
      'Performance remains below expectation after a documented coaching/remediation cycle.',
    ],
    window: 'Same day',
    scenario: 'Changed detail: during the performance conversation, the employee says the supervisor is retaliating against them. What do you do?',
    choices: ['Continue investigating alone until you decide who is right', 'Pause the ordinary coaching path and escalate the allegation through the appropriate manager/HR channel the same day', 'Tell the employee retaliation is outside the scope of the conversation', 'Wait for the annual review'],
    correct: 1,
    reasoning: 'The allegation changes the category of the issue. Your job is to preserve facts and route it through the correct process, not become the sole investigator.',
  },
  {
    id: 'delivery',
    title: 'Service Delivery Falls Below Target',
    trigger: 'A service-delivery gauge shows a sustained, meaningful miss against target.',
    objective: 'Separate immediate containment from process investigation and avoid changing a system before the gap is understood.',
    steps: [
      'Verify the metric definition, timeframe, source, and target before reacting.',
      'Contain any current-day coverage or safety problem first.',
      'Measure the size and duration of the gap.',
      'Split missed service by cause: family cancellation, tech callout, no-show, transportation, vacancy, scheduling, or other verified categories.',
      'If the gap is recurring and important causes are still unknown, use DMAIC to define, measure, analyze, improve, and control the process.',
      'Choose the smallest justified intervention, assign an owner, and define what result would count as improvement.',
      'Monitor the gauge long enough to know whether the intervention held.',
    ],
    escalateIf: [
      'The miss is large enough to threaten service commitments, budget expectations, or regional goals.',
      'The corrective action requires staffing, budget, policy, or capital decisions above your authority.',
      'The data suggests a compliance, safety, or systemic quality concern.',
      'The variance persists despite a controlled intervention.',
    ],
    window: 'Weekly report',
    scenario: 'Changed detail: utilization drops 15 points in a single week across many clients and the source data checks out. How should the regional leader hear about it?',
    choices: ['Wait for the normal weekly report because the playbook says weekly', 'Same day, with the verified size of the drop, what is currently known, what is not known, and the containment plan', 'Not at all until root cause is proven', 'Only after a DMAIC project is complete'],
    correct: 1,
    reasoning: 'The magnitude and speed changed the escalation threshold. Fewer surprises means surfacing a material verified change before the normal reporting cadence, while being explicit about what is not yet known.',
  },
];

const interviewQuestions: InterviewQuestion[] = [
  {
    id: 'experience',
    question: 'Talk to me about your experience.',
    testing: 'Whether you have a thesis about why your experience matters to this seat, rather than a chronological resume recital.',
    failure: 'Walking job-by-job through your history without connecting it to the operating problems this role owns.',
    note: 'Build around relevance: frontline system knowledge, operating exposure, what you have learned, and the gaps you are not pretending away.',
  },
  {
    id: 'team',
    question: "You've never managed anyone. Why should I give you a team?",
    testing: 'Self-assessment honesty, management judgment, and whether you understand that learning to manage is different from claiming you already have.',
    failure: 'Inflating mentoring, projects, or informal influence into management experience you did not actually have.',
  },
  {
    id: 'bcba',
    question: 'How do you hold a BCBA accountable when they used to supervise you?',
    testing: 'Whether you understand authority as standards-based and role-based rather than personal status.',
    failure: 'Generic statements about mutual respect without naming the standard, evidence, conversation, boundary, and escalation path.',
  },
  {
    id: 'wrong',
    question: 'Tell me about a time you were wrong.',
    testing: 'Whether you can take correction, revise your thinking, and avoid defending the old solution.',
    failure: 'Using the story to argue that leadership should have accepted the proposal anyway.',
    note: 'Use the documentation-incentive proposal as the event. The learning point is that you moved to a solution before establishing root cause; do not turn the answer into a verdict on leadership.',
  },
  {
    id: 'against',
    question: "What's the strongest argument against hiring me?",
    testing: 'Your willingness to surface the real risk in the room and learn how the interviewer sees it.',
    failure: 'Asking defensively, arguing with the answer, or using the question as a setup for self-promotion.',
    note: 'This is primarily a question for you to ask the interviewer. Draft how you will ask it cleanly, then practice listening without rebuttal.',
    askInterviewer: true,
  },
  {
    id: '90days',
    question: 'What would you do in your first 90 days?',
    testing: 'Restraint: whether you will learn the operating system before redesigning it.',
    failure: 'Arriving with a list of changes for a clinic you have not measured, mapped, or been accountable for yet.',
    note: 'A strong structure is measurement, relationships, operating cadence, process mapping, baseline confirmation, then only justified changes.',
  },
];

const restraints = [
  'Clinical protocols and case decisions',
  'The existing documentation enforcement approach',
  'Staffing model restructuring',
  'Compensation',
  'Anything requiring capital',
  'Any process not personally mapped',
];

const coverageCandidates = [
  { name: 'Taylor — Float', fit: ['Available', 'Full time match', 'Qualified', 'No client displaced', 'No OT flag'], viable: true },
  { name: 'Chris — Assigned', fit: ['Available', 'Qualified', 'Moving creates another gap'], viable: false },
  { name: 'Jamie — Late start', fit: ['Qualified', 'Available at 10:00', 'Time mismatch'], viable: false },
];

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
}

function pct(value: number) {
  return `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;
}

function safeNumber(value: string) {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function Page() {
  const [tab, setTab] = useState<Tab>('home');
  const [activeMachine, setActiveMachine] = useState<string>('Money');
  const [openResponsibility, setOpenResponsibility] = useState<number | null>(0);
  const [moneyInputs, setMoneyInputs] = useState<Record<MoneyKey, MoneyField>>(defaultMoney);
  const [gauges, setGauges] = useState<MonitorGauge[]>(defaultGauges);
  const [restraintChecks, setRestraintChecks] = useState<Record<string, boolean>>({});
  const [coveragePick, setCoveragePick] = useState<number | null>(null);
  const [playbookChoices, setPlaybookChoices] = useState<Record<string, number>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [timerQuestion, setTimerQuestion] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(90);
  const [coachQuestion, setCoachQuestion] = useState(interviewQuestions[0].question);
  const [coachAnswer, setCoachAnswer] = useState('');
  const [coachOutput, setCoachOutput] = useState<CoachOutput | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState('');

  useEffect(() => {
    try {
      const savedMoney = localStorage.getItem('doo.money.v2');
      const savedGauges = localStorage.getItem('doo.monitor.v2');
      const savedDrafts = localStorage.getItem('doo.interview.v2');
      const savedRestraints = localStorage.getItem('doo.restraints.v1');
      if (savedMoney) setMoneyInputs(JSON.parse(savedMoney));
      if (savedGauges) setGauges(JSON.parse(savedGauges));
      if (savedDrafts) setDrafts(JSON.parse(savedDrafts));
      if (savedRestraints) setRestraintChecks(JSON.parse(savedRestraints));
    } catch {
      // Local state is optional; malformed storage should never block interview prep.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('doo.money.v2', JSON.stringify(moneyInputs));
  }, [moneyInputs]);
  useEffect(() => {
    localStorage.setItem('doo.monitor.v2', JSON.stringify(gauges));
  }, [gauges]);
  useEffect(() => {
    localStorage.setItem('doo.interview.v2', JSON.stringify(drafts));
  }, [drafts]);
  useEffect(() => {
    localStorage.setItem('doo.restraints.v1', JSON.stringify(restraintChecks));
  }, [restraintChecks]);

  useEffect(() => {
    const utilizationGauge = gauges.find((g) => g.id === 'utilization');
    if (utilizationGauge?.state !== 'confirmed') return;
    const value = safeNumber(utilizationGauge.current);
    if (value === null) return;
    setMoneyInputs((current) => ({
      ...current,
      utilization: { ...current.utilization, value, state: 'confirmed' },
    }));
  }, [gauges]);

  useEffect(() => {
    if (!timerQuestion) return;
    if (seconds <= 0) return;
    const handle = window.setTimeout(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(handle);
  }, [timerQuestion, seconds]);

  const confirmedGaugeCount = useMemo(() => gauges.filter((g) => g.state === 'confirmed').length, [gauges]);

  const economics = useMemo(() => {
    const monthFactor = 4.33;
    const authorizedMonthly = Math.max(0, moneyInputs.authorizedHours.value) * monthFactor;
    const utilization = Math.max(0, Math.min(100, moneyInputs.utilization.value)) / 100;
    const deliveredMonthly = authorizedMonthly * utilization;
    const reimbursement = Math.max(0, moneyInputs.reimbursement.value);
    const loadedRbt = Math.max(0, moneyInputs.loadedRbtCost.value);
    const bcbaMonthly = Math.max(0, moneyInputs.bcbaCost.value) * Math.max(0, moneyInputs.bcbaCount.value);
    const revenue = deliveredMonthly * reimbursement;
    const rbtLabor = deliveredMonthly * loadedRbt;
    const directLabor = rbtLabor + bcbaMonthly;
    const contribution = revenue - directLabor;
    const contributionPct = revenue > 0 ? (contribution / revenue) * 100 : 0;
    const operatingContribution = contribution - Math.max(0, moneyInputs.fixedOverhead.value);
    const incrementalMarginPerHour = reimbursement - loadedRbt;
    const onePoint = authorizedMonthly * 0.01 * incrementalMarginPerHour;
    const budgetedRbts = Math.max(1, moneyInputs.rbtBudgeted.value);
    const vacancyBillableHours = (authorizedMonthly / budgetedRbts) * utilization;
    const vacancyCost = vacancyBillableHours * incrementalMarginPerHour;
    const cancellationCost = authorizedMonthly * 0.1 * incrementalMarginPerHour;
    const laborPerBillable = deliveredMonthly > 0 ? directLabor / deliveredMonthly : 0;
    return {
      revenue,
      directLabor,
      contribution,
      contributionPct,
      operatingContribution,
      onePoint,
      vacancyCost,
      cancellationCost,
      laborPerBillable,
      headcountGap: moneyInputs.rbtActual.value - moneyInputs.rbtBudgeted.value,
    };
  }, [moneyInputs]);

  const allMoneyConfirmed = Object.values(moneyInputs).every((field: MoneyField) => field.state === 'confirmed');

  function updateMoney(key: MoneyKey, patch: Partial<MoneyField>) {
    setMoneyInputs((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }

  function updateGauge(id: string, patch: Partial<MonitorGauge>) {
    setGauges((current) => current.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function startTimer(id: string) {
    setTimerQuestion(id);
    setSeconds(90);
  }

  async function runCoach() {
    if (!coachAnswer.trim()) {
      setCoachError('Write the answer you want challenged first.');
      return;
    }
    setCoachLoading(true);
    setCoachError('');
    setCoachOutput(null);
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: coachQuestion, answer: coachAnswer }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'The interviewer could not respond.');
      setCoachOutput(data);
    } catch (error) {
      setCoachError(error instanceof Error ? error.message : 'The interviewer could not respond.');
    } finally {
      setCoachLoading(false);
    }
  }

  function renderMoneyCalculator() {
    return (
      <div className="card moneyLab">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">Money machine · working model</div>
            <h2>Clinic unit economics</h2>
            <p className="muted">The point is not to memorize invented numbers. Change them, mark what is confirmed, and learn what each operating lever is worth.</p>
          </div>
          <span className={`statusBadge ${allMoneyConfirmed ? 'confirmed' : 'assumed'}`}>{allMoneyConfirmed ? 'All inputs confirmed' : 'Model contains assumptions'}</span>
        </div>

        <div className="moneyInputs">
          {(Object.keys(moneyInputs) as MoneyKey[]).map((key) => {
            const field = moneyInputs[key];
            return (
              <div className={`moneyInput ${field.state}`} key={key}>
                <label>{field.label}</label>
                <div className="inputLine">
                  <input
                    type="number"
                    step="any"
                    value={field.value}
                    onChange={(e) => updateMoney(key, { value: Number(e.target.value) })}
                    aria-label={field.label}
                  />
                  <span>{field.unit}</span>
                </div>
                <select value={field.state} onChange={(e) => updateMoney(key, { state: e.target.value as 'assumed' | 'confirmed' })}>
                  <option value="assumed">assumed</option>
                  <option value="confirmed">confirmed</option>
                </select>
              </div>
            );
          })}
        </div>

        <div className="metricGrid section">
          <div className="metric"><div className="detailLabel">Monthly revenue</div><div className="metricValue">{money(economics.revenue)}</div></div>
          <div className="metric"><div className="detailLabel">Direct labor</div><div className="metricValue">{money(economics.directLabor)}</div></div>
          <div className="metric"><div className="detailLabel">Contribution margin</div><div className="metricValue">{money(economics.contribution)}</div><div className="small muted">{pct(economics.contributionPct)}</div></div>
          <div className="metric"><div className="detailLabel">After fixed overhead</div><div className="metricValue">{money(economics.operatingContribution)}</div></div>
          <div className="metric emphasisMetric"><div className="detailLabel">1 utilization point / month</div><div className="metricValue">{money(economics.onePoint)}</div></div>
          <div className="metric"><div className="detailLabel">30-day RBT vacancy</div><div className="metricValue">{money(economics.vacancyCost)}</div><div className="small muted">Estimated lost billable contribution</div></div>
          <div className="metric"><div className="detailLabel">10% cancellation rate</div><div className="metricValue">{money(economics.cancellationCost)}</div><div className="small muted">Estimated lost billable contribution</div></div>
          <div className="metric"><div className="detailLabel">Labor cost / billable hr</div><div className="metricValue">{money(economics.laborPerBillable)}</div><div className="small muted">RBT + BCBA labor ÷ delivered hours</div></div>
        </div>

        <div className="speakLine">
          <strong>Say it out loud:</strong>{' '}
          {allMoneyConfirmed ? 'At this clinic' : 'At these currently entered inputs'}, one point of utilization is worth about <strong>{money(economics.onePoint)} per month</strong>.{' '}
          {allMoneyConfirmed ? '' : 'Until the inputs are confirmed, this is a model — not a claim about Katy.'}
        </div>
        <p className="small muted formulaNote">Model definitions: 4.33 weeks/month; contribution = revenue − RBT direct labor − BCBA monthly labor; vacancy and cancellation estimates use reimbursement less loaded RBT cost as incremental margin. Fixed overhead is shown separately so it is not mislabeled as variable contribution.</p>
      </div>
    );
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbarInner">
          <div className="brand"><span className="brandMark">DO</span><span>DOO Field Manual</span></div>
          <nav className="nav" aria-label="Field manual sections">
            {nav.map((item) => (
              <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>
            ))}
          </nav>
          <div className="confirmedHeader">{confirmedGaugeCount} of 13 confirmed</div>
        </div>
      </header>

      <main className="main">
        {tab === 'home' && (
          <>
            <section className="hero">
              <div className="card heroMain">
                <div className="eyebrow">Interview operating system</div>
                <h1>Learn the job by operating it.</h1>
                <p className="lead">The job description is the map. The playbooks remove avoidable thinking during routine events. The monitor tells you what is actually happening. Your interview job is to show judgment without pretending you already have experience you do not.</p>
                <div className="pillRow">
                  {workModes.map(([name]) => <span className="pill" key={name}>{name}</span>)}
                </div>
              </div>
              <div className="card">
                <div className="eyebrow">First principle</div>
                <h2>Do not change what you have not measured.</h2>
                <p className="muted">Your first advantage is not having a plan for everything. It is knowing what must be learned, what can be standardized, what needs monitoring, and what requires escalation.</p>
                <button className="btn btnPrimary" onClick={() => { setActiveMachine('Money'); document.getElementById('machine-lab')?.scrollIntoView({ behavior: 'smooth' }); }}>Open the Money machine</button>
              </div>
            </section>

            <section className="section">
              <div className="sectionHead"><div><div className="eyebrow">The six machines</div><h2>What a DOO keeps operating</h2></div><p className="muted">Choose one. The site should narrow your attention, not expand it.</p></div>
              <div className="grid6">
                {machines.map(([name, description]) => (
                  <button key={name} className={`machine machineButton ${activeMachine === name ? 'selectedMachine' : ''}`} onClick={() => setActiveMachine(name)}>
                    <strong>{name}</strong><span>{description}</span>
                  </button>
                ))}
              </div>
              <div className="card machineDecision" id="machine-lab">
                <div className="eyebrow">Selected machine</div>
                <h3>{activeMachine}</h3>
                <p className="muted">{machines.find(([name]) => name === activeMachine)?.[1]}</p>
                {activeMachine === 'Money' ? <p><strong>Your decision:</strong> Which inputs can you honestly mark confirmed today, and which must stay assumed until you get a source?</p> : <p><strong>Your decision:</strong> What is one recurring event, one required workflow, and one gauge you would expect inside this machine?</p>}
              </div>
            </section>

            <section className="section grid2">
              <div className="card restraintCard">
                <div className="eyebrow">Restraint layer</div>
                <h2>What I will not touch in the first 90 days</h2>
                <p className="muted">Check each item as a deliberate commitment. Safety, policy, or direct leadership instruction can override this list; impatience cannot.</p>
                <div className="stack">
                  {restraints.map((item) => (
                    <label className="restraintRow" key={item}>
                      <input type="checkbox" checked={!!restraintChecks[item]} onChange={(e) => setRestraintChecks((c) => ({ ...c, [item]: e.target.checked }))} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
                <div className="small muted">{Object.values(restraintChecks).filter(Boolean).length} of {restraints.length} deliberately acknowledged.</div>
              </div>
              <div className="card">
                <div className="eyebrow">How to classify work</div>
                <h2>Choose the management tool before the solution.</h2>
                <div className="stack">
                  {workModes.map(([name, description]) => <div className="detail" key={name}><div className="detailLabel">{name}</div>{description}</div>)}
                </div>
              </div>
            </section>

            <section className="section">{renderMoneyCalculator()}</section>
          </>
        )}

        {tab === 'manual' && (
          <section>
            <div className="sectionHead">
              <div><div className="eyebrow">JD → operating meaning</div><h1 className="darkTitle">Responsibility manual</h1><p className="muted">Open one responsibility at a time. Your goal is to be able to explain what you would watch, what you would do, and where your authority stops.</p></div>
            </div>
            <div className="stack">
              {responsibilities.map((r, index) => {
                const open = openResponsibility === index;
                return (
                  <div className="card jdCard" key={r.title}>
                    <div className="num">{String(index + 1).padStart(2, '0')}</div>
                    <div>
                      <h3>{r.title}</h3>
                      <p className="muted">{r.plain}</p>
                      {open && (
                        <div className="details">
                          <div className="detail"><div className="detailLabel">Success looks like</div>{r.success}</div>
                          <div className="detail"><div className="detailLabel">Systems / tools</div>{r.systems.map((x) => <span className="tag" key={x}>{x}</span>)}</div>
                          <div className="detail"><div className="detailLabel">Watch</div>{r.watch.map((x) => <span className="tag" key={x}>{x}</span>)}</div>
                          <div className="detail"><div className="detailLabel">Authority</div><span className={`tag ${r.authority === 'Own' ? 'own' : r.authority === 'Collaborate' ? 'collab' : r.authority === 'Escalate' ? 'escalate' : ''}`}>{r.authority}</span></div>
                          <div className="detail interviewAngle"><div className="detailLabel">Interview angle</div>{r.interview}</div>
                        </div>
                      )}
                    </div>
                    <button className="btn btnSecondary" onClick={() => setOpenResponsibility(open ? null : index)}>{open ? 'Close' : 'Work this responsibility'}</button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {tab === 'playbooks' && (
          <section>
            <div className="sectionHead"><div><div className="eyebrow">Known event → known response</div><h1 className="darkTitle">Playbook room</h1><p className="muted">The tree removes avoidable cognitive load. Director judgment appears at the tradeoffs and escalation point.</p></div></div>

            {playbooks.map((book) => {
              const selected = playbookChoices[book.id];
              return (
                <div className="card section" key={book.id}>
                  <div className="eyebrow">Trigger: {book.trigger}</div>
                  <h2>{book.title}</h2>
                  <p><strong>Objective:</strong> {book.objective}</p>
                  <div className="flowWrap">
                    <div className="flow">
                      {book.steps.map((step, i) => (
                        <div key={step} style={{ display: 'contents' }}>
                          <div className={`flowNode ${i === 0 ? 'alert' : i === book.steps.length - 1 ? 'success' : 'action'}`}>{step}</div>
                          {i < book.steps.length - 1 && <div className="flowArrow">→</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid2 section">
                    <div className="detail escalationBox"><div className="detailLabel">Escalate if</div><ul>{book.escalateIf.map((item) => <li key={item}>{item}</li>)}</ul></div>
                    <div className="detail"><div className="detailLabel">Tell your manager within</div><div className="notificationWindow">{book.window}</div><p className="small muted">The point of the seat is not zero problems. It is fewer surprises and better judgment about which problems need regional visibility.</p></div>
                  </div>
                  <div className="decisionBox section">
                    <div className="detailLabel">Escalation rep — one detail changed</div>
                    <h3>{book.scenario}</h3>
                    {book.choices.map((choice, idx) => (
                      <button key={choice} className={`quizOption ${selected === idx ? (idx === book.correct ? 'correct' : 'wrong') : ''}`} onClick={() => setPlaybookChoices((c) => ({ ...c, [book.id]: idx }))}>{choice}</button>
                    ))}
                    {selected !== undefined && <div className="answerBox section"><strong>Reasoning:</strong> {book.reasoning}</div>}
                  </div>
                </div>
              );
            })}

            <div className="card section">
              <div className="eyebrow">Coverage command</div>
              <h2>Who gets the uncovered client?</h2>
              <p className="muted">This is the 7:10 AM callout translated into a staffing decision. Pick a person, then inspect the consequence.</p>
              <div className="simGrid">
                <div className="detail"><div className="detailLabel">At-risk service</div><h3>Client B · 8:30 AM–12:30 PM</h3><p>Four planned service hours need coverage.</p></div>
                <div>
                  {coverageCandidates.map((person, idx) => (
                    <button className={`person coveragePerson ${coveragePick === idx ? (person.viable ? 'best' : 'badPick') : ''}`} key={person.name} onClick={() => setCoveragePick(idx)}>
                      <strong>{person.name}</strong>
                      <div className="checks">{person.fit.map((check) => <span key={check} className={`check ${check.includes('gap') || check.includes('mismatch') ? 'no' : ''}`}>{check}</span>)}</div>
                    </button>
                  ))}
                </div>
              </div>
              {coveragePick !== null && <div className="answerBox section">{coverageCandidates[coveragePick].viable ? 'Best current match: this option preserves the session without displacing another client or creating an obvious labor problem. You would still confirm any client-specific clinical requirement before finalizing.' : 'This choice solves one problem by creating another constraint. Go back through availability, time fit, qualification, client impact, and labor implications.'}</div>}
            </div>
          </section>
        )}

        {tab === 'monitor' && (
          <section>
            <div className="monitorSticky">
              <div><div className="eyebrow">Katy baseline sheet</div><h1 className="darkTitle">Monitor</h1></div>
              <div className="confirmedCount">{confirmedGaugeCount} of 13 confirmed</div>
            </div>
            <p className="muted">Do not fill blanks with guesses. “Not yet tracked” is a valid finding. A confirmed metric requires a value and a source you would be willing to name in the interview.</p>
            <div className="stack">
              {gauges.map((gauge) => (
                <div className={`card gaugeRow ${gauge.state}`} key={gauge.id}>
                  <div className="gaugeName"><span className="tag">{gauge.machine}</span><strong>{gauge.label}</strong></div>
                  <label>Current<input value={gauge.current} onChange={(e) => updateGauge(gauge.id, { current: e.target.value })} placeholder="value" /></label>
                  <label>Target<input value={gauge.target} onChange={(e) => updateGauge(gauge.id, { target: e.target.value })} placeholder="target" /></label>
                  <label>Source<input value={gauge.source} onChange={(e) => updateGauge(gauge.id, { source: e.target.value })} placeholder="report / person / system" /></label>
                  <label>State<select value={gauge.state} onChange={(e) => updateGauge(gauge.id, { state: e.target.value as ConfirmState })}><option value="not-yet-tracked">not yet tracked</option><option value="assumed">assumed</option><option value="confirmed">confirmed</option></select></label>
                </div>
              ))}
            </div>
            <div className="card section">
              <div className="detailLabel">Decision rule</div>
              <p><strong>Confirmed does not mean good.</strong> It only means you know the current value and source. Once confirmed, compare current to target and decide whether the result is normal variation, a contained event, or a meaningful gap that deserves investigation.</p>
              <button className="btn btnPrimary" onClick={() => { setTab('home'); setActiveMachine('Money'); }}>Use confirmed overlap in Money calculator</button>
            </div>
          </section>
        )}

        {tab === 'interview' && (
          <section>
            <div className="sectionHead"><div><div className="eyebrow">90-second reps</div><h1 className="darkTitle">Interview Room</h1><p className="muted">Draft your own answer. The site gives you the test and the failure mode, not a script.</p></div><div className={`timer ${seconds <= 15 && timerQuestion ? 'timerHot' : ''}`}>{timerQuestion ? `${seconds}s` : '90s'}</div></div>
            <div className="stack">
              {interviewQuestions.map((q) => (
                <div className="card interviewQ" key={q.id}>
                  <div className="pillRow"><span className="pill">{q.askInterviewer ? 'Question to ask' : 'Question to answer'}</span>{timerQuestion === q.id && <span className="pill">Timer active</span>}</div>
                  <h2>{q.question}</h2>
                  <div className="grid2">
                    <div className="detail"><div className="detailLabel">What they are really testing</div>{q.testing}</div>
                    <div className="detail"><div className="detailLabel">Failure mode</div>{q.failure}</div>
                  </div>
                  {q.note && <div className="answerBox section"><strong>Constraint:</strong> {q.note}</div>}
                  <label className="draftLabel">Your draft<textarea value={drafts[q.id] || ''} onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))} placeholder={q.askInterviewer ? 'Draft exactly how you will ask this, then stop talking.' : 'Draft your answer in your own words. Aim for a thesis, evidence, and a clean stop.'} /></label>
                  <div className="buttonRow"><button className="btn btnPrimary" onClick={() => startTimer(q.id)}>Start 90-second rep</button><button className="btn btnGhost" onClick={() => { setCoachQuestion(q.question); setCoachAnswer(drafts[q.id] || ''); setTab('study'); }}>Send this answer to skeptical interviewer</button></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'study' && (
          <section>
            <div className="sectionHead"><div><div className="eyebrow">One hard pushback per rep</div><h1 className="darkTitle">AI Study Coach</h1><p className="muted">This is not a tutor. It is a skeptical regional executive director testing whether your answer is supported, quantified, and operationally specific.</p></div></div>
            <div className="card aiBox">
              <label>Interview question<select value={coachQuestion} onChange={(e) => setCoachQuestion(e.target.value)}>{interviewQuestions.filter((q) => !q.askInterviewer).map((q) => <option key={q.id} value={q.question}>{q.question}</option>)}</select></label>
              <label className="draftLabel">Your answer<textarea value={coachAnswer} onChange={(e) => setCoachAnswer(e.target.value)} placeholder="Answer as if you were sitting across from the Regional Executive Director." /></label>
              <button className="btn btnPrimary" disabled={coachLoading} onClick={runCoach}>{coachLoading ? 'Pressing the answer…' : 'Give me one hard pushback'}</button>
              {coachError && <div className="answerBox section">{coachError}</div>}
              {coachOutput && (
                <div className="coachGrid section">
                  <div className="aiOutput"><div className="detailLabel">Pushback</div>{coachOutput.pushback}</div>
                  <div className="aiOutput"><div className="detailLabel">Unsupported assumption</div>{coachOutput.unsupportedAssumption}</div>
                  <div className="aiOutput"><div className="detailLabel">Number missing</div>{coachOutput.missingNumber}</div>
                  <div className="aiOutput"><div className="detailLabel">Method challenge</div>{coachOutput.methodChallenge}</div>
                </div>
              )}
            </div>
            <div className="card section">
              <div className="detailLabel">The rule</div>
              <p>If your answer says “I’d look into it,” the next sentence must say <strong>how</strong>: what data, what source, what comparison, who you would involve, and what would change your decision.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
