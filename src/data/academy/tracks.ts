import type { Lesson } from "./beginner";
import { BEGINNER_LESSONS, BEGINNER_MODULES } from "./beginner";
import { INTERMEDIATE_LESSONS, INTERMEDIATE_MODULES } from "./intermediate";
import { ADVANCED_LESSONS, ADVANCED_MODULES } from "./advanced";
import { ELITE_LESSONS, ELITE_MODULES } from "./elite";

export type TrackId = "beginner" | "intermediate" | "advanced" | "elite";

export type Track = {
  id: TrackId;
  name: string;
  desc: string;
  modules: readonly string[];
  lessons: Lesson[];
};

export const TRACKS: Track[] = [
  { id: "beginner", name: "Beginner", desc: "Foundations, market mechanics, risk, price and discipline.", modules: BEGINNER_MODULES, lessons: BEGINNER_LESSONS },
  { id: "intermediate", name: "Intermediate", desc: "Structure, liquidity, sessions and multi-timeframe execution.", modules: INTERMEDIATE_MODULES, lessons: INTERMEDIATE_LESSONS },
  { id: "advanced", name: "Advanced", desc: "Order flow, auction theory, intermarket and portfolio-level risk.", modules: ADVANCED_MODULES, lessons: ADVANCED_LESSONS },
  { id: "elite", name: "Elite", desc: "Prop firm scaling, psychology under size and performance systems.", modules: ELITE_MODULES, lessons: ELITE_LESSONS },
];

export function getTrack(id?: string) {
  return TRACKS.find((t) => t.id === id);
}
