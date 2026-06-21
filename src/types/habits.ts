export interface Habit {
  id: string;
  name: string;
  type: "morning" | "evening" | "anytime";
  streak: number;
  completedDates: string[];
  active: boolean;
}

export interface DailyTodo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}
