"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/SmoothScrollProvider";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. INLINE STYLES
// -------------------------------------------------------------------------
// Colours are hard-coded to the warm palette the rest of the site uses
// (#8a6f59 clay, #d7c3b1 tan, #f7f5f1 cream — see Features and Carousel)
// rather than derived from the shadcn tokens. In this project --primary,
// --secondary and --background resolve to near-black, near-white grey and
// white, which made the aurora a grey smudge and gave the glass pills white
// shadows on a white background.
const CLAY = "#8a6f59";

// Real company details. E.164 for the tel: href (no spaces or dashes, so
// dialers don't choke), the spaced form for display.
const PHONE_E164 = "+8801960481983";
const PHONE_DISPLAY = "+880 1960-481983";
const EMAIL = "heavenfurnituremart@gmail.com";
const ADDRESS = "Agrabad Access Road, Chattogram, Bangladesh";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Agrabad+Access+Road%2C+Chattogram%2C+Bangladesh";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;

  --pill-bg-1: rgba(255, 255, 255, 0.8);
  --pill-bg-2: rgba(247, 245, 241, 0.5);
  --pill-shadow: rgba(138, 111, 89, 0.18);
  --pill-highlight: rgba(255, 255, 255, 0.9);
  --pill-inset-shadow: rgba(138, 111, 89, 0.07);
  --pill-border: rgba(9, 9, 11, 0.08);

  --pill-bg-1-hover: rgba(255, 255, 255, 0.95);
  --pill-bg-2-hover: rgba(215, 195, 177, 0.4);
  --pill-border-hover: rgba(138, 111, 89, 0.45);
  --pill-shadow-hover: rgba(138, 111, 89, 0.3);
  --pill-highlight-hover: rgba(255, 255, 255, 1);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(138, 111, 89, 0.5)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px rgba(138, 111, 89, 0.8)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, rgba(9, 9, 11, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(9, 9, 11, 0.04) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Warm Aurora Glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(215, 195, 177, 0.55) 0%,
    rgba(138, 111, 89, 0.22) 40%,
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 10px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
      0 20px 40px -10px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
  color: #09090b;
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(9, 9, 11, 0.07);
  background: linear-gradient(180deg, rgba(9, 9, 11, 0.1) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, #09090b 0%, ${CLAY} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px rgba(138, 111, 89, 0.25));
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    },[]);

    return (
      <Component
        ref={(node: HTMLElement | null) => {
          localRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Bespoke Craftsmanship</span> <span className="text-[#8a6f59]/70">✦</span>
    <span>Solid Hardwood</span> <span className="text-[#d7c3b1]">✦</span>
    <span>Made To Order</span> <span className="text-[#8a6f59]/70">✦</span>
    <span>Free Consultation</span> <span className="text-[#d7c3b1]">✦</span>
    <span>Lifetime Guarantee</span> <span className="text-[#8a6f59]/70">✦</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const lenisRef = useLenis();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    // React strict mode compatible GSAP context cleanup
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  },[]);

  const scrollToTop = () => {
    // Lenis owns the scroll position once mounted, so a native smooth scroll
    // here would be immediately overridden by its next interpolation frame.
    const lenis = lenisRef?.current;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.6 });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      {/* 
        The "Curtain Reveal" Wrapper:
        It sits in standard flow. Because it has clip-path, its contents
        are ONLY visible within its bounding box. 
      */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {/* The actual footer stays fixed to the viewport underneath everything */}
        <footer className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden border-t border-black/5 bg-white text-zinc-900 cinematic-footer-wrapper">

          {/* Ambient Light & Grid Background */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            HEAVEN
          </div>

          {/* 1. Diagonal Sleek Marquee. Hidden below md: a phone viewport can't
              fit the band, the heading, and both CTA rows without them colliding,
              and the band is decorative. On md+ it sits at top-32 rather than
              top-12 so the -rotate-2 scale-110 edge clears the fixed navbar pill,
              which floats over the footer once it's fully revealed. */}
          <div className="hidden md:block absolute top-32 left-0 w-full overflow-hidden border-y border-black/5 bg-white/70 backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-zinc-500 uppercase">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* 2. Main Center Content. The top margin only applies from md up, where
              it clears the marquee band; on mobile there's no band to clear and
              the content centres in the full height. */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 md:mt-20 w-full max-w-5xl mx-auto">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a6f59]">
              Heaven Furniture
            </p>

            <h2
              ref={headingRef}
              className="text-5xl md:text-8xl font-black footer-text-glow tracking-tighter mb-12 text-center"
            >
              Let&apos;s make yours.
            </h2>

            {/* Interactive Magnetic Pills Layout */}
            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              {/* Primary calls to action. The phone number is on the button
                  rather than behind a label — a call is how a consultation
                  actually gets booked, and there's no booking form to send
                  anyone to on a single-page site. */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton as="a" href={`tel:${PHONE_E164}`} className="footer-glass-pill px-10 py-5 rounded-full text-zinc-950 font-bold text-sm md:text-base flex items-center gap-3 group">
                  <Phone className="w-5 h-5 text-[#8a6f59] transition-colors group-hover:text-zinc-950" />
                  Call {PHONE_DISPLAY}
                </MagneticButton>

                <MagneticButton as="a" href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="footer-glass-pill px-10 py-5 rounded-full text-zinc-950 font-bold text-sm md:text-base flex items-center gap-3 group">
                  <MapPin className="w-5 h-5 text-[#8a6f59] transition-colors group-hover:text-zinc-950" />
                  Visit the showroom
                </MagneticButton>
              </div>

              {/* Secondary Text Links */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
                <MagneticButton as="a" href="#" className="footer-glass-pill px-6 py-3 rounded-full text-zinc-500 font-medium text-xs md:text-sm hover:text-zinc-950">
                  Care &amp; Materials
                </MagneticButton>
                <MagneticButton as="a" href="#" className="footer-glass-pill px-6 py-3 rounded-full text-zinc-500 font-medium text-xs md:text-sm hover:text-zinc-950">
                  Delivery &amp; Returns
                </MagneticButton>
                <MagneticButton as="a" href="#" className="footer-glass-pill px-6 py-3 rounded-full text-zinc-500 font-medium text-xs md:text-sm hover:text-zinc-950">
                  Privacy Policy
                </MagneticButton>
              </div>

              {/* Address and email in plain text. Nothing else on the page
                  states where the showroom actually is, and on a landing page
                  that's the detail a local visitor is looking for. */}
              <address className="mt-6 flex flex-col items-center gap-2 not-italic text-xs md:text-sm text-zinc-500 md:flex-row md:gap-3">
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-zinc-950"
                >
                  {ADDRESS}
                </a>
                <span aria-hidden="true" className="hidden text-[#8a6f59]/60 md:inline">
                  ✦
                </span>
                <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-zinc-950">
                  {EMAIL}
                </a>
              </address>
            </div>
          </div>

          {/* 3. Bottom Bar / Credits */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Copyright */}
            <div className="text-zinc-500 text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
              © 2026 Heaven Furniture. All rights reserved.
            </div>

            {/* "Made with Love" Badge */}
            <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default">
              <span className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Crafted with</span>
              <span className="animate-footer-heartbeat text-sm md:text-base text-[#8a6f59]">❤</span>
              <span className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">since</span>
              <span className="text-zinc-950 font-black text-xs md:text-sm tracking-normal ml-1">2020</span>
            </div>

            {/* Back to top */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-zinc-500 hover:text-zinc-950 group order-3"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </MagneticButton>

          </div>
        </footer>
      </div>
    </>
  );
}