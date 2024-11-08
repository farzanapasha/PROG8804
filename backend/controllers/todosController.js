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
        ctx.body = data[0];
    }
    catch (err) {
        ctx.status = 500;   
        ctx.body = { error: err.message };
    }
}

async function updateTodo(ctx) {
    try{
        const id = ctx.params.id;
        const { data, error: fetchError } = await supabase
            .from('todos')
            .select('done')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching current status:', fetchError);
            throw new Error("Failed to fetch todo status");
        }
        const newStatus = !data.done;
        
        const { data: updatedData, error: updateError } = await supabase
            .from('todos')
            .update({ done: newStatus })
            .eq('id', id)
            .select()
            ;
        if (updateError) {
            console.error('Error updating status:', updateError);
            throw new Error("Failed to update todo status");
        }
        ctx.status = 200;
        ctx.body = updatedData[0];
    }
    catch (err) {
        ctx.status = 500;   
        ctx.body = { error: err.message };
    }
}

async function deleteTodo(ctx) {

    try{
        const id = ctx.params.id;
        const { data, error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id)
            ;

        if (error) {
            ctx.status = 500;
            ctx.body = { error: error.message };
            return;
        }

        ctx.status = 204;
        ctx.body = data;
    }
    catch (err) {
        ctx.status = 500;   
        ctx.body = { error: err.message };
    }
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
