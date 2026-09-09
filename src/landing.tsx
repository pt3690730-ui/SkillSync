import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  GraduationCap,
  Landmark,
  Menu,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { HeroNetwork, WordmarkReveal, useReducedMotion } from "./particles";
import { Avatar, Button, Card, cx, SectionHeading, Tag, useCountUp, useInView } from "./ui";

const fmtUS = (n: number) => n.toLocaleString("en-US");

/* ================================================================== */
/* Logo                                                                */
/* ================================================================== */

export function Logo({ dark = false, size = "md" }: { dark?: boolean; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <span className={cx("inline-flex items-center gap-2", cls)}>
      <svg width={size === "lg" ? 30 : 24} height={size === "lg" ? 30 : 24} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#4F46E5" />
        <path
          d="M9 21l4.5-9 3 5.5L20 10l3.5 11"
          stroke="#FAFAF7"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={cx("font-display font-semibold tracking-[-0.02em]", dark ? "text-paper" : "text-ink")}>
        SkillSync
      </span>
    </span>
  );
}

/* ================================================================== */
/* Nav                                                                 */
/* ================================================================== */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#roles", label: "Roles" },
    { href: "#partners", label: "Partners" },
  ];

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "border-b border-hairline bg-paper/85 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="SkillSync home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="link-quiet text-sm text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/login" className="link-quiet text-sm font-medium text-ink hover:text-primary">
            Log in
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
        <button
          className="rounded-md p-2 text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-hairline bg-paper px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-muted">
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button size="sm" className="w-full">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ================================================================== */
/* Hero                                                                */
/* ================================================================== */

const CHIPS = [
  { label: "Python", pos: "right-[6%] top-[24%]", bob: "5.2s" },
  { label: "UI Design", pos: "right-[24%] top-[40%]", bob: "6.1s" },
  { label: "Cloud (AWS)", pos: "right-[3%] top-[56%]", bob: "5.6s" },
  { label: "SQL", pos: "right-[20%] top-[72%]", bob: "6.6s" },
  { label: "Mentorship", pos: "right-[38%] top-[26%] hidden lg:flex", bob: "7s" },
];

