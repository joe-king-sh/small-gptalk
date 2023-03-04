import * as line from "@line/bot-sdk";
import { logger } from "./logger";

export const unpackWebhookEvent = (webhookEvent: line.WebhookEvent) => {
  if (
    webhookEvent.type !== "message" ||
    webhookEvent.message.type !== "text" ||
    webhookEvent.source.type !== "user"
  ) {
    throw new Error("An invalid message was recieved.");
  }
  return {
    message: webhookEvent.message.text,
    replyToken: webhookEvent.replyToken,
    uid: webhookEvent.source.userId,
  };
};

export const sendMessagesToLINE = async (
  client: line.Client,
  replyToken: string,
  messages: string[]
) => {
  return client.replyMessage(
    replyToken,
    messages.map((message) => ({
      type: "text",
      text: message,
    }))
  );
};
