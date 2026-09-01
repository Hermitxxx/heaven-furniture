// components/SmoothScrollProvider.tsx
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.2,
        });

        // Tell ScrollTrigger to recompute positions from Lenis's scroll value
        // instead of the native scrollTop, every time Lenis moves.
        lenis.on('scroll', ScrollTrigger.update);

        // Drive Lenis from GSAP's ticker rather than its own requestAnimationFrame
        // loop. This is the important part — it means there's exactly ONE RAF
        // loop coordinating both smooth-scroll interpolation and every
        // ScrollTrigger-driven animation, instead of two independent loops
        // racing each other and occasionally landing on different frames.
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        // GSAP's ticker normally "catches up" after a dropped frame (lag
        // smoothing) by jumping time forward, which looks like a stutter when
        // paired with Lenis's own interpolation doing the same thing at once.
        // Disabling it here lets Lenis alone own the smoothing.
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(lenis.raf);
        };
    }, []);

    return <>{children}</>;
}