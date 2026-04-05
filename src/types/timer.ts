// Timer Types

export interface TimerState {
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
  exerciseId?: string;
}

export type TimerAction =
  | { type: 'START'; payload: { duration: number; exerciseId?: string } }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'STOP' }
  | { type: 'ADJUST'; payload: number };
