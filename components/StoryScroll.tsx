'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Award,
  Ruler,
  ShieldCheck,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

// External component imports (Adjust paths to match your project structure)
import WhyChooseUs from './WhyChooseUs';
import Gallery3D from './Gallery3D';

gsap.registerPlugin(ScrollTrigger);

function cx(...parts: Array<string | undefined | false | null>): string {
  return parts.filter(Boolean).join(' ');
}

// --- Flow Engine Components ---

export interface FlowSectionProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  'aria-label'?: string;
}

export const FlowSection: React.FC<FlowSectionProps> = ({
  className,
  style = {},
  children,
  'aria-label': ariaLabel,
}) => (
  <section
    data-flow-section
    aria-label={ariaLabel}
    className={cx('relative min-h-screen w-full overflow-hidden', className)}
  >
    <div
      data-flow-inner
      className={cx(
        'flow-art-container relative flex min-h-screen w-full flex-col justify-between gap-6 px-[4vw] pt-[clamp(2rem,8vw,4vw)] pb-[4vw]',
        'will-change-transform'
      )}
      style={{ transformOrigin: 'bottom left', ...style }}
    >
      {children}
    </div>
  </section>
);

export interface FlowArtProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

const childCount = (children: React.ReactNode) => React.Children.count(children);

export const FlowArt: React.FC<FlowArtProps> = ({
  children,
  className,
  'aria-label': ariaLabel = 'Story scroll',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return;

      const sections = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>('[data-flow-section]')
      );
      if (sections.length === 0) return;

      const triggers: ScrollTrigger[] = [];

      sections.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 });

        const inner = section.querySelector<HTMLElement>('.flow-art-container');
        if (!inner) return;

        if (i > 0) {
          gsap.set(inner, { rotation: 30, transformOrigin: 'bottom left' });
          const tween = gsap.to(inner, {
            rotation: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top 25%',
              scrub: true,
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        if (i < sections.length - 1) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: 'bottom bottom',
              end: 'bottom top',
              pin: true,
              pinSpacing: false,
            })
          );
        }
      });

      ScrollTrigger.refresh();

      return () => {
        triggers.forEach((t) => t.kill());
      };
    },
    { scope: containerRef, dependencies: [childCount(children), reducedMotion] }
  );

  return (
    <main
      ref={containerRef}
      aria-label={ariaLabel}
      className={cx('w-full overflow-x-hidden', className)}
    >
      {children}
    </main>
  );
};

// --- Main Story Scroll Component ---

