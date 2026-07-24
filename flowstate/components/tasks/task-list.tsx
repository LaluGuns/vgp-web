"use client";

import { useState, type KeyboardEvent } from "react";
import { useTaskStore, type Task } from "@/lib/stores/task-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Trash2, 
  Target, 
  Code, 
  BookOpen, 
  Music, 
  Dumbbell, 
  Coffee, 
  Briefcase, 
  Laptop 
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

function getTaskIcon(title: string, className?: string) {
  const t = title.toLowerCase();
  if (t.includes("code") || t.includes("program") || t.includes("dev") || t.includes("bug") || t.includes("tech")) return <Code className={className} />;
  if (t.includes("read") || t.includes("book") || t.includes("study") || t.includes("learn") || t.includes("write")) return <BookOpen className={className} />;
  if (t.includes("music") || t.includes("beat") || t.includes("lofi") || t.includes("song") || t.includes("track")) return <Music className={className} />;
  if (t.includes("run") || t.includes("exercise") || t.includes("gym") || t.includes("workout") || t.includes("sports")) return <Dumbbell className={className} />;
  if (t.includes("coffee") || t.includes("breakfast") || t.includes("eat") || t.includes("lunch") || t.includes("dinner")) return <Coffee className={className} />;
  if (t.includes("work") || t.includes("office") || t.includes("meeting") || t.includes("job") || t.includes("tasks")) return <Briefcase className={className} />;
  return <Laptop className={className} />;
}

export function TaskList() {
  const { t } = useTranslation();
  const tasks = useTaskStore((s) => s.tasks);
  const activeTaskId = useTaskStore((s) => s.activeTaskId);
  const addTask = useTaskStore((s) => s.addTask);
  const removeTask = useTaskStore((s) => s.removeTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const setActiveTask = useTaskStore((s) => s.setActiveTask);
  const clearDone = useTaskStore((s) => s.clearDone);

  const [input, setInput] = useState("");

  function handleAdd() {
    const title = input.trim();
    if (!title) return;
    addTask(title);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  function handleListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

    const activeEl = document.activeElement;
    if (!activeEl) return;

    // Find all task items
    const list = e.currentTarget;
    const items = Array.from(list.querySelectorAll("[data-task-item]"));
    if (items.length === 0) return;

    // Find which task item contains the active element
    const currentItemIdx = items.findIndex((item) => item.contains(activeEl));
    if (currentItemIdx === -1) return;

    // Determine the next index
    const nextItemIdx = currentItemIdx + (e.key === "ArrowDown" ? 1 : -1);
    if (nextItemIdx < 0 || nextItemIdx >= items.length) return;

    e.preventDefault();
    const nextItem = items[nextItemIdx];

    // Find the focusable elements in current and next items
    const selector = 'button, [role="button"], input';
    const currentFocusables = Array.from(items[currentItemIdx].querySelectorAll(selector));
    const nextFocusables = Array.from(nextItem.querySelectorAll(selector));

    // Find the index of the active element within the current item's focusable elements
    const activeElIdx = currentFocusables.indexOf(activeEl);
    if (activeElIdx !== -1 && nextFocusables[activeElIdx]) {
      (nextFocusables[activeElIdx] as HTMLElement).focus();
    } else if (nextFocusables.length > 0) {
      (nextFocusables[0] as HTMLElement).focus();
    }
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="flex flex-col h-full space-y-4 overflow-hidden select-none">
      {/* Title Header */}
      <div className="flex items-center justify-between select-none mb-1">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/40">{t("dashboard.tasks.title", "Tasks")}</span>
          <h3 className="text-sm font-semibold text-white/95 tracking-tight mt-0.5">{t("dashboard.tasks.title", "Tasks")} ({tasks.length})</h3>
        </div>
        <span className="text-[10px] font-mono text-primary bg-primary/[0.06] border border-primary/20 shadow-[0_2px_8px_hsl(var(--primary)/0.1),inset_0_1px_1px_rgba(255,255,255,0.1)] px-2.5 py-0.5 rounded-full backdrop-blur-sm transition-all duration-300">
          {doneCount}/{tasks.length} {t("dashboard.tasks.complete", "Complete")}
        </span>
      </div>

      {/* Ultra-Premium Input Bar (macOS Spotlight Style) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl shrink-0 transition-all duration-300 transform-gpu border border-white/[0.06] bg-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] focus-within:bg-white/[0.04] focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-[0_0_15px_hsl(var(--primary)/0.12),inset_0_1px_1px_rgba(255,255,255,0.05)] relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("dashboard.tasks.placeholder", "What's your next focus block?")}
          aria-label={t("dashboard.tasks.placeholder", "What's your next focus block?")}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-foreground placeholder:text-white/30 focus:outline-none tracking-wide"
          maxLength={80}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleAdd} 
          aria-label="Add task"
          className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:text-primary-foreground hover:scale-[1.03] hover:shadow-[0_0_10px_hsl(var(--primary)/0.3)] transition-all duration-300 active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Task List container */}
      <ul 
        className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-0.5"
        aria-label="Tasks focus list"
        onKeyDown={handleListKeyDown}
      >
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isActive={activeTaskId === task.id}
            onToggle={() => toggleTask(task.id)}
            onRemove={() => removeTask(task.id)}
            onSetActive={() =>
              setActiveTask(activeTaskId === task.id ? null : task.id)
            }
          />
        ))}
        {tasks.length === 0 && (
          <li className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent flex items-center justify-center text-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative transition-all duration-500 hover:scale-105 hover:border-white/20">
              <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-sm opacity-50 animate-pulse-glow" />
              <Target className="h-5 w-5 text-white/40 z-10" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white/85 tracking-wide">{t("dashboard.tasks.empty", "No tasks yet. Add one above to plan the block.")}</p>
              <p className="text-[10px] text-white/45 max-w-[190px] leading-relaxed">
                {t("dashboard.tasks.placeholder", "Add a task above to capture your next focus block.")}
              </p>
            </div>
          </li>
        )}
      </ul>

      {/* Clear Completed Footer */}
      {doneCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-[9px] uppercase tracking-wider text-white/70 hover:text-red-400 hover:bg-red-500/5 w-full font-semibold border border-white/[0.06] rounded-xl transition duration-300 shrink-0 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={clearDone}
          aria-label={t("dashboard.tasks.clearCompleted", "Clear Completed Tasks")}
        >
          {t("dashboard.tasks.clearCompleted", "Clear Completed Tasks")}
        </Button>
      )}
    </div>
  );
}

