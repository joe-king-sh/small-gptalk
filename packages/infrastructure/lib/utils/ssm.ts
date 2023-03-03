import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export const getSSMParameter = (scope: Construct, key: string) => {
  return ssm.StringParameter.valueForStringParameter(scope, `${key}`);
};
