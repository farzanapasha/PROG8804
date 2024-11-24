const { login, logout, getCurrentUser } = require('../controllers/authController');
const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

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
                token: mockToken,
                user: {
                    id: mockUser.id,
                    email: mockUser.email
                }
            });
        });

        it('should throw AppError for missing credentials', async () => {
            // Act & Assert
            await expect(login(ctx)).rejects.toThrow(AppError);
            await expect(login(ctx)).rejects.toThrow('Email and password are required');
        });

        it('should throw AppError for invalid credentials', async () => {
            // Arrange
            ctx.request.body = {
                email: 'test@example.com',
                password: 'wrong'
            };
            supabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: new Error('Authentication failed')
            });

            // Act & Assert
            await expect(login(ctx)).rejects.toThrow(AppError);
            await expect(login(ctx)).rejects.toThrow('Authentication failed');
        });
    });

    describe('logout', () => {
        it('should successfully logout', async () => {
            // Arrange
            ctx.state.user = mockUser;
            supabase.auth.signOut.mockResolvedValue({ error: null });

            // Act
            await logout(ctx);

            // Assert
            expect(ctx.status).toBe(200);
            expect(ctx.body.message).toBe('Successfully logged out');
        });

        it('should throw AppError when logout fails', async () => {
            // Arrange
            ctx.state.user = mockUser;
            supabase.auth.signOut.mockResolvedValue({
                error: new Error('Logout failed')
            });

            // Act & Assert
            await expect(logout(ctx)).rejects.toThrow(AppError);
            await expect(logout(ctx)).rejects.toThrow('Logout failed');
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
                id: mockUser.id,
                email: mockUser.email
            });
        });
    });
});
