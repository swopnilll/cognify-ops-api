import logger from "../../utils/logger";
import prisma from "../../db/prismaClient";
import { HttpError } from "../../utils/httpError";
import { TicketPayload } from "../../types/ticket";

export const createTicketAndAssignToUserRepo = async (
  ticketData: TicketPayload,
  userId: string
) => {
  try {
    // Check if user exists before proceeding with ticket creation
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new HttpError(404, `User with ID ${userId} not found`);
    }

    // Start a transaction to ensure both operations succeed
    const result = await prisma.$transaction(async (tx) => {
      // Create the ticket
      const ticket = await tx.ticket.create({
        data: ticketData,
      });

      // Assign the ticket to the user
      const assignment = await tx.ticket_Assignment.create({
        data: {
          ticket_id: ticket.ticket_id,
          user_id: userId,
        },
      });

      // Return both ticket and assignment in the transaction result
      return { ticket, assignment };
    });

    return result; // Return created ticket and assignment
  } catch (error: any) {
    console.error("Error in repository:", error);
    throw error;
  }
};

export const getTicketsRepo = async () => {
  try {
    return await prisma.ticket.findMany();
  } catch (error) {
    throw new Error("Error fetching tickets");
  }
};

export const getTicketRepo = async (ticketId: number) => {
  try {
    return await prisma.ticket.findUnique({
      where: { ticket_id: ticketId },
    });
  } catch (error) {
    throw new Error("Error fetching ticket");
  }
};

export const updateTicketAssigneeRepo = async (
  ticketId: number,
  userId: string
) => {
  try {
    // Check if the ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id: ticketId },
    });

    if (!ticket) {
      throw new HttpError(404, `Ticket with ID ${ticketId} not found`);
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new HttpError(404, `User with ID ${userId} not found`);
    }

    // Update the assignee for the ticket (i.e., update user_id in ticket_Assignment)
    const updatedAssignment = await prisma.ticket_Assignment.updateMany({
      where: { ticket_id: ticketId }, // Find assignment by ticket ID
      data: { user_id: userId }, // Update the user_id to the new user
    });

    if (updatedAssignment.count === 0) {
      throw new HttpError(404, `No assignment found for ticket ${ticketId}`);
    }

    return updatedAssignment; // Return the updated assignment info
  } catch (error: any) {
    console.error("Error in repository while updating ticket assignee:", error);
    throw error;
  }
};

export const getAllTicketsByProjectRepo = async (projectId: number) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        project_id: projectId,
      },
      include: {
        Ticket_Assignment: true, 
      },
    });

    return tickets;
  } catch (error: any) {
    console.error(
      "Error in repository while fetching tickets by project:",
      error
    );
    throw new HttpError(500, "Failed to fetch tickets for the project.");
  }
};
