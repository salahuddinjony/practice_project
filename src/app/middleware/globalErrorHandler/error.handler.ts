//global error handler
import { NextFunction, Request, Response } from 'express'
import AppError from '../../errors/AppError.js'

export const globalErrorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', error)
    res.status(error.statusCode || 500).json(
        {
            success: false,
            message: error.message || 'Internal Server Error'
        })
}

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    try {
       next(new AppError(`Route ${req.originalUrl} not found`, 404)) // Pass the error to the global error handler
    } catch (error) {
        console.error('Error in 404 handler:', error);
        next(new AppError(error instanceof Error ? error.message : 'Unknown error', 500)) // Pass the error to the global error handler
    }
}