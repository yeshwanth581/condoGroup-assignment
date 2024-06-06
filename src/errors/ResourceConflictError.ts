export class ResourceConflictError extends Error {
    public statusCode = 409

    constructor(message = 'Resource conflict') {
        super()
        this.name = 'RESOURCE_CONFLICT'
        this.message = message
    }
}