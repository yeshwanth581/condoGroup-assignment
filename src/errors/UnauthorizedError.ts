export class UnauthorizedError extends Error {
    public statusCode = 401

    constructor(message = 'Unauthorized') {
        super()
        this.name = 'UNAUTHORIZED'
        this.message = message
    }
}