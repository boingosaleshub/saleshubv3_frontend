import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * BoingoGradientButton
 * - Reusable gradient button using Boingo brand red
 * - Preserves gradient on hover/active via brightness adjustments
 * - High contrast, accessible focus styles
 */
export function BoingoGradientButton({ className, children, ...props }) {
  return (
    <Button
      className={cn(
        // Layout & typography
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold",
        // Gradient background using brand variables
        "bg-gradient-to-r from-[var(--boingo-red)] to-[var(--boingo-red-dark)]",
        // Contrast & feedback
        "text-white shadow-md hover:shadow-lg transition-all duration-300",
        // Maintain gradient while providing hover/active feedback
        "hover:brightness-[1.05] active:brightness-[0.95]",
        // Focus styles for accessibility (consistent with existing Button)
        "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export default BoingoGradientButton;