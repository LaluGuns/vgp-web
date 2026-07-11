"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group/slider",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[5px] w-full grow overflow-hidden rounded-full bg-white/[0.08] border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)]">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary/90 to-primary shadow-[0_0_4px_rgba(0,229,255,0.3)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-3.5 w-3.5 rounded-full border border-white bg-white shadow-[0_1px_3px_rgba(0,0,0,0.4),0_0_6px_rgba(0,229,255,0.4)] transition-all duration-200 hover:scale-110 group-hover/slider:shadow-[0_2px_5px_rgba(0,0,0,0.5),0_0_10px_rgba(0,229,255,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-grab active:cursor-grabbing relative" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
