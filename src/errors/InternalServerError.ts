export class InternalServerError extends Error {
    public statusCode = 500

    constructor(message = 'Something went wrong') {
        super()
        this.name = 'INTERNAL_SERVER_ERROR'
        this.message = message
    }
}