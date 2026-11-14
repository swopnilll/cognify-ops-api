require('dotenv').config();

import { SQSClient } from "@aws-sdk/client-sqs";

// Credentials come from the default AWS chain: the EC2 instance role in
// production, or AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY locally.
// SQS_ENDPOINT is only set for local development (ElasticMQ).
export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || "ap-southeast-2",
  ...(process.env.SQS_ENDPOINT ? { endpoint: process.env.SQS_ENDPOINT } : {}),
});

export const getQueueUrl = (): string => {
  const queueUrl = process.env.SQS_QUEUE_URL;
  if (!queueUrl) {
    throw new Error("Missing SQS_QUEUE_URL in environment variables.");
  }
  return queueUrl;
};
