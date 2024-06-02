export class NotFoundError extends Error {
    public statusCode = 404

    constructor(message = '') {
        super()
        this.name = 'NOT_FOUND'
        this.message = message
    }
}