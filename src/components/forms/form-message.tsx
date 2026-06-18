type FormMessageProps = {
  children?: React.ReactNode;
  tone?: "error" | "success" | "info";
};

const toneClasses = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-brand-100 bg-brand-50 text-brand-700",
  info: "border-slate-200 bg-white text-muted",
};

export function FormMessage({ children, tone = "info" }: FormMessageProps) {
  if (!children) {
    return null;
  }

  return <div className={`rounded-md border px-3 py-2 text-sm ${toneClasses[tone]}`}>{children}</div>;
}
