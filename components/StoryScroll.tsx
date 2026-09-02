'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Ruler,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

// External component imports (Adjust paths to match your project structure)
import WhyChooseUs from './WhyChooseUs';
import { GalleryCarousel, type HeroCarouselItem } from './GalleryCarousel';

gsap.registerPlugin(ScrollTrigger);

// Chapter 03's slides — every photograph the workshop actually owns, in
// `public/products`, and nothing from a stock library.
//
// Titles are broken across two lines by hand rather than wrapped, because the
// carousel reveals a headline one line at a time and an automatic break would
// put the fold in a different place on every slide. They mirror the titles in
// CollectionGrid's `defaultOffers`, so a piece renamed there has to be renamed
// here too.
const WORKSHOP_SLIDES: HeroCarouselItem[] = [
  {
    id: 'emerald-velvet-platform-bed',
    title: 'EMERALD VELVET\nPLATFORM BED',
    image: '/products/hv-7.jpeg',
    credit: 'BEDROOM · MADE TO ORDER',
    meta: ['COTTON VELVET', 'SOLID WALNUT', 'KING'],
  },
  {
    id: 'royal-blue-carved-sofa-set',
    title: 'ROYAL BLUE\nCARVED SOFA SET',
    image: '/products/hv-5.jpeg',
    credit: 'LIVING ROOM · MADE TO ORDER',
    meta: ['VELVET', 'CARVED MAHOGANY', '3+2 SEATER'],
  },
  {
    id: 'ivory-carved-dining-set',
    title: 'IVORY CARVED\nDINING SET',
    image: '/products/hv-3.jpeg',
    credit: 'DINING · MADE TO ORDER',
    meta: ['CREAM MARBLE', 'IVORY LACQUER', 'EIGHT SEATS'],
  },
  {
    id: 'marble-teak-dining-table',
    title: 'MARBLE & TEAK\nDINING TABLE',
    image: '/products/hv-8.jpeg',
    credit: 'DINING · MADE TO ORDER',
    meta: ['MARBLE', 'SOLID TEAK', 'EIGHT SEATS'],
  },
  {
    id: 'champagne-gilt-sofa-set',
    title: 'CHAMPAGNE GILT\nSOFA SET',
    image: '/products/hv-4.jpeg',
    credit: 'LIVING ROOM · MADE TO ORDER',
    meta: ['QUILTED JACQUARD', 'GILT FRAME', '3+1+1'],
  },
  {
    id: 'embroidered-gilt-daybed',
    title: 'EMBROIDERED\nGILT DAYBED',
    image: '/products/hv-6.jpeg',
    credit: 'LIVING ROOM · MADE TO ORDER',
    meta: ['VELVET', 'HAND EMBROIDERED', 'THREE SEATS'],
  },
  {
    id: 'turned-post-accent-chairs',
    title: 'TURNED POST\nACCENT CHAIRS',
    image: '/products/hv-2.jpg',
    credit: 'LIVING ROOM · MADE TO ORDER',
    meta: ['WOOL BLEND', 'TURNED ROSEWOOD', 'SOLD AS A PAIR'],
  },
  {
    id: 'woven-hanging-egg-chair',
    title: 'WOVEN HANGING\nEGG CHAIR',
    image: '/products/hv-1.jpg',
    credit: 'BALCONY · MADE TO ORDER',
    meta: ['WOVEN RATTAN', 'STEEL STAND', 'CUSHIONS INCLUDED'],
  },
  {
    id: 'classic-wooden-bed-frame',
    title: 'CLASSIC WOODEN\nBED FRAME',
    image: '/products/bed.jpeg',
    credit: 'BEDROOM · MADE TO ORDER',
    meta: ['SOLID HARDWOOD', 'WHITE LACQUER', 'QUEEN'],
  },
  {
    id: 'modern-tufted-sofa',
    title: 'MODERN TUFTED\nSOFA',
    image: '/products/sofa.jpeg',
    credit: 'LIVING ROOM · MADE TO ORDER',
    meta: ['CHANNEL TUFTED', 'WALNUT BASE', 'TWO SEATS'],
  },
  {
    id: 'minimalist-vanity-dresser',
    title: 'MINIMALIST\nVANITY DRESSER',
    image: '/products/vanity.jpeg',
    credit: 'BEDROOM · MADE TO ORDER',
    meta: ['OAK VENEER', 'LED-LIT MIRROR', 'TWO TIERS'],
  },
];

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

      {/* PAGE 3: the finished-work carousel.
          Back on Chapter 01's near-black rather than another cream. The chapters
          are meant to alternate — each one rotates up over the one before it, and
          that reveal only reads as a new panel arriving if the two fields differ.
          Chapter 02 paints its own #f7f5f1 from inside WhyChooseUs, so a #f2efe9
          here was two all-but-identical creams in a row and the rotation looked
          like a rendering glitch instead of a page turn. Palette below is
          Chapter 01's, token for token. */}
      <FlowSection className="bg-[#121212] text-zinc-100">
        {/* flex-1, not h-full: flow-art-container sets min-h-screen with no
            definite height, so a percentage height here resolves against
            content and collapses anything inside that tries to grow into it.
            No padding of its own either — flow-art-container already insets by
            4vw, and paying it twice was costing the gallery ~100px of height.

            justify-center rather than justify-between, and no fixed panel
            height. Those two were the imbalance: a 132vh panel holding a frame
            capped at 1000px leaves free space on any tall viewport, and
            space-between dumps every pixel of it into the two interior gaps —
            so the heading sat flush against the top padding while a few hundred
            pixels of nothing opened under the gallery. The panel is now as tall
            as its contents, gap spaces the interior evenly, and pt gives the
            heading air the 4vw container padding alone didn't. */}
        <div className="flex flex-1 flex-col justify-center gap-8 w-full pt-6 md:gap-12 md:pt-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/80 pb-5">
            <div>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#D7C3B1] mb-2">
                <span className="flex h-2 w-2 rounded-full bg-[#8a6f59]" />
                Chapter 03
              </div>
              {/* Same scale as the WhyChooseUs h2 in PAGE 2 — text-4xl/md:text-6xl
                  at tracking-[-0.06em] — so the two chapters read as the same
                  level of heading. leading-[0.95] stays because this one is two
                  lines where that one is one. */}
              <h2 className="text-4xl font-black uppercase tracking-[-0.06em] text-white leading-[0.95] md:text-6xl">
                Out Of The Workshop. <br />
                {/* Sand, not the clay #8a6f59 this line used on cream: clay is
                    only a shade off #121212 and the second half of the headline
                    would all but vanish. */}
                <span className="text-[#D7C3B1]">Into Your Home.</span>
              </h2>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
              A few hundred rooms across Chattogram have one of these in them. The strip moves on its own until you take it over — drag it, or pick a card.
            </p>
          </div>

          {/* The carousel's stage. A definite height rather than flex-1 filling a
              fixed panel: that is what leaves the panel with no free space to
              redistribute, which is what was starving the top and padding the
              bottom. `grow` (not flex-1, which would reset the basis to 0) only
              comes into play on an unusually tall viewport, where it lets the
              stage take up the slack instead of it collecting under the callout.
              Interior spacing is the wrapper's gap, so the space above and below
              matches by construction.

              The height has to be definite for a second reason: the stage is
              `h-full` and everything inside it is absolutely positioned, so if
              an ancestor's height ever resolved to auto the whole panel would
              collapse to nothing — hence the min-h floor as well.

              max-h caps it because the carousel's cards are clamped at 440px
              tall while the headline keeps scaling with the stage; past that the
              type starts outgrowing the strip it sits above.

              The drop shadow the carousel carried here is gone with the palette
              flip: it was rgba(24,20,16,…), which on a #121212 field is the
              field. A hairline is all the separation a black stage needs against
              near-black. */}
          <div className="relative h-[88vh] min-h-[560px] max-h-[1100px] grow">
            <GalleryCarousel
              items={WORKSHOP_SLIDES}
              ariaLabel="Finished pieces from the workshop"
              autoplay
              autoplayDelay={5200}
              className="rounded-2xl border border-white/10"
            />
          </div>

          {/* Bottom Callout */}
          <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4">
            {/* zinc-400, not the 500 this used on cream — 500 against #121212 is
                about 3.8:1, under the 4.5 that text this small needs. */}
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Finished pieces
            </span>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D7C3B1]">
              <span>Agrabad Showroom Collection</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </FlowSection>
    </FlowArt>
  );
}