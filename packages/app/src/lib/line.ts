import * as line from "@line/bot-sdk";

export const getMessageAndReplyTokenFromWebhookEvent = (
  webhookEvent: line.WebhookEvent
) => {
  if (webhookEvent.type !== "message" || webhookEvent.message.type !== "text") {
    throw new Error("An invalid message was recieved.");
  }
  return {
    message: webhookEvent.message.text,
    replyToken: webhookEvent.replyToken,
  };
};

export const sendMessageToLINE = async (
  client: line.Client,
  replyToken: string,
  message: string
) => {
  return client.replyMessage(replyToken, {
    type: "text",
    text: message,
  });
};
