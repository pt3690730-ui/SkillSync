import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Role = "student" | "industry" | "placement" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  school?: string;
  company?: string;
  title?: string;
  status: "active" | "suspended";
  strikes: number;
  reputation: number;
  reviewCount: number;
  xp: number;
  joined: string;
}

export interface SessionItem {
  id: string;
  kind: "confirmed" | "pending" | "requested" | "completed";
  skill: string;
  peerId: string;
  day: string;
  time: string;
  note?: string;
}

export interface Slot {
  id: string;
  day: string;
  time: string;
  open: boolean;
}

export interface Internship {
  id: string;
  role: string;
  company: string;
  match: number;
  tags: string[];
  location: string;
  duration: string;
  pay: string;
  mode: string;
}

export interface PeerMatch {
  id: string;
  peerId: string;
  canTeach: string[];
  wants: string[];
  match: number;
  connected: boolean;
  availability: string;
}

export interface ChatMessage {
  id: string;
  from: string; // "me" or userId
  text: string;
  at: string;
}

export interface Conversation {
  id: string;
  peerId: string;
  messages: ChatMessage[];
  unread: number;
}

export interface Notification {
  id: string;
  text: string;
  kind: "session" | "message" | "rating" | "system";
  time: string;
  read: boolean;
}

export interface StudioMsg {
  id: string;
  from: string;
  text: string;
  at: string;
  mine: boolean;
}

export interface Review {
  id: string;
  fromId: string;
  toId: string;
  stars: number;
  text: string;
  at: string;
}

export interface RoadmapStep {
  n: number;
  title: string;
  detail: string;
  duration: string;
  status: "todo" | "doing" | "done";
}

export interface AssessmentQ {
  q: string;
  options: string[];
  answer: number;
}

export interface Candidate {
  userId: string;
  match: number;
}

export interface Requirement {
  id: string;
  title: string;
  company: string;
  postedBy: string;
  skills: string[];
  notes: string;
  location: string;
  duration: string;
  pay: string;
  mode: string;
  status: "Open" | "Shortlisting" | "Closed";
  applicants: Candidate[];
  bestMatch: number;
  shortlisted: string[]; // userIds
}

export interface AdminReport {
  id: string;
  reporterId: string;
  reportedId: string;
  reportedName: string;
  violation: string;
  strikes: number;
  snippet: string;
  evidence: string;
  status: "open" | "resolved";
}

export interface Appeal {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  status: "pending" | "approved" | "denied";
}

