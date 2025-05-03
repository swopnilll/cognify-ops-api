import { Request, Response } from "express";
import logger from "../../utils/logger";
import { HttpError } from "../../utils/httpError";
import {
  createTicketAndAssignToUserService,
  getAllTicketsByProjectService,
  getTicketService,
  getTicketsService,
  updateTicketAssigneeService,
} from "../../services/ticket/ticketService";

export const createTicket = async (req: Request, res: Response) => {
  const { userId, ticketData } = req.body;

  try {
    const result = await createTicketAndAssignToUserService(ticketData, userId);

    res.status(201).json({
      message: "Ticket created and assigned successfully.",
      data: result,
    });
  } catch (error: any) {
    logger.error("Error in createTicket controller", { error: error.message });

    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all tickets
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await getTicketsService();
    res.status(200).json({ data: tickets });
  } catch (error: any) {
    logger.error("Error in getAllTickets controller", { error: error.message });
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get a specific ticket by ID
export const getTicketById = async (req: Request, res: Response) => {
  const ticketId = Number(req.params.ticketId);

  if (isNaN(ticketId)) {
    res.status(400).json({ message: "Invalid ticket ID" });
  }

  try {
    const ticket = await getTicketService(ticketId);
    res.status(200).json({ data: ticket });
  } catch (error: any) {
    logger.error("Error in getTicketById controller", { error: error.message });

    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateTicketAssignee = async (req: Request, res: Response) => {
  const ticketId = Number(req.params.ticketId);
  const { userId } = req.body;

  if (isNaN(ticketId) || !userId) {
    res.status(400).json({ message: "Invalid ticket ID or missing userId" });
  }

  try {
    const result = await updateTicketAssigneeService(ticketId, userId);
    res.status(200).json({
      message: `Ticket ${ticketId} reassigned successfully.`,
      data: result,
    });
  } catch (error: any) {
    logger.error("Error in updateTicketAssignee controller", {
      error: error.message,
    });

    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getTicketsByProject = async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
  
    if (isNaN(projectId)) {
       res.status(400).json({ message: "Invalid project ID" });
    }
  
    try {
      const tickets = await getAllTicketsByProjectService(projectId);
      res.status(200).json({ data: tickets });
    } catch (error: any) {
      logger.error("Error in getTicketsByProject controller:", { error: error.message });
      res.status(500).json({ message: "Internal server error" });
    }
  };
  