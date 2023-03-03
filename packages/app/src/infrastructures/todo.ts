import {
  GetTodosResponseResponse,
  ITodoRepository,
  Todo,
} from "../domains/todo";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  DynamoDBClient,
  PutItemCommand,
  PutItemInput,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/client-dynamodb";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { Logger } from "@aws-lambda-powertools/logger";

const logger = new Logger({
  serviceName: "small-gptalk-api",
  logLevel: "debug",
});

const tracer = new Tracer({
  serviceName: "small-gptalk-api",
});
tracer.captureAWSv3Client(new DynamoDBClient({}));

const client = tracer.captureAWSv3Client(
  new DynamoDBClient({ region: "ap-northeast-1" })
);

export class TodoRepository implements ITodoRepository {
  save: (options: { todo: Todo }) => Promise<void> = async (options) => {
    const item = marshall(options.todo);
    const input: PutItemInput = {
      TableName: "todos",
      Item: item,
    };
    const command = new PutItemCommand(input);
    logger.debug("command", { data: command });
    await client.send(command);
    return;
  };

  getTodos: () => Promise<GetTodosResponseResponse> = async () => {
    const input: ScanCommandInput = {
      TableName: "todos",
    };

    const command = new ScanCommand(input);
    const response = await client.send(command);
    logger.debug("response", { data: response });

    const todos = response.Items?.map((item) => unmarshall(item)) ?? [];

    logger.debug("todos", { data: todos });

    return {
      todos: todos as Todo[],
    };
  };
}
