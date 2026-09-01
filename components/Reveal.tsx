"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Transition, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The entrance animation this codebase kept saying it had.
 *
 * `reveal` was applied as a class in the hero — with staggered animationDelays —
 * and an IntersectionObserver added `show`/`active` to `.reveal` and
 * `.grid-item` on sight. None of those three class names has a rule anywhere:
 * not in globals.css, not in tw-animate-css, nowhere in the project. The hero
 * had no entrance at all, and the `overflow-hidden` wrappers around its lines
 * were clipping a slide-up that never ran. This is that effect, built for real.
 *
 * `mask` is the variant those wrappers were shaped for: the text starts below a
 * clipping box and slides up into it. Everything else animates in place.
 */
export type RevealAnimation = "fade" | "up" | "down" | "left" | "right" | "scale" | "mask";

const VARIANTS: Record<RevealAnimation, Variants> = {
  fade: { hidden: { opacity: 0 }, shown: { opacity: 1 } },
  up: { hidden: { opacity: 0, y: 24 }, shown: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -24 }, shown: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -24 }, shown: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 24 }, shown: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.94 }, shown: { opacity: 1, scale: 1 } },
  // 110%, not 100%: descenders and italic overhang sit below the baseline box,
  // and at exactly 100% they stay visible under the mask's edge.
  mask: { hidden: { y: "110%" }, shown: { y: "0%" } },
};

// Reduced motion keeps the reveal — an element appearing is information — but
// drops every transform. Nothing travels, nothing scales.
const REDUCED_VARIANTS: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1 } };

const EASE = [0.22, 1, 0.36, 1] as const;

const DEFAULT_DURATION: Record<RevealAnimation, number> = {
  fade: 0.7,
  up: 0.7,
  down: 0.7,
  left: 0.7,
  right: 0.7,
  scale: 0.7,
  // Longer: it travels its own full height, so the same duration reads as a snap.
  mask: 0.9,
};

export interface RevealProps {
  children: ReactNode;
  animation?: RevealAnimation;
  /**
   * "view" waits until the element scrolls into sight and matches the
   * initial/whileInView pattern Carousel, WhyChooseUs and TestimonialsSection
   * already use. "mount" fires on load — the right choice above the fold, where
   * an in-view trigger would fire on the first frame anyway and give you no
   * control over the order things arrive in.
   */
  trigger?: "mount" | "view";
  delay?: number;
  duration?: number;
  /** Viewport margin for the in-view check. Ignored when trigger is "mount". */
  margin?: string;
  /**
   * "span" when this sits inside a heading or a paragraph, "div" when it wraps
   * block content. Both render `display: block`. This exists because there is no
   * single tag that is valid in both places — a div inside an h1 and a p inside
   * a span are each invalid — and getting it wrong is the kind of thing that
   * only shows up as a hydration error.
   */
  as?: "div" | "span";
  className?: string;
}

export function Reveal({
  children,
  animation = "up",
  trigger = "view",
  delay = 0,
  duration,
  margin = "-80px",
  as = "div",
  className,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const transition: Transition = {
    duration: shouldReduceMotion ? 0.25 : duration ?? DEFAULT_DURATION[animation],
    delay: shouldReduceMotion ? 0 : delay,
    ease: EASE,
  };

  // A mask needs a second element to clip against; the rest animate in place.
  const masked = animation === "mask" && !shouldReduceMotion;
  const MotionTag = as === "span" ? motion.span : motion.div;
  const Wrapper = as === "span" ? "span" : "div";

  const animated = (
    <MotionTag
      variants={shouldReduceMotion ? REDUCED_VARIANTS : VARIANTS[animation]}
      transition={transition}
      initial="hidden"
      animate={trigger === "mount" ? "shown" : undefined}
      whileInView={trigger === "view" ? "shown" : undefined}
      viewport={trigger === "view" ? { once: true, margin } : undefined}
      className={masked ? "block" : cn("block", className)}
    >
      {children}
    </MotionTag>
  );

  if (!masked) return animated;

  return <Wrapper className={cn("block overflow-hidden", className)}>{animated}</Wrapper>;
}

export default Reveal;
