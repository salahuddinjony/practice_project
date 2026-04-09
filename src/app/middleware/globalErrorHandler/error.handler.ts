//global error handler
import { NextFunction, Request, Response } from 'express'
import AppError from '../../errors/AppError.js'

export const globalErrorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', error)
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(error.details ? { errors: error.details } : {}) // Include details if available which show array of errors
    })
}

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {

    // Ignore favicon request
    if (req.originalUrl.includes('favicon.ico')) {
        return res.status(204).end();
    }

    // Forward 404 error
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
};