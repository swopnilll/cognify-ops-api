import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
import logger from "../../utils/logger";

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
