import { Link } from "react-router-dom";
import { BEGINNER_LESSONS, BEGINNER_MODULES, TOTAL_BEGINNER_LESSONS } from "@/data/academy/beginner";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, GraduationCap, PlayCircle } from "lucide-react";

export default function BeginnerTrack() {
  const { byId, rows, loading } = useAcademyProgress("beginner");
  const completed = rows.filter((r) => r.completed).length;
  const pct = Math.round((completed / TOTAL_BEGINNER_LESSONS) * 100);

  const nextLesson = BEGINNER_LESSONS.find((l) => !byId(l.id)?.completed) ?? BEGINNER_LESSONS[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display gold-text flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#D4AF37]" /> Academy · Beginner
          </h1>
          <p className="text-sm text-white/60">
            Twenty lessons across five modules. Read, complete the task, pass the quiz.
          </p>
        </div>
        <Link
          to={`/academy/beginner/${nextLesson.id}`}
          className="inline-flex items-center gap-2 rounded-md bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black hover:bg-[#F4D03F]"
        >
          <PlayCircle className="h-4 w-4" />
          {completed === 0 ? "Start track" : "Continue"}
        </Link>
      </div>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Track progress</span>
            <span className="text-[#F4D03F] font-mono">
              {completed} / {TOTAL_BEGINNER_LESSONS} · {pct}%
            </span>
          </div>
          <Progress value={pct} className="h-2" />
        </CardContent>
      </Card>

      {BEGINNER_MODULES.map((mod) => {
        const lessons = BEGINNER_LESSONS.filter((l) => l.module === mod);
        const done = lessons.filter((l) => byId(l.id)?.completed).length;
        const modPct = Math.round((done / lessons.length) * 100);
        return (
          <Card key={mod} className="bg-[#0a0a0a] border-[#D4AF37]/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-[#F4D03F] text-base">{mod}</CardTitle>
                <span className="text-xs text-white/50 font-mono">
                  {done}/{lessons.length}
                </span>
              </div>
              <Progress value={modPct} className="h-1.5 mt-2" />
            </CardHeader>
            <CardContent className="space-y-2">
              {lessons.map((l) => {
                const p = byId(l.id);
                return (
                  <Link
                    key={l.id}
                    to={`/academy/beginner/${l.id}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-white/5 p-3 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {p?.completed ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 mt-0.5 text-white/30 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm text-white truncate">{l.title}</div>
                        <div className="text-xs text-white/50 line-clamp-1">{l.summary}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {p?.quiz_best_score != null && (
                        <Badge variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37] text-[10px]">
                          Quiz {p.quiz_best_score}%
                        </Badge>
                      )}
                      <span className="flex items-center gap-1 text-xs text-white/40">
                        <Clock className="h-3 w-3" />
                        {l.minutes}m
                      </span>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {loading && <p className="text-xs text-white/40">Loading your progress…</p>}
    </div>
  );
}
