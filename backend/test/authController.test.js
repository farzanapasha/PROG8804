const { login, logout } = require('../controllers/authController');
const { supabase } = require('../config/database');

// Mock the database module
jest.mock('../config/database', () => ({
    supabase: {
        auth: {
            signInWithPassword: jest.fn(),
            signOut: jest.fn(),
            getUser: jest.fn()
        }
    }
}));

describe('Authentication Controller', () => {
    let ctx;

    beforeEach(() => {
        ctx = {
            status: null,
            body: null,
            request: {
                body: {}
            },
            headers: {}
        };
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            // Arrange
            const mockUser = { id: '123', email: 'test@example.com' };
            const mockSession = { access_token: 'mock-token' };
            ctx.request.body = {
                email: 'test@example.com',
                password: 'password123'
            };
            
            supabase.auth.signInWithPassword.mockResolvedValue({
                data: { user: mockUser, session: mockSession },
                error: null
            });

            // Act
            await login(ctx);

            // Assert
            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                user: mockUser,
                token: mockSession.access_token
            });
        });

        it('should return 400 if email or password is missing', async () => {
            // Arrange
            ctx.request.body = { email: 'test@example.com' };

            // Act
            await login(ctx);

            // Assert
            expect(ctx.status).toBe(400);
            expect(ctx.body.error).toBe('Email and password are required');
        });

        it('should return 401 for invalid credentials', async () => {
            // Arrange
            ctx.request.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };
            
            supabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'Invalid login credentials' }
            });

            // Act
            await login(ctx);

            // Assert
            expect(ctx.status).toBe(401);
            expect(ctx.body.error).toBe('Invalid login credentials');
        });
    });

    describe('logout', () => {
        it('should successfully logout with valid token', async () => {
            // Arrange
            ctx.headers.authorization = 'Bearer valid-token';
            supabase.auth.signOut.mockResolvedValue({ error: null });

            // Act
            await logout(ctx);

            // Assert
            expect(ctx.status).toBe(200);
            expect(ctx.body.message).toBe('Successfully logged out');
        });

        it('should return 401 if no token provided', async () => {
            // Act
            await logout(ctx);

            // Assert
            expect(ctx.status).toBe(401);
            expect(ctx.body.error).toBe('No token provided');
        });

        it('should handle logout errors', async () => {
            // Arrange
            ctx.headers.authorization = 'Bearer valid-token';
            supabase.auth.signOut.mockResolvedValue({
                error: { message: 'Logout failed' }
            });

            // Act
            await logout(ctx);

            // Assert
            expect(ctx.status).toBe(500);
            expect(ctx.body.error).toBe('Logout failed');
        });
    });
});
