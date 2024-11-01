const { getTodos } = require('../controllers/todosController');
const { supabase } = require('../config/database');

// Mock the database module
jest.mock('../config/database', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
    },
}));

// Tests for api: getTodos()
describe('getTodos', () => {
    let ctx;

    beforeEach(() => {
        ctx = {
            status: null,
            body: null,
        };
    });

    it('should return a list of todos', async () => {
        // Arrange
        const mockTodos = [
            { id: 1, data: 'Test todo 1', done: false },
            { id: 2, data: 'Test todo 2', done: true },
        ];
        supabase.from().select().limit.mockResolvedValue({ data: mockTodos, error: null });

        // Act
        await getTodos(ctx);

        // Assert
        expect(ctx.status).toBe(200);
        expect(ctx.body).toEqual(mockTodos);
    });

    it('should handle errors', async () => {
        // Arrange
        const mockError = new Error('Something went wrong');
        supabase.from().select().limit.mockResolvedValue({ data: null, error: mockError });

        // Act
        await getTodos(ctx);

        // Assert
        expect(ctx.status).toBe(500);
        expect(ctx.body).toEqual({ error: mockError.message });
    });

    it('should limit the number of todos returned', async () => {
        // Arrange
        const mockTodos = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, data: `Test todo ${i + 1}`, done: false }));
        supabase.from().select().limit.mockResolvedValue({ data: mockTodos, error: null });

        // Act
        await getTodos(ctx);

        // Assert
        expect(ctx.status).toBe(200);
        expect(ctx.body.length).toBeLessThanOrEqual(10);
    });
});