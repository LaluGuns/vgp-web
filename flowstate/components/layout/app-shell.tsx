"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  ListTodo,
  Headphones,
  Layers,
  Image,
  BarChart3,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export function AppShell({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-4 relative">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}

function Sidebar() {
  const { t } = useTranslation();
  const showTasks = useAppStore((s) => s.showTasks);
  const showMixer = useAppStore((s) => s.showMixer);
  const showPlayer = useAppStore((s) => s.showPlayer);
  const showStats = useAppStore((s) => s.showStats);
  const togglePanel = useAppStore((s) => s.togglePanel);

  const items = [
    { id: "tasks" as const, icon: ListTodo, label: t("dashboard.tasks.title", "Tasks"), shortcut: "T", active: showTasks },
    { id: "player" as const, icon: Headphones, label: t("dashboard.player.title", "Music"), shortcut: "P", active: showPlayer },
    { id: "mixer" as const, icon: Layers, label: t("dashboard.mixer.title", "Mixer"), shortcut: "M", active: showMixer },
    { id: "stats" as const, icon: BarChart3, label: t("dashboard.insights", "Insights"), shortcut: "", active: showStats },
  ];

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-14 flex flex-col items-center py-6 gap-2 z-40 border-r border-border/25 bg-background/40 backdrop-blur-xl">
      <div className="mb-6">
        <div className="h-8 w-8 rounded-lg border border-primary/40 bg-primary/5 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.25)] select-none">
          <span className="text-primary font-mono text-sm font-bold tracking-tighter glow-text-primary">F</span>
        </div>
      </div>

      {items.map((item) => (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-xl transition-all duration-300",
                item.active
                  ? "bg-primary/10 text-primary border border-primary/25 shadow-[0_0_12px_rgba(0,212,255,0.15)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
              )}
              onClick={() => togglePanel(item.id)}
            >
              <item.icon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.label}
            {item.shortcut && (
              <kbd className="ml-2 text-[10px] bg-secondary px-1 py-0.5 rounded border border-border/30">
                {item.shortcut}
              </kbd>
            )}
          </TooltipContent>
        </Tooltip>
      ))}

      <div className="mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground rounded-xl"
            >
              <Keyboard className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[10px] space-y-1">
            <p><kbd>Space</kbd> Start / Pause timer</p>
            <p><kbd>R</kbd> Reset · <kbd>S</kbd> Skip</p>
            <p><kbd>P</kbd> Play / Pause music</p>
            <p><kbd>[ ]</kbd> Prev / Next track</p>
            <p><kbd>T</kbd> Tasks · <kbd>M</kbd> Mixer</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
}
