require('dotenv').config();

import { ServiceBusClient, ServiceBusAdministrationClient } from "@azure/service-bus";
import logger from "../utils/logger";

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("Missing SERVICE_BUS_CONNECTION_STRING in environment variables.");
}

export const serviceBusClient = new ServiceBusClient(connectionString);

const adminClient = new ServiceBusAdministrationClient(connectionString);

// Optional: check the existence of a known queue to verify connection
const testQueueName = "embedding-jobs";

(async () => {
  try {
    const queueProps = await adminClient.getQueueRuntimeProperties(testQueueName);
    logger.info(`Azure Service Bus connected. Queue '${testQueueName}' has ${queueProps.activeMessageCount} active messages.`);
  } catch (error: any) {
    logger.error("Failed to connect to Azure Service Bus or queue not found:", error.message);
  }
})();
