import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { ILambdaFunctionsByName } from "./lambdaFunctions";

type ApiGatewayProps = {
  lambdaFunctions: ILambdaFunctionsByName;
};
export class ApiGateway {
  readonly restApi: RestApi;

  constructor(scope: Construct, { lambdaFunctions }: ApiGatewayProps) {
    this.restApi = new apigateway.RestApi(scope, "SmallGPTalkApi", {
      deployOptions: {
        tracingEnabled: true,
      },
    });
    this.restApi.root.addMethod("any");

    const lineResource = this.restApi.root.addResource("line");

    const lineWebhookResource = lineResource.addResource("webhook");
    lineWebhookResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaFunctions.postLineWebhook)
    );

    const lineMessagesResource = lineResource.addResource("messages");
    const lineMessagesReplyResource = lineMessagesResource.addResource("reply");
    lineMessagesReplyResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaFunctions.postLineMessagesReply)
    );
  }
}
