const { supabase } = require('../config/database');

async function getTodos(ctx) {
    try {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .limit(10)
            ;

        console.log(data);
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
    try{
        todo = ctx.request.body;
        const { data, error } = await supabase
            .from('todos')
            .insert([
                { data: todo.data, done: todo.done|| false }
            ])
            .select()
            ;

        if (error) {
            ctx.status = 500;
            ctx.body = { error: error.message };
            return;
        }

        ctx.status = 201;
        ctx.body = data;
    }
    catch (err) {
        ctx.status = 500;   
        ctx.body = { error: err.message };
    }
}

async function updateTodo(ctx) {
    try{
        const id = ctx.params.id;
        const todo = ctx.request.body;
        const { data, error } = await supabase
            .from('todos')
            .update({ data: todo.data, done: todo.done })
            .eq('id', id)
            .select()
            ;

        if (error) {
            ctx.status = 500;
            ctx.body = { error: error.message };
            return;
        }

        ctx.status = 200;
        ctx.body = data;
    }
    catch (err) {
        ctx.status = 500;   
        ctx.body = { error: err.message };
    }
}

async function deleteTodo(ctx) {

}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
