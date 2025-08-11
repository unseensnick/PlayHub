import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transform active:scale-95",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl hover:scale-105 hover:-translate-y-0.5",
                destructive:
                    "bg-destructive text-white shadow-lg hover:bg-destructive/90 hover:shadow-xl hover:scale-105 hover:-translate-y-0.5",
                outline:
                    "border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent/50 hover:shadow-md hover:scale-105 hover:-translate-y-0.5",
                secondary:
                    "bg-secondary/50 backdrop-blur-sm text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:scale-105 hover:-translate-y-0.5",
                ghost: "hover:bg-accent/50 hover:text-accent-foreground hover:backdrop-blur-sm hover:scale-105",
                link: "text-primary underline-offset-4 hover:underline hover:scale-105",
            },
            size: {
                default: "h-10 px-5 py-2 has-[>svg]:px-4",
                sm: "h-9 rounded-lg gap-1.5 px-3.5 has-[>svg]:px-3 text-xs",
                lg: "h-12 rounded-xl px-7 has-[>svg]:px-5 text-base",
                icon: "size-10 rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
