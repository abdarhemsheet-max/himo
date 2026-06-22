"use client";

import { useState, useEffect, ReactNode } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PageTransition from "../ui/PageTransition";

const MeshGradient = dynamic(() => import("./MeshGradient"), { ssr: false });
const CommandPalette = dynamic(() => import("../ui/CommandPalette"), { ssr: false });
import { useInitializeApp } from "@/hooks/useInitializeApp";
import { useAppStore } from "@/store/app.store";

interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  const { isLoading } = useInitializeApp();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <Loader2 size={24} className="text-accent-light animate-spin" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-32 mx-auto bg-white/5 rounded-full animate-pulse" />
            <div className="h-3 w-48 mx-auto bg-white/[0.03] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MeshGradient />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <CommandPalette />

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
