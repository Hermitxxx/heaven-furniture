"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface HeadlinePhrase {
  /** First line — the heavy one. */
  lead: string;
  /** Second line — the italic one. */
  trail: string;
}

// Seconds a phrase sits still, then seconds it spends becoming the next one.
const HOLD = 1.4;
const MORPH = 0.8;
const CYCLE = HOLD + MORPH;

// Long enough that the brand name is what a visitor reads first.
const START_DELAY = 0.9;

/**
 * The gooey part. feColorMatrix maps alpha to (255 × a) − 140, so anything under
 * roughly 55% opacity drops out and anything above it saturates. Push two
 * blurred copies of the same line through that and their soft halos harden into
 * a single shape that appears to flow from one word into the other. Without the
 * threshold this is just a cross-dissolve; the blur is only interesting once
 * something is clipping it back to hard edges.
 */
const FILTER_ID = "hero-morph-threshold";

// Both curves are the ones the classic morphing-text effect uses. Blur follows
// 8/f − 8 so it hangs on and then collapses sharply at the end of the
// transition, and opacity uses a 0.4 power curve so the arriving word gains
// presence early. The clamps are load-bearing: at f = 0 the blur term is
// Infinity, which is not a valid CSS length, and past f = 1 it goes negative.
const blurFor = (fraction: number) => {
  const f = Math.max(fraction, 0.0001);
  return `blur(${Math.max(0, Math.min(8 / f - 8, 100)).toFixed(2)}px)`;
};

const opacityFor = (fraction: number) => Math.pow(Math.max(fraction, 0), 0.4).toFixed(3);

interface MorphingHeadlineProps {
  phrases: HeadlinePhrase[];
  /**
   * Stable text for the accessibility tree. The visible words rotate, so they
   * are hidden from it entirely — a heading whose accessible name changes every
   * few seconds gives assistive tech nothing to hold onto, and this is the
   * page's h1.
   */
  srLabel: string;
  className?: string;
  leadClassName?: string;
  trailClassName?: string;
}

export function MorphingHeadline({
  phrases,
  srLabel,
  className,
  leadClassName,
  trailClassName,
}: MorphingHeadlineProps) {
  const shouldReduceMotion = useReducedMotion();
  // One value covers the whole rotation: it runs 0 → phrases.length, so its
  // integer part is the phrase and its fraction is the position within that
  // phrase's hold-then-morph. Keeping both on a single clock is what stops the
  // text swap and the blur from ever drifting apart — the bug you get from
  // advancing an index on a timer while a separate animation runs the visuals.
  const cycle = useMotionValue(0);

  const leadOut = useRef<HTMLSpanElement>(null);
  const leadIn = useRef<HTMLSpanElement>(null);
  const trailOut = useRef<HTMLSpanElement>(null);
  const trailIn = useRef<HTMLSpanElement>(null);

  const paint = useCallback(
    (value: number) => {
      const count = phrases.length;
      const index = Math.floor(value) % count;
      const within = value - Math.floor(value);
      const holdShare = HOLD / CYCLE;

      // Still for the hold, then 0 → 1 across the morph.
      const fraction = within <= holdShare ? 0 : (within - holdShare) / (1 - holdShare);

      const current = phrases[index];
      const next = phrases[(index + 1) % count];

      const lines: [
        HTMLSpanElement | null,
        HTMLSpanElement | null,
        string,
        string
      ][] = [
        [leadOut.current, leadIn.current, current.lead, next.lead],
        [trailOut.current, trailIn.current, current.trail, next.trail],
      ];

      for (const [outgoing, incoming, currentText, nextText] of lines) {
        if (!outgoing || !incoming) continue;
        outgoing.textContent = currentText;
        incoming.textContent = nextText;
        outgoing.style.filter = blurFor(1 - fraction);
        outgoing.style.opacity = opacityFor(1 - fraction);
        incoming.style.filter = blurFor(fraction);
        incoming.style.opacity = opacityFor(fraction);
      }
    },
    [phrases]
  );

  useMotionValueEvent(cycle, "change", paint);

  useEffect(() => {
    // Paint once up front: `delay` below means the value emits nothing for the
    // first stretch, and the spans would otherwise sit at their SSR values with
    // no styles applied.
    paint(0);
    if (shouldReduceMotion) return;

    // Ends on phrases.length, where floor() % length wraps back to 0 — the same
    // state the repeat restarts from, so the loop has no visible seam.
    const controls = animate(cycle, phrases.length, {
      duration: phrases.length * CYCLE,
      ease: "linear",
      repeat: Infinity,
      delay: START_DELAY,
    });
    return () => controls.stop();
  }, [cycle, paint, phrases.length, shouldReduceMotion]);

  const second = phrases[1 % phrases.length];

  return (
    <div className={cn("relative w-full", className)}>
      <span className="sr-only">{srLabel}</span>

      {/* overflow-x-clip, not overflow-hidden: the longest phrase is wider than
          the shortest, and a stray pixel past the viewport would add a
          horizontal scrollbar. `clip` on one axis is allowed to sit next to
          `visible` on the other, so the vertical blur bleed survives.

          The filter goes on inline rather than as a Tailwind arbitrary class
          because the id is interpolated, and Tailwind only generates classes it
          can find as literal strings in the source. Reduced motion skips it —
          with nothing morphing there is no halo to harden, and the threshold
          would only coarsen the type's antialiasing for no reason. */}
      <div
        aria-hidden="true"
        className="relative w-full overflow-x-clip"
        style={
          shouldReduceMotion
            ? undefined
            : { filter: `url(#${FILTER_ID}) blur(0.6px)` }
        }
      >
        {/* Each line stacks two spans over an invisible one. The invisible copy
            is the only thing in flow, so it alone sets the line's height — the
            animated pair is absolute and would otherwise collapse the box. */}
        <div className="relative w-full">
          <span className={cn("invisible block", leadClassName)}>{phrases[0].lead}</span>
          <span
            ref={leadOut}
            className={cn("absolute inset-x-0 top-0 block", leadClassName)}
            style={{ opacity: 1, filter: "blur(0px)" }}
          >
            {phrases[0].lead}
          </span>
          <span
            ref={leadIn}
            className={cn("absolute inset-x-0 top-0 block", leadClassName)}
            style={{ opacity: 0, filter: "blur(100px)" }}
          >
            {second.lead}
          </span>
        </div>

        <div className="relative mt-2 w-full">
          <span className={cn("invisible block", trailClassName)}>{phrases[0].trail}</span>
          <span
            ref={trailOut}
            className={cn("absolute inset-x-0 top-0 block", trailClassName)}
            style={{ opacity: 1, filter: "blur(0px)" }}
          >
            {phrases[0].trail}
          </span>
          <span
            ref={trailIn}
            className={cn("absolute inset-x-0 top-0 block", trailClassName)}
            style={{ opacity: 0, filter: "blur(100px)" }}
          >
            {second.trail}
          </span>
        </div>
      </div>

      {!shouldReduceMotion && <ThresholdFilter />}
    </div>
  );
}

function ThresholdFilter() {
  return (
    // Not `hidden`: display:none on an SVG has historically kept filters inside
    // it from resolving in some engines. A zero-sized box is safe.
    <svg aria-hidden="true" focusable="false" className="absolute h-0 w-0 overflow-hidden">
      <defs>
        <filter id={FILTER_ID}>
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 255 -140"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default MorphingHeadline;
