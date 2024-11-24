class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

async function errorHandler (ctx, next)  {
    try {
        await next();
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        
        // Handle Supabase specific errors
        if (err.code && err.details) {
            ctx.body = {
                status: 'error',
                message: err.message,
                details: err.details
            };
            return;
        }

        // Handle our AppError instances
        if (err instanceof AppError) {
            ctx.body = {
                status: err.status,
                message: err.message
            };
            return;
        }

        // Handle all other errors
        ctx.body = {
            status: 'error',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        };

        // Log error for debugging
        console.error('Error:', err);
    }
};

module.exports = { errorHandler, AppError };
