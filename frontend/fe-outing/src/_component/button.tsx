interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  "aria-busy"?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover disabled:hover:bg-brand",
  secondary:
    "bg-white text-card-foreground border border-line hover:bg-surface disabled:hover:bg-white",
  danger:
    "bg-danger text-white hover:bg-red-700 disabled:hover:bg-danger",
  warning: "bg-yellow-500 text-black hover:bg-yellow-600",
  info: "bg-cyan-500 text-white hover:bg-cyan-600",
  light: "bg-gray-100 text-black hover:bg-gray-200",
  dark: "bg-black text-white hover:bg-gray-900",
  outline:
    "bg-transparent text-card-foreground border border-line hover:bg-surface",
  ghost:
    "bg-transparent text-card-foreground hover:bg-surface disabled:hover:bg-transparent",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "text-sm px-3 h-9",
  md: "text-base px-4 h-11",
  lg: "text-lg px-5 h-11",
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  "aria-busy": ariaBusy,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-busy={ariaBusy}
    >
      {children}
    </button>
  );
}
