const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

async function login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new AppError('Authentication failed', 401);
    }

    ctx.status = 200;
    ctx.body = {
        token: data.session.access_token,
        user: {
            id: data.user.id,
            email: data.user.email
        }
    };

}

async function logout(ctx) {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new AppError('Logout failed', 500);
        }

        ctx.status = 200;
        ctx.body = { message: 'Successfully logged out' };
}

async function getCurrentUser(ctx) {
    // User information is already set by auth middleware
    const user = ctx.state.user;
    
    ctx.status = 200;
    ctx.body = {
        id: user.id,
        email: user.email
    };
}

module.exports = {
    login,
    logout,
    getCurrentUser
};
