export interface Project {
  id: string;
  name: string;
  status: "active" | "on_hold" | "completed";
  progress: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  activeContracts: number;
  totalRevenue: number;
  projects: Project[];
  status: "active" | "archived";
}

export type TaskStatus = "pending" | "in-progress" | "archived";

export interface Company {
  id: string;
  name: string;
  type: "حكومي" | "خاص";
  email: string;
  phone: string;
  monthlyValue: number;
  recurringServices: string[];
  activeTasksCount: number;
  status: "active" | "archived";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  clientId: string;
  companyId?: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "critical";
  billableHours: number;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration: number;
}
