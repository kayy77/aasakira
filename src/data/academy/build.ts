import type { Lesson } from "./beginner";

type S = [heading: string, body: string, callout?: string];
type Q = [q: string, options: string[], answer: number, explain: string];

/** Compact lesson builder used by the Intermediate, Advanced and Elite tracks. */
export function mk(
  id: string,
  module: string,
  title: string,
  summary: string,
  minutes: number,
  sections: S[],
  keyTakeaways: string[],
  taskTitle: string,
  steps: string[],
  quiz: Q[],
): Lesson {
  return {
    id,
    module,
    title,
    summary,
    minutes,
    videoTitle: `${title} — walkthrough`,
    sections: sections.map(([heading, body, callout]) => ({ heading, body, callout })),
    keyTakeaways,
    task: { title: taskTitle, steps },
    quiz: quiz.map(([q, options, answer, explain]) => ({ q, options, answer, explain })),
  };
}
