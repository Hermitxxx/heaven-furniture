"use client";

import type { ReactNode } from "react";

/**
 * DotBorderButton — ported from MengTo/threeui:
 * src/shaders/neuform-isolated/sources/dot-border-button.html
 *
 * The source ships this effect the same way the WebGL ones ship: a sandboxed
 * iframe running its own document. That's necessary for a shader; it is actively
 * wrong for this one, because the whole effect is CSS — `:has()`, keyframes and
 * repeating gradients, zero JavaScript. Kept in an iframe it would be unusable
 * as a CTA: `sandbox="allow-scripts"` (no allow-top-navigation) blocks the
 * click from reaching the parent, the source's own focus script calls
 * preventDefault on the placeholder link, the frame paints an opaque background
 * over whatever it sits on, and the accessible name collapses to the iframe
 * title. So the markup and choreography are reproduced natively instead.
 *
 * Deliberate changes from the source:
 *  - The source nests a <button> inside an <a href="#">, which is invalid
 *    (interactive content inside an anchor) and gives two focus stops. Here the
 *    wrapper is a plain <span> and the anchor is the only interactive element.
 *  - Colours are driven by custom properties and default to ink-on-paper. The
 *    source is hardcoded white-on-black (--dot-color: #fffa, .btn colour #fffd),
 *    which is invisible against this project's light theme.
 *  - The hover trigger also fires on :focus-visible, so the border draw-in isn't
 *    mouse-only, and the animations are dropped under prefers-reduced-motion.
 */

const STYLES = `
.dot-border-button {
  --dot-size: 8px;
  --line-weight: 1px;
  --line-distance: 0.8rem 1rem;
  --animation-speed: 0.35s;
  --dot-color: color-mix(in oklab, var(--foreground) 65%, transparent);
  --line-color: color-mix(in oklab, var(--foreground) 55%, transparent);
  --grid-color: color-mix(in oklab, var(--foreground) 18%, transparent);
  --btn-color: color-mix(in oklab, var(--foreground) 85%, transparent);
  --btn-hover-bg: var(--foreground);
  --btn-hover-color: var(--background);

  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: var(--line-distance);
  user-select: none;
}

/* Diagonal hatch that fades in behind the button, last in the sequence. */
.dot-border-button::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background-image: repeating-linear-gradient(45deg, var(--grid-color) 0 1px, transparent 2px 5px);
  opacity: 0;
  z-index: -1;
}

.dot-border-button:has(.dot-border-button__link:hover)::after,
.dot-border-button:has(.dot-border-button__link:focus-visible)::after {
  animation: dbb-opacity calc(var(--animation-speed) * 4) ease-in-out forwards;
}

@keyframes dbb-opacity {
  80% { opacity: 0; }
  100% { opacity: 1; }
}

.dot-border-button__link {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.8rem 1.25rem;
  background-color: transparent;
  border: 1px solid var(--grid-color);
  border-radius: 6px;
  color: var(--btn-color);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: transform .2s ease-in-out, letter-spacing .2s ease-in-out,
              background-color .2s ease-in-out, color .2s ease-in-out;
}

.dot-border-button__link:hover,
.dot-border-button__link:focus-visible {
  background-color: var(--btn-hover-bg);
  color: var(--btn-hover-color);
  transform: scale(1.05);
  letter-spacing: .06em;
}

.dot-border-button__link:focus-visible {
  outline: 2px solid var(--foreground);
  outline-offset: 3px;
}

.dot-border-button__link:active {
  background-color: var(--btn-hover-bg);
  transform: scale(.98);
  letter-spacing: .02em;
}

.dot-border-button__icon {
  margin-left: .5rem;
  height: 20px;
  stroke-width: 1;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke: currentColor;
  fill: none;
  opacity: .55;
  transition: opacity .2s ease-in-out;
}

.dot-border-button__link:hover .dot-border-button__icon,
.dot-border-button__link:focus-visible .dot-border-button__icon {
  opacity: 1;
}

/* ── Corner dots ─────────────────────────────────────────────────────────────
   Each starts collapsed at the button's midline and flies out to its corner,
   staggered .6 → 1.8× the base speed so they read as a sequence. */
.dot-border-button__dot {
  position: absolute;
  width: var(--dot-size);
  aspect-ratio: 1;
  border-radius: 2px;
  background-color: var(--dot-color);
  transition: all .3s ease-in-out;
  opacity: 0;
}
`;

