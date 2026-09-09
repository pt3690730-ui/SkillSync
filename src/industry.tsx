import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowDownUp,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  ChevronDown,
  FilePlus2,
  LayoutGrid,
  ListTodo,
  Star,
  Users,
} from "lucide-react";
import { useApp } from "./store";
import {
  Avatar,
  Button,
  Card,
  cx,
  EmptyState,
  Field,
  Modal,
  OverflowMenu,
  ProgressBar,
  SearchInput,
  SectionHeading,
  Select,
  StatCard,
  Tag,
  TextInput,
  Textarea,
} from "./ui";
import { ReportModal } from "./modals";
import { DashboardShell, type NavItem } from "./shell";

export const INDUSTRY_NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "post", label: "Post Requirement", icon: FilePlus2 },
  { id: "requirements", label: "My Requirements", icon: ListTodo },
  { id: "candidates", label: "Candidate Matches", icon: Users },
  { id: "saved", label: "Saved Candidates", icon: Bookmark },
];

/* ------------------------------------------------------------------ */
/* Post requirement modal                                              */
/* ------------------------------------------------------------------ */

function PostRequirementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { postRequirement } = useApp();
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("Remote");
  const [duration, setDuration] = useState("6 months");
  const [pay, setPay] = useState("");
  const [mode, setMode] = useState("Remote");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const skillList = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    postRequirement({
      title: title.trim(),
      skills: skillList.length ? skillList : ["Python"],
      notes: notes.trim() || "No additional notes.",
      location,
      duration,
      pay: pay.trim() || "Unpaid",
      mode,
    });
    setTitle("");
    setSkills("");
    setNotes("");
    setPay("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Post a requirement"
      wide
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!title.trim()}>
            Post requirement
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Role title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Data Analyst Intern" />
        </Field>
        <Field label="Required skills" hint="Comma-separated. Candidates are ranked against these from the skill graph.">
          <TextInput value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Python, SQL, Excel" />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Location">
            <TextInput value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Duration">
            <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
              {["3 months", "4 months", "6 months", "1 year"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Pay">
            <TextInput value={pay} onChange={(e) => setPay(e.target.value)} placeholder="₹20,000 / month" />
          </Field>
          <Field label="Mode">
            <Select value={mode} onChange={(e) => setMode(e.target.value)}>
              {["Remote", "Hybrid", "On-site"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Notes for candidates">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What will they actually build or learn?" />
        </Field>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

function IndustryOverview({ onGo }: { onGo: (v: string) => void }) {
  const { state, currentUser } = useApp();
  const [postOpen, setPostOpen] = useState(false);
  if (!currentUser) return null;

  const allCandidates = state.requirements.flatMap((r) => r.applicants);
  const shortlisted = state.requirements.flatMap((r) => r.shortlisted);
  const highFit = allCandidates.filter((c) => c.match >= 85).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[30px] leading-tight tracking-[-0.02em] text-ink">
            {currentUser.company}
          </h2>
          <p className="mt-1 text-sm text-muted">Hiring from the skill graph — every candidate pre-verified.</p>
        </div>
        <Button onClick={() => setPostOpen(true)}>
          <FilePlus2 size={15} />
          Post requirement
        </Button>
      </div>

      <Card className="grid grid-cols-2 divide-hairline sm:grid-cols-4 sm:divide-x">
        <StatCard label="Active Requirements" value={state.requirements.filter((r) => r.status !== "Closed").length} sub="live right now" icon={<Briefcase size={15} />} />
        <StatCard label="Candidate Matches" value={allCandidates.length} sub="across all roles" icon={<Users size={15} />} tone="primary" />
        <StatCard label="High-Fit Candidates" value={highFit} sub="85% match or better" icon={<Star size={15} />} tone="teal" />
        <StatCard label="Shortlisted" value={shortlisted.length} sub="awaiting your move" icon={<BookmarkCheck size={15} />} tone="amber" />
      </Card>

      <section>
        <SectionHeading
          title="Latest requirements"
          lede="Ranked candidate pools update as students add skills."
          right={
            <Button variant="outline" size="sm" onClick={() => onGo("requirements")}>
              Manage all
            </Button>
          }
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {state.requirements.slice(0, 4).map((r) => {
            const best = [...r.applicants].sort((a, b) => b.match - a.match)[0];
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-muted">{r.company}</div>
                    <h3 className="mt-0.5 font-display text-[19px] leading-tight tracking-[-0.01em] text-ink">{r.title}</h3>
                  </div>
                  <Tag tone={r.status === "Open" ? "teal" : r.status === "Shortlisting" ? "amber" : "muted"}>{r.status}</Tag>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.skills.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-[13px]">
                  <span className="text-muted">
                    {r.applicants.length} applicants, {r.shortlisted.length} shortlisted
                  </span>
                  {best ? (
                    <span className="font-semibold text-teal">best {best.match}%</span>
                  ) : (
                    <span className="text-faint">no applicants yet</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <PostRequirementModal open={postOpen} onClose={() => setPostOpen(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Requirements list with expandable candidates                        */
/* ------------------------------------------------------------------ */

function RequirementsView() {
  const { state, getUser, shortlistCandidate, reportUser } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [report, setReport] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-5">
      {state.requirements.map((r) => {
        const isOpen = openId === r.id;
        const sorted = [...r.applicants].sort((a, b) => b.match - a.match);
        return (
          <Card key={r.id} className="overflow-hidden">
            <button onClick={() => setOpenId(isOpen ? null : r.id)} className="flex w-full flex-wrap items-center gap-4 p-5 text-left">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-[19px] leading-tight tracking-[-0.01em] text-ink">{r.title}</h3>
                  <Tag tone={r.status === "Open" ? "teal" : r.status === "Shortlisting" ? "amber" : "muted"}>{r.status}</Tag>
                </div>
                <div className="mt-1 text-xs text-faint">
                  {r.company}, {r.location}, {r.duration}, {r.pay}, {r.mode}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.skills.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <div className="font-display text-xl text-ink">{r.applicants.length}</div>
                  <div className="text-[11px] text-faint">applicants</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl text-teal">{r.bestMatch || 0}%</div>
                  <div className="text-[11px] text-faint">best match</div>
                </div>
                <ChevronDown size={17} className={cx("text-faint transition-transform duration-300", isOpen && "rotate-180")} />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-hairline">
                <div className="px-5 py-2 text-xs font-semibold text-muted">Matched candidates</div>
                {sorted.length === 0 && (
                  <div className="px-5 pb-5">
                    <EmptyState title="No applicants yet" body="New candidates appear here the moment their skill graph lines up." />
                  </div>
                )}
                {sorted.map((c) => {
                  const u = getUser(c.userId);
                  if (!u) return null;
                  const isShort = r.shortlisted.includes(c.userId);
                  return (
                    <div key={c.userId} className="flex flex-wrap items-center gap-4 border-t border-hairline/60 px-5 py-3.5">
                      <Avatar name={u.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-ink">{u.name}</span>
                          <span className="text-xs text-faint">{u.school}</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 w-36 overflow-hidden rounded-full bg-ink/8">
                            <div className="h-full rounded-full bg-teal" style={{ width: `${c.match}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-teal">{c.match}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={isShort ? "dark" : "outline"}
                          onClick={() => shortlistCandidate(r.id, c.userId)}
                        >
                          {isShort ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                          {isShort ? "Shortlisted" : "Shortlist"}
                        </Button>
                        <OverflowMenu
                          items={[
                            { label: "Report candidate", icon: <Star size={13} />, onClick: () => setReport({ id: c.userId, name: u.name }), danger: true },
                          ]}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      {report && (
        <ReportModal
          open={!!report}
          onClose={() => setReport(null)}
          userName={report.name}
          onReport={(reason) => reportUser(report.id, reason)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Candidate matches — searchable + sortable                           */
/* ------------------------------------------------------------------ */

function CandidateMatchesView() {
  const { state, getUser, toggleSaved, shortlistCandidate } = useApp();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"match" | "name">("match");

  const rows = useMemo(() => {
    const flat = state.requirements.flatMap((r) =>
      r.applicants.map((c) => ({ ...c, requirement: r })),
    );
    const filtered = flat.filter((row) => {
      const u = getUser(row.userId);
      const text = [u?.name ?? "", row.requirement.title, row.requirement.company, ...row.requirement.skills].join(" ").toLowerCase();
      return text.includes(q.toLowerCase());
    });
    filtered.sort((a, b) => (sort === "match" ? b.match - a.match : (getUser(a.userId)?.name ?? "").localeCompare(getUser(b.userId)?.name ?? "")));
    return filtered;
  }, [state.requirements, q, sort, getUser]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search candidates, roles, skills…" className="w-full max-w-sm" />
        <Select value={sort} onChange={(e) => setSort(e.target.value as "match" | "name")} className="w-44">
          <option value="match">Sort by match</option>
          <option value="name">Sort by name</option>
        </Select>
        <span className="text-xs text-faint">
          {rows.length} candidate{rows.length === 1 ? "" : "s"} across {state.requirements.length} requirements
        </span>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-wider text-faint">
              <th className="px-5 py-3 font-medium">Candidate</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Matched for</th>
              <th className="px-4 py-3 font-medium">Skills needed</th>
              <th className="px-4 py-3 text-right font-medium">Match</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const u = getUser(row.userId);
              if (!u) return null;
              const saved = state.savedCandidates.includes(row.userId);
              const short = row.requirement.shortlisted.includes(row.userId);
              return (
                <tr key={`${row.requirement.id}-${row.userId}`} className="border-b border-hairline/60 last:border-0 hover:bg-paper/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <div className="font-medium text-ink">{u.name}</div>
                        <div className="text-xs text-faint">{u.school}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-[13px] text-muted md:table-cell">
                    {row.requirement.title}
                    <div className="text-xs text-faint">{row.requirement.company}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {row.requirement.skills.slice(0, 2).map((s) => (
                        <Tag key={s}>{s}</Tag>
                      ))}
                      {row.requirement.skills.length > 2 && <Tag tone="muted">+{row.requirement.skills.length - 2}</Tag>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-display text-[17px] text-teal">{row.match}%</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleSaved(row.userId)}
                        className={cx("rounded-md p-1.5 transition-colors", saved ? "text-primary" : "text-faint hover:text-ink")}
                        aria-label={saved ? "Unsave candidate" : "Save candidate"}
                      >
                        {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                      <Button
                        size="sm"
                        variant={short ? "dark" : "outline"}
                        onClick={() => shortlistCandidate(row.requirement.id, row.userId)}
                      >
                        {short ? "Shortlisted" : "Shortlist"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-8">
            <EmptyState title="No candidates match that search" body="The list re-filters on every keystroke." />
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Saved candidates                                                    */
/* ------------------------------------------------------------------ */

function SavedCandidatesView() {
  const { state, getUser, toggleSaved, shortlistCandidate } = useApp();
  const saved = state.savedCandidates
    .map((id) => ({ user: getUser(id), req: state.requirements.find((r) => r.applicants.some((a) => a.userId === id)) }))
    .filter((x) => x.user);

  return (
    <div className="space-y-5">
      {saved.length === 0 && (
        <EmptyState
          title="No saved candidates yet"
          body="Hit the bookmark icon in Candidate Matches to keep candidates here for later."
        />
      )}
      {saved.map(({ user, req }) => {
        if (!user) return null;
        const cand = req?.applicants.find((a) => a.userId === user.id);
        return (
          <Card key={user.id} className="flex flex-wrap items-center gap-4 p-5">
            <Avatar name={user.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-semibold text-ink">{user.name}</span>
                {cand && <span className="font-display text-sm text-teal">{cand.match}%</span>}
                <Tag tone="default">{user.school}</Tag>
              </div>
              {req && (
                <div className="mt-1 text-[13px] text-muted">
                  Matched for <span className="font-medium text-ink">{req.title}</span> at {req.company}
                </div>
              )}
              <div className="mt-1 text-xs text-faint">
                Reputation {user.reputation.toFixed(1)}, {user.reviewCount} reviews
              </div>
            </div>
            <div className="flex items-center gap-2">
              {req && (
                <Button size="sm" variant={req.shortlisted.includes(user.id) ? "dark" : "outline"} onClick={() => shortlistCandidate(req.id, user.id)}>
                  {req.shortlisted.includes(user.id) ? "Shortlisted" : "Shortlist"}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => toggleSaved(user.id)}>
                Remove
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

export default function IndustryDashboard() {
  const [view, setView] = useState("overview");
  const [postOpen, setPostOpen] = useState(false);
  const title = INDUSTRY_NAV.find((n) => n.id === view)?.label ?? "Overview";

  return (
    <DashboardShell
      nav={INDUSTRY_NAV}
      active={view}
      onSelect={setView}
      title={title}
      actions={
        view === "overview" ? (
          <Button size="sm" onClick={() => setPostOpen(true)}>
            <FilePlus2 size={14} />
            Post requirement
          </Button>
        ) : undefined
      }
    >
      {view === "overview" && <IndustryOverview onGo={setView} />}
      {view === "post" && <PostInline onGo={setView} />}
      {view === "requirements" && <RequirementsView />}
      {view === "candidates" && <CandidateMatchesView />}
      {view === "saved" && <SavedCandidatesView />}
      <PostRequirementModal open={postOpen} onClose={() => setPostOpen(false)} />
    </DashboardShell>
  );
}

function PostInline({ onGo }: { onGo: (v: string) => void }) {
  const { postRequirement, currentUser } = useApp();
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("6 months");
  const [pay, setPay] = useState("");
  const [mode, setMode] = useState("Remote");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);
    postRequirement({
      title: title.trim(),
      skills: skillList.length ? skillList : ["Python"],
      notes: notes.trim() || "No additional notes.",
      location: location.trim() || "Remote",
      duration,
      pay: pay.trim() || "Unpaid",
      mode,
    });
    onGo("requirements");
  };

  return (
    <Card className="max-w-2xl p-7">
      <h2 className="font-display text-[24px] tracking-[-0.02em] text-ink">Post a requirement</h2>
      <p className="mt-1 text-sm text-muted">
        Posting for {currentUser?.company} — candidates will be ranked from the live skill graph.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Role title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Data Analyst Intern" />
        </Field>
        <Field label="Required skills" hint="Comma-separated.">
          <TextInput value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Python, SQL, Excel" />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Location">
            <TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Pune" />
          </Field>
          <Field label="Duration">
            <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
              {["3 months", "4 months", "6 months", "1 year"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Pay">
            <TextInput value={pay} onChange={(e) => setPay(e.target.value)} placeholder="₹20,000 / month" />
          </Field>
          <Field label="Mode">
            <Select value={mode} onChange={(e) => setMode(e.target.value)}>
              {["Remote", "Hybrid", "On-site"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What will they build or learn?" />
        </Field>
        <div className="flex gap-2">
          <Button type="submit">Post requirement</Button>
          <Button type="button" variant="outline" onClick={() => onGo("overview")}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}