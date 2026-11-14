import { Router } from 'express';
import {
  createTicket,
  deleteTicket,
  getAllTickets,
  getTicketById,
  getTicketsByProject,
  updateTicket,
  updateTicketAssignee,
  updateTicketStatusController,
} from '../../controllers/ticket/ticketController';
import {
  handleValidationErrors,
  validateCreateTicketPayload,
  validateListTicketsQuery,
  validateTicketIdParam,
  validateUpdateTicketPayload,
} from '../../middleware/ticket/ticketValidator';

const ticketRoutes = Router();

ticketRoutes.post("/", validateCreateTicketPayload, handleValidationErrors, createTicket);

ticketRoutes.get('/', getAllTickets); // Get all tickets

// Tickets of one project. Optional query: status, assignee, priority, type,
// q (search in name and description), sort, order.
ticketRoutes.get("/project/:projectId", validateListTicketsQuery, handleValidationErrors, getTicketsByProject);

ticketRoutes.get('/:ticketId', getTicketById); // Get specific ticket
ticketRoutes.patch('/:ticketId', validateUpdateTicketPayload, handleValidationErrors, updateTicket); // Edit name, description, priority, type, due date
ticketRoutes.delete('/:ticketId', validateTicketIdParam, handleValidationErrors, deleteTicket);
ticketRoutes.patch('/:ticketId/assign', updateTicketAssignee); // Update assignee
ticketRoutes.patch('/:ticketId/status', updateTicketStatusController); // Update status

export default ticketRoutes;
