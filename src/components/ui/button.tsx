import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-[10px] font-medium transition-all duration-150 disabled:opacity-50",
        size === "sm" && "h-8 px-3 text-[13px]",
        size === "md" && "h-9 px-3.5 text-[13px]",
        variant === "primary" &&
          "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)] hover:brightness-110 active:scale-[0.98]",
        variant === "secondary" &&
          "bg-[var(--bg-elevated)] text-[var(--fg-primary)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] hover:bg-[var(--bg-hover)]",
        variant === "ghost" &&
          "text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]",
        variant === "danger" &&
          "bg-[var(--danger)] text-white shadow-[var(--shadow-sm)] hover:brightness-110",
        className,
      )}
      {...props}
    />
  );
}
