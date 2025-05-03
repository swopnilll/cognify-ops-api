import { Status } from "@prisma/client";
import { getStatus } from "../../repositories/status/statusRepository";

export const fetchStatus = async (): Promise<Status[]> => {
  try {
    const status = await getStatus();

    return status;
  } catch (error) {
    console.error('Status Service Error:', error);
    throw error;
  }
};