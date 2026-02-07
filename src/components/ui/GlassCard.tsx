import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  variant?: 'default' | 'glow' | 'subtle' | 'critical';
  hover?: boolean;
  className?: string;
}

export function GlassCard({ 
  children, 
  variant = 'default', 
  hover = true,
  className,
  ...props 
}: GlassCardProps) {
  const variants = {
    default: 'glass-card',
    glow: 'glass-card glow-border animate-pulse-glow',
    subtle: 'bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl',
    critical: 'glass-card border-destructive/50 shadow-[0_0_30px_hsl(var(--destructive)/0.2)]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
