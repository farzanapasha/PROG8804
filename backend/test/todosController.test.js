const { getTodos, createTodo, updateTodo, deleteTodo } = require('../controllers/todosController');
const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

// Mock the database module
jest.mock('../config/database', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
    },
}));

const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

// Tests for api: getTodos()
describe('getTodos', () => {
    let ctx;

    beforeEach(() => {
        ctx = {
            status: null,
            body: null,
            state: {
                user: { id: mockUserId }
            }
        };
        jest.clearAllMocks();
    });

    it('should return a list of user\'s todos', async () => {
        // Arrange
        const mockTodos = [
            { id: 1, data: 'Test todo 1', done: false, user_id: mockUserId },
            { id: 2, data: 'Test todo 2', done: true, user_id: mockUserId },
        ];
        supabase.from().select().eq().limit.mockResolvedValue({ data: mockTodos, error: null });

        // Act
        await getTodos(ctx);

        // Assert
        expect(supabase.from).toHaveBeenCalledWith('todos');
        expect(supabase.from().select().eq).toHaveBeenCalledWith('user_id', mockUserId);
        expect(ctx.status).toBe(200);
        expect(ctx.body).toEqual(mockTodos);
    });

    it('should handle database errors', async () => {
        // Arrange
        const mockError = { message: 'Database error' };
        supabase.from().select().eq().limit.mockResolvedValue({ data: null, error: mockError });

        // Act & Assert
        await expect(getTodos(ctx)).rejects.toThrow(AppError);
        await expect(getTodos(ctx)).rejects.toThrow('Database error');
    });
});

// Tests for api: createTodo()
describe('createTodo', () => {
    let ctx;

    beforeEach(() => {
        ctx = {
            status: null,
            body: null,
            request: {
                body: { data: 'Test todo', done: false }
            },
            state: {
                user: { id: mockUserId }
            }
        };
        jest.clearAllMocks();
    });

    it('should create a new todo for the user', async () => {
        // Arrange
        const mockTodo = { 
            id: 1, 
            data: 'Test todo', 
            done: false,
            user_id: mockUserId 
        };
        supabase.from().insert().select.mockResolvedValue({ data: [mockTodo], error: null });

        // Act
        await createTodo(ctx);

        // Assert
        expect(supabase.from).toHaveBeenCalledWith('todos');
        expect(supabase.from().insert).toHaveBeenCalledWith([{
            data: 'Test todo',
            done: false,
            user_id: mockUserId
        }]);
        expect(ctx.status).toBe(201);
        expect(ctx.body).toEqual(mockTodo);
    });

    it('should handle database errors when creating todo', async () => {
        // Arrange
        const mockError = { message: 'Database error' };
        supabase.from().insert().select.mockResolvedValue({ data: null, error: mockError });

        // Act & Assert
        await expect(createTodo(ctx)).rejects.toThrow(AppError);
        await expect(createTodo(ctx)).rejects.toThrow('Database error');
    });
});

// Tests for api: updateTodo()
describe('updateTodo', () => {
    let ctx;

    beforeEach(() => {
        ctx = {
            status: null,
            body: null,
            params: { id: '1' },
            request: {
                body: { done: true }
            },
            state: {
                user: { id: mockUserId }
            }
        };
        jest.clearAllMocks();
    });

    it('should update user\'s todo', async () => {
        // Arrange
        const mockUpdatedTodo = { 
            id: 1, 
            data: 'Test todo', 
            done: true,
            user_id: mockUserId 
        };
        supabase.from().update().eq().eq().select.mockResolvedValue({ 
            data: [mockUpdatedTodo], 
            error: null 
        });

        // Act
        await updateTodo(ctx);

        // Assert
        expect(supabase.from).toHaveBeenCalledWith('todos');
        expect(supabase.from().update().eq).toHaveBeenCalledWith('id', '1');
        expect(supabase.from().update().eq().eq).toHaveBeenCalledWith('user_id', mockUserId);
        expect(ctx.status).toBe(200);
        expect(ctx.body).toEqual(mockUpdatedTodo);
    });

    it('should return 404 when updating non-existent or unauthorized todo', async () => {
        // Arrange
        const mockError = { message: 'Todo not found or unauthorized', statusCode: 404};
        supabase.from().update().eq().eq().select.mockResolvedValue({ data: null, error: mockError });

        // Act & Assert
        await expect(updateTodo(ctx)).rejects.toThrow(AppError);
        await expect(updateTodo(ctx)).rejects.toThrow('Todo not found or unauthorized');
    });

    it('should handle database errors when updating todo', async () => {
        // Arrange
        const mockError = { message: 'Database error' };
        supabase.from().insert().select.mockResolvedValue({ data: null, error: mockError });

        // Act & Assert
        await expect(updateTodo(ctx)).rejects.toThrow(AppError);
        await expect(updateTodo(ctx)).rejects.toThrow('Database error');

    });
});

// Tests for api: deleteTodo()
describe('deleteTodo', () => {
    let ctx;

    beforeEach(() => {
        ctx = {
            status: null,
            body: null,
            params: { id: '1' },
            state: {
                user: { id: mockUserId }
            }
        };
        jest.clearAllMocks();
    });

    it('should delete user\'s todo', async () => {
        // Arrange
        supabase.from().delete.mockReturnValue({
            eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null })
            })
        });

        // Act
        await deleteTodo(ctx);

        // Assert
        expect(supabase.from).toHaveBeenCalledWith('todos');
        expect(supabase.from().delete().eq).toHaveBeenCalledWith('id', '1');
        expect(supabase.from().delete().eq().eq).toHaveBeenCalledWith('user_id', mockUserId);
        expect(ctx.status).toBe(204);
    });

    it('should handle database errors when deleting todo', async () => {
        // Arrange
        const mockError = { message: 'Database error' };
        supabase.from().delete.mockReturnValue({
            eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: mockError })
            })
        });

        // Act & Assert
        await expect(deleteTodo(ctx)).rejects.toThrow(AppError);
        await expect(deleteTodo(ctx)).rejects.toThrow('Database error');
    });
});