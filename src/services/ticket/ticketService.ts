import { sendEmbeddingRequest } from "../../queues/publishers/embeddingPublisher";
import {
  createTicketAndAssignToUserRepo,
  getAllTicketsByProjectRepo,
  getTicketRepo,
  getTicketsRepo,
  updateTicketAssigneeRepo,
  updateTicketStatusRepo,
} from "../../repositories/ticket/ticketRepository";
import { TicketPayload } from "../../types/ticket";
import { HttpError } from "../../utils/httpError";
import logger from "../../utils/logger";

export const createTicketAndAssignToUserService = async (
  ticketData: TicketPayload,
  userId: string
) => {
  try {
    // Call the repository to create the ticket and assign to the user
    const result = await createTicketAndAssignToUserRepo(ticketData, userId);

    // Log success message
    logger.info(
      `Ticket ${result.ticket.ticket_id} created and assigned to user ${userId}`
    );

    await sendEmbeddingRequest({
          projectId: ticketData.project_id,
          taskId: result.ticket.ticket_id,
        });

    return result; // Return result with ticket and assignment
  } catch (error: any) {
    logger.error("Error in service layer:", { error: error.message });
    throw new HttpError(500, "Internal Server Error");
  }
};

export const getTicketsService = async () => {
  try {
    const tickets = await getTicketsRepo();
    return tickets;
  } catch (error: any) {
    logger.error("Error in service layer (get all):", { error: error.message });
    throw new HttpError(500, "Internal Server Error");
  }
};

export const getTicketService = async (ticketId: number) => {
  try {
    const ticket = await getTicketRepo(ticketId);
    if (!ticket) {
      throw new HttpError(404, `Ticket with ID ${ticketId} not found`);
    }
    return ticket;
  } catch (error: any) {
    logger.error("Error in service layer (get one):", { error: error.message });
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, "Internal Server Error");
  }
};

export const updateTicketAssigneeService = async (
  ticketId: number,
  userId: string
) => {
  try {
    const updated = await updateTicketAssigneeRepo(ticketId, userId);
    logger.info(`Ticket ${ticketId} reassigned to user ${userId}`);
    return updated;
  } catch (error: any) {
    logger.error("Error in service layer (update assignee):", {
      error: error.message,
    });
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, "Internal Server Error");
  }
};

export const getAllTicketsByProjectService = async (projectId: number) => {
  try {
    return await getAllTicketsByProjectRepo(projectId);
  } catch (error) {
    logger.error("Error in service layer (get one):", { error: error.message });
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, "Internal Server Error");
  }
};

export const updateTicketStatusService = async (
  ticketId: number,
  statusId: number
) => {
  try {
    // Attempt to update the ticket status
    const updatedTicket = await updateTicketStatusRepo(ticketId, statusId);
    return updatedTicket;
  } catch (error: any) {
    // Log the error or re-throw it based on your use case
    console.error("Error in updateTicketStatusService:", error);
    throw new Error("Failed to update ticket status in the service layer.");
  }
};
