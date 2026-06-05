import { Link } from "react-router-dom";
import { ReactNode } from "react";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(ellipse, rgba(212,175,55,0.18) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[#F4D03F] via-[#D4AF37] to-[#8B6914] flex items-center justify-center">
            <span className="font-display text-sm font-bold text-black">A</span>
          </div>
          <span className="font-display text-lg font-bold tracking-[0.28em] gold-text">
            AASAKIRA
          </span>
        </Link>

        <div className="lux-glass border border-[#D4AF37]/15 rounded-2xl p-7">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-white/55 mb-6">{subtitle}</p>
          )}
          {children}
        </div>

        {footer && (
          <div className="text-center text-sm text-white/55 mt-6">{footer}</div>
        )}
      </div>
    </div>
  );
}