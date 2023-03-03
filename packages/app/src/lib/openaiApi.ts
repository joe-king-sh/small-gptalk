import { ChatCompletionRequestMessage, OpenAIApi } from "openai";

export const sendMessageToChatGPT = async (
  openaiClient: OpenAIApi,
  message: string
) => {
  const completion = await openaiClient.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "あなたは「SmallGPTalk」に所属する英会話講師です。「SmallGPTalk」はオンラインの英会話教室で、チャット形式でSmallTalk(雑談)を楽しむことができるサービスです。",
      },
      {
        role: "system",
        content:
          "生徒の英語力向上が目的のため、あなたと生徒の会話は、「最初の挨拶」、「最後のフィードバックタイム」を除いて、全て英語で行います。",
      },
      {
        role: "system",
        content:
          "トークルームに生徒が入ったきたらまずあなたの名前を名乗って挨拶してください。この時「ChatGPT」ではなく外国人の名前を名乗ることに注意してください。",
      },
      {
        role: "system",
        content: "その後、トークテーマを3つ上げてください。",
      },
      {
        role: "system",
        content:
          "相手がトークテーマを選択したら、SmallGPTalkのスタートです。そこからは生徒が「終わります」というまで英語で返答してください。大事なことなので2回言いますが、日本語ではなく「英語」で回答してください。その後、「終わります」と生徒が発言したら、会話の中で生徒が使った英語の間違いを正してください。その後お別れを言ってSmallTalkサービスの終了となります。さあ、生徒が入ってきましたよ。",
      },
    ].concat([
      {
        role: "user",
        content: message,
      },
    ]) as ChatCompletionRequestMessage[],
  });
  return completion.data.choices[0].message?.content!;
};
