import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * A flexible card component for containing content.
 */
export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  const baseStyles = "rounded-xl";

  const variantStyles = {
    default: "bg-white dark:bg-gray-800",
    outlined: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    elevated: "bg-white dark:bg-gray-800 shadow-lg",
  };

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ children, className = "", ...props }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({
  children,
  as: Component = "h3",
  className = "",
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={`text-xl font-semibold text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ children, className = "", ...props }: CardContentProps) {
  return (
    <div className={`text-gray-600 dark:text-gray-300 ${className}`} {...props}>
      {children}
    </div>
  );
}
