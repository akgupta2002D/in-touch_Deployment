import React from "react";
import {
  Heart,
  Calendar,
  MessageCircle,
  Users,
  Sparkles,
  Map,
  Clock,
  PlayCircle,
} from "lucide-react";

const LandingPage = ({ onAuth }) => {
  const Feature = ({ icon: Icon, title, children }) => {
    return (
      <div className="text-center flex flex-col items-center gap-3 hover:scale-[1.08] transition-transform duration-300 cursor-default bg-surface-900 rounded-lg p-6 shadow">
        <div className="h-25 w-25 bg-[var(--color-primary-600)] rounded-full mb-2">
          <Icon className="h-10 w-10 mt-6 justify-self-center" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-[var(--color-foreground)] max-w-[280px]">
          {children}
        </p>
      </div>
    );
  };
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Unified background – no framed surface wrapper */}
      <div className="mx-auto w-full max-w-7xl px-6 py-12 flex flex-col gap-16 flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl text-center flex flex-col gap-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
            Stay connected with the people who matter most
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-[var(--color-muted)]">
            Life gets busy. Relationships shouldn&apos;t fade. In Touch brings
            structure, warmth, and gentle reminders to help you nurture
            meaningful connections.
          </p>
          <div className="flex justify-around gap-4 flex-wrap">
            <button
              className="btn-primary px-7 py-4"
              onClick={() => onAuth("signup")}
            >
              Get Started
            </button>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl grid gap-10 md:grid-cols-3">
          <Feature icon={Heart} title="Never Forget">
            Capture important moments & reflections with close friends.
          </Feature>
          <Feature icon={Calendar} title="Smart Reminders">
            Gentle nudges to reach out at the right cadence.
          </Feature>
          <Feature icon={MessageCircle} title="Context Rich">
            Pick up conversations without losing thread continuity.
          </Feature>
          <Feature icon={Users} title="Grow Together">
            Track how connections evolve over time.
          </Feature>
          <Feature icon={Map} title="Visual Network">
            See your social circle represented spatially (future).
          </Feature>
          <Feature icon={Clock} title="History">
            Recall when you last engaged & what was shared.
          </Feature>
        </section>

        {/* How It Works */}
        <section className="section pt-0">
          <div className="mx-auto max-w-6xl grid gap-10 md:grid-cols-3">
            <div className="card p-7 flex flex-col gap-4 hover:scale-[1.04] transition-transform duration-300">
              <Sparkles className="h-6 w-6 text-[var(--color-primary-400)]" />
              <h3 className="text-lg font-semibold">Add Connections</h3>
              <p className="text-base text-[var(--color-muted)]">
                Start by adding people you care about. Later you&apos;ll see
                suggested touch points based on interaction patterns.
              </p>
            </div>
            <div className="card p-7 flex flex-col gap-4 hover:scale-[1.04] transition-transform duration-300">
              <Calendar className="h-6 w-6 text-[var(--color-primary-400)]" />
              <h3 className="text-lg font-semibold">Set Cadence</h3>
              <p className="text-base text-[var(--color-muted)]">
                Choose how frequently you want to reconnect so nothing
                meaningful drifts.
              </p>
            </div>
            <div className="card p-7 flex flex-col gap-4 hover:scale-[1.04] transition-transform duration-300">
              <MessageCircle className="h-6 w-6 text-[var(--color-primary-400)]" />
              <h3 className="text-lg font-semibold">Engage Intentionally</h3>
              <p className="text-base text-[var(--color-muted)]">
                Jot small notes after each interaction. Track sentiment & watch
                depth grow.
              </p>
            </div>
          </div>
        </section>

        {/* Callout */}
        <section className="mx-auto max-w-4xl card p-10 text-center flex flex-col gap-6">
          <h2 className="text-3xl font-bold">
            Your friendships deserve attention
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[var(--color-muted)]">
            Build stronger relationships with a platform designed for steady,
            mindful connection. Healthy networks start with intention.
          </p>
          <div>
            <button
              className="btn-primary px-7 py-4"
              onClick={() => onAuth("signup")}
            >
              Start Your Journey
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-[12px] text-[var(--color-muted)] pb-6">
          © {new Date().getFullYear()} In Touch. Building meaningful connection.
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
