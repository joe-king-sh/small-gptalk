import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
  APIGatewayProxyResult,
} from "aws-lambda";
// import { TodoRepository } from "src/infrastructures/todo";
import { Tracer, captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import middy from "@middy/core";
import { Logger, injectLambdaContext } from "@aws-lambda-powertools/logger";

const tracer = new Tracer({
  serviceName: "small-gptalk-api",
});
const logger = new Logger({
  serviceName: "small-gptalk-api",
  logLevel: "debug",
});

const lambdaHandler = async (
  event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>,
  _context: any
): Promise<APIGatewayProxyResult> => {
  logger.info("event", { data: event });

  return {
    statusCode: 200,
    body: JSON.stringify(event),
  };
};
export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));
