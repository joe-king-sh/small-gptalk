# Small GPTalk

<div
 align="center"
 style="width:55%;margin:auto"
>

![small-gptalk-image](/assets/small-gptalk-image.jpg)

</div>

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

AI English lesson powered by ChatGPT.
[日本語版 README.md はこちらから](/README-ja.md)

## Abount Small GPTalk

- SmallGPTalk is an app for enjoying SmallTalk (casual conversation) with an AI English teacher dispatched from ChatGPT on LINE.
- When the lesson starts, the teacher will provide a topic. Choose your favorite topic and enjoy the conversation with the teacher.
- When you finish the lesson, please let them know by saying "I'm finished". They will give you feedback on your conversation during the lesson.

<div
 align="center"
 style="width:55%;margin:auto"
>

![small-gptalk-line-oa-qr](/assets/small-gptalk-qr.png)

<a href="https://liff.line.me/1645278921-kWRPP32q/?accountId=336nkkvd" target="_blank">Add as a friend on LINE</a>

</div>

## Developer Information

SmallGPTalk is open-source software.

If you change the [context information](https://github.com/joe-king-sh/small-gptalk/blob/b63e134f1ab5dc8258ba1275118ec3320d6e6d59/packages/app/src/lib/openaiApi.ts#L18-L73) provided to ChatGPT, it can be applied in situations other than English conversation or even in other languages. Please feel free to fork the repository and play around with it.

### Architecture

<div
 align="center"
 style="margin:auto"
>

![small-gptalk-architecture](/assets/architecture.drawio.svg)

</div>

1. API Gateway receives the Messaging API webhook
1. Perform the following in Lambda:
   1. Instruct ChatGPT to act as an English conversation teacher
   2. Manage the start and end of the lesson room
   3. Bridge messages between the user and ChatGPT
   4. Manage conversation history in DynamoDB

### Other Design Information

- [Lesson Flow](./docs/flow-chart.md)
- [DB Design](./docs/db.md)

### Commands

#### Install

```shell
$ npm ci
```

#### Build

```shell
$ npm run build
```

#### Deploy

Register the following parameters in SSM Parameter Store in advance:

```shell
$ aws ssm put-parameter --name "CHANNEL_ACCESS_TOKEN" --type "String" --value "<Messaging APIのチャネルアクセストークン>"
$ aws ssm put-parameter --name "CHANNEL_SECRET" --type "String" --value "<Messaging APIのチャネルシークレット>"
$ aws ssm put-parameter --name "OPENAI_API_KEY" --type "String" --value "<OpenAI APIのAPI Key>"
```

CDK Deploy:

```shell
$ npm run deploy
```

## Link

- [DevelopersIO: AI-powered English Learning with ChatGPT and LINE Bot - Introducing "Small GPTalk"](https://dev.classmethod.jp/articles/smalltalk-with-chatgpt-small-gptalk/)
