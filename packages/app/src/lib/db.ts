import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import { Logger } from "@aws-lambda-powertools/logger";
import { Conversation, LessonRoom, LessonStatuses } from "./model";
import { isEmptyArray } from "./utils";

const logger = new Logger({
  serviceName: "small-gptalk-api",
  logLevel: "debug",
});

type FetchActiveLessonRoomByUidOptions = {
  client: DynamoDBClient;
  uid: string;
};
type FetchActiveLessonRoomByUidOutput = LessonRoom | undefined;

export const fetchActiveLessonRoomByUid: (
  options: FetchActiveLessonRoomByUidOptions
) => Promise<FetchActiveLessonRoomByUidOutput> = async ({ client, uid }) => {
  const input: QueryCommandInput = {
    TableName: "SmallGPTalk",
    IndexName: "SK-sent-at-index",
    KeyConditionExpression: "#sk = :skval and #status = :statusval",
    ExpressionAttributeNames: {
      "#sk": "SK",
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":skval": { S: `USER#${uid}` },
      ":statusval": { S: LessonStatuses.inProggress },
    },
    ScanIndexForward: false,
    Limit: 1,
  };
  logger.debug("input", { data: input });

  const response = await client.send(new QueryCommand(input));
  logger.debug("response", { data: response });

  return !response.Items || isEmptyArray(response.Items)
    ? undefined
    : (unmarshall(response.Items[0]) as LessonRoom);
};

type PutLessonRoomOptions = {
  client: DynamoDBClient;
  lessonRoom: LessonRoom;
};

export const putLessonRoom: (
  options: PutLessonRoomOptions
) => Promise<void> = async ({ client, lessonRoom }) => {
  const command = new PutItemCommand({
    TableName: "SmallGPTalk",
    Item: marshall(lessonRoom),
  });
  logger.debug("command", { data: command });
  await client.send(command);
  return;
};

type FetchConversationsByRoomIdOptions = {
  client: DynamoDBClient;
  roomId: LessonRoom["roomId"];
};
type FetchConversationsByRoomIdOutput = Conversation[];

export const fetchConversationsByRoomId: (
  options: FetchConversationsByRoomIdOptions
) => Promise<FetchConversationsByRoomIdOutput> = async ({ client, roomId }) => {
  const input: QueryCommandInput = {
    TableName: "SmallGPTalk",
    KeyConditionExpression: "#pk = :pkval",
    ExpressionAttributeNames: {
      "#pk": "PK",
    },
    ExpressionAttributeValues: {
      ":pkval": { S: `LESSON#${roomId}` },
    },
    ScanIndexForward: false,
  };
  logger.debug("input", { data: input });

  const response = await client.send(new QueryCommand(input));
  logger.debug("response", { data: response });

  return response.Items?.map((item) => unmarshall(item) as Conversation) ?? [];
};
