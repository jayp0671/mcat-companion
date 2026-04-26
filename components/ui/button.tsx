import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  asChild?: boolean;
  children: React.ReactNode;
};

export function Button({ className, variant = "default", asChild, children, ...props }: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
    variant === "default" && "bg-blue-600 text-white hover:bg-blue-700",
    variant === "outline" && "border border-slate-300 bg-white hover:bg-slate-50",
    variant === "ghost" && "hover:bg-slate-100",
    className
  );
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, { className: cn(classes, (children as any).props.className) });
  }
  return <button className={classes} {...props}>{children}</button>;
}
