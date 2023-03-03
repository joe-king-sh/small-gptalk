import { Construct } from "constructs";
import { MyNodejsFunction } from "../../components/nodejsFunction";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { getSSMParameter } from "../../utils/ssm";

type LambdaFunctionsProps = {
  ddbTable: Table;
};

export type ILambdaFunctionsByName = { [key in string]: NodejsFunction };
export class LambdaFunctions {
  lambdaFunctions: ILambdaFunctionsByName = {};

  constructor(readonly scope: Construct, readonly props: LambdaFunctionsProps) {
    const fileNames: string[] = ["postLineWebhook"];

    fileNames.forEach((fileName: string) => {
      const nodeJsFunction = new MyNodejsFunction(scope, fileName, {
        handlerFileName: fileName,
        envronmentVariables: {
          CHANNEL_ACCESS_TOKEN: getSSMParameter(scope, "CHANNEL_ACCESS_TOKEN"),
          CHANNEL_SECRET: getSSMParameter(scope, "CHANNEL_SECRET"),
          OPENAI_API_KEY: getSSMParameter(scope, "OPENAI_API_KEY"),
        },
      }).nodeJsFunction;
      props.ddbTable.grantFullAccess(nodeJsFunction);
      this.lambdaFunctions[fileName] = nodeJsFunction;
    });
  }
}
