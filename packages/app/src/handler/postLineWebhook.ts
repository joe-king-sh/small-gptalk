import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
  APIGatewayProxyResult,
} from "aws-lambda";
import { Tracer, captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import middy from "@middy/core";
import { Logger, injectLambdaContext } from "@aws-lambda-powertools/logger";
import * as line from "@line/bot-sdk";
import { getEnv } from "src/lib/env";
import { sendMessageToChatGPT } from "src/lib/openaiApi";

import { Configuration, OpenAIApi } from "openai";
import {
  getMessageAndReplyTokenFromWebhookEvent,
  sendMessageToLINE,
} from "src/lib/line";

const tracer = new Tracer({
  serviceName: "small-gptalk-api",
});
const logger = new Logger({
  serviceName: "small-gptalk-api",
  logLevel: "debug",
});

const { CHANNEL_ACCESS_TOKEN, CHANNEL_SECRET, OPENAI_API_KEY } = getEnv();
const lineClient = new line.Client({
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET,
});

const openaiClient = new OpenAIApi(
  new Configuration({
    apiKey: OPENAI_API_KEY,
  })
);

const handle = async (webhookEvent: line.WebhookEvent) => {
  if (webhookEvent.type !== "message" || webhookEvent.message.type !== "text") {
    return undefined;
  }
  const { message, replyToken } =
    getMessageAndReplyTokenFromWebhookEvent(webhookEvent);
  const messageFromChatGPT = await sendMessageToChatGPT(openaiClient, message);
  return sendMessageToLINE(lineClient, replyToken, messageFromChatGPT);
};

const lambdaHandler = async (
  event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>,
  _context: any
): Promise<APIGatewayProxyResult> => {
  logger.info("event", { data: event });

  if (!event?.body) {
    logger.error("event", { data: event, message: "Invalid Request" });
    return {
      statusCode: 400,
      body: JSON.stringify(event),
    };
  }
  const webhookEvents = JSON.parse(event.body).events;

  try {
    await Promise.all(webhookEvents.map(handle));
    return { statusCode: 200, body: "OK" };
  } catch (err) {
    logger.error("event", {
      data: event,
      message: "An unexpected error occoured",
    });
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));
