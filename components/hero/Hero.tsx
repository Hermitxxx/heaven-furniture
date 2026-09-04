"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import TextMorph from "../ui/text-morph";
import { HERO_SPRING, useHeroRise, useRevealed } from "./RevealGate";

/**
 * Drives the masthead from the optical centre of the viewport up to its resting
 * position, which is the whole trick of the preloader effect.
 *
 * The reference site fakes this with a flat 200px offset, which happens to be
 * close to the gap between centre and resting position at one particular window
 * size and drifts at every other. Measuring instead means the word is genuinely
 * centred during the hold and genuinely at the top afterwards, at any viewport,
 * so the eye reads one continuous rise rather than two elements swapping.
 *
 * The offset lives on a motion value rather than in state for two reasons: it is
 * a layout measurement feeding a transform, so no render needs to see it, and
 * writing it from a layout effect lands the transform on the DOM before the
 * browser paints. That is what removes the need to hide the hero on first frame.
 */
function useMastheadHandoff(enabled: boolean, revealed: boolean) {
  const ref = useRef<HTMLHeadingElement>(null);
  const y = useMotionValue(0);

  useLayoutEffect(() => {
    if (!enabled || revealed) return;

    const measure = () => {
      const el = ref.current;
      if (!el) return;

      // getBoundingClientRect reports the transformed box, so the current offset
      // has to come back out to recover where the element actually rests.
      const rect = el.getBoundingClientRect();
      const restingCentre =
        rect.top - y.get() + window.scrollY + rect.height / 2;
      y.set(Math.max(0, window.innerHeight / 2 - restingCentre));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [enabled, revealed, y]);

  useEffect(() => {
    if (!enabled || !revealed) return;

    const controls = animate(y, 0, HERO_SPRING);
    return () => controls.stop();
  }, [enabled, revealed, y]);

  return { ref, y };
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const revealed = useRevealed();
  const animated = !reduceMotion;
  const { ref: mastheadRef, y: mastheadY } = useMastheadHandoff(
    animated,
    revealed,
  );
  const heroRise = useHeroRise();
  const rise = animated ? heroRise : 0;

  return (
    <section
      id="home"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-ink"
    >
      {/* Showroom plate. Scales down into place rather than fading, so the room
          settles instead of appearing. */}
      <motion.div
        className="absolute inset-0 -z-30"
        initial={{ scale: animated ? 1.2 : 1, opacity: animated ? 0.001 : 1 }}
        animate={revealed ? { scale: 1, opacity: 1 } : undefined}
        transition={HERO_SPRING}
      >
        <Image
          src="/showroom.jpg"
          alt="The Heaven Furniture showroom, with cane armchairs and side tables under warm light"
          fill
          // `priority` is deprecated in Next 16. Eager loading plus a high fetch
          // priority is the documented replacement for an LCP image.
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Legibility scrim, weighted to the top and bottom edges where the
          masthead and the CTAs sit, so the middle of the room stays visible. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,rgb(18_18_18/0.88)_0%,rgb(18_18_18/0.42)_38%,rgb(18_18_18/0.55)_70%,rgb(18_18_18/0.92)_100%)]"
      />

      {/* Film grain, settling at 25% opacity to match the reference's noise
          layer. Scoped to the hero and painted from a rasterised background
          image, so it composites rather than re-running a filter on repaint. */}
      <motion.div
        aria-hidden
        className="grain pointer-events-none absolute inset-0 -z-10 mix-blend-overlay"
        initial={{ opacity: animated ? 0.001 : 0.25 }}
        animate={revealed ? { opacity: 0.25 } : undefined}
        transition={HERO_SPRING}
      />

      <div className="relative flex min-h-[100dvh] flex-col pt-28 pb-10 md:pt-24 md:pb-14">
        {/* Rendered exactly once and never unmounted. There is no second copy
            inside the preloader to cross-fade against, which is why the handoff
            cannot drift or double-expose. Its travel comes from the motion value
            in useMastheadHandoff, written before first paint. */}
        <motion.h1
          ref={mastheadRef}
          style={{ y: mastheadY }}
          className="z-20 whitespace-nowrap px-[0.06em] text-center font-heading text-[clamp(1.5rem,11.2vw,15rem)] font-normal leading-[0.92] text-paper"
        >
          Heaven Furniture
        </motion.h1>

        <div className="mt-auto grid gap-8 px-6 md:grid-cols-[minmax(0,34rem)_auto] md:items-end md:justify-between md:gap-16 md:px-10">
          <motion.p
            className="max-w-[34ch] font-[Helvetica,Arial,sans-serif] text-pretty text-sm leading-relaxed text-sand md:text-base"
            initial={{ y: rise, opacity: animated ? 0.001 : 1 }}
            animate={revealed ? { y: 0, opacity: 1 } : undefined}
            transition={HERO_SPRING}
          >
            <TextMorph
              words={[
                "DIVINE ELEGANCE",
                "REFINED LUXURY",
                "ELEVATED COMFORT",
              ]}
              className="font-[Helvetica,Arial,sans-serif] uppercase tracking-[0.08em]"
            />
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ y: rise, opacity: animated ? 0.001 : 1 }}
            animate={revealed ? { y: 0, opacity: 1 } : undefined}
            transition={HERO_SPRING}
          >
            <a
              href="tel:+8801960481983"
              className="inline-flex h-12 items-center whitespace-nowrap rounded-[2px] bg-paper px-7 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:bg-sand focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-ink focus-visible:outline-none active:translate-y-px"
            >
              Book a consultation
            </a>
            <a
              href="#pieces"
              className="inline-flex h-12 items-center whitespace-nowrap rounded-[2px] border border-sand/40 px-7 text-xs font-semibold uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:border-sand hover:text-sand focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-ink focus-visible:outline-none active:translate-y-px"
            >
              See the pieces
            </a>
          </motion.div>
        </div>
      </div>

      {/* The preloader itself: an opaque plate between the room and the word. It
          holds no text of its own. The masthead sitting above it at z-20 is the
          preloader's content, which is what makes the two states one element. */}
      {animated && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-ink"
          initial={{ opacity: 1 }}
          animate={revealed ? { opacity: 0 } : undefined}
          transition={{ duration: 0.9, ease: [0.27, 0, 0.51, 1] }}
        />
      )}
    </section>
  );
}

export default Hero;
