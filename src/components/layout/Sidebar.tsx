"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Briefcase,
  CheckSquare,
  FileText,
  BookOpen,
  BookMarked,
  FileBarChart,
  Settings,
  ChevronLeft,
  X,
} from "lucide-react";

const navItems = [
  { href: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "finance", label: "المركز المالي", icon: Wallet },
  { href: "workspace", label: "مساحة العمل", icon: Briefcase },
  { href: "habits", label: "العادات والروتين", icon: CheckSquare },
  { href: "documents", label: "خزانة الوثائق", icon: FileText },
  { href: "courses", label: "التعلم المستمر", icon: BookOpen },
  { href: "quran", label: "القرآن الكريم", icon: BookMarked },
  { href: "reports", label: "مركز التقارير", icon: FileBarChart },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose = () => {},
}: SidebarProps) {
  const pathname = usePathname();

  const getHref = (path: string) => {
    if (path === "dashboard") return `/`;
    return `/${path}`;
  };

  const isActive = (path: string) => {
    if (path === "dashboard") return pathname === "/";
    return pathname.startsWith(`/${path}`);
  };

  const sidebarContent = (
    <div className="relative flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-[rgba(255,255,255,0.06)]">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="logo-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 flex-1"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">ح</span>
              </div>
              <span className="text-lg font-bold text-primary">حِمو</span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">ح</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors hidden lg:flex"
        >
          <ChevronLeft
            size={18}
            className={`text-secondary transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        <button
          onClick={onMobileClose}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors lg:hidden text-secondary hover:text-primary"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = getHref(item.href);
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={href} onClick={onMobileClose}>
              <motion.div
                whileHover={{ x: -2 }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${
                    active
                      ? "bg-[rgba(249,115,22,0.15)] border border-accent/20 shadow-[0_0_20px_-5px_rgba(249,115,22,0.15)]"
                      : "hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${
                    active ? "text-accent-light" : "text-secondary"
                  }`}
                />
                <AnimatePresence mode="wait">
                  {(!collapsed || mobileOpen) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className={`text-sm font-medium whitespace-nowrap overflow-hidden ${
                        active ? "text-white" : "text-secondary"
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
        <div
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl
            hover:bg-white/5 transition-colors cursor-pointer
          `}
        >
          <Settings size={20} className="shrink-0 text-secondary" />
          {(!collapsed || mobileOpen) && (
            <span className="text-sm font-medium text-secondary whitespace-nowrap">
              الإعدادات
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 bottom-0 end-0 z-50 flex-col hidden lg:flex"
        style={{ direction: "rtl" }}
      >
        <div className="absolute inset-0 bg-[rgba(15,20,30,0.8)] backdrop-blur-2xl border-s border-[rgba(255,255,255,0.06)]" />
        {sidebarContent}
      </motion.aside>

      {/* ── Mobile drawer (shown on mobile) ───── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-[#0B0F19]/60 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />

            <motion.aside
              key="mobile-drawer"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-0 bottom-0 end-0 z-[70] w-[280px] flex-col lg:hidden"
              style={{ direction: "rtl" }}
            >
              <div className="absolute inset-0 bg-[rgba(15,20,30,0.95)] backdrop-blur-2xl border-s border-[rgba(255,255,255,0.06)]" />
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
