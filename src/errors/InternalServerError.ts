export class InternalServerError extends Error {
    public statusCode = 500

    constructor(message = '') {
        super()
        this.name = 'INTERNAL_SERVER_ERROR'
        this.message = message
    }
}