const DOT_STYLES = `
.dot-border-button:has(.dot-border-button__link:hover) .dot-border-button__dot--top-left,
.dot-border-button:has(.dot-border-button__link:focus-visible) .dot-border-button__dot--top-left {
  top: 50%;
  left: 20%;
  animation: dbb-move-top-left var(--animation-speed) ease-in-out forwards;
}

@keyframes dbb-move-top-left {
  90% { opacity: .6; }
  100% {
    top: calc(var(--dot-size) * -0.5);
    left: calc(var(--dot-size) * -0.5);
    opacity: 1;
  }
}

.dot-border-button:has(.dot-border-button__link:hover) .dot-border-button__dot--top-right,
.dot-border-button:has(.dot-border-button__link:focus-visible) .dot-border-button__dot--top-right {
  top: 50%;
  right: 20%;
  animation: dbb-move-top-right var(--animation-speed) ease-in-out forwards;
  animation-delay: calc(var(--animation-speed) * .6);
}

@keyframes dbb-move-top-right {
  80% { opacity: .6; }
  100% {
    top: calc(var(--dot-size) * -0.5);
    right: calc(var(--dot-size) * -0.5);
    opacity: 1;
  }
}

.dot-border-button:has(.dot-border-button__link:hover) .dot-border-button__dot--bottom-right,
.dot-border-button:has(.dot-border-button__link:focus-visible) .dot-border-button__dot--bottom-right {
  bottom: 50%;
  right: 20%;
  animation: dbb-move-bottom-right var(--animation-speed) ease-in-out forwards;
  animation-delay: calc(var(--animation-speed) * 1.2);
}

@keyframes dbb-move-bottom-right {
  80% { opacity: .6; }
  100% {
    bottom: calc(var(--dot-size) * -0.5);
    right: calc(var(--dot-size) * -0.5);
    opacity: 1;
  }
}

.dot-border-button:has(.dot-border-button__link:hover) .dot-border-button__dot--bottom-left,
.dot-border-button:has(.dot-border-button__link:focus-visible) .dot-border-button__dot--bottom-left {
  bottom: 50%;
  left: 20%;
  animation: dbb-move-bottom-left var(--animation-speed) ease-in-out forwards;
  animation-delay: calc(var(--animation-speed) * 1.8);
}

@keyframes dbb-move-bottom-left {
  80% { opacity: .6; }
  100% {
    bottom: calc(var(--dot-size) * -0.5);
    left: calc(var(--dot-size) * -0.5);
    opacity: 1;
  }
}
`;

const LINE_STYLES = `
/* ── Dashed border ───────────────────────────────────────────────────────────
   Four dashed rules that start scaled to zero at a 5deg tilt and straighten as
   they draw in, clockwise from the top. */
.dot-border-button__line {
  position: absolute;
  transition: all .3s ease-in-out;
}

.dot-border-button__line--horizontal {
  height: var(--line-weight);
  width: 100%;
  background-image: repeating-linear-gradient(90deg, transparent 0 calc(var(--line-weight) * 2), var(--line-color) calc(var(--line-weight) * 2) calc(var(--line-weight) * 4));
}

.dot-border-button__line--vertical {
  width: var(--line-weight);
  height: 100%;
  background-image: repeating-linear-gradient(0deg, transparent 0 calc(var(--line-weight) * 2), var(--line-color) calc(var(--line-weight) * 2) calc(var(--line-weight) * 4));
}

.dot-border-button__line--top {
  top: calc(var(--line-weight) * -0.5);
  transform-origin: top left;
  transform: rotate(5deg) scaleX(0);
}

.dot-border-button:has(.dot-border-button__link:hover) .dot-border-button__line--top,
.dot-border-button:has(.dot-border-button__link:focus-visible) .dot-border-button__line--top {
  animation: dbb-draw-x var(--animation-speed) ease-in-out forwards;
  animation-delay: calc(var(--animation-speed) * .8);
}

.dot-border-button__line--bottom {
  bottom: calc(var(--line-weight) * -0.5);
  transform-origin: bottom right;
  transform: rotate(5deg) scaleX(0);
}

.dot-border-button:has(.dot-border-button__link:hover) .dot-border-button__line--bottom,
.dot-border-button:has(.dot-border-button__link:focus-visible) .dot-border-button__line--bottom {
  animation: dbb-draw-x var(--animation-speed) ease-in-out forwards;
  animation-delay: calc(var(--animation-speed) * 2);
}

.dot-border-button__line--left {
  left: calc(var(--line-weight) * -0.5);
  transform-origin: bottom left;
  transform: rotate(0deg) scaleY(0);
}

.dot-border-button:has(.dot-border-button__link:hover) .dot-border-button__line--left,
.dot-border-button:has(.dot-border-button__link:focus-visible) .dot-border-button__line--left {
  animation: dbb-draw-y var(--animation-speed) ease-in-out forwards;
  animation-delay: calc(var(--animation-speed) * 2.4);
}

.dot-border-button__line--right {
  right: calc(var(--line-weight) * -0.5);
  transform-origin: top right;
  transform: rotate(5deg) scaleY(0);
}

.dot-border-button:has(.dot-border-button__link:hover) .dot-border-button__line--right,
.dot-border-button:has(.dot-border-button__link:focus-visible) .dot-border-button__line--right {
  animation: dbb-draw-y var(--animation-speed) ease-in-out forwards;
  animation-delay: calc(var(--animation-speed) * 1.4);
}

@keyframes dbb-draw-x {
  100% { transform: rotate(0deg) scaleX(1); }
}

@keyframes dbb-draw-y {
  100% { transform: rotate(0deg) scaleY(1); }
}

/* The dots and rules are pure decoration — under reduced motion the button
   still gets its colour/scale change, it just doesn't get assembled. */
@media (prefers-reduced-motion: reduce) {
  .dot-border-button__dot,
  .dot-border-button__line,
  .dot-border-button::after {
    animation: none !important;
    transition: none !important;
  }
  .dot-border-button__link {
    transition: background-color .2s ease-in-out, color .2s ease-in-out;
  }
  .dot-border-button__link:hover,
  .dot-border-button__link:focus-visible {
    transform: none;
    letter-spacing: -0.01em;
  }
}
`;

