'use client'
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import type { StaticImageData } from "next/image";
import Bespoke from '../public/bespoke.jpeg'
import Heritage from '../public/heritage.jpeg'
import Comfort from '../public/comfort.jpg'
import Fabrics from '../public/fabrics.jpg'
import Consult from '../public/consultation.jpg'
import Trust from '../public/trust.jpg'

interface MenuItem {
    num: string;
    name: string;
    clipId: string;
    image: string | StaticImageData;
}

// Next.js static imports resolve to StaticImageData objects (with .src, .width,
// .height), not plain strings. The SVG <image> href and gsap's setAttribute
// both need a plain string, so unwrap `.src` wherever the image is consumed.
const getImageSrc = (image: string | StaticImageData) =>
    typeof image === "string" ? image : image.src;

const defaultItems: MenuItem[] = [
    {
        num: "01",
        name: "FREE CONSULTATION",
        clipId: "clip-mosaic",
        image: Consult
    },
    {
        num: "02",
        name: "BESPOKE DESIGN",
        clipId: "clip-hexagons",
        image: Bespoke
    },
    {
        num: "03",
        name: "PREMIUM MATERIALS",
        clipId: "clip-pixels",
        image: Heritage
    },
    {
        num: "04",
        name: "PROVEN TRUST",
        clipId: "clip-circles",
        image: Trust
    }
];

export const Features = ({
    items = defaultItems,
    className
}: { items?: MenuItem[]; className?: string }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<SVGImageElement>(null);
    const mainGroupRef = useRef<SVGGElement>(null);
    const masterTl = useRef<gsap.core.Timeline | null>(null);

    const createLoop = (index: number) => {
        const item = items[index];
        const selector = `#${item.clipId} .path`;

        if (masterTl.current) masterTl.current.kill();

        if (imageRef.current) imageRef.current.setAttribute("href", getImageSrc(item.image));
        if (mainGroupRef.current) mainGroupRef.current.setAttribute("clip-path", `url(#${item.clipId})`);

        gsap.set(selector, { scale: 0, transformOrigin: "50% 50%" });

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

        // 1. IN (Expo Out)
        tl.to(selector, {
            scale: 1,
            duration: 0.8,
            stagger: { amount: 0.4, from: "random" },
            ease: "expo.out",
        })
            // 2. IDLE (Sine Breath)
            .to(selector, {
                scale: 1.05,
                duration: 1.5,
                yoyo: true,
                repeat: 1,
                ease: "sine.inOut",
                stagger: { amount: 0.2, from: "center" }
            })
            // 3. OUT (Expo In)
            .to(selector, {
                scale: 0,
                duration: 0.6,
                stagger: { amount: 0.3, from: "edges" },
                ease: "expo.in",
            });

        masterTl.current = tl;
    };

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            createLoop(0);
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleItemHover = (index: number) => {
        if (index === activeIndex) return;
        setActiveIndex(index);
        createLoop(index);
    };


    //bg-[#f7f5f1]

    return (
        <section
            ref={containerRef}
            id="about"
            className={cn(
                "relative w-full overflow-hidden border-t border-black/5 text-zinc-900 transition-colors duration-500",
                className
            )}
        >
            <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
                <div className="mb-10 md:mb-14">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500">
                        Why we exist
                    </p>
                    <h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.06em] text-zinc-950 md:text-7xl">
                        Why choose us
                    </h2>
                </div>

                <div className="flex flex-col items-center justify-between gap-12 md:flex-row md:gap-8">

                    <div className="relative mt-6 flex w-full items-center justify-center md:mt-0 md:w-1/2">
                        <div className="absolute h-[120%] w-[120%] rounded-full bg-[#d7c3b1]/20 blur-[110px]" />

                        <svg viewBox="0 0 500 500" className="relative z-10 h-auto w-full max-w-[500px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
                            <defs>
                                {/* Bento mosaic for item 1 — same rounded-rectangle tessellation
                                    approach as clip-hexagons, just a different block arrangement */}
                                <clipPath id="clip-mosaic">
                                    <rect className="path" x="20" y="20" width="240" height="180" rx="12" />
                                    <rect className="path" x="280" y="20" width="200" height="340" rx="12" />
                                    <rect className="path" x="20" y="220" width="110" height="260" rx="12" />
                                    <rect className="path" x="150" y="220" width="110" height="130" rx="12" />
                                    <rect className="path" x="150" y="370" width="110" height="110" rx="12" />
                                    <rect className="path" x="280" y="380" width="200" height="100" rx="12" />
                                </clipPath>

                                <clipPath id="clip-hexagons">
                                    <rect className="path" x="20" y="20" width="200" height="280" rx="12" />
                                    <rect className="path" x="20" y="320" width="200" height="160" rx="12" />
                                    <rect className="path" x="240" y="20" width="240" height="140" rx="12" />
                                    <rect className="path" x="240" y="180" width="110" height="160" rx="12" />
                                    <rect className="path" x="370" y="180" width="110" height="160" rx="12" />
                                    <rect className="path" x="240" y="360" width="240" height="120" rx="12" />
                                </clipPath>

                                <clipPath id="clip-pixels">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <rect
                                            key={i}
                                            className="path"
                                            x={(i % 3) * 160 + 20}
                                            y={Math.floor(i / 3) * 160 + 20}
                                            width="140"
                                            height="140"
                                            rx="4"
                                        />
                                    ))}
                                </clipPath>

                                {/* New unique clip for the 4th item: a grid of circles */}
                                <clipPath id="clip-circles">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <circle
                                            key={i}
                                            className="path"
                                            cx={(i % 3) * 160 + 90}
                                            cy={Math.floor(i / 3) * 160 + 90}
                                            r="68"
                                        />
                                    ))}
                                </clipPath>
                            </defs>

                            <g ref={mainGroupRef} clipPath={`url(#${items[0].clipId})`}>
                                <image
                                    ref={imageRef}
                                    href={getImageSrc(items[0].image)}
                                    width="500"
                                    height="500"
                                    preserveAspectRatio="xMidYMid slice"
                                />
                            </g>
                        </svg>
                    </div>

                    <div className="z-20 w-full md:w-1/2">
                        <nav>
                            <ul className="flex flex-col gap-10 md:gap-14">
                                {items.map((item, index) => (
                                    <li
                                        key={item.num}
                                        onMouseEnter={() => handleItemHover(index)}
                                        className="group cursor-pointer"
                                    >
                                        <div className="flex items-start gap-5 md:gap-6">
                                            <span className={cn(
                                                "mt-2 text-2xl font-bold transition-all duration-500 md:text-3xl",
                                                activeIndex === index
                                                    ? "scale-110 text-[#8a6f59]"
                                                    : "text-zinc-400"
                                            )}>
                                                {item.num}
                                            </span>

                                            <h3 className={cn(
                                                "text-4xl font-black uppercase leading-[0.82] tracking-[-0.05em] transition-all duration-700 md:text-5xl",
                                                activeIndex === index
                                                    ? "translate-x-2 text-[#8a6f59] opacity-100"
                                                    : "translate-x-0 text-zinc-500 opacity-40"
                                            )}>
                                                {item.name.split(' ')[0]}<br />
                                                {item.name.split(' ')[1]}
                                            </h3>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </section>
    );
};