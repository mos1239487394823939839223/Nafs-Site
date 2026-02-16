import { Button as NextUIButton } from "@nextui-org/react";
import { cn } from '../../lib/utils'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  // Map legacy variants to NextUI props
  const getVariantProps = () => {
    switch (variant) {
      case 'primary':
        return { color: "primary", variant: "solid" };
      case 'secondary':
        return { color: "secondary", variant: "faded" };
      case 'outline':
        return { color: "primary", variant: "bordered" };
      case 'ghost':
        return { color: "default", variant: "light" };
      case 'danger':
        return { color: "danger", variant: "solid" };
      case 'glass':
        return { color: "default", variant: "flat", className: "bg-white/10 backdrop-blur-md border border-white/20 text-white" };
      default:
        return { color: "primary", variant: "solid" };
    }
  };

  const { color, variant: uiVariant, className: variantClass } = getVariantProps();
  const { onClick, onPress, ...remainingProps } = props;

  return (
    <NextUIButton
      color={color}
      variant={uiVariant}
      onPress={onPress || onClick}
      size={size}
      radius="full"
      className={cn(variantClass, className)}
      {...remainingProps}
    >
      {children}
    </NextUIButton>
  )
}
