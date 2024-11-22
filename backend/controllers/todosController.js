const { supabase } = require('../config/database');

async function getTodos(ctx) {
    try {
        const userId = ctx.state.user.id;
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', userId)
            .limit(10);

        if (error) {
            ctx.status = 500;
            ctx.body = { error: error.message };
            return;
        }

        ctx.status = 200;
        ctx.body = data;
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: err.message };
    }
}

async function createTodo(ctx) {
    try {
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
            ctx.status = 500;
            ctx.body = { error: error.message };
            return;
        }

        ctx.status = 201;
        ctx.body = data[0];
    } catch (err) {
        ctx.status = 500;   
        ctx.body = { error: err.message };
    }
}

async function updateTodo(ctx) {
    try {
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
            ctx.status = 500;
            ctx.body = { error: error.message };
            return;
        }

        if (!data || data.length === 0) {
            ctx.status = 404;
            ctx.body = { error: 'Todo not found or unauthorized' };
            return;
        }

        ctx.status = 200;
        ctx.body = data[0];
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: err.message };
    }
}

async function deleteTodo(ctx) {
    try {
        const userId = ctx.state.user.id;
        const todoId = ctx.params.id;
        
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', todoId)
            .eq('user_id', userId);

        if (error) {
            ctx.status = 500;
            ctx.body = { error: error.message };
            return;
        }

        ctx.status = 204;
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: err.message };
    }
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
