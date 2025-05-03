import prisma from "../../db/prismaClient";
import logger from "../../utils/logger";

export const getStatus = async () => {
  try {
    const count = await prisma.status.count();
    logger.info(count);
    const status = await prisma.status.findMany(); 
    logger.info(status)

    return status;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw new Error("Could not fetch roles");
  }
};
