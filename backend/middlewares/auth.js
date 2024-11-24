const { supabase } = require('../config/database');
const { AppError } = require('./errorHandler');

async function auth(ctx, next) {
    const token = ctx.headers.authorization?.split(' ')[1];
    
    if (!token) {
        throw new AppError('No token provided', 401);
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            throw new AppError('Invalid token', 401);
        }

        ctx.state.user = user;
        await next();
    } catch (err) {
        if (err instanceof AppError) {
            throw err;
        }
        throw new AppError('Authentication failed', 401);
    }
}

module.exports = auth;
