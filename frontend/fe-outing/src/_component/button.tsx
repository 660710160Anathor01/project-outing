interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "danger" | "warning" | "info" | "light" | "dark";
    size?: "sm" | "md" | "lg";
    className?: string;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-blue-500 text-white",
    secondary: "bg-gray-500 text-white",
    danger: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-cyan-500 text-white",
    light: "bg-gray-100 text-black",
    dark: "bg-black text-white",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-3",
};

export function Button({
    children,
    onClick,
    variant = "primary",
    size = "md",
    className = "",
}: ButtonProps) {
    return (
        <button
            className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