export type DotBorderButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** Rendered after the label; defaults to the source's pencil glyph. */
  icon?: ReactNode;
  target?: string;
  rel?: string;
};

/** The source's pencil-on-page glyph, kept as-is. */
function PencilIcon() {
  return (
    <svg
      className="dot-border-button__icon"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.6744 11.4075L15.7691 17.1233C15.7072 17.309 15.5586 17.4529 15.3709 17.5087L3.69348 20.9803C3.22819 21.1186 2.79978 20.676 2.95328 20.2155L6.74467 8.84131C6.79981 8.67588 6.92419 8.54263 7.08543 8.47624L12.472 6.25822C12.696 6.166 12.9535 6.21749 13.1248 6.38876L17.5294 10.7935C17.6901 10.9542 17.7463 11.1919 17.6744 11.4075Z" />
      <path d="M3.2959 20.6016L9.65986 14.2376" />
      <path d="M17.7917 11.0557L20.6202 8.22724C21.4012 7.44619 21.4012 6.17986 20.6202 5.39881L18.4989 3.27749C17.7178 2.49645 16.4515 2.49645 15.6704 3.27749L12.842 6.10592" />
      <path d="M11.7814 12.1163C11.1956 11.5305 10.2458 11.5305 9.66004 12.1163C9.07426 12.7021 9.07426 13.6519 9.66004 14.2376C10.2458 14.8234 11.1956 14.8234 11.7814 14.2376C12.3671 13.6519 12.3671 12.7021 11.7814 12.1163Z" />
    </svg>
  );
}

export default function DotBorderButton({
  href,
  children,
  className,
  icon,
  target,
  rel,
}: DotBorderButtonProps) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{ __html: STYLES + DOT_STYLES + LINE_STYLES }}
      />
      <span className={["dot-border-button", className].filter(Boolean).join(" ")}>
        <span className="dot-border-button__line dot-border-button__line--horizontal dot-border-button__line--top" />
        <span className="dot-border-button__line dot-border-button__line--vertical dot-border-button__line--right" />
        <span className="dot-border-button__line dot-border-button__line--horizontal dot-border-button__line--bottom" />
        <span className="dot-border-button__line dot-border-button__line--vertical dot-border-button__line--left" />

        <span className="dot-border-button__dot dot-border-button__dot--top-left" />
        <span className="dot-border-button__dot dot-border-button__dot--top-right" />
        <span className="dot-border-button__dot dot-border-button__dot--bottom-right" />
        <span className="dot-border-button__dot dot-border-button__dot--bottom-left" />

        <a className="dot-border-button__link" href={href} target={target} rel={rel}>
          <span>{children}</span>
          {icon ?? <PencilIcon />}
        </a>
      </span>
    </>
  );
}
