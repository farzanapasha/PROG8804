const cors = require('@koa/cors');

module.exports = cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
    exposeHeaders: ['Content-Length', 'Content-Type', 'Content-Disposition'],
});