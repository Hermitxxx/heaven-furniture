'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, MotionConfig, type Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Eye } from 'lucide-react';
import { FaBed, FaChair } from 'react-icons/fa';
import { MdOutlineTableRestaurant, MdLightbulb } from 'react-icons/md';
import { BsCheckLg } from 'react-icons/bs';
import { PiFunnelSimpleBold } from 'react-icons/pi';
import type { IconType } from 'react-icons';
import { cn } from '@/lib/utils';
import { BiCategoryAlt } from 'react-icons/bi';

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

export const defaultOffers: Offer[] = [
    {
        id: "nordic-oak-armchair",
        category: "seating",
        imageSrc: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$1,240" },
            { label: "Lead time", value: "4–6 weeks" },
        ],
    },
    {
        id: "velvet-boucle-sofa",
        category: "seating",
        imageSrc: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$2,890" },
            { label: "Lead time", value: "8–10 weeks" },
        ],
    },
    {
        id: "handwoven-rattan-chair",
        category: "seating",
        imageSrc: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$340" },
            { label: "Lead time", value: "2–3 weeks" },
        ],
    },
    {
        id: "walnut-coffee-table",
        category: "tables",
        imageSrc: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$980" },
            { label: "Lead time", value: "5–7 weeks" },
        ],
    },
    {
        id: "linen-upholstered-bed",
        category: "beds",
        imageSrc: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$1,560" },
            { label: "Lead time", value: "6–8 weeks" },
        ],
    },
    {
        id: "ceramic-table-lamp",
        category: "lighting",
        imageSrc: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$210" },
            { label: "Lead time", value: "1–2 weeks" },
        ],
    },
    {
        id: "marble-dining-table",
        category: "tables",
        imageSrc: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$3,400" },
            { label: "Lead time", value: "6–8 weeks" },
        ],
    },
    {
        id: "velvet-accent-chair",
        category: "seating",
        imageSrc: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&q=80&w=1200",
        imageAlt: "Emerald Velvet Accent Chair",
        title: "Emerald Velvet Accent Chair",
        tag: "Living Room · Seating",
        description: "Rich emerald velvet upholstery combined with a sculpted matte black steel frame for modern contrast.",
        brandLogoSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
        brandName: "Nordic Craft Studio",
        promoCode: "VELVET12",
        href: "#",
        meta: [
            { label: "Material", value: "Cotton Velvet, Steel" },
            { label: "Dimensions", value: "72 × 78 × 82 cm" },
            { label: "Price", value: "$890" },
            { label: "Lead time", value: "3–4 weeks" },
        ],
    },
    {
        id: "minimalist-oak-desk",
        category: "tables",
        imageSrc: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$1,150" },
            { label: "Lead time", value: "4–5 weeks" },
        ],
    },
    {
        id: "leather-ottoman-bench",
        category: "seating",
        imageSrc: "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$680" },
            { label: "Lead time", value: "2–4 weeks" },
        ],
    },
    {
        id: "minimalist-floor-lamp",
        category: "lighting",
        imageSrc: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$450" },
            { label: "Lead time", value: "1–2 weeks" },
        ],
    },
    {
        id: "sculptural-side-table",
        category: "tables",
        imageSrc: "https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&q=80&w=1200",
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
            { label: "Price", value: "$520" },
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

    const activeItem = items.find((i) => i.id === active);
    const ActiveIcon = activeItem ? activeItem.icon : BiCategory;

    const handleSelect = (id: string) => {
        setActive(id);
        onChange?.(id);
        setTimeout(() => setOpen(false), 220);
    };

    return (
        <div className="relative flex h-[60px] w-[260px] items-center justify-end">
            <MotionConfig transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {open ? (
                        <motion.div
                            key="open"
                            layoutId="filter-disclosure"
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
                                        initial={{ opacity: 0, scale: 1.1, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        onClick={() => handleSelect(item.id)}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ ...SPRING, delay: index * 0.04 }}
                                        className="flex w-full cursor-pointer items-center justify-between rounded-[14px] px-[12px] py-[8px] transition-colors hover:bg-zinc-100 dark:hover:bg-neutral-800/60"
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
                                layoutId="filter-disclosure"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0 } }}
                                onClick={() => setOpen(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ borderRadius: 28 }}
                                className="z-20 flex h-[52px] w-[52px] cursor-pointer items-center justify-center border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <PiFunnelSimpleBold className="h-[24px] w-[24px] text-zinc-900 dark:text-neutral-100" />
                            </motion.button>

                            <motion.div
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

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

export function ProductCard({
    imageSrc = "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000",
    title = "Untitled Item",
    subtitle = "Category",
    content,
}: {
    imageSrc?: string;
    title?: string;
    subtitle?: string;
    content?: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    const layoutId = React.useId() + `-${title.replace(/\s+/g, "-").toLowerCase()}`;

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <motion.div
                variants={cardVariants}
                layoutId={layoutId}
                onClick={() => setIsOpen(true)}
                className="group relative h-[440px] w-[340px] flex-shrink-0 snap-start cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <motion.img
                    layoutId={`image-${layoutId}`}
                    src={imageSrc}
                    className="absolute inset-0 h-full w-full object-cover"
                    variants={{ hover: { scale: 1.05 } }}
                />

                {/* Reduced dark overlay mask for significantly brighter images */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-zinc-950/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

                {/* Hover Hint Badge */}
                <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-zinc-950/50 px-3 py-1.5 text-[11px] font-medium text-white opacity-0 backdrop-blur-md transition-all duration-300 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
                    <Eye className="h-3.5 w-3.5 text-[#D7C3B1]" />
                    <span>Click for details</span>
                </div>

                <div className="absolute bottom-0 left-0 w-full translate-y-2 p-6 transition-transform duration-300 group-hover:translate-y-0">
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
            </motion.div>

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
                                    className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
                                />
                                <motion.div
                                    layoutId={layoutId}
                                    className="relative z-10 flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl md:flex-row"
                                >
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white/50 text-zinc-950 backdrop-blur-sm transition-colors hover:bg-zinc-100"
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
                                        <motion.img
                                            layoutId={`image-${layoutId}`}
                                            src={imageSrc}
                                            className="h-full w-full object-cover"
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

// --- OfferCarousel Component ---

export interface OfferCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
    offers?: Offer[];
}

export const OfferCarousel = React.forwardRef<HTMLDivElement, OfferCarouselProps>(
    ({ offers = defaultOffers, className, ...props }, ref) => {
        const scrollContainerRef = React.useRef<HTMLDivElement>(null);
        const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

        const filteredOffers = React.useMemo(() => {
            if (selectedCategory === 'all') return offers;
            return offers.filter((o) => o.category === selectedCategory);
        }, [offers, selectedCategory]);

        const scroll = (direction: 'left' | 'right') => {
            if (scrollContainerRef.current) {
                const { current } = scrollContainerRef;
                const scrollAmount = current.clientWidth * 0.8;
                current.scrollBy({
                    left: direction === 'left' ? -scrollAmount : scrollAmount,
                    behavior: 'smooth',
                });
            }
        };

        return (
            <motion.section
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
                    {/* Section Header with Integrated Filter Disclosure */}
                    <div className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-14 md:flex-row md:items-end">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a6f59]">
                                Curated Selection
                            </p>
                            <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.06em] text-zinc-950 md:text-6xl">
                                Featured Collections
                            </h2>
                        </div>

                        <FilterDisclosure
                            items={FILTER_ITEMS}
                            defaultActiveId="all"
                            onChange={(id) => setSelectedCategory(id)}
                        />
                    </div>

                    <div ref={ref} className="group relative w-full" {...props}>
                        {/* Left Navigation Arrow */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-950 opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-300 hover:bg-white group-hover:opacity-100 disabled:opacity-0"
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>

                        {/* Scrollable Container with Staggered Reveal Animations */}
                        <motion.div
                            key={selectedCategory}
                            ref={scrollContainerRef}
                            initial="hidden"
                            animate="visible"
                            transition={{ staggerChildren: 0.1 }}
                            className="flex space-x-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
                        >
                            {filteredOffers.map((offer) => (
                                <ProductCard
                                    key={offer.id}
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
                                                        <img
                                                            src={offer.brandLogoSrc}
                                                            alt={`${offer.brandName} logo`}
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
                        </motion.div>

                        {/* Right Navigation Arrow */}
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-950 opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-300 hover:bg-white group-hover:opacity-100 disabled:opacity-0"
                            aria-label="Scroll Right"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </motion.section>
        );
    }
);

OfferCarousel.displayName = 'OfferCarousel';

export const Carousel = OfferCarousel;