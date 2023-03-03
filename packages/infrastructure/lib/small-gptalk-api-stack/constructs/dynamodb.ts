import { RemovalPolicy } from "aws-cdk-lib";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DynamoDB {
  smallGPTalk: Table;

  constructor(scope: Construct) {
    this.smallGPTalk = new Table(scope, "SmallGPTalk", {
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },

      tableName: "SmallGPTalk",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.smallGPTalk.addGlobalSecondaryIndex({
      indexName: "SK-sent-at-index",
      partitionKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SentAt",
        type: AttributeType.STRING,
      },
    });
  }
}
