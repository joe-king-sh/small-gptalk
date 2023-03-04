import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { logger } from "./logger";

import { Conversation, LessonRoom, LessonStatuses } from "./model";
import { isEmptyArray } from "./utils";

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
    IndexName: "uid-createdAt-index",
    KeyConditionExpression: "#sk = :skValue and #createAt >= :createdAtVal",
    FilterExpression: "#status = :statusval",
    ExpressionAttributeNames: {
      "#sk": "SK",
      "#status": "status",
      "#createAt": "created_at",
    },
    ExpressionAttributeValues: {
      ":skValue": { S: `USER#${uid}` },
      ":createdAtVal": { N: (Date.now() - 60 * 60 * 1000).toString() }, // (min * millisec * 1000)より前に作られたルームは検索対象外
      ":statusval": { S: LessonStatuses.inProggress },
    },
    ScanIndexForward: false,
    Limit: 1,
  };

  logger.debug("fetch active lesson room by uid options input", {
    data: input,
  });
  const response = await client.send(new QueryCommand(input));
  logger.debug("response from dynamodb", { data: response });

  if (!response.Items || isEmptyArray(response.Items)) return undefined;

  const rawItem = unmarshall(response.Items[0]);
  return {
    roomId: rawItem["PK"].replace("LESSON#", ""),
    uid: rawItem["SK"].replace("USER#", ""),
    status: rawItem["status"],
    createdAt: rawItem["created_at"],
  };
};

type PutLessonRoomOptions = {
  client: DynamoDBClient;
  lessonRoom: LessonRoom;
};

export const putLessonRoom: (
  options: PutLessonRoomOptions
) => Promise<void> = async ({ client, lessonRoom }) => {
  const { roomId, uid, status, createdAt } = lessonRoom;
  const command = new PutItemCommand({
    TableName: "SmallGPTalk",
    Item: marshall({
      PK: `LESSON#${roomId}`,
      SK: `USER#${uid}`,
      status,
      created_at: createdAt,
    }),
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
    KeyConditionExpression: "#pk = :pkValue and begins_with(#sk, :skValue)",
    ExpressionAttributeNames: {
      "#pk": "PK",
      "#sk": "SK",
    },
    ExpressionAttributeValues: {
      ":pkValue": { S: `LESSON#${roomId}` },
      ":skValue": { S: `SENT_AT#` },
    },
    ScanIndexForward: true,
  };
  logger.debug("fetch conversations by room id input", { data: input });
  const response = await client.send(new QueryCommand(input));
  logger.debug("response from dynamodb", { data: response });

  return (
    response.Items?.map((item) => {
      const rawItem = unmarshall(item);
      return {
        roomId: rawItem["PK"].replace("LESSON#", ""),
        sentAt: rawItem["SK"].replace("SENT_AT#", ""),
        sender: rawItem["sender"],
        message: rawItem["message"],
      };
    }) ?? []
  );
};

type PutConversationOptions = {
  client: DynamoDBClient;
  conversation: Conversation;
};

export const putConversation: (
  options: PutConversationOptions
) => Promise<void> = async ({ client, conversation }) => {
  const { roomId, sentAt, sender, message } = conversation;
  const command = new PutItemCommand({
    TableName: "SmallGPTalk",
    Item: marshall({
      PK: `LESSON#${roomId}`,
      SK: `SENT_AT#${sentAt.toString()}`,
      sender,
      message,
    }),
  });
  logger.debug("command", { data: command });
  await client.send(command);
  return;
};
