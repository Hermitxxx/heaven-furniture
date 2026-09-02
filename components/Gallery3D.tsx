"use client";

import { useCallback, useRef, type PointerEvent } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A wall of showroom photography behind a fixed perspective: columns drift on a
 * seamless loop, and the whole matrix tilts toward the cursor.
 *
 * It was scroll-driven before, and that could never have worked here. The
 * component mounted its own `h-screen overflow-y-auto` viewport and handed it
 * to `useScroll({ container })` — but Lenis owns this page's scroll and the
 * FlowSection this renders inside is rotated by GSAP, so nothing ever scrolled
 * that inner element and `scrollYProgress` stayed at 0. Every input range
 * started at 0.15, so useTransform clamped to the first keyframe forever and
 * the matrix sat at rotateY(-45deg) rotateX(25deg) translateZ(-800px): the
 * pre-animation pose, permanently. The 600vh track and 90vw/80vh banner that
 * setup needed also overflowed the slot it gets in StoryScroll.
 *
 * Nothing here reads scroll position now. CSS keyframes drive the drift and the
 * pointer drives the perspective, so the motion behaves the same whether or not
 * an ancestor is pinned, rotated or smooth-scrolled — and every dimension is a
 * percentage of the frame rather than of the viewport, so it fills whatever box
 * the parent hands it.
 */

// Exactly COLUMNS.length × CARDS_PER_COLUMN entries — 20 — because COLUMN_ITEMS
// below walks this list in contiguous runs and anything past the twentieth entry
// would sit in the file never rendering.
//
// The workshop's own photographs (`/products/*`) are interleaved through the
// stock frames rather than sitting at the front of the list, for the same reason:
// contiguous runs mean a leading block would put every real piece in the left
// column or two and leave the right of the wall entirely stock. Two per column,
// at the first and fourth slot of each run.
const GALLERY_IMAGES = [
  "/products/hv-7.jpeg",
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=600&q=80",
  "/products/hv-5.jpeg",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  "/products/hv-3.jpeg",
  "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
  "/products/hv-8.jpeg",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
  "/products/hv-4.jpeg",
  "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80",
  "/products/hv-6.jpeg",
  "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=600&q=80",
  "/products/hv-2.jpg",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&w=600&q=80",
  "/products/hv-1.jpg",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
];

// Seconds per loop and direction, one entry per column. Uneven durations are
// the point — matched columns read as one sliding sheet instead of depth.
const COLUMNS = [
  { duration: 46, reverse: false },
  { duration: 58, reverse: true },
  { duration: 40, reverse: false },
  { duration: 52, reverse: true },
];

// Enough cards that one un-duplicated run of a column is taller than the frame
// it scrolls through, which is what keeps the loop from showing its seam. Five
// is fewer than it used to be despite the frame roughly doubling, because the
// cards grew: a taller card clears more of the frame per node, so the wall ends
// up with fewer DOM elements than the shorter version had. See the keyframe note
// below for the arithmetic.
const CARDS_PER_COLUMN = 5;

// The resting pose. The cursor swings it by TILT_RANGE either side; with no
// pointer (touch, or reduced motion) this is all you get, so it has to read as
// deliberate on its own.
const BASE_ROTATE_X = 11;
const BASE_ROTATE_Y = -18;
const BASE_ROTATE_Z = 4;
const TILT_RANGE = 7;

const TILT_SPRING = { stiffness: 90, damping: 24, mass: 0.6 } as const;

const CARD_SIZES = "(max-width: 1024px) 30vw, 380px";

// The drift translates each column up by exactly one un-duplicated run, so the
// duplicate lands where the original started and the loop is invisible.
//
// A column holds 2n cards and 2n-1 gaps, so its height is 2(nh + ng) - g — two
// runs-plus-a-gap, less the trailing gap that isn't there. One run plus its gap
// is therefore 50% + g/2 of the column, not a flat 50%. Getting that half-gap
// wrong is what makes CSS marquees stutter once per cycle.
const STYLES = `
@keyframes gallery-3d-drift {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(0, calc(-50% - (var(--gallery-gap) / 2)), 0); }
}

.gallery-3d-matrix { --gallery-gap: 14px; gap: var(--gallery-gap); }

.gallery-3d-column {
  gap: var(--gallery-gap);
  animation-name: gallery-3d-drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@media (min-width: 768px) {
  .gallery-3d-matrix { --gallery-gap: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .gallery-3d-column { animation: none; }
}
`;

