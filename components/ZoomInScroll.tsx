'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Carousel } from './Carousel';
import { TestimonialsSection } from './TestimonialsSection';
import FurnitureStoryScroll from './StoryScroll';
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// ────────────────────────────────────────────────────────────────
// Sofa silhouette mask
// Two rolled arms, a 3-cushion tufted backrest, a seat base band, and 4 feet.
// Built with encodeURIComponent (not a hand-escaped string) so the data URI
// can't get corrupted by quotes, '#', or line breaks.
// ────────────────────────────────────────────────────────────────
const SOFA_SVG_MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 150" fill="#000000">
  <rect x="10" y="50" width="28" height="86" rx="14"/>
  <rect x="202" y="50" width="28" height="86" rx="14"/>
  <path d="M38 70 Q38 34 62 34 Q70 18 82 34 Q90 18 102 34 Q110 18 122 34 Q130 18 142 34 Q150 18 162 34 Q178 34 178 70 L178 100 L38 100 Z"/>
  <rect x="16" y="96" width="208" height="34" rx="12"/>
  <rect x="26" y="128" width="12" height="16" rx="3"/>
  <rect x="58" y="128" width="12" height="16" rx="3"/>
  <rect x="170" y="128" width="12" height="16" rx="3"/>
  <rect x="202" y="128" width="12" height="16" rx="3"/>
</svg>`;

const SOFA_MASK_SVG_URI = `data:image/svg+xml,${encodeURIComponent(SOFA_SVG_MARKUP)}`;

// Mask width in px at each breakpoint, and how much the mask grows over the
// scroll, keyed to the same breakpoint (a small screen doesn't need to grow
// as many pixels to feel like it fills the frame as a large one does).
const MASK_BREAKPOINTS = [
    { maxWidth: 640, initialSize: 300, growth: 3400 },
    { maxWidth: 1024, initialSize: 400, growth: 4200 },
    { maxWidth: Infinity, initialSize: 480, growth: 4800 },
] as const;

function getMaskConfig() {
    if (typeof window === 'undefined') return MASK_BREAKPOINTS[2];
    return (
        MASK_BREAKPOINTS.find((bp) => window.innerWidth < bp.maxWidth) ??
        MASK_BREAKPOINTS[MASK_BREAKPOINTS.length - 1]
    );
}

// Growth curve: progress^GROWTH_EASE. Above 1, growth stays subtle early and
// accelerates sharply near the end of the scroll.
const GROWTH_EASE = 2.3;
const PIN_SCROLL_DISTANCE = '+=260%';
const VIDEO_END_SCALE = 1.22;

// ────────────────────────────────────────────────────────────────
// Small decorative subcomponent — the four viewfinder-style corner marks
// ────────────────────────────────────────────────────────────────
const CORNER_PATHS = {
    tl: 'M10 0V1H1V10H0V0H10Z',
    tr: 'M10 0V10H9V1H0V0H10Z',
    bl: 'M-4.37116e-07 0L1 -4.37114e-08L1 9L10 9L10 10L0 10L-4.37116e-07 0Z',
    br: 'M10 10L-4.37114e-07 10L-3.93402e-07 9L9 9L9 -4.37114e-08L10 0L10 10Z',
} as const;

const CORNER_POSITION_CLASSES: Record<keyof typeof CORNER_PATHS, string> = {
    tl: 'top-[10px] left-[10px]',
    tr: 'top-[10px] right-[10px]',
    bl: 'bottom-[10px] left-[10px]',
    br: 'bottom-[10px] right-[10px]',
};

function CornerMark({ corner }: { corner: keyof typeof CORNER_PATHS }) {
    return (
        <div
            className={`absolute z-30 pointer-events-none w-4 h-4 sm:w-5 sm:h-5 text-black ${CORNER_POSITION_CLASSES[corner]}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10 10" fill="none" className="w-full h-full">
                <path d={CORNER_PATHS[corner]} fill="currentColor" style={{ mixBlendMode: 'difference' }} />
            </svg>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────
export interface ZoomInScrollProps {
    outroTitle?: React.ReactNode;
    outroSubtitle?: React.ReactNode;
    watermarkText?: string;
    videoSrc?: string;
    posterSrc?: string;
    className?: string;
}

