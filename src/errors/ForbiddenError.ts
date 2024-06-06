export class ForbiddenError extends Error {
    public statusCode = 403

    constructor(message = 'Access forbidden') {
        super()
        this.name = 'FORBIDDEN'
        this.message = message
    }
}