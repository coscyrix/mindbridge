import React from "react";
import styles from "./styles.module.scss";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The variant/style of the button
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "outline" | "text" | "danger" | "success";
  /**
   * The size of the button
   * @default "medium"
   */
  size?: "small" | "medium" | "large";
  /**
   * Whether the button should take full width of its container
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Icon to display before the button text
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to display after the button text
   */
  endIcon?: React.ReactNode;
  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;
  /**
   * The button text/content
   */
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  startIcon,
  endIcon,
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner}></span>}
      {!loading && startIcon && (
        <span className={styles.startIcon}>{startIcon}</span>
      )}
      <span className={styles.content}>{children}</span>
      {!loading && endIcon && <span className={styles.endIcon}>{endIcon}</span>}
    </button>
  );
};

export default Button;
