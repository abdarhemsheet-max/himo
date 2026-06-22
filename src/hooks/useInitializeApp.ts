"use client";

import { useEffect, useRef, useState } from "react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useFinanceStore } from "@/store/finance.store";
import { useQuranStore } from "@/store/quran.store";
import { useCoursesStore } from "@/store/courses.store";
import { useHabitsStore } from "@/store/habits.store";
import { useDocumentsStore } from "@/store/documents.store";

export function useInitializeApp() {
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {
        localStorage.clear();

        await Promise.all([
          useWorkspaceStore.getState().fetchCompanies(),
          useWorkspaceStore.getState().fetchClients(),
          useWorkspaceStore.getState().fetchTasks(),
          useFinanceStore.getState().fetchAll(),
          useQuranStore.getState().fetchAll(),
          useCoursesStore.getState().fetchAll(),
          useHabitsStore.getState().fetchAll(),
          useDocumentsStore.getState().fetchAll(),
        ]);

        await Promise.all([
          useWorkspaceStore.getState().seedIfEmpty(),
          useFinanceStore.getState().seedIfEmpty(),
          useQuranStore.getState().seedIfEmpty(),
          useCoursesStore.getState().seedIfEmpty(),
          useHabitsStore.getState().seedIfEmpty(),
          useDocumentsStore.getState().seedIfEmpty(),
        ]);
      } catch (err) {
        console.error("App initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  return { isLoading };
}
