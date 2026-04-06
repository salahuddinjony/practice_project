import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { StudentRoute } from './app/modules/student/student.route.js'
import { UserRoute } from './app/modules/user/user.route.js'
import { globalErrorHandler, notFoundHandler } from './app/middleware/globalErrorHandler/error.handler.js'
import rootRoute from './app/server_check/initial.route.js'


// Create an instance of the Express application
const app = express()

// Middleware 
app.use(express.json())
app.use(cors())

//application routes
app.use('/api/v1/students', StudentRoute)
app.use('/api/v1/users', UserRoute)

// Root route-test
app.get('/', rootRoute)

// 404 handler for undefined routes
app.use(notFoundHandler)
//global error handler
app.use(globalErrorHandler)


export default app
