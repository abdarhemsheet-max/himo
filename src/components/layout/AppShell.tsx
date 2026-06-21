"use client";

import { useState, useEffect, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MeshGradient from "./MeshGradient";
import PageTransition from "../ui/PageTransition";
import { useAppStore } from "@/store/app.store";

interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  const { sidebarCollapsed, toggleSidebar, showBalance, toggleBalance } =
    useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 72 : 256;
  const offset = isDesktop ? sidebarWidth : 0;

  return (
    <div className="min-h-screen">
      <MeshGradient />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="transition-all duration-300" style={{ marginInlineEnd: offset }}>
        <Header
          title={title}
          subtitle={subtitle}
          showBalance={showBalance}
          onToggleBalance={toggleBalance}
          onToggleMobile={() => setMobileMenuOpen((p) => !p)}
        />

        <main className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <PageTransition key={title}>{children}</PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
