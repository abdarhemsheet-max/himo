export interface Lesson {
  id: string;
  title: string;
  url: string;
  isCompleted: boolean;
}

export interface Course {
  id: string;
  name: string;
  platform: "YouTube" | "Coursera" | "Udemy" | "مسك" | string;
  coverImage: string;
  totalLessons: number;
  completedLessons: number;
  totalTimeSpent: number;
  cost: number;
  lessons: Lesson[];
}