export interface AppState {
  users: User[];
  currentUserId: string | null;
  teachSkills: string[];
  learnSkills: string[];
  profileCompletion: number;
  sessions: SessionItem[];
  slots: Slot[];
  internships: Internship[];
  matches: PeerMatch[];
  conversations: Conversation[];
  notifications: Notification[];
  studio: StudioMsg[];
  reviews: Review[];
  roadmap: { target: string; steps: RoadmapStep[] };
  assessment: { taken: boolean; score: number; level: "Beginner" | "Intermediate" | "Advanced" | null };
  requirements: Requirement[];
  savedCandidates: string[];
  reports: AdminReport[];
  appeals: Appeal[];
  blockedIds: string[];
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

let nid = 0;
const nid_ = (p: string) => `${p}-${++nid}`;

const mkUser = (
  id: string,
  name: string,
  email: string,
  role: Role,
  extra: Partial<User> = {},
): User => ({
  id,
  name,
  email,
  role,
  status: "active",
  strikes: 0,
  reputation: 4.5,
  reviewCount: 3,
  xp: 1200,
  joined: "2025-09-01",
  ...extra,
});

const users: User[] = [
  mkUser("u1", "Aarav Sharma", "aarav@skillsync.demo", "student", {
    school: "College of Engineering, Pune",
    reputation: 4.6,
    reviewCount: 6,
    xp: 1350,
  }),
  mkUser("u2", "Meera Iyer", "meera@skillsync.demo", "student", {
    school: "St. Xavier's College, Mumbai",
    reputation: 4.8,
    reviewCount: 9,
    xp: 2210,
  }),
  mkUser("u3", "Kabir Rao", "kabir@skillsync.demo", "student", {
    school: "BITS Pilani",
    reputation: 4.4,
    reviewCount: 5,
    xp: 1890,
  }),
  mkUser("u4", "Ananya Gupta", "ananya@skillsync.demo", "student", {
    school: "Lady Shri Ram College, Delhi",
    reputation: 4.7,
    reviewCount: 8,
    xp: 2430,
  }),
  mkUser("u5", "Rohan Mehta", "rohan@skillsync.demo", "student", {
    school: "VJTI, Mumbai",
    reputation: 4.2,
    reviewCount: 4,
    xp: 1120,
  }),
  mkUser("u6", "Priya Nair", "priya@skillsync.demo", "student", {
    school: "NIT Trichy",
    reputation: 4.9,
    reviewCount: 11,
    xp: 2560,
  }),
  mkUser("u7", "Dev Patel", "dev@skillsync.demo", "student", {
    school: "DA-IICT, Gandhinagar",
    reputation: 4.0,
    reviewCount: 2,
    xp: 980,
  }),
  mkUser("u8", "Simran Kaur", "simran@skillsync.demo", "student", {
    school: "Thapar Institute, Patiala",
    reputation: 4.5,
    reviewCount: 7,
    xp: 1740,
  }),
  mkUser("u9", "Sara Chen", "sara@northwind.demo", "industry", {
    company: "Northwind Labs",
    title: "Talent Lead",
    reputation: 4.6,
    reviewCount: 4,
  }),
  mkUser("u10", "Vikram Anand", "vikram@foldr.demo", "industry", {
    company: "Foldr",
    title: "Engineering Manager",
    reputation: 4.4,
    reviewCount: 3,
  }),
  mkUser("u11", "Dr. Anita Almeida", "anita@placement.demo", "placement", {
    school: "Placement Cell, Pune",
    title: "Director, Placement Cell",
  }),
  mkUser("u12", "Alex Dsouza", "alex@skillsync.demo", "admin", {
    title: "Platform Admin",
  }),
  mkUser("u13", "Sam Johnson", "sam@skillsync.demo", "student", {
    school: "Vellore Institute of Technology",
    status: "suspended",
    strikes: 3,
    reputation: 3.1,
    reviewCount: 2,
  }),
  mkUser("u14", "Neha Verma", "neha@skillsync.demo", "student", {
    school: "Symbiosis, Pune",
    reputation: 4.3,
    reviewCount: 4,
    xp: 1505,
  }),
];

const initialState: AppState = {
  users,
  currentUserId: null,
  teachSkills: ["Python", "Data Structures", "SQL"],
  learnSkills: ["UI Design", "Cloud (AWS)", "Spanish"],
  profileCompletion: 72,
  sessions: [
    { id: "s1", kind: "completed", skill: "Python pair-coding", peerId: "u2", day: "Mon", time: "4:00 PM", note: "Recursion drills" },
    { id: "s2", kind: "completed", skill: "SQL window functions", peerId: "u5", day: "Wed", time: "11:00 AM" },
    { id: "s3", kind: "completed", skill: "Data Structures review", peerId: "u6", day: "Fri", time: "2:00 PM" },
    { id: "s4", kind: "completed", skill: "Python debugging", peerId: "u4", day: "Sat", time: "5:00 PM" },
    { id: "s5", kind: "completed", skill: "Mock interview", peerId: "u8", day: "Sun", time: "10:00 AM" },
    { id: "s6", kind: "confirmed", skill: "Python pair-coding", peerId: "u2", day: "Thu", time: "4:00 PM", note: "Prep for coding round" },
    { id: "s7", kind: "confirmed", skill: "UI Design critique", peerId: "u3", day: "Fri", time: "11:00 AM" },
    { id: "s8", kind: "pending", skill: "Cloud fundamentals", peerId: "u3", day: "Tue", time: "5:30 PM", note: "Asked Kabir to walk through AWS basics" },
    { id: "s9", kind: "requested", skill: "Spanish conversation", peerId: "u6", day: "Wed", time: "6:00 PM" },
  ],
  slots: [
    { id: "sl1", day: "Mon", time: "9:00 AM", open: true },
    { id: "sl2", day: "Mon", time: "11:00 AM", open: true },
    { id: "sl3", day: "Mon", time: "3:00 PM", open: false },
    { id: "sl4", day: "Tue", time: "10:00 AM", open: true },
    { id: "sl5", day: "Tue", time: "2:00 PM", open: true },
    { id: "sl6", day: "Tue", time: "5:30 PM", open: true },
    { id: "sl7", day: "Wed", time: "9:00 AM", open: false },
    { id: "sl8", day: "Wed", time: "1:00 PM", open: true },
    { id: "sl9", day: "Wed", time: "6:00 PM", open: true },
    { id: "sl10", day: "Thu", time: "10:00 AM", open: true },
    { id: "sl11", day: "Thu", time: "4:00 PM", open: false },
    { id: "sl12", day: "Thu", time: "6:30 PM", open: true },
    { id: "sl13", day: "Fri", time: "9:00 AM", open: true },
    { id: "sl14", day: "Fri", time: "11:00 AM", open: false },
    { id: "sl15", day: "Fri", time: "2:00 PM", open: true },
    { id: "sl16", day: "Sat", time: "10:00 AM", open: true },
    { id: "sl17", day: "Sat", time: "5:00 PM", open: true },
  ],
  internships: [
    {
      id: "i1",
      role: "Data Analyst Intern",
      company: "Northwind Labs",
      match: 92,
      tags: ["Python", "SQL", "Excel"],
      location: "Pune",
      duration: "6 months",
      pay: "₹25,000 / month",
      mode: "Hybrid",
    },
    {
      id: "i2",
      role: "Frontend Engineer Intern",
      company: "Foldr",
      match: 88,
      tags: ["React", "UI Design"],
      location: "Remote",
      duration: "4 months",
      pay: "₹30,000 / month",
      mode: "Remote",
    },
    {
      id: "i3",
      role: "ML Research Intern",
      company: "Gyan.ai",
      match: 84,
      tags: ["Python", "Machine Learning"],
      location: "Bengaluru",
      duration: "3 months",
      pay: "₹22,000 / month",
      mode: "On-site",
    },
    {
      id: "i4",
      role: "Cloud Ops Intern",
      company: "CloudLane",
      match: 79,
      tags: ["AWS", "Linux"],
      location: "Mumbai",
      duration: "6 months",
      pay: "₹20,000 / month",
      mode: "Hybrid",
    },
  ],
  matches: [
    {
      id: "m1",
      peerId: "u2",
      canTeach: ["UI Design", "Figma"],
      wants: ["Python", "SQL"],
      match: 94,
      connected: false,
      availability: "Tue 5 PM, Thu 4 PM",
    },
    {
      id: "m2",
      peerId: "u3",
      canTeach: ["Cloud (AWS)", "DevOps"],
      wants: ["Data Structures"],
      match: 91,
      connected: false,
      availability: "Mon 3 PM, Fri 11 AM",
    },
    {
      id: "m3",
      peerId: "u4",
      canTeach: ["Product Thinking", "SQL"],
      wants: ["Python"],
      match: 87,
      connected: false,
      availability: "Wed 1 PM, Sat 10 AM",
    },
    {
      id: "m4",
      peerId: "u5",
      canTeach: ["Machine Learning"],
      wants: ["Data Structures", "Python"],
      match: 82,
      connected: false,
      availability: "Thu 6 PM, Sun 12 PM",
    },
    {
      id: "m5",
      peerId: "u6",
      canTeach: ["Spanish", "Public Speaking"],
      wants: ["Python", "SQL"],
      match: 78,
      connected: false,
      availability: "Wed 6 PM, Sat 5 PM",
    },
  ],
  conversations: [
    {
      id: "c1",
      peerId: "u2",
      unread: 1,
      messages: [
        { id: nid_("m"), from: "u2", text: "Hey! Up for the Python session on Thursday?", at: "10:02 AM" },
        { id: nid_("m"), from: "me", text: "Yes — 4 PM works. Prep for the coding round?", at: "10:05 AM" },
        { id: nid_("m"), from: "u2", text: "Perfect. Can we push to 4:30? Lecture runs late.", at: "10:11 AM" },
      ],
    },
    {
      id: "c2",
      peerId: "u3",
      unread: 0,
      messages: [
        { id: nid_("m"), from: "me", text: "Sent you the Cloud fundamentals notes.", at: "Yesterday" },
        { id: nid_("m"), from: "u3", text: "Got them, thanks! I'll have the AWS walkthrough ready for Tuesday.", at: "Yesterday" },
      ],
    },
    {
      id: "c3",
      peerId: "u9",
      unread: 2,
      messages: [
        { id: nid_("m"), from: "u9", text: "Hi Aarav, your Data Analyst application is shortlisted for a first round.", at: "Mon" },
        { id: nid_("m"), from: "me", text: "That's great news — thank you! I'm free Thursday or Friday.", at: "Mon" },
        { id: nid_("m"), from: "u9", text: "Thursday 4:30 works. Send a quick 10-line intro when you can.", at: "Mon" },
      ],
    },
  ],
  notifications: [
    { id: nid_("n"), text: "Meera accepted your session request for Thursday 4:30 PM.", kind: "session", time: "12 min ago", read: false },
    { id: nid_("n"), text: "Upcoming session: Python pair-coding today at 4:00 PM.", kind: "session", time: "1 hr ago", read: false },
    { id: nid_("n"), text: "Sara Chen sent you a message about your application.", kind: "message", time: "2 hrs ago", read: false },
    { id: nid_("n"), text: "Rohan rated your session 5 stars.", kind: "rating", time: "Yesterday", read: true },
    { id: nid_("n"), text: "Your roadmap for UI Design was generated.", kind: "system", time: "Yesterday", read: true },
  ],
  studio: [
    { id: nid_("s"), from: "Meera Iyer", text: "Can you share your screen for the recursion example?", at: "3:58 PM", mine: false },
    { id: nid_("s"), from: "You", text: "Sure, give me a second.", at: "3:59 PM", mine: true },
    { id: nid_("s"), from: "Kabir Rao", text: "I'll drop the whiteboard link in chat.", at: "3:59 PM", mine: false },
  ],
  reviews: [
    { id: nid_("r"), fromId: "u5", toId: "u1", stars: 5, text: "Great explanations, very patient with my doubts.", at: "2 days ago" },
    { id: nid_("r"), fromId: "u6", toId: "u1", stars: 5, text: "Clear walkthrough of BFS vs DFS.", at: "1 week ago" },
    { id: nid_("r"), fromId: "u4", toId: "u1", stars: 4, text: "Helpful session, could go a bit slower on theory.", at: "3 weeks ago" },
  ],
  roadmap: {
    target: "UI Design",
    steps: [
      { n: 1, title: "Foundations of color and type", detail: "Contrast, hierarchy, and the type scale that carries a layout.", duration: "Week 1", status: "done" },
      { n: 2, title: "Layout systems", detail: "Grids, spacing rhythm, and why alignment reads as polish.", duration: "Week 2", status: "doing" },
      { n: 3, title: "Hands-on with Figma", detail: "Auto-layout, components, and variants.", duration: "Week 3", status: "todo" },
      { n: 4, title: "Prototyping and motion", detail: "Frames, flows, and micro-interactions that explain a product.", duration: "Week 4", status: "todo" },
      { n: 5, title: "Portfolio case study", detail: "One polished case study that a hiring team can read in 3 minutes.", duration: "Week 5", status: "todo" },
    ],
  },
  assessment: { taken: false, score: 0, level: null },
  requirements: [
    {
      id: "r1",
      title: "Data Analyst Intern",
      company: "Northwind Labs",
      postedBy: "u9",
      skills: ["Python", "SQL", "Excel"],
      notes: "Looking for someone comfortable cleaning data and explaining findings to non-technical stakeholders.",
      location: "Pune",
      duration: "6 months",
      pay: "₹25,000 / month",
      mode: "Hybrid",
      status: "Open",
      applicants: [
        { userId: "u1", match: 92 },
        { userId: "u4", match: 89 },
        { userId: "u8", match: 84 },
      ],
      bestMatch: 92,
      shortlisted: ["u1"],
    },
    {
      id: "r2",
      title: "Frontend Engineer Intern",
      company: "Foldr",
      postedBy: "u10",
      skills: ["React", "TypeScript", "UI Design"],
      notes: "Design-minded builder for our design system team.",
      location: "Remote",
      duration: "4 months",
      pay: "₹30,000 / month",
      mode: "Remote",
      status: "Shortlisting",
      applicants: [
        { userId: "u3", match: 91 },
        { userId: "u2", match: 86 },
        { userId: "u7", match: 78 },
      ],
      bestMatch: 91,
      shortlisted: [],
    },
    {
      id: "r3",
      title: "Content Design Intern",
      company: "Gyan.ai",
      postedBy: "u9",
      skills: ["Writing", "Figma"],
      notes: "UX writing for our learner-facing flows.",
      location: "Bengaluru",
      duration: "3 months",
      pay: "₹18,000 / month",
      mode: "On-site",
      status: "Open",
      applicants: [
        { userId: "u6", match: 88 },
        { userId: "u5", match: 74 },
      ],
      bestMatch: 88,
      shortlisted: [],
    },
    {
      id: "r4",
      title: "DevOps Intern",
      company: "CloudLane",
      postedBy: "u10",
      skills: ["AWS", "Docker", "Linux"],
      notes: "Filled — keeping for the placement record.",
      location: "Mumbai",
      duration: "6 months",
      pay: "₹20,000 / month",
      mode: "Hybrid",
      status: "Closed",
      applicants: [
        { userId: "u3", match: 85 },
        { userId: "u8", match: 81 },
      ],
      bestMatch: 85,
      shortlisted: ["u3"],
    },
  ],
  savedCandidates: ["u2", "u6"],
  reports: [
    {
      id: "rp1",
      reporterId: "u6",
      reportedId: "u13",
      reportedName: "Sam Johnson",
      violation: "Harassment",
      strikes: 1,
      snippet: "Repeatedly messaged Priya after she asked him to stop.",
      evidence:
        "Chat log excerpt (verified): Priya: 'Please stop messaging me.' Sam: 'Come on, one session...' followed by 6 further messages over 3 days.",
      status: "open",
    },
    {
      id: "rp2",
      reporterId: "u7",
      reportedId: "u13",
      reportedName: "Sam Johnson",
      violation: "Spam",
      strikes: 2,
      snippet: "Posted the same 'guaranteed marks' link in 9 different sessions.",
      evidence:
        "Nine session chats contain the identical external link, timestamped within a 40-minute window.",
      status: "open",
    },
    {
      id: "rp3",
      reporterId: "u8",
      reportedId: "u13",
      reportedName: "Sam Johnson",
      violation: "Fake profile",
      strikes: 3,
      snippet: "Profile claims an internship at a company that has no record of him.",
      evidence:
        "Placement cell contacted the company listed on the profile; HR confirmed no such internship was offered.",
      status: "open",
    },
    {
      id: "rp4",
      reporterId: "u2",
      reportedId: "u7",
      reportedName: "Dev Patel",
      violation: "Cheating",
      strikes: 1,
      snippet: "Shared quiz answers in a public studio session.",
      evidence:
        "Studio transcript shows answers posted 2 minutes before the assessment closed for other participants.",
      status: "open",
    },
    {
      id: "rp5",
      reporterId: "u1",
      reportedId: "u13",
      reportedName: "Sam Johnson",
      violation: "Inappropriate content",
      strikes: 1,
      snippet: "Inappropriate remark in a shared studio.",
      evidence: "Flagged by two participants in the session; transcript reviewed by a moderator.",
      status: "open",
    },
  ],
  appeals: [
    { id: "ap1", userId: "u13", userName: "Sam Johnson", reason: "I've removed the links and accept the strikes. Asking for one more chance.", status: "pending" },
    { id: "ap2", userId: "u7", userName: "Dev Patel", reason: "The answers were already public in a study group; I didn't know the quiz was closed.", status: "pending" },
  ],
  blockedIds: [],
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export interface Store {
  state: AppState;
  currentUser: User | null;
  getUser: (id: string) => User | undefined;
  signIn: (email: string, role: Role) => void;
  signUp: (name: string, email: string, role: Role, school: string) => void;
  signOut: () => void;
  addTeachSkill: (name: string) => void;
  removeTeachSkill: (name: string) => void;
  addLearnSkill: (name: string) => void;
  removeLearnSkill: (name: string) => void;
  requestSession: (peerId: string, skill: string, day: string, time: string, note: string) => void;
  connectWith: (peerId: string) => void;
  sendMessage: (convId: string, text: string) => void;
  markConvRead: (convId: string) => void;
  sendStudio: (text: string) => void;
  rateUser: (toId: string, stars: number, text: string) => void;
  submitAssessment: (answers: number[]) => void;
  generateRoadmap: (target: string) => void;
  reportUser: (reportedId: string, reason: string) => void;
  blockUser: (userId: string) => void;
  postRequirement: (data: { title: string; skills: string[]; notes: string; location: string; duration: string; pay: string; mode: string }) => void;
  shortlistCandidate: (reqId: string, userId: string) => void;
  toggleSaved: (userId: string) => void;
  issueStrike: (reportId: string) => void;
  decideAppeal: (appealId: string, approve: boolean) => void;
  suspendUser: (userId: string) => void;
  reinstateUser: (userId: string) => void;
  markAllRead: () => void;
  awardXp: (n: number) => void;
}

const Ctx = createContext<Store | null>(null);

const ROADMAP_TEMPLATES: Record<string, { title: string; detail: string; duration: string }[]> = {
  "UI Design": [
    { title: "Foundations of color and type", detail: "Contrast, hierarchy, and the type scale that carries a layout.", duration: "Week 1" },
    { title: "Layout systems", detail: "Grids, spacing rhythm, and why alignment reads as polish.", duration: "Week 2" },
    { title: "Hands-on with Figma", detail: "Auto-layout, components, and variants.", duration: "Week 3" },
    { title: "Prototyping and motion", detail: "Frames, flows, and micro-interactions that explain a product.", duration: "Week 4" },
    { title: "Portfolio case study", detail: "One polished case study a hiring team can read in three minutes.", duration: "Week 5" },
  ],
  "Cloud (AWS)": [
    { title: "Networking and IAM basics", detail: "VPCs, subnets, and least-privilege access.", duration: "Week 1" },
    { title: "Compute and storage", detail: "EC2, S3, and when each fits.", duration: "Week 2" },
    { title: "Serverless patterns", detail: "Lambda, API Gateway, and a working first endpoint.", duration: "Week 3" },
    { title: "Deploy a real app", detail: "CI/CD to a live environment with monitoring.", duration: "Week 4" },
  ],
  Spanish: [
    { title: "Everyday phrases", detail: "Greetings, numbers, and ordering with confidence.", duration: "Week 1" },
    { title: "Present-tense rhythm", detail: "Conjugation patterns for regular verbs.", duration: "Week 2" },
    { title: "Conversation practice", detail: "Two live sessions with a native speaker.", duration: "Week 3" },
    { title: "Reading short stories", detail: "Graded readers to build vocabulary.", duration: "Week 4" },
  ],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const pushNotification = (s: AppState, text: string, kind: Notification["kind"], time = "Just now"): AppState => ({
    ...s,
    notifications: [{ id: nid_("n"), text, kind, time, read: false }, ...s.notifications],
  });

  const awardXp = useCallback(
    (n: number) => {
      update((s) => {
        if (!s.currentUserId) return s;
        return {
          ...s,
          users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, xp: u.xp + n } : u)),
        };
      });
    },
    [update],
  );

  const api = useMemo<Store>(() => {
    const me = (s: AppState) => s.users.find((u) => u.id === s.currentUserId) ?? null;

    return {
      state,
      getUser: (id) => state.users.find((u) => u.id === id),
      currentUser: me(state),

      signIn: (email, role) => {
        update((s) => {
          const found = s.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
          if (found) return { ...s, currentUserId: found.id };
          const nu = mkUser(`u-${Date.now()}`, email.split("@")[0].replace(/[._-]/g, " ") || "Guest", email, role);
          return { ...s, users: [...s.users, nu], currentUserId: nu.id };
        });
      },

      signUp: (name, email, role, school) => {
        update((s) => {
          const nu = mkUser(`u-${Date.now()}`, name, email, role, {
            school: school || (role === "student" ? "College of Engineering, Pune" : undefined),
            company: role === "industry" ? school || "Northwind Labs" : undefined,
            title: role === "industry" ? "Talent Lead" : role === "placement" ? "Placement Officer" : undefined,
            xp: 0,
          });
          return {
            ...s,
            users: [...s.users, nu],
            currentUserId: nu.id,
            notifications: [
              { id: nid_("n"), text: `Welcome to SkillSync, ${name.split(" ")[0]}.`, kind: "system", time: "Just now", read: false },
              ...s.notifications,
            ],
          };
        });
      },

      signOut: () => update((s) => ({ ...s, currentUserId: null })),

      addTeachSkill: (name) =>
        update((s) =>
          s.teachSkills.includes(name)
            ? s
            : { ...s, teachSkills: [...s.teachSkills, name], profileCompletion: Math.min(100, s.profileCompletion + 6) },
        ),
      removeTeachSkill: (name) =>
        update((s) => ({
          ...s,
          teachSkills: s.teachSkills.filter((t) => t !== name),
          profileCompletion: Math.max(30, s.profileCompletion - 6),
        })),
      addLearnSkill: (name) =>
        update((s) =>
          s.learnSkills.includes(name)
            ? s
            : { ...s, learnSkills: [...s.learnSkills, name], profileCompletion: Math.min(100, s.profileCompletion + 6) },
        ),
      removeLearnSkill: (name) =>
        update((s) => ({
          ...s,
          learnSkills: s.learnSkills.filter((t) => t !== name),
          profileCompletion: Math.max(30, s.profileCompletion - 6),
        })),

      requestSession: (peerId, skill, day, time, note) =>
        update((s) => {
          const peer = s.users.find((u) => u.id === peerId);
          const s2: AppState = {
            ...s,
            sessions: [
              ...s.sessions,
              { id: nid_("s"), kind: "requested", skill, peerId, day, time, note },
            ],
          };
          const s3 = pushNotification(
            s2,
            `Session request sent to ${peer?.name ?? "your peer"} for ${day} at ${time}.`,
            "session",
          );
          return { ...s3, users: s3.users.map((u) => (u.id === s.currentUserId ? { ...u, xp: u.xp + 10 } : u)) };
        }),

      connectWith: (peerId) =>
        update((s) => {
          const peer = s.users.find((u) => u.id === peerId);
          const s2: AppState = {
            ...s,
            matches: s.matches.map((m) => (m.peerId === peerId ? { ...m, connected: true } : m)),
            conversations: [
              ...s.conversations,
              {
                id: nid_("c"),
                peerId,
                unread: 0,
                messages: [
                  { id: nid_("m"), from: "me", text: `Hi ${peer?.name.split(" ")[0] ?? ""}! Found you through SkillSync — up for a session?`, at: "Just now" },
                ],
              },
            ],
          };
          const s3 = pushNotification(s2, `You connected with ${peer?.name ?? "a new peer"}.`, "system");
          return { ...s3, users: s3.users.map((u) => (u.id === s.currentUserId ? { ...u, xp: u.xp + 35 } : u)) };
        }),

      sendMessage: (convId, text) => {
        update((s) => {
          const conv = s.conversations.find((c) => c.id === convId);
          if (!conv) return s;
          const peer = s.users.find((u) => u.id === conv.peerId);
          const s2: AppState = {
            ...s,
            conversations: s.conversations.map((c) =>
              c.id === convId
                ? { ...c, messages: [...c.messages, { id: nid_("m"), from: "me", text, at: "Just now" }] }
                : c,
            ),
          };
          return s2;
        });
        // simulated reply
        window.setTimeout(() => {
          update((s) => {
            const conv = s.conversations.find((c) => c.id === convId);
            if (!conv) return s;
            const peer = s.users.find((u) => u.id === conv.peerId);
            const replies = [
              "Got it — let me check my calendar and get back to you.",
              "Sounds good to me. See you there!",
              "Nice, I'll prep a few examples before we meet.",
            ];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            return {
              ...s,
              conversations: s.conversations.map((c) =>
                c.id === convId
                  ? { ...c, messages: [...c.messages, { id: nid_("m"), from: conv.peerId, text: reply, at: "Just now" }] }
                  : c,
              ),
              notifications: [
                { id: nid_("n"), text: `${peer?.name.split(" ")[0] ?? "Your peer"} replied to your message.`, kind: "message", time: "Just now", read: false },
                ...s.notifications,
              ],
            };
          });
        }, 1500);
      },

      markConvRead: (convId) =>
        update((s) => ({
          ...s,
          conversations: s.conversations.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)),
        })),

      sendStudio: (text) => {
        update((s) => ({
          ...s,
          studio: [...s.studio, { id: nid_("s"), from: "You", text, at: "Just now", mine: true }],
        }));
        window.setTimeout(() => {
          update((s) => ({
            ...s,
            studio: [
              ...s.studio,
              {
                id: nid_("s"),
                from: s.studio[0]?.from ?? "Meera Iyer",
                text: "Nice, I can see it now.",
                at: "Just now",
                mine: false,
              },
            ],
          }));
        }, 1400);
      },

      rateUser: (toId, stars, text) =>
        update((s) => {
          const s2: AppState = {
            ...s,
            reviews: [{ id: nid_("r"), fromId: s.currentUserId ?? "u1", toId, stars, text, at: "Just now" }, ...s.reviews],
            users: s.users.map((u) => {
              if (u.id !== toId) return u;
              const count = u.reviewCount + 1;
              const rep = Math.round(((u.reputation * u.reviewCount + stars) / count) * 10) / 10;
              return { ...u, reputation: rep, reviewCount: count };
            }),
          };
          const target = s.users.find((u) => u.id === toId);
          const s3 = pushNotification(s2, `You rated ${target?.name.split(" ")[0] ?? "your peer"} ${stars} stars.`, "rating");
          return { ...s3, users: s3.users.map((u) => (u.id === s.currentUserId ? { ...u, xp: u.xp + 25 } : u)) };
        }),

      submitAssessment: (answers) =>
        update((s) => {
          const qs = ASSESSMENT_QUESTIONS;
          const score = answers.filter((a, i) => a === qs[i].answer).length;
          const pct = Math.round((score / qs.length) * 100);
          const level: "Beginner" | "Intermediate" | "Advanced" = pct >= 80 ? "Advanced" : pct >= 55 ? "Intermediate" : "Beginner";
          const s2: AppState = {
            ...s,
            assessment: { taken: true, score: pct, level },
          };
          const s3 = pushNotification(s2, `Assessment complete: ${level} (${pct}%).`, "system");
          return { ...s3, users: s3.users.map((u) => (u.id === s.currentUserId ? { ...u, xp: u.xp + 60 } : u)) };
        }),

      generateRoadmap: (target) =>
        update((s) => {
          const template = ROADMAP_TEMPLATES[target] ?? [
            { title: "Core concepts", detail: "The vocabulary and mental model for this skill.", duration: "Week 1" },
            { title: "Guided practice", detail: "Two mentor-led sessions with structured exercises.", duration: "Week 2" },
            { title: "Build something real", detail: "A small portfolio piece using the skill.", duration: "Week 3" },
            { title: "Peer review and polish", detail: "Share it, take feedback, refine.", duration: "Week 4" },
          ];
          const steps: RoadmapStep[] = template.map((t, i) => ({
            n: i + 1,
            title: t.title,
            detail: t.detail,
            duration: t.duration,
            status: i === 0 ? "done" : i === 1 ? "doing" : "todo",
          }));
          const s2: AppState = { ...s, roadmap: { target, steps } };
          return pushNotification(s2, `Roadmap generated for ${target}.`, "system");
        }),

      reportUser: (reportedId, reason) =>
        update((s) => {
          const reported = s.users.find((u) => u.id === reportedId);
          const s2: AppState = {
            ...s,
            reports: [
              {
                id: nid_("rp"),
                reporterId: s.currentUserId ?? "u1",
                reportedId,
                reportedName: reported?.name ?? "Unknown",
                violation: reason,
                strikes: reported?.strikes ?? 0,
                snippet: `Reported by ${me(s)?.name ?? "a user"} for ${reason.toLowerCase()}.`,
                evidence: `Auto-captured context: the report was filed from a session or match card on ${new Date().toLocaleDateString()}. Awaiting moderator review.`,
                status: "open",
              },
              ...s.reports,
            ],
          };
          return pushNotification(s2, `Report filed for ${reported?.name ?? "user"}. Our moderation team will review it.`, "system");
        }),

      blockUser: (userId) =>
        update((s) => {
          const blocked = s.users.find((u) => u.id === userId);
          const s2: AppState = {
            ...s,
            blockedIds: [...s.blockedIds, userId],
            matches: s.matches.filter((m) => m.peerId !== userId),
            conversations: s.conversations.filter((c) => c.peerId !== userId),
          };
          return pushNotification(s2, `${blocked?.name ?? "That user"} is blocked and removed from your lists.`, "system");
        }),

      postRequirement: (data) =>
        update((s) => {
          const s2: AppState = {
            ...s,
            requirements: [
              {
                id: nid_("r"),
                title: data.title,
                company: me(s)?.company ?? "Your company",
                postedBy: s.currentUserId ?? "",
                skills: data.skills,
                notes: data.notes,
                location: data.location,
                duration: data.duration,
                pay: data.pay,
                mode: data.mode,
                status: "Open",
                applicants: [],
                bestMatch: 0,
                shortlisted: [],
              },
              ...s.requirements,
            ],
          };
          return pushNotification(s2, `Requirement "${data.title}" is live.`, "system");
        }),

      shortlistCandidate: (reqId, userId) =>
        update((s) => ({
          ...s,
          requirements: s.requirements.map((r) =>
            r.id === reqId
              ? {
                  ...r,
                  shortlisted: r.shortlisted.includes(userId)
                    ? r.shortlisted.filter((x) => x !== userId)
                    : [...r.shortlisted, userId],
                }
              : r,
          ),
        })),

      toggleSaved: (userId) =>
        update((s) => ({
          ...s,
          savedCandidates: s.savedCandidates.includes(userId)
            ? s.savedCandidates.filter((x) => x !== userId)
            : [...s.savedCandidates, userId],
        })),

      issueStrike: (reportId) =>
        update((s) => {
          const report = s.reports.find((r) => r.id === reportId);
          if (!report) return s;
          const newStrikes = report.strikes + 1;
          const suspended = newStrikes >= 3;
          const s2: AppState = {
            ...s,
            reports: s.reports.map((r) =>
              r.id === reportId ? { ...r, strikes: newStrikes, status: suspended ? "resolved" : r.status } : r,
            ),
            users: s.users.map((u) =>
              u.id === report.reportedId
                ? { ...u, strikes: newStrikes, status: suspended ? "suspended" : u.status }
                : u,
            ),
          };
          const name = s.users.find((u) => u.id === report.reportedId)?.name ?? report.reportedName;
          const msg = suspended
            ? `${name} was suspended after reaching 3 strikes.`
            : `Strike ${newStrikes}/3 issued to ${name}.`;
          return pushNotification(s2, msg, "system");
        }),

      decideAppeal: (appealId, approve) =>
        update((s) => {
          const appeal = s.appeals.find((a) => a.id === appealId);
          if (!appeal) return s;
          const s2: AppState = {
            ...s,
            appeals: s.appeals.map((a) => (a.id === appealId ? { ...a, status: approve ? "approved" : "denied" } : a)),
            users: s.users.map((u) =>
              approve && u.id === appeal.userId ? { ...u, status: "active" } : u,
            ),
          };
          return pushNotification(s2, `Appeal ${approve ? "approved" : "denied"} for ${appeal.userName}.`, "system");
        }),

      suspendUser: (userId) =>
        update((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === userId ? { ...u, status: "suspended" } : u)),
        })),

      reinstateUser: (userId) =>
        update((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === userId ? { ...u, status: "active", strikes: 0 } : u)),
        })),

      markAllRead: () =>
        update((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      awardXp,
    };
  }, [state, update, awardXp]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Shared static data                                                  */
