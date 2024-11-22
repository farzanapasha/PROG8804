const { supabase } = require('../config/database');

async function auth(ctx, next) {
    const token = ctx.headers.authorization?.split(' ')[1];
    
    if (!token) {
        ctx.status = 401;
        ctx.body = { error: 'No token provided' };
        return;
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid token' };
            return;
        }

        ctx.state.user = user;
        await next();
    } catch (err) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication failed' };
    }
}

module.exports = auth;
