import { Logger } from "@aws-lambda-powertools/logger";
export const logger = new Logger({
  serviceName: "small-gptalk-api",
  logLevel: "debug",
});