// Walking the source list rather than filtering it by `index % 4` keeps every
// column the same length. The old modulo split left columns of 4 and 3, and a
// short column runs out of height before its loop comes round.
const COLUMN_ITEMS = COLUMNS.map((_, columnIndex) => {
  const run = Array.from(
    { length: CARDS_PER_COLUMN },
    (_, i) => GALLERY_IMAGES[(columnIndex * CARDS_PER_COLUMN + i) % GALLERY_IMAGES.length]
  );
  return [...run, ...run];
});

export function Gallery3D({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // -0.5 … 0.5 across the frame, so the mapping below is symmetric.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [BASE_ROTATE_X + TILT_RANGE, BASE_ROTATE_X - TILT_RANGE]),
    TILT_SPRING
  );
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [BASE_ROTATE_Y - TILT_RANGE, BASE_ROTATE_Y + TILT_RANGE]),
    TILT_SPRING
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      // Coarse pointers report a move on tap, which would leave the wall stuck
      // at whatever angle the finger landed on with no matching leave event.
      if (reducedMotion || event.pointerType !== "mouse") return;
      const frame = frameRef.current;
      if (!frame) return;

      const rect = frame.getBoundingClientRect();
      pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
      pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [pointerX, pointerY, reducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  return (
    <div
      ref={frameRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        // h-full fills the slot the parent gives it, and the min-h floor is
        // there because everything inside this frame is absolutely positioned:
        // if any ancestor's height resolves to auto, h-full resolves to 0 and
        // overflow-hidden makes the whole gallery silently disappear.
        "relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl border border-white/5 bg-[#0d0d0f] sm:min-h-[560px]",
        className
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Clay bloom behind the wall, so the dark frame carries the site's
          palette instead of reading as a plain black hole. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(138,111,89,0.16),transparent_62%)]" />

      <div className="absolute inset-0" style={{ perspective: "1200px" }}>
        {/* Oversized and offset rather than inset-0: rotating the matrix pulls
            its own edges into view, so it has to be bigger than the frame it
            sits in. The horizontal overhang is the larger of the two because
            rotateY does most of the foreshortening; vertically only rotateZ's
            corner lift needs covering, so 118% is enough there — and every
            percent of vertical overhang is height the drift loop has to cover
            before its seam shows. pointer-events-none because the tilt is
            handled on the frame; the cards have nothing to click. */}
        <motion.div
          style={{ rotateX, rotateY, rotateZ: BASE_ROTATE_Z, transformStyle: "preserve-3d" }}
          className="gallery-3d-matrix pointer-events-none absolute -left-[14%] -top-[9%] flex h-[118%] w-[128%] items-start will-change-transform"
        >
          {COLUMN_ITEMS.map((items, columnIndex) => {
            const { duration, reverse } = COLUMNS[columnIndex];
            return (
              <div
                key={columnIndex}
                className="gallery-3d-column flex min-w-0 flex-1 flex-col will-change-transform"
                style={{
                  animationDuration: `${duration}s`,
                  animationDirection: reverse ? "reverse" : "normal",
                  // Negative delay starts each column mid-loop, so they don't
                  // all cross the frame in step.
                  animationDelay: `-${(duration * (columnIndex + 1)) / (COLUMNS.length + 1)}s`,
                }}
              >
                {items.map((src, cardIndex) => (
                  <div
                    key={`${columnIndex}-${cardIndex}`}
                    className="relative h-[160px] w-full shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40 sm:h-[200px] md:h-[260px]"
                  >
                    {/* Decorative: the section heading and callout already say
                        what this wall is, so alt text would only repeat it. */}
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes={CARD_SIZES}
                      className="object-cover opacity-80"
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Vignette last so it sits over the wall and hides where the columns
          run out at the frame edges. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(10,10,12,0.94)_100%)]" />
    </div>
  );
}

export default Gallery3D;