/* ------------------------------------------------------------------ */

export const ASSESSMENT_QUESTIONS: AssessmentQ[] = [
  {
    q: "Which data structure gives you first-in, first-out order?",
    options: ["Stack", "Queue", "Hash map", "Heap"],
    answer: 1,
  },
  {
    q: "What is the time complexity of binary search on a sorted array?",
    options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
    answer: 2,
  },
  {
    q: "In Python, what does a list comprehension return?",
    options: ["A generator", "A tuple", "A new list", "A set"],
    answer: 2,
  },
  {
    q: "Which HTTP method is conventionally used to update an existing resource?",
    options: ["GET", "POST", "PUT", "DELETE"],
    answer: 2,
  },
  {
    q: "A closure is best described as:",
    options: [
      "A function that remembers its enclosing scope",
      "A class with private fields",
      "A promise that never resolves",
      "A global variable",
    ],
    answer: 0,
  },
];

export const BADGES: {
  id: string;
  name: string;
  desc: string;
  earned: (s: AppState) => boolean;
  progress?: (s: AppState) => string;
}[] = [
  {
    id: "top-mentor",
    name: "Top Mentor",
    desc: "Reputation of 4.6 or higher from peers.",
    earned: (s) => {
      const u = s.users.find((x) => x.id === s.currentUserId);
      return !!u && u.reputation >= 4.6;
    },
    progress: (s) => {
      const u = s.users.find((x) => x.id === s.currentUserId);
      return u ? `${u.reputation.toFixed(1)} / 4.6` : "";
    },
  },
  {
    id: "five-sessions",
    name: "5 Sessions Completed",
    desc: "Complete five peer sessions.",
    earned: (s) => s.sessions.filter((x) => x.kind === "completed" || x.kind === "confirmed").length >= 5,
    progress: (s) => `${s.sessions.filter((x) => x.kind === "completed" || x.kind === "confirmed").length} / 5`,
  },
  {
    id: "highly-rated",
    name: "Highly Rated",
    desc: "Average incoming rating of 4.5 or higher.",
    earned: (s) => {
      const u = s.users.find((x) => x.id === s.currentUserId);
      return !!u && u.reputation >= 4.5;
    },
    progress: (s) => {
      const u = s.users.find((x) => x.id === s.currentUserId);
      return u ? `${u.reputation.toFixed(1)} / 4.5` : "";
    },
  },
  {
    id: "skill-expert",
    name: "Skill Expert",
    desc: "Score Advanced on any skill assessment.",
    earned: (s) => s.assessment.level === "Advanced",
    progress: (s) => s.assessment.level ?? "Not assessed",
  },
  {
    id: "reliable-learner",
    name: "Reliable Learner",
    desc: "Reach 2,000 XP through active sessions.",
    earned: (s) => {
      const u = s.users.find((x) => x.id === s.currentUserId);
      return !!u && u.xp >= 2000;
    },
    progress: (s) => {
      const u = s.users.find((x) => x.id === s.currentUserId);
      return u ? `${u.xp} / 2000 XP` : "";
    },
  },
];

export const VIOLATION_TYPES = [
  "Harassment",
  "Spam",
  "Cheating",
  "Fake profile",
  "Inappropriate content",
  "Other",
];

export const fmt = (n: number) => n.toLocaleString("en-IN");