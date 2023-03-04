import { ValueOf } from "type-fest";

export const LessonStatuses = {
  inProggress: "in_proggress",
  finished: "finished",
} as const;

export type LessonStatuType = ValueOf<typeof LessonStatuses>;

export type LessonRoom = {
  roomId: string;
  uid: string;
  status: LessonStatuType;
  createdAt: number;
};

export type Conversation = {
  roomId: string;
  sentAt: number;
  sender: "user" | "assistant";
  message: string;
};
