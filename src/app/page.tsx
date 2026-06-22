"use client";

import AppShell from "@/components/layout/AppShell";
import BalanceCard from "@/components/dashboard/BalanceCard";
import TodayTasks from "@/components/dashboard/TodayTasks";
import HabitsChecklist from "@/components/dashboard/HabitsChecklist";
import QuranTarget from "@/components/dashboard/QuranTarget";

export default function DashboardPage() {
  return (
    <AppShell title="لوحة القيادة" subtitle="نظرة شاملة ليومك">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <BalanceCard />
        <TodayTasks />
        <HabitsChecklist />
        <QuranTarget />
      </div>
    </AppShell>
  );
}
