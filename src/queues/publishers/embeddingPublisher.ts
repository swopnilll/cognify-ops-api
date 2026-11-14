import { SendMessageCommand } from "@aws-sdk/client-sqs";
import logger from "../../utils/logger";
import { getQueueUrl, sqsClient } from "../sqsClient";

interface EmbeddingJobPayload {
  projectId: number;
  taskId: number | null;
}

export const sendEmbeddingRequest = async (payload: EmbeddingJobPayload): Promise<void> => {
  try {
    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: getQueueUrl(),
        MessageBody: JSON.stringify(payload),
      })
    );
    logger.info(`Embedding request sent for project ${payload.projectId}, task ${payload.taskId}`);
  } catch (err) {
    logger.error("Error sending embedding request:", err);
    throw err;
  }
};
