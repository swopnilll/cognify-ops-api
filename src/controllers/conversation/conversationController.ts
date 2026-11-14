import { Request, Response } from "express";
import logger from "../../utils/logger";
import { HttpError } from "../../utils/httpError";
import {
  addMessagesService,
  createConversationService,
  deleteConversationService,
  listConversationsService,
  listMessagesService,
  renameConversationService,
} from "../../services/conversation/conversationService";

// The signed-in user comes from the verified token, never from the request
// body: a conversation can only be read or changed by its owner.
const userIdOf = (req: Request): string => (req.user as { sub: string }).sub;

const sendError = (res: Response, error: any, context: string) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  logger.error(`Error in ${context} controller`, { error: error?.message });
  res.status(500).json({ message: "Internal Server Error" });
};

export const listConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await listConversationsService(
      Number(req.params.projectId),
      userIdOf(req)
    );
    res.status(200).json({ data: conversations });
  } catch (error: any) {
    sendError(res, error, "listConversations");
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const conversation = await createConversationService(
      Number(req.params.projectId),
      userIdOf(req),
      req.body.messages,
      req.body.title
    );
    res.status(201).json({ data: conversation });
  } catch (error: any) {
    sendError(res, error, "createConversation");
  }
};

export const listMessages = async (req: Request, res: Response) => {
  try {
    const messages = await listMessagesService(
      Number(req.params.conversationId),
      userIdOf(req)
    );
    res.status(200).json({ data: messages });
  } catch (error: any) {
    sendError(res, error, "listMessages");
  }
};

export const addMessages = async (req: Request, res: Response) => {
  try {
    const messages = await addMessagesService(
      Number(req.params.conversationId),
      userIdOf(req),
      req.body.messages
    );
    res.status(201).json({ data: messages });
  } catch (error: any) {
    sendError(res, error, "addMessages");
  }
};

export const renameConversation = async (req: Request, res: Response) => {
  try {
    const conversation = await renameConversationService(
      Number(req.params.conversationId),
      userIdOf(req),
      req.body.title
    );
    res.status(200).json({ data: conversation });
  } catch (error: any) {
    sendError(res, error, "renameConversation");
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const conversationId = Number(req.params.conversationId);
    await deleteConversationService(conversationId, userIdOf(req));
    res.status(200).json({ message: `Conversation ${conversationId} deleted successfully.` });
  } catch (error: any) {
    sendError(res, error, "deleteConversation");
  }
};
