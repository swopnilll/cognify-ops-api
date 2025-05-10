import logger from "../../utils/logger";
import { serviceBusClient } from "../azureServiceBusClient";

const queueName = "embedding-jobs"; 

interface EmbeddingJobPayload {
  projectId: number;
  taskId: number;
}

export const sendEmbeddingRequest = async (payload: EmbeddingJobPayload): Promise<void> => {
  try {
    const sender = serviceBusClient.createSender(queueName);
    await sender.sendMessages({
      body: payload,
    });
    logger.info(`Embedding request sent for project ${payload.projectId}, task ${payload.taskId}`);
  } catch (err) {
    logger.error("Error sending embedding request:", err);
    throw err;
  }
};