import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
  APIGatewayProxyResult,
} from "aws-lambda";
import { Tracer, captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import middy from "@middy/core";
import { injectLambdaContext } from "@aws-lambda-powertools/logger";
import * as line from "@line/bot-sdk";
import { getEnv } from "src/lib/env";
import { contexts, sendMessageToChatGPT } from "src/lib/openaiApi";

import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import { unpackWebhookEvent, sendMessagesToLINE } from "src/lib/line";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  fetchActiveLessonRoomByUid,
  fetchConversationsByRoomId,
  putConversation,
  putLessonRoom,
} from "src/lib/db";

import { v4 as uuidv4 } from "uuid";
import { Conversation, LessonRoom, LessonStatuses } from "src/lib/model";
import { SystemMessages } from "src/lib/message";
import { logger } from "src/lib/logger";

const tracer = new Tracer({
  serviceName: "small-gptalk-api",
});

tracer.captureAWSv3Client(new DynamoDBClient({}));
const ddbClient = tracer.captureAWSv3Client(
  new DynamoDBClient({ region: "ap-northeast-1" })
);

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

  const {
    message: messageFromUser,
    replyToken,
    uid,
  } = unpackWebhookEvent(webhookEvent);

  try {
    const lessonRoom = await fetchActiveLessonRoomByUid({
      client: ddbClient,
      uid,
    });
    if (!lessonRoom) {
      // 新規ルーム作成
      await createNewLessonRoom({ replyToken, uid });
      return;
    } else {
      // レッスン進行中
      const conversations = await fetchConversationsByRoomId({
        client: ddbClient,
        roomId: lessonRoom.roomId,
      });

      const messageFromChatGPT = await sendMessageToChatGPT({
        openaiClient,
        messages: [
          ...contexts.initialState,
          ...conversations.map((conversation) => ({
            role: conversation.sender,
            content: conversation.message,
          })),
          {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: messageFromUser,
          },
        ],
      });

      // 会話が終わったら終了処理をする
      if (
        await hasConversationEnded({
          conversations,
          messageFromUser,
          messageFromChatGPT,
        })
      ) {
        await endLesson({
          conversations,
          messageFromUser,
          messageFromChatGPT,
          replyToken,
          lessonRoom,
          uid,
        });
        return;
      } else {
        await sendMessagesToLINE(lineClient, replyToken, [messageFromChatGPT]);
        await putConversation({
          client: ddbClient,
          conversation: {
            roomId: lessonRoom.roomId,
            sentAt: Date.now(),
            sender: "user",
            message: messageFromUser,
          },
        });
        await putConversation({
          client: ddbClient,
          conversation: {
            roomId: lessonRoom.roomId,
            sentAt: Date.now(),
            sender: "assistant",
            message: messageFromChatGPT,
          },
        });
      }
    }
  } catch (error) {
    logger.error("handle error", { data: error });
    // sorry message
    await sendMessagesToLINE(lineClient, replyToken, [SystemMessages.sorry]);
    throw error;
  }
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
    logger.error("error", {
      data: err,
      message: "An unexpected error occoured",
    });

    return { statusCode: 500, body: "Internal Server Error" };
  }
};
export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));

const createNewLessonRoom = async ({
  replyToken,
  uid,
}: {
  replyToken: string;
  uid: string;
}) => {
  const roomId = uuidv4();

  const messageFromChatGPT = await sendMessageToChatGPT({
    openaiClient,
    messages: [...contexts.initialState],
  });

  await sendMessagesToLINE(lineClient, replyToken, [
    SystemMessages.welcomeToOurClass,
    messageFromChatGPT,
  ]);

  // ルームの作成とトーク履歴の保存は送信完了後とする
  await putLessonRoom({
    client: ddbClient,
    lessonRoom: {
      roomId,
      uid,
      status: LessonStatuses.inProggress,
      createdAt: Date.now(),
    },
  });
  await putConversation({
    client: ddbClient,
    conversation: {
      roomId,
      sentAt: Date.now(),
      sender: "assistant",
      message: messageFromChatGPT,
    },
  });
};

const endLesson = async ({
  conversations,
  messageFromUser,
  messageFromChatGPT,
  replyToken,
  lessonRoom,
  uid,
}: {
  conversations: Conversation[];
  messageFromUser: string;
  messageFromChatGPT: string;
  replyToken: string;
  lessonRoom: LessonRoom;
  uid: string;
}) => {
  // 終了処理
  const feedback = await sendMessageToChatGPT({
    openaiClient,
    messages: [
      ...contexts.initialState,
      ...conversations.map((conversation) => ({
        role: conversation.sender,
        content: conversation.message,
      })),
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: messageFromUser,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: messageFromChatGPT,
      },
      ...contexts.endOfTheLesson,
    ],
  });
  await sendMessagesToLINE(lineClient, replyToken, [
    messageFromChatGPT,
    feedback,
    SystemMessages.thanks,
  ]);

  await putConversation({
    client: ddbClient,
    conversation: {
      roomId: lessonRoom.roomId,
      sentAt: Date.now(),
      sender: "user",
      message: messageFromUser,
    },
  });
  await putConversation({
    client: ddbClient,
    conversation: {
      roomId: lessonRoom.roomId,
      sentAt: Date.now(),
      sender: "assistant",
      message: messageFromChatGPT,
    },
  });
  await putLessonRoom({
    client: ddbClient,
    lessonRoom: {
      roomId: lessonRoom.roomId,
      uid,
      status: LessonStatuses.finished, // ルームを閉じる
      createdAt: lessonRoom.createdAt,
    },
  });
};

const hasConversationEnded = async ({
  // conversations,
  messageFromUser,
}: // messageFromChatGPT,
{
  conversations: Conversation[];
  messageFromUser: string;
  // messageFromChatGPT: string;
}) => {
  return ["おわり", "終"].some((val) => messageFromUser.includes(val));
};
