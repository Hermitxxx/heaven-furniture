"use client";

import { useRef, type ReactNode } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import LiquidChrome from "@/components/ui/liquid-chrome";
import { cn } from "@/lib/utils";

/**
 * ChromeButton — the ReactBits chrome pill: a LiquidChrome WebGL canvas fills
 * the body, and the label rides above it in mix-blend-difference so it inverts
 * as the bright bands pass underneath.
 *
 * Two things this keeps that the stock snippet doesn't have:
 *
 * href — the only CTA on this site is a phone call, since there's no booking
 * endpoint on a single page. So this is an <a>, not a <button>.
 *
 * The canvas mounts only while the pill is on screen, and never under
 * prefers-reduced-motion. It's a second WebGL context in a hero that already
 * runs TopoField, and it sits at the bottom of a 100dvh section — so it leaves
 * the viewport as soon as the page moves, and there's no reason to keep a
 * supersampled fragment shader drawing behind it once it has.
 */

// neutral-950 (#0a0a0a) as 0-1 floats, matching the bg-neutral-950 underneath.
// Module scope rather than inline: LiquidChrome rebuilds its GL context when the
// colour changes, and a fresh literal per render would trip that on every
// in-view flip.
const BODY_COLOR: [number, number, number] = [
  0.0392156862745098, 0.0392156862745098, 0.0392156862745098,
];

export type ChromeButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
};

export default function ChromeButton({
  href,
  children,
  className,
  target,
  rel,
}: ChromeButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { margin: "120px" });
  const reduceMotion = useReducedMotion();

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      className={cn(
        "group relative isolate inline-flex items-center overflow-hidden rounded-full",
        "border-2 border-neutral-900 bg-neutral-950 px-6 py-4 text-white shadow-lg",
        "transition-all duration-75 active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 z-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100"
      >
        {inView && !reduceMotion && (
          <LiquidChrome
            baseColor={BODY_COLOR}
            speed={2}
            amplitude={0.1}
            interactive={false}
          />
        )}
      </span>

      {/* mix-blend-difference needs a blend group to stay inside, or it reaches
          past the button to the page behind it — hence `isolate` above. flex
          here because the label is an icon plus text, which the stock snippet
          wasn't carrying. */}
      <span className="relative z-10 flex items-center gap-2.5 mix-blend-difference">
        {children}
      </span>
    </a>
  );
}
