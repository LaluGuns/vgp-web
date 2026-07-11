import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Bounds for the weekly focus goal, in minutes (30m … 50h). */
const MIN_GOAL = 30;
const MAX_GOAL = 3000;

function clampGoal(min: number): number {
  if (!Number.isFinite(min)) return MIN_GOAL;
  return Math.min(MAX_GOAL, Math.max(MIN_GOAL, Math.round(min)));
}

interface GoalState {
  weeklyGoalMinutes: number;
  setWeeklyGoal: (min: number) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      weeklyGoalMinutes: 300,
      setWeeklyGoal: (min) => set({ weeklyGoalMinutes: clampGoal(min) }),
    }),
    { name: "flowstate-weekly-goal" }
  )
);
