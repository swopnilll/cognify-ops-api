import { body, param, query, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
import logger from "../../utils/logger";
import {
  TICKET_PRIORITIES,
  TICKET_SORT_FIELDS,
  TICKET_TYPES,
} from "../../types/ticket";

const priorityMessage = `priority must be one of: ${TICKET_PRIORITIES.join(", ")}`;
const typeMessage = `type must be one of: ${TICKET_TYPES.join(", ")}`;
const dueDateMessage = "due_date must be an ISO 8601 date, or null";

export const validateCreateTicketPayload: ValidationChain[] = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isString()
    .withMessage("User ID must be a string"),

  body("ticketData")
    .notEmpty()
    .withMessage("ticketData is required")
    .isObject()
    .withMessage("ticketData must be an object"),

  body("ticketData.name")
    .notEmpty()
    .withMessage("Ticket name is required")
    .isString()
    .withMessage("Ticket name must be a string"),

  body("ticketData.project_id")
    .notEmpty()
    .withMessage("Project ID is required")
    .isInt()
    .withMessage("Project ID must be an integer"),

  body("ticketData.created_by")
    .notEmpty()
    .withMessage("created_by is required")
    .isString()
    .withMessage("created_by must be a string"),

  body("ticketData.description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("ticketData.status_id")
    .optional()
    .isInt()
    .withMessage("status_id must be an integer"),

  body("ticketData.priority").optional().isIn(TICKET_PRIORITIES).withMessage(priorityMessage),

  body("ticketData.type").optional().isIn(TICKET_TYPES).withMessage(typeMessage),

  body("ticketData.due_date")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage(dueDateMessage),
];

export const validateTicketIdParam: ValidationChain[] = [
  param("ticketId").isInt({ min: 1 }).withMessage("Invalid ticket ID"),
];

const UPDATABLE_FIELDS = ["name", "description", "priority", "type", "due_date"];

export const validateUpdateTicketPayload: ValidationChain[] = [
  ...validateTicketIdParam,

  body().custom((value) => {
    const sent = value && typeof value === "object" ? Object.keys(value) : [];
    if (!sent.some((key) => UPDATABLE_FIELDS.includes(key))) {
      throw new Error(`Send at least one of: ${UPDATABLE_FIELDS.join(", ")}`);
    }
    return true;
  }),

  body("name")
    .optional()
    .isString()
    .withMessage("Ticket name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Ticket name cannot be empty"),

  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be a string"),

  body("priority").optional().isIn(TICKET_PRIORITIES).withMessage(priorityMessage),

  body("type").optional().isIn(TICKET_TYPES).withMessage(typeMessage),

  body("due_date").optional({ values: "null" }).isISO8601().withMessage(dueDateMessage),
];

export const validateListTicketsQuery: ValidationChain[] = [
  param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
  query("status").optional().isInt().withMessage("status must be a status ID"),
  query("assignee").optional().isString().notEmpty().withMessage("assignee must be a user ID"),
  query("priority").optional().isIn(TICKET_PRIORITIES).withMessage(priorityMessage),
  query("type").optional().isIn(TICKET_TYPES).withMessage(typeMessage),
  query("q").optional().isString().withMessage("q must be a string"),
  query("sort")
    .optional()
    .isIn(TICKET_SORT_FIELDS)
    .withMessage(`sort must be one of: ${TICKET_SORT_FIELDS.join(", ")}`),
  query("order").optional().isIn(["asc", "desc"]).withMessage("order must be asc or desc"),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Validation failed", { errors: errors.array() });
    res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};
