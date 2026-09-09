import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown, Search, Star, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function useInView<T extends Element>(opts?: { once?: boolean; threshold?: number }) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const once = opts?.once !== false;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) ob.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: opts?.threshold ?? 0.3 },
    );
    ob.observe(el);
    return () => ob.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView] as const;
}

export function useCountUp(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

const AVATAR_PALETTE = [
  { bg: "#ECEFFD", fg: "#4F46E5" },
  { bg: "#E3F3EE", fg: "#1F7A64" },
  { bg: "#FBF1E0", fg: "#A96A12" },
  { bg: "#FBE9F0", fg: "#B23A6E" },
  { bg: "#EDF1F6", fg: "#475569" },
  { bg: "#F3EEFD", fg: "#7C3AED" },
];

export function avatarTone(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type BtnVariant = "primary" | "quiet" | "outline" | "ghost" | "danger" | "dark";
type BtnSize = "sm" | "md" | "lg";

const btnBase =
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 select-none " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-45 disabled:pointer-events-none";

const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-deep active:scale-[0.98]",
  dark: "bg-ink text-paper hover:bg-black active:scale-[0.98]",
  quiet: "text-ink link-quiet rounded-none px-0.5 hover:text-primary",
  outline: "border border-hairline bg-card text-ink hover:border-ink/40 hover:bg-paper active:scale-[0.98]",
  ghost: "text-muted hover:text-ink hover:bg-ink/5",
  danger: "bg-danger text-white hover:bg-[#b93a3a] active:scale-[0.98]",
};

const btnSizes: Record<BtnSize, string> = {
  sm: "text-[13px] px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-[15px] px-6 py-3",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }) {
  return (
    <button className={cx(btnBase, btnVariants[variant], btnSizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Tag                                                                 */
/* ------------------------------------------------------------------ */

type TagTone = "default" | "amber" | "teal" | "indigo" | "danger" | "muted" | "outline";

const tagTones: Record<TagTone, string> = {
  default: "bg-paper text-muted border border-hairline",
  amber: "bg-amber-soft text-[#A96A12] border border-amber/30",
  teal: "bg-teal-soft text-[#16755f] border border-teal/25",
  indigo: "bg-primary-soft text-primary border border-primary/20",
  danger: "bg-danger-soft text-danger border border-danger/25",
  muted: "text-faint border border-hairline",
  outline: "border border-hairline text-ink hover:border-ink/40 hover:bg-paper",
};

export function Tag({
  tone = "default",
  className,
  children,
}: {
  tone?: TagTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-medium leading-5",
        tagTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({ tone, children }: { tone: TagTone; children: ReactNode }) {
  return <Tag tone={tone}>{children}</Tag>;
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function Card({
  className,
  children,
  tone = "white",
}: {
  className?: string;
  children: ReactNode;
  tone?: "white" | "paper" | "tint";
}) {
  return (
    <div
      className={cx(
        "border border-hairline rounded-2xl",
        tone === "white" && "bg-card",
        tone === "paper" && "bg-paper",
        tone === "tint" && "bg-primary-soft/50 border-primary/15",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

export function Avatar({
  name,
  size = "md",
  className,
  tone,
}: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  tone?: { bg: string; fg: string };
}) {
  const t = tone ?? avatarTone(name);
  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
  };
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizes[size],
        className,
      )}
      style={{ background: t.bg, color: t.fg }}
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Progress bar                                                        */
/* ------------------------------------------------------------------ */

export function ProgressBar({
  value,
  className,
  tone = "primary",
}: {
  value: number;
  className?: string;
  tone?: "primary" | "teal" | "amber";
}) {
  const fill = tone === "primary" ? "bg-primary" : tone === "teal" ? "bg-teal" : "bg-amber";
  return (
    <div className={cx("h-1.5 w-full overflow-hidden rounded-full bg-ink/8", className)}>
      <div
        className={cx("h-full rounded-full transition-[width] duration-700 ease-out", fill)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 p-4 backdrop-blur-[2px] sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cx(
          "anim-pop my-auto w-full rounded-2xl border border-hairline bg-card shadow-pop",
          wide ? "max-w-2xl" : "max-w-md",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-4">
          <div className="text-[15px] font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-faint transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-hairline px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

const fieldCls =
  "w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-faint " +
  "focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-shadow";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(fieldCls, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(fieldCls, "min-h-24 resize-y", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cx(fieldCls, "appearance-none pr-9", props.className)}>
        {props.children}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint" />
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search…"}
        className={cx(fieldCls, "pl-9")}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toggle                                                              */
/* ------------------------------------------------------------------ */

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-teal" : "bg-ink/15",
      )}
      aria-pressed={checked}
    >
      <span
        className={cx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Stat card (editorial, hairline-divided rows)                        */
/* ------------------------------------------------------------------ */

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "ink",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  tone?: "ink" | "primary" | "teal" | "amber";
}) {
  const toneCls = {
    ink: "text-ink",
    primary: "text-primary",
    teal: "text-teal",
    amber: "text-[#A96A12]",
  }[tone];
  return (
    <div className="px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[13px] font-medium text-muted">{label}</div>
        {icon && <span className="text-faint">{icon}</span>}
      </div>
      <div className={cx("mt-1 font-display text-3xl leading-none tracking-tight sm:text-[34px]", toneCls)}>
        {value}
      </div>
      {sub && <div className="mt-1.5 text-xs text-faint">{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section heading (quiet, no eyebrow)                                 */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  title,
  lede,
  right,
  className,
}: {
  title: ReactNode;
  lede?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-xl">
        <h2 className="font-display text-[28px] leading-[1.08] tracking-[-0.02em] text-ink sm:text-[34px]">
          {title}
        </h2>
        {lede && <p className="mt-2 text-[15px] leading-relaxed text-muted">{lede}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({ icon, title, body }: { icon?: ReactNode; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline px-6 py-10 text-center">
      {icon && <div className="mb-3 text-faint">{icon}</div>}
      <div className="text-sm font-medium text-ink">{title}</div>
      {body && <div className="mt-1 max-w-xs text-[13px] leading-relaxed text-faint">{body}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Star rating                                                         */
/* ------------------------------------------------------------------ */

export function StarRating({
  value,
  onChange,
  size = 20,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange?.(i)}
          className={cx("transition-transform", onChange && "hover:scale-110")}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={cx(
              i <= shown ? "fill-amber text-amber" : "fill-transparent text-hairline",
              "transition-colors",
            )}
            strokeWidth={1.8}
          />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overflow menu                                                       */
/* ------------------------------------------------------------------ */

export function OverflowMenu({
  items,
  align = "right",
}: {
  items: { label: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-1.5 text-faint transition-colors hover:bg-ink/5 hover:text-ink"
        aria-label="More actions"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
        </svg>
      </button>
      {open && (
        <div
          className={cx(
            "anim-pop absolute top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-hairline bg-card py-1 shadow-float",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={cx(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors",
                it.danger ? "text-danger hover:bg-danger-soft" : "text-ink hover:bg-paper",
              )}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}