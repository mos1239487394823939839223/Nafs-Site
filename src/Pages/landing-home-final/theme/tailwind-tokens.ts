/**
 * Nafas Tailwind Config Tokens
 * --------------------------------
 * Add the following inside your tailwind.config.ts → theme.extend
 * Also add `tailwindcss-animate` to the plugins array.
 *
 * npm install tailwindcss-animate
 * (or: bun add tailwindcss-animate)
 */

// theme.extend.colors
export const nafasColors = {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  brand: {
    DEFAULT: "hsl(var(--brand))",
    foreground: "hsl(var(--brand-foreground))",
    soft: "hsl(var(--brand-soft))",
    muted: "hsl(var(--brand-muted))",
  },
  cream: {
    DEFAULT: "hsl(var(--cream))",
    deep: "hsl(var(--cream-deep))",
  },
};

// theme.extend.borderRadius
export const nafasRadius = {
  lg: "var(--radius)",
  md: "calc(var(--radius) - 2px)",
  sm: "calc(var(--radius) - 4px)",
};

// theme.extend.keyframes
export const nafasKeyframes = {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" },
  },
};

// theme.extend.animation
export const nafasAnimation = {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
};
