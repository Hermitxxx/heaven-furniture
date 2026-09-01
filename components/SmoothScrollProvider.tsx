// components/SmoothScrollProvider.tsx
'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// A ref rather than the instance itself. Lenis can only be constructed inside an
// effect (it needs `window`), so publishing the instance directly would mean a
// re-render of the whole tree the moment it became available. A stable ref hands
// consumers the same access with no render at all.
const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

/**
 * Access the page's Lenis instance.
 *
 * Anything that scrolls the page programmatically has to go through this —
 * `window.scrollTo`, `scrollIntoView`, and plain `#hash` anchors all move the
 * native scroll position out from under Lenis's interpolation, which reads as a
 * hard jump followed by a fight over the next few frames.
 *
 * `.current` is null on the first render and after teardown, so callers must
 * handle that case (see `scrollToSection` in Navbar).
 */
export function useLenis() {
    return useContext(LenisContext);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.2,
        });

        lenisRef.current = lenis;

        // Tell ScrollTrigger to recompute positions from Lenis's scroll value
        // instead of the native scrollTop, every time Lenis moves.
        lenis.on('scroll', ScrollTrigger.update);

        // Drive Lenis from GSAP's ticker rather than its own requestAnimationFrame
        // loop. This is the important part — it means there's exactly ONE RAF
        // loop coordinating both smooth-scroll interpolation and every
        // ScrollTrigger-driven animation, instead of two independent loops
        // racing each other and occasionally landing on different frames.
        const driveLenis = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(driveLenis);

        // GSAP's ticker normally "catches up" after a dropped frame (lag
        // smoothing) by jumping time forward, which looks like a stutter when
        // paired with Lenis's own interpolation doing the same thing at once.
        // Disabling it here lets Lenis alone own the smoothing.
        gsap.ticker.lagSmoothing(0);

        return () => {
            // Remove the same function reference that was added. A previous
            // version passed `lenis.raf`, which the ticker had never been given,
            // so the real callback stayed registered and kept driving a
            // destroyed instance — one extra dead loop per hot reload.
            gsap.ticker.remove(driveLenis);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
