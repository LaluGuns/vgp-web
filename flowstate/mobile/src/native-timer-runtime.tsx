import { useEffect, useRef } from "react";
import { useTimerStore } from "@/lib/stores/timer-store";
import { flowNative } from "./native-bridge";

export function NativeTimerRuntime() {
  const status = useTimerStore((state) => state.status);
  const phase = useTimerStore((state) => state.phase);
  const currentSessionId = useTimerStore((state) => state.currentSessionId);
  const expectedEndTime = useTimerStore((state) => state.expectedEndTime);
  const scheduledIdRef = useRef<string | null>(null);
  const permissionRequestedRef = useRef(false);

  useEffect(() => {
    const native = flowNative();
    if (!native) return;

    const previousId = scheduledIdRef.current;
    const activeId = status === "running" && currentSessionId && expectedEndTime
      ? currentSessionId
      : null;

    if (previousId && previousId !== activeId) {
      void native.cancelFocusDeadline?.({ id: previousId }).catch(() => {});
      scheduledIdRef.current = null;
    }

    if (!activeId || !expectedEndTime || !native.scheduleFocusDeadline) return;

    if (!permissionRequestedRef.current) {
      permissionRequestedRef.current = true;
      void native.requestNotificationPermission?.().catch(() => {});
    }

    const title = phase === "focus" ? "Focus block complete" : "Break complete";
    const body = phase === "focus"
      ? "Nice work. Your Flow break is ready."
      : "Break over. Time to lock back in.";

    scheduledIdRef.current = activeId;
    void native.scheduleFocusDeadline({
      id: activeId,
      deadlineEpochMs: expectedEndTime,
      title,
      body,
    }).catch(() => {
      if (scheduledIdRef.current === activeId) scheduledIdRef.current = null;
    });
  }, [status, phase, currentSessionId, expectedEndTime]);

  useEffect(() => {
    const native = flowNative();
    if (!native?.setKeepScreenOn) return;

    const media = window.matchMedia("(orientation: landscape) and (max-height: 600px)");
    const sync = () => {
      const enabled = status === "running" && media.matches;
      document.documentElement.toggleAttribute("data-flow-desk-mode", media.matches);
      void native.setKeepScreenOn?.({ enabled }).catch(() => {});
    };

    sync();
    media.addEventListener?.("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      media.removeEventListener?.("change", sync);
      window.removeEventListener("resize", sync);
      document.documentElement.removeAttribute("data-flow-desk-mode");
      void native.setKeepScreenOn?.({ enabled: false }).catch(() => {});
    };
  }, [status]);

  useEffect(() => () => {
    const native = flowNative();
    const id = scheduledIdRef.current;
    if (native?.cancelFocusDeadline && id) {
      void native.cancelFocusDeadline({ id }).catch(() => {});
    }
  }, []);

  return null;
}
