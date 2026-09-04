"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/SmoothScrollProvider";
import { HERO_SPRING, useRevealed } from "@/components/hero/RevealGate";
import { FlippingWordSwap } from "@/components/ui/flipping-word-swap";

interface NavItem {
  label: string;
  /** id of an element that actually renders on the page. */
  sectionId: string;
}

// Every target below resolves against the current page composition:
//   #home        -> Hero
//   #pieces      -> the wrapper around HeroScroll in app/page.tsx
//   #about       -> ZoomInScroll
//   #collections -> ZoomInScroll
const NAV_ITEMS: NavItem[] = [
  { label: "Home", sectionId: "home" },
  { label: "Pieces", sectionId: "pieces" },
  { label: "About", sectionId: "about" },
  { label: "Collections", sectionId: "collections" },
];

/** Nav height plus a little air, so a section never lands underneath the bar. */
const SCROLL_OFFSET = -88;

/** A section becomes current once its top passes this fraction of the viewport.
 *  A third of the way down tracks what you are actually looking at better than
 *  the very top edge does, especially for the tall pinned sections. */
const SPY_PROBE_RATIO = 0.35;

/** How long to trust a click over the scroll position. Without this the active
 *  link walks through every section the page travels past on its way to the
 *  target, which looks like the nav changing its mind. */
const CLICK_PRIORITY_MS = 1600;

/** Everything below the pinned reveal in ZoomInScroll can move while a scroll is
 *  in flight, so the destination computed at click time can end up stale. These
 *  bound the correction passes that close the remaining gap. */
const MAX_SETTLE_PASSES = 3;
const SETTLE_TOLERANCE_PX = 8;

export function SiteNav() {
  const revealed = useRevealed();
  const lenisRef = useLenis();
  const [active, setActive] = useState(NAV_ITEMS[0].label);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Set while a click-driven scroll is in flight, to keep the spy from
  // overriding the link the user just picked. Released three ways - Lenis's
  // onComplete, real wheel/touch input, and a timeout - because Lenis silently
  // abandons its animation when the user takes over, so onComplete alone would
  // leave this stuck on.
  const navigating = useRef(false);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    // Chrome for the bar only once the hero is behind us. Over the hero the
    // links sit on the photographic scrim and need no backing.
    setScrolled(y > window.innerHeight * 0.75);
  });

  const scrollToTarget = (target: HTMLElement, offset: number, pass = 0) => {
    const lenis = lenisRef?.current;
    if (!lenis) {
      // Only reachable in the sliver before SmoothScrollProvider's effect runs.
      // Once Lenis exists it owns the scroll position and this would fight it.
      window.scrollTo({ top: target.offsetTop + offset, behavior: "smooth" });
      return;
    }

    navigating.current = true;
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => {
      navigating.current = false;
    }, CLICK_PRIORITY_MS);

    // Lenis clamps its destination to a scroll limit derived from cached
    // dimensions, and ScrollTrigger's pin spacers make the document much taller
    // than that cache knows about.
    lenis.resize();

    lenis.scrollTo(target, {
      duration: pass === 0 ? 1.4 : 0.6,
      offset,
      onComplete: () => {
        // Cleared by wheel/touch: the user has taken over, so do not yank the
        // page back.
        if (!navigating.current) return;

        const drift = target.getBoundingClientRect().top + offset;
        if (pass < MAX_SETTLE_PASSES && Math.abs(drift) > SETTLE_TOLERANCE_PX) {
          scrollToTarget(target, offset, pass + 1);
          return;
        }

        navigating.current = false;
      },
    });
  };

  const handleNavClick = (item: NavItem) => {
    const target = document.getElementById(item.sectionId);
    if (!target) return;

    setActive(item.label);
    setMenuOpen(false);
    // The hero already starts at the top of the document, so backing off by the
    // bar's height would just leave dead space above it.
    scrollToTarget(target, item.sectionId === "home" ? 0 : SCROLL_OFFSET);
  };

  useEffect(() => {
    const releaseSpy = () => {
      navigating.current = false;
    };

    const updateActive = () => {
      if (navigating.current) return;

      const probe = window.innerHeight * SPY_PROBE_RATIO;
      let current = NAV_ITEMS[0].label;
      let closestTop = -Infinity;

      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.sectionId);
        if (!el) continue;

        const { top } = el.getBoundingClientRect();
        if (top <= probe && top > closestTop) {
          closestTop = top;
          current = item.label;
        }
      }

      setActive((prev) => (prev === current ? prev : current));
    };

    updateActive();

    // Lenis drives the window's native scroll position, so ordinary scroll
    // events still fire and there is no need to subscribe to Lenis directly.
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    window.addEventListener("wheel", releaseSpy, { passive: true });
    window.addEventListener("touchstart", releaseSpy, { passive: true });

    return () => {
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      window.removeEventListener("wheel", releaseSpy);
      window.removeEventListener("touchstart", releaseSpy);
    };
  }, []);

  // Escape closes the sheet, and the page must not scroll behind it.
  useEffect(() => {
    if (!menuOpen) return;

    // Captured rather than read in the cleanup: by teardown the ref may point at
    // a different (or destroyed) Lenis instance.
    const lenis = lenisRef?.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    lenis?.stop();

    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [menuOpen, lenisRef]);

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-16 transition-colors duration-500 md:h-[72px]",
        scrolled ? "bg-ink/85 backdrop-blur-md" : "bg-transparent",
      )}
      initial={{ y: -24, opacity: 0.001 }}
      animate={revealed ? { y: 0, opacity: 1 } : undefined}
      transition={HERO_SPRING}
    >
      <nav
        aria-label="Sections"
        className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 md:justify-center md:px-10"
      >
        {/* Wordmark doubles as the skip-to-top affordance on mobile, where the
            links live behind the toggle. */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick(NAV_ITEMS[0]);
          }}
          className="font-heading text-base text-paper md:hidden"
        >
          Heaven
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <FlippingWordSwap
                word1={item.label}
                word2={item.label}
                href={`#${item.sectionId}`}
                aria-current={active === item.label ? "true" : undefined}
                onClick={(e) => {
                  // The href stays real for keyboard and middle-click, but the
                  // native hash jump has to be suppressed: it moves the scroll
                  // position out from under Lenis.
                  e.preventDefault();
                  handleNavClick(item);
                }}
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300",
                  active === item.label
                    ? "text-paper"
                    : "text-paper/55 hover:text-paper",
                )}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="nav-sheet"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex size-10 items-center justify-center rounded-full bg-clay text-paper transition-colors duration-300 hover:bg-clay/85 focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink focus-visible:outline-none md:hidden"
        >
          <HugeiconsIcon
            icon={menuOpen ? Cancel01Icon : Menu01Icon}
            size={18}
            strokeWidth={1.5}
          />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="nav-sheet"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.27, 0, 0.51, 1] }}
            className="absolute inset-x-0 top-16 border-t border-border bg-ink/95 backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col px-6 py-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.label} className="border-b border-border last:border-0">
                  <a
                    href={`#${item.sectionId}`}
                    aria-current={active === item.label ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item);
                    }}
                    className={cn(
                      "block py-4 font-heading text-xl transition-colors duration-300",
                      active === item.label ? "text-paper" : "text-paper/60",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default SiteNav;
