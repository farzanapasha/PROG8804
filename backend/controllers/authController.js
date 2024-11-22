const { supabase } = require('../config/database');

async function login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
        ctx.status = 400;
        ctx.body = { error: 'Email and password are required' };
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        ctx.status = 200;
        ctx.body = {
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email
            }
        };
    } catch (error) {
        ctx.status = 401;
        ctx.body = { error: error.message };
    }
}

async function logout(ctx) {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        ctx.status = 200;
        ctx.body = { message: 'Successfully logged out' };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
}

async function getCurrentUser(ctx) {
    // User information is already set by auth middleware
    const user = ctx.state.user;
    
    ctx.status = 200;
    ctx.body = {
        user: {
            id: user.id,
            email: user.email
        }
    };
}

module.exports = {
    login,
    logout,
    getCurrentUser
};
