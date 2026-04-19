import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import catchAsync from "../../utils/CatchAsync.js";

export type ValidationSource = "body" | "cookies" | "query";

// *** Validate `body` (default), `cookies`, or `query` — use the matching schema per route.
const validation = (
  schema: z.ZodTypeAny,
  source: ValidationSource = "body",
) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      const raw =
        source === "body"
          ? req.body
          : source === "cookies"
            ? (req.cookies ?? {})
            : req.query;
      const parsed = await schema.parseAsync(raw);
      if (source === "body") {
        req.body = parsed;
      }
      return next();
    },
  );
};

export default validation;
