"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Sofa, Sparkles, Info, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLenis } from "@/components/SmoothScrollProvider"

interface NavItem {
    name: string
    /** id of the element on the page this link scrolls to. */
    sectionId: string
    icon: LucideIcon
}

interface NavBarProps {
    className?: string
    defaultActive?: string
}

// Every entry must correspond to an element that actually renders an `id`:
//   #home        → KineticGrid hero            (CinematicProductScroll)
//   #pieces      → first ProductHero           (CinematicProductScroll)
//   #about       → "Why choose us" story panels (WhyChooseUs / StoryScroll)
//   #collections → "Featured Collections"      (Carousel)
// Listed in the order they should read in the pill, not document order — the
// scroll spy below doesn't depend on the array being sorted.
const navItems: NavItem[] = [
    { name: "Home", sectionId: "home", icon: Home },
    { name: "Pieces", sectionId: "pieces", icon: Sofa },
    { name: "About", sectionId: "about", icon: Info },
    { name: "Collections", sectionId: "collections", icon: Sparkles },
]

// The pill floats over the page, so a section scrolled flush to y=0 would sit
// underneath it. Roughly its height plus the top gap.
const SCROLL_OFFSET = -104

// A section becomes "current" once its top passes this fraction of the viewport
// height. A third of the way down tracks what you're actually looking at better
// than the very top edge does, especially for the tall pinned sections.
const SPY_PROBE_RATIO = 0.35

// How long to trust a click over the scroll position. Without this the active
// pill walks through every section the page travels past on its way to the
// target, which looks like the navbar changing its mind.
const CLICK_PRIORITY_MS = 1600

// Everything below the pinned video reveal in ZoomInScroll can move while a
// scroll is in flight — the page's images finish loading, ScrollTrigger
// re-measures — so the destination computed at click time can end up stale.
// These control the correction passes that close the remaining gap.
const MAX_SETTLE_PASSES = 3
const SETTLE_TOLERANCE_PX = 8

