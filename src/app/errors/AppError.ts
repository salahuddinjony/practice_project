class AppError extends Error {
    statusCode: number

    constructor(message: string, statusCode: number) {
        super(message) // Call the parent constructor with the error message
        this.statusCode = statusCode
    }
}

export default AppError