import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  Plus,
  FileText,
  FolderOpen,
  CreditCard,
  Clock,
  Users,
  BookOpen,
  ChevronDown,
  Menu,
  X,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { api } from "../lib/api";
import Logo from "../img/Bureau_of_Internal_Revenue_BIR.svg";

interface DropdownItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface GroupItem {
  label: string;
  icon: LucideIcon;
  items: DropdownItem[];
}

const processItems: DropdownItem[] = [
  {
    href: "/applications/new",
    label: "New Application",
    icon: Plus,
  },
  {
    href: "/drafts",
    label: "My Drafts",
    icon: FileText,
  },
  {
    href: "/applications",
    label: "All Applications",
    icon: FolderOpen,
  },
];

const queueItems: DropdownItem[] = [
  {
    href: "/issued-tins",
    label: "Issued TINs",
    icon: CreditCard,
  },
  {
    href: "/verification-queue",
    label: "Verification Queue",
    icon: Clock,
  },
];

const directoryItems: DropdownItem[] = [
  {
    href: "/registry",
    label: "Taxpayer Registry",
    icon: Users,
  },
  {
    href: "/data-dictionary",
    label: "Data Dictionary",
    icon: BookOpen,
  },
];

const groups: GroupItem[] = [
  {
    label: "Process",
    icon: FolderOpen,
    items: processItems,
  },
  {
    label: "Queue",
    icon: Clock,
    items: queueItems,
  },
  {
    label: "Directory",
    icon: BookOpen,
    items: directoryItems,
  },
];

const mobileItems: DropdownItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  ...processItems,
  ...queueItems,
  ...directoryItems,
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

function isActive(href: string, location: string) {
  return location.startsWith(href);
}

function isGroupActive(items: DropdownItem[], location: string) {
  return items.some((item) => location.startsWith(item.href));
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "RO"
  );
}

export default function Navbar() {
  const [location] = useLocation();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const closeDropdown = () => {
      setOpenDropdown(null);
    };

    window.addEventListener("click", closeDropdown);

    return () => {
      window.removeEventListener("click", closeDropdown);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const { data: profile } = useQuery({
    queryKey: ["profile", localStorage.getItem("token")],
    queryFn: api.profile.get,
  });

  const officerName = profile?.officerName ?? "Default User";
  const firstName = officerName.split(" ")[0] ?? "User";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={Logo}
                alt="BIR Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="leading-tight min-w-0">
              <div className="font-bold text-gray-900 dark:text-white text-[15px]">
                BIR Online
              </div>

              <div className="font-bold text-gray-900 dark:text-white text-[15px] hidden xs:block">
                Registration
              </div>
            </div>
          </div>

          {/* CENTER NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-4">

            {/* DASHBOARD */}
            <Link
              href="/dashboard"
              className={`
                flex items-center gap-2 px-5 py-3 rounded-2xl
                transition-all duration-150
                ${
                  location === "/dashboard"
                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900"
                }
              `}
              style={{
                textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <LayoutDashboard size={18} />

              <span className="text-sm font-medium">
                Dashboard
              </span>
            </Link>

            {/* GROUP DROPDOWNS */}
            {groups.map((group) => {
              const active = isGroupActive(group.items, location);

              return (
                <div
                  key={group.label}
                  className="relative"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setOpenDropdown(
                        openDropdown === group.label
                          ? null
                          : group.label
                      );
                    }}
                    className={`
                      flex items-center gap-2 px-5 py-3 rounded-2xl
                      transition-all duration-150
                      ${
                        active
                          ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900"
                      }
                    `}
                  >
                    <group.icon size={18} />

                    <span className="text-sm font-medium">
                      {group.label}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`
                        transition-transform duration-200
                        ${
                          openDropdown === group.label
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </button>

                  {/* DROPDOWN */}
                  {openDropdown === group.label && (
                    <div className="
                      absolute top-[70px] left-0
                      w-72
                      rounded-2xl
                      border border-gray-200 dark:border-zinc-800
                      bg-white dark:bg-zinc-900
                      shadow-xl
                      overflow-hidden
                    ">
                      {group.items.map((item) => {
                        const activeItem = isActive(
                          item.href,
                          location
                        );

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`
                              flex items-center gap-3
                              px-5 py-4
                              transition-colors duration-150
                              border-b border-gray-100 dark:border-zinc-800 last:border-0
                              ${
                                activeItem
                                  ? "bg-gray-100 dark:bg-zinc-800"
                                  : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                              }
                            `}
                            style={{
                              textDecoration: "none",
                              WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            <item.icon
                              size={18}
                              className="
                                text-gray-500 dark:text-zinc-400
                              "
                            />

                            <span className="
                              text-sm font-medium
                              text-gray-700 dark:text-zinc-100
                            ">
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* RIGHT PROFILE */}
          <div className="relative hidden sm:block">
            <Link
              href="/settings"
              className="
                flex items-center gap-3
                pl-3 pr-3 py-2
                rounded-full
                border border-gray-200 dark:border-zinc-700
                bg-white dark:bg-zinc-900
                hover:bg-gray-50 dark:hover:bg-zinc-800
                transition-all duration-150
              "
              style={{
                textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div className="
                w-9 h-9 rounded-full
                bg-gray-100 dark:bg-zinc-700
                text-gray-700 dark:text-zinc-100
                text-xs font-bold
                grid place-items-center
                overflow-hidden
              ">
                {profile?.photoDataUrl ? (
                  <img
                    src={profile.photoDataUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials(officerName)
                )}
              </div>

              <div className="hidden sm:flex items-center gap-1">
                <span className="
                  text-sm font-semibold
                  text-gray-800 dark:text-zinc-100
                ">
                  Hi, {firstName}
                </span>

                <ChevronDown
                  size={16}
                  className="text-gray-400 dark:text-zinc-500"
                />
              </div>
            </Link>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
            className="
              lg:hidden
              inline-grid h-10 w-10 place-items-center
              rounded-lg
              border border-gray-200 dark:border-zinc-700
              bg-white dark:bg-zinc-900
              text-gray-800 dark:text-zinc-100
              hover:bg-gray-50 dark:hover:bg-zinc-800
              transition-colors
            "
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/35"
          />

          <aside className="
            absolute right-0 top-0 h-dvh w-[min(84vw,320px)]
            bg-white dark:bg-zinc-950
            border-l border-gray-200 dark:border-zinc-800
            shadow-2xl
            flex flex-col
          ">
            <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                  <img
                    src={Logo}
                    alt="BIR Logo"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    BIR Online
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                    Hi, {firstName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="
                  grid h-9 w-9 place-items-center rounded-lg
                  text-gray-700 dark:text-zinc-100
                  hover:bg-gray-100 dark:hover:bg-zinc-800
                "
              >
                <X size={19} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              {mobileItems.map((item) => {
                const active = isActive(item.href, location);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex h-12 items-center gap-3 rounded-lg px-3
                      text-sm font-medium transition-colors
                      ${
                        active
                          ? "bg-gray-100 text-gray-950 dark:bg-zinc-800 dark:text-white"
                          : "text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      }
                    `}
                    style={{
                      textDecoration: "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <item.icon
                      size={18}
                      className={active ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-zinc-400"}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* SPACING */}
      <div className="h-16" />
    </>
  );
}