export function AnimeNavBar({ className, defaultActive = "Home" }: NavBarProps) {
    const [hoveredTab, setHoveredTab] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>(defaultActive)
    const lenisRef = useLenis()
    // Set while a click-driven scroll is in flight, to keep the scroll spy from
    // overriding the pill the user just picked. Released three ways — Lenis's
    // `onComplete`, real wheel/touch input, and a timeout — because Lenis
    // silently abandons its animation when the user takes over, so `onComplete`
    // alone would leave this stuck on.
    const isNavigating = useRef(false)
    const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const scrollToTarget = (target: HTMLElement, offset: number, pass = 0) => {
        const lenis = lenisRef?.current
        if (!lenis) {
            // Only reachable in the sliver before SmoothScrollProvider's effect
            // runs. Once Lenis exists it owns the scroll position and this would
            // fight it.
            window.scrollTo({ top: target.offsetTop + offset, behavior: "smooth" })
            return
        }

        isNavigating.current = true
        if (releaseTimer.current) clearTimeout(releaseTimer.current)
        releaseTimer.current = setTimeout(() => {
            isNavigating.current = false
        }, CLICK_PRIORITY_MS)

        // Lenis clamps its destination to a scroll limit derived from cached
        // dimensions, and ScrollTrigger's pin spacers in ZoomInScroll make the
        // document much taller than that cache knows about — without this,
        // scrolling to #collections stopped ~3700px short at the stale limit.
        lenis.resize()

        lenis.scrollTo(target, {
            // Corrections are short hops, not a second journey.
            duration: pass === 0 ? 1.4 : 0.6,
            offset,
            onComplete: () => {
                // Cleared by wheel/touch — the user has taken over, so don't
                // yank the page back.
                if (!isNavigating.current) return

                // Aiming for `rect.top === -offset`, so this is how far short
                // (or past) the landing was.
                const drift = target.getBoundingClientRect().top + offset
                if (pass < MAX_SETTLE_PASSES && Math.abs(drift) > SETTLE_TOLERANCE_PX) {
                    scrollToTarget(target, offset, pass + 1)
                    return
                }

                isNavigating.current = false
            },
        })
    }

    const handleNavClick = (item: NavItem) => {
        const target = document.getElementById(item.sectionId)
        if (!target) return

        setActiveTab(item.name)

        // The hero already starts at the top of the document, so backing off by
        // the navbar's height would just leave dead space above it.
        scrollToTarget(target, item.sectionId === "home" ? 0 : SCROLL_OFFSET)
    }

    useEffect(() => {
        // Real wheel or touch input means the user has taken the scroll back off
        // the click, so the spy should resume immediately. Lenis's own
        // programmatic scrolling doesn't dispatch either of these.
        const releaseSpy = () => {
            isNavigating.current = false
        }

        const updateActiveSection = () => {
            if (isNavigating.current) return

            const probe = window.innerHeight * SPY_PROBE_RATIO

            // Of the sections whose top has already crossed the probe line, the
            // current one is whichever is closest to it. Comparing positions
            // instead of walking the list in order means `navItems` is free to
            // be ordered for the reader — #about sits before #collections in the
            // document but reads better after it in the pill.
            let current = navItems[0].name
            let closestTop = -Infinity

            for (const item of navItems) {
                const el = document.getElementById(item.sectionId)
                if (!el) continue

                const { top } = el.getBoundingClientRect()
                if (top <= probe && top > closestTop) {
                    closestTop = top
                    current = item.name
                }
            }

            setActiveTab((prev) => (prev === current ? prev : current))
        }

        updateActiveSection()

        // Lenis drives the window's native scroll position, so ordinary scroll
        // events still fire and there's no need to subscribe to Lenis directly.
        window.addEventListener("scroll", updateActiveSection, { passive: true })
        window.addEventListener("resize", updateActiveSection)
        window.addEventListener("wheel", releaseSpy, { passive: true })
        window.addEventListener("touchstart", releaseSpy, { passive: true })

        return () => {
            if (releaseTimer.current) clearTimeout(releaseTimer.current)
            window.removeEventListener("scroll", updateActiveSection)
            window.removeEventListener("resize", updateActiveSection)
            window.removeEventListener("wheel", releaseSpy)
            window.removeEventListener("touchstart", releaseSpy)
        }
    }, [])

    return (
        <div className="fixed top-5 left-0 right-0 z-9999">
            <div className="flex justify-center pt-6">
                <motion.nav
                    aria-label="Section navigation"
                    className={cn(
                        "flex items-center gap-3 bg-white/70 border border-black/10 backdrop-blur-xl py-2 px-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative",
                        className
                    )}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                    }}
                >
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.name
                        const isHovered = hoveredTab === item.name

                        return (
                            <a
                                key={item.name}
                                href={`#${item.sectionId}`}
                                aria-current={isActive ? "true" : undefined}
                                // Labelled explicitly because the text span is
                                // hidden below md: on mobile the icon is all
                                // that renders.
                                aria-label={item.name}
                                onClick={(e) => {
                                    // Left the href in place so the link is real
                                    // for keyboard and middle-click, but the
                                    // native hash jump has to be suppressed —
                                    // it moves the scroll position out from
                                    // under Lenis.
                                    e.preventDefault()
                                    handleNavClick(item)
                                }}
                                onMouseEnter={() => setHoveredTab(item.name)}
                                onMouseLeave={() => setHoveredTab(null)}
                                className={cn(
                                    "relative cursor-pointer text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300",
                                    "text-black/60 hover:text-black",
                                    isActive && "text-black"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            opacity: [0.3, 0.5, 0.3],
                                            scale: [1, 1.03, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-primary/25 rounded-full blur-md" />
                                        <div className="absolute -inset-1 bg-primary/20 rounded-full blur-xl" />
                                        <div className="absolute -inset-2 bg-primary/15 rounded-full blur-2xl" />
                                        <div className="absolute -inset-3 bg-primary/5 rounded-full blur-3xl" />

                                        <div
                                            className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/20 to-primary/0"
                                            style={{
                                                animation: "shine 3s ease-in-out infinite"
                                            }}
                                        />
                                    </motion.div>
                                )}

                                <motion.span
                                    className="hidden md:inline relative z-10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item.name}
                                </motion.span>
                                <motion.span
                                    className="md:hidden relative z-10"
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Icon size={18} strokeWidth={2.5} />
                                </motion.span>

                                <AnimatePresence>
                                    {isHovered && !isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="absolute inset-0 bg-white/10 rounded-full -z-10"
                                        />
                                    )}
                                </AnimatePresence>

                                {isActive && (
                                    <motion.div
                                        layoutId="anime-mascot"
                                        className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    >
                                        <div className="relative w-12 h-12">
                                            <motion.div
                                                className="absolute w-10 h-10 bg-black rounded-full left-1/2 -translate-x-1/2"
                                                animate={
                                                    hoveredTab ? {
                                                        scale: [1, 1.1, 1],
                                                        rotate: [0, -5, 5, 0],
                                                        transition: {
                                                            duration: 0.5,
                                                            ease: "easeInOut"
                                                        }
                                                    } : {
                                                        y: [0, -3, 0],
                                                        transition: {
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }
                                                    }
                                                }
                                            >
                                                <motion.div
                                                    className="absolute w-2 h-2 bg-white rounded-full"
                                                    animate={
                                                        hoveredTab ? {
                                                            scaleY: [1, 0.2, 1],
                                                            transition: {
                                                                duration: 0.2,
                                                                times: [0, 0.5, 1]
                                                            }
                                                        } : {}
                                                    }
                                                    style={{ left: '25%', top: '40%' }}
                                                />
                                                <motion.div
                                                    className="absolute w-2 h-2 bg-white rounded-full"
                                                    animate={
                                                        hoveredTab ? {
                                                            scaleY: [1, 0.2, 1],
                                                            transition: {
                                                                duration: 0.2,
                                                                times: [0, 0.5, 1]
                                                            }
                                                        } : {}
                                                    }
                                                    style={{ right: '25%', top: '40%' }}
                                                />
                                                <motion.div
                                                    className="absolute w-2 h-1.5 bg-pink-300 rounded-full"
                                                    animate={{
                                                        opacity: hoveredTab ? 0.8 : 0.6
                                                    }}
                                                    style={{ left: '15%', top: '55%' }}
                                                />
                                                <motion.div
                                                    className="absolute w-2 h-1.5 bg-pink-300 rounded-full"
                                                    animate={{
                                                        opacity: hoveredTab ? 0.8 : 0.6
                                                    }}
                                                    style={{ right: '15%', top: '55%' }}
                                                />

                                                <motion.div
                                                    className="absolute w-4 h-2 border-b-2 border-white rounded-full"
                                                    animate={
                                                        hoveredTab ? {
                                                            scaleY: 1.5,
                                                            y: -1
                                                        } : {
                                                            scaleY: 1,
                                                            y: 0
                                                        }
                                                    }
                                                    style={{ left: '30%', top: '60%' }}
                                                />
                                                <AnimatePresence>
                                                    {hoveredTab && (
                                                        <>
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0 }}
                                                                className="absolute -top-1 -right-1 w-2 h-2 text-yellow-300"
                                                            >
                                                                ✨
                                                            </motion.div>
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0 }}
                                                                transition={{ delay: 0.1 }}
                                                                className="absolute -top-2 left-0 w-2 h-2 text-yellow-300"
                                                            >
                                                                ✨
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                            <motion.div
                                                className="absolute -bottom-1 left-1/2 w-4 h-4 -translate-x-1/2"
                                                animate={
                                                    hoveredTab ? {
                                                        y: [0, -4, 0],
                                                        transition: {
                                                            duration: 0.3,
                                                            repeat: Infinity,
                                                            repeatType: "reverse"
                                                        }
                                                    } : {
                                                        y: [0, 2, 0],
                                                        transition: {
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: 0.5
                                                        }
                                                    }
                                                }
                                            >
                                                <div className="w-full h-full bg-[#8a6f59]/80 rotate-45 transform origin-center" />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </a>
                        )
                    })}
                </motion.nav>
            </div>
        </div>
    )
}