export type ThemeMode = "light" | "dark";

export interface ScheduleType {
  id: string;
  name: string;
  lunch_enabled: boolean;
  lunch_start: string | null;
  lunch_end: string | null;
  created_at: string;
}

export interface ScheduleBlock {
  id: string;
  schedule_type_id: string;
  name: string;
  start_time: string;
  end_time: string;
  block_index: number;
  is_lunch: boolean;
  created_at: string;
}

export interface ScheduleOverride {
  id: string;
  override_date: string;
  schedule_type_id: string;
  created_at: string;
  schedule_type?: {
    name: string;
  };
}

export interface Task {
  id: string;
  title: string;
  due_date: string | null;
  schedule_block_id: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  schedule_block?: {
    name: string;
  };
}
