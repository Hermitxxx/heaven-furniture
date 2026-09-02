'use client';

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

// Past this many pages the row stops being a flat list and starts eliding:
// first, last, the current page and one neighbour either side. Seven is what
// still fits a narrow phone at these sizes without wrapping onto two lines.
const MAX_FLAT_PAGES = 7;
const SIBLINGS = 1;

type Slot = number | "gap";

function pageSlots(page: number, pageCount: number): Slot[] {
  if (pageCount <= MAX_FLAT_PAGES) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const shown = new Set<number>([1, pageCount, page]);
  for (let offset = 1; offset <= SIBLINGS; offset += 1) {
    if (page - offset > 1) shown.add(page - offset);
    if (page + offset < pageCount) shown.add(page + offset);
  }

  // A gap goes wherever the sorted numbers skip one, which is the only place an
  // ellipsis means anything.
  const sorted = [...shown].sort((a, b) => a - b);
  return sorted.flatMap((n, i) =>
    i > 0 && n - sorted[i - 1] > 1 ? ["gap" as const, n] : [n]
  );
}

// The current page is filled, where shadcn's default only outlines it. Against
// the collection section's #f7f5f1 an outline in `--border` is nearly invisible,
// and "which page am I on" is the one thing this control has to answer at a
// glance. Clay on hover, matching the rest of that section.
const ACTIVE_CLASSES =
  "border-zinc-950 bg-zinc-950 text-white hover:bg-[#8a6f59] hover:text-white";

export interface PaginationWithIconAndLabelProps {
  /** 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Names the nav — "pagination" alone is ambiguous once a page has two of them. */
  label?: string;
  className?: string;
}

export default function PaginationWithIconAndLabel({
  page,
  pageCount,
  onPageChange,
  label = "Pagination",
  className,
}: PaginationWithIconAndLabelProps) {
  // A single page is not a choice, so there is nothing here to operate.
  if (pageCount <= 1) return null;

  return (
    <Pagination aria-label={label} className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            aria-label="Go to previous page"
            className="gap-1 rounded-full px-3 sm:pl-2.5 sm:pr-5"
            size="default"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronsLeft className="size-4" />
            {/* The word is the nicety; the icon plus the aria-label carries the
                whole meaning, so the word is what goes on a narrow screen. */}
            <span className="hidden sm:inline">Previous</span>
          </PaginationLink>
        </PaginationItem>

        {pageSlots(page, pageCount).map((slot, index) =>
          slot === "gap" ? (
            <PaginationItem key={`gap-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={slot}>
              <PaginationLink
                aria-label={`Go to page ${slot}`}
                isActive={slot === page}
                className={cn("rounded-full", slot === page && ACTIVE_CLASSES)}
                onClick={() => onPageChange(slot)}
              >
                {slot}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationLink
            aria-label="Go to next page"
            className="gap-1 rounded-full px-3 sm:pl-5 sm:pr-2.5"
            size="default"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronsRight className="size-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
