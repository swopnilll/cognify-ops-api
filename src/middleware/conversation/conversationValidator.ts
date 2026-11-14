import { body, param, ValidationChain } from "express-validator";
import {
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES_PER_REQUEST,
  MAX_TITLE_LENGTH,
  MESSAGE_SENDERS,
} from "../../types/conversation";

export const validateProjectIdParam: ValidationChain[] = [
  param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
];

export const validateConversationIdParam: ValidationChain[] = [
  param("conversationId").isInt({ min: 1 }).withMessage("Invalid conversation ID"),
];

const validateTitle = (required: boolean): ValidationChain => {
  const chain = body("title");
  return (required ? chain : chain.optional())
    .isString()
    .withMessage("title must be a string")
    .trim()
    .notEmpty()
    .withMessage("title cannot be empty")
    .isLength({ max: MAX_TITLE_LENGTH })
    .withMessage(`title can have at most ${MAX_TITLE_LENGTH} characters`);
};

const validateMessages: ValidationChain[] = [
  body("messages")
    .isArray({ min: 1, max: MAX_MESSAGES_PER_REQUEST })
    .withMessage(`messages must be a list of 1 to ${MAX_MESSAGES_PER_REQUEST} messages`),

  body("messages.*.sender")
    .isIn(MESSAGE_SENDERS)
    .withMessage(`sender must be one of: ${MESSAGE_SENDERS.join(", ")}`),

  body("messages.*.text")
    .isString()
    .withMessage("text must be a string")
    .notEmpty()
    .withMessage("text cannot be empty")
    .isLength({ max: MAX_MESSAGE_LENGTH })
    .withMessage(`text can have at most ${MAX_MESSAGE_LENGTH} characters`),

  body("messages.*.is_error").optional().isBoolean({ strict: true }).withMessage("is_error must be true or false"),

  body("messages.*.is_paused").optional().isBoolean({ strict: true }).withMessage("is_paused must be true or false"),
];

export const validateCreateConversation: ValidationChain[] = [
  ...validateProjectIdParam,
  validateTitle(false),
  ...validateMessages,
];

export const validateAddMessages: ValidationChain[] = [
  ...validateConversationIdParam,
  ...validateMessages,
];

export const validateRenameConversation: ValidationChain[] = [
  ...validateConversationIdParam,
  validateTitle(true),
];
