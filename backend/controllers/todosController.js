const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

async function getTodos(ctx) {
    const userId = ctx.state.user.id;
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .limit(10);

    if (error) {
        throw new AppError(error.message, 500); 
    }

    ctx.status = 200;
    ctx.body = data;
}

async function createTodo(ctx) {
    const userId = ctx.state.user.id;
    const todo = ctx.request.body;
    const { data, error } = await supabase
        .from('todos')
        .insert([
            { 
                data: todo.data, 
                done: todo.done || false,
                user_id: userId 
            }
        ])
        .select();

    if (error) {
        throw new AppError(error.message, 500);
    }

    ctx.status = 201;
    ctx.body = data[0];
}

async function updateTodo(ctx) {
    const userId = ctx.state.user.id;
    const todoId = ctx.params.id;
    const updates = ctx.request.body;
    
    const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', todoId)
        .eq('user_id', userId)
        .select();

    if (error) {
        throw new AppError(error.message, 500);
    }

    if (!data || data.length === 0) {
        throw new AppError('Todo not found or unauthorized', 404);
    }

    ctx.status = 200;
    ctx.body = data[0];
}

async function deleteTodo(ctx) {
    const userId = ctx.state.user.id;
    const todoId = ctx.params.id;
    
    const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)
        .eq('user_id', userId);

    if (error) {
        throw new AppError(error.message, 500);
    }

    ctx.status = 204;
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
