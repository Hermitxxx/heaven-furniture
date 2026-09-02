'use client';

import * as React from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, MotionConfig, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaBed, FaChair } from 'react-icons/fa';
import { MdOutlineTableRestaurant, MdLightbulb } from 'react-icons/md';
import { BsCheckLg } from 'react-icons/bs';
import { PiFunnelSimpleBold } from 'react-icons/pi';
import type { IconType } from 'react-icons';
import { cn } from '@/lib/utils';
import { BiCategoryAlt } from 'react-icons/bi';
import { useLenis } from './SmoothScrollProvider';
import PaginationWithIconAndLabel from './Pagination';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// --- Types ---

export interface Offer {
    id: string | number;
    category: string;
    imageSrc: string;
    imageAlt?: string;
    tag: string;
    title: string;
    description: string;
    brandLogoSrc: string;
    brandName: string;
    promoCode?: string;
    href?: string;
    meta?: { label: string; value: string }[];
    content?: React.ReactNode;
}

export interface FilterItem {
    id: string;
    label: string;
    icon: IconType;
}

// --- Filter Categories & Mock Data ---

export const FILTER_ITEMS: FilterItem[] = [
    { id: 'all', label: 'All Items', icon: BiCategoryAlt },
    { id: 'seating', label: 'Seating', icon: FaChair },
    { id: 'tables', label: 'Tables', icon: MdOutlineTableRestaurant },
    { id: 'beds', label: 'Beds', icon: FaBed },
    { id: 'lighting', label: 'Lighting', icon: MdLightbulb },
];