function Hero() {
  const reduced = useReducedMotion();
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tiltTarget = useRef(CHIPS.map(() => ({ x: 0, y: 0 })));

  useEffect(() => {
    if (reduced) return;
    const current = CHIPS.map(() => ({ x: 0, y: 0 }));
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      CHIPS.forEach((_, i) => {
        const el = chipRefs.current[i];
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / 28;
        const dy = (e.clientY - (r.top + r.height / 2)) / 28;
        tiltTarget.current[i].x = Math.max(-4, Math.min(4, dx));
        tiltTarget.current[i].y = Math.max(-4, Math.min(4, dy));
      });
    };
    const tick = () => {
      CHIPS.forEach((_, i) => {
        const el = chipRefs.current[i];
        if (!el) return;
        current[i].x += (tiltTarget.current[i].x - current[i].x) * 0.09;
        current[i].y += (tiltTarget.current[i].y - current[i].y) * 0.09;
        el.style.transform = `rotateX(${current[i].y.toFixed(2)}deg) rotateY(${(-current[i].x).toFixed(2)}deg)`;
      });
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section className="relative min-h-[94vh] overflow-hidden pt-28 pb-20 sm:pt-36">
      <HeroNetwork className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-paper" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-card/80 px-3 py-1 text-[13px] font-medium text-muted backdrop-blur">
            <Sparkles size={13} className="text-primary" />
            Peer-to-peer skill matching for campuses
          </div>
          <h1 className="font-display text-[clamp(2.7rem,6.4vw,5.1rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-ink">
            Skills move faster when they move{" "}
            <span className="relative inline-block text-primary">
              between people
              <svg
                className="absolute -bottom-2 left-0 w-full text-amber"
                viewBox="0 0 220 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M3 8.5C40 3 90 3.5 130 5.5c40 2 62 3.5 88 1"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-7 max-w-[62ch] text-[17px] leading-relaxed text-muted">
            SkillSync connects students, employers, and placement cells on one quiet platform — so the right
            skill finds the right person without the noise.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link to="/register">
              <Button size="lg">Get started</Button>
            </Link>
            <a href="#how-it-works" className="link-quiet text-[15px] font-medium text-ink">
              See how it works
            </a>
          </div>
        </div>
      </div>

      {/* floating skill chips */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block" style={{ perspective: 900 }}>
        {CHIPS.map((c, i) => (
          <div key={c.label} className={cx("absolute", c.pos)} style={{ transformStyle: "preserve-3d" }}>
            <div ref={(el) => { chipRefs.current[i] = el; }} style={{ transformStyle: "preserve-3d" }}>
              <div
                className="animate-bob flex items-center gap-2 rounded-full border border-hairline bg-card/90 px-4 py-2 text-[13px] font-semibold text-ink shadow-float backdrop-blur"
                style={{ ["--bob" as string]: c.bob }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                {c.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/* How a match happens — step runner + live preview                    */
/* ================================================================== */

const MATCH_STEPS = [
  { title: "Read your skill profile", desc: "The engine indexes what you teach and what you want to learn." },
  { title: "Scan open requests", desc: "It checks live requests from peers and employers across the network." },
  { title: "Rank by fit", desc: "Scores every pairing on skill overlap, availability, and session history." },
  { title: "Suggest a session", desc: "It proposes a match with a time that works for both sides." },
  { title: "Confirm a time", desc: "Both parties confirm, and the session lands on both calendars." },
];

const PREVIEWS = [
  { name: "Meera Iyer", school: "St. Xavier's College, Mumbai", teach: "UI Design", want: "Python", match: 94 },
  { name: "Kabir Rao", school: "BITS Pilani", teach: "Cloud (AWS)", want: "Data Structures", match: 91 },
  { name: "Priya Nair", school: "NIT Trichy", teach: "Spanish", want: "SQL", match: 78 },
];

function MatchSteps() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.35 });
  const [active, setActive] = useState(-1);
  const [done, setDone] = useState(0);
  const [preview, setPreview] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timers: number[] = [];
    MATCH_STEPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setActive(i), i * 900));
      timers.push(window.setTimeout(() => setDone(i + 1), i * 900 + 650));
    });
    timers.push(window.setTimeout(() => setActive(-1), MATCH_STEPS.length * 900));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => setPreview((p) => (p + 1) % PREVIEWS.length), 3400);
    return () => clearInterval(id);
  }, [inView]);

  const cur = PREVIEWS[preview];

  return (
    <section id="how-it-works" className="border-t border-hairline py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div ref={ref} className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <SectionHeading
              title="How a match happens"
              lede="Five quiet steps run every time someone needs a skill. You never see the engine — you just see the session appear on your calendar."
            />
            <ol className="mt-10 space-y-0">
              {MATCH_STEPS.map((s, i) => {
                const isDone = i < done;
                const isActive = i === active;
                return (
                  <li key={s.title} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < MATCH_STEPS.length - 1 && (
                      <span
                        className={cx(
                          "absolute left-[15px] top-9 h-[calc(100%-2.25rem)] w-px transition-colors duration-700",
                          isDone ? "bg-teal/50" : "bg-hairline",
                        )}
                      />
                    )}
                    <span
                      className={cx(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500",
                        isDone
                          ? "border-teal bg-teal text-white"
                          : isActive
                            ? "border-teal/40 bg-card"
                            : "border-hairline bg-card",
                      )}
                    >
                      {isDone ? (
                        <Check size={15} strokeWidth={2.6} className="anim-check" />
                      ) : isActive ? (
                        <span className="spinner h-3.5 w-3.5 rounded-full border-2 border-teal/25 border-t-teal" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-hairline" />
                      )}
                    </span>
                    <div className="pt-1">
                      <div
                        className={cx(
                          "text-[15px] font-semibold transition-colors duration-300",
                          isDone ? "text-ink" : "text-ink/70",
                        )}
                      >
                        {s.title}
                      </div>
                      <p className={cx("mt-1 text-sm leading-relaxed text-muted transition-opacity", isDone ? "opacity-100" : "opacity-70")}>
                        {s.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* live preview card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <Card className="relative overflow-hidden p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
                    </span>
                    Live match preview
                  </div>
                  <Tag tone="indigo">engine running</Tag>
                </div>

                <div className="relative mt-5 h-44">
                  {PREVIEWS.map((p, i) => (
                    <div
                      key={p.name}
                      className={cx(
                        "absolute inset-0 flex flex-col justify-between rounded-xl border border-hairline bg-paper p-5 transition-all duration-700",
                        i === preview ? "opacity-100" : "pointer-events-none opacity-0",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={p.name} />
                        <div>
                          <div className="text-sm font-semibold text-ink">{p.name}</div>
                          <div className="text-xs text-faint">{p.school}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Tag tone="teal">teaches {p.teach}</Tag>
                        <Tag tone="indigo">wants {p.want}</Tag>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="text-xs text-muted">Match score</div>
                        <div className="font-display text-3xl leading-none text-teal">{p.match}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {PREVIEWS.map((p, i) => (
                      <button
                        key={p.name}
                        onClick={() => setPreview(i)}
                        aria-label={`Show match ${i + 1}`}
                        className={cx("h-1.5 rounded-full transition-all duration-300", i === preview ? "w-6 bg-primary" : "w-1.5 bg-hairline hover:bg-faint")}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-faint">Showing {cur.name}, {cur.match}% match</span>
                </div>
              </Card>
              <p className="mt-4 text-[13px] leading-relaxed text-faint">
                The card cycles through real pairings found for this profile — click the dots to step through them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Marquee stats                                                       */
/* ================================================================== */

const EVENTS = [
  "SESSION REQUESTED",
  "SKILL VERIFIED",
  "MATCH FOUND",
  "BADGE EARNED",
  "MENTOR ACCEPTED",
  "REVIEW SUBMITTED",
  "ROADMAP GENERATED",
  "STRIKE ISSUED",
  "SESSION COMPLETED",
  "INTERNSHIP SHORTLISTED",
  "APPEAL APPROVED",
  "SKILL ASSESSED",
];

function Marquees() {
  const rows = [
    { slice: EVENTS.slice(0, 8), dur: "38s", dir: "l" },
    { slice: EVENTS.slice(4, 12), dur: "52s", dir: "r" },
    { slice: [...EVENTS.slice(2, 10), ...EVENTS.slice(0, 2)], dur: "66s", dir: "l" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {rows.map((row, ri) => (
        <div
          key={ri}
          className={cx("absolute left-0 flex w-max", row.dir === "l" ? "marquee-l" : "marquee-r")}
          style={{ ["--dur" as string]: row.dur, top: `${14 + ri * 34}%` }}
        >
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-3 pr-3">
              {row.slice.map((e, i) => (
                <span
                  key={`${dup}-${e}`}
                  className={cx(
                    "whitespace-nowrap rounded-full border border-hairline bg-card/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.09em] backdrop-blur-sm",
                    i % 3 === 1 ? "text-teal/80" : i % 5 === 4 ? "text-primary/80" : "text-muted/80",
                  )}
                >
                  {e}
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function MarqueeStats() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const count = useCountUp(1284309, inView);
  return (
    <section className="relative overflow-hidden border-t border-hairline py-28 sm:py-36">
      <Marquees />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8" ref={ref}>
        <div className="font-display text-[clamp(3.4rem,9vw,7rem)] font-semibold leading-none tracking-[-0.03em] text-ink">
          {fmtUS(count)}
        </div>
        <p className="mt-3 text-[15px] font-medium text-muted">sessions matched on SkillSync</p>
        <div className="mx-auto mt-12 flex max-w-lg items-stretch justify-center divide-x divide-hairline">
          <div className="px-6">
            <div className="font-display text-2xl text-ink">42,180</div>
            <div className="mt-0.5 text-xs text-faint">skills verified</div>
          </div>
          <div className="px-6">
            <div className="font-display text-2xl text-ink">2,340</div>
            <div className="mt-0.5 text-xs text-faint">mentors active</div>
          </div>
          <div className="px-6">
            <div className="font-display text-2xl text-teal">96.2%</div>
            <div className="mt-0.5 text-xs text-faint">sessions completed</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Roles bento                                                         */
/* ================================================================== */

const ROLE_PREVIEWS = [
  { name: "Meera Iyer", teach: "UI Design", want: "Python", match: 94 },
  { name: "Kabir Rao", teach: "Cloud (AWS)", want: "Data Structures", match: 91 },
  { name: "Priya Nair", teach: "Spanish", want: "SQL", match: 78 },
];

function RolesBento() {
  const [idx, setIdx] = useState(0);
  const p = ROLE_PREVIEWS[idx];

  const checks = (items: string[]) => (
    <ul className="mt-6 space-y-2.5">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-2.5 text-sm text-muted">
          <Check size={15} className="mt-0.5 shrink-0 text-teal" strokeWidth={2.4} />
          {it}
        </li>
      ))}
    </ul>
  );

  return (
    <section id="roles" className="border-t border-hairline py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title="One platform, three roles"
          lede="The same skill graph powers a student's session, an employer's shortlist, and a placement cell's report card. Nothing is a separate feature — it's one connected system."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          {/* Student — large panel */}
          <Card className="flex flex-col justify-between gap-8 p-7 sm:p-9 lg:col-span-7">
            <div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
                <GraduationCap size={15} className="text-primary" />
                For students
              </div>
              <h3 className="mt-3 font-display text-[26px] leading-tight tracking-[-0.02em] text-ink">
                Teach what you know, learn what you need
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                A live profile of the skills you offer and the skills you want. Match, session, studio, and
                roadmap all run off that one graph.
              </p>
              {checks(["Skill profile with teach and learn lists", "Peer sessions on both calendars", "Virtual studio with live chat"])}
            </div>

            {/* interactive mini match card */}
            <div className="rounded-xl border border-hairline bg-paper p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">Suggested match</span>
                <button
                  onClick={() => setIdx((i) => (i + 1) % ROLE_PREVIEWS.length)}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary-deep"
                >
                  <RefreshCw size={12} />
                  Show next
                </button>
              </div>
              <div key={p.name} className="anim-fade-in flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={p.name} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{p.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Tag tone="teal">teaches {p.teach}</Tag>
                      <Tag tone="indigo">wants {p.want}</Tag>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl leading-none text-teal">{p.match}%</div>
                  <div className="mt-1 text-[11px] text-faint">fit</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Industry — narrow panel */}
          <Card className="flex flex-col justify-between gap-8 p-7 sm:p-8 lg:col-span-5">
            <div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
                <Building2 size={15} className="text-primary" />
                For industry
              </div>
              <h3 className="mt-3 font-display text-[24px] leading-tight tracking-[-0.02em] text-ink">
                Post a need, meet ranked candidates
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Requirements draw from the same skill graph, so every applicant arrives pre-ranked by real,
                verified skills.
              </p>
              {checks(["Live requirement cards with fit scores", "Shortlist and saved candidate lists", "Verified skills instead of résumé claims"])}
            </div>
            <div className="rounded-xl border border-hairline bg-paper p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">Data Analyst Intern</span>
                <Tag tone="teal">Open</Tag>
              </div>
              <div className="mt-3 space-y-2.5">
                {[
                  { n: "Aarav S.", m: 92 },
                  { n: "Ananya G.", m: 89 },
                  { n: "Simran K.", m: 84 },
                ].map((c) => (
                  <div key={c.n} className="flex items-center gap-3">
                    <span className="w-20 truncate text-xs text-muted">{c.n}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${c.m}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-semibold text-ink">{c.m}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Placement — wide strip panel */}
          <Card className="flex flex-col justify-between gap-8 p-7 sm:p-9 lg:col-span-12 lg:flex-row lg:items-center">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
                <Landmark size={15} className="text-primary" />
                For placement cells
              </div>
              <h3 className="mt-3 font-display text-[24px] leading-tight tracking-[-0.02em] text-ink">
                See the whole campus in one view
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Skill gaps, internship tracking, and violation policy — aggregated from real activity, not
                spreadsheets.
              </p>
              {checks(["Skill intelligence across every student", "Three-strike moderation built in", "Internship tracking with live status"])}
            </div>
            <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-hairline bg-paper p-4">
                <div className="text-xs font-semibold text-muted">Top skill gaps</div>
                <div className="mt-3 space-y-2.5">
                  {[
                    { s: "Cloud (AWS)", v: 34 },
                    { s: "UI Design", v: 28 },
                    { s: "Data Analysis", v: 22 },
                  ].map((g, i) => (
                    <div key={g.s}>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted">{g.s}</span>
                        <span className="font-semibold text-ink">{g.v}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/8">
                        <div
                          className="h-full rounded-full bg-amber"
                          style={{ width: `${g.v}%`, transitionDelay: `${i * 80}ms` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-hairline bg-paper p-4">
                <div className="text-xs font-semibold text-muted">Policy pulse</div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Open reports</span>
                    <span className="font-display text-xl text-ink">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Pending appeals</span>
                    <span className="font-display text-xl text-ink">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Accounts suspended</span>
                    <span className="font-display text-xl text-danger">1</span>
                  </div>
                  <div className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">
                    Three-strike policy active across all campuses
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Partners                                                            */
/* ================================================================== */

function Partners() {
  const partners = [
    { name: "Northwind Labs", cls: "font-display font-semibold tracking-[-0.02em]" },
    { name: "FOLDR", cls: "font-sans font-bold tracking-[0.22em] text-sm" },
    { name: "Gyan.ai", cls: "font-display italic" },
    { name: "CloudLane", cls: "font-sans font-extrabold" },
    { name: "BITS Pilani", cls: "font-display font-medium" },
    { name: "St. Xavier's Mumbai", cls: "font-display font-medium italic" },
    { name: "VIT", cls: "font-sans font-black tracking-wide" },
    { name: "AIMS Pune", cls: "font-display font-semibold" },
  ];
  return (
    <section id="partners" className="border-t border-hairline py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-sm text-muted">Used by placement cells and hiring teams at</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-12 gap-y-6">
          {partners.map((p) => (
            <span
              key={p.name}
              className={cx(
                "cursor-default text-xl text-faint/80 transition-colors duration-300 hover:text-ink",
                p.cls,
              )}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Footer                                                              */
/* ================================================================== */

function Footer() {
  return (
    <footer className="border-t border-hairline py-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              The quiet platform where skills move between people — students, employers, and the cells that
              bring them together.
            </p>
          </div>
          {[
            { h: "Product", links: ["How it works", "For students", "For industry", "For placement cells"] },
            { h: "Company", links: ["About", "Careers", "Press", "Contact"] },
            { h: "Resources", links: ["Help center", "Safety", "Guidelines", "Status"] },
          ].map((col) => (
            <div key={col.h}>
              <div className="text-[13px] font-semibold text-ink">{col.h}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#top" className="text-sm text-muted transition-colors hover:text-ink">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-6">
          <span className="text-xs text-faint">© 2026 SkillSync</span>
          <span className="flex items-center gap-1.5 text-xs text-faint">
            <BadgeCheck size={13} className="text-teal" />
            Made for the people who move skills
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ================================================================== */
/* Landing page                                                        */
/* ================================================================== */

export default function LandingPage() {
  return (
    <div id="top" className="bg-paper text-ink">
      <Nav />
      <main>
        <Hero />
        <MatchSteps />
        <MarqueeStats />
        <RolesBento />
        <Partners />

        {/* closing reveal */}
        <WordmarkReveal className="min-h-screen border-t border-hairline">
          <p className="max-w-md text-[15px] leading-relaxed text-muted">
            Built for the people learning it, the people hiring for it, and the people closing the gap between
            them.
          </p>
          <div className="mt-8">
            <Link to="/register">
              <Button size="lg">
                Create your profile
                <ArrowUpRight size={16} />
              </Button>
            </Link>
          </div>
          <Link to="/login" className="link-quiet mt-5 text-sm text-muted">
            Already have a profile? Log in
          </Link>
        </WordmarkReveal>
      </main>
      <Footer />
    </div>
  );
}