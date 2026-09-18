import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProgressRow = {
  lesson_id: string;
  completed: boolean;
  quiz_best_score: number | null;
  quiz_attempts: number;
  task_completed: boolean;
};

export function useAcademyProgress(track = "beginner") {
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("academy_progress")
      .select("lesson_id, completed, quiz_best_score, quiz_attempts, task_completed")
      .eq("track", track);
    setRows((data as ProgressRow[]) ?? []);
    setLoading(false);
  }, [track]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byId = (id: string) => rows.find((r) => r.lesson_id === id);

  const save = useCallback(
    async (lessonId: string, patch: Partial<ProgressRow> & { quiz_score?: number }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return;

      const existing = rows.find((r) => r.lesson_id === lessonId);
      const nextBest =
        patch.quiz_score != null
          ? Math.max(patch.quiz_score, existing?.quiz_best_score ?? 0)
          : existing?.quiz_best_score ?? null;

      const payload: Record<string, unknown> = {
        user_id: uid,
        track,
        lesson_id: lessonId,
        completed: patch.completed ?? existing?.completed ?? false,
        task_completed: patch.task_completed ?? existing?.task_completed ?? false,
        quiz_best_score: nextBest,
        quiz_attempts:
          patch.quiz_score != null ? (existing?.quiz_attempts ?? 0) + 1 : existing?.quiz_attempts ?? 0,
        last_viewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (patch.quiz_score != null) payload.quiz_score = patch.quiz_score;
      if (patch.completed) payload.completed_at = new Date().toISOString();

      await supabase.from("academy_progress").upsert(payload, { onConflict: "user_id,track,lesson_id" });
      await refresh();
    },
    [rows, refresh, track],
  );

  return { rows, byId, loading, save, refresh };
}