// The workshop's own pieces lead the array, because the grid renders in array
// order and these are photographs of real work rather than the stock frames
// that follow them.
//
// Remote images are requested at 900px wide, not the 1200 the samples used: the
// widest a card ever renders is ~380px in the three-column grid and ~450px in
// the detail dialog. The local files are 2048px square as shot, and next/image
// resizes them off the `sizes` the card declares.
export const defaultOffers: Offer[] = [
    {
        id: "emerald-velvet-platform-bed",
        category: "beds",
        imageSrc: "/products/hv-7.jpeg",
        imageAlt: "Emerald Velvet Platform Bed",
        title: "Emerald Velvet Platform Bed",
        tag: "Bedroom · Beds",
        description: "A channel-tufted headboard in emerald cotton velvet, capped and framed in polished walnut, over a low platform base. The footboard carries the same velvet in a diamond quilt.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Cotton velvet, solid walnut" },
            { label: "Dimensions", value: "King · 193 × 213 cm" },
            { label: "Price", value: "৳1,45,000" },
            { label: "Lead time", value: "6–8 weeks" },
        ],
    },
    {
        id: "royal-blue-carved-sofa-set",
        category: "seating",
        imageSrc: "/products/hv-5.jpeg",
        imageAlt: "Royal Blue Carved Sofa Set",
        title: "Royal Blue Carved Sofa Set",
        tag: "Living Room · Seating",
        description: "Deep-buttoned royal blue velvet on hand-carved mahogany finished in champagne silver leaf. Seat cushions are cut from a woven damask, and the set comes with its matching centre table.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Cotton velvet, carved mahogany" },
            { label: "Dimensions", value: "3+2 seater · 210 & 155 cm" },
            { label: "Price", value: "৳3,20,000" },
            { label: "Lead time", value: "10–12 weeks" },
        ],
    },
    {
        id: "ivory-carved-dining-set",
        category: "tables",
        imageSrc: "/products/hv-3.jpeg",
        imageAlt: "Ivory Carved Dining Set",
        title: "Ivory Carved Dining Set",
        tag: "Dining · Tables",
        description: "An eight-seat set in ivory lacquer with the crest rails and apron carving picked out in gold. The top is a honed cream marble slab, and the chairs are covered in a floral jacquard.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Cream marble, lacquered mahogany" },
            { label: "Dimensions", value: "8-seater · 240 × 110 × 76 cm" },
            { label: "Price", value: "৳2,85,000" },
            { label: "Lead time", value: "8–10 weeks" },
        ],
    },
    {
        id: "marble-teak-dining-table",
        category: "tables",
        imageSrc: "/products/hv-8.jpeg",
        imageAlt: "Marble & Teak Dining Table",
        title: "Marble & Teak Dining Table",
        tag: "Dining · Tables",
        description: "A single cream marble slab with a shaped edge, carried on hand-carved teak cabriole legs. The eight high-back chairs are wrapped in oxblood top-grain leather with brass nailhead trim.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Marble, solid teak, top-grain leather" },
            { label: "Dimensions", value: "8-seater · 230 × 110 × 76 cm" },
            { label: "Price", value: "৳2,40,000" },
            { label: "Lead time", value: "7–9 weeks" },
        ],
    },
    {
        id: "champagne-gilt-sofa-set",
        category: "seating",
        imageSrc: "/products/hv-4.jpeg",
        imageAlt: "Champagne Gilt Sofa Set",
        title: "Champagne Gilt Sofa Set",
        tag: "Living Room · Seating",
        description: "A diamond-quilted jacquard in warm sand over a carved hardwood frame gilded in champagne leaf, with a buttoned back. Three-seater, two armchairs and the glass-topped centre table.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Quilted jacquard, gilded hardwood" },
            { label: "Dimensions", value: "3+1+1 · 200, 90, 90 cm" },
            { label: "Price", value: "৳2,65,000" },
            { label: "Lead time", value: "9–11 weeks" },
        ],
    },
    {
        id: "embroidered-gilt-daybed",
        category: "seating",
        imageSrc: "/products/hv-6.jpeg",
        imageAlt: "Embroidered Gilt Daybed",
        title: "Embroidered Gilt Daybed",
        tag: "Living Room · Seating",
        description: "A three-seat daybed in mushroom velvet inside a gold-leaf carved frame. The back panel and the bolsters are embroidered by hand, one spray of flowers at a time.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Velvet, gold-leaf carved mahogany" },
            { label: "Dimensions", value: "195 × 85 × 95 cm" },
            { label: "Price", value: "৳1,10,000" },
            { label: "Lead time", value: "6–8 weeks" },
        ],
    },
    {
        id: "turned-post-accent-chairs",
        category: "seating",
        imageSrc: "/products/hv-2.jpg",
        imageAlt: "Turned Post Accent Chairs",
        title: "Turned Post Accent Chairs",
        tag: "Living Room · Seating",
        description: "A barrel-backed pair in a sand wool blend, with turned rosewood posts running through the arms and down into the legs. Sold as two, with the scatter cushions.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Wool blend, turned rosewood" },
            { label: "Dimensions", value: "Each · 70 × 72 × 82 cm" },
            { label: "Price", value: "৳46,000 (pair)" },
            { label: "Lead time", value: "4–5 weeks" },
        ],
    },
    {
        id: "woven-hanging-egg-chair",
        category: "seating",
        imageSrc: "/products/hv-1.jpg",
        imageAlt: "Woven Hanging Egg Chair",
        title: "Woven Hanging Egg Chair",
        tag: "Balcony · Seating",
        description: "A hand-woven rattan cocoon hung from a powder-coated steel stand, so it needs no ceiling fixing. Comes with the full cream cushion set.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Woven rattan, powder-coated steel" },
            { label: "Dimensions", value: "105 × 105 × 195 cm" },
            { label: "Price", value: "৳32,000" },
            { label: "Lead time", value: "3–4 weeks" },
        ],
    },
    // The three the page opens with. ProductHero shows them full-bleed at the
    // top, and they're repeated here because this grid is the whole floor, not
    // the leftovers — but the title, price and description are copied from
    // MOCK_PRODUCTS in CinematicProductScroll, so if one moves the other has to.
    {
        id: "classic-wooden-bed-frame",
        category: "beds",
        imageSrc: "/products/bed.jpeg",
        imageAlt: "Classic Wooden Bed Frame",
        title: "Classic Wooden Bed Frame",
        tag: "Bedroom · Beds",
        description: "A solid wooden bed frame with a panel headboard and white finish, crafted for timeless bedroom comfort. Built in double, queen and king.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Solid hardwood, white lacquer" },
            { label: "Dimensions", value: "Queen · 170 × 210 cm" },
            { label: "Price", value: "৳48,000" },
            { label: "Lead time", value: "5–7 weeks" },
        ],
    },
    {
        id: "modern-tufted-sofa",
        category: "seating",
        imageSrc: "/products/sofa.jpeg",
        imageAlt: "Modern Tufted Sofa",
        title: "Modern Tufted Sofa",
        tag: "Living Room · Seating",
        description: "A plush mid-century inspired sofa featuring deep channel tufting, rounded armrests, and dark wood legs. Two-seater as shown, or three.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Channel-tufted velvet, walnut base" },
            { label: "Dimensions", value: "2-seater · 175 × 90 × 80 cm" },
            { label: "Price", value: "৳72,000" },
            { label: "Lead time", value: "6–8 weeks" },
        ],
    },
    {
        id: "minimalist-vanity-dresser",
        category: "tables",
        imageSrc: "/products/vanity.jpeg",
        imageAlt: "Minimalist Vanity Dresser",
        title: "Minimalist Vanity Dresser",
        tag: "Bedroom · Tables",
        description: "A contemporary bedroom vanity featuring a rounded illuminated mirror and two spacious drawer tiers, with soft-close runners throughout.",
        brandLogoSrc: "/heritage.jpeg",
        brandName: "Heaven Furniture",
        href: "#",
        meta: [
            { label: "Material", value: "Oak veneer, LED-lit mirror" },
            { label: "Dimensions", value: "110 × 45 × 145 cm" },
            { label: "Price", value: "৳35,000" },
            { label: "Lead time", value: "4–6 weeks" },
        ],
    },
    {
        id: "nordic-oak-armchair",
        category: "seating",
        imageSrc: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Nordic Oak Armchair",
        title: "Nordic Oak Armchair",
        tag: "Living Room · Seating",
        description: "A low, wide-armed lounge chair built around a solid oak frame. The seat is shaped for an all-day recline, and the cushions are wrapped in a woven wool blend.",
        brandLogoSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
        brandName: "Nordic Craft Studio",
        promoCode: "SPRING10",
        href: "#",
        meta: [
            { label: "Material", value: "Solid oak, wool blend" },
            { label: "Dimensions", value: "76 × 82 × 74 cm" },
            { label: "Price", value: "৳52,000" },
            { label: "Lead time", value: "4–6 weeks" },
        ],
    },
    {
        id: "velvet-boucle-sofa",
        category: "seating",
        imageSrc: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Velvet Bouclé Sofa",
        title: "Velvet Bouclé Sofa",
        tag: "Living Room · Seating",
        description: "A three-seat sofa upholstered entirely in bouclé, over a kiln-dried hardwood frame with pocket-sprung cushions.",
        brandLogoSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
        brandName: "Atelier Maison",
        promoCode: "BOUCLE20",
        href: "#",
        meta: [
            { label: "Material", value: "Bouclé, hardwood frame" },
            { label: "Dimensions", value: "210 × 95 × 78 cm" },
            { label: "Price", value: "৳98,000" },
            { label: "Lead time", value: "8–10 weeks" },
        ],
    },
    {
        id: "handwoven-rattan-chair",
        category: "seating",
        imageSrc: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Handwoven Rattan Chair",
        title: "Handwoven Rattan Chair",
        tag: "Dining · Seating",
        description: "Each chair is hand-woven around a steam-bent beechwood frame by a single craftsperson, ensuring unique natural patterns.",
        brandLogoSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
        brandName: "Artisan Weave Co.",
        promoCode: "RATTAN15",
        href: "#",
        meta: [
            { label: "Material", value: "Rattan, beechwood" },
            { label: "Dimensions", value: "52 × 58 × 80 cm" },
            { label: "Price", value: "৳14,500" },
            { label: "Lead time", value: "2–3 weeks" },
        ],
    },
    {
        id: "walnut-coffee-table",
        category: "tables",
        imageSrc: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Walnut Coffee Table",
        title: "Walnut Coffee Table",
        tag: "Living Room · Tables",
        description: "A live-edge walnut top set on a blackened steel base. Kiln-dried and finished with hardwax oil for lasting durability.",
        brandLogoSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
        brandName: "Timber & Forge",
        promoCode: "WALNUT5",
        href: "#",
        meta: [
            { label: "Material", value: "Walnut, blackened steel" },
            { label: "Dimensions", value: "120 × 60 × 40 cm" },
            { label: "Price", value: "৳38,000" },
            { label: "Lead time", value: "5–7 weeks" },
        ],
    },
    {
        id: "linen-upholstered-bed",
        category: "beds",
        imageSrc: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Linen Upholstered Bed",
        title: "Linen Upholstered Bed",
        tag: "Bedroom · Beds",
        description: "A platform bed with a tall, gently curved headboard upholstered in pre-washed linen with built-in wooden slats.",
        brandLogoSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
        brandName: "Slumber & Co.",
        promoCode: "SLEEP10",
        href: "#",
        meta: [
            { label: "Material", value: "Linen, solid pine slats" },
            { label: "Dimensions", value: "Queen · 170 × 210 cm" },
            { label: "Price", value: "৳62,000" },
            { label: "Lead time", value: "6–8 weeks" },
        ],
    },
    {
        id: "ceramic-table-lamp",
        category: "lighting",
        imageSrc: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Ceramic Table Lamp",
        title: "Ceramic Table Lamp",
        tag: "Lighting · Accents",
        description: "A hand-thrown stoneware base under a linen drum shade. Each base is fired individually with distinct glaze pools.",
        brandLogoSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
        brandName: "Lumina Ceramics",
        promoCode: "GLOW15",
        href: "#",
        meta: [
            { label: "Material", value: "Stoneware, linen shade" },
            { label: "Dimensions", value: "28 × 28 × 48 cm" },
            { label: "Price", value: "৳8,900" },
            { label: "Lead time", value: "1–2 weeks" },
        ],
    },
    {
        id: "marble-dining-table",
        category: "tables",
        imageSrc: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Carrara Marble Dining Table",
        title: "Carrara Marble Dining Table",
        tag: "Dining · Tables",
        description: "Solid Italian Carrara marble slab with a honed finish, resting on brushed brass pedestal bases.",
        brandLogoSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
        brandName: "Atelier Maison",
        promoCode: "MARBLE10",
        href: "#",
        meta: [
            { label: "Material", value: "Carrara Marble, Brass" },
            { label: "Dimensions", value: "220 × 100 × 75 cm" },
            { label: "Price", value: "৳96,000" },
            { label: "Lead time", value: "6–8 weeks" },
        ],
    },
    {
        id: "minimalist-oak-desk",
        category: "tables",
        imageSrc: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Minimalist Writing Desk",
        title: "Minimalist Writing Desk",
        tag: "Office · Tables",
        description: "Clean silhouette featuring soft integrated drawers and cable channels crafted entirely from solid white oak.",
        brandLogoSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
        brandName: "Timber & Forge",
        promoCode: "DESK10",
        href: "#",
        meta: [
            { label: "Material", value: "White Oak" },
            { label: "Dimensions", value: "140 × 65 × 74 cm" },
            { label: "Price", value: "৳46,000" },
            { label: "Lead time", value: "4–5 weeks" },
        ],
    },
    {
        id: "leather-ottoman-bench",
        category: "seating",
        imageSrc: "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Aniline Leather Ottoman",
        title: "Aniline Leather Ottoman",
        tag: "Bedroom · Seating",
        description: "Hand-finished full-grain leather bench with subtle button tufting on a low-profile wooden plinth.",
        brandLogoSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
        brandName: "Slumber & Co.",
        promoCode: "LEATHER15",
        href: "#",
        meta: [
            { label: "Material", value: "Aniline Leather, Pine" },
            { label: "Dimensions", value: "130 × 45 × 42 cm" },
            { label: "Price", value: "৳26,500" },
            { label: "Lead time", value: "2–4 weeks" },
        ],
    },
    {
        id: "minimalist-floor-lamp",
        category: "lighting",
        imageSrc: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Sculptural Floor Lamp",
        title: "Sculptural Floor Lamp",
        tag: "Lighting · Accents",
        description: "Slender brass arch featuring a blown opal glass globe providing warm, ambient room illumination.",
        brandLogoSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
        brandName: "Lumina Ceramics",
        promoCode: "LIGHT20",
        href: "#",
        meta: [
            { label: "Material", value: "Opal Glass, Brass" },
            { label: "Dimensions", value: "35 × 40 × 160 cm" },
            { label: "Price", value: "৳18,000" },
            { label: "Lead time", value: "1–2 weeks" },
        ],
    },
    {
        id: "sculptural-side-table",
        category: "tables",
        imageSrc: "https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&q=80&w=900",
        imageAlt: "Travertine Side Table",
        title: "Travertine Side Table",
        tag: "Living Room · Tables",
        description: "Geometric pedestal accent piece hand-carved out of a solid block of natural unpolished travertine.",
        brandLogoSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
        brandName: "Artisan Weave Co.",
        promoCode: "STONE10",
        href: "#",
        meta: [
            { label: "Material", value: "Natural Travertine" },
            { label: "Dimensions", value: "40 × 40 × 50 cm" },
            { label: "Price", value: "৳21,500" },
            { label: "Lead time", value: "2–3 weeks" },
        ],
    },
];

