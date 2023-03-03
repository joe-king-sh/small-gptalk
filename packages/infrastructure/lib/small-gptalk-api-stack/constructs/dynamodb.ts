import { RemovalPolicy } from "aws-cdk-lib";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DynamoDB {
  smallTalkHistoryTable: Table;

  constructor(scope: Construct) {
    this.smallTalkHistoryTable = new Table(scope, "SmallTalkHistory", {
      partitionKey: {
        name: "Uid",
        type: AttributeType.STRING,
      },
      tableName: "SmallTalkHistory",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }
}
