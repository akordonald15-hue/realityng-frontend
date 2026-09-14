import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type SuccessStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
};

export function SuccessState({
  actions,
  className,
  description,
  icon,
  title,
  ...props
}: SuccessStateProps) {
  return (
    <div className={clsx("text-center text-reality-text-primary", className)} {...props}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-reality-brand-50 text-reality-brand-500">
        {icon ?? (
          <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path
              d="M5 12.5L9.5 17L19 7"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
          </svg>
        )}
      </div>
      <h2 className="mt-3 text-2xl font-medium leading-8">{title}</h2>
      {description ? (
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-reality-text-quaternary">
          {description}
        </p>
      ) : null}
      {actions ? <div className="mt-6">{actions}</div> : null}
    </div>
  );
}

