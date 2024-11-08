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
    // const { data, error } = await supabase
    //     .from('todos')
    //     .insert([
    //         { data: 'someValue' },
    //     ])
    //     .select()

}

async function updateTodo(ctx) {

}

async function deleteTodo(ctx) {

}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
