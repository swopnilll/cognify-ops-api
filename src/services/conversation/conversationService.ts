import {
  addMessagesRepo,
  createConversationRepo,
  deleteConversationRepo,
  getConversationRepo,
  isProjectMemberRepo,
  listConversationsRepo,
  listMessagesRepo,
  renameConversationRepo,
} from "../../repositories/conversation/conversationRepository";
import { MAX_TITLE_LENGTH, MessagePayload } from "../../types/conversation";
import { HttpError } from "../../utils/httpError";

const shorten = (text: string) => {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > MAX_TITLE_LENGTH
    ? `${oneLine.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`
    : oneLine;
};

const requireProjectMember = async (projectId: number, userId: string) => {
  if (!(await isProjectMemberRepo(projectId, userId))) {
    throw new HttpError(404, `Project with ID ${projectId} not found`);
  }
};

// A conversation is private to its owner. Someone else's is reported as
// missing, so its existence is not revealed.
const requireOwnConversation = async (conversationId: number, userId: string) => {
  const conversation = await getConversationRepo(conversationId);
  if (!conversation || conversation.user_id !== userId) {
    throw new HttpError(404, `Conversation with ID ${conversationId} not found`);
  }
  return conversation;
};

export const listConversationsService = async (projectId: number, userId: string) => {
  await requireProjectMember(projectId, userId);
  return listConversationsRepo(projectId, userId);
};

export const createConversationService = async (
  projectId: number,
  userId: string,
  messages: MessagePayload[],
  title?: string
) => {
  await requireProjectMember(projectId, userId);

  // Named after the first question unless a title was sent.
  const firstQuestion = messages.find((message) => message.sender === "user") ?? messages[0];
  const finalTitle = shorten(title || firstQuestion.text) || "New chat";

  return createConversationRepo(projectId, userId, finalTitle, messages);
};

export const listMessagesService = async (conversationId: number, userId: string) => {
  await requireOwnConversation(conversationId, userId);
  return listMessagesRepo(conversationId);
};

export const addMessagesService = async (
  conversationId: number,
  userId: string,
  messages: MessagePayload[]
) => {
  await requireOwnConversation(conversationId, userId);
  return addMessagesRepo(conversationId, messages);
};

export const renameConversationService = async (
  conversationId: number,
  userId: string,
  title: string
) => {
  const conversation = await requireOwnConversation(conversationId, userId);
  return renameConversationRepo(conversationId, shorten(title), conversation.updated_at);
};

export const deleteConversationService = async (conversationId: number, userId: string) => {
  await requireOwnConversation(conversationId, userId);
  return deleteConversationRepo(conversationId);
};
