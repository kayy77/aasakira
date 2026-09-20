import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BEGINNER_LESSONS, BEGINNER_MODULES, TOTAL_BEGINNER_LESSONS } from "@/data/academy/beginner";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  Flame,
  GraduationCap,
  ListChecks,
  Lock,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";

function computeStreak(dates: string[]) {
  const days = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  // allow today or yesterday to start the streak
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function AcademyHome() {
  const { byId, rows } = useAcademyProgress("beginner");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("academy_progress").select("last_viewed_at");
      setStreak(computeStreak((data ?? []).map((d: any) => d.last_viewed_at).filter(Boolean)));
    })();
  }, [rows.length]);

  const completed = rows.filter((r) => r.completed).length;
  const tasks = rows.filter((r) => r.task_completed).length;
  const quizzes = rows.filter((r) => (r.quiz_best_score ?? 0) >= 70).length;
  const pct = Math.round((completed / TOTAL_BEGINNER_LESSONS) * 100);
  const nextLesson = BEGINNER_LESSONS.find((l) => !byId(l.id)?.completed) ?? BEGINNER_LESSONS[0];
  const finished = completed === TOTAL_BEGINNER_LESSONS;

  const tracks = [
    {
      name: "Beginner",
      desc: "Foundations, market mechanics, risk, price and discipline.",
      lessons: TOTAL_BEGINNER_LESSONS,
      href: "/academy/beginner",
      ready: true,
      pct,
    },
    { name: "Intermediate", desc: "Structure, liquidity, sessions and multi-timeframe execution.", lessons: 20, href: "#", ready: false, pct: 0 },
    { name: "Advanced", desc: "Institutional concepts, order flow and portfolio-level risk.", lessons: 20, href: "#", ready: false, pct: 0 },
    { name: "Elite", desc: "Prop firm scaling, psychology under size, and performance systems.", lessons: 20, href: "#", ready: false, pct: 0 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display gold-text flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#D4AF37]" /> Academy
          </h1>
          <p className="text-sm text-white/60">
            Structured curriculum from first principles to funded-account execution.
          </p>
        </div>
        <Link to={`/academy/beginner/${nextLesson.id}`}>
          <Button className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">
            <PlayCircle className="h-4 w-4 mr-2" />
            {completed === 0 ? "Start learning" : finished ? "Review lessons" : "Continue"}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Target className="h-4 w-4" />} label="Lessons complete" value={`${completed}/${TOTAL_BEGINNER_LESSONS}`} />
        <Stat icon={<ListChecks className="h-4 w-4" />} label="Tasks done" value={String(tasks)} />
        <Stat icon={<Award className="h-4 w-4" />} label="Quizzes passed" value={String(quizzes)} />
        <Stat icon={<Flame className="h-4 w-4" />} label="Day streak" value={String(streak)} />
      </div>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#F4D03F] text-base">Beginner track progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Overall</span>
            <span className="font-mono text-[#F4D03F]">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="grid sm:grid-cols-5 gap-3 pt-1">
            {BEGINNER_MODULES.map((m) => {
              const ls = BEGINNER_LESSONS.filter((l) => l.module === m);
              const done = ls.filter((l) => byId(l.id)?.completed).length;
              return (
                <div key={m} className="space-y-1.5">
                  <div className="text-[11px] text-white/60 truncate">{m}</div>
                  <Progress value={(done / ls.length) * 100} className="h-1" />
                  <div className="text-[10px] text-white/40 font-mono">
                    {done}/{ls.length}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {finished && (
        <Card className="bg-gradient-to-r from-[#D4AF37]/15 to-transparent border-[#D4AF37]/40">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-[#F4D03F]" />
              <div>
                <div className="text-white font-medium">Beginner track complete</div>
                <div className="text-xs text-white/60">Your certificate of completion is ready.</div>
              </div>
            </div>
            <Link to="/academy/certificate/beginner">
              <Button className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">View certificate</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {tracks.map((t) => (
          <Card key={t.name} className="bg-[#0a0a0a] border-[#D4AF37]/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base text-[#F4D03F] flex items-center gap-2">
                  {t.ready ? <GraduationCap className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  {t.name}
                </CardTitle>
                {t.ready ? (
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-[10px]">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-white/15 text-white/45 text-[10px]">
                    <Lock className="h-3 w-3 mr-1" /> In production
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/60">{t.desc}</p>
              <div className="text-xs text-white/40 font-mono">{t.lessons} lessons</div>
              {t.ready && <Progress value={t.pct} className="h-1" />}
              {t.ready ? (
                <Link to={t.href}>
                  <Button variant="outline" size="sm" className="border-[#D4AF37]/40 text-[#F4D03F]">
                    Open track
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Coming soon
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
          <span className="text-[#D4AF37]">{icon}</span>
          {label}
        </div>
        <div className="text-2xl font-display text-[#F4D03F] mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}