function TaskItem({
  task,
  isActive,
  onToggle,
  onRemove,
  onSetActive,
}: {
  task: Task;
  isActive: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onSetActive: () => void;
}) {
  const { t } = useTranslation();
  return (
    <li
      data-task-item={task.id}
      className={cn(
        "group flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-500 border relative overflow-hidden select-none transform-gpu glass-tile",
        isActive 
          ? "bg-primary/[0.04] border-primary/30 ring-1 ring-primary/20 shadow-[0_4px_16px_hsl(var(--primary)/0.08),inset_0_1px_1px_rgba(255,255,255,0.15)] opacity-100" 
          : "border-white/5 opacity-90 hover:opacity-100 hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.45)]"
      )}
    >
      {/* Selection Left indicator dot (Pill shaped, matching mockups) */}
      {isActive && (
        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary/90 shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
      )}

      {/* Round Checklist Checkbox with SVG draw animation */}
      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
        className={cn(
          "w-6 h-6 rounded-full border shrink-0 flex items-center justify-center transition-all duration-300 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          task.done
            ? "bg-primary/10 border-primary/50 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.25),inset_0_1px_1px_rgba(255,255,255,0.1)]"
            : "border-white/15 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/[0.04] hover:shadow-[0_0_8px_hsl(var(--primary)/0.1)] text-white/20"
        )}
      >
        <div className="relative flex items-center justify-center h-3 w-3">
          <svg
            className={cn(
              "h-3 w-3 stroke-[3.5] transition-transform duration-300",
              task.done ? "scale-100 rotate-0" : "scale-0 -rotate-12"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              className={task.done ? "animate-check" : ""}
              style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
              }}
            />
          </svg>
        </div>
      </button>

      {/* Category Icon */}
      <div className={cn(
        "w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300",
        isActive 
          ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.15)]" 
          : "bg-white/[0.03] border-white/5 text-white/50 group-hover:text-white group-hover:border-white/10 group-hover:scale-105"
      )}>
        {getTaskIcon(task.title, "h-4 w-4")}
      </div>

      {/* Task Text info */}
      <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
        <span
          role="button"
          tabIndex={0}
          onClick={onSetActive}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSetActive();
            } else if (e.key === "Delete" || e.key === "Backspace") {
              e.preventDefault();
              onRemove();
            } else if (e.key.toLowerCase() === "x" || e.key.toLowerCase() === "c") {
              e.preventDefault();
              onToggle();
            }
          }}
          aria-pressed={isActive}
          aria-label={`Task: ${task.title}. ${isActive ? "Currently active focus task" : "Press space to set active focus task"}`}
          className={cn(
            "text-xs truncate transition-all duration-300 cursor-pointer font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded px-1 -mx-1",
            task.done ? "line-through text-muted-foreground/30" : "text-white"
          )}
        >
          {task.title}
        </span>
        <span className={cn(
          "text-[9px] font-mono mt-0.5 transition-colors duration-300",
          task.done ? "text-emerald-400/50 font-medium" : "text-white/40"
        )}>
          {task.done ? t("dashboard.tasks.complete", "Completed") : `${t("dashboard.tasks.session", "Session")}: ${task.pomodorosDone}/${task.pomodorosEstimated}`}
        </span>
      </div>

      {/* Active Target Lock Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-lg shrink-0 transition-all duration-300 border active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive 
            ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.15)] opacity-100" 
            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 hover:text-primary hover:bg-primary/5 hover:border-primary/20 border-transparent"
        )}
        onClick={onSetActive}
        aria-pressed={isActive}
        aria-label={isActive ? `Deactivate task: ${task.title}` : `Set active task: ${task.title}`}
      >
        <Target className="h-4 w-4" />
      </Button>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 border border-transparent text-muted-foreground hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={onRemove}
        aria-label={`Delete task: ${task.title}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}
