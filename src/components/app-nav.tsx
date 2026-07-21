"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileText,
  LayoutDashboard,
  LayoutPanelTop,
  Send,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, available: true },
  { name: "Companies", href: "/companies", icon: Building2, available: true },
  { name: "Opportunities", href: "/opportunities", icon: BriefcaseBusiness, available: true },
  { name: "Pipeline", href: "/pipeline", icon: LayoutPanelTop, available: true },
  { name: "Contacts", href: "/contacts", icon: Users, available: true },
  { name: "Resumes", href: "/resumes", icon: FileText, available: true },
  { name: "Outreach", href: "/outreach", icon: Send, available: false },
  { name: "Analytics", href: "/analytics", icon: BarChart3, available: false },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="space-y-1 px-3">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        if (!item.available) {
          return (
            <div
              key={item.name}
              aria-disabled="true"
              className="flex h-9 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground/55"
            >
              <Icon className="size-4" />
              <span>{item.name}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider">Soon</span>
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
