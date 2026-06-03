export interface WorkEntry {
  id: number;
  date: string;
  work_type: string;
  volume: number;
  unit: string;
  performer: string;
  created_at: string;
}

export interface WorkType {
  id: number;
  name: string;
}

export interface WorkEntryFormData {
  date: string;
  workType: string;
  volume: string;
  unit: string;
  performer: string;
}

export interface FilterState {
  from: string;
  to: string;
  sort: 'asc' | 'desc';
}

export type FormErrors = Partial<Record<keyof WorkEntryFormData, string>>;
