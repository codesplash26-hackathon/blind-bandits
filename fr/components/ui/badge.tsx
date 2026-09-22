import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-secondary text-secondary-foreground",
        muted: "bg-muted text-muted-foreground",
        outline: "border border-border text-foreground",
        authority: "bg-primary/10 text-primary border border-primary/25 font-bold",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/25",
        success:
          "bg-secondary/15 text-secondary border border-secondary/30 font-semibold",
        warning:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25",
        info: "bg-light-blue/20 text-midnight-green dark:text-light-blue border border-light-blue/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
