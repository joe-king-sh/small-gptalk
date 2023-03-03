# DB Design

## Access Pattern

1. fetchActiveLessonRoomByUid
   1. LINE ユーザーからのリクエストに含まれる UID から、進行中のレッスンルーム ID を 1 件取得する
1. putLessonRoom
   1. 新しいレッスンルームを 1 件作成する
1. fetchConversationsByLessonRoomId
   1. レッスンルーム ID をもとに会話履歴を全件取得する
   2. ソート順は、送信日の降順
      1 . putLessonRoom
   3. レッスンルーム ID をもとにレッスンルームを「終了」に変更する

## ER Diagrams

```mermaid
erDiagram
  user {
    string uid PK
  }

  lesson_room {
    uuid room_id PK "検索条件"
    string uid FK "検索条件"
    string status
    timestamp created_at
  }
  conversation {
    uuid room_id "検索条件"
    timestamp sent_at "ソート条件"
    string speaker "検索条件"
    string message
  }

  user ||--}o lesson_room: "attend multiple lessons"

  lesson_room ||--o{ conversation: "have conversations"
```

## DynamoDB Schema

### SmallGPTalk Table

|                            | PrimaryKey               |                                       | Attributes         |                           |
| -------------------------- | ------------------------ | ------------------------------------- | ------------------ | ------------------------- | --- |
| Record Type                | PK                       | SK                                    |
| **lesson_room<br>(type)**  | room_id<br>[LESSON#uuid] | uid<br>[USER#string]                  | status<br>[string] | created_at<br>[timestamp] |
| lesson_room<br>(example)   | LESSON#fdba3e0a-9a...    | USER#4fab7256-ac..                    | IN_PROGGRESS       | 2023-03-10T13:50:40+09:00 |
| **conversation<br>(type)** | room_id<br>[LESSON#uuid] | sent_at<br>[SENT_AT#timestamp]<br>    | sender<br>[string] | message<br>[string]       |
| conversation<br>(example)  | LESSON#fdba3e0a-9a...    | SENT_AT#2023-03-10T13:50:40+09:00<br> | user               | Hello!!!                  |     |

### Indecies

#### Primary Key

| Keys          | Attribute Name |
| ------------- | -------------- |
| Partition Key | PK             |
| Sort Key      | SK             |

#### GSI1

For the fetchLessonRoomByUid usecase.
| Keys | Attribute Name |
| ----------------- | -------------- |
| Partition Key | SK<br>(USERS#{string}) |
| Sort Key | created_at |
