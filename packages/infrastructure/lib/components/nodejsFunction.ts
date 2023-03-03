import { Construct } from "constructs";
import { aws_lambda_nodejs, aws_lambda } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export interface MyNodejsFunctionProps {
  handlerFileName: string;
}

export class MyNodejsFunction extends Construct {
  public readonly nodeJsFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: MyNodejsFunctionProps) {
    super(scope, id);

    this.nodeJsFunction = new aws_lambda_nodejs.NodejsFunction(
      this,
      "NodejsLambdaFunction",
      {
        entry: `../app/src/handlers/${props.handlerFileName}.ts`,
        bundling: {
          forceDockerBundling: false,
        },
        tracing: aws_lambda.Tracing.ACTIVE,
      }
    );
  }
}
