import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { StudentRoute } from './app/modules/student/student.route.js'
import { UserRoute } from './app/modules/user/user.route.js'
const app = express()

// Middleware 
app.use(express.json())
app.use(cors())

//application routes
app.use('/api/v1/students', StudentRoute)
app.use('/api/v1/users', UserRoute)

// Root route-test
app.get('/', (req: Request, res: Response) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Welcome to the Student Management System API' 
        })
    } catch (error) {
        console.error('Error in root route:', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
})



// 404 handler for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(404).json(
            {
                success: false,
                message: 'Route not found'
            })

    } catch (error) {
        console.error('Error in 404 handler:', error);
        next(error); // Pass the error to the global error handler
    }
})

//global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', error)
    res.status(500).json(
        {
            success: false,
            message: 'Internal Server Error'
        })
})


export default app
