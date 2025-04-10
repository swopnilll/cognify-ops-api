import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
import logger from "../../utils/logger";

export const validateCreateProjectPayload: ValidationChain[] = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("user_id")
    .notEmpty()
    .withMessage("User Id is required")
    .isString()
    .withMessage("User Id must be a string"),

  body("project_key")
    .notEmpty()
    .withMessage("Project Key is required")
    .isString()
    .withMessage("Project Key must be a string"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.info("Request Body:", req.body); // Log the request body

  const errors = validationResult(req);
  logger.info("Validation Errors:", errors);

  if (!errors.isEmpty()) {
    logger.info("Validation errors occurred");
    res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};
