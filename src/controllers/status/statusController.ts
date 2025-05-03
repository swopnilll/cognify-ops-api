import { Request, Response } from "express";
import { fetchStatus } from "../../services/status/statusService";


export const getStatusController = async (req: Request, res: Response) => {
  try {
    const status = await fetchStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: "Failed to get status" });
  }
};
