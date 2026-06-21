import { create } from "zustand";
import type { Habit, DailyTodo } from "@/types/habits";
import { mockHabits, mockTodos } from "@/lib/mock/habits";

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

  loadMockData: () => void;
  addHabit: (name: string, type: Habit["type"]) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  todos: [],
  today: new Date().toISOString().slice(0, 10),

  loadMockData: () => {
    set({ habits: mockHabits, todos: mockTodos });
  },

  addHabit: (name, type) => {
    const habit: Habit = {
      id: uid("h"),
      name,
      type,
      streak: 0,
      completedDates: [],
      active: true,
    };
    set({ habits: [...get().habits, habit] });
  },

  toggleHabit: (id) => {
    const today = get().today;
    const habits = get().habits.map((h) => {
      if (h.id !== id) return h;
      const alreadyDone = h.completedDates.includes(today);
      const completedDates = alreadyDone
        ? h.completedDates.filter((d) => d !== today)
        : [...h.completedDates, today];
      const streak = alreadyDone
        ? h.streak - 1
        : h.streak + 1;
      return { ...h, completedDates, streak: Math.max(0, streak) };
    });
    set({ habits });
  },

  deleteHabit: (id) => {
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },

  addTodo: (text) => {
    const todo: DailyTodo = {
      id: uid("t"),
      text,
      completed: false,
      date: get().today,
    };
    set({ todos: [...get().todos, todo] });
  },

  toggleTodo: (id) => {
    const todos = get().todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    set({ todos });
  },

  deleteTodo: (id) => {
    set({ todos: get().todos.filter((t) => t.id !== id) });
  },
}));
