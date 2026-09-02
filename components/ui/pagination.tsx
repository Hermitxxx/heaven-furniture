import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkOwnProps = {
  isActive?: boolean;
  size?: VariantProps<typeof buttonVariants>["size"];
};

// Upstream ships this as an <a> only, which assumes a page is a route. Here a
// page number is client state on a single-page site, so an `href="#"` would
// rewrite the URL and hand the scroll position to the browser — which on this
// page means fighting Lenis. The element is therefore chosen by whether an href
// was passed: a link when it points somewhere, a real button when it doesn't.
// Discriminating the union on `href` is what lets each branch narrow without a
// cast, and it's also what makes `disabled` available — an anchor has no such
// state, and the ends of a pagination row need one.
type PaginationLinkProps =
  | (PaginationLinkOwnProps & React.ComponentProps<"a"> & { href: string })
  | (PaginationLinkOwnProps & React.ComponentProps<"button"> & { href?: undefined });

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  const shared = {
    "data-slot": "pagination-link",
    "data-active": isActive,
    "aria-current": isActive ? ("page" as const) : undefined,
    className: cn(
      buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
      className
    ),
  };

  if (props.href !== undefined) return <a {...shared} {...props} />;

  // `href` is narrowed to `undefined` here, and React drops undefined
  // attributes, so the button branch can spread the same object.
  return <button type="button" {...shared} {...props} />;
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      // Hidden from the a11y tree deliberately: it stands in for pages that
      // aren't listed, and the nav already announces which page is current, so
      // reading "more pages" between two numbers adds nothing to navigate by.
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-10 items-center justify-center text-muted-foreground",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="size-4" />
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
};
