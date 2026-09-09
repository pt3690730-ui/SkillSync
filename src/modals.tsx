import { useState, type FormEvent } from "react";
import { useApp, VIOLATION_TYPES } from "./store";
import { Button, Field, Modal, Select, Textarea } from "./ui";

export function ReportModal({
  open,
  onClose,
  userName,
  onReport,
}: {
  open: boolean;
  onClose: () => void;
  userName: string;
  onReport: (reason: string) => void;
}) {
  const [reason, setReason] = useState(VIOLATION_TYPES[0]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onReport(reason);
    setReason(VIOLATION_TYPES[0]);
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Report ${userName}`}
      footer={<Button onClick={submit}>Submit report</Button>}
    >
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">
          Reports go to the moderation team and are reviewed against the three-strike policy. Your name stays
          private.
        </p>
        <Field label="Reason">
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            {VIOLATION_TYPES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}

export function RequestSessionModal({
  open,
  onClose,
  preset,
}: {
  open: boolean;
  onClose: () => void;
  preset?: { day?: string; time?: string; peerId?: string };
}) {
  const { state, getUser, requestSession } = useApp();
  const peers = state.matches.filter((m) => !m.connected && !state.blockedIds.includes(m.peerId));
  const [peerId, setPeerId] = useState(preset?.peerId ?? peers[0]?.peerId ?? "");
  const [skill, setSkill] = useState(state.learnSkills[0] ?? "");
  const [day, setDay] = useState(preset?.day ?? "Mon");
  const [time, setTime] = useState(preset?.time ?? "10:00 AM");
  const [note, setNote] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!peerId) return;
    requestSession(peerId, skill, day, time, note);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request a skill session"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Send request</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Peer">
          <Select value={peerId} onChange={(e) => setPeerId(e.target.value)}>
            {peers.map((p) => {
              const u = getUser(p.peerId);
              return (
                <option key={p.peerId} value={p.peerId}>
                  {u?.name ?? "Peer"}, {p.canTeach.join(", ")}
                </option>
              );
            })}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Skill">
            <Select value={skill} onChange={(e) => setSkill(e.target.value)}>
              {[...state.learnSkills, ...state.teachSkills].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Day">
            <Select value={day} onChange={(e) => setDay(e.target.value)}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Time">
          <Select value={time} onChange={(e) => setTime(e.target.value)}>
            {["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "4:00 PM", "5:30 PM", "6:00 PM", "6:30 PM"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Note (optional)">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What do you want to work on in this session?"
          />
        </Field>
      </form>
    </Modal>
  );
}