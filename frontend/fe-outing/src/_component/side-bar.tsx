"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

import { getLocations } from "@/src/_lib/api/registrationService";
import { useAuth } from "@/app/_component/auth-provider";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
};

const baseMenuItems: Omit<MenuItem, "badge">[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Locations",
    href: "/manage-locations",
    icon: Building2,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Registrations",
    href: "/create",
    icon: ClipboardList,
  },
];

export default function SideBar() {
  const pathname = usePathname();

  const { isAdmin, loading, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);

  /*
   * สำคัญ:
   * ใช้ () => getLocations()
   * เพราะ getLocations รับ AbortSignal แต่ React Query
   * queryFn จะส่ง QueryFunctionContext เข้ามา
   */
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
    enabled: Boolean(isAdmin),
  });

  const pendingLocations = locations.filter(
    (location) => location.status === "PENDING",
  ).length;

  if (loading || !isAdmin) {
    return null;
  }

  const menuItems: MenuItem[] = baseMenuItems.map((item) => ({
    ...item,
    badge:
      item.label === "Locations"
        ? pendingLocations
        : undefined,
  }));

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <aside
      className={`
        relative flex h-screen shrink-0 flex-col
        border-r border-line bg-card
        transition-[width] duration-200 ease-out
        ${collapsed ? "w-[76px]" : "w-[260px]"}
      `}
    >
      {/* Header */}
      <div
        className={`
          flex h-[72px] shrink-0 items-center border-b border-line
          ${
            collapsed
              ? "justify-center px-3"
              : "justify-between px-5"
          }
        `}
      >
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-3"
          aria-label="Admin Dashboard"
        >
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl bg-brand text-white
            "
          >
            <Building2
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p
                className="
                  truncate text-sm font-semibold
                  text-card-foreground
                "
              >
                Admin Panel
              </p>

              <p className="truncate text-xs text-muted">
                Management System
              </p>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="
              flex h-8 w-8 shrink-0
              items-center justify-center
              rounded-lg text-muted
              transition-colors
              hover:bg-surface
              hover:text-card-foreground
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand
            "
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button */}
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          className="
            absolute -right-3 top-[84px] z-10
            flex h-7 w-7
            items-center justify-center
            rounded-full border border-line
            bg-card text-muted shadow-sm
            transition-colors
            hover:bg-surface
            hover:text-card-foreground
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand
          "
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Navigation */}
      <nav
        className="
          flex-1 overflow-y-auto
          px-3 py-5
        "
        aria-label="Main navigation"
      >
        {!collapsed && (
          <p
            className="
              mb-2 px-3 text-[11px]
              font-semibold uppercase
              tracking-wider text-muted
            "
          >
            Main Menu
          </p>
        )}

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
                className={`
                  group relative flex h-11
                  items-center rounded-xl
                  text-sm font-medium
                  transition-colors
                  ${
                    collapsed
                      ? "justify-center px-3"
                      : "gap-3 px-3"
                  }
                  ${
                    isActive
                      ? "bg-brand/10 text-brand"
                      : "text-muted hover:bg-surface hover:text-card-foreground"
                  }
                `}
              >
                {isActive && (
                  <span
                    className="
                      absolute left-0 h-6 w-1
                      rounded-r-full bg-brand
                    "
                    aria-hidden="true"
                  />
                )}

                <Icon
                  className={`
                    h-[19px] w-[19px] shrink-0
                    ${
                      isActive
                        ? "text-brand"
                        : "text-muted group-hover:text-card-foreground"
                    }
                  `}
                  aria-hidden="true"
                />

                {/* Expanded */}
                {!collapsed && (
                  <span
                    className="
                      flex min-w-0 flex-1
                      items-center
                      justify-between gap-2
                    "
                  >
                    <span className="truncate">
                      {item.label}
                    </span>

                    {item.badge !== undefined &&
                      item.badge > 0 && (
                        <span
                          className="
                            flex h-5 min-w-5 shrink-0
                            items-center justify-center
                            rounded-full bg-brand
                            px-1.5
                            text-[11px]
                            font-semibold
                            leading-none
                            text-white
                          "
                        >
                          {item.badge > 99
                            ? "99+"
                            : item.badge}
                        </span>
                      )}
                  </span>
                )}

                {/* Collapsed */}
                {collapsed &&
                  item.badge !== undefined &&
                  item.badge > 0 && (
                    <span
                      className="
                        absolute right-1 top-1
                        flex h-4 min-w-4
                        items-center justify-center
                        rounded-full bg-red-500
                        px-1
                        text-[9px]
                        font-bold text-white
                      "
                    >
                      {item.badge > 9
                        ? "9+"
                        : item.badge}
                    </span>
                  )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div
        className="
          shrink-0 border-t
          border-line p-3
        "
      >
        {!collapsed && (
          <div
            className="
              mb-2 flex items-center
              gap-3 rounded-xl
              bg-surface p-3
            "
          >
            <div
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-full bg-brand/15
                text-sm font-semibold
                text-brand
              "
            >
              A
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate text-sm font-medium
                  text-card-foreground
                "
              >
                Administrator
              </p>

              <p className="truncate text-xs text-muted">
                Admin account
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`
            flex h-11 w-full
            items-center rounded-xl
            text-sm font-medium
            text-danger transition-colors
            hover:bg-red-50
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-danger
            ${
              collapsed
                ? "justify-center px-3"
                : "gap-3 px-3"
            }
          `}
        >
          <LogOut
            className="h-[19px] w-[19px] shrink-0"
            aria-hidden="true"
          />

          {!collapsed && (
            <span>Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}
