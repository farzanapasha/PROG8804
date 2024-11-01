
async function healthCheck(ctx) {
    ctx.status = 200;
    ctx.body = 'OK';
}

module.exports = { healthCheck };