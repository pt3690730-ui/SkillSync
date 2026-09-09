import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Award,
  Ban,
  CalendarDays,
  Check,
  ChevronDown,
  Crown,
  Flag,
  Mic,
  MicOff,
  Send,
  ShieldAlert,
  Star,
  Trophy,
  Video,
  VideoOff,
} from "lucide-react";
import { useApp, BADGES } from "./store";
import {
  Avatar,
  Button,
  Card,
  cx,
  EmptyState,
  Modal,
  OverflowMenu,
  ProgressBar,
  SearchInput,
  SectionHeading,
  Select,
  StarRating,
  Tag,
  Textarea,
} from "./ui";
import { ReportModal, RequestSessionModal } from "./modals";

/* ------------------------------------------------------------------ */
/* Marketplace                                                         */
/* ------------------------------------------------------------------ */

export function MarketplaceView({ onGo }: { onGo: (v: string) => void }) {
  const { state, getUser, connectWith, reportUser, blockUser } = useApp();
  const [internSearch, setInternSearch] = useState("");
  const [peerSearch, setPeerSearch] = useState("");
  const [applied, setApplied] = useState<string[]>([]);
  const [openIntern, setOpenIntern] = useState<string | null>(null);
  const [report, setReport] = useState<{ id: string; name: string } | null>(null);

  const internships = useMemo(
    () =>
      state.internships.filter((i) => {
        const q = internSearch.toLowerCase();
        if (!q) return true;
        return [i.role, i.company, ...i.tags, i.location].join(" ").toLowerCase().includes(q);
      }),
    [state.internships, internSearch],
  );

  const peers = useMemo(
    () =>
      state.matches
        .filter((m) => !state.blockedIds.includes(m.peerId))
        .filter((m) => {
          const q = peerSearch.toLowerCase();
          if (!q) return true;
          const u = getUser(m.peerId);
          return [u?.name ?? "", ...m.canTeach, ...m.wants].join(" ").toLowerCase().includes(q);
        }),
    [state.matches, state.blockedIds, peerSearch, getUser],
  );

  const intern = state.internships.find((i) => i.id === openIntern);

  return (
    <div className="space-y-10">
      <section>
        <SectionHeading
          title="Recommended internships"
          lede="Ranked against your skill graph — what you teach, what you're learning, and your session history."
          right={<SearchInput value={internSearch} onChange={setInternSearch} placeholder="Filter roles, companies, tags…" className="w-64" />}
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {internships.map((i) => (
            <Card key={i.id} className="flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-muted">{i.company}</div>
                  <h3 className="mt-1 font-display text-[20px] leading-tight tracking-[-0.01em] text-ink">{i.role}</h3>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-soft font-display text-sm font-semibold text-teal">
                  {i.match}%
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {i.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                {[
                  ["Location", i.location],
                  ["Duration", i.duration],
                  ["Pay", i.pay],
                  ["Mode", i.mode],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 border-b border-hairline/70 pb-1.5">
                    <dt className="text-faint">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex items-center gap-3">
                <Button variant={applied.includes(i.id) ? "outline" : "primary"} size="sm" onClick={() => setApplied((a) => (a.includes(i.id) ? a : [...a, i.id]))}>
                  {applied.includes(i.id) ? (
                    <>
                      <Check size={14} /> Applied
                    </>
                  ) : (
                    "Apply now"
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setOpenIntern(i.id)}>
                  View opportunity
                </Button>
              </div>
            </Card>
          ))}
          {internships.length === 0 && (
            <div className="md:col-span-2">
              <EmptyState title="No internships match that search" body="Try a different keyword — your matches re-rank instantly." />
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHeading
          title="Skill matches"
          lede="Peers whose teach and learn lists line up with yours. Connect to start a conversation."
          right={<SearchInput value={peerSearch} onChange={setPeerSearch} placeholder="Filter by name or skill…" className="w-64" />}
        />
        <div className="mt-6 space-y-3">
          {peers.map((m) => {
            const u = getUser(m.peerId);
            if (!u) return null;
            return (
              <Card key={m.id} className="flex flex-wrap items-center gap-4 p-5">
                <Avatar name={u.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold text-ink">{u.name}</span>
                    <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-bold text-teal">{m.match}% match</span>
                  </div>
                  <div className="text-xs text-faint">{u.school}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Tag tone="teal">can teach {m.canTeach.join(", ")}</Tag>
                    <Tag tone="indigo">wants {m.wants.join(", ")}</Tag>
                  </div>
                </div>
                <div className="hidden text-right text-xs text-faint sm:block">
                  Free: {m.availability}
                </div>
                <div className="flex items-center gap-2">
                  {m.connected ? (
                    <Tag tone="teal">
                      <Check size={11} /> Connected
                    </Tag>
                  ) : (
                    <Button size="sm" onClick={() => connectWith(m.peerId)}>
                      Connect
                    </Button>
                  )}
                  <OverflowMenu
                    items={[
                      { label: "Report user", icon: <Flag size={13} />, onClick: () => setReport({ id: m.peerId, name: u.name }), danger: true },
                      { label: "Block user", icon: <Ban size={13} />, onClick: () => blockUser(m.peerId), danger: true },
                    ]}
                  />
                </div>
              </Card>
            );
          })}
          {peers.length === 0 && (
            <EmptyState title="No peers match that search" body="Your learn list drives these results — add more skills to widen the net." />
          )}
        </div>
      </section>

      {intern && (
        <ModalForInternship
          intern={{
            role: intern.role,
            company: intern.company,
            match: intern.match,
            tags: intern.tags,
            location: intern.location,
            duration: intern.duration,
            pay: intern.pay,
            mode: intern.mode,
          }}
          applied={applied.includes(intern.id)}
          onClose={() => setOpenIntern(null)}
          onApply={() => {
            setApplied((a) => (a.includes(intern.id) ? a : [...a, intern.id]));
            setOpenIntern(null);
          }}
          onGo={onGo}
        />
      )}
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

function ModalForInternship({
  intern,
  applied,
  onClose,
  onApply,
  onGo,
}: {
  intern: { role: string; company: string; match: number; tags: string[]; location: string; duration: string; pay: string; mode: string };
  applied: boolean;
  onClose: () => void;
  onApply: () => void;
  onGo: (v: string) => void;
}) {
  return (
    <Modal open onClose={onClose} title={intern.role} wide footer={
      <>
        <Button variant="outline" onClick={() => onGo("messages")}>
          Message recruiter
        </Button>
        <Button onClick={onApply} disabled={applied}>
          {applied ? "Applied" : "Apply now"}
        </Button>
      </>
    }>
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted">{intern.company}</span>
          <span className="font-display text-2xl text-teal">{intern.match}% match</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {intern.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            ["Location", intern.location],
            ["Duration", intern.duration],
            ["Pay", intern.pay],
            ["Mode", intern.mode],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-hairline/70 pb-2">
              <dt className="text-faint">{k}</dt>
              <dd className="font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          This role was matched against your skill graph: your Python, SQL, and Data Structures history is what
          pushed the score to {intern.match}%. The recruiter sees the same verified profile — no résumé parsing,
          no guesswork.
        </p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SessionsView({ onGo }: { onGo: (v: string) => void }) {
  const { state, getUser } = useApp();
  const [reqOpen, setReqOpen] = useState(false);
  const [preset, setPreset] = useState<{ day?: string; time?: string } | undefined>();

  const confirmed = state.sessions.filter((s) => s.kind === "confirmed");
  const pending = state.sessions.filter((s) => s.kind === "pending" || s.kind === "requested");

  return (
    <div className="space-y-8">
      <section>
        <SectionHeading
          title="This week"
          lede="Open slots are yours to fill. Tap one to propose it to a peer."
          right={
            <Button onClick={() => setReqOpen(true)}>
              Request a session
            </Button>
          }
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DAYS.map((d) => {
            const daySlots = state.slots.filter((s) => s.day === d);
            const dayConfirmed = confirmed.filter((s) => s.day === d);
            return (
              <Card key={d} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ink">{d}</span>
                  <span className="text-[11px] text-faint">
                    {dayConfirmed.length} confirmed, {daySlots.filter((s) => s.open).length} open
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {daySlots.map((slot) => {
                    const conf = dayConfirmed.find((c) => c.time === slot.time);
                    if (conf) {
                      const peer = getUser(conf.peerId);
                      return (
                        <div key={slot.id} className="flex items-center justify-between rounded-lg bg-primary-soft px-3 py-2">
                          <span className="text-xs font-semibold text-primary-deep">
                            {slot.time}, {conf.skill}
                          </span>
                          <button onClick={() => onGo("studio")} className="text-[11px] font-medium text-primary underline-offset-2 hover:underline">
                            Join
                          </button>
                        </div>
                      );
                    }
                    if (!slot.open) {
                      return (
                        <div key={slot.id} className="rounded-lg border border-hairline px-3 py-2 text-xs text-faint">
                          {slot.time}, busy
                        </div>
                      );
                    }
                    return (
                      <button
                        key={slot.id}
                        onClick={() => {
                          setPreset({ day: d, time: slot.time });
                          setReqOpen(true);
                        }}
                        className="flex w-full items-center justify-between rounded-lg border border-dashed border-hairline px-3 py-2 text-xs text-muted transition-colors hover:border-primary/50 hover:bg-primary-soft/60 hover:text-primary-deep"
                      >
                        {slot.time}
                        <PlusSmall />
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Confirmed</h3>
          <div className="mt-4 space-y-2.5">
            {confirmed.length === 0 && <p className="text-sm text-faint">Nothing confirmed yet.</p>}
            {confirmed.map((s) => {
              const peer = getUser(s.peerId);
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-paper px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={peer?.name ?? "?"} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-ink">
                        {s.skill} with {peer?.name}
                      </div>
                      <div className="text-xs text-faint">
                        {s.day} at {s.time}
                        {s.note ? `, ${s.note}` : ""}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onGo("studio")}>
                    Join studio
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Pending requests</h3>
          <div className="mt-4 space-y-2.5">
            {pending.length === 0 && <p className="text-sm text-faint">No pending requests.</p>}
            {pending.map((s) => {
              const peer = getUser(s.peerId);
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-paper px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={peer?.name ?? "?"} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-ink">
                        {s.kind === "requested" ? "You proposed" : "Incoming"}: {s.skill}
                      </div>
                      <div className="text-xs text-faint">
                        {peer?.name}, {s.day} at {s.time}
                      </div>
                    </div>
                  </div>
                  <Tag tone={s.kind === "requested" ? "amber" : "indigo"}>{s.kind === "requested" ? "Waiting" : "Needs reply"}</Tag>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <RequestSessionModal open={reqOpen} onClose={() => setReqOpen(false)} preset={preset} />
    </div>
  );
}

function PlusSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export function MessagesView() {
  const { state, getUser, sendMessage, markConvRead } = useApp();
  const [activeId, setActiveId] = useState(state.conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const conv = state.conversations.find((c) => c.id === activeId);
  const peer = conv ? getUser(conv.peerId) : undefined;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conv?.messages.length]);

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    if (!draft.trim() || !conv) return;
    sendMessage(conv.id, draft.trim());
    setDraft("");
  };

  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[290px_1fr]">
        <div className="border-b border-hairline lg:border-b-0 lg:border-r">
          <div className="px-4 py-3 text-[13px] font-semibold text-ink">Conversations</div>
          <div className="max-h-[560px] overflow-y-auto">
            {state.conversations.map((c) => {
              const p = getUser(c.peerId);
              const last = c.messages[c.messages.length - 1];
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                    markConvRead(c.id);
                  }}
                  className={cx(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    c.id === activeId ? "bg-primary-soft/70" : "hover:bg-paper",
                  )}
                >
                  <Avatar name={p?.name ?? "?"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold text-ink">{p?.name}</span>
                      {c.unread > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <div className="truncate text-xs text-faint">{last?.text}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex h-[560px] flex-col">
          <div className="flex items-center gap-3 border-b border-hairline px-5 py-3">
            <Avatar name={peer?.name ?? "?"} size="sm" />
            <div>
              <div className="text-[13px] font-semibold text-ink">{peer?.name}</div>
              <div className="text-[11px] text-teal">{peer?.role === "industry" ? peer.company : peer?.school}</div>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {conv?.messages.map((m) => {
              const mine = m.from === "me";
              return (
                <div key={m.id} className={cx("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cx(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                      mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-hairline bg-paper text-ink",
                    )}
                  >
                    {m.text}
                    <div className={cx("mt-1 text-[10px]", mine ? "text-white/60" : "text-faint")}>{m.at}</div>
                  </div>
                </div>
              );
            })}
            {conv?.messages.length === 0 && <p className="pt-8 text-center text-sm text-faint">No messages yet — say hi.</p>}
          </div>
          <form onSubmit={send} className="flex items-center gap-2 border-t border-hairline px-4 py-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
              className="min-h-0 flex-1 py-2.5"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button type="submit" size="sm" disabled={!draft.trim()}>
              <Send size={14} />
              Send
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Virtual studio                                                      */
/* ------------------------------------------------------------------ */

export function StudioView() {
  const { state, sendStudio } = useApp();
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const peers = ["Meera Iyer", "Kabir Rao"];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.studio.length]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendStudio(draft.trim());
    setDraft("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-hairline bg-gradient-to-br from-primary-soft via-paper to-teal-soft">
          <div className="aspect-video" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Avatar name="Aarav Sharma" size="xl" />
            <div className="mt-3 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
              </span>
              <span className="text-xs font-bold tracking-wide text-danger">LIVE</span>
            </div>
            <div className="mt-1 text-sm text-muted">You're on camera</div>
            {!mic && (
              <div className="mt-3 rounded-full bg-danger-soft px-3 py-1 text-xs font-medium text-danger">You are muted</div>
            )}
          </div>
          <div className="absolute left-3 top-3 flex gap-2">
            {peers.map((p) => (
              <div key={p} className="flex items-center gap-2 rounded-full border border-hairline bg-card/90 px-2.5 py-1 shadow-float">
                <Avatar name={p} size="xs" />
                <span className="text-[11px] font-medium text-ink">{p.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setMic((m) => !m)}
            className={cx(
              "flex h-12 w-12 items-center justify-center rounded-full border transition-all",
              mic ? "border-hairline bg-card text-ink hover:border-ink/30" : "border-danger/30 bg-danger-soft text-danger",
            )}
            aria-label="Toggle microphone"
          >
            {mic ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          <button
            onClick={() => setCam((c) => !c)}
            className={cx(
              "flex h-12 w-12 items-center justify-center rounded-full border transition-all",
              cam ? "border-hairline bg-card text-ink hover:border-ink/30" : "border-danger/30 bg-danger-soft text-danger",
            )}
            aria-label="Toggle camera"
          >
            {cam ? <Video size={18} /> : <VideoOff size={18} />}
          </button>
          <button
            onClick={() => {
              setMic(false);
              setCam(false);
            }}
            className="flex h-12 items-center gap-2 rounded-full bg-danger px-5 text-sm font-semibold text-white transition-all hover:bg-[#b93a3a]"
          >
            End session
          </button>
        </div>
      </div>

      <Card className="flex h-[420px] flex-col overflow-hidden lg:h-auto">
        <div className="border-b border-hairline px-4 py-3 text-[13px] font-semibold text-ink">Session chat</div>
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {state.studio.map((m) => (
            <div key={m.id} className={cx("flex", m.mine ? "justify-end" : "justify-start")}>
              <div
                className={cx(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                  m.mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-hairline bg-paper",
                )}
              >
                {!m.mine && <div className="mb-0.5 text-[11px] font-semibold text-primary">{m.from}</div>}
                {m.text}
                <div className={cx("mt-0.5 text-[10px]", m.mine ? "text-white/60" : "text-faint")}>{m.at}</div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="flex items-center gap-2 border-t border-hairline px-3 py-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Say something…"
            className="min-h-0 flex-1 py-2.5"
          />
          <Button type="submit" size="sm" disabled={!draft.trim()}>
            <Send size={14} />
          </Button>
        </form>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

export function AchievementsView({ onGo }: { onGo: (v: string) => void }) {
  const { state, currentUser, getUser, rateUser } = useApp();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [targetId, setTargetId] = useState(state.sessions.find((s) => s.kind === "completed")?.peerId ?? "");
  const [rated, setRated] = useState(false);

  if (!currentUser) return null;
  const xp = currentUser.xp;
  const level = Math.floor(xp / 1000) + 1;
  const levelStart = (level - 1) * 1000;
  const progress = ((xp - levelStart) / 1000) * 100;

  const leaderboard = useMemo(() => {
    const rows = state.users
      .filter((u) => u.role === "student" && u.status === "active")
      .map((u) => ({
        u,
        xp: u.xp,
        badges: Math.min(5, Math.floor(u.xp / 500)),
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 8);
    return rows;
  }, [state.users]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!targetId || stars === 0) return;
    rateUser(targetId, stars, text);
    setRated(true);
    setStars(0);
    setText("");
  };

  const completed = state.sessions.filter((s) => s.kind === "completed");
  const myReviews = state.reviews.filter((r) => r.fromId === currentUser.id);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* XP + level */}
        <Card className="p-6 lg:col-span-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
            <Trophy size={15} className="text-amber" />
            Your XP
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl tracking-tight text-ink">{xp.toLocaleString()}</span>
            <span className="text-sm text-faint">XP</span>
          </div>
          <div className="mt-1 text-[13px] font-medium text-primary">Level {level}</div>
          <ProgressBar value={progress} tone="amber" className="mt-3" />
          <div className="mt-1.5 text-xs text-faint">
            {levelStart.toLocaleString()} — {(level * 1000).toLocaleString()} XP to level {level + 1}
          </div>
          <div className="mt-5 rounded-xl bg-amber-soft px-4 py-3 text-[13px] leading-relaxed text-[#A96A12]">
            Earn XP by connecting, sending requests, rating peers, and completing assessments. It all counts
            toward the leaderboard.
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="overflow-hidden lg:col-span-8">
          <div className="border-b border-hairline px-6 py-4">
            <div className="text-[13px] font-semibold text-ink">Campus leaderboard</div>
            <div className="text-xs text-faint">Top students by XP this term</div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-wider text-faint">
                <th className="px-6 py-2.5 font-medium">Rank</th>
                <th className="px-4 py-2.5 font-medium">Student</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">School</th>
                <th className="px-4 py-2.5 text-right font-medium">Badges</th>
                <th className="px-6 py-2.5 text-right font-medium">XP</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => {
                const isMe = row.u.id === currentUser.id;
                return (
                  <tr key={row.u.id} className={cx("border-b border-hairline/60 last:border-0", isMe ? "bg-primary-soft/60" : "")}>
                    <td className="px-6 py-3">
                      <span className="flex items-center gap-1.5 font-display text-[15px] text-ink">
                        {i === 0 && <Crown size={13} className="text-amber" />}
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={row.u.name} size="xs" />
                        <span className="font-medium text-ink">
                          {row.u.name} {isMe && <span className="text-primary">(you)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-faint sm:table-cell">{row.u.school}</td>
                    <td className="px-4 py-3 text-right text-xs text-muted">{row.badges}/5</td>
                    <td className="px-6 py-3 text-right font-semibold text-ink">{row.xp.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Badge shelf */}
      <section>
        <SectionHeading title="Badge shelf" lede="Earned through real actions — greyed badges show what's left to do." />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {BADGES.map((b) => {
            const earned = b.earned(state);
            return (
              <Card key={b.id} className={cx("flex flex-col items-start p-5", earned ? "" : "opacity-75")}>
                <span
                  className={cx(
                    "flex h-11 w-11 items-center justify-center rounded-full",
                    earned ? "bg-amber-soft text-amber" : "bg-ink/6 text-faint",
                  )}
                >
                  <Award size={20} />
                </span>
                <div className={cx("mt-3 text-[13px] font-semibold", earned ? "text-ink" : "text-muted")}>{b.name}</div>
                <p className="mt-1 text-xs leading-relaxed text-faint">{b.desc}</p>
                <div className="mt-3 text-[11px] font-medium text-primary">{b.progress?.(state)}</div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Ratings & reviews */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
            <Star size={15} className="text-amber" />
            Rate a completed session
          </div>
          <h3 className="mt-2 font-display text-[22px] tracking-[-0.02em] text-ink">How did it go?</h3>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-ink">Peer</span>
              <Select value={targetId} onChange={(e) => setTargetId(e.target.value)} disabled={completed.length === 0}>
                {completed.map((s) => {
                  const p = getUser(s.peerId);
                  return (
                    <option key={s.id} value={s.peerId}>
                      {p?.name}, {s.skill}
                    </option>
                  );
                })}
              </Select>
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-ink">Rating</span>
              <StarRating value={stars} onChange={setStars} size={22} />
            </div>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What worked well? What could be better?" />
            <Button type="submit" disabled={!targetId || stars === 0}>
              Submit review
            </Button>
            {rated && <p className="text-[13px] font-medium text-teal">Thanks! Their reputation updated instantly.</p>}
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
            <ShieldAlert size={15} className="text-teal" />
            Your reviews
          </div>
          <h3 className="mt-2 font-display text-[22px] tracking-[-0.02em] text-ink">
            {myReviews.length} review{myReviews.length === 1 ? "" : "s"} given
          </h3>
          <div className="mt-4 space-y-3">
            {myReviews.length === 0 && <p className="text-sm text-faint">Nothing yet — rate your first completed session.</p>}
            {myReviews.map((r) => {
              const p = getUser(r.toId);
              return (
                <div key={r.id} className="rounded-xl border border-hairline bg-paper p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-ink">{p?.name}</span>
                    <StarRating value={r.stars} size={13} />
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{r.text}</p>
                  <div className="mt-1 text-[11px] text-faint">{r.at}</div>
                </div>
              );
            })}
            <Button variant="ghost" size="sm" onClick={() => onGo("marketplace")}>
              Find your next peer
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}