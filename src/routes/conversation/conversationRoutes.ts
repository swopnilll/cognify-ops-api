import { Router } from "express";
import {
  addMessages,
  createConversation,
  deleteConversation,
  listConversations,
  listMessages,
  renameConversation,
} from "../../controllers/conversation/conversationController";
import {
  validateAddMessages,
  validateConversationIdParam,
  validateCreateConversation,
  validateProjectIdParam,
  validateRenameConversation,
} from "../../middleware/conversation/conversationValidator";
import { handleValidationErrors } from "../../middleware/ticket/ticketValidator";

// Saved Intellecta chats. Each one is private to the user who started it.

// Mounted at /projects/:projectId/conversations
export const projectConversationRoutes = Router({ mergeParams: true });

projectConversationRoutes.get("/", validateProjectIdParam, handleValidationErrors, listConversations);
projectConversationRoutes.post("/", validateCreateConversation, handleValidationErrors, createConversation);

// Mounted at /conversations
const conversationRoutes = Router();

conversationRoutes.get("/:conversationId/messages", validateConversationIdParam, handleValidationErrors, listMessages);
conversationRoutes.post("/:conversationId/messages", validateAddMessages, handleValidationErrors, addMessages);
conversationRoutes.patch("/:conversationId", validateRenameConversation, handleValidationErrors, renameConversation);
conversationRoutes.delete("/:conversationId", validateConversationIdParam, handleValidationErrors, deleteConversation);

export default conversationRoutes;
