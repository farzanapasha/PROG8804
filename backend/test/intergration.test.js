const request = require('supertest');
const app = require('../app');
const { supabase } = require('../config/database');

const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
const mockToken = 'mock-jwt-token';
const mockUser = { id: mockUserId, email: 'test@example.com' };

jest.mock('../config/database', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        auth: {
            signInWithPassword: jest.fn(),
            signOut: jest.fn(),
            getUser: jest.fn()
        }
    }
}));

describe('Authentication', () => {
    describe('POST /api/auth/login', () => {
        it('should successfully login with valid credentials', async () => {
            // Arrange
            const credentials = {
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
            const response = await request(app.callback())
                .post('/api/auth/login')
                .send(credentials);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                token: mockToken,
                user: {
                    id: mockUser.id,
                    email: mockUser.email
                }
            });
        });

        it('should return 400 for missing credentials', async () => {
            // Act
            const response = await request(app.callback())
                .post('/api/auth/login')
                .send({ email: 'test@example.com' });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.status).toBe('fail');
            expect(response.body.message).toBe('Email and password are required');
        });

        it('should return 401 for invalid credentials', async () => {
            // Arrange
            supabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'Authentication failed' }
            });

            // Act
            const response = await request(app.callback())
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrong' });

            // Assert
            expect(response.status).toBe(401);
            expect(response.body.status).toBe('fail');
            expect(response.body.message).toBe('Authentication failed');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should successfully logout with valid token', async () => {
            // Arrange
            supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
            supabase.auth.signOut.mockResolvedValue({ error: null });

            // Act
            const response = await request(app.callback())
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${mockToken}`);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Successfully logged out');
        });

        it('should return 401 without token', async () => {
            // Act
            const response = await request(app.callback())
                .post('/api/auth/logout');

            // Assert
            expect(response.status).toBe(401);
            expect(response.body.status).toBe('fail');
            expect(response.body.message).toBe('No token provided');
        });
    });
});

describe('Todos API', () => {
    beforeEach(() => {
        // Setup auth mock for all todo requests
        supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    });

    describe('GET /api/todos', () => {
        it('should return user\'s todos with valid token', async () => {
            // Arrange
            const mockTodos = [
                { id: 1, data: 'Test todo 1', done: false, user_id: mockUserId },
                { id: 2, data: 'Test todo 2', done: true, user_id: mockUserId }
            ];
            supabase.from().select().eq().limit.mockResolvedValue({ data: mockTodos, error: null });

            // Act
            const response = await request(app.callback())
                .get('/api/todos')
                .set('Authorization', `Bearer ${mockToken}`);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTodos);
        });

        it('should return 401 without token', async () => {
            // Act
            const response = await request(app.callback())
                .get('/api/todos');

            // Assert
            expect(response.status).toBe(401);
            expect(response.body.status).toBe('fail');
            expect(response.body.message).toBe('No token provided');
        });

        it('should handle database errors', async () => {
            // Arrange
            supabase.from().select().eq().limit.mockResolvedValue({ 
                data: null, 
                error: { message: 'Database error' }
            });

            // Act
            const response = await request(app.callback())
                .get('/api/todos')
                .set('Authorization', `Bearer ${mockToken}`);

            // Assert
            expect(response.status).toBe(500);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Database error');
        });
    });

    describe('POST /api/todos', () => {
        it('should create todo for authenticated user', async () => {
            // Arrange
            const newTodo = { data: 'New todo', done: false };
            const createdTodo = { ...newTodo, id: 1, user_id: mockUserId };
            
            supabase.from().insert.mockReturnValue({
                select: jest.fn().mockResolvedValue({ data: [createdTodo], error: null })
            });

            // Act
            const response = await request(app.callback())
                .post('/api/todos')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(newTodo);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body).toEqual(createdTodo);
        });

        it('should handle database errors when creating todo', async () => {
            // Arrange
            supabase.from().insert.mockReturnValue({
                select: jest.fn().mockResolvedValue({ 
                    data: null, 
                    error: { message: 'Database error' }
                })
            });

            // Act
            const response = await request(app.callback())
                .post('/api/todos')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ data: 'New todo' });

            // Assert
            expect(response.status).toBe(500);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Database error');
        });
    });

    describe('PUT /api/todos/:id', () => {
        it('should update user\'s todo', async () => {
            // Arrange
            const todoId = '1';
            const updates = { done: true };
            const updatedTodo = { id: todoId, data: 'Test todo', done: true, user_id: mockUserId };
            
            supabase.from().update.mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockResolvedValue({ data: [updatedTodo], error: null })
                    })
                })
            });

            // Act
            const response = await request(app.callback())
                .put(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${mockToken}`)
                .send(updates);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedTodo);
        });

        it('should return 404 when updating non-existent todo', async () => {
            // Arrange
            supabase.from().update.mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockResolvedValue({ data: [], error: null })
                    })
                })
            });

            // Act
            const response = await request(app.callback())
                .put('/api/todos/999')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ done: true });

            // Assert
            expect(response.status).toBe(404);
            expect(response.body.status).toBe('fail');
            expect(response.body.message).toBe('Todo not found or unauthorized');
        });
    });

    describe('DELETE /api/todos/:id', () => {
        it('should delete user\'s todo', async () => {
            // Arrange
            supabase.from().delete.mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null })
                })
            });

            // Act
            const response = await request(app.callback())
                .delete('/api/todos/1')
                .set('Authorization', `Bearer ${mockToken}`);

            // Assert
            expect(response.status).toBe(204);
        });

        it('should handle database errors when deleting todo', async () => {
            // Arrange
            supabase.from().delete.mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ 
                        error: { message: 'Database error' }
                    })
                })
            });

            // Act
            const response = await request(app.callback())
                .delete('/api/todos/1')
                .set('Authorization', `Bearer ${mockToken}`);

            // Assert
            expect(response.status).toBe(500);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Database error');
        });
    });
});