type FormMessageProps = {
  children?: React.ReactNode;
  tone?: "error" | "success" | "info";
};

const toneClasses = {
  error: "border-red-400/30 bg-red-400/10 text-red-100",
  success: "border-brand-secondary/30 bg-brand-secondary/10 text-brand-secondary",
  info: "border-white/10 bg-white/5 text-brand-muted",
};

export function FormMessage({ children, tone = "info" }: FormMessageProps) {
  if (!children) {
    return null;
  }

  return <div className={`rounded-md border px-3 py-2 text-sm ${toneClasses[tone]}`}>{children}</div>;
}
