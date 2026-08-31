'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Features } from './Features'; // ← adjust this path to wherever Features actually lives
import { Carousel } from './Carousel';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Sofa Silhouette Mask ──────────
// Two rolled arms, a 3-cushion tufted backrest, a seat base band, and 4 feet.
// Built with encodeURIComponent (not a hand-escaped string) so the data URI
// can't get corrupted by quotes, '#', or line breaks.
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

export interface LipScrollZoominAnimationProps {
    outroTitle?: React.ReactNode;
    outroSubtitle?: React.ReactNode;
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
    videoSrc = 'https://res.cloudinary.com/dsuwzuaxp/video/upload/cinematic_drone_videos_shew9q.mp4',
    posterSrc = 'https://res.cloudinary.com/dsuwzuaxp/video/upload/cinematic_drone_videos_shew9q.jpg',
    className = '',
}: LipScrollZoominAnimationProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pinRef = useRef<HTMLDivElement>(null);
    const maskLayerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!containerRef.current || !pinRef.current) return;

        if (videoRef.current) {
            videoRef.current.defaultMuted = true;
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => { });
        }

        const ctx = gsap.context(() => {
            const getInitialSize = () => {
                if (typeof window === 'undefined') return 420;
                if (window.innerWidth < 640) return 300;
                if (window.innerWidth < 1024) return 400;
                return 480;
            };

            const initialSize = getInitialSize();

            if (maskLayerRef.current) {
                maskLayerRef.current.style.setProperty('--maskW', `${initialSize}px`);
                maskLayerRef.current.style.webkitMaskSize = `${initialSize}px`;
                maskLayerRef.current.style.maskSize = `${initialSize}px`;
            }

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=260%',
                    scrub: 1.2,
                    pin: pinRef.current,
                    pinSpacing: true,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const startSize = getInitialSize();
                        const currentSize = startSize + Math.pow(progress, 2.3) * 4800;
                        if (maskLayerRef.current) {
                            maskLayerRef.current.style.setProperty('--maskW', `${currentSize}px`);
                            maskLayerRef.current.style.webkitMaskSize = `${currentSize}px`;
                            maskLayerRef.current.style.maskSize = `${currentSize}px`;
                        }
                    },
                },
            });

            tl.to(
                videoRef.current,
                {
                    scale: 1.22,
                    ease: 'none',
                },
                0
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className={`w-full bg-white text-black selection:bg-blue-600 selection:text-white ${className}`}>
            {/* 1. INTRO SECTION — Features block */}
            <Features />

            {/* 2. PURE SOLO SOFA MASK SCROLL DIVE SECTION */}
            <div
                ref={containerRef}
                className="relative w-full bg-white text-black selection:bg-blue-600 selection:text-white"
                style={{ minHeight: '360vh' }}
            >
                <div
                    ref={pinRef}
                    className="motion-section__pin sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-white select-none relative"
                >
                    {/* Top-Left Corner */}
                    <div className="absolute top-[10px] left-[10px] z-30 pointer-events-none w-4 h-4 sm:w-5 sm:h-5 text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10 10" fill="none" className="w-full h-full">
                            <path d="M10 0V1H1V10H0V0H10Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
                        </svg>
                    </div>

                    {/* Top-Right Corner */}
                    <div className="absolute top-[10px] right-[10px] z-30 pointer-events-none w-4 h-4 sm:w-5 sm:h-5 text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10 10" fill="none" className="w-full h-full">
                            <path d="M10 0V10H9V1H0V0H10Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
                        </svg>
                    </div>

                    {/* Bottom-Left Corner */}
                    <div className="absolute bottom-[10px] left-[10px] z-30 pointer-events-none w-4 h-4 sm:w-5 sm:h-5 text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10 10" fill="none" className="w-full h-full">
                            <path d="M-4.37116e-07 0L1 -4.37114e-08L1 9L10 9L10 10L0 10L-4.37116e-07 0Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
                        </svg>
                    </div>

                    {/* Bottom-Right Corner */}
                    <div className="absolute bottom-[10px] right-[10px] z-30 pointer-events-none w-4 h-4 sm:w-5 sm:h-5 text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10 10" fill="none" className="w-full h-full">
                            <path d="M10 10L-4.37114e-07 10L-3.93402e-07 9L9 9L9 -4.37114e-08L10 0L10 10Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
                        </svg>
                    </div>

                    {/* Subtle Ambient Background Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
                        <span className="text-[20vw] font-black uppercase tracking-tighter text-black">
                            LOREM
                        </span>
                    </div>

                    {/* Pure Solo Sofa Mask Video Portal */}
                    <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center">
                        <div
                            ref={maskLayerRef}
                            className="motion-section__bottom w-full h-full relative overflow-hidden flex items-center justify-center"
                            style={{
                                WebkitMaskImage: `url("${SOFA_MASK_SVG_URI}")`,
                                maskImage: `url("${SOFA_MASK_SVG_URI}")`,
                                WebkitMaskPosition: '50% 50%',
                                maskPosition: '50% 50%',
                                WebkitMaskRepeat: 'no-repeat',
                                maskRepeat: 'no-repeat',
                                WebkitMaskSize: 'var(--maskW, 480px)',
                                maskSize: 'var(--maskW, 480px)',
                                transition: 'mask-size 0.04s linear, -webkit-mask-size 0.04s linear',
                            }}
                        >
                            <video
                                ref={videoRef}
                                className="motion-section__video lazy-video-section w-full h-full object-cover will-change-transform bg-black"
                                loop
                                muted
                                playsInline
                                autoPlay
                                preload="auto"
                                poster={posterSrc}
                                style={{
                                    transform: 'scale(1.0)',
                                    transformOrigin: '50% 50%',
                                }}
                            >
                                <source src={videoSrc} type="video/mp4" />
                                <source src="https://res.cloudinary.com/dsuwzuaxp/video/upload/856381-hd_1920_1080_30fps_gsq11b.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. OUTRO SECTION */}
            <footer>
                <Carousel></Carousel>
            </footer>

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