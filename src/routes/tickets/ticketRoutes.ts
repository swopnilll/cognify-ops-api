import { Router } from 'express';
import { createTicket, getAllTickets, getTicketById, getTicketsByProject, updateTicketAssignee, updateTicketStatusController } from '../../controllers/ticket/ticketController';
import { handleValidationErrors, validateCreateTicketPayload } from '../../middleware/ticket/ticketValidator';



const ticketRoutes = Router();

ticketRoutes.post( "/", validateCreateTicketPayload, handleValidationErrors, createTicket);

ticketRoutes.get('/', getAllTickets);    // Get all tickets
ticketRoutes.get('/:ticketId', getTicketById); // Get specific ticket
ticketRoutes.patch('/:ticketId/assign', updateTicketAssignee); // Update assignee
ticketRoutes.patch('/:ticketId/status', updateTicketStatusController); // Update ticket

ticketRoutes.get("/project/:projectId", getTicketsByProject);

export default ticketRoutes;
