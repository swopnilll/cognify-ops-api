import prisma from "../../db/prismaClient";
import { MessagePayload } from "../../types/conversation";

const toMessageRow = (message: MessagePayload) => ({
  sender: message.sender,
  text: message.text,
  is_error: message.is_error ?? false,
  is_paused: message.is_paused ?? false,
});

// True when the user created the project or was added to it.
export const isProjectMemberRepo = async (projectId: number, userId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      project_id: projectId,
      OR: [{ created_by: userId }, { project_users: { some: { user_id: userId } } }],
    },
    select: { project_id: true },
  });
  return project !== null;
};

// The user's conversations in a project, most recently used first.
export const listConversationsRepo = (projectId: number, userId: string) =>
  prisma.conversation.findMany({
    where: { project_id: projectId, user_id: userId },
    orderBy: [{ updated_at: "desc" }, { conversation_id: "desc" }],
    take: 200,
  });

export const getConversationRepo = (conversationId: number) =>
  prisma.conversation.findUnique({ where: { conversation_id: conversationId } });

export const createConversationRepo = (
  projectId: number,
  userId: string,
  title: string,
  messages: MessagePayload[]
) =>
  prisma.conversation.create({
    data: {
      project_id: projectId,
      user_id: userId,
      title,
      messages: { create: messages.map(toMessageRow) },
    },
    include: { messages: { orderBy: { message_id: "asc" } } },
  });

export const listMessagesRepo = (conversationId: number) =>
  prisma.message.findMany({
    where: { conversation_id: conversationId },
    orderBy: { message_id: "asc" },
  });

// Adds the messages in order and moves the conversation to the top of the list.
export const addMessagesRepo = (conversationId: number, messages: MessagePayload[]) =>
  prisma.$transaction(async (tx) => {
    const created = [];
    for (const message of messages) {
      created.push(
        await tx.message.create({
          data: { conversation_id: conversationId, ...toMessageRow(message) },
        })
      );
    }
    await tx.conversation.update({
      where: { conversation_id: conversationId },
      data: { updated_at: new Date() },
    });
    return created;
  });

// updated_at is set to its own value so a rename does not reorder the list.
export const renameConversationRepo = (
  conversationId: number,
  title: string,
  updatedAt: Date
) =>
  prisma.conversation.update({
    where: { conversation_id: conversationId },
    data: { title, updated_at: updatedAt },
  });

// Its messages go with it (cascade).
export const deleteConversationRepo = (conversationId: number) =>
  prisma.conversation.delete({ where: { conversation_id: conversationId } });