// --- FilterDisclosure Component ---

const SPRING = {
    type: 'spring',
    stiffness: 240,
    damping: 20,
    mass: 1,
} as const;

export const FilterDisclosure: React.FC<{
    items?: FilterItem[];
    defaultActiveId?: string;
    onChange?: (id: string) => void;
}> = ({ items = FILTER_ITEMS, defaultActiveId = 'all', onChange }) => {
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(defaultActiveId);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const hasOpened = React.useRef(false);

    const activeItem = items.find((i) => i.id === active);
    const ActiveIcon = activeItem ? activeItem.icon : BiCategoryAlt;

    const handleSelect = (id: string) => {
        setActive(id);
        onChange?.(id);
        setTimeout(() => setOpen(false), 220);
    };

    // A panel that only closes by picking something was survivable above a
    // one-row carousel. Above a grid that runs several screens deep it isn't:
    // you can scroll the whole collection with it still floating over the cards.
    React.useEffect(() => {
        if (!open) return;

        const handlePointerDown = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    // The trigger and the panel swap places rather than coexisting, so opening
    // unmounts the element that had focus and drops it on <body> — the next Tab
    // would restart at the top of the page. Hand focus across the swap in both
    // directions. `hasOpened` keeps the close branch from stealing focus on the
    // first render, when the panel has simply never been open.
    React.useEffect(() => {
        if (open) {
            hasOpened.current = true;
            panelRef.current?.querySelector('button')?.focus();
        } else if (hasOpened.current) {
            triggerRef.current?.focus();
        }
    }, [open]);

    return (
        <div ref={rootRef} className="relative flex h-[60px] w-[260px] items-center justify-end">
            <MotionConfig transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {open ? (
                        <motion.div
                            key="open"
                            ref={panelRef}
                            layoutId="filter-disclosure"
                            aria-label="Filter by category"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0 } }}
                            style={{ transformOrigin: '100% 0%', borderRadius: 24 }}
                            className="absolute right-0 top-0 z-30 flex w-[260px] flex-col gap-[4px] overflow-hidden border border-zinc-200 bg-white p-[8px] shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            {items.map((item, index) => {
                                const Icon = item.icon;
                                const selected = active === item.id;

                                return (
                                    <motion.button
                                        key={item.id}
                                        type="button"
                                        // aria-pressed rather than role="menuitemradio":
                                        // a menu role promises arrow-key navigation that
                                        // isn't implemented here, and claiming it would
                                        // put a screen reader into a mode where Tab —
                                        // the thing that does work — stops being offered.
                                        aria-pressed={selected}
                                        initial={{ opacity: 0, scale: 1.1, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        onClick={() => handleSelect(item.id)}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ ...SPRING, delay: index * 0.04 }}
                                        className="flex w-full cursor-pointer items-center justify-between rounded-[14px] px-[12px] py-[8px] transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#8a6f59] dark:hover:bg-neutral-800/60"
                                    >
                                        <div className="flex items-center gap-[16px]">
                                            <Icon className="h-[20px] w-[20px] text-[#8a6f59] dark:text-neutral-400" />
                                            <span className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-neutral-100">
                                                {item.label}
                                            </span>
                                        </div>

                                        <motion.div
                                            animate={{
                                                backgroundColor: selected ? '#8a6f59' : 'rgba(0,0,0,0)',
                                            }}
                                            className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[2px] ${selected ? 'border-[#8a6f59]' : 'border-zinc-300 dark:border-neutral-700'
                                                }`}
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: selected ? 1 : 0,
                                                    opacity: selected ? 1 : 0,
                                                }}
                                                transition={{ type: 'spring', stiffness: 520, damping: 30 }}
                                            >
                                                <BsCheckLg className="h-[12px] w-[12px] text-white" />
                                            </motion.div>
                                        </motion.div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div key="close" className="flex items-center gap-2">
                            <motion.button
                                ref={triggerRef}
                                type="button"
                                layoutId="filter-disclosure"
                                aria-expanded={open}
                                aria-label={`Filter by category — showing ${activeItem?.label ?? 'all items'}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0 } }}
                                onClick={() => setOpen(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ borderRadius: 28 }}
                                className="z-20 flex h-[52px] w-[52px] cursor-pointer items-center justify-center border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a6f59] dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <PiFunnelSimpleBold className="h-[24px] w-[24px] text-zinc-900 dark:text-neutral-100" />
                            </motion.button>

                            {/* Purely a restatement of what the trigger's label
                                already says, so it stays out of the a11y tree. */}
                            <motion.div
                                aria-hidden="true"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
                                className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.div
                                        key={active}
                                        initial={{ opacity: 0, scale: 0.6 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.6 }}
                                    >
                                        <ActiveIcon className="h-[20px] w-[20px] text-[#8a6f59]" />
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </MotionConfig>
        </div>
    );
};

