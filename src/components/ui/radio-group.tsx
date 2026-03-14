"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

const RadioGroup = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("grid gap-4", className)}
    {...props}
  />
));
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "h-4 w-4 rounded-full border border-[color:var(--border)] text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <span className="block h-2 w-2 rounded-full bg-[color:var(--accent)]" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
