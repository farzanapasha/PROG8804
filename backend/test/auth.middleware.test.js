const auth = require('../middlewares/auth');
const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

jest.mock('../config/database', () => ({
    supabase: {
        auth: {
            getUser: jest.fn()
        }
    }
}));

describe('Auth Middleware', () => {
    let ctx;
    let next;
    const mockToken = 'valid-token';
    const mockUser = { id: '123', email: 'test@example.com' };

    beforeEach(() => {
        ctx = {
            headers: {},
            state: {}
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should set user in context and call next for valid token', async () => {
        // Arrange
        ctx.headers.authorization = `Bearer ${mockToken}`;
        supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

        // Act
        await auth(ctx, next);

        // Assert
        expect(supabase.auth.getUser).toHaveBeenCalledWith(mockToken);
        expect(ctx.state.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    it('should throw AppError when no token is provided', async () => {
        // Act & Assert
        await expect(auth(ctx, next)).rejects.toThrow(AppError);
        await expect(auth(ctx, next)).rejects.toThrow('No token provided');
        expect(next).not.toHaveBeenCalled();
    });

    it('should throw AppError when token is invalid', async () => {
        // Arrange
        ctx.headers.authorization = `Bearer invalid-token`;
        supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Invalid token') });

        // Act & Assert
        await expect(auth(ctx, next)).rejects.toThrow(AppError);
        await expect(auth(ctx, next)).rejects.toThrow('Invalid token');
        expect(next).not.toHaveBeenCalled();
    });

    it('should throw AppError when Supabase throws an error', async () => {
        // Arrange
        ctx.headers.authorization = `Bearer ${mockToken}`;
        supabase.auth.getUser.mockRejectedValue(new Error('Supabase error'));

        // Act & Assert
        await expect(auth(ctx, next)).rejects.toThrow(AppError);
        await expect(auth(ctx, next)).rejects.toThrow('Authentication failed');
        expect(next).not.toHaveBeenCalled();
    });

    it('should throw AppError for malformed authorization header', async () => {
        // Arrange
        ctx.headers.authorization = 'malformed-header';

        // Act & Assert
        await expect(auth(ctx, next)).rejects.toThrow(AppError);
        await expect(auth(ctx, next)).rejects.toThrow('No token provided');
        expect(next).not.toHaveBeenCalled();
    });

    it('should throw AppError when user is not found', async () => {
        // Arrange
        ctx.headers.authorization = `Bearer ${mockToken}`;
        supabase.auth.getUser.mockResolvedValue({ data: {}, error: null });

        // Act & Assert
        await expect(auth(ctx, next)).rejects.toThrow(AppError);
        await expect(auth(ctx, next)).rejects.toThrow('Invalid token');
        expect(next).not.toHaveBeenCalled();
    });
});
