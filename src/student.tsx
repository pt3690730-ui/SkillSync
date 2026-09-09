import { useMemo, useState, type FormEvent } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutGrid,
  MessageSquare,
  Plus,
  Route,
  Sparkles,
  Store,
  Trophy,
  User,
  Video,
  X,
} from "lucide-react";
import { useApp, ASSESSMENT_QUESTIONS, BADGES } from "./store";
import {
  Avatar,
  Button,
  Card,
  cx,
  Field,
  Modal,
  OverflowMenu,
  ProgressBar,
  SearchInput,
  Select,
  StatCard,
  Tag,
  TextInput,
  Textarea,
  useInView,
} from "./ui";
import { DashboardShell, type NavItem } from "./shell";
import { ReportModal, RequestSessionModal } from "./modals";
import { MarketplaceView, SessionsView, MessagesView, StudioView, AchievementsView } from "./student2";

export const STUDENT_NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "skills", label: "My Skills", icon: Sparkles },
  { id: "marketplace", label: "Skill Marketplace", icon: Store },
  { id: "sessions", label: "Sessions & Scheduling", icon: CalendarDays },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "studio", label: "Virtual Studio", icon: Video },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
];

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

function TagGroup({
  title,
  subtitle,
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  title: string;
  subtitle: string;
  tags: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder: string;
}) {
  const [val, setVal] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (val.trim()) {
      onAdd(val.trim());
      setVal("");
    }
  };
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-[13px] font-semibold text-ink">{title}</div>
        <div className="text-[11px] text-faint">{subtitle}</div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <Tag key={t} tone={title.startsWith("Skills I Teach") ? "teal" : "indigo"} className="group pr-1.5">
            {t}
            <button
              onClick={() => onRemove(t)}
              className="ml-1 rounded-full p-0.5 text-current opacity-40 transition-opacity hover:opacity-100"
              aria-label={`Remove ${t}`}
            >
              <X size={11} />
            </button>
          </Tag>
        ))}
        {tags.length === 0 && <span className="text-xs text-faint">Nothing yet — add one below.</span>}
      </div>
      <form onSubmit={submit} className="mt-2.5 flex gap-2">
        <TextInput value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder} className="py-1.5 text-[13px]" />
        <Button type="submit" size="sm" variant="outline">
          <Plus size={13} />
          Add
        </Button>
      </form>
    </div>
  );
}

function OverviewView({ onGo }: { onGo: (v: string) => void }) {
  const { state, currentUser, addTeachSkill, removeTeachSkill, addLearnSkill, removeLearnSkill, getUser } = useApp();
  const [reqOpen, setReqOpen] = useState(false);
  if (!currentUser) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const pending = state.sessions.filter((s) => s.kind === "pending" || s.kind === "requested");
  const upcoming = state.sessions.filter((s) => s.kind === "confirmed");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[30px] leading-tight tracking-[-0.02em] text-ink">
            {greeting}, {currentUser.name.split(" ")[0]}
          </h2>
          <p className="mt-1 text-sm text-muted">Here's where your skills stand today.</p>
        </div>
        <Button onClick={() => setReqOpen(true)}>
          <Plus size={15} />
          Request a session
        </Button>
      </div>

      {/* profile card */}
      <Card className="p-6 sm:p-7">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="flex items-start gap-4 lg:col-span-4">
            <Avatar name={currentUser.name} size="xl" />
            <div>
              <div className="font-display text-xl text-ink">{currentUser.name}</div>
              <div className="mt-0.5 text-[13px] text-muted">{currentUser.school}</div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Profile strength</span>
                  <span className="font-semibold text-ink">{state.profileCompletion}%</span>
                </div>
                <ProgressBar value={state.profileCompletion} className="mt-1.5" />
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
            <TagGroup
              title="Skills I Teach"
              subtitle={`${state.teachSkills.length} active`}
              tags={state.teachSkills}
              onAdd={addTeachSkill}
              onRemove={removeTeachSkill}
              placeholder="e.g. Java"
            />
            <TagGroup
              title="Skills I Want to Learn"
              subtitle={`${state.learnSkills.length} active`}
              tags={state.learnSkills}
              onAdd={addLearnSkill}
              onRemove={removeLearnSkill}
              placeholder="e.g. Tableau"
            />
          </div>
        </div>
      </Card>

      {/* stats */}
      <Card className="grid grid-cols-2 divide-hairline sm:grid-cols-4 sm:divide-x">
        <StatCard label="Skills" value={state.teachSkills.length + state.learnSkills.length} sub="on your graph" icon={<Sparkles size={15} />} />
        <StatCard label="Skill Matches" value={state.matches.length} sub="ready to connect" icon={<Award size={15} />} tone="primary" />
        <StatCard label="Internship Matches" value={state.internships.length} sub="ranked for you" icon={<BriefcaseIcon />} tone="teal" />
        <StatCard label="Pending Requests" value={pending.length} sub="awaiting reply" icon={<CalendarDays size={15} />} tone="amber" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* upcoming */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">Upcoming this week</h3>
            <button onClick={() => onGo("sessions")} className="link-quiet text-[13px] font-medium text-ink">
              View calendar
            </button>
          </div>
          <div className="mt-4 space-y-2.5">
            {upcoming.length === 0 && <p className="text-sm text-faint">Nothing scheduled — request a session to fill the week.</p>}
            {upcoming.map((s) => {
              const peer = getUser(s.peerId);
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-hairline bg-paper px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <CalendarDays size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-ink">
                      {s.skill} with {peer?.name.split(" ")[0] ?? "peer"}
                    </div>
                    <div className="text-xs text-faint">
                      {s.day} at {s.time}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onGo("studio")}>
                    Join
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* pending requests */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">Pending requests</h3>
            <span className="text-xs text-faint">{pending.length} open</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {pending.length === 0 && <p className="text-sm text-faint">No pending requests.</p>}
            {pending.map((s) => {
              const peer = getUser(s.peerId);
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-hairline bg-paper px-4 py-3">
                  <Avatar name={peer?.name ?? "?"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-ink">
                      {s.kind === "requested" ? "You asked" : "Asked you"}: {s.skill}
                    </div>
                    <div className="text-xs text-faint">
                      {peer?.name}, {s.day} at {s.time}
                    </div>
                  </div>
                  <Tag tone={s.kind === "requested" ? "amber" : "indigo"}>{s.kind === "requested" ? "Waiting" : "Needs reply"}</Tag>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <RequestSessionModal open={reqOpen} onClose={() => setReqOpen(false)} />
    </div>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Skills — assessment + roadmap                                       */
/* ------------------------------------------------------------------ */

function AssessmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, submitAssessment } = useApp();
  const [answers, setAnswers] = useState<(number | null)[]>(ASSESSMENT_QUESTIONS.map(() => null));
  const all = answers.every((a) => a !== null);
  const submit = () => {
    submitAssessment(answers as number[]);
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Skill assessment"
      wide
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!all}>
            Submit answers
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-muted">
          Five quick questions. Your score places you at Beginner, Intermediate, or Advanced — and updates the
          badge shelf.
        </p>
        {ASSESSMENT_QUESTIONS.map((q, qi) => (
          <div key={qi} className="rounded-xl border border-hairline bg-paper p-4">
            <div className="text-[13px] font-semibold text-ink">
              {qi + 1}. {q.q}
            </div>
            <div className="mt-3 grid gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                    className={cx(
                      "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[13px] transition-all",
                      selected ? "border-primary/50 bg-primary-soft text-primary-deep" : "border-hairline bg-card text-ink hover:border-ink/25",
                    )}
                  >
                    <span
                      className={cx(
                        "flex h-4 w-4 items-center justify-center rounded-full border",
                        selected ? "border-primary bg-primary" : "border-hairline",
                      )}
                    >
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function RoadmapCard() {
  const { state, generateRoadmap } = useApp();
  const [custom, setCustom] = useState("");
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });

  const generate = (skill: string) => {
    if (!skill.trim()) return;
    generateRoadmap(skill.trim());
    setCustom("");
  };


  return (
    <Card className="p-6 sm:p-7" tone="tint">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
            <Route size={15} className="text-primary" />
            AI Learning Roadmap
          </div>
          <h3 className="mt-2 font-display text-[22px] tracking-[-0.02em] text-ink">
            {state.roadmap.target || "Pick a target skill"}
          </h3>
        </div>
        <div className="flex w-full max-w-xs gap-2">
          <Select value="" onChange={(e) => e.target.value && generate(e.target.value)} className="text-[13px]">
            <option value="">Generate for…</option>
            {state.learnSkills.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              generate(custom);
            }}
            className="flex flex-1 gap-2"
          >
            <TextInput value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Custom skill" className="py-1.5 text-[13px]" />
            <Button type="submit" size="sm" variant="outline">
              Go
            </Button>
          </form>
        </div>
      </div>

      <div ref={ref} className="mt-6">
        {state.roadmap.steps.length === 0 ? (
          <p className="text-sm text-faint">Choose a skill to see a generated step timeline.</p>
        ) : (
          <ol className="space-y-0">
            {state.roadmap.steps.map((s, i) => (
              <li key={s.n} className="relative flex gap-4 pb-5 last:pb-0">
                {i < state.roadmap.steps.length - 1 && (
                  <span className={cx("absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px", s.status === "done" ? "bg-primary/40" : "bg-hairline")} />
                )}
                <span
                  className={cx(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-semibold",
                    s.status === "done"
                      ? "bg-primary text-white"
                      : s.status === "doing"
                        ? "border-2 border-primary bg-primary-soft text-primary"
                        : "border border-hairline bg-card text-faint",
                  )}
                >
                  {s.n}
                </span>
                <div className="pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cx("text-sm font-semibold", s.status === "todo" ? "text-ink/60" : "text-ink")}>{s.title}</span>
                    <Tag tone={s.status === "done" ? "teal" : s.status === "doing" ? "indigo" : "muted"}>
                      {s.status === "done" ? "done" : s.status === "doing" ? "in progress" : s.duration}
                    </Tag>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  );
}

function SkillsView() {
  const { state, addTeachSkill, removeTeachSkill, addLearnSkill, removeLearnSkill } = useApp();
  const [assessOpen, setAssessOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <TagGroup
            title="Skills I Teach"
            subtitle="peers can request these"
            tags={state.teachSkills}
            onAdd={addTeachSkill}
            onRemove={removeTeachSkill}
            placeholder="Add a skill you can teach"
          />
        </Card>
        <Card className="p-6">
          <TagGroup
            title="Skills I Want to Learn"
            subtitle="drives your matches"
            tags={state.learnSkills}
            onAdd={addLearnSkill}
            onRemove={removeLearnSkill}
            placeholder="Add a skill you want to learn"
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col justify-between p-6 sm:p-7">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
              <BookOpen size={15} className="text-primary" />
              Skill assessment
            </div>
            <h3 className="mt-2 font-display text-[22px] tracking-[-0.02em] text-ink">
              {state.assessment.taken ? `Level: ${state.assessment.level}` : "Where do you actually stand?"}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              {state.assessment.taken
                ? `You scored ${state.assessment.score}% on the last assessment.`
                : "A five-question check that places your skill level and lights up the Skill Expert badge."}
            </p>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <Button variant="outline" onClick={() => setAssessOpen(true)}>
              {state.assessment.taken ? "Retake assessment" : "Take assessment"}
            </Button>
            {state.assessment.level && (
              <Tag tone={state.assessment.level === "Advanced" ? "teal" : state.assessment.level === "Intermediate" ? "indigo" : "amber"}>
                {state.assessment.level}
              </Tag>
            )}
          </div>
        </Card>
        <Card className="flex flex-col justify-between p-6 sm:p-7">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
              <Award size={15} className="text-primary" />
              Badge shelf
            </div>
            <h3 className="mt-2 font-display text-[22px] tracking-[-0.02em] text-ink">
              {BADGES.filter((b) => b.earned(state)).length} of {BADGES.length} badges earned
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Badges are earned by real actions — sessions, ratings, and assessments.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {BADGES.filter((b) => b.earned(state)).map((b) => (
              <Tag key={b.id} tone="teal">
                {b.name}
              </Tag>
            ))}
            {BADGES.filter((b) => !b.earned(state)).map((b) => (
              <Tag key={b.id} tone="muted">
                {b.name}
              </Tag>
            ))}
          </div>
        </Card>
      </div>

      <RoadmapCard />
      <AssessmentModal open={assessOpen} onClose={() => setAssessOpen(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

function ProfileView() {
  const { state, currentUser } = useApp();
  if (!currentUser) return null;
  const checklist = [
    { label: "Add 3+ teach skills", ok: state.teachSkills.length >= 3 },
    { label: "Add a learn skill", ok: state.learnSkills.length >= 1 },
    { label: "Complete an assessment", ok: state.assessment.taken },
    { label: "Finish 5 sessions", ok: state.sessions.filter((s) => s.kind === "completed").length >= 5 },
    { label: "Reach 500 XP", ok: currentUser.xp >= 500 },
  ];
  const done = checklist.filter((c) => c.ok).length;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="p-7 lg:col-span-7">
        <div className="flex items-start gap-5">
          <Avatar name={currentUser.name} size="xl" />
          <div>
            <div className="font-display text-2xl text-ink">{currentUser.name}</div>
            <div className="mt-0.5 text-sm text-muted">{currentUser.school}</div>
            <div className="mt-1 text-[13px] text-faint">{currentUser.email}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Tag tone="indigo">Student</Tag>
              <Tag tone="default">Member since {currentUser.joined}</Tag>
            </div>
          </div>
        </div>
        <div className="mt-7 border-t border-hairline pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">Profile strength</span>
            <span className="font-display text-lg text-primary">{state.profileCompletion}%</span>
          </div>
          <ProgressBar value={state.profileCompletion} className="mt-2" />
          <p className="mt-2 text-[13px] text-faint">Add skills and activity to push this higher — it also raises your match accuracy.</p>
        </div>
      </Card>

      <Card className="p-7 lg:col-span-5">
        <h3 className="text-[15px] font-semibold text-ink">Completion checklist</h3>
        <div className="mt-4 space-y-3">
          {checklist.map((c) => (
            <div key={c.label} className="flex items-center justify-between text-sm">
              <span className={c.ok ? "text-ink" : "text-muted"}>{c.label}</span>
              <span className={cx("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold", c.ok ? "bg-teal-soft text-teal" : "border border-hairline text-faint")}>
                {c.ok ? "✓" : `${done}/${checklist.length}`}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Student dashboard shell                                             */
/* ------------------------------------------------------------------ */

export default function StudentDashboard() {
  const [view, setView] = useState("overview");
  const title = STUDENT_NAV.find((n) => n.id === view)?.label ?? "Overview";

  return (
    <DashboardShell nav={STUDENT_NAV} active={view} onSelect={setView} title={title}>
      {view === "overview" && <OverviewView onGo={setView} />}
      {view === "skills" && <SkillsView />}
      {view === "marketplace" && <MarketplaceView onGo={setView} />}
      {view === "sessions" && <SessionsView onGo={setView} />}
      {view === "messages" && <MessagesView />}
      {view === "studio" && <StudioView />}
      {view === "achievements" && <AchievementsView onGo={setView} />}
      {view === "profile" && <ProfileView />}
    </DashboardShell>
  );
}
