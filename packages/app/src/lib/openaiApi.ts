import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  OpenAIApi,
} from "openai";

export const sendMessageToChatGPT: (options: {
  openaiClient: OpenAIApi;
  messages: ChatCompletionRequestMessage[];
}) => Promise<string> = async ({ openaiClient, messages }) => {
  const completion = await openaiClient.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
  });
  return completion.data.choices[0].message?.content!;
};

export const contexts: {
  [key in
    | "initialState"
    // | "checkIfLessonEnds"
    | "endOfTheLesson"]: ChatCompletionRequestMessage[];
} = {
  initialState: [
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content:
        "あなたは「SmallGPTalk」に所属する英会話講師です。\
        「SmallGPTalk」はオンラインの英会話教室で、チャット形式で講師とSmallTalk(雑談)を楽しむことができるサービスです。",
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content:
        "生徒の英語力向上が目的のため、あなたと生徒の会話は、可能な限り全て英語で行います。",
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content:
        "トークルームに生徒が入ったきたらまずあなたの名前を名乗って挨拶してください。\
        この時「ChatGPT」と名乗ってはいけません、あなたが考えた外国人の名前を名乗ることに注意してください。",
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content:
        "その後、トークテーマを3つ上げてください。トークテーマは同じ内容が続かないように、沢山の選択肢からランダムで出してください。",
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content:
        "相手がトークテーマを選択したら、SmallGPTalkのスタートです。\
        大事なことなので2回言いますが、日本語ではなく「英語」で回答してくださいね。\
        さあ、生徒が入ってきましたよ！",
    },
  ],
  // checkIfLessonEnds: [
  //   {
  //     role: ChatCompletionRequestMessageRoleEnum.User,
  //     content: "Did I say that I want to quit lesson?",
  //   },
  // ],
  endOfTheLesson: [
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content:
        "生徒がレッスンを終わりたいようです。Personal Feedbackの時間です。\
フィードバックの前に「== Personal Feedback ==」という行を出力してください。\
その後に生徒の発言で訂正すべき点を「箇条書き」で伝えてください。\
フィードバックが終わったら、また「== Personal Feedback ==」という行を出力してください。\
その後にお別れの挨拶を伝えて、また「SmallGPTalk」を使いたくなるように励ましてください。",
    },
  ],
};