export default function FurnitureStoryScroll() {
  return (
    <FlowArt aria-label="Brand Journey and Advantages">
      {/* PAGE 1: Founding & Bespoke Vision (2020) */}
      <FlowSection className="bg-[#121212] text-zinc-100 border-b border-zinc-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#D7C3B1]">
            <span className="flex h-2 w-2 rounded-full bg-[#8a6f59]" />
            Chapter 01
          </div>
          <span className="font-mono text-sm tracking-widest text-zinc-500">
            EST. 2020
          </span>
        </div>

        <div className="my-auto max-w-5xl py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8a6f59] mb-4">
            Founded by Abul Kalam Bhuiyan
          </p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.95]">
            Built For Your Space. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D7C3B1] via-[#8a6f59] to-amber-200">
              Never Mass-Produced.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
            In 2020, Abul Kalam Bhuiyan established a workshop dedicated to uncompromised woodworking.
            Every piece is fully bespoke—crafted from premium woods by in-house artisans to fit the exact geometry of your home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/80">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[#D7C3B1]">
              <Ruler className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">Tailored Dimensions</h3>
              <p className="text-xs text-zinc-400 mt-1">Custom-fitted blueprints engineered for your room layout.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[#D7C3B1]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">Master Craftsmanship</h3>
              <p className="text-xs text-zinc-400 mt-1">Hand-selected timbers joined with time-tested joinery.</p>
            </div>
          </div>
        </div>
      </FlowSection>

      {/* PAGE 2: Why Choose Us Component */}
      <FlowSection className="bg-[#f7f5f1] text-zinc-900 border-b border-black/5 !px-0 !py-0">
        <div className="flex flex-col justify-center h-full w-full">
          <WhyChooseUs className="border-none" />
        </div>
      </FlowSection>

      {/* PAGE 3: Industry Recognition & Trust (2025–2026) */}
      <FlowSection className="bg-[#0f0e0d] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-amber-300">
            <span className="flex h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
            Chapter 03
          </div>
          <span className="font-mono text-sm tracking-widest text-zinc-500">
            2025 – 2026
          </span>
        </div>

        <div className="my-auto max-w-5xl py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8a6f59] mb-4">
            Recognized Industry Leader
          </p>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.95]">
            Trusted Nationwide. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D7C3B1] to-[#8a6f59]">
              Officially Honored.
            </span>
          </h2>
          <p className="mt-8 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
            Inducted into the Chamber of Commerce in 2025 and awarded nationwide recognition by the Bangladesh Furniture Industry Owners Association (BFIOA) in 2026.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white">BFIOA Recognition</p>
              <p className="text-[11px] text-zinc-400">Official National Furniture Body Member</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[#D7C3B1]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white">Chamber of Commerce</p>
              <p className="text-[11px] text-zinc-400">Verified & Certified Excellence</p>
            </div>
          </div>
        </div>
      </FlowSection>

      {/* PAGE 4: the finished-work wall. Cream rather than another near-black:
          PAGE 3 is #0f0e0d and this was #18181b, a 5% lightness difference that
          reads as one continuous dark band instead of a new scene. Alternating
          back also restores the chapter rhythm — dark, cream, dark, cream — and
          turns the gallery's dark frame into a deliberate window. */}
      <FlowSection className="bg-[#f2efe9] text-zinc-900">
        {/* flex-1, not h-full: flow-art-container sets min-h-screen with no
            definite height, so a percentage height here resolves against
            content and collapses anything inside that tries to grow into it.
            No padding of its own either — flow-art-container already insets by
            4vw, and paying it twice was costing the gallery ~100px of height.

            min-h-[120vh] is what makes this chapter taller than a screen. It has
            to live here rather than on the FlowSection: the section's height is
            driven by this subtree, so raising the section's own min-height would
            just leave dead cream below the callout. Safe because this is the
            last FlowSection and FlowArt only pins sections before the last —
            a taller panel here simply scrolls. Raised to 132vh alongside the
            bigger heading and the gap below it, so pushing the gallery down
            doesn't claw back the height gained in the previous pass. */}
        <div className="flex min-h-[132vh] flex-1 flex-col justify-between w-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 pb-5">
            <div>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#8a6f59] mb-2">
                <span className="flex h-2 w-2 rounded-full bg-zinc-950" />
                Chapter 04
              </div>
              {/* Same scale as the WhyChooseUs h2 in PAGE 2 — text-4xl/md:text-6xl
                  at tracking-[-0.06em] — so the two chapters read as the same
                  level of heading. leading-[0.95] stays because this one is two
                  lines where that one is one. */}
              <h2 className="text-4xl font-black uppercase tracking-[-0.06em] text-zinc-950 leading-[0.95] md:text-6xl">
                Out Of The Workshop. <br />
                <span className="text-[#8a6f59]">Into Your Home.</span>
              </h2>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-zinc-600 leading-relaxed">
              A few hundred rooms across Chattogram have one of these in them. The wall drifts on its own — on a desktop it tilts toward your cursor.
            </p>
          </div>

          {/* 3D Gallery Canvas. flex-1 hands the gallery the height left over
              between the header and the callout; mt drops it clear of the
              heading now that the panel is tall enough to afford the gap. No
              min-h-0 here — the matrix inside is absolutely positioned, so this
              box has no content height to fall back on, and licensing it to
              shrink below content size is licensing it to reach zero.

              max-h caps the frame instead of letting flex-1 run away on an
              unusually tall viewport. That bound is what keeps the drift loop
              honest: the seam shows once the frame outgrows one un-duplicated
              column run, so the frame needs a ceiling the run is sized against
              rather than a card count chased upward per display. */}
          <div className="relative mt-12 max-h-[1000px] flex-1 py-4 md:mt-20">
            <Gallery3D className="border-black/10 shadow-[0_40px_80px_-30px_rgba(24,20,16,0.45)]" />
          </div>

          {/* Bottom Callout */}
          <div className="flex items-center justify-between border-t border-black/10 pt-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Finished pieces
            </span>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8a6f59]">
              <span>Agrabad Showroom Collection</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </FlowSection>
    </FlowArt>
  );
}