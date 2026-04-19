import { cn } from "../../lib/utils";

const buttonVariants = {
  default: "bg-primary text-white hover:bg-primary-dark",
  hero: "bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all",
  outline: "border border-border bg-transparent hover:bg-background-subtle",
  secondary: "bg-secondary text-text hover:bg-secondary-dark",
  ghost: "hover:bg-background-subtle",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-8 text-base",
  icon: "h-10 w-10",
};

const LandingButton = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "",
  onClick,
  ...props 
}) => {
  const variantClass = buttonVariants[variant] || buttonVariants.default;
  const sizeClass = buttonSizes[size] || buttonSizes.default;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClass,
        sizeClass,
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default LandingButton;
