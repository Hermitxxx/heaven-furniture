"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type Transition, type Variants } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import Bespoke from "../public/bespoke.jpeg";
import Consult from "../public/consultation.jpg";
import Heritage from "../public/heritage.jpeg";
import Trust from "../public/trust.jpg";

// Plus Jakarta Sans, scoped to a wrapper class the way CinematicFooter scopes
// it. app/layout.tsx loads Playfair Display and Noto Sans, so every light
// section on this page pulls this family in itself — matching that is what puts
// these headings on the same face as the carousel, testimonials and footer.
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

.why-choose-us {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}
`;

const AUTO_PLAY_DURATION = 5000;

interface Reason {
    num: string;
    name: string;
    description: string;
    image: StaticImageData;
}

// The numbers, names and photography are the four items Features.tsx renders
// through its SVG clip-path mosaic, in the same order — the two files are rival
// treatments of one section, so keeping the arrays identical means swapping one
// for the other never changes what the page claims. Two fields differ: `clipId`
// is gone (nothing is masked here), and a `description` is added, because a row
// you can click has to pay off with more than its own label repeated back.
// Copy is drawn from whychooseus.txt.
const REASONS: Reason[] = [
    {
        num: "01",
        name: "FREE CONSULTATION",
        description:
            "Tell us the room. We measure it, draw it and quote it at no cost, before you have committed to anything.",
        image: Consult,
    },
    {
        num: "02",
        name: "BESPOKE DESIGN",
        description:
            "Nothing here is mass-produced. Every piece is built to your space, down to the alcove it has to sit in.",
        image: Bespoke,
    },
    {
        num: "03",
        name: "PREMIUM MATERIALS",
        description:
            "Premium wood and materials, cut and joined in our own workshop by craftsmen we employ ourselves.",
        image: Heritage,
    },
    {
        num: "04",
        name: "PROVEN TRUST",
        description:
            "Hundreds of happy homeowners, a showroom in Agrabad you can walk into, and delivery, installation and easy payment included.",
        image: Trust,
    },
];

const SLIDE_VARIANTS: Variants = {
    enter: (direction: number) => ({ y: direction > 0 ? "-100%" : "100%", opacity: 0 }),
    center: { zIndex: 1, y: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, y: direction > 0 ? "100%" : "-100%", opacity: 0 }),
};

// Reduced-motion fallback: a 100% translate of a full-width photograph is the
// largest movement in the section, so it cross-fades instead.
const FADE_VARIANTS: Variants = {
    enter: { opacity: 0 },
    center: { zIndex: 1, opacity: 1 },
    exit: { zIndex: 0, opacity: 0 },
};

const SLIDE_TRANSITION: Transition = {
    y: { type: "spring", stiffness: 260, damping: 32 },
    opacity: { duration: 0.4 },
};

const FADE_TRANSITION: Transition = { opacity: { duration: 0.3 } };

export function WhyChooseUs({ className }: { className?: string }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    // Same query StoryScroll checks. The list below advances on its own every
    // five seconds, which is precisely the unrequested motion this preference is
    // about, so with it set the section becomes click-only.
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReducedMotion(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    const handleNext = useCallback(() => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % REASONS.length);
    }, []);

    const handlePrev = useCallback(() => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + REASONS.length) % REASONS.length);
    }, []);

    const handleSelect = (index: number) => {
        if (index === activeIndex) return;
        setDirection(index > activeIndex ? 1 : -1);
        setActiveIndex(index);
    };

    useEffect(() => {
        if (isPaused || reducedMotion) return;
        const interval = setInterval(handleNext, AUTO_PLAY_DURATION);
        return () => clearInterval(interval);
    }, [activeIndex, isPaused, reducedMotion, handleNext]);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: STYLES }} />

            {/* No id on the section: the navbar's scroll spy resolves #about on
                the wrapper in ZoomInScroll, and this element fades in on a
                y-transform — an anchor measured mid-animation is a moving
                target. Cream matches the Carousel band; pass className to move
                it onto white if the neighbouring section changes. */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                    "why-choose-us w-full overflow-hidden border-t border-black/5 bg-[#f7f5f1] py-20 text-zinc-900 transition-colors duration-500 md:py-32",
                    className
                )}
            >
                <div className="mx-auto max-w-7xl px-6 md:px-10">
                    <div className="mb-14 max-w-3xl md:mb-20">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a6f59]">
                            Why we exist
                        </p>
                        <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.06em] text-zinc-950 md:text-6xl">
                            Why choose us
                        </h2>
                    </div>

                    {/* Pause handlers sit on the whole grid rather than just the
                        photograph: a five-second auto-advance has to stop while
                        someone is reading a row, and onFocus/onBlur covers the
                        keyboard, which has no hover to pause with. */}
                    <div
                        onMouseLeave={() => setIsPaused(false)}
                        onFocus={() => setIsPaused(true)}
                        onBlur={() => setIsPaused(false)}
                        className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16"
                    >

                        <div className="order-2 lg:order-1 lg:col-span-7">
                            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-black/5 bg-[#e9e3db] md:aspect-[4/3] lg:aspect-[16/11]">
                                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                    <motion.div
                                        key={activeIndex}
                                        custom={direction}
                                        variants={reducedMotion ? FADE_VARIANTS : SLIDE_VARIANTS}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={reducedMotion ? FADE_TRANSITION : SLIDE_TRANSITION}
                                        className="absolute inset-0 cursor-pointer"
                                        onClick={handleNext}
                                    >
                                        <Image
                                            src={REASONS[activeIndex].image}
                                            // Decorative: the row alongside already names
                                            // the reason this photograph stands in for, so
                                            // alt text here would only repeat it. The
                                            // source files run 2–3MB each, so this goes
                                            // through <Image> rather than a bare <img>.
                                            alt=""
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 58vw"
                                            placeholder="blur"
                                            className="object-cover"
                                        />

                                        <span className="absolute inset-x-0 bottom-0 block h-1/3 bg-linear-to-t from-black/25 via-transparent to-transparent" />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Glass pills, same treatment as the footer's. */}
                                <div className="absolute bottom-6 right-6 z-20 flex gap-3 md:bottom-8 md:right-8">
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        aria-label="Previous reason"
                                        className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/80 text-zinc-900 backdrop-blur-md transition-all hover:bg-white hover:text-[#8a6f59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a6f59] active:scale-90 md:h-12 md:w-12"
                                    >
                                        <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        aria-label="Next reason"
                                        className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/80 text-zinc-900 backdrop-blur-md transition-all hover:bg-white hover:text-[#8a6f59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a6f59] active:scale-90 md:h-12 md:w-12"
                                    >
                                        <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 flex flex-col lg:order-2 lg:col-span-5">
                            {REASONS.map((reason, index) => {
                                const isActive = index === activeIndex;
                                return (
                                    <button
                                        key={reason.num}
                                        type="button"
                                        onClick={() => handleSelect(index)}
                                        aria-expanded={isActive}
                                        className={cn(
                                            "relative flex items-start gap-4 py-6 text-left transition-colors duration-500 md:gap-6 md:py-8",
                                            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8a6f59]",
                                            isActive ? "text-[#8a6f59]" : "text-zinc-400 hover:text-zinc-900"
                                        )}
                                    >
                                        {/* The divider is drawn rather than set as a
                                            border-top so the countdown can fill the
                                            same 1px row instead of doubling up
                                            underneath a border. Keyed on isPaused to
                                            restart the fill when the timer resumes. */}
                                        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-black/10">
                                            {isActive && !reducedMotion && (
                                                <motion.span
                                                    key={`${reason.num}-${String(isPaused)}`}
                                                    className="block h-full w-full origin-left bg-[#8a6f59]"
                                                    initial={{ scaleX: 0 }}
                                                    animate={{ scaleX: isPaused ? 0 : 1 }}
                                                    transition={{
                                                        duration: AUTO_PLAY_DURATION / 1000,
                                                        ease: "linear",
                                                    }}
                                                />
                                            )}
                                        </span>

                                        <span
                                            className={cn(
                                                "mt-1.5 shrink-0 font-mono text-[11px] tabular-nums tracking-[0.2em] transition-opacity duration-500 md:mt-2",
                                                isActive ? "opacity-100" : "opacity-60"
                                            )}
                                        >
                                            {reason.num}
                                        </span>

                                        <span className="flex flex-1 flex-col">
                                            <span
                                                className={cn(
                                                    "text-2xl font-black uppercase leading-[0.95] tracking-[-0.04em] transition-transform duration-700 md:text-3xl lg:text-4xl",
                                                    isActive ? "translate-x-1" : "translate-x-0"
                                                )}
                                            >
                                                {reason.name}
                                            </span>

                                            {/* Spans, not <p>/<div>: a button may only
                                                contain phrasing content. */}
                                            <AnimatePresence initial={false}>
                                                {isActive && (
                                                    <motion.span
                                                        className="block overflow-hidden"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                                    >
                                                        <span className="block max-w-sm pt-3 text-sm leading-relaxed text-zinc-600 md:text-base">
                                                            {reason.description}
                                                        </span>
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.section>
        </>
    );
}

export default WhyChooseUs;
