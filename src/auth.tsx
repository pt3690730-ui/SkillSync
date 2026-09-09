import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, GraduationCap, Landmark, ShieldCheck } from "lucide-react";
import { useApp, type Role } from "./store";
import { Button, Field, Select, TextInput, cx } from "./ui";
import { Logo } from "./landing";

const ROLE_META: { role: Role; label: string; icon: ReactNode; blurb: string }[] = [
  { role: "student", label: "Student", icon: <GraduationCap size={16} />, blurb: "Learn and teach skills" },
  { role: "industry", label: "Industry", icon: <Building2 size={16} />, blurb: "Hire verified skills" },
  { role: "placement", label: "Placement Cell", icon: <Landmark size={16} />, blurb: "Run campus intelligence" },
  { role: "admin", label: "Admin", icon: <ShieldCheck size={16} />, blurb: "Moderate the platform" },
];

const ROUTE: Record<Role, string> = {
  student: "/app/student",
  industry: "/app/industry",
  placement: "/app/placement",
  admin: "/app/admin",
};

const DEMO_ACCOUNTS: { label: string; email: string; role: Role }[] = [
  { label: "Student", email: "aarav@skillsync.demo", role: "student" },
  { label: "Industry", email: "sara@northwind.demo", role: "industry" },
  { label: "Placement", email: "anita@placement.demo", role: "placement" },
  { label: "Admin", email: "alex@skillsync.demo", role: "admin" },
];

function PasswordField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <TextInput
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className="pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function RoleSelector({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ROLE_META.map((r) => (
        <button
          key={r.role}
          type="button"
          onClick={() => onChange(r.role)}
          className={cx(
            "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200",
            value === r.role
              ? "border-primary/50 bg-primary-soft ring-2 ring-primary/15"
              : "border-hairline bg-card hover:border-ink/25",
          )}
        >
          <span className={cx(value === r.role ? "text-primary" : "text-faint")}>{r.icon}</span>
          <span>
            <span className={cx("block text-[13px] font-semibold", value === r.role ? "text-primary-deep" : "text-ink")}>
              {r.label}
            </span>
            <span className="block text-[11px] leading-tight text-faint">{r.blurb}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function Shell({ title, lede, children }: { title: string; lede: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 py-12">
      <Link to="/" className="mb-8">
        <Logo size="lg" />
      </Link>
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-hairline bg-card p-7 shadow-float sm:p-8">
          <h1 className="font-display text-[26px] leading-tight tracking-[-0.02em] text-ink">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{lede}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
      <p className="mt-8 text-xs text-faint">
        The product stays quiet at the point of commitment — no distractions, just your profile.
      </p>
    </div>
  );
}

export function LoginPage() {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email to continue.");
      return;
    }
    signIn(email.trim(), role);
    navigate(ROUTE[role]);
  };

  const demo = (d: (typeof DEMO_ACCOUNTS)[number]) => {
    signIn(d.email, d.role);
    navigate(ROUTE[d.role]);
  };

  return (
    <Shell title="Welcome back" lede="Log in to pick up where your skills left off.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@campus.edu"
            autoComplete="email"
          />
        </Field>
        <Field label="Password">
          <PasswordField value={password} onChange={setPassword} />
        </Field>
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <Button type="submit" className="w-full" size="lg">
          Continue
        </Button>
      </form>

      <div className="my-6 border-t border-hairline" />

      <div className="text-[13px] font-medium text-muted">Or jump in with a demo account</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {DEMO_ACCOUNTS.map((d) => (
          <button
            key={d.email}
            onClick={() => demo(d)}
            className="rounded-lg border border-hairline bg-paper px-3 py-2 text-left text-[13px] font-medium text-ink transition-all hover:border-primary/40 hover:bg-primary-soft"
          >
            {d.label}
            <span className="block text-[11px] font-normal text-faint">{d.role === "student" ? "Aarav Sharma" : d.email.split("@")[0]}</span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link to="/register" className="link-quiet font-medium text-ink">
          Create an account
        </Link>
      </p>
    </Shell>
  );
}

export function RegisterPage() {
  const { signUp } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [school, setSchool] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }
    signUp(name.trim(), email.trim(), role, school.trim());
    navigate(ROUTE[role]);
  };

  const orgLabel = role === "industry" ? "Company" : role === "placement" ? "Institution" : "School or college";

  return (
    <Shell title="Create your profile" lede="A quiet sign-up. Your skill graph does the talking from here.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@campus.edu"
          />
        </Field>
        <Field label="Password">
          <PasswordField value={password} onChange={setPassword} />
        </Field>
        <Field label="I am joining as">
          <RoleSelector value={role} onChange={setRole} />
        </Field>
        <Field label={orgLabel} hint={role === "student" ? "Shown to peers when you match." : "Shown on your public profile."}>
          <TextInput value={school} onChange={(e) => setSchool(e.target.value)} placeholder={role === "industry" ? "Northwind Labs" : "College of Engineering, Pune"} />
        </Field>
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <Button type="submit" className="w-full" size="lg">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="link-quiet font-medium text-ink">
          Log in
        </Link>
      </p>
    </Shell>
  );
}