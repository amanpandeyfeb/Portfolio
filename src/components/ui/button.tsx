import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "default" | "outline" | "ghost";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<Variant, string> = {
  default: "bg-[color:var(--accent)] text-white",
  outline:
    "border border-[color:var(--border)] text-[color:var(--foreground)] bg-transparent",
  ghost: "text-[color:var(--foreground)] hover:bg-[color:var(--chip)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2",
  md: "px-5 py-2",
};

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
}
