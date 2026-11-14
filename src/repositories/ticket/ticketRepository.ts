import logger from "../../utils/logger";
import prisma from "../../db/prismaClient";
import { HttpError } from "../../utils/httpError";
import { Prisma } from "@prisma/client";
import {
  TicketListFilters,
  TicketPayload,
  TicketUpdatePayload,
} from "../../types/ticket";

const toDate = (value: string | null | undefined) =>
  value === undefined || value === null ? value : new Date(value);

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
      // Only known columns are written, whatever else the client sent.
      const ticket = await tx.ticket.create({
        data: {
          project_id: ticketData.project_id,
          name: ticketData.name,
          description: ticketData.description,
          created_by: ticketData.created_by,
          status_id: ticketData.status_id,
          priority: ticketData.priority,
          type: ticketData.type,
          due_date: toDate(ticketData.due_date),
        },
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

export const getAllTicketsByProjectRepo = async (
  projectId: number,
  filters: TicketListFilters = {}
) => {
  try {
    const where: Prisma.TicketWhereInput = { project_id: projectId };

    if (filters.status !== undefined) where.status_id = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.type) where.type = filters.type;
    if (filters.assignee) {
      where.Ticket_Assignment = { some: { user_id: filters.assignee } };
    }
    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    const order = filters.order ?? "asc";
    const sort = filters.sort ?? "created_at";
    const orderBy: Prisma.TicketOrderByWithRelationInput[] = [
      // Tickets without a due date always come after the ones that have one.
      sort === "due_date"
        ? { due_date: { sort: order, nulls: "last" } }
        : { [sort]: order },
      { ticket_id: "asc" }, // stable order between equal values
    ];

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy,
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

export const updateTicketRepo = async (
  ticketId: number,
  changes: TicketUpdatePayload
) => {
  const existing = await prisma.ticket.findUnique({
    where: { ticket_id: ticketId },
  });

  if (!existing) {
    throw new HttpError(404, `Ticket with ID ${ticketId} not found`);
  }

  // Fields left undefined are not touched by Prisma.
  return prisma.ticket.update({
    where: { ticket_id: ticketId },
    data: {
      name: changes.name,
      description: changes.description,
      priority: changes.priority,
      type: changes.type,
      due_date: toDate(changes.due_date),
    },
    include: { Ticket_Assignment: true },
  });
};

// Removes the ticket. Its assignment goes with it (cascade).
export const deleteTicketRepo = async (ticketId: number) => {
  const existing = await prisma.ticket.findUnique({
    where: { ticket_id: ticketId },
  });

  if (!existing) {
    throw new HttpError(404, `Ticket with ID ${ticketId} not found`);
  }

  return prisma.ticket.delete({ where: { ticket_id: ticketId } });
};

// Drops the ticket's chunks from the vector store, so AI answers stop quoting
// text that was edited or deleted.
export const deleteTicketEmbeddingsRepo = async (ticketId: number) => {
  return prisma.knowledge_base.deleteMany({ where: { task_id: ticketId } });
};

export const updateTicketStatusRepo = async (
  ticketId: number,
  statusId: number
) => {
  try {
    // Check if the ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { ticket_id: ticketId },
    });

    if (!existingTicket) {
      throw new HttpError(404, `Ticket with ID ${ticketId} not found`);
    }

    // Check if the status exists
    const statusExists = await prisma.status.findUnique({
      where: { status_id: statusId },
    });

    if (!statusExists) {
      throw new HttpError(404, `Status with ID ${statusId} not found`);
    }

    // Update the ticket's status
    const updatedTicket = await prisma.ticket.update({
      where: { ticket_id: ticketId },
      data: { status_id: statusId },
    });

    return updatedTicket;
  } catch (error: any) {
    console.error("Error in repository while updating ticket status:", error);
    throw new HttpError(500, "Failed to update ticket status.");
  }
};
