import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

type PublicShellProps = {
  children: React.ReactNode;
  variant?: "reality";
  withFooter?: boolean;
  transparentHeader?: boolean;
};

export function PublicShell({
  children,
  transparentHeader = false,
  variant = "reality",
  withFooter = true,
}: PublicShellProps) {
  return (
    <div className="[color-scheme:light]">
      <Navbar transparent={transparentHeader} variant={variant} />
      {children}
      {withFooter ? <Footer variant={variant} /> : null}
    </div>
  );
}

