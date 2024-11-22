const auth = require('../middlewares/auth');
const { supabase } = require('../config/database');

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
            status: null,
            body: null,
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
        expect(ctx.status).toBeNull();
        expect(ctx.body).toBeNull();
    });

    it('should return 401 when no token is provided', async () => {
        // Act
        await auth(ctx, next);

        // Assert
        expect(ctx.status).toBe(401);
        expect(ctx.body).toEqual({ error: 'No token provided' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
        // Arrange
        ctx.headers.authorization = `Bearer invalid-token`;
        supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Invalid token') });

        // Act
        await auth(ctx, next);

        // Assert
        expect(ctx.status).toBe(401);
        expect(ctx.body).toEqual({ error: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Supabase throws an error', async () => {
        // Arrange
        ctx.headers.authorization = `Bearer ${mockToken}`;
        supabase.auth.getUser.mockRejectedValue(new Error('Supabase error'));

        // Act
        await auth(ctx, next);

        // Assert
        expect(ctx.status).toBe(401);
        expect(ctx.body).toEqual({ error: 'Authentication failed' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', async () => {
        // Arrange
        ctx.headers.authorization = 'malformed-header';

        // Act
        await auth(ctx, next);

        // Assert
        expect(ctx.status).toBe(401);
        expect(ctx.body).toEqual({ error: 'No token provided' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not found', async () => {
        // Arrange
        ctx.headers.authorization = `Bearer ${mockToken}`;
        supabase.auth.getUser.mockResolvedValue({ data: {}, error: null });

        // Act
        await auth(ctx, next);

        // Assert
        expect(ctx.status).toBe(401);
        expect(ctx.body).toEqual({ error: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });
});
