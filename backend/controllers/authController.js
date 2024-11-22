const { supabase } = require('../config/database');

async function login(ctx) {
    try {
        const { email, password } = ctx.request.body;

        if (!email || !password) {
            ctx.status = 400;
            ctx.body = { error: 'Email and password are required' };
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            ctx.status = 401;
            ctx.body = { error: error.message };
            return;
        }

        ctx.status = 200;
        ctx.body = {
            user: data.user,
            token: data.session.access_token
        };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: err.message };
    }
}

async function logout(ctx) {
    try {
        const token = ctx.headers.authorization?.split(' ')[1];
        
        if (!token) {
            ctx.status = 401;
            ctx.body = { error: 'No token provided' };
            return;
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
            ctx.status = 500;
            ctx.body = { error: error.message };
            return;
        }

        ctx.status = 200;
        ctx.body = { message: 'Successfully logged out' };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: err.message };
    }
}

module.exports = { login, logout };
