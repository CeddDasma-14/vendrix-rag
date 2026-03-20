"use client";

import Link from "next/link";
import React, { useRef, useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import robotAnimation from "../../public/Robot.json";
import {
  Zap, Search, UserCheck, CalendarCheck, ArrowRight,
  MessageSquare, Database, Cpu, Globe, TrendingUp, Clock, Star, ShieldCheck,
  ChevronUp, ChevronDown, Plus, Minus,
} from "lucide-react";

/* ── Fade-up on scroll ── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── 3D tilt card (mouse tracking) ── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 100, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rawX.set(dy * -10);
    rawY.set(dx * 10);
  };

  const handleMouseLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Particles ── */
const COLORS = [
  "#818cf8", "#a78bfa", "#c084fc", "#6366f1", "#e879f9", "#7c3aed",
];
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  left: `${(i * 31 + 3) % 97}%`,
  top: `${(i * 47 + 8) % 90}%`,
  size: i % 4 === 0 ? 4 : i % 4 === 1 ? 3 : i % 4 === 2 ? 2 : 1.5,
  floatDuration: 6 + (i % 7) * 1.2,
  pulseDuration: 1.5 + (i % 5) * 0.5,
  delay: (i * 0.35) % 8,
  color: COLORS[i % COLORS.length],
}));

function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            color: p.color,
            animation: `float-particle ${p.floatDuration}s ${p.delay}s ease-in-out infinite, firefly-pulse ${p.pulseDuration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Aurora beam ── */
function AuroraBeam() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      <div
        className="absolute top-0 h-full w-[200px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.08), rgba(167,139,250,0.06), transparent)",
          animation: "aurora-sweep 8s 2s ease-in-out infinite",
        }}
      />
    </motion.div>
  );
}

/* ── Floating orb ── */
function FloatingOrb({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={{ y: [0, -24, 0], scale: [1, 1.04, 1] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ── Stagger container ── */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

/* ── Section dot navigator ── */
const SECTIONS = [
  { id: "hero",          label: "Home" },
  { id: "trust",         label: "Technology" },
  { id: "problem",       label: "Why Vendrix" },
  { id: "how-it-works",  label: "How It Works" },
  { id: "features",      label: "Features" },
  { id: "social-proof",  label: "Testimonials" },
  { id: "pricing",       label: "Pricing" },
  { id: "faq",           label: "FAQ" },
  { id: "cta",           label: "Get Started" },
];

function SectionNav() {
  const [active, setActive] = useState("hero");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-3 hidden lg:flex">
      {SECTIONS.map(({ id, label }) => (
        <div
          key={id}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => scrollTo(id)}
          onMouseEnter={() => setHovered(id)}
          onMouseLeave={() => setHovered(null)}
        >
          <AnimatePresence>
            {hovered === id && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="text-xs font-medium text-slate-300 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
          <motion.div
            animate={{
              scale: active === id ? 1.4 : hovered === id ? 1.2 : 1,
              backgroundColor: active === id ? "#6366f1" : hovered === id ? "#818cf8" : "#334155",
            }}
            transition={{ duration: 0.2 }}
            className="w-2 h-2 rounded-full"
          />
        </div>
      ))}
    </div>
  );
}

/* ── Scroll progress bar ── */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setProgress(scrolled * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[100] bg-slate-800/50">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* ── Back to top button ── */
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-colors"
        >
          <ChevronUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inView.current) {
        inView.current = true;
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── FAQ item ── */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="border border-slate-800 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-[#131929] hover:bg-slate-800/60 transition-colors"
      >
        <span className="text-sm font-semibold text-white pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          {open ? <Minus size={16} className="text-indigo-400 flex-shrink-0" /> : <Plus size={16} className="text-slate-500 flex-shrink-0" />}
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-6 py-4 text-sm text-slate-400 leading-relaxed bg-[#0f172a] border-t border-slate-800">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Glowing divider ── */
function GlowDivider() {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="w-full h-px origin-left"
      style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(167,139,250,0.4), transparent)" }}
    />
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0A0E1A] text-slate-100 overflow-x-hidden">

      <ScrollProgress />
      <BackToTop />
      <SectionNav />

      {/* ── Global fireflies (whole page) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles />
      </div>

      {/* ── Global dot grid ── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0A0E1A]/80 backdrop-blur-md border-b border-slate-800/60"
      >
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center"
          >
            <Zap size={13} className="text-white" />
          </motion.div>
          <span className="text-sm font-bold text-white tracking-tight">Vendrix</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/chat"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-200 cursor-pointer"
            >
              Try Demo <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section id="hero" className="relative z-10 pt-32 pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        <AuroraBeam />

        {/* Aurora top glow */}
        <div className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 120% 60% at 50% -10%, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.06) 50%, transparent 80%)" }}
        />

        {/* Side orbs */}
        <FloatingOrb className="top-20 -left-20 w-[400px] h-[400px] bg-indigo-600/10 blur-3xl" delay={0} />
        <FloatingOrb className="top-40 -right-20 w-[350px] h-[350px] bg-violet-600/8 blur-3xl" delay={2} />

        {/* Hero two-col */}
        <div className="relative w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 rounded-full px-4 py-1.5 text-xs text-indigo-300 font-medium mb-6"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <AnimatedCounter target={1247} /> leads qualified this week
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Your AI Sales Rep,{" "}
              <br className="hidden sm:block" />
              <span className="animated-gradient">Always On</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-lg text-slate-400 leading-relaxed mb-10"
            >
              Drop in your product docs. Get an AI agent that answers questions,
              handles objections, qualifies leads, and books demos — 24/7.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center gap-3 lg:justify-start justify-center"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/chat"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-indigo-500/20 w-full sm:w-auto justify-center"
                >
                  <MessageSquare size={16} />
                  Try the Demo
                </Link>
              </motion.div>
              <motion.a
                href="#how-it-works"
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 font-medium px-6 py-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center"
              >
                How it works
              </motion.a>
            </motion.div>
          </div>

          {/* Right: Robot with glow */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="relative flex-shrink-0 w-[280px] sm:w-[360px] lg:w-[420px]"
          >
            {/* Robot glow */}
            <div className="absolute inset-0 rounded-full bg-indigo-600/20 blur-3xl scale-75 pointer-events-none" />
            <Lottie animationData={robotAnimation} loop autoplay />
          </motion.div>
        </div>

        {/* 3D tilt chat mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.65, ease: "easeOut" }}
          className="relative mt-12 w-full max-w-2xl mx-auto"
        >
          {/* Spinning gradient border */}
          <div className="absolute -inset-[2px] rounded-2xl overflow-hidden pointer-events-none">
            <div className="spin-slow absolute -inset-[100%] rounded-full"
              style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(99,102,241,0.8) 60deg, rgba(167,139,250,0.9) 120deg, transparent 180deg)" }}
            />
          </div>
          {/* Glow behind */}
          <div className="ring-pulse absolute -inset-6 rounded-3xl pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 50%, transparent 75%)", filter: "blur(24px)" }}
          />
          <TiltCard>
            <div className="bg-[#131929] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
              {/* Fake header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-800">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Zap size={10} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Vendrix</span>
                <span className="text-slate-700 text-xs">·</span>
                <div className="flex items-center gap-1.5">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <span className="text-xs text-slate-400">Cedd · AI Sales Agent</span>
                </div>
              </div>
              {/* Fake messages */}
              <div className="p-4 space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-white">AI</span>
                  </div>
                  <div className="bg-[#0f172a] border border-slate-800 border-l-2 border-l-indigo-500/70 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-slate-300 max-w-xs">
                    Hi! I&apos;m Cedd. What kind of processes is your team handling manually right now?
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="flex gap-2.5 flex-row-reverse"
                >
                  <div className="w-7 h-7 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-semibold text-slate-300">You</span>
                  </div>
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-sm px-3 py-2 text-xs text-white max-w-xs">
                    We manually process 400+ job applications a week in spreadsheets.
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-white">AI</span>
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <div className="flex items-center gap-2 text-[10px] bg-[#0A0E1A] border border-indigo-900/40 rounded-lg px-2.5 py-1 w-fit">
                      <Search size={10} className="text-indigo-400" />
                      <span className="text-slate-400">Searching knowledge base</span>
                    </div>
                    <div className="bg-[#0f172a] border border-slate-800 border-l-2 border-l-indigo-500/70 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-slate-300">
                      A company like yours saved <strong className="text-white">87% of HR admin time</strong> with Vendrix. Want me to show you how?
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </TiltCard>
          {/* Glow under mockup */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-indigo-600/15 blur-2xl rounded-full" />
        </motion.div>
      </section>

      {/* ── Trust Bar ── */}
      <section id="trust" className="relative z-10 py-10 px-6 border-y border-slate-800/40">
        <FadeUp>
          <p className="text-center text-xs uppercase tracking-widest text-slate-600 font-medium mb-6">Powered by industry-leading technology</p>
          <div className="flex flex-wrap items-center justify-center gap-8 max-w-3xl mx-auto">
            {[
              { label: "Anthropic Claude", icon: "🤖", color: "text-orange-400", border: "border-orange-800/40", bg: "bg-orange-500/10" },
              { label: "LangChain", icon: "🔗", color: "text-emerald-400", border: "border-emerald-800/40", bg: "bg-emerald-500/10" },
              { label: "FAISS Vector DB", icon: "🗄️", color: "text-blue-400", border: "border-blue-800/40", bg: "bg-blue-500/10" },
              { label: "SOC 2 Ready", icon: "🔒", color: "text-violet-400", border: "border-violet-800/40", bg: "bg-violet-500/10" },
              { label: "99.9% Uptime", icon: "⚡", color: "text-amber-400", border: "border-amber-800/40", bg: "bg-amber-500/10" },
            ].map(({ label, icon, color, border, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -3, scale: 1.05 }}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${border} ${bg} cursor-default`}
              >
                <span className="text-base">{icon}</span>
                <span className={`text-xs font-semibold tracking-wide ${color}`}>{label}</span>
              </motion.div>
            ))}
          </div>
        </FadeUp>
      </section>

      <GlowDivider />

      {/* ── Problem / Solution ── */}
      <section id="problem" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">The Problem</span>
            <h2 className="text-3xl font-bold text-white mt-3 mb-4">Your best sales rep can't work 24/7</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Prospects ask questions at 2am, on weekends, during holidays. Every unanswered question is a lost deal.</p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {[
              { emoji: "😩", title: "Without Vendrix", points: ["Leads go cold while waiting for a reply", "Sales reps repeat the same answers daily", "No coverage outside business hours", "Objections handled inconsistently"] },
              { emoji: "🚀", title: "With Vendrix", points: ["Every question answered in seconds", "Agent qualifies leads automatically", "Available 24/7, no breaks needed", "Consistent, data-backed responses every time"], highlight: true },
            ].map(({ emoji, title, points, highlight }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`rounded-2xl p-6 border ${highlight ? "bg-indigo-950/40 border-indigo-700/40" : "bg-[#131929] border-slate-800"}`}
              >
                <div className="text-2xl mb-3">{emoji}</div>
                <h3 className={`font-semibold mb-4 ${highlight ? "text-indigo-300" : "text-slate-400"}`}>{title}</h3>
                <ul className="space-y-2">
                  {points.map((p) => (
                    <li key={p} className={`flex items-start gap-2 text-sm ${highlight ? "text-slate-200" : "text-slate-500"}`}>
                      <span className="mt-0.5">{highlight ? "✓" : "✗"}</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Clock, stat: "2 min", label: "Average response time vs 4 hours manually", color: "text-indigo-400" },
              { icon: TrendingUp, stat: "3×", label: "More leads qualified per day", color: "text-violet-400" },
              { icon: ShieldCheck, stat: "24/7", label: "Coverage with zero additional headcount", color: "text-emerald-400" },
            ].map(({ icon: Icon, stat, label, color }, i) => (
              <motion.div
                key={stat}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-[#131929] border border-slate-800 rounded-2xl p-5 text-center"
              >
                <Icon size={20} className={`${color} mx-auto mb-2`} />
                <div className={`text-2xl font-bold ${color} mb-1`}>{stat}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ── How it works ── */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Up and running in minutes</h2>
            <p className="text-slate-400">No training. No fine-tuning. Just your docs.</p>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", icon: Database, title: "Upload your docs", desc: "Drop in your product overview, pricing, FAQs, and case studies. PDF, TXT, or Markdown.", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
              { step: "02", icon: Cpu, title: "Agent learns instantly", desc: "RAG pipeline indexes your content into a vector store. The agent knows everything in seconds.", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
              { step: "03", icon: MessageSquare, title: "Start selling", desc: "Your AI agent answers questions, qualifies leads, handles objections, and books demos — 24/7.", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            ].map(({ step, icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-[#131929] border border-slate-800 rounded-2xl p-6 relative cursor-default"
              >
                <span className="text-5xl font-black text-slate-800/60 absolute top-4 right-5 select-none">{step}</span>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${bg}`}>
                  <Icon size={18} className={color} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ── Features ── */}
      <section id="features" className="relative z-10 py-24 px-6 bg-[#0D1120]/80">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">What the agent can do</h2>
            <p className="text-slate-400">Five tools. One intelligent sales rep.</p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Search, title: "RAG Knowledge Search", desc: "Searches your indexed docs in real time and cites sources on every answer.", color: "text-indigo-400" },
              { icon: UserCheck, title: "Lead Qualification", desc: "Collects name, company, use case, budget, and timeline — automatically, mid-conversation.", color: "text-emerald-400" },
              { icon: Globe, title: "Objection Handling", desc: "Pulls competitor comparisons and ROI data to counter pricing and feature objections.", color: "text-amber-400" },
              { icon: CalendarCheck, title: "Demo Booking", desc: "Books product demos for interested prospects directly in the chat.", color: "text-sky-400" },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="flex gap-4 bg-[#131929] border border-slate-800 rounded-2xl p-5 cursor-default"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ── Tech stack ── */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <p className="text-xs uppercase tracking-widest text-slate-600 font-medium mb-8">Built with</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { name: "Claude claude-sonnet-4-6", color: "border-orange-800/40 text-orange-300" },
                { name: "LangChain", color: "border-emerald-800/40 text-emerald-300" },
                { name: "FAISS", color: "border-blue-800/40 text-blue-300" },
                { name: "FastAPI", color: "border-teal-800/40 text-teal-300" },
                { name: "Next.js 14", color: "border-slate-600 text-slate-300" },
                { name: "Tailwind CSS", color: "border-sky-800/40 text-sky-300" },
                { name: "sentence-transformers", color: "border-violet-800/40 text-violet-300" },
              ].map(({ name, color }, i) => (
                <motion.span
                  key={name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border bg-slate-900/50 cursor-default ${color}`}
                >
                  {name}
                </motion.span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <GlowDivider />

      {/* ── Social Proof ── */}
      <section id="social-proof" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Social Proof</span>
            <h2 className="text-3xl font-bold text-white mt-3">What people are saying</h2>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { quote: "We went from answering 200+ emails a week to zero. Cedd handles everything — pricing, objections, even books the demos.", name: "Sarah M.", role: "Head of Sales, TechFlow", stars: 5 },
              { quote: "I was skeptical about AI sales agents but this actually works. It qualified 3 enterprise leads while I was sleeping.", name: "James R.", role: "Founder, Opscale", stars: 5 },
              { quote: "Setup took 15 minutes. We uploaded our docs and it was live. The ROI was visible within the first week.", name: "Dana K.", role: "VP Marketing, Nexio", stars: 5 },
            ].map(({ quote, name, role, stars }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-[#131929] border border-slate-800 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: stars }).map((_, j) => (
                    <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-14">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Pricing</span>
            <h2 className="text-3xl font-bold text-white mt-3 mb-3">Simple, transparent pricing</h2>
            <p className="text-slate-400">Start free. Scale when you're ready.</p>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "Free", desc: "Perfect for testing and small teams", features: ["1 AI agent", "Up to 5 documents", "100 conversations/mo", "Basic lead capture", "Email support"], cta: "Try Free", highlight: false },
              { name: "Growth", price: "$49", period: "/mo", desc: "For growing sales teams", features: ["3 AI agents", "Unlimited documents", "2,000 conversations/mo", "Full lead qualification", "Demo booking", "Priority support"], cta: "Start Trial", highlight: true },
              { name: "Enterprise", price: "Custom", desc: "For large-scale deployments", features: ["Unlimited agents", "Unlimited documents", "Unlimited conversations", "Custom integrations", "SLA + dedicated support", "White-label option"], cta: "Contact Us", highlight: false },
            ].map(({ name, price, period, desc, features, cta, highlight }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl p-6 border flex flex-col ${highlight ? "bg-indigo-950/50 border-indigo-600/50 shadow-lg shadow-indigo-500/10" : "bg-[#131929] border-slate-800"}`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
                )}
                <div className="mb-4">
                  <h3 className={`font-bold text-lg ${highlight ? "text-indigo-300" : "text-white"}`}>{name}</h3>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="text-3xl font-black text-white">{price}</span>
                    {period && <span className="text-slate-400 text-sm mb-1">{period}</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{desc}</p>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="text-indigo-400">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/chat" className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-colors ${highlight ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"}`}>
                    {cta}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ── FAQ ── */}
      <section id="faq" className="relative z-10 py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <FadeUp className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">FAQ</span>
            <h2 className="text-3xl font-bold text-white mt-3">Common questions</h2>
          </FadeUp>
          <div className="space-y-3">
            {[
              { q: "How long does setup take?", a: "About 15 minutes. Upload your docs through the admin panel and your AI agent is live immediately — no training, no fine-tuning required." },
              { q: "What file types does it support?", a: "PDF, TXT, and Markdown files. You can upload product overviews, pricing sheets, FAQs, case studies, and competitor comparisons." },
              { q: "Does it work outside business hours?", a: "Yes — that's the whole point. Your AI agent runs 24/7, answering questions, qualifying leads, and booking demos even while you sleep." },
              { q: "Can I customize the agent's personality?", a: "Yes. You can adjust the agent's name, tone, and sales approach. Enterprise plans include full white-label and persona customization." },
              { q: "Is my data secure?", a: "All documents are processed and stored securely. We never use your data to train shared models. Enterprise plans include dedicated infrastructure." },
              { q: "What happens when the agent doesn't know the answer?", a: "It escalates gracefully — flagging the conversation for human follow-up and letting the prospect know a specialist will reach out." },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ── CTA ── */}
      <section id="cta" className="relative z-10 py-24 px-6">
        <FadeUp>
          <div className="max-w-2xl mx-auto text-center relative">
            <div className="absolute inset-0 bg-indigo-600/5 rounded-3xl blur-3xl pointer-events-none" />
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="relative bg-[#131929] border border-slate-800 rounded-3xl p-10 sm:p-14"
            >
              <h2 className="text-3xl font-bold text-white mb-4">See it in action</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Talk to Cedd — a live AI sales agent backed by real product documentation,
                vector search, and tool-calling.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-200 shadow-lg shadow-indigo-500/20"
                >
                  <MessageSquare size={16} />
                  Try the Demo
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
              <p className="text-xs text-slate-600 mt-4">No credit card required · Free demo · Live AI agent</p>
            </motion.div>
          </div>
        </FadeUp>
      </section>

      <GlowDivider />

      {/* ── Footer ── */}
      <footer className="relative z-10 py-8 px-6 text-center">
        <p className="text-xs text-slate-600">
          Vendrix AI Sales Agent · Portfolio Project · Built with Claude + RAG
        </p>
      </footer>
    </div>
  );
}
