export class InvalidRequestError extends Error {
    public statusCode = 400

    constructor(message = '') {
        super()
        this.name = 'INVALID_REQUEST'
        this.message = message
    }
}