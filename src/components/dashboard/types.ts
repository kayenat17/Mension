export interface SavedAnalysis {
  id: string | number;
  message: string;
  phase: string;
  result: string;
  timestamp: string;
  sender_label?: string;
}

export interface CycleData {
  lmp: string;
  cycleLength: number;
  periodDuration: number;
}

export interface CycleLog {
  id: string;
  start_date: string;
  notes?: string;
}
