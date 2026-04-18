import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import AppError from "../../errors/handleAppError.js";
import catchAsync from "../../utils/CatchAsync.js";
// middleware to log incoming requests for debugging

const validation = (schema: z.ZodTypeAny) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      req.body = await schema.parseAsync(req.body);
      return next();
    },
  );
};

export default validation;
