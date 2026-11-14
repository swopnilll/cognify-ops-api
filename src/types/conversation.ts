export const MESSAGE_SENDERS = ["user", "bot"] as const;
export type MessageSender = (typeof MESSAGE_SENDERS)[number];

export const MAX_MESSAGE_LENGTH = 20000;
export const MAX_MESSAGES_PER_REQUEST = 10;
export const MAX_TITLE_LENGTH = 80;

export interface MessagePayload {
  sender: MessageSender;
  text: string;
  is_error?: boolean;
  is_paused?: boolean;
}
