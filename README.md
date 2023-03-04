# SmallGPTalk

<div
 align="center"
 style="width:55%;margin:auto"
>

![small-gptalk-image](/assets/small-gptalk-image.jpg)

</div>

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

AI English lesson powered by ChatGPT.

## SmallGPTalk とは？

- SmallGPTalk は、ChatGPT から派遣された AI 英語講師と LINE 上で SmallTalk(世間話) を楽しむためのアプリです。
- レッスンが始まると、講師はトピックを提示してくれます。好きなトピックを選んで講師と会話を楽しみましょう。
- レッスンを終わるときは「終わります」と伝えてください。レッスン中のあなたの会話についてフィードバックをくれますよ。

<div
 align="center"
 style="width:55%;margin:auto"
>

![small-gptalk-line-oa-qr](/assets/small-gptalk-qr.png)

<a href="https://liff.line.me/1645278921-kWRPP32q/?accountId=336nkkvd" target="_blank">LINE で友達になる</a>

</div>

## 開発者向け情報

SmallGPTalk は OSS です。

ChatGPT に与える[コンテキスト情報](https://github.com/joe-king-sh/small-gptalk/blob/b63e134f1ab5dc8258ba1275118ec3320d6e6d59/packages/app/src/lib/openaiApi.ts#L18-L73)を変更すると他言語の対応や、英会話以外のシチュエーションでも応用できます。

気になる方は是非リポジトリを Folk して遊んでみてください。

### アーキテクチャ

![small-gptalk-architecture](/assets/architecture.drawio.svg)

1. Messaging API の Webhook を API Gateway が受信
2. Lambda 以下を行う
   1. ChatGPT が英会話講師を演じるように命令
   2. レッスンルームの開始終了の管理
   3. ユーザーと ChatGPT のメッセージの橋渡し
   4. 会話履歴を DynamoDB で管理

### その他設計情報

- [レッスンの流れ](./docs/flow-chart.md)
- [DB 設計](./docs/db.md)

### コマンド

#### Install

```shell
$ npm ci
```

#### Build

```shell
$ npm run build
```

#### Deploy

事前に以下のパラメーターを SSM パラメーターストアに登録

```shell
$ aws ssm put-parameter --name "CHANNEL_ACCESS_TOKEN" --type "String" --value "<Messaging APIのチャネルアクセストークン>"
$ aws ssm put-parameter --name "CHANNEL_SECRET" --type "String" --value "<Messaging APIのチャネルシークレット>"
$ aws ssm put-parameter --name "OPENAI_API_KEY" --type "String" --value "<OpenAI APIのAPI Key>"
```

CDK デプロイ

```shell
$ npm run deploy
```
