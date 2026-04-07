import { NextFunction, Request, Response, RequestHandler } from 'express'
import AppError from '../errors/AppError.js'

const catchAsync = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next))
      .catch((error) => {
        const err = error instanceof Error
          ? error
          : new Error('Unknown error')

        next(new AppError(err.message, 500))
      })
  }
}

export default catchAsync