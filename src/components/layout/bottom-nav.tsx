"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartPie,
  House,
  ListOrdered,
  type LucideIcon,
} from "lucide-react";

import { cn } from "~/lib/utils";

const tabs: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/transactions", label: "Transactions", icon: ListOrdered },
  { href: "/analytics", label: "Analytics", icon: ChartPie },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-md grid-cols-3">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                  active && "bg-primary/10"
                )}
              >
                <tab.icon className="size-5" />
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}