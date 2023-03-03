import { Construct } from "constructs";
import { aws_lambda_nodejs, aws_lambda, Duration } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export interface MyNodejsFunctionProps {
  handlerFileName: string;
  envronmentVariables: { [key in string]: string };
}

export class MyNodejsFunction extends Construct {
  public readonly nodeJsFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: MyNodejsFunctionProps) {
    super(scope, id);

    const { handlerFileName, envronmentVariables } = props;

    this.nodeJsFunction = new aws_lambda_nodejs.NodejsFunction(
      this,
      "NodejsLambdaFunction",
      {
        entry: `../app/src/handler/${handlerFileName}.ts`,
        bundling: {
          forceDockerBundling: false,
        },
        tracing: aws_lambda.Tracing.ACTIVE,
        environment: { ...envronmentVariables },
        timeout: Duration.seconds(29),
      }
    );
  }
}
