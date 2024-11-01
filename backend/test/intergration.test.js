const request = require('supertest');
const app = require('../app');
const { supabase } = require('../config/database');

jest.mock('../config/database', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
    },
}));

describe('GET /api/todos', () => {
    it('should return a list of todos', async () => {
        // Arrange
        const mockTodos = [
            { id: 1, data: 'Test todo 1', done: false },
            { id: 2, data: 'Test todo 2', done: true },
        ];
        supabase.from().select().limit.mockResolvedValue({ data: mockTodos, error: null });

        // Act
        const response = await request(app.callback()).get('/api/todos');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockTodos);
    });

    it('should handle errors', async () => {
        // Arrange
        const mockError = new Error('Something went wrong');
        supabase.from().select().limit.mockResolvedValue({ data: null, error: mockError });

        // Act
        const response = await request(app.callback()).get('/api/todos');

        // Assert
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: mockError.message });
    });
});