import { Request, Response } from "express";
import logger from "../../utils/logger";
import { HttpError } from "../../utils/httpError";
import {
  createTicketAndAssignToUserService,
  deleteTicketService,
  getAllTicketsByProjectService,
  getTicketService,
  getTicketsService,
  updateTicketAssigneeService,
  updateTicketService,
  updateTicketStatusService,
} from "../../services/ticket/ticketService";
import {
  TicketListFilters,
  TicketPriority,
  TicketSortField,
  TicketType,
  TicketUpdatePayload,
} from "../../types/ticket";

// Sends exactly one error response: the HttpError's own status, or a 500.
const sendError = (res: Response, error: any, context: string) => {
  logger.error(`Error in ${context} controller`, { error: error?.message });

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  res.status(500).json({
    message: "Internal Server Error",
    error: error?.message,
  });
};

export const createTicket = async (req: Request, res: Response) => {
  const { userId, ticketData } = req.body;

  try {
    const result = await createTicketAndAssignToUserService(ticketData, userId);

    res.status(201).json({
      message: "Ticket created and assigned successfully.",
      data: result,
    });
  } catch (error: any) {
    sendError(res, error, "createTicket");
  }
};

// Get all tickets
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await getTicketsService();
    res.status(200).json({ data: tickets });
  } catch (error: any) {
    sendError(res, error, "getAllTickets");
  }
};

// Get a specific ticket by ID
export const getTicketById = async (req: Request, res: Response) => {
  const ticketId = Number(req.params.ticketId);

  if (isNaN(ticketId)) {
    res.status(400).json({ message: "Invalid ticket ID" });
    return;
  }

  try {
    const ticket = await getTicketService(ticketId);
    res.status(200).json({ data: ticket });
  } catch (error: any) {
    sendError(res, error, "getTicketById");
  }
};

// Edit a ticket's name, description, priority, type or due date
export const updateTicket = async (req: Request, res: Response) => {
  const ticketId = Number(req.params.ticketId);
  const { name, description, priority, type, due_date } = req.body;
  const changes: TicketUpdatePayload = {
    name,
    description,
    priority,
    type,
    due_date,
  };

  try {
    const ticket = await updateTicketService(ticketId, changes);
    res.status(200).json({
      message: `Ticket ${ticketId} updated successfully.`,
      data: ticket,
    });
  } catch (error: any) {
    sendError(res, error, "updateTicket");
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  const ticketId = Number(req.params.ticketId);

  try {
    const ticket = await deleteTicketService(ticketId);
    res.status(200).json({
      message: `Ticket ${ticketId} deleted successfully.`,
      data: ticket,
    });
  } catch (error: any) {
    sendError(res, error, "deleteTicket");
  }
};

export const updateTicketAssignee = async (req: Request, res: Response) => {
  const ticketId = Number(req.params.ticketId);
  const { userId } = req.body;

  if (isNaN(ticketId) || !userId) {
    res.status(400).json({ message: "Invalid ticket ID or missing userId" });
    return;
  }

  try {
    const result = await updateTicketAssigneeService(ticketId, userId);
    res.status(200).json({
      message: `Ticket ${ticketId} reassigned successfully.`,
      data: result,
    });
  } catch (error: any) {
    sendError(res, error, "updateTicketAssignee");
  }
};

// Tickets of one project, optionally filtered and sorted by query string
export const getTicketsByProject = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);

  if (isNaN(projectId)) {
    res.status(400).json({ message: "Invalid project ID" });
    return;
  }

  const { status, assignee, priority, type, q, sort, order } = req.query;
  const search = typeof q === "string" ? q.trim() : "";
  const filters: TicketListFilters = {
    status: status !== undefined ? Number(status) : undefined,
    assignee: assignee as string | undefined,
    priority: priority as TicketPriority | undefined,
    type: type as TicketType | undefined,
    q: search || undefined,
    sort: sort as TicketSortField | undefined,
    order: order as "asc" | "desc" | undefined,
  };

  try {
    const tickets = await getAllTicketsByProjectService(projectId, filters);
    res.status(200).json({ data: tickets });
  } catch (error: any) {
    sendError(res, error, "getTicketsByProject");
  }
};

export const updateTicketStatusController = async (
  req: Request,
  res: Response
) => {
  const ticketId = parseInt(req.params.ticketId);
  const { statusId } = req.body;

  if (isNaN(ticketId) || typeof statusId !== "number") {
    res.status(400).json({ message: "Invalid input" });
    return;
  }

  try {
    const updatedTicket = await updateTicketStatusService(ticketId, statusId);
    res.status(200).json(updatedTicket);
  } catch (error: any) {
    sendError(res, error, "updateTicketStatus");
  }
};
