type FormMessageProps = {
  children?: React.ReactNode;
  className?: string;
  variant?: "legacy" | "reality";
  tone?: "error" | "success" | "info";
};

const toneClasses = {
  error: "border-red-400/30 bg-red-400/10 text-red-100",
  success: "border-brand-secondary/30 bg-brand-secondary/10 text-reality-brand-600",
  info: "border-reality-border-secondary bg-reality-bg-subtle text-reality-text-secondary",
};

const realityToneClasses = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-reality-brand-500/20 bg-reality-brand-50 text-reality-brand-700",
  info: "border-reality-border-secondary bg-reality-bg-subtle text-reality-text-secondary",
};

export function FormMessage({
  children,
  className = "",
  tone = "info",
  variant = "reality",
}: FormMessageProps) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${
        variant === "reality" ? realityToneClasses[tone] : toneClasses[tone]
      } ${className}`}
    >
      {children}
    </div>
  );
}

