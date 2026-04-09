import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import AppError from '../../errors/AppError.js'
// middleware to log incoming requests for debugging

const validation = (schema: z.ZodTypeAny) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            // console.log(`Incoming request: ${req.method} ${req.originalUrl}`)
            await schema.parseAsync(req.body)
            return next()
        } catch (error) {
            if (error instanceof z.ZodError) {

                // details is an array of objects containing the validation error messages
                const details = error.issues.map((issue) => ({
                    message: issue.message
                }))

                return next(new AppError('Validation failed', 400, details))
            }
            return next(error)
        }
    }
}

export default validation