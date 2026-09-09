import { useEffect, useRef, useState, type ReactNode } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return reduced;
}

/* ================================================================== */
/* Hero network — drifting particles, cursor pull, indigo links        */
/* ================================================================== */

interface HNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  ph: number;
  sp: number;
}

export function HeroNetwork({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let nodes: HNode[] = [];
    let raf = 0;
    let running = false;
    const cursor = { x: -9999, y: -9999, sx: -9999, sy: -9999, active: false };

    const size = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const build = () => {
      size();
      const count = Math.max(48, Math.min(120, Math.round((W * H) / 14000)));
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: 0.9 + Math.random() * 1.2,
          ph: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 1.2,
        });
      }
    };

    const drawStatic = () => {
      size();
      ctx.clearRect(0, 0, W, H);
      const step = Math.max(52, Math.min(W, H) / 6);
      const mx = Math.max(2, Math.floor(W / step));
      const my = Math.max(2, Math.floor(H / step));
      const offX = (W - (mx - 1) * step) / 2;
      const offY = (H - (my - 1) * step) / 2;
      ctx.fillStyle = "rgba(20,22,28,0.22)";
      for (let i = 0; i < mx; i++) {
        for (let j = 0; j < my; j++) {
          ctx.beginPath();
          ctx.arc(offX + i * step, offY + j * step, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.strokeStyle = "rgba(20,22,28,0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < mx - 1; i++) {
        for (let j = 0; j < my - 1; j++) {
          const x = offX + i * step;
          const y = offY + j * step;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + step, y);
          ctx.lineTo(x, y + step);
          ctx.stroke();
        }
      }
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      // ease smoothed cursor
      cursor.sx += (cursor.x - cursor.sx) * 0.12;
      cursor.sy += (cursor.y - cursor.sy) * 0.12;
      const cx = cursor.sx;
      const cy = cursor.sy;

      for (const p of nodes) {
        p.vx += Math.sin(t * 0.0009 * p.sp + p.ph) * 0.004;
        p.vy += Math.cos(t * 0.0012 * p.sp + p.ph) * 0.004;
        if (cursor.active) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 180 && d > 0.01) {
            const f = (1 - d / 180) * 0.05;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        p.vx *= 0.962;
        p.vy *= 0.962;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 1.4) {
          p.vx = (p.vx / sp) * 1.4;
          p.vy = (p.vy / sp) * 1.4;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -14) p.x = W + 14;
        if (p.x > W + 14) p.x = -14;
        if (p.y < -14) p.y = H + 14;
        if (p.y > H + 14) p.y = -14;
      }

      const LINK = 128;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const d = Math.sqrt(d2);
          const alpha = (1 - d / LINK) * 0.16;
          const mxp = (a.x + b.x) / 2;
          const myp = (a.y + b.y) / 2;
          const md = Math.hypot(mxp - cx, myp - cy);
          const mix = cursor.active ? Math.max(0, 1 - md / 170) : 0;
          ctx.strokeStyle =
            mix > 0.05
              ? `rgba(79,70,229,${(alpha * (0.35 + 0.65 * mix)).toFixed(3)})`
              : `rgba(20,22,28,${(alpha * 0.85).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const p of nodes) {
        const d = Math.hypot(p.x - cx, p.y - cy);
        const mix = cursor.active ? Math.max(0, 1 - d / 190) : 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle =
          mix > 0.05 ? `rgba(79,70,229,${(0.3 + 0.45 * mix).toFixed(3)})` : `rgba(20,22,28,${(0.16 + 0.1 * mix).toFixed(3)})`;
        ctx.fill();
      }

      if (running) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      cursor.x = e.clientX - r.left;
      cursor.y = e.clientY - r.top;
      cursor.active = true;
      if (!cursor.sx) {
        cursor.sx = cursor.x;
        cursor.sy = cursor.y;
      }
    };
    const onLeave = () => {
      cursor.active = false;
      cursor.x = -9999;
      cursor.y = -9999;
    };

    if (reduced) {
      drawStatic();
      return;
    }

    build();
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!visible) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(wrap);
    running = true;
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      build();
    });
    ro.observe(wrap);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className={className}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
    </div>
  );
}

/* ================================================================== */
/* Wordmark reveal — particles converge into the SkillSync wordmark    */
/* ================================================================== */

interface WNode {
  x: number;
  y: number;
  tx: number;
  ty: number;
  offX: number;
  offY: number;
  vx: number;
  vy: number;
  r: number;
  ph: number;
  indigo: boolean;
  ambient: boolean;
  near: boolean;
}

export function WordmarkReveal({ className, children }: { className?: string; children?: ReactNode }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [assembled, setAssembled] = useState(false);
  const reduced = useReducedMotion();
  const doneRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let disposed = false;
    let particles: WNode[] = [];
    const cursor = { x: -9999, y: -9999 };
    let frameCount = 0;

    const size = () => {
      const r = section.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const sampleWordmark = () => {
      const off = document.createElement("canvas");
      const scale = 2;
      off.width = Math.max(1, Math.round(W * scale));
      off.height = Math.max(1, Math.round(H * scale));
      const octx = off.getContext("2d");
      if (!octx) return [];
      octx.scale(scale, scale);
      const fam = '"Fraunces Variable", Georgia, serif';
      let fs = Math.max(56, W * 0.13);
      octx.font = `700 ${fs}px ${fam}`;
      let tw = octx.measureText("SkillSync").width;
      const targetW = W * 0.62;
      fs = Math.max(40, fs * (targetW / tw));
      octx.font = `700 ${fs}px ${fam}`;
      tw = octx.measureText("SkillSync").width;
      const m = octx.measureText("SkillSync");
      const asc = m.actualBoundingBoxAscent || fs * 0.72;
      const desc = m.actualBoundingBoxDescent || fs * 0.2;
      const x0 = (W - tw) / 2;
      const y0 = (H - (asc + desc)) / 2 + asc - 44;
      octx.textBaseline = "alphabetic";
      octx.fillStyle = "#000";
      octx.fillText("SkillSync", x0, y0);
      const img = octx.getImageData(0, 0, off.width, off.height);
      const pts: { x: number; y: number }[] = [];
      const stride = 3;
      for (let y = 0; y < off.height; y += stride) {
        for (let x = 0; x < off.width; x += stride) {
          if (img.data[(y * off.width + x) * 4 + 3] > 128) {
            pts.push({
              x: x / scale + (Math.random() - 0.5) * 1.4,
              y: y / scale + (Math.random() - 0.5) * 1.4,
            });
          }
        }
      }
      const MAX = 1150;
      if (pts.length > MAX) {
        const step = pts.length / MAX;
        const out: { x: number; y: number }[] = [];
        for (let i = 0; i < pts.length; i += step) out.push(pts[Math.floor(i)]);
        return out.filter((p) => p !== undefined);
      }
      return pts;
    };

    const build = () => {
      size();
      const targets = sampleWordmark();
      // shuffle targets so particles travel interesting paths
      for (let i = targets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [targets[i], targets[j]] = [targets[j], targets[i]];
      }
      const ambientCount = Math.min(46, Math.max(18, Math.round((W * H) / 30000)));
      const total = targets.length + ambientCount;
      particles = new Array(total);
      for (let i = 0; i < total; i++) {
        const ambient = i >= targets.length;
        const sx = Math.random() * W;
        const sy = Math.random() * H;
        const t = ambient ? { x: sx, y: sy } : targets[i];
        particles[i] = {
          x: sx,
          y: sy,
          tx: t.x,
          ty: t.y,
          offX: sx - t.x,
          offY: sy - t.y,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6,
          r: 1.1 + Math.random() * 0.9,
          ph: Math.random() * Math.PI * 2,
          indigo: Math.random() < 0.1,
          ambient,
          near: false,
        };
      }
      frameCount = 0;
      doneRef.current = false;
      setAssembled(false);
    };

    const drawStatic = () => {
      size();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#14161C";
      const fam = '"Fraunces Variable", Georgia, serif';
      const fs = Math.max(56, W * 0.13);
      ctx.font = `700 ${fs}px ${fam}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SkillSync", W / 2, H / 2 - 44);
      if (!doneRef.current) {
        doneRef.current = true;
        setAssembled(true);
      }
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const cx = cursor.x;
      const cy = cursor.y;
      let drift = 0;

      for (const p of particles) {
        if (p.ambient) {
          p.x += Math.sin(t * 0.0006 + p.ph) * 0.3;
          p.y += Math.cos(t * 0.0007 + p.ph * 1.7) * 0.3;
          const rdx = p.x - cx;
          const rdy = p.y - cy;
          const rd = Math.hypot(rdx, rdy);
          if (rd < 130 && rd > 0.01) {
            const f = (1 - rd / 130) * 1.2;
            p.x += (rdx / rd) * f;
            p.y += (rdy / rd) * f;
          }
          if (p.x < -16) p.x = W + 16;
          if (p.x > W + 16) p.x = -16;
          if (p.y < -16) p.y = H + 16;
          if (p.y > H + 16) p.y = -16;
          drift += Math.abs(p.offX) + Math.abs(p.offY);
          continue;
        }

        // cursor repulse
        const dxp = p.x - cx;
        const dyp = p.y - cy;
        const dc = Math.hypot(dxp, dyp);
        if (dc < 150 && dc > 0.01) {
          const f = Math.pow(1 - dc / 150, 2) * 5.2;
          p.vx += (dxp / dc) * f * 0.3;
          p.vy += (dyp / dc) * f * 0.3;
          p.near = true;
        } else {
          p.near = false;
        }
        // spring back toward target
        p.vx += -p.offX * 0.016;
        p.vy += -p.offY * 0.016;
        p.vx *= 0.9;
        p.vy *= 0.9;
        p.offX += p.vx;
        p.offY += p.vy;

        const mag = Math.hypot(p.offX, p.offY);
        drift += mag;
        const settle = Math.max(0, Math.min(1, 1 - mag / 46));
        p.x = p.tx + p.offX + Math.sin(t * 0.0012 + p.ph) * 0.5 * settle;
        p.y = p.ty + p.offY + Math.cos(t * 0.001 + p.ph * 1.3) * 0.5 * settle;
      }

      // draw
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.near ? p.r * 1.35 : p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.near
          ? p.indigo
            ? "rgba(79,70,229,0.95)"
            : "rgba(79,70,229,0.7)"
          : p.indigo
            ? "rgba(79,70,229,0.8)"
            : "rgba(20,22,28,0.68)";
        ctx.fill();
      }

      frameCount++;
      const targeted = particles.filter((p) => !p.ambient).length;
      if (targeted > 0 && frameCount % 20 === 0 && drift / targeted < 2.4 && !doneRef.current) {
        doneRef.current = true;
        setAssembled(true);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      cursor.x = e.clientX - r.left;
      cursor.y = e.clientY - r.top;
    };

    if (reduced) {
      void document.fonts?.ready.then(drawStatic).catch(drawStatic);
      return;
    }

    const start = () => {
      void document.fonts?.ready
        .then(() => {
          if (disposed) return;
          try {
            if (particles.length === 0) build();
          } catch (err) {
            console.error("WordmarkReveal build failed", err);
          }
        })
        .catch((err) => {
          if (disposed) return;
          console.error("fonts.ready failed", err);
          if (particles.length === 0) build();
        });
    };

    // Build immediately and keep the loop running: the section is
    // full-viewport, so forming starts the moment the page loads. A scroll
    // listener + rect check skips drawing work while off-screen without
    // relying on IntersectionObserver, which can be suspended in
    // throttled/embedded contexts.
    start();

    const ro = new ResizeObserver(() => {
      if (particles.length > 0) build();
    });
    ro.observe(section);

    let visible = true;
    const checkVisible = () => {
      const r = section.getBoundingClientRect();
      visible = r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight);
    };
    checkVisible();
    window.addEventListener("scroll", checkVisible, { passive: true });
    window.addEventListener("resize", checkVisible);
    window.addEventListener("pointermove", onMove, { passive: true });

    const originalFrame = frame;
    const guarded = (t: number) => {
      if (visible) originalFrame(t);
      if (!disposed) raf = requestAnimationFrame(guarded);
    };
    running = true;
    raf = requestAnimationFrame(guarded);

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", checkVisible);
      window.removeEventListener("resize", checkVisible);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className={"relative flex min-h-[640px] flex-col items-center overflow-hidden " + (className ?? "")}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <div
        className={cxContent(assembled)}
        style={{ transitionDelay: "300ms" }}
      >
        {children}
      </div>
    </section>
  );
}

function cxContent(assembled: boolean) {
  return (
    "relative z-10 mt-auto flex flex-col items-center px-6 pb-16 pt-40 text-center transition-opacity duration-700 " +
    (assembled ? "opacity-100" : "opacity-0")
  );
}