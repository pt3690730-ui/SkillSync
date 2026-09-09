import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Briefcase,
  Check,
  FileText,
  Gavel,
  LayoutGrid,
  LineChart,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useApp } from "./store";
import {
  Avatar,
  Button,
  Card,
  cx,
  EmptyState,
  Modal,
  SearchInput,
  SectionHeading,
  StatCard,
  Tag,
} from "./ui";
import { DashboardShell, type NavItem } from "./shell";

export const ADMIN_NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "intelligence", label: "Skill Intelligence", icon: BarChart3 },
  { id: "internships", label: "Internship Tracking", icon: Briefcase },
  { id: "insights", label: "Student Insights", icon: LineChart },
  { id: "reports", label: "Violation Management", icon: ShieldAlert },
  { id: "users", label: "User Management", icon: Users },
];

/* ------------------------------------------------------------------ */
/* Chart primitives (pure Tailwind)                                    */
/* ------------------------------------------------------------------ */

function HBar({ label, value, max, tone = "primary", delay = 0 }: { label: string; value: number; max: number; tone?: "primary" | "teal" | "amber" | "danger"; delay?: number }) {
  const fill = tone === "primary" ? "bg-primary" : tone === "teal" ? "bg-teal" : tone === "amber" ? "bg-amber" : "bg-danger";
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-muted">{label}</span>
        <span className="font-semibold text-ink">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/6">
        <div
          className={cx("anim-grow-y h-full rounded-full", fill)}
          style={{ width: `${(value / max) * 100}%`, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

function VBarChart({
  data,
  height = 140,
  tone,
}: {
  data: { label: string; a: number; b?: number }[];
  height?: number;
  tone?: [string, string];
}) {
  const max = Math.max(...data.map((d) => Math.max(d.a, d.b ?? 0)), 1);
  const tones = tone ?? ["bg-primary", "bg-teal"];
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1.5">
          <div className="flex w-full max-w-9 items-end justify-center gap-1">
            <div
              className={cx("anim-grow-y w-3 rounded-t-sm sm:w-3.5", tones[0])}
              style={{ height: `${(d.a / max) * (height - 26)}px`, animationDelay: `${i * 45}ms` }}
            />
            {d.b !== undefined && (
              <div
                className={cx("anim-grow-y w-3 rounded-t-sm sm:w-3.5", tones[1])}
                style={{ height: `${(d.b / max) * (height - 26)}px`, animationDelay: `${i * 45 + 120}ms` }}
              />
            )}
          </div>
          <span className="text-[10px] text-faint">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Static chart data                                                   */
/* ------------------------------------------------------------------ */

const SKILL_GAPS = [
  { skill: "Cloud (AWS)", gap: 34 },
  { skill: "UI Design", gap: 28 },
  { skill: "Data Analysis", gap: 22 },
  { skill: "Public Speaking", gap: 16 },
  { skill: "Machine Learning", gap: 12 },
];

const SUPPLY_DEMAND = [
  { label: "Python", a: 320, b: 210 },
  { label: "UI Design", a: 240, b: 92 },
  { label: "Cloud", a: 210, b: 64 },
  { label: "SQL", a: 180, b: 152 },
  { label: "Product", a: 126, b: 88 },
  { label: "Spanish", a: 92, b: 31 },
];

const DISTRIBUTION = [
  { label: "Technical", pct: 46, cls: "bg-primary" },
  { label: "Business", pct: 31, cls: "bg-teal" },
  { label: "Creative", pct: 23, cls: "bg-amber" },
];

const MOST_REQUESTED = [
  { skill: "Cloud (AWS)", n: 342 },
  { skill: "UI Design", n: 298 },
  { skill: "Data Analysis", n: 251 },
  { skill: "Machine Learning", n: 204 },
  { skill: "Public Speaking", n: 161 },
];

const MOST_OFFERED = [
  { skill: "Python", n: 318 },
  { skill: "SQL", n: 232 },
  { skill: "Data Structures", n: 197 },
  { skill: "Excel", n: 154 },
  { skill: "React", n: 128 },
];

const SESSION_VOLUME = [
  { label: "W1", a: 42 },
  { label: "W2", a: 55 },
  { label: "W3", a: 49 },
  { label: "W4", a: 67 },
  { label: "W5", a: 61 },
  { label: "W6", a: 78 },
  { label: "W7", a: 86 },
  { label: "W8", a: 94 },
];

const REG_TREND = [
  { label: "Sep", a: 210 },
  { label: "Oct", a: 265 },
  { label: "Nov", a: 240 },
  { label: "Dec", a: 310 },
  { label: "Jan", a: 402 },
  { label: "Feb", a: 470 },
  { label: "Mar", a: 520 },
  { label: "Apr", a: 615 },
  { label: "May", a: 590 },
  { label: "Jun", a: 640 },
  { label: "Jul", a: 720 },
  { label: "Aug", a: 810 },
];

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

function AdminOverview() {
  const { state } = useApp();
  const students = state.users.filter((u) => u.role === "student" && u.status === "active").length;
  const activeInternships = state.requirements.filter((r) => r.status !== "Closed").length;
  const reportsOpen = state.reports.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-8">
      <Card className="grid grid-cols-2 divide-hairline sm:grid-cols-4 sm:divide-x">
        <StatCard label="Students" value={students} sub="active on the graph" icon={<Users size={15} />} />
        <StatCard label="Skills Tracked" value="1,284" sub="across all campuses" icon={<Activity size={15} />} tone="primary" />
        <StatCard label="Active Internships" value={activeInternships} sub="open right now" icon={<Briefcase size={15} />} tone="teal" />
        <StatCard label="Avg Skill Coverage" value="68%" sub="per student profile" icon={<BarChart3 size={15} />} tone="amber" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="p-6 lg:col-span-5">
          <h3 className="text-[15px] font-semibold text-ink">Session volume</h3>
          <p className="text-xs text-faint">Peer sessions per week, last 8 weeks</p>
          <div className="mt-5">
            <VBarChart data={SESSION_VOLUME} tone={["bg-primary", "bg-primary"]} />
          </div>
        </Card>
        <Card className="p-6 lg:col-span-7">
          <h3 className="text-[15px] font-semibold text-ink">Registrations</h3>
          <p className="text-xs text-faint">New students per month, last 12 months</p>
          <div className="mt-5">
            <VBarChart data={REG_TREND} tone={["bg-teal", "bg-teal"]} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">Moderation queue</h3>
            <Tag tone="danger">{reportsOpen} open</Tag>
          </div>
          <div className="mt-4 space-y-2.5">
            {state.reports.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-hairline bg-paper px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-soft text-danger">
                  <ShieldAlert size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-ink">
                    {r.reportedName}, {r.violation}
                  </div>
                  <div className="text-xs text-faint">
                    strike {Math.min(r.strikes + 1, 3)}/3, {r.snippet.slice(0, 46)}…
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Campus snapshot</h3>
          <p className="text-xs text-faint">Skill distribution across active students</p>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
            {DISTRIBUTION.map((d) => (
              <div key={d.label} className={d.cls} style={{ width: `${d.pct}%` }} />
            ))}
          </div>
          <div className="mt-4 space-y-2.5">
            {DISTRIBUTION.map((d) => (
              <div key={d.label} className="flex items-center gap-2.5 text-sm">
                <span className={cx("h-2.5 w-2.5 rounded-full", d.cls)} />
                <span className="flex-1 text-muted">{d.label}</span>
                <span className="font-semibold text-ink">{d.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skill intelligence                                                  */
/* ------------------------------------------------------------------ */

function SkillIntelligence() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="p-6 lg:col-span-5">
          <h3 className="text-[15px] font-semibold text-ink">Top skill gaps</h3>
          <p className="text-xs text-faint">Demand with no matching supply on campus</p>
          <div className="mt-5 space-y-4">
            {SKILL_GAPS.map((g, i) => (
              <HBar key={g.skill} label={g.skill} value={g.gap} max={SKILL_GAPS[0].gap} tone="amber" delay={i * 70} />
            ))}
          </div>
          <p className="mt-5 rounded-xl bg-amber-soft px-4 py-3 text-[13px] leading-relaxed text-[#A96A12]">
            Cloud and UI Design are the two gaps worth funding first — each maps to real internship demand.
          </p>
        </Card>

        <Card className="p-6 lg:col-span-7">
          <h3 className="text-[15px] font-semibold text-ink">Supply vs demand</h3>
          <p className="text-xs text-faint">Indigo is demand, teal is verified supply</p>
          <div className="mt-6">
            <VBarChart data={SUPPLY_DEMAND} height={190} tone={["bg-primary", "bg-teal"]} />
          </div>
          <div className="mt-5 flex items-center gap-5 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Demand
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-teal" /> Supply
            </span>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Most requested</h3>
          <p className="text-xs text-faint">Skills students want to learn, ranked</p>
          <div className="mt-4 space-y-2.5">
            {MOST_REQUESTED.map((s, i) => (
              <div key={s.skill} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft font-display text-[12px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="flex-1 text-ink">{s.skill}</span>
                <span className="font-semibold text-ink">{s.n}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Most offered</h3>
          <p className="text-xs text-faint">Skills students are verified to teach</p>
          <div className="mt-4 space-y-2.5">
            {MOST_OFFERED.map((s, i) => (
              <div key={s.skill} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-soft font-display text-[12px] font-semibold text-teal">
                  {i + 1}
                </span>
                <span className="flex-1 text-ink">{s.skill}</span>
                <span className="font-semibold text-ink">{s.n}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Internship tracking                                                 */
/* ------------------------------------------------------------------ */

function InternshipTracking() {
  const { state, getUser } = useApp();
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">Internship pipeline</h3>
          <p className="text-xs text-faint">Every posted requirement and its live status</p>
        </div>
        <Tag tone="teal">{state.requirements.filter((r) => r.status !== "Closed").length} active</Tag>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-wider text-faint">
            <th className="px-6 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Skills</th>
            <th className="px-4 py-3 text-right font-medium">Applicants</th>
            <th className="px-4 py-3 text-right font-medium">Best match</th>
            <th className="px-6 py-3 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {state.requirements.map((r) => {
            const best = [...r.applicants].sort((a, b) => b.match - a.match)[0];
            const bestUser = best ? getUser(best.userId) : undefined;
            return (
              <tr key={r.id} className="border-b border-hairline/60 last:border-0">
                <td className="px-6 py-3.5 font-medium text-ink">{r.company}</td>
                <td className="px-4 py-3.5 text-muted">{r.title}</td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {r.skills.slice(0, 2).map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right text-ink">{r.applicants.length}</td>
                <td className="px-4 py-3.5 text-right">
                  {best ? (
                    <span className="font-semibold text-teal">
                      {best.match}% <span className="text-xs font-normal text-faint">({bestUser?.name.split(" ")[0]})</span>
                    </span>
                  ) : (
                    <span className="text-faint">0</span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <Tag tone={r.status === "Open" ? "teal" : r.status === "Shortlisting" ? "amber" : "muted"}>{r.status}</Tag>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Student insights                                                    */
/* ------------------------------------------------------------------ */

function StudentInsights() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Popular skills</h3>
          <p className="text-xs text-faint">Most-verified skill tags this term</p>
          <div className="mt-5 space-y-4">
            {MOST_OFFERED.map((s, i) => (
              <HBar key={s.skill} label={s.skill} value={Math.round((s.n / MOST_OFFERED[0].n) * 100)} max={100} tone="primary" delay={i * 70} />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Weekly session volume</h3>
          <p className="text-xs text-faint">Sessions completed per week</p>
          <div className="mt-6">
            <VBarChart data={SESSION_VOLUME} tone={["bg-primary", "bg-primary"]} />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-primary-soft px-4 py-3 text-sm">
            <span className="text-muted">Up 27% from 8 weeks ago</span>
            <span className="font-semibold text-primary">+27%</span>
          </div>
        </Card>
      </div>
      <Card className="p-6">
        <h3 className="text-[15px] font-semibold text-ink">Registration trend</h3>
        <p className="text-xs text-faint">New student registrations per month</p>
        <div className="mt-6">
          <VBarChart data={REG_TREND} height={170} tone={["bg-teal", "bg-teal"]} />
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Violation management                                                */
/* ------------------------------------------------------------------ */

function EvidenceModal({
  report,
  onClose,
}: {
  report: { reportedName: string; violation: string; evidence: string; snippet: string } | null;
  onClose: () => void;
}) {
  return (
    <Modal open={!!report} onClose={onClose} title="Review evidence">
      {report && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Tag tone="danger">{report.violation}</Tag>
            <span className="text-sm font-medium text-ink">{report.reportedName}</span>
          </div>
          <p className="rounded-xl border border-hairline bg-paper p-4 text-sm leading-relaxed text-muted">{report.evidence}</p>
          <p className="text-xs text-faint">Evidence is auto-captured and timestamped. It cannot be edited by either party.</p>
        </div>
      )}
    </Modal>
  );
}

function ReportsView() {
  const { state, issueStrike, decideAppeal } = useApp();
  const [evidence, setEvidence] = useState<{ reportedName: string; violation: string; evidence: string; snippet: string } | null>(null);

  const open = state.reports.filter((r) => r.status === "open");
  const appeals = state.appeals.filter((a) => a.status === "pending");

  return (
    <div className="space-y-8">
      <section>
        <SectionHeading
          title="Active reports"
          lede="Three strikes and an account is suspended. Evidence stays attached to every strike."
        />
        <div className="mt-6 space-y-3">
          {open.length === 0 && <EmptyState title="No open reports" body="The queue is clear — nice work." />}
          {open.map((r) => {
            const nextStrike = r.strikes + 1;
            const reportedUser = state.users.find((u) => u.id === r.reportedId);
            const suspended = reportedUser?.status === "suspended";
            return (
              <Card key={r.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
                  <ShieldAlert size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold text-ink">{r.reportedName}</span>
                    <Tag tone="danger">{r.violation}</Tag>
                    <span key={r.strikes} className="anim-pop flex items-center gap-1 rounded-md bg-amber-soft px-2 py-0.5 text-[11px] font-bold text-[#A96A12]">
                      <Gavel size={11} />
                      {r.strikes}/3 strikes
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{r.snippet}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEvidence(r)}>
                    <FileText size={13} />
                    Review evidence
                  </Button>
                  {suspended ? (
                    <Tag tone="danger">
                      <ShieldAlert size={11} /> Account suspended
                    </Tag>
                  ) : (
                    <Button size="sm" variant={nextStrike >= 3 ? "danger" : "dark"} onClick={() => issueStrike(r.id)}>
                      <Gavel size={13} />
                      Issue strike {nextStrike}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeading title="Appeals" lede="Suspended users can appeal once. Approving reinstates the account and clears strikes." />
        <div className="mt-6 space-y-3">
          {appeals.length === 0 && <EmptyState title="No pending appeals" />}
          {appeals.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-center gap-4 p-5">
              <Avatar name={a.userName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-ink">{a.userName}</div>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">"{a.reason}"</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => decideAppeal(a.id, false)}>
                  <X size={13} />
                  Deny
                </Button>
                <Button size="sm" variant="primary" onClick={() => decideAppeal(a.id, true)}>
                  <Check size={13} />
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <EvidenceModal report={evidence} onClose={() => setEvidence(null)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* User management                                                     */
/* ------------------------------------------------------------------ */

function UserManagement() {
  const { state, suspendUser, reinstateUser } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");

  const rows = useMemo(
    () =>
      state.users.filter((u) => {
        const text = [u.name, u.email, u.role, u.school ?? "", u.company ?? ""].join(" ").toLowerCase();
        const matchQ = text.includes(q.toLowerCase());
        const matchS = status === "all" || u.status === status;
        return matchQ && matchS;
      }),
    [state.users, q, status],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search users, emails, roles…" className="w-full max-w-sm" />
        <div className="flex gap-1 rounded-lg border border-hairline bg-card p-1">
          {(["all", "active", "suspended"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cx(
                "rounded-md px-3 py-1.5 text-[13px] font-medium capitalize transition-colors",
                status === s ? "bg-ink text-paper" : "text-muted hover:text-ink",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs text-faint">{rows.length} users</span>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-wider text-faint">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Role</th>
              <th className="px-4 py-3 font-medium">Strikes</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-hairline/60 last:border-0">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <div className="font-medium text-ink">{u.name}</div>
                      <div className="text-xs text-faint">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3.5 capitalize text-muted md:table-cell">{u.role}</td>
                <td className="px-4 py-3.5">
                  <span className={cx("font-semibold", u.strikes >= 3 ? "text-danger" : u.strikes > 0 ? "text-[#A96A12]" : "text-faint")}>
                    {u.strikes}/3
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <Tag tone={u.status === "active" ? "teal" : "danger"}>{u.status}</Tag>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {u.status === "active" ? (
                    <Button size="sm" variant="outline" onClick={() => suspendUser(u.id)}>
                      Suspend
                    </Button>
                  ) : (
                    <Button size="sm" variant="dark" onClick={() => reinstateUser(u.id)}>
                      <ShieldCheck size={13} />
                      Reinstate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-8">
            <EmptyState title="No users match" body="Adjust the search or status filter." />
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  const [view, setView] = useState("overview");
  const title = ADMIN_NAV.find((n) => n.id === view)?.label ?? "Overview";

  return (
    <DashboardShell nav={ADMIN_NAV} active={view} onSelect={setView} title={title}>
      {view === "overview" && <AdminOverview />}
      {view === "intelligence" && <SkillIntelligence />}
      {view === "internships" && <InternshipTracking />}
      {view === "insights" && <StudentInsights />}
      {view === "reports" && <ReportsView />}
      {view === "users" && <UserManagement />}
    </DashboardShell>
  );
}