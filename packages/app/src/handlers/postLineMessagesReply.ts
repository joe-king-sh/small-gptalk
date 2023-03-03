import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
  APIGatewayProxyResult,
} from "aws-lambda";
// import { TodoRepository } from "src/infrastructures/todo";
import { v4 as uuidv4 } from "uuid";
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
  // if (event.body == null) throw new Error("body is null");
  // const postTodoInput = JSON.parse(event.body);

  // const todo = {
  //   todoId: uuidv4(),
  //   ...postTodoInput,
  // };

  return {
    statusCode: 201,
    body: JSON.stringify("called"),
  };
};

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));
