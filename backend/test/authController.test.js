const { login, logout, getCurrentUser } = require('../controllers/authController');
const { supabase } = require('../config/database');

// Mock the database module
jest.mock('../config/database', () => ({
    supabase: {
        auth: {
            signInWithPassword: jest.fn(),
            signOut: jest.fn()
        }
    }
}));

describe('Auth Controller', () => {
    let ctx;
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockToken = 'mock-token';

    beforeEach(() => {
        ctx = {
            request: {
                body: {}
            },
            headers: {},
            status: null,
            body: null,
            state: {}
        };
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            // Arrange
            ctx.request.body = {
                email: 'test@example.com',
                password: 'password123'
            };
            supabase.auth.signInWithPassword.mockResolvedValue({
                data: {
                    user: mockUser,
                    session: { access_token: mockToken }
                },
                error: null
            });

            // Act
            await login(ctx);

            // Assert
            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email
                },
                token: mockToken
            });
        });

        it('should return 400 for missing credentials', async () => {
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
                password: 'wrong'
            };
            supabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: new Error('Invalid login credentials')
            });

            // Act
            await login(ctx);

            // Assert
            expect(ctx.status).toBe(401);
            expect(ctx.body.error).toBe('Invalid login credentials');
        });
    });

    describe('logout', () => {
        it('should successfully logout', async () => {
            // Arrange
            ctx.state.user = mockUser; // User set by auth middleware
            supabase.auth.signOut.mockResolvedValue({ error: null });

            // Act
            await logout(ctx);

            // Assert
            expect(ctx.status).toBe(200);
            expect(ctx.body.message).toBe('Successfully logged out');
        });

        it('should handle logout errors', async () => {
            // Arrange
            ctx.state.user = mockUser;
            supabase.auth.signOut.mockResolvedValue({
                error: new Error('Logout failed')
            });

            // Act
            await logout(ctx);

            // Assert
            expect(ctx.status).toBe(500);
            expect(ctx.body.error).toBe('Logout failed');
        });
    });

    describe('getCurrentUser', () => {
        it('should return current user information', async () => {
            // Arrange
            ctx.state.user = mockUser;

            // Act
            await getCurrentUser(ctx);

            // Assert
            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email
                }
            });
        });
    });
});
