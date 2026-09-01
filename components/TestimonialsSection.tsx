"use client";

import { motion } from "framer-motion";
import { ScrollReelTestimonials, type ScrollReelTestimonial } from "./Testimonials";
import { cn } from "@/lib/utils";

// The reel itself is a presentational primitive that takes its content as a
// prop, so the copy lives here rather than inside it — a future swap of the
// carousel doesn't take the reviews with it.
//
// Quotes are kept short on purpose: the reel renders them into a ~390px column
// at 22px, and it animates them one character at a time. Long paragraphs both
// wrap into a very tall block and take over a second to finish arriving.

// Sized to the 121px reel tile at 2x rather than the 400px the samples used —
// all ten portraits are mounted at once, so the over-fetch multiplies.
const portrait = (id: string) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=256`;

const TESTIMONIALS: ScrollReelTestimonial[] = [
    {
        quote: "We came in for one sofa and left having redesigned the whole room. Nobody rushed us.",
        author: "Nusrat Jahan · Homeowner, Khulshi",
        image: portrait("photo-1494790108377-be9c29b29330"),
        alt: "Nusrat Jahan",
    },
    {
        quote: "Our stairwell has defeated two other delivery teams. They built the frame in two pieces and assembled it upstairs.",
        author: "Rezaul Karim · Homeowner, Agrabad",
        image: portrait("photo-1507003211169-0a1dd7228f2d"),
        alt: "Rezaul Karim",
    },
    {
        quote: "I brought in a photograph of my grandmother's almirah. What arrived was better than the photograph.",
        author: "Farhana Akter · Homeowner, Nasirabad",
        image: portrait("photo-1580489944761-15a19d654956"),
        alt: "Farhana Akter",
    },
    {
        quote: "Six weeks from sketch to delivery, with progress photos the whole way.",
        author: "Tanvir Ahmed · Homeowner, Panchlaish",
        image: portrait("photo-1500648767791-00dcc994a43e"),
        alt: "Tanvir Ahmed",
    },
    {
        quote: "The fabric samples came to my house so I could see them in my own light.",
        author: "Shahida Begum · Homeowner, Halishahar",
        image: portrait("photo-1534528741775-53994a69daeb"),
        alt: "Shahida Begum",
    },
    {
        quote: "Three years and two children later, the joints are still tight.",
        author: "Mizanur Rahman · Homeowner, Chandgaon",
        image: portrait("photo-1438761681033-6461ffad8d80"),
        alt: "Mizanur Rahman",
    },
    {
        quote: "We needed a table for a room with no right angles. It fits as though it always had.",
        author: "Sabrina Chowdhury · Homeowner, GEC Circle",
        image: portrait("photo-1472099645785-5658abf4ff4e"),
        alt: "Sabrina Chowdhury",
    },
    {
        quote: "They talked me out of the pricier timber because it was wrong for the room.",
        author: "Iqbal Hossain · Homeowner, Dhanmondi, Dhaka",
        image: portrait("photo-1517841905240-472988babdf9"),
        alt: "Iqbal Hossain",
    },
    {
        quote: "You sit on things, you open the drawers, and the person answering built them.",
        author: "Ruma Das · Showroom visitor, Chattogram",
        image: portrait("photo-1531427186611-ecfd6d936c79"),
        alt: "Ruma Das",
    },
    {
        quote: "Delivered, levelled, and the packaging taken away. Nothing left for me to do.",
        author: "Ashraful Alam · Homeowner, Cox's Bazar",
        image: portrait("photo-1519345182560-3f2917c472ef"),
        alt: "Ashraful Alam",
    },
];

// The managing director's words, asked for alongside the reviews. Placed after
// them: the reviews earn the claim, this puts a name behind it.
const MD_QUOTE = {
    quote: "We have furnished a few hundred homes across Chattogram since 2020, and I still read every note that comes back. If it carries our name, it is something I would put in my own house.",
    name: "Abul Kalam Bhuiyan",
    role: "Managing Director, Heaven Furniture",
};

// Shell mirrors the Carousel's directly above it — same fade-up on first view,
// same max-w-7xl gutters, same eyebrow/heading pair — but on white rather than
// its cream #f7f5f1, so the two don't merge into one long band.
export function TestimonialsSection({ className }: { className?: string }) {
    return (
        <motion.section
            id="testimonials"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
                "w-full overflow-hidden border-t border-black/5 bg-white py-20 text-zinc-900 transition-colors duration-500 md:py-32",
                className
            )}
        >
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <div className="mb-14 max-w-3xl md:mb-20">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a6f59]">
                        In their words
                    </p>
                    <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.06em] text-zinc-950 md:text-6xl">
                        Hundreds of happy homeowners
                    </h2>
                </div>

                <ScrollReelTestimonials testimonials={TESTIMONIALS} className="mx-auto" />

                <figure className="mt-20 border-t border-black/10 pt-12 md:mt-28 md:pt-16">
                    <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-14">
                        <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a6f59] md:w-40 md:pt-3">
                            From the workshop
                        </p>

                        <div>
                            <blockquote className="max-w-3xl text-xl font-light italic leading-[1.45] tracking-tight text-zinc-950 md:text-3xl">
                                &ldquo;{MD_QUOTE.quote}&rdquo;
                            </blockquote>

                            <figcaption className="mt-8 flex items-center gap-4">
                                <div className="h-px w-10 bg-[#8a6f59]/50" />
                                <div>
                                    <p className="text-sm font-semibold text-zinc-950">{MD_QUOTE.name}</p>
                                    <p className="text-xs text-zinc-500">{MD_QUOTE.role}</p>
                                </div>
                            </figcaption>
                        </div>
                    </div>
                </figure>
            </div>
        </motion.section>
    );
}

export default TestimonialsSection;
