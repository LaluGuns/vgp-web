import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  pomodorosEstimated: number;
  pomodorosDone: number;
}

interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;

  addTask: (title: string, pomodoros?: number) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setActiveTask: (id: string | null) => void;
  incrementPomodoro: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  clearDone: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,

      addTask: (title, pomodoros = 1) => {
        const id = typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });

        const task: Task = {
          id,
          title,
          done: false,
          pomodorosEstimated: pomodoros,
          pomodorosDone: 0,
        };
        set({ tasks: [...get().tasks, task] });
      },

      removeTask: (id) => {
        const { tasks, activeTaskId } = get();
        set({
          tasks: tasks.filter((t) => t.id !== id),
          activeTaskId: activeTaskId === id ? null : activeTaskId,
        });
      },

      toggleTask: (id) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        });
      },

      setActiveTask: (id) => set({ activeTaskId: id }),

      incrementPomodoro: (id) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id
              ? { ...t, pomodorosDone: t.pomodorosDone + 1 }
              : t
          ),
        });
      },

      updateTitle: (id, title) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, title } : t
          ),
        });
      },

      reorder: (fromIndex, toIndex) => {
        const tasks = [...get().tasks];
        const [moved] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, moved);
        set({ tasks });
      },

      clearDone: () => {
        set({ tasks: get().tasks.filter((t) => !t.done) });
      },
    }),
    { name: "flowstate-tasks" }
  )
);
