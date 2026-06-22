import { create } from "zustand";
import { Habit, DailyTodo } from "@/types/habits";
import { mockHabits, mockTodos } from "@/lib/mock/habits";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

let _nextHabitId = 100;
let _nextTodoId = 200;
const uid = (prefix: string) => {
  const n = prefix === "h" ? ++_nextHabitId : ++_nextTodoId;
  return `${prefix}_${n}_${Date.now()}`;
};

interface HabitsState {
  habits: Habit[];
  todos: DailyTodo[];
  today: string;

  fetchAll: () => Promise<void>;
  seedIfEmpty: () => Promise<void>;
  addHabit: (name: string, type: Habit["type"]) => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  todos: [],
  today: new Date().toISOString().slice(0, 10),

  fetchAll: async () => {
    const [habitsRes, todosRes] = await Promise.all([
      supabase.from("habits").select("*"),
      supabase.from("daily_todos").select("*"),
    ]);
    if (habitsRes.data) set({ habits: habitsRes.data as unknown as Habit[] });
    if (todosRes.data) set({ todos: todosRes.data as unknown as DailyTodo[] });
  },

  seedIfEmpty: async () => {
    const { data: existing } = await supabase.from("habits").select("id").limit(1);
    if (existing && existing.length > 0) return;
    await supabase.from("habits").insert(mockHabits.map(({ id: _h, ...r }) => ({ ...r, completed_dates: r.completedDates })));
    await supabase.from("daily_todos").insert(mockTodos.map(({ id: _t, ...r }) => r));
    await get().fetchAll();
  },

  addHabit: async (name, type) => {
    const habit: Habit = { id: uid("h"), name, type, streak: 0, completedDates: [], active: true };
    const prev = get().habits;
    set({ habits: [...prev, habit] });

    const { data: inserted, error } = await supabase.from("habits").insert({
      name, type, streak: 0, completed_dates: [], active: true,
    }).select().single();

    if (error) { logger.api.supabase("insert habit", error, { name }); set({ habits: prev }); return; }
    set({ habits: get().habits.map((h) => h.id === habit.id ? { ...h, id: inserted.id } : h) });
  },

  toggleHabit: async (id) => {
    const today = get().today;
    const prev = get().habits;
    const habits = prev.map((h) => {
      if (h.id !== id) return h;
      const alreadyDone = h.completedDates.includes(today);
      const completedDates = alreadyDone ? h.completedDates.filter((d) => d !== today) : [...h.completedDates, today];
      return { ...h, completedDates, streak: Math.max(0, alreadyDone ? h.streak - 1 : h.streak + 1) };
    });
    set({ habits });

    const updated = habits.find((h) => h.id === id);
    if (updated) {
      const { error } = await supabase.from("habits").update({
        completed_dates: updated.completedDates, streak: updated.streak,
      }).eq("id", id);
      if (error) { logger.api.supabase("toggle habit", error, { habitId: id }); set({ habits: prev }); }
    }
  },

  deleteHabit: async (id) => {
    const prev = get().habits;
    set({ habits: prev.filter((h) => h.id !== id) });
    const { error } = await supabase.from("habits").delete().eq("id", id);
    if (error) { logger.api.supabase("delete habit", error, { habitId: id }); set({ habits: prev }); }
  },

  addTodo: async (text) => {
    const todo: DailyTodo = { id: uid("t"), text, completed: false, date: get().today };
    const prev = get().todos;
    set({ todos: [...prev, todo] });

    const { data: inserted, error } = await supabase.from("daily_todos").insert({
      text, completed: false, date: get().today,
    }).select().single();

    if (error) { logger.api.supabase("insert todo", error, { text }); set({ todos: prev }); return; }
    set({ todos: get().todos.map((t) => t.id === todo.id ? { ...t, id: inserted.id } : t) });
  },

  toggleTodo: async (id) => {
    const prev = get().todos;
    const todos = prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t);
    set({ todos });
    const updated = todos.find((t) => t.id === id);
    if (updated) {
      const { error } = await supabase.from("daily_todos").update({ completed: updated.completed }).eq("id", id);
      if (error) { logger.api.supabase("toggle todo", error, { todoId: id }); set({ todos: prev }); }
    }
  },

  deleteTodo: async (id) => {
    const prev = get().todos;
    set({ todos: prev.filter((t) => t.id !== id) });
    const { error } = await supabase.from("daily_todos").delete().eq("id", id);
    if (error) { logger.api.supabase("delete todo", error, { todoId: id }); set({ todos: prev }); }
  },
}));
