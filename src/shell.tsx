import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useApp, type Notification } from "./store";
import { Avatar, cx } from "./ui";
import { Logo } from "./landing";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const KIND_TONE: Record<Notification["kind"], string> = {
  session: "bg-primary",
  message: "bg-teal",
  rating: "bg-amber",
  system: "bg-ink/60",
};

function NotificationBell() {
  const { state, markAllRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const unread = state.notifications.filter((n) => !n.read).length;

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
        className="relative rounded-lg border border-hairline bg-card p-2 text-muted transition-colors hover:text-ink"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="anim-pop absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-hairline bg-card shadow-float">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <span className="text-[13px] font-semibold text-ink">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-primary hover:text-primary-deep">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {state.notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-faint">You're all caught up.</div>
            )}
            {state.notifications.map((n) => (
              <div key={n.id} className="flex gap-3 border-b border-hairline/60 px-4 py-3 last:border-0">
                <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-hairline" : KIND_TONE[n.kind])} />
                <div className="min-w-0">
                  <p className={cx("text-[13px] leading-snug", n.read ? "text-muted" : "text-ink")}>{n.text}</p>
                  <p className="mt-0.5 text-[11px] text-faint">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardShell({
  nav,
  active,
  onSelect,
  title,
  children,
  actions,
}: {
  nav: NavItem[];
  active: string;
  onSelect: (id: string) => void;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { currentUser, signOut } = useApp();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);

  if (!currentUser) return null;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <button onClick={() => navigate("/")} className="block">
          <Logo />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                setDrawer(false);
              }}
              className={cx(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary-soft text-primary-deep"
                  : "text-muted hover:bg-ink/4 hover:text-ink",
              )}
            >
              <Icon size={17} className={isActive ? "text-primary" : "text-faint"} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-hairline p-4">
        <div className="flex items-center gap-3">
          <Avatar name={currentUser.name} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-ink">{currentUser.name}</div>
            <div className="truncate text-[11px] text-faint">{currentUser.email}</div>
          </div>
          <button
            onClick={() => {
              signOut();
              navigate("/");
            }}
            className="rounded-md p-1.5 text-faint transition-colors hover:bg-danger-soft hover:text-danger"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-hairline bg-paper lg:block">{sidebar}</aside>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setDrawer(false)} />
          <aside className="anim-fade-in absolute inset-y-0 left-0 w-72 border-r border-hairline bg-paper shadow-float">
            <button
              onClick={() => setDrawer(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-faint hover:text-ink"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-hairline bg-paper/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawer(true)}
                className="rounded-md p-1.5 text-muted hover:text-ink lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={19} />
              </button>
              <h1 className="font-display text-xl tracking-[-0.02em] text-ink sm:text-[22px]">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              {actions}
              <NotificationBell />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}