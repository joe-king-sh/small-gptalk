import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
  APIGatewayProxyResult,
} from "aws-lambda";
import { Tracer, captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import middy from "@middy/core";
import { Logger, injectLambdaContext } from "@aws-lambda-powertools/logger";
import * as line from "@line/bot-sdk";

const tracer = new Tracer({
  serviceName: "small-gptalk-api",
});
const logger = new Logger({
  serviceName: "small-gptalk-api",
  logLevel: "debug",
});

const config: line.ClientConfig = {
  channelAccessToken: process.env["CHANNEL_ACCESS_TOKEN"]!,
  channelSecret: process.env["CHANNEL_SECRET"]!,
};

const client = new line.Client(config);

function echoResponse(
  event: line.WebhookEvent
): Promise<line.MessageAPIResponseBase | null> {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const echo: line.TextMessage = { type: "text", text: event.message.text };
  return client.replyMessage(event.replyToken, echo);
}

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
  const body = JSON.parse(event.body);
  try {
    await Promise.all(body.events.map(echoResponse));
    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));
