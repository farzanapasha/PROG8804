const { errorHandler, AppError } = require('../middlewares/errorHandler');

describe('Error Handler Middleware', () => {
    let ctx;
    let next;
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        ctx = {
            status: null,
            body: null
        };
        next = jest.fn();
        // Reset NODE_ENV before each test
        process.env.NODE_ENV = originalEnv;
    });

    afterAll(() => {
        // Restore original NODE_ENV after all tests
        process.env.NODE_ENV = originalEnv;
    });

    it('should pass through when no error occurs', async () => {
        // Arrange
        next.mockResolvedValue(undefined);

        // Act
        await errorHandler(ctx, next);

        // Assert
        expect(next).toHaveBeenCalled();
        expect(ctx.status).toBeNull();
        expect(ctx.body).toBeNull();
    });

    it('should handle AppError correctly', async () => {
        // Arrange
        const error = new AppError('Not found', 404);
        next.mockRejectedValue(error);

        // Act
        await errorHandler(ctx, next);

        // Assert
        expect(ctx.status).toBe(404);
        expect(ctx.body).toEqual({
            status: 'fail',
            message: 'Not found'
        });
    });

    it('should handle Supabase errors correctly', async () => {
        // Arrange
        const error = {
            code: 'SUPABASE_ERROR',
            message: 'Database error',
            details: { field: 'email' }
        };
        next.mockRejectedValue(error);

        // Act
        await errorHandler(ctx, next);

        // Assert
        expect(ctx.status).toBe(500);
        expect(ctx.body).toEqual({
            status: 'error',
            message: 'Database error',
            details: { field: 'email' }
        });
    });

    describe('General error handling', () => {
        it('should show detailed error in development mode', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            const error = new Error('Detailed error message');
            next.mockRejectedValue(error);

            // Act
            await errorHandler(ctx, next);

            // Assert
            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                status: 'error',
                message: 'Detailed error message'
            });
        });

        it('should show generic error in production mode', async () => {
            // Arrange
            process.env.NODE_ENV = 'production';
            const error = new Error('Sensitive error details');
            next.mockRejectedValue(error);

            // Act
            await errorHandler(ctx, next);

            // Assert
            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                status: 'error',
                message: 'Internal server error'
            });
        });
    });

    describe('AppError class', () => {
        it('should create AppError with correct properties', () => {
            // Act
            const error = new AppError('Not found', 404);

            // Assert
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe('Not found');
            expect(error.statusCode).toBe(404);
            expect(error.status).toBe('fail');
            expect(error.isOperational).toBe(true);
        });

        it('should set status to "error" for 5xx status codes', () => {
            // Act
            const error = new AppError('Server error', 500);

            // Assert
            expect(error.status).toBe('error');
        });

        it('should set status to "fail" for 4xx status codes', () => {
            // Act
            const error = new AppError('Bad request', 400);

            // Assert
            expect(error.status).toBe('fail');
        });
    });
});