// --- ProductCard Component ---

// `visible` is a function variant so every card can be handed its own delay.
// The grid lets each card reveal on its own viewport entry instead of
// orchestrating them from the container: a single `staggerChildren` up there
// starts the whole set at once, which across four rows means rows three and
// four finish animating while they are still below the fold.
const cardVariants: Variants = {
    hidden: { opacity: 0, y: 56, scale: 0.94 },
    visible: (delay: number = 0) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
    }),
};

// Reduced motion keeps the arrival — a card appearing is information — and drops
// the travel and the hover lift. Same bargain Reveal makes.
const REDUCED_CARD_VARIANTS: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

// createPortal needs a real document.body, which the server render doesn't have,
// so the dialog can only be mounted once hydration has happened. This is that
// check without a setState inside an effect: getServerSnapshot answers false
// while rendering on the server, getSnapshot answers true once React is running
// in the browser, and nothing ever subscribes because the answer never changes
// again. (The `mounted` flag it replaces was the one ESLint error in this file.)
const NEVER_CHANGES = () => () => { };

function useHasHydrated() {
    return React.useSyncExternalStore(
        NEVER_CHANGES,
        () => true,
        () => false
    );
}

// A bare <img> was fine while every card pulled a pre-sized 900px URL off
// Unsplash. The workshop's own photographs are 2048px squares straight out of
// the camera, and a card is ~380px wide — six of those unresized is most of a
// phone's data allowance for one section, so the resizing goes through
// next/image instead.
//
// motion.create rather than plain <Image>, because the grid card and the open
// dialog share a `layoutId`: projection needs a forwarded ref and a merged
// style, and next/image passes both down to the <img> it renders.
const MotionImage = motion.create(Image);