export function ZoomInScroll({
    outroTitle = (
        <>
            THE JOURNEY <span className="text-blue-600 font-black">CONTINUES.</span>
        </>
    ),
    outroSubtitle = (
        <>
            EXPERIENCE VISCERAL DIGITAL STORYTELLING THROUGH{' '}
            <span className="text-blue-600 font-black">UNCOMPROMISING MOTION</span>, ARCHITECTURAL DEPTH, AND{' '}
            <span className="text-blue-600 font-black">BESPOKE INTERACTION</span>.
        </>
    ),
    watermarkText = 'HEAVEN FURNITURE',
    videoSrc = 'https://res.cloudinary.com/jvbg08pb/video/upload/v1788222015/cinematic.mp4',
    posterSrc = '',
    className = '',
}: ZoomInScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pinRef = useRef<HTMLDivElement>(null);
    const maskLayerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    // Holds the current breakpoint's { initialSize, growth } so onUpdate can
    // read it every scroll tick without re-touching window.innerWidth each time.
    const maskConfigRef = useRef(getMaskConfig());

    const applyMaskSize = (px: number) => {
        const el = maskLayerRef.current;
        if (!el) return;
        el.style.setProperty('--maskW', `${px}px`);
        el.style.webkitMaskSize = `${px}px`;
        el.style.maskSize = `${px}px`;
    };

    useEffect(() => {
        if (!containerRef.current || !pinRef.current) return;

        const video = videoRef.current;
        if (video) {
            video.defaultMuted = true;
            video.muted = true;
            video.play().catch(() => { });
        }

        const ctx = gsap.context(() => {
            maskConfigRef.current = getMaskConfig();
            applyMaskSize(maskConfigRef.current.initialSize);

            // The timeline must be created INSIDE the scrollTrigger config for
            // scrubbing to work — that's what wires its progress to scroll
            // position. (A previous version created a ScrollTrigger separately
            // and passed it to a tween afterward via `scrollTrigger: existingInstance`,
            // which does not attach anything — the tween just ran unscrubbed
            // with no driver. That's what killed the zoom effect.)
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: PIN_SCROLL_DISTANCE,
                    scrub: 1.2,
                    pin: pinRef.current,
                    pinSpacing: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const { initialSize, growth } = maskConfigRef.current;
                        const size = initialSize + Math.pow(self.progress, GROWTH_EASE) * growth;
                        applyMaskSize(size);
                    },
                },
            });

            tl.to(video, { scale: VIDEO_END_SCALE, ease: 'none' }, 0);

            const scrollTrigger = tl.scrollTrigger as ScrollTrigger;

            // If the video's real dimensions arrive after ScrollTrigger's first
            // measurement, refresh so the pin's start/end points stay accurate —
            // otherwise the first scroll into the pin can visibly snap to correct.
            const handleLoadedMetadata = () => ScrollTrigger.refresh();
            video?.addEventListener('loadedmetadata', handleLoadedMetadata);

            // Recompute which breakpoint's mask config applies on resize/rotate,
            // and immediately re-paint the mask at the current scroll progress
            // so a resize mid-scroll doesn't leave a stale size on screen.
            const handleResize = () => {
                maskConfigRef.current = getMaskConfig();
                applyMaskSize(
                    maskConfigRef.current.initialSize +
                    Math.pow(scrollTrigger.progress, GROWTH_EASE) * maskConfigRef.current.growth
                );
            };
            window.addEventListener('resize', handleResize);

            return () => {
                video?.removeEventListener('loadedmetadata', handleLoadedMetadata);
                window.removeEventListener('resize', handleResize);
            };
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const maskLayerStyle = useMemo<React.CSSProperties>(
        () => ({
            WebkitMaskImage: `url("${SOFA_MASK_SVG_URI}")`,
            maskImage: `url("${SOFA_MASK_SVG_URI}")`,
            WebkitMaskPosition: '50% 50%',
            maskPosition: '50% 50%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'var(--maskW, 480px)',
            maskSize: 'var(--maskW, 480px)',
            transition: 'mask-size 0.04s linear, -webkit-mask-size 0.04s linear',
        }),
        []
    );

    return (
        <div className={`w-full bg-white text-black selection:bg-blue-600 selection:text-white ${className}`}>
            {/* 1. INTRO — the "why choose us" story panels. The #about anchor
                lives on this wrapper rather than inside: the navbar's scroll spy
                looks the id up by getElementById, and StoryScroll's panels are
                pinned and rotated, so measuring one of them directly would give
                the navbar a moving target. */}
            <div id="about">
                {/* <WhyChooseUs /> */}
                <FurnitureStoryScroll></FurnitureStoryScroll>
            </div>

            {/* 2. PINNED SOFA-MASK VIDEO REVEAL */}
            <div
                ref={containerRef}
                className="relative w-full bg-white text-black selection:bg-blue-600 selection:text-white"
                style={{ minHeight: '360vh' }}
            >
                <div
                    ref={pinRef}
                    // Deliberately NOT `sticky`: ScrollTrigger's `pin` option takes
                    // this element to `position: fixed` itself once the trigger
                    // fires. Having `sticky` here too means two positioning systems
                    // fight over the same box during the handoff — that caused a
                    // micro-jump on the first scroll into the section.
                    className="motion-section__pin relative w-full h-screen overflow-hidden flex items-center justify-center bg-white select-none"
                >
                    <CornerMark corner="tl" />
                    <CornerMark corner="tr" />
                    <CornerMark corner="bl" />
                    <CornerMark corner="br" />

                    {/* Ambient background watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
                        <span className="text-[20vw] font-black uppercase tracking-tighter text-black">
                            {watermarkText}
                        </span>
                    </div>

                    {/* Sofa-mask video portal */}
                    <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center">
                        <div
                            ref={maskLayerRef}
                            className="motion-section__bottom w-full h-full relative overflow-hidden flex items-center justify-center"
                            style={maskLayerStyle}
                        >
                            <video
                                ref={videoRef}
                                className="motion-section__video lazy-video-section w-full h-full object-cover will-change-transform bg-black"
                                loop
                                muted
                                playsInline
                                autoPlay
                                preload="auto"
                                poster={posterSrc || undefined}
                                style={{ transformOrigin: '50% 50%' }}
                            >
                                <source src={videoSrc} type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. OUTRO — product carousel. Plain div, not <footer>: the page's
                real footer is CinematicFooter, and two <footer> landmarks in one
                document leaves assistive tech with no single "end of page".
                It also carries the #collections anchor rather than the section
                inside Carousel, which animates in on a y-transform — measuring
                a transformed element mid-animation gives the navbar a moving
                target to scroll to. */}
            <div id="collections">
                <Carousel />
            </div>

            {/* 4. Social proof, directly after the collections. */}
            <TestimonialsSection />

            <style
                dangerouslySetInnerHTML={{
                    __html: `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
            .motion-section__pin, .motion-section__bottom, button, p, span, h1, h2 {
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-style: normal !important;
            }
            .pin-spacer {
              background-color: #ffffff !important;
            }
          `,
                }}
            />
        </div>
    );
}

export default ZoomInScroll;