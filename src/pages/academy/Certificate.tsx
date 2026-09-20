import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import { TOTAL_BEGINNER_LESSONS } from "@/data/academy/beginner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award, Printer } from "lucide-react";

export default function Certificate() {
  const { user } = useAuth();
  const { rows } = useAcademyProgress("beginner");
  const completed = rows.filter((r) => r.completed).length;
  const finished = completed === TOTAL_BEGINNER_LESSONS;
  const name = user?.email?.split("@")[0] ?? "Trader";
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  if (!finished) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-display gold-text">Certificate locked</h1>
        <p className="text-sm text-white/60">
          Complete all {TOTAL_BEGINNER_LESSONS} beginner lessons to unlock your certificate. You're at {completed}.
        </p>
        <Link to="/academy/beginner">
          <Button className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">Back to the track</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link to="/academy" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-[#F4D03F]">
          <ArrowLeft className="h-3.5 w-3.5" /> Academy
        </Link>
        <Button onClick={() => window.print()} className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">
          <Printer className="h-4 w-4 mr-2" /> Print / Save as PDF
        </Button>
      </div>

      <div className="mx-auto max-w-3xl rounded-xl border-2 border-[#D4AF37]/50 bg-gradient-to-br from-[#0d0d0d] to-black p-10 text-center space-y-6">
        <Award className="h-12 w-12 text-[#F4D03F] mx-auto" />
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.4em] text-[#D4AF37]/70">AASAKIRA Academy</div>
          <h1 className="text-3xl font-display gold-text">Certificate of Completion</h1>
        </div>
        <p className="text-sm text-white/60">This certifies that</p>
        <div className="text-2xl text-white font-display capitalize">{name}</div>
        <p className="text-sm text-white/60 max-w-lg mx-auto">
          has completed all {TOTAL_BEGINNER_LESSONS} lessons of the Beginner track, covering foundations, market
          mechanics, risk and capital, reading price, and execution and discipline.
        </p>
        <div className="flex items-center justify-center gap-10 pt-4 text-xs text-white/50">
          <div>
            <div className="text-white/80 font-mono">{date}</div>
            <div className="uppercase tracking-widest text-[10px]">Date</div>
          </div>
          <div>
            <div className="text-white/80 font-mono">Beginner · 20 lessons</div>
            <div className="uppercase tracking-widest text-[10px]">Track</div>
          </div>
        </div>
      </div>
    </div>
  );
}
