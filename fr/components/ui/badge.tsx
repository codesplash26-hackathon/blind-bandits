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
          "bg-success/15 text-success border border-success/30 font-semibold",
        warning:
          "bg-warning/10 text-warning border border-warning/25",
        info: "bg-frosted-blue/20 text-primary dark:text-secondary border border-border/30",
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
