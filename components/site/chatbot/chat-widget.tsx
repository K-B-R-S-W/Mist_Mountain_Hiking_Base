"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { MistMountainLogo } from "./mist-mountain-logo";
import { ChatPanel } from "./chat-panel";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <aside
      aria-label="AI Concierge Chatbot"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end"
    >
      {/* Greeting Bubble for First-Time Visitors */}
      <AnimatePresence>
        {!isOpen && showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 mr-1 max-w-xs rounded-xl border border-black/10 bg-surface p-3 shadow-lg backdrop-blur"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-xs font-semibold text-primary">Mist Mountain AI Concierge</p>
              </div>
              <button
                onClick={() => setShowGreeting(false)}
                type="button"
                className="text-muted hover:text-text text-xs"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted leading-relaxed">
              Need help checking room availability, exploring spring pools, or planning your hiking trip? Ask me anytime!
            </p>
            <button
              onClick={() => {
                setShowGreeting(false);
                setIsOpen(true);
              }}
              type="button"
              className="mt-2 text-xs font-semibold text-accent hover:underline"
            >
              Start Chat →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.96 }
            }
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-x-2 bottom-20 top-16 z-50 flex max-h-[85vh] flex-col sm:bottom-20 sm:right-6 sm:left-auto sm:top-auto sm:h-[620px] sm:w-[400px]"
          >
            <ChatPanel onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <div className="relative">
        {!prefersReducedMotion && !isOpen && (
          <span className="absolute -inset-1.5 rounded-full bg-primary/20 blur-md animate-pulse" />
        )}

        <button
          onClick={() => {
            setShowGreeting(false);
            setIsOpen((prev) => !prev);
          }}
          type="button"
          aria-label={isOpen ? "Close AI Concierge" : "Open AI Concierge"}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 active:scale-95 ${
            isOpen
              ? "bg-text text-background rotate-90"
              : "bg-gradient-to-tr from-[#163126] via-[#284a3a] to-[#3a6852] text-white hover:scale-105"
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MistMountainLogo className="h-7 w-7 text-white" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-accent" />
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
