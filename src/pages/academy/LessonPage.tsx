import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BEGINNER_LESSONS,
  getLesson,
  getLessonIndex,
  TOTAL_BEGINNER_LESSONS,
} from "@/data/academy/beginner";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  Lightbulb,
  ListChecks,
  Video,
} from "lucide-react";

export default function LessonPage() {
  const { lessonId = "" } = useParams();
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);
  const idx = getLessonIndex(lessonId);
  const { byId, save } = useAcademyProgress("beginner");
  const progress = byId(lessonId);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const score = useMemo(() => {
    if (!lesson) return 0;
    const right = lesson.quiz.filter((q, i) => answers[i] === q.answer).length;
    return Math.round((right / lesson.quiz.length) * 100);
  }, [answers, lesson]);

  if (!lesson) {
    return (
      <div className="p-6">
        <p className="text-white/60">Lesson not found.</p>
        <Link to="/academy/beginner" className="text-[#F4D03F] text-sm">
          Back to the beginner track
        </Link>
      </div>
    );
  }

  const prev = idx > 0 ? BEGINNER_LESSONS[idx - 1] : null;
  const next = idx < BEGINNER_LESSONS.length - 1 ? BEGINNER_LESSONS[idx + 1] : null;

  const submitQuiz = async () => {
    if (Object.keys(answers).length < lesson.quiz.length) {
      toast({ title: "Answer every question", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    setSaving(true);
    await save(lesson.id, { quiz_score: score, completed: score >= 70 || progress?.completed });
    setSaving(false);
    toast({
      title: score >= 70 ? "Passed" : "Not quite",
      description: `You scored ${score}%.${score >= 70 ? " Lesson marked complete." : " Review and try again."}`,
    });
  };

  const markComplete = async () => {
    setSaving(true);
    await save(lesson.id, { completed: true });
    setSaving(false);
    toast({ title: "Lesson complete" });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="space-y-3">
        <Link to="/academy/beginner" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-[#F4D03F]">
          <ArrowLeft className="h-3.5 w-3.5" /> Beginner track
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-widest">
            {lesson.module}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-white/40">
            <Clock className="h-3 w-3" /> {lesson.minutes} min
          </span>
          <span className="text-xs text-white/40 font-mono">
            Lesson {idx + 1} of {TOTAL_BEGINNER_LESSONS}
          </span>
          {progress?.completed && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/40 text-[10px]">Completed</Badge>
          )}
        </div>
        <h1 className="text-2xl font-display gold-text">{lesson.title}</h1>
        <p className="text-sm text-white/60">{lesson.summary}</p>
        <Progress value={((idx + 1) / TOTAL_BEGINNER_LESSONS) * 100} className="h-1" />
      </div>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardContent className="p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-[#D4AF37]/10 flex items-center justify-center">
            <Video className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="text-sm text-white">{lesson.videoTitle}</div>
            <div className="text-xs text-white/40">Video walkthrough — recording in production</div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {lesson.sections.map((s) => (
          <Card key={s.heading} className="bg-[#0a0a0a] border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#F4D03F]">{s.heading}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-white/75">{s.body}</p>
              {s.callout && (
                <div className="flex gap-2 rounded-md border border-[#D4AF37]/25 bg-[#D4AF37]/5 p-3">
                  <Info className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <p className="text-xs text-white/70">{s.callout}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#F4D03F] flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> Key takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {lesson.keyTakeaways.map((k) => (
              <li key={k} className="flex gap-2 text-sm text-white/75">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                {k}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#F4D03F] flex items-center gap-2">
            <ListChecks className="h-4 w-4" /> Practical task · {lesson.task.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-2 list-decimal list-inside">
            {lesson.task.steps.map((s) => (
              <li key={s} className="text-sm text-white/75">
                {s}
              </li>
            ))}
          </ol>
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <Checkbox
              checked={!!progress?.task_completed}
              onCheckedChange={(v) => save(lesson.id, { task_completed: !!v })}
            />
            I've completed this task
          </label>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#F4D03F]">Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {lesson.quiz.map((q, qi) => (
            <div key={q.q} className="space-y-2">
              <p className="text-sm text-white/85">
                {qi + 1}. {q.q}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const correct = submitted && oi === q.answer;
                  const wrong = submitted && selected && oi !== q.answer;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      className={`w-full text-left text-sm rounded-md border px-3 py-2 transition-colors ${
                        correct
                          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                          : wrong
                          ? "border-red-500/60 bg-red-500/10 text-red-300"
                          : selected
                          ? "border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#F4D03F]"
                          : "border-white/10 text-white/70 hover:border-[#D4AF37]/30"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && <p className="text-xs text-white/50">{q.explain}</p>}
            </div>
          ))}

          {!submitted ? (
            <Button onClick={submitQuiz} disabled={saving} className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">
              Submit answers
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-white/70">
                Score: <span className="font-mono text-[#F4D03F]">{score}%</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
              >
                Retry
              </Button>
              {!progress?.completed && (
                <Button size="sm" onClick={markComplete} disabled={saving}>
                  Mark lesson complete
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          disabled={!prev}
          onClick={() => prev && navigate(`/academy/beginner/${prev.id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button
          className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]"
          disabled={!next}
          onClick={() => next && navigate(`/academy/beginner/${next.id}`)}
        >
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
