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
  createdAt: Date;
};

export type Conversation = {
  roomId: string;
  sent_at: string;
  sender: "user" | "chat_gpt";
  message: string;
};