export function ProductCard({
    imageSrc = "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000",
    title = "Untitled Item",
    subtitle = "Category",
    content,
    revealDelay = 0,
}: {
    imageSrc?: string;
    title?: string;
    subtitle?: string;
    content?: React.ReactNode;
    /** Seconds to hold the entrance back by, so a grid row doesn't land flat. */
    revealDelay?: number;
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const mounted = useHasHydrated();
    const shouldReduceMotion = useReducedMotion();
    const lenisRef = useLenis();
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const closeRef = React.useRef<HTMLButtonElement>(null);

    const layoutId = React.useId() + `-${title.replace(/\s+/g, "-").toLowerCase()}`;
    const titleId = `${layoutId}-title`;

    // What the open dialog needs to be usable without a mouse: Escape closes it,
    // focus starts on the close button and returns to the card that opened it
    // (otherwise it lands on <body> and the next Tab restarts at the top of the
    // page), and Lenis stops so the wheel doesn't scroll the grid behind the
    // backdrop. Opening a card and finding the page had moved underneath was
    // easy to miss with one row of cards and unmissable with twelve.
    React.useEffect(() => {
        if (!isOpen) return;

        const lenis = lenisRef?.current;
        // Captured now rather than read in the cleanup: it's the same DOM node
        // either way, and reading a ref during cleanup is what the exhaustive-deps
        // rule warns about.
        const trigger = triggerRef.current;

        lenis?.stop();
        closeRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            lenis?.start();
            trigger?.focus();
        };
    }, [isOpen, lenisRef]);

    return (
        <>
            <motion.li
                variants={shouldReduceMotion ? REDUCED_CARD_VARIANTS : cardVariants}
                custom={revealDelay}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                layoutId={layoutId}
                // A ratio rather than the old fixed 340×440: in a grid the width
                // comes from the column, and the ratio is what keeps every row
                // the same height without measuring anything. It also reserves
                // each image's box up front, so lazy loading can't reflow the grid.
                className="group relative aspect-[4/5] w-full list-none overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm"
                whileHover={shouldReduceMotion ? undefined : { y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* alt is empty on purpose: the title sits in the card as real
                    text and the button below carries it as a label, so describing
                    the photo again would just read the piece's name three times.
                    `fill` positions the image itself, and the aspect box on the
                    <li> is what reserves its space before it arrives. */}
                <MotionImage
                    layoutId={`image-${layoutId}`}
                    src={imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                    className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-zinc-950/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

                <div
                    aria-hidden="true"
                    className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-zinc-950/50 px-3 py-1.5 text-[11px] font-medium text-white opacity-0 backdrop-blur-md transition-all duration-300 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 shadow-md"
                >
                    <Eye className="h-3.5 w-3.5 text-[#D7C3B1]" />
                    <span>View details</span>
                </div>

                <div className="absolute bottom-0 left-0 w-full translate-y-2 p-6 transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0">
                    {subtitle && (
                        <motion.p
                            layoutId={`subtitle-${layoutId}`}
                            className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#D7C3B1] drop-shadow-md"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                    <motion.h3
                        layoutId={`title-${layoutId}`}
                        className="text-xl font-black tracking-tight text-white drop-shadow-lg sm:text-2xl"
                    >
                        {title}
                    </motion.h3>
                </div>

                {/* The whole tile is still the target, but as a real button rather
                    than a click handler on the div — that's what makes it reachable
                    by Tab and operable with Enter and Space. It's stretched over
                    the art instead of wrapping it because a <button> may not
                    contain a heading.

                    The focus ring is two strokes, cream over near-black, because
                    it is drawn on top of a photograph: a single mid-tone ring in
                    the site's clay disappears against a light sofa and a dark
                    walnut alike, and 2.4.11 wants 3:1 against whatever it lands on. */}
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label={`${title} — view details`}
                    className="absolute inset-0 z-20 cursor-pointer rounded-2xl focus-visible:shadow-[inset_0_0_0_4px_#f7f5f1] focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-zinc-950"
                />
            </motion.li>

            {mounted &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsOpen(false)}
                                    aria-hidden="true"
                                    className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
                                />
                                <motion.div
                                    layoutId={layoutId}
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby={titleId}
                                    className="relative z-10 flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl md:flex-row"
                                >
                                    <button
                                        ref={closeRef}
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        aria-label="Close details"
                                        className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white/50 text-zinc-950 backdrop-blur-sm transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a6f59]"
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                        </svg>
                                    </button>

                                    <div className="relative h-64 w-full shrink-0 overflow-hidden md:h-full md:w-1/2">
                                        <MotionImage
                                            layoutId={`image-${layoutId}`}
                                            src={imageSrc}
                                            alt=""
                                            fill
                                            sizes="(max-width: 768px) 100vw, 450px"
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent md:hidden" />
                                    </div>

                                    <div className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto p-6 sm:p-8 md:w-1/2">
                                        {subtitle && (
                                            <motion.p
                                                layoutId={`subtitle-${layoutId}`}
                                                className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#8a6f59]"
                                            >
                                                {subtitle}
                                            </motion.p>
                                        )}
                                        <motion.h3
                                            id={titleId}
                                            layoutId={`title-${layoutId}`}
                                            className="mb-6 border-b border-zinc-200 pb-4 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl"
                                        >
                                            {title}
                                        </motion.h3>

                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ delay: 0.2 }}
                                            className="grow text-sm leading-relaxed text-zinc-600"
                                        >
                                            {content}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}

// --- CollectionGrid Component ---

export interface CollectionGridProps extends React.HTMLAttributes<HTMLDivElement> {
    offers?: Offer[];
}

// Three columns at the widest breakpoint, so nine is exactly three full rows —
// a page that ends mid-row reads as a loading state rather than a page break.
const PAGE_SIZE = 9;

// Same backing-off the navbar uses when it jumps to a section: the pill floats
// over the page, and a section scrolled flush to y=0 sits underneath it.
const SECTION_SCROLL_OFFSET = -104;

export const CollectionGrid = React.forwardRef<HTMLDivElement, CollectionGridProps>(
    ({ offers = defaultOffers, className, ...props }, ref) => {
        const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
        const [page, setPage] = React.useState(1);
        const sectionRef = React.useRef<HTMLElement>(null);
        const lenisRef = useLenis();

        const filteredOffers = React.useMemo(() => {
            if (selectedCategory === 'all') return offers;
            return offers.filter((o) => o.category === selectedCategory);
        }, [offers, selectedCategory]);

        const pageCount = Math.max(1, Math.ceil(filteredOffers.length / PAGE_SIZE));

        // Clamped rather than trusted: picking a filter resets the page below, but
        // the `offers` prop can also shrink underneath a page that no longer
        // exists, and deriving the page instead of correcting it in an effect
        // means there's never a render where the two disagree.
        const currentPage = Math.min(page, pageCount);
        const firstOnPage = (currentPage - 1) * PAGE_SIZE;

        const visibleOffers = React.useMemo(
            () => filteredOffers.slice(firstOnPage, firstOnPage + PAGE_SIZE),
            [filteredOffers, firstOnPage]
        );

        const goToPage = (next: number) => {
            const target = Math.min(Math.max(next, 1), pageCount);
            if (target === currentPage) return;
            setPage(target);

            // Otherwise you click Next at the bottom of the grid and land looking
            // at the last row of the new page. Lenis owns the scroll position, so
            // this can't be scrollIntoView — and its cached scroll limit is stale
            // this far down the document, because ZoomInScroll's pin spacers made
            // the page taller than the cache knows. Same reason the navbar calls
            // resize before every jump.
            const lenis = lenisRef?.current;
            const section = sectionRef.current;
            if (!lenis || !section) return;

            lenis.resize();
            lenis.scrollTo(section, { offset: SECTION_SCROLL_OFFSET, duration: 0.9 });
        };

        // Picking a filter — or turning a page — changes this section's height by
        // whole grid rows, which moves everything below it down the document, and
        // every ScrollTrigger down there (the footer's reveal, the navbar's scroll
        // spy) caches its start and end as offsets measured once. ScrollTrigger
        // only re-measures on resize and load, so the recompute has to be asked
        // for by hand. The carousel never needed this: it stayed one row tall
        // whatever you picked.
        //
        // Keyed on what's actually rendered rather than on the filtered set, since
        // a page turn changes the row count without changing the filter.
        //
        // Skipped on mount: at that point the page's other triggers are still
        // being built by sibling effects, so a refresh there is a forced layout
        // for nothing.
        const isFirstRender = React.useRef(true);
        React.useEffect(() => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            ScrollTrigger.refresh();
        }, [visibleOffers]);

        return (
            <motion.section
                ref={sectionRef}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn(
                    'w-full overflow-hidden border-t border-black/5 bg-[#f7f5f1] py-20 text-zinc-900 transition-colors duration-500 md:py-32',
                    className
                )}
            >
                <div className="mx-auto max-w-7xl px-6 md:px-10">
                    <div className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-14 md:flex-row md:items-end">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a6f59]">
                                Curated Selection
                            </p>
                            <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.06em] text-zinc-950 md:text-6xl">
                                Featured Collections
                            </h2>
                            {/* Also the filter's and the pagination's only
                                confirmation. A sighted user sees the grid reflow;
                                aria-live is what tells everyone else the set
                                changed, and to what. */}
                            <p aria-live="polite" className="mt-4 text-sm text-zinc-500">
                                {filteredOffers.length === 0
                                    ? `Nothing in this category · ${offers.length} pieces in all`
                                    : selectedCategory === 'all'
                                        ? `Showing ${firstOnPage + 1}–${firstOnPage + visibleOffers.length} of ${offers.length} pieces, each made to order`
                                        : `Showing ${firstOnPage + 1}–${firstOnPage + visibleOffers.length} of ${filteredOffers.length} pieces in this category`}
                            </p>
                        </div>

                        <FilterDisclosure
                            items={FILTER_ITEMS}
                            defaultActiveId="all"
                            onChange={(id) => {
                                setSelectedCategory(id);
                                // Page 3 of everything has no equivalent in a
                                // four-piece category, and starting a new filter
                                // part-way through its results reads as missing
                                // stock rather than as a page you're still on.
                                setPage(1);
                            }}
                        />
                    </div>

                    <div ref={ref} className="w-full" {...props}>
                        {filteredOffers.length === 0 ? (
                            <div
                                role="status"
                                className="rounded-2xl border border-dashed border-[#8a6f59]/30 px-6 py-16 text-center"
                            >
                                <p className="text-base font-semibold text-zinc-950">
                                    Nothing on the floor in this category
                                </p>
                                <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
                                    Everything here is built to order, so most pieces start as a
                                    conversation. Tell us what the room needs.
                                </p>
                            </div>
                        ) : (
                            // Keyed on the category and the page so the reveal
                            // replays for each new set; each card's own viewport
                            // trigger handles the rest. Two columns from 640px,
                            // three from 1024px — at ~380px wide a card in the
                            // third column still holds its title on one line.
                            <ul
                                key={`${selectedCategory}-${currentPage}`}
                                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
                            >
                                {visibleOffers.map((offer, index) => (
                                    <ProductCard
                                        key={offer.id}
                                        // Cascades a row left to right at three columns and
                                        // still offsets neighbours at two. At one column it
                                        // barely matters — each card is its own scroll event.
                                        revealDelay={(index % 3) * 0.08}
                                        imageSrc={offer.imageSrc}
                                        title={offer.title}
                                        subtitle={offer.tag}
                                        content={
                                            offer.content || (
                                                <div className="flex flex-col gap-6">
                                                    <p className="text-zinc-600">{offer.description}</p>

                                                    {offer.meta && offer.meta.length > 0 && (
                                                        <dl className="text-xs">
                                                            {offer.meta.map((row) => (
                                                                <div
                                                                    key={row.label}
                                                                    className="flex justify-between border-b border-zinc-200/80 py-2.5"
                                                                >
                                                                    <dt className="text-zinc-500">{row.label}</dt>
                                                                    <dd className="font-semibold text-zinc-950">{row.value}</dd>
                                                                </div>
                                                            ))}
                                                        </dl>
                                                    )}

                                                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                                                        <div className="flex items-center gap-3">
                                                            <Image
                                                                src={offer.brandLogoSrc}
                                                                alt={`${offer.brandName} logo`}
                                                                width={40}
                                                                height={40}
                                                                className="h-10 w-10 rounded-full bg-zinc-200 object-cover"
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-zinc-950">{offer.brandName}</p>
                                                                {offer.promoCode && (
                                                                    <p className="text-xs text-zinc-500">
                                                                        Code:{' '}
                                                                        <span className="font-mono font-bold text-[#8a6f59]">
                                                                            {offer.promoCode}
                                                                        </span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {offer.href && (
                                                        <a
                                                            href={offer.href}
                                                            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#8a6f59]"
                                                        >
                                                            Explore Piece
                                                            <ArrowRight className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            )
                                        }
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Outside the grid wrapper, because that div is what the
                        forwarded ref and any spread props address — a consumer
                        styling the grid shouldn't catch the controls too. Renders
                        nothing at all while a category fits on one page. */}
                    <PaginationWithIconAndLabel
                        page={currentPage}
                        pageCount={pageCount}
                        onPageChange={goToPage}
                        label="Collection pages"
                        className="mt-12 border-t border-black/10 pt-8 md:mt-16"
                    />
                </div>
            </motion.section>
        );
    }
);

CollectionGrid.displayName = 'CollectionGrid';